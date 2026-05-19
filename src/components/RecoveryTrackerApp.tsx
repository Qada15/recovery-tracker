"use client"

import * as React from "react"
import { Settings, User, RefreshCcw, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SidePanel } from "@/components/SidePanel"
import { TimerDisplay } from "@/components/TimerDisplay"
import { saveToStorage, getFromStorage, STORAGE_KEYS } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

export function RecoveryTrackerApp() {
  const [habitName, setHabitName] = React.useState("Abstinence")
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [isAccountOpen, setIsAccountOpen] = React.useState(false)
  const [editHabit, setEditHabit] = React.useState("")
  const { toast } = useToast()

  React.useEffect(() => {
    const savedHabit = getFromStorage(STORAGE_KEYS.HABIT_NAME)
    const savedDate = getFromStorage(STORAGE_KEYS.START_DATE)
    
    if (savedHabit) setHabitName(savedHabit)
    if (!savedDate) {
      const now = new Date().toISOString()
      saveToStorage(STORAGE_KEYS.START_DATE, now)
    }
    setEditHabit(savedHabit || "Habit Name")
  }, [])

  const handleReset = () => {
    const now = new Date().toISOString()
    saveToStorage(STORAGE_KEYS.START_DATE, now)
    toast({
      title: "Timer Reset",
      description: "You've started a new journey today.",
    })
  }

  const handleUpdateHabit = () => {
    if (!editHabit.trim()) return
    saveToStorage(STORAGE_KEYS.HABIT_NAME, editHabit)
    setHabitName(editHabit)
    toast({
      title: "Habit Updated",
      description: `Now tracking: ${editHabit}`,
    })
  }

  return (
    <div className="flex-1 flex flex-col items-center bg-background relative overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="w-full h-16 bg-white border-b flex items-center justify-between px-4 shadow-sm z-40">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsAccountOpen(true)}
          className="text-primary hover:bg-primary/5 rounded-full"
        >
          <User className="h-6 w-6" />
        </Button>
        
        <h1 className="text-xl font-bold font-headline text-primary tracking-tight">
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

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col items-center justify-center p-6 space-y-8">
        <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-2xl font-bold text-foreground font-headline">{habitName}</h2>
          <p className="text-muted-foreground font-medium text-sm tracking-wide">Stay strong, one moment at a time.</p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-4 bg-primary/5 rounded-[40px] blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
          <TimerDisplay />
        </div>

        <div className="w-full max-w-[320px] flex gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Button 
            className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
            onClick={handleReset}
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
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
            <p className="text-sm text-muted-foreground">Offline Profile</p>
          </div>
          <div className="w-full space-y-4 pt-4">
            <div className="p-4 bg-secondary/50 rounded-xl border border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Storage Mode</span>
              <p className="text-sm font-medium">Local Device Only</p>
            </div>
            <p className="text-xs text-center text-muted-foreground px-4">
              Your data is stored locally on this device. No internet connection is required or used.
            </p>
          </div>
        </div>
      </SidePanel>

      {/* Settings Panel (Right) */}
      <SidePanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        side="right" 
        title="Settings"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="habit-name" className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Habit to Track</Label>
            <div className="flex gap-2">
              <Input 
                id="habit-name"
                value={editHabit}
                onChange={(e) => setEditHabit(e.target.value)}
                placeholder="e.g. Social Media"
                className="rounded-xl"
              />
              <Button size="icon" className="shrink-0 rounded-xl" onClick={handleUpdateHabit}>
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-4 border-t pt-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">App Preferences</h4>
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
              <span className="text-sm font-medium">Dark Mode</span>
              <div className="w-10 h-5 bg-muted rounded-full relative">
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
              <span className="text-sm font-medium">Notifications</span>
              <div className="w-10 h-5 bg-accent rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
              </div>
            </div>
          </div>

          <div className="pt-8 text-center">
            <p className="text-[10px] text-muted-foreground">Recovery Tracker v1.0.0</p>
          </div>
        </div>
      </SidePanel>
    </div>
  )
}
