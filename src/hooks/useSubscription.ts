import { create } from "zustand";

export type SubscriptionTier = "free" | "premium" | "premium_plus";

interface UserSubscription {
  tier: SubscriptionTier;
  resumeCount: number;
}

interface SubscriptionState {
  subscription: UserSubscription;
  setSubscription: (subscription: UserSubscription) => void;
  canCreateResume: () => boolean;
  canUseAI: () => boolean;
  canCustomizeDesign: () => boolean;
  getResumeLimit: () => number;
}

const useSubscription = create<SubscriptionState>((set, get) => ({
  subscription: {
    tier: "free", // Default to free tier
    resumeCount: 0,
  },
  
  setSubscription: (subscription: UserSubscription) => set({ subscription }),
  
  canCreateResume: () => {
    const { subscription } = get();
    const limits = {
      free: 3,
      premium: 10,
      premium_plus: Infinity,
    };
    return subscription.resumeCount < limits[subscription.tier];
  },
  
  canUseAI: () => {
    const { subscription } = get();
    return subscription.tier === "premium" || subscription.tier === "premium_plus";
  },
  
  canCustomizeDesign: () => {
    const { subscription } = get();
    return subscription.tier === "premium_plus";
  },
  
  getResumeLimit: () => {
    const { subscription } = get();
    const limits = {
      free: 3,
      premium: 10,
      premium_plus: Infinity,
    };
    return limits[subscription.tier];
  },
}));

export default useSubscription;