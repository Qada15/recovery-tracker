
"use client";

import * as React from "react";
import { RecoveryTrackerApp } from "@/components/RecoveryTrackerApp";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // نمنع الرندر على الخادم تماماً لمحتوى الـ body لتجنب Hydration Mismatch
  if (!mounted) {
    return null;
  }

  return (
    <>
      <RecoveryTrackerApp />
      <Toaster />
    </>
  );
}
