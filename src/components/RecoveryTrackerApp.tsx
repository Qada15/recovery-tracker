"use client"

import * as React from "react"
import { Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidePanel } from "@/components/SidePanel"
import { TimerDisplay } from "@/components/TimerDisplay"
import { saveToStorage, STORAGE_KEYS } from "@/lib/storage"

export function RecoveryTrackerApp() {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [isAccountOpen, setIsAccountOpen] = React.useState(false)

  React.useEffect(() => {
    // Initial setup if empty
    const savedDate = localStorage.getItem(STORAGE_KEYS.START_DATE)
    if (!savedDate) {
      const now = new Date().toISOString()
      saveToStorage(STORAGE_KEYS.START_DATE, now)
    }
  }, [])

  return (
    <div className="flex-1 flex flex-col items-center bg-background relative h-full">
      {/* Top Navigation Bar */}
      <header className="w-full h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm z-40 shrink-0">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsAccountOpen(true)}
          className="text-primary hover:bg-primary/5 rounded-full"
        >
          <User className="h-6 w-6" />
        </Button>
        
        <h1 className="text-xl font-black font-headline text-primary tracking-tighter uppercase">
          Recovery Tracker
        </h1>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsSettingsOpen(true)}
          className="text-primary hover:bg-primary/5 rounded-full"
        >
          <Settings className="h-6 w-6" />
        </Button>
      </header>

      {/* Main Content Area - Made Scrollable */}
      <main className="flex-1 w-full overflow-y-auto flex flex-col items-center p-6 space-y-8 pb-12">
        <div className="text-center space-y-2 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 shrink-0">
          <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.3em]">Your Journey</p>
          <h2 className="text-2xl md:text-3xl font-black text-foreground font-headline tracking-tight">Stay Strong</h2>
        </div>

        <div className="w-full flex justify-center items-center">
          <TimerDisplay />
        </div>

        <div className="text-center max-w-xs animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-8 shrink-0">
          <p className="text-sm text-muted-foreground font-medium italic">
            "The journey of a thousand miles begins with a single step."
          </p>
        </div>
      </main>

      {/* Account Panel (Left) */}
      <SidePanel 
        isOpen={isAccountOpen} 
        onClose={() => setIsAccountOpen(false)} 
        side="left" 
        title="Account"
      >
        <div className="flex flex-col items-center space-y-6 pt-4">
          <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-accent" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold">User Profile</h3>
            <p className="text-sm text-muted-foreground">Local Storage Active</p>
          </div>
          <div className="w-full space-y-4 pt-4">
            <div className="p-4 bg-secondary/50 rounded-xl border border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Data Safety</span>
              <p className="text-sm font-medium">100% On-Device</p>
            </div>
          </div>
        </div>
      </SidePanel>

      {/* Settings Panel (Right) */}
      <SidePanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        side="right" 
        title="App Settings"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">General</h4>
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
              <span className="text-sm font-medium">Daily Reminders</span>
              <div className="w-10 h-5 bg-accent rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
              <span className="text-sm font-medium">Sound Effects</span>
              <div className="w-10 h-5 bg-muted rounded-full relative">
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
              </div>
            </div>
          </div>

          <div className="pt-8 text-center border-t">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Version 1.2.0 Pro</p>
          </div>
        </div>
      </SidePanel>
    </div>
  )
}
