"use client";

import { DialogTitle } from "@radix-ui/react-dialog";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { Check } from "lucide-react";
import { Button } from "../ui/button";
import usePremiumModal from "@/hooks/usePremiumModal";
import { useRouter } from "next/navigation";

const premiumFeatures = ["AI tools", "Up to 10 resumes"];
const premiumPlusFeatures = [
  "Infinite resumes",
  "AI tools",
  "Design customization",
];

export default function PremiumModal() {
  const { open, setOpen } = usePremiumModal();
  const router = useRouter();

  function goToBilling(plan: "premium" | "premium_plus") {
    setOpen(false);
    router.push(`/billing?plan=${plan}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resume Builder AI Premium</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Upgrade your plan to unlock premium features.
          </p>

          <div className="flex gap-6">
            {/* PREMIUM */}
            <div className="flex w-1/2 flex-col space-y-5 rounded-lg border p-4">
              <h3 className="text-center text-lg font-bold">Premium</h3>

              <ul className="space-y-2">
                {premiumFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Check className="size-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button onClick={() => goToBilling("premium")}>
                View Pricing
              </Button>
            </div>

            {/* PREMIUM PLUS */}
            <div className="flex w-1/2 flex-col space-y-5 rounded-lg border p-4">
              <h3 className="text-center text-lg font-bold text-green-600">
                Premium Plus
              </h3>

              <ul className="space-y-2">
                {premiumPlusFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Check className="size-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant="premium"
                onClick={() => goToBilling("premium_plus")}
              >
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
