"use client"

import * as React from "react"
import { Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidePanel } from "@/components/SidePanel"
import { TimerDisplay } from "@/components/TimerDisplay"
import { JourneyLog } from "@/components/JourneyLog"
import { saveToStorage, getFromStorage, STORAGE_KEYS } from "@/lib/storage"
import { isValid } from "date-fns"

export function RecoveryTrackerApp() {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [isAccountOpen, setIsAccountOpen] = React.useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false)

  // Shared state to keep everything synced
  const [habitName, setHabitName] = React.useState("Abstinence")
  const [accentColor, setAccentColor] = React.useState('hsl(var(--accent))')
  const [startDate, setStartDate] = React.useState<Date>(new Date())

  React.useEffect(() => {
    const savedDate = getFromStorage(STORAGE_KEYS.START_DATE)
    const savedName = getFromStorage(STORAGE_KEYS.HABIT_NAME)
    const savedColor = getFromStorage(STORAGE_KEYS.HABIT_COLOR)

    if (savedDate) {
      const parsed = new Date(savedDate)
      if (isValid(parsed)) setStartDate(parsed)
    } else {
      const now = new Date()
      saveToStorage(STORAGE_KEYS.START_DATE, now.toISOString())
      setStartDate(now)
    }

    if (savedName) setHabitName(savedName)
    if (savedColor) setAccentColor(savedColor)
    
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.height = '100%'
  }, [])

  const handleUpdateStartDate = (date: Date) => {
    setStartDate(date)
    saveToStorage(STORAGE_KEYS.START_DATE, date.toISOString())
  }

  const handleUpdateName = (name: string) => {
    setHabitName(name)
    saveToStorage(STORAGE_KEYS.HABIT_NAME, name)
  }

  const handleUpdateColor = (color: string) => {
    setAccentColor(color)
    saveToStorage(STORAGE_KEYS.HABIT_COLOR, color)
  }

  return (
    <div className="flex-1 flex flex-col items-center bg-background relative h-full overflow-hidden select-none touch-none">
      {/* Top Navigation Bar */}
      <header className="w-full h-14 md:h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm z-40 shrink-0">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsAccountOpen(true)}
          className="text-primary hover:bg-primary/5 rounded-full"
        >
          <User className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
        
        <h1 className="text-lg md:text-xl font-black font-headline text-primary tracking-tighter uppercase">
          Recovery Tracker
        </h1>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsSettingsOpen(true)}
          className="text-primary hover:bg-primary/5 rounded-full"
        >
          <Settings className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="text-center space-y-1 mb-2 shrink-0">
          <p className="text-muted-foreground font-bold text-[8px] md:text-[10px] uppercase tracking-[0.3em]">Your Journey</p>
          <h2 className="text-lg md:text-2xl font-black text-foreground font-headline tracking-tight">Stay Strong</h2>
        </div>

        {/* Counter Container */}
        <div className="w-full flex-1 flex items-center justify-center min-h-0 overflow-hidden">
          <TimerDisplay 
            externalStartDate={startDate} 
            externalHabitName={habitName}
            externalAccentColor={accentColor}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onUpdateDate={handleUpdateStartDate}
            onUpdateName={handleUpdateName}
            onUpdateColor={handleUpdateColor}
          />
        </div>

        <div className="text-center max-w-xs shrink-0 px-4 pt-2">
          <p className="text-[10px] md:text-xs text-muted-foreground font-medium italic leading-relaxed opacity-70">
            "The journey of a thousand miles begins with a single step."
          </p>
        </div>
      </main>

      {/* Full Screen History View */}
      <JourneyLog 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        startDate={startDate}
        habitName={habitName}
        accentColor={accentColor}
      />

      {/* Panels */}
      <SidePanel isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} side="left" title="Account">
        <div className="flex flex-col items-center space-y-6 pt-4">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-accent" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold">User Profile</h3>
            <p className="text-xs text-muted-foreground">Local Storage Active</p>
          </div>
        </div>
      </SidePanel>

      <SidePanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} side="right" title="App Settings">
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
            <span className="text-sm font-medium">Daily Reminders</span>
            <div className="w-10 h-5 bg-accent rounded-full relative">
              <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
            </div>
          </div>
        </div>
      </SidePanel>
    </div>
  )
}
