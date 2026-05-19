import { RecoveryTrackerApp } from "@/components/RecoveryTrackerApp";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <div className="flex flex-col h-screen w-screen bg-background overflow-hidden">
      <RecoveryTrackerApp />
      <Toaster />
    </div>
  );
}
