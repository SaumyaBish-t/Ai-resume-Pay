import crypto from "crypto";
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    // 1️⃣ Auth check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2️⃣ Read body
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
    } = await req.json();

    // 3️⃣ Validate plan (VERY IMPORTANT)
    if (!plan || !["premium", "premium_plus"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    // 4️⃣ Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // 5️⃣ Update Clerk subscription
    const client = await clerkClient();

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        subscription: {
          tier: plan,          // "premium" | "premium_plus"
          resumeCount: 0,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Razorpay verify error:", err);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
