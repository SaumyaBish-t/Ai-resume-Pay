"use server";

import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function deleteResume(id: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const resume = await prisma.resume.findUnique({
    where: {
      id,
      userId,
    },
  });

  if (!resume) {
    throw new Error("Resume not found");
  }

  // 🧹 Delete photo if exists
  if (resume.photoUrl) {
    await del(resume.photoUrl);
  }

  // 🗑 Delete resume
  await prisma.resume.delete({
    where: {
      id,
    },
  });

  // 🔑 SYNC CLERK METADATA
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  const subscription = user.publicMetadata?.subscription as
    | {
        tier: "free" | "premium" | "premium_plus";
        resumeCount: number;
      }
    | undefined;

  if (subscription) {
    const newCount = Math.max(subscription.resumeCount - 1, 0);

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        subscription: {
          tier: subscription.tier,
          resumeCount: newCount,
        },
      },
    });
  }

  revalidatePath("/resumes");
}
