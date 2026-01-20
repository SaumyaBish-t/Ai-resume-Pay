import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// SERVER-SIDE PRICING
const PRICES = {
  premium: 49,        
  premium_plus: 99,  
} as const;

export async function POST(req: Request) {
  try {
    // Ensure user is logged in
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Receive ONLY plan
    const { plan } = await req.json();

    if (!plan || !(plan in PRICES)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Razorpay expects amount in paise
    const order = await razorpay.orders.create({
      amount: PRICES[plan as keyof typeof PRICES] * 100,
      currency: "INR",
      receipt: `${plan}_${Date.now()}` // e.g. premium_1723456789

    });

    return NextResponse.json(order);
  } catch (err) {
    console.error("Order creation failed:", err);
    return NextResponse.json(
      { error: "Order creation failed" },
      { status: 500 }
    );
  }
}
