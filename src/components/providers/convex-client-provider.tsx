"use client";

import { ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { PreLaunchGuard } from "@/components/pre-launch/pre-launch-guard";

const convexUrl =
  process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud";

const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <PreLaunchGuard />
      {children}
    </ConvexProviderWithClerk>
  );
}
