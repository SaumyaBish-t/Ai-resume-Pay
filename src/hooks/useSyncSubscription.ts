"use client";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import useSubscription, { SubscriptionTier } from "./useSubscription";
interface SubscriptionMetadata {
  tier: SubscriptionTier;
  resumeCount: number;
}
export default function useSyncSubscription() {
  const { user, isLoaded } = useUser();
  const setSubscription = useSubscription((s) => s.setSubscription);
  useEffect(() => {
    if (!isLoaded || !user) return;

    const meta = user.publicMetadata?.subscription as
      | SubscriptionMetadata
      | undefined;
    if (meta?.tier) {
      setSubscription({
        tier: meta.tier,
        resumeCount: meta.resumeCount ?? 0,
      });
    } else {
      setSubscription({
        tier: "free",
        resumeCount: 0,
      });
    }
  }, [isLoaded, user, setSubscription]);
}
