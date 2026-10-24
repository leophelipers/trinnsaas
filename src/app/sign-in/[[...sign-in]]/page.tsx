"use client";

import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { PRE_LAUNCH_CLERK_APPEARANCE } from "@/lib/clerk/prelaunch-modal";

function SignInContent() {
  const searchParams = useSearchParams();
  const isPreLaunch = searchParams.get("redirect_url") === "/pre-lancamento";

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn appearance={isPreLaunch ? PRE_LAUNCH_CLERK_APPEARANCE : undefined} />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  );
}
