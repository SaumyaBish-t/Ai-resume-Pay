"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function BillingPage() {
  const params = useSearchParams();
  const router = useRouter();

  const selectedPlan = params.get("plan") as
    | "premium"
    | "premium_plus"
    | null;

  async function handlePayment(plan: "premium" | "premium_plus") {
  // 1️⃣ Create Razorpay order (backend decides price)
  const res = await fetch("/api/razorpay/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });

  if (!res.ok) {
    throw new Error("Failed to create Razorpay order");
  }

  const order = await res.json();

  const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;
  
  // 2️⃣ Razorpay checkout
  const options = {
    key: razorpayKey,
    amount: order.amount,
    currency: "INR",
    order_id: order.id,

    name: "AI Resume Builder",
    description:
      plan === "premium"
        ? "Premium Plan – AI tools & 10 resumes"
        : "Premium Plus – Unlimited resumes & customization",

    handler: async (response: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }) => {
      // 3️⃣ Verify payment
      const verifyRes = await fetch("/api/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...response,
          plan,
        }),
      });

      if (!verifyRes.ok) {
        throw new Error("Payment verification failed");
      }

      // 4️⃣ Redirect after success
      router.push("/editor");
    },

    theme: {
      color: "#000000",
    },
  };

  // 7️⃣ Open Razorpay checkout
new window.Razorpay(options).open();
}

  
  return (
    <div className="mx-auto max-w-4xl py-10">
      <h1 className="mb-8 text-center text-3xl font-bold">
        Choose your plan
      </h1>

      <div className="grid grid-cols-3 gap-6">
        {/* FREE */}
        <div className="border p-6 rounded-lg">
          <h2 className="text-xl font-bold">Free</h2>
          <p className="my-4 text-2xl font-semibold">₹0</p>
          <ul className="space-y-2 text-sm">
            <li>Up to 3 resumes</li>
            <li>No AI tools</li>
          </ul>
        </div>

        {/* PREMIUM */}
        <div
          className={`border p-6 rounded-lg ${
            selectedPlan === "premium" ? "border-black" : ""
          }`}
        >
          <h2 className="text-xl font-bold">Premium</h2>
          <p className="my-4 text-2xl font-semibold">₹49</p>
          <ul className="space-y-2 text-sm">
            <li>Up to 10 resumes</li>
            <li>AI tools enabled</li>
          </ul>
          <Button
            className="mt-4 w-full"
            onClick={() => handlePayment("premium")}
          >
            Pay ₹49
          </Button>
        </div>

        {/* PREMIUM PLUS */}
        <div
          className={`border p-6 rounded-lg ${
            selectedPlan === "premium_plus" ? "border-black" : ""
          }`}
        >
          <h2 className="text-xl font-bold">Premium Plus</h2>
          <p className="my-4 text-2xl font-semibold">₹99</p>
          <ul className="space-y-2 text-sm">
            <li>Infinite resumes</li>
            <li>AI tools</li>
            <li>Design customization</li>
          </ul>
          <Button
            variant="premium"
            className="mt-4 w-full"
            onClick={() => handlePayment("premium_plus")}
          >
            Pay ₹99
          </Button>
        </div>
      </div>
    </div>
  );
}
