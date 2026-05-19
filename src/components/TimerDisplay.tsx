
"use client"

import * as React from "react"
import { MoreVertical, Trash2, History, Flame, Clock, Trophy, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import { isAfter, isBefore, isSameDay, startOfDay, setHours, setMinutes, differenceInDays } from "date-fns"
import { CircularTimePicker } from "./CircularTimePicker"

const COLORS = [
  { name: 'Default', value: 'hsl(var(--accent))' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Violet', value: '#8b5cf6' },
]

const MiniTimeBox = React.memo(({ value, label, color }: { value: number; label: string; color: string }) => {
  return (
    <div className="flex flex-col items-center justify-center px-2 sm:px-4 shrink-0">
      <span 
        className="text-xl sm:text-2xl font-black tabular-nums tracking-tighter leading-none" 
        style={{ color: color }}
      >
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[6px] sm:text-[7px] uppercase tracking-widest text-muted-foreground font-black opacity-50 mt-1">
        {label}
      </span>
    </div>
  )
})
MiniTimeBox.displayName = "MiniTimeBox"

interface TimerDisplayProps {
  externalStartDate: Date
  externalHabitName: string
  externalAccentColor: string
  resetDates: Date[]
  onOpenHistory: () => void
  onUpdateDate: (date: Date) => void
  onUpdateName: (name: string) => void
  onUpdateColor: (color: string) => void
  onReset: () => void
  onUrge: () => void
  onDelete: () => void
  language: 'ar' | 'en'
}

type SetupStep = 'date' | 'hour' | 'minute'

export function TimerDisplay({ 
  externalStartDate, 
  externalHabitName, 
  externalAccentColor, 
  resetDates,
  onOpenHistory,
  onUpdateDate,
  onUpdateName,
  onUpdateColor,
  onReset,
  onUrge,
  onDelete,
  language
}: TimerDisplayProps) {
  const { toast } = useToast()
  const [elapsed, setElapsed] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [showNameDialog, setShowNameDialog] = React.useState(false)
  const [showDateDialog, setShowDateDialog] = React.useState(false)
  const [tempHabitName, setTempHabitName] = React.useState(externalHabitName)
  
  const [setupStep, setSetupStep] = React.useState<SetupStep>('date')
  const [selectedDate, setSelectedDate] = React.useState<Date>(externalStartDate)
  const [selectedHour, setSelectedHour] = React.useState(externalStartDate.getHours())
  const [selectedMinute, setSelectedMinute] = React.useState(externalStartDate.getMinutes())

  const isAr = language === 'ar'

  const stats = React.useMemo(() => {
    if (resetDates.length < 2) return { highest: null, previous: null }

    const streaks: number[] = []
    const sortedResets = [...resetDates].sort((a, b) => a.getTime() - b.getTime())

    for (let i = 0; i < sortedResets.length - 1; i++) {
      const diff = differenceInDays(sortedResets[i + 1], sortedResets[i])
      streaks.push(diff)
    }

    const highest = streaks.length > 0 ? Math.max(...streaks) : null
    const previous = streaks.length > 0 ? streaks[streaks.length - 1] : null

    return { highest, previous }
  }, [resetDates])

  React.useEffect(() => {
    const updateTimer = () => {
      const start = externalStartDate.getTime()
      const now = new Date().getTime()
      const diff = now - start
      const d = Math.max(0, diff)

      setElapsed({
        seconds: Math.floor((d / 1000) % 60),
        minutes: Math.floor((d / 1000 / 60) % 60),
        hours: Math.floor((d / (1000 * 60 * 60)) % 24),
        days: Math.floor(d / (1000 * 60 * 60 * 24))
      })
    }
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [externalStartDate])

  const handleUpdateName = () => {
    if (!tempHabitName.trim()) return
    onUpdateName(tempHabitName)
    setShowNameDialog(false)
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    if (isAfter(startOfDay(date), startOfDay(new Date()))) return
    setSelectedDate(date)
    setSetupStep('hour')
  }

  const handleSaveFullDate = () => {
    const finalDate = setMinutes(setHours(selectedDate, selectedHour), selectedMinute)
    if (isAfter(finalDate, new Date())) return
    onUpdateDate(finalDate)
    setShowDateDialog(false)
    setSetupStep('date')
  }

  const today = startOfDay(new Date())
  const start = startOfDay(externalStartDate)

  const isRelapse = (date: Date) => {
    const d = startOfDay(date)
    return resetDates.some(rd => isSameDay(startOfDay(rd), d)) || isSameDay(d, start)
  }

  const isClean = (date: Date) => {
    const d = startOfDay(date)
    return isAfter(d, start) && (isBefore(d, today) || isSameDay(d, today)) && !isRelapse(d)
  }

  const modifiers = { relapse: isRelapse, clean: isClean }
  const modifiersClassNames = {
    relapse: "bg-red-500 text-white rounded-full font-black scale-110",
    clean: "bg-emerald-500 text-white rounded-full font-black opacity-90"
  }

  return (
    <div className="relative w-full max-w-[650px] flex flex-col items-center justify-center p-2 sm:p-4">
      <div className="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border flex flex-col items-center p-4 sm:p-6 relative overflow-hidden">
        
        {/* Dropdown Menu - Positioned more discreetly */}
        <div className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} z-20`}>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 hover:bg-secondary/50">
                <MoreVertical className="h-4 w-4 text-muted-foreground/60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isAr ? "start" : "end"} className="w-56 p-2 shadow-2xl rounded-2xl border-none">
              <DropdownMenuItem onSelect={() => setShowNameDialog(true)} className="font-bold py-2">
                {isAr ? "تعديل الاسم" : "Edit Name"}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setShowDateDialog(true)} className="font-bold py-2">
                {isAr ? "تعديل الوقت" : "Edit Time"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="grid grid-cols-6 gap-2 p-2">
                {COLORS.map((c) => (
                  <button key={c.value} onClick={() => onUpdateColor(c.value)} className="w-5 h-5 rounded-full border shadow-sm transition-transform hover:scale-125" style={{ backgroundColor: c.value }} />
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onDelete} className="font-bold text-destructive focus:text-destructive py-2">
                <Trash2 className="ml-2 h-4 w-4" />
                {isAr ? "حذف العداد" : "Delete Tracker"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title and Badge - More compact */}
        <div className="w-full text-center mb-4">
          <h2 className="text-[10px] font-black text-muted-foreground/40 tracking-[0.4em] uppercase mb-1">{externalHabitName}</h2>
          <div className="flex items-center justify-center gap-1.5 opacity-50">
             <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: externalAccentColor }} />
             <span className="text-[7px] font-black uppercase tracking-widest">{isAr ? "نشط" : "Active"}</span>
          </div>
        </div>

        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 px-2 sm:px-6">
          {/* Left/Top Section: Stats (Stacked in Horizontal mode) */}
          <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto shrink-0 order-2 sm:order-1">
            <div className="flex-1 bg-secondary/5 rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center border border-white/10 min-w-[80px]">
              <Trophy className="h-3 w-3 text-amber-500 mb-1" />
              <span className="text-lg font-black tabular-nums" style={{ color: externalAccentColor }}>
                {stats.highest !== null ? stats.highest : "—"}
              </span>
              <span className="text-[7px] font-black uppercase opacity-40">{isAr ? "أعلى" : "Best"}</span>
            </div>
            <div className="flex-1 bg-secondary/5 rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center border border-white/10 min-w-[80px]">
              <RotateCcw className="h-3 w-3 text-slate-400 mb-1" />
              <span className="text-lg font-black tabular-nums text-slate-700 dark:text-slate-300">
                {stats.previous !== null ? stats.previous : "—"}
              </span>
              <span className="text-[7px] font-black uppercase opacity-40">{isAr ? "سابق" : "Prev"}</span>
            </div>
          </div>

          {/* Center Section: Main Counter */}
          <div className="flex flex-col items-center justify-center order-1 sm:order-2 flex-1">
            <div className="relative">
              <span 
                className="text-7xl sm:text-8xl font-black tabular-nums tracking-tighter leading-none"
                style={{ 
                  color: externalAccentColor,
                  textShadow: '0 8px 20px rgba(0,0,0,0.05)'
                }}
              >
                {elapsed.days}
              </span>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-30">
                  {isAr ? "يوم" : "Days"}
                </span>
              </div>
            </div>
          </div>

          {/* Right/Bottom Section: Time Details (Stacked) */}
          <div className="flex flex-row sm:flex-col items-center justify-center divide-x sm:divide-x-0 sm:divide-y divide-border/30 rtl:divide-x-reverse order-3 w-full sm:w-auto shrink-0">
            <MiniTimeBox value={elapsed.hours} label={isAr ? "ساعة" : "H"} color={externalAccentColor} />
            <MiniTimeBox value={elapsed.minutes} label={isAr ? "دقيقة" : "M"} color={externalAccentColor} />
            <MiniTimeBox value={elapsed.seconds} label={isAr ? "ثانية" : "S"} color={externalAccentColor} />
          </div>
        </div>
        
        {/* Buttons Section - Horizontal row below the main rectangle elements */}
        <div className="flex gap-3 w-full max-w-[400px] mt-8 mb-2">
          {elapsed.days >= 1 && (
            <Button onClick={onUrge} className="flex-1 h-12 rounded-xl font-black bg-orange-500 hover:bg-orange-600 text-white shadow-md active:scale-95 transition-transform">
              <Flame className="ml-2 h-4 w-4" /> {isAr ? "رغبة" : "Urge"}
            </Button>
          )}
          <Button onClick={onReset} variant="destructive" className="flex-1 h-12 rounded-xl font-black shadow-md active:scale-95 transition-transform">
            <Trash2 className="ml-2 h-4 w-4" /> {isAr ? "انتكاسة" : "Relapse"}
          </Button>
        </div>

        {/* Small Log Trigger */}
        <Button variant="ghost" onClick={onOpenHistory} className="h-8 mt-2 rounded-full font-black text-[8px] uppercase opacity-30 hover:opacity-100 transition-all gap-1.5">
          <History className="h-3 w-3" /> {isAr ? "سجل الرحلة" : "Journal"}
        </Button>
      </div>

      {/* Dialogs */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="rounded-[2.5rem] p-8 max-w-[380px]">
          <DialogHeader><DialogTitle className="text-center font-black">{isAr ? "تعديل الاسم" : "Edit Name"}</DialogTitle></DialogHeader>
          <div className="py-4"><Input value={tempHabitName} onChange={(e) => setTempHabitName(e.target.value)} className="text-center font-bold h-12 rounded-xl" /></div>
          <Button onClick={handleUpdateName} className="w-full h-12 rounded-xl font-black">{isAr ? "حفظ" : "Save"}</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showDateDialog} onOpenChange={(open) => { setShowDateDialog(open); if(!open) setSetupStep('date'); }}>
        <DialogContent className="rounded-[2.5rem] p-6 max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-center font-black">
              {setupStep === 'date' && (isAr ? '1. اختر التاريخ' : '1. Select Date')}
              {setupStep === 'hour' && (isAr ? '2. اختر الساعة' : '2. Select Hour')}
              {setupStep === 'minute' && (isAr ? '3. اختر الدقيقة' : '3. Select Minute')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center min-h-[320px] justify-center">
            {setupStep === 'date' && (
              <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} disabled={{ after: new Date() }} modifiers={modifiers} modifiersClassNames={modifiersClassNames} className="rounded-3xl bg-white dark:bg-slate-800 border p-2 shadow-inner" />
            )}
            {setupStep === 'hour' && (
              <div className="w-full">
                <CircularTimePicker mode="hours" value={selectedHour} onChange={setSelectedHour} onComplete={() => setSetupStep('minute')} />
                <Button variant="ghost" onClick={() => setSetupStep('date')} className="w-full mt-2 font-black opacity-40">{isAr ? "العودة للتقويم" : "Back"}</Button>
              </div>
            )}
            {setupStep === 'minute' && (
              <div className="w-full">
                <CircularTimePicker mode="minutes" value={selectedMinute} onChange={setSelectedMinute} onComplete={handleSaveFullDate} />
                <Button variant="ghost" onClick={() => setSetupStep('hour')} className="w-full mt-2 font-black opacity-40">{isAr ? "العودة للساعة" : "Back"}</Button>
                <Button onClick={handleSaveFullDate} className="w-full h-12 mt-4 rounded-xl font-black shadow-lg">{isAr ? "حفظ التغييرات" : "Save Changes"}</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
