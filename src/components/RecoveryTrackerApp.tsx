
"use client"

import * as React from "react"
import { Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidePanel } from "@/components/SidePanel"
import { TimerDisplay } from "@/components/TimerDisplay"
import { JourneyLog } from "@/components/JourneyLog"
import { saveToStorage, getFromStorage, STORAGE_KEYS } from "@/lib/storage"
import { isValid, parseISO, startOfDay, isAfter, isBefore, isSameDay } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export function RecoveryTrackerApp() {
  const { toast } = useToast()
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [isAccountOpen, setIsAccountOpen] = React.useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false)

  const [habitName, setHabitName] = React.useState("Abstinence")
  const [accentColor, setAccentColor] = React.useState('hsl(var(--accent))')
  const [startDate, setStartDate] = React.useState<Date>(new Date())
  const [resetDates, setResetDates] = React.useState<Date[]>([])

  React.useEffect(() => {
    const savedDate = getFromStorage(STORAGE_KEYS.START_DATE)
    const savedName = getFromStorage(STORAGE_KEYS.HABIT_NAME)
    const savedColor = getFromStorage(STORAGE_KEYS.HABIT_COLOR)
    const savedResets = getFromStorage(STORAGE_KEYS.RESET_DATES)

    if (savedDate) {
      const parsed = new Date(savedDate)
      if (isValid(parsed)) setStartDate(parsed)
    }
    if (savedName) setHabitName(savedName)
    if (savedColor) setAccentColor(savedColor)
    if (savedResets) {
      try {
        const parsedResets = JSON.parse(savedResets).map((d: string) => parseISO(d))
        setResetDates(parsedResets)
      } catch (e) {
        console.error("Error parsing reset dates")
      }
    }
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.height = '100%'
  }, [])

  const handleUpdateStartDate = (newDate: Date) => {
    const startOfNewDate = startOfDay(newDate);
    const startOfToday = startOfDay(new Date());
    
    // تطهير الأيام التي تلي تاريخ البداية الجديد
    const filteredResets = resetDates.filter(rd => {
      const rdDate = startOfDay(rd);
      const isStrictlyAfterNewStart = isAfter(rdDate, startOfNewDate);
      const isBeforeOrEqualToday = isBefore(rdDate, startOfToday) || isSameDay(rdDate, startOfToday);
      return !(isStrictlyAfterNewStart && isBeforeOrEqualToday);
    });

    setStartDate(newDate);
    setResetDates(filteredResets);
    saveToStorage(STORAGE_KEYS.START_DATE, newDate.toISOString());
    saveToStorage(STORAGE_KEYS.RESET_DATES, JSON.stringify(filteredResets.map(d => d.toISOString())));
  }

  const handleResetAction = (targetDate?: Date) => {
    const dateToReset = targetDate || new Date()
    const startOfDate = startOfDay(dateToReset)
    
    // إذا كان التاريخ المختار هو اليوم الحالي أو لم يتم تمرير تاريخ، نقوم بتحديث العداد الرئيسي
    if (!targetDate || isSameDay(startOfDate, startOfDay(new Date()))) {
      setStartDate(new Date())
      saveToStorage(STORAGE_KEYS.START_DATE, new Date().toISOString())
    }
    
    const isAlreadyRecorded = resetDates.some(rd => isSameDay(startOfDay(rd), startOfDate))
    if (!isAlreadyRecorded) {
      const newResets = [...resetDates, dateToReset]
      setResetDates(newResets)
      saveToStorage(STORAGE_KEYS.RESET_DATES, JSON.stringify(newResets.map(d => d.toISOString())))
    }
    
    toast({ 
      variant: "destructive", 
      title: "تم تسجيل انتكاسة", 
      description: `تم تلوين يوم ${startOfDate.toLocaleDateString()} باللون الأحمر.` 
    })
  }

  const handleUrgeAction = (targetDate?: Date) => {
    const dateText = targetDate ? `ليوم ${startOfDay(targetDate).toLocaleDateString()}` : ""
    toast({ 
      title: "تنبيه رغبة", 
      description: `تم تسجيل رغبة ${dateText}. استمر في الصمود!`,
      className: "bg-orange-500 text-white border-none"
    })
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
      <header className="w-full h-14 md:h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm z-40 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => setIsAccountOpen(true)} className="rounded-full">
          <User className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-black tracking-tighter uppercase">Recovery Tracker</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} className="rounded-full">
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      <main className="flex-1 w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="text-center space-y-1 mb-2 shrink-0">
          <p className="text-muted-foreground font-black text-[8px] uppercase tracking-[0.3em]">Your Journey</p>
          <h2 className="text-lg font-black tracking-tight">Stay Strong</h2>
        </div>

        <div className="w-full flex-1 flex items-center justify-center min-h-0 overflow-hidden">
          <TimerDisplay 
            externalStartDate={startDate} 
            externalHabitName={habitName}
            externalAccentColor={accentColor}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onUpdateDate={handleUpdateStartDate}
            onUpdateName={handleUpdateName}
            onUpdateColor={handleUpdateColor}
            onReset={() => handleResetAction()}
            onUrge={() => handleUrgeAction()}
          />
        </div>
      </main>

      <JourneyLog 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        startDate={startDate}
        resetDates={resetDates}
        habitName={habitName}
        accentColor={accentColor}
        onReset={handleResetAction}
        onUrge={handleUrgeAction}
      />

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

      <SidePanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} side="right" title="Settings">
        <div className="space-y-6 text-center">
          <p className="text-sm opacity-50">App configuration is persistent.</p>
        </div>
      </SidePanel>
    </div>
  )
}
