"use client";

import { Button } from "@/components/ui/button";
import usePremiumModal from "@/hooks/usePremiumModal";
import useSubscription from "@/hooks/useSubscription";
import { PlusSquare } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

interface CreateResumeButtonProps {
  resumeCount: number;
}

export default function CreateResumeButton({ resumeCount }: CreateResumeButtonProps) {
  const premiumModal = usePremiumModal();
  const { canCreateResume, setSubscription } = useSubscription();

  // Update resume count in subscription state
  useEffect(() => {
    setSubscription({ tier: "free", resumeCount });
  }, [resumeCount, setSubscription]);

  const canUserCreateResume = canCreateResume();

  if (canUserCreateResume) {
    return (
      <Button asChild className="mx-auto flex w-fit gap-2">
        <Link href="/editor">
          <PlusSquare className="size-5" />
          New Resume
        </Link>
      </Button>
    );
  }

  return (
    <Button
      onClick={() => premiumModal.setOpen(true)}
      className="mx-auto flex w-fit gap-2"
    >
      <PlusSquare className="size-5" />
      New Resume
    </Button>
  );
}
