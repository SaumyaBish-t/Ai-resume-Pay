"use server";

import { prisma } from "@/lib/prisma";
import { resumeSchema, ResumeValues } from "@/lib/validation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { del, put } from "@vercel/blob";
import path from "path";

const LIMITS = {
  free: 3,
  premium: 10,
  premium_plus: Infinity,
} as const;

export async function saveResume(values: ResumeValues) {
  const { id } = values;

  const { photo, workExperiences, educations, ...resumeValues } =
    resumeSchema.parse(values);

  // 🔐 AUTH
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated");
  }

  // 🔑 CLERK USER + SUBSCRIPTION
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  const subscription = user.publicMetadata?.subscription as
    | {
        tier: "free" | "premium" | "premium_plus";
        resumeCount: number;
      }
    | undefined;

  // 🔒 LIMIT CHECK (ONLY ON CREATE)
  if (!id) {
    const tier = subscription?.tier ?? "free";
    const resumeCount = subscription?.resumeCount ?? 0;

    if (resumeCount >= LIMITS[tier]) {
      throw new Error("RESUME_LIMIT_REACHED");
    }
  }

  // 🔍 EXISTING RESUME (FOR UPDATE)
  const existingResume = id
    ? await prisma.resume.findUnique({ where: { id, userId } })
    : null;

  if (id && !existingResume) {
    throw new Error("Resume not found");
  }

  // 🖼 PHOTO HANDLING
  let newPhotoUrl: string | undefined | null = undefined;

  if (photo instanceof File) {
    if (existingResume?.photoUrl) {
      await del(existingResume.photoUrl);
    }

    const blob = await put(
      `resume_photos/${path.extname(photo.name)}`,
      photo,
      { access: "public" }
    );

    newPhotoUrl = blob.url;
  } else if (photo === null) {
    if (existingResume?.photoUrl) {
      await del(existingResume.photoUrl);
    }
    newPhotoUrl = null;
  }

  // ✏️ UPDATE RESUME
  if (id) {
    return prisma.resume.update({
      where: { id },
      data: {
        ...resumeValues,
        photoUrl: newPhotoUrl,
        workExperiences: {
          deleteMany: {},
          create: workExperiences?.map((exp) => ({
            ...exp,
            startDate: exp.startDate ? new Date(exp.startDate) : undefined,
            endDate: exp.endDate ? new Date(exp.endDate) : undefined,
          })),
        },
        educations: {
          deleteMany: {},
          create: educations?.map((edu) => ({
            ...edu,
            startDate: edu.startDate ? new Date(edu.startDate) : undefined,
            endDate: edu.endDate ? new Date(edu.endDate) : undefined,
          })),
        },
        updatedAt: new Date(),
      },
    });
  }

  // ➕ CREATE RESUME
  const resume = await prisma.resume.create({
    data: {
      ...resumeValues,
      userId,
      photoUrl: newPhotoUrl,
      workExperiences: {
        create: workExperiences?.map((exp) => ({
          ...exp,
          startDate: exp.startDate ? new Date(exp.startDate) : undefined,
          endDate: exp.endDate ? new Date(exp.endDate) : undefined,
        })),
      },
      educations: {
        create: educations?.map((edu) => ({
          ...edu,
          startDate: edu.startDate ? new Date(edu.startDate) : undefined,
          endDate: edu.endDate ? new Date(edu.endDate) : undefined,
        })),
      },
    },
  });

  // 🔼 INCREMENT COUNT IN CLERK
  const tier = subscription?.tier ?? "free";
  const resumeCount = subscription?.resumeCount ?? 0;

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      subscription: {
        tier,
        resumeCount: resumeCount + 1,
      },
    },
  });

  return resume;
}
