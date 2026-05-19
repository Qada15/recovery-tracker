
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
    <div className="flex flex-col items-center justify-center px-3 sm:px-4 shrink-0">
      <span 
        className="text-2xl sm:text-3xl font-black tabular-nums tracking-tighter" 
        style={{ color: color }}
      >
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[7px] sm:text-[8px] uppercase tracking-widest text-muted-foreground font-black opacity-50">
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
    <div className="relative w-full max-w-[600px] flex flex-col items-center justify-center p-4">
      <div className="w-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border flex flex-col items-center p-6 sm:p-10 relative overflow-hidden">
        
        {/* Dropdown Menu */}
        <div className={`absolute top-6 ${isAr ? 'left-6' : 'right-6'} z-20`}>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-secondary/50">
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isAr ? "start" : "end"} className="w-64 p-3 shadow-2xl rounded-2xl border-none">
              <DropdownMenuItem onSelect={() => setShowNameDialog(true)} className="font-bold py-3">
                {isAr ? "تعديل الاسم" : "Edit Name"}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setShowDateDialog(true)} className="font-bold py-3">
                {isAr ? "تعديل التاريخ والوقت" : "Edit Date & Time"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="grid grid-cols-6 gap-2 p-3">
                {COLORS.map((c) => (
                  <button key={c.value} onClick={() => onUpdateColor(c.value)} className="w-6 h-6 rounded-full border shadow-sm transition-transform hover:scale-125" style={{ backgroundColor: c.value }} title={c.name} />
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onDelete} className="font-bold text-destructive focus:text-destructive py-3">
                <Trash2 className="ml-2 h-4 w-4" />
                {isAr ? "حذف العداد بالكامل" : "Delete Tracker"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Top Section: Title & Stats */}
        <div className="w-full flex flex-col items-center mb-6">
          <div className="text-center mb-6">
            <h2 className="text-sm font-black text-muted-foreground/60 tracking-widest uppercase mb-1">{externalHabitName}</h2>
            <div className="flex items-center justify-center gap-2">
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: externalAccentColor }} />
              <span className="text-[8px] font-black uppercase opacity-40 tracking-widest">{isAr ? "عداد نشط" : "Active Tracker"}</span>
            </div>
          </div>

          <div className="w-full max-w-[400px] grid grid-cols-2 gap-4">
            <div className="bg-secondary/10 rounded-[2rem] p-4 flex flex-col items-center justify-center text-center border border-white/20 shadow-sm transition-all hover:bg-secondary/20">
              <Trophy className="h-5 w-5 text-amber-500 mb-2" />
              <span className="text-2xl font-black tabular-nums leading-none" style={{ color: externalAccentColor }}>
                {stats.highest !== null ? stats.highest : "—"}
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest opacity-60 mt-2">
                {isAr ? "أعلى رقم" : "Best Streak"}
              </span>
            </div>
            <div className="bg-secondary/10 rounded-[2rem] p-4 flex flex-col items-center justify-center text-center border border-white/20 shadow-sm transition-all hover:bg-secondary/20">
              <RotateCcw className="h-5 w-5 text-slate-400 mb-2" />
              <span className="text-2xl font-black tabular-nums leading-none text-slate-700 dark:text-slate-300">
                {stats.previous !== null ? stats.previous : "—"}
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest opacity-60 mt-2">
                {isAr ? "الرقم السابق" : "Prev Streak"}
              </span>
            </div>
          </div>
        </div>

        {/* Main Section: Days Counter */}
        <div className="flex flex-col items-center justify-center mb-6 py-4">
          <div className="relative">
            <span 
              className="text-[7rem] sm:text-[9rem] leading-none font-black tabular-nums tracking-tighter select-none"
              style={{ 
                color: externalAccentColor,
                textShadow: '0 15px 30px rgba(0,0,0,0.08)'
              }}
            >
              {elapsed.days}
            </span>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
              <span className="text-sm font-black uppercase tracking-[0.4em] text-muted-foreground opacity-50">
                {isAr ? "يوم" : "Days"}
              </span>
            </div>
          </div>
        </div>
        
        {/* Time Detail Section */}
        <div className="flex items-center justify-center divide-x divide-border rtl:divide-x-reverse mb-8 mt-4">
          <MiniTimeBox value={elapsed.hours} label={isAr ? "ساعة" : "Hour"} color={externalAccentColor} />
          <MiniTimeBox value={elapsed.minutes} label={isAr ? "دقيقة" : "Min"} color={externalAccentColor} />
          <MiniTimeBox value={elapsed.seconds} label={isAr ? "ثانية" : "Sec"} color={externalAccentColor} />
        </div>
        
        {/* Buttons Section */}
        <div className="flex gap-4 w-full max-w-[360px] mb-6">
          {elapsed.days >= 1 && (
            <Button onClick={onUrge} className="flex-1 h-14 rounded-2xl font-black bg-orange-500 hover:bg-orange-600 text-white shadow-lg transition-transform active:scale-95">
              <Flame className="ml-2 h-5 w-5" /> {isAr ? "رغبة" : "Urge"}
            </Button>
          )}
          <Button onClick={onReset} variant="destructive" className="flex-1 h-14 rounded-2xl font-black shadow-lg transition-transform active:scale-95">
            <Trash2 className="ml-2 h-5 w-5" /> {isAr ? "انتكاسة" : "Relapse"}
          </Button>
        </div>

        {/* Log Button */}
        <Button variant="ghost" onClick={onOpenHistory} className="h-10 rounded-full font-black text-[10px] uppercase opacity-40 hover:opacity-100 hover:bg-secondary/50 transition-all gap-2">
          <History className="h-4 w-4" /> {isAr ? "سجل الرحلة" : "Journey Log"}
        </Button>
      </div>

      {/* Dialogs */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="rounded-[2.5rem] p-8">
          <DialogHeader><DialogTitle className="text-center font-black">{isAr ? "تعديل الاسم" : "Edit Name"}</DialogTitle></DialogHeader>
          <div className="py-4"><Input value={tempHabitName} onChange={(e) => setTempHabitName(e.target.value)} className="text-center font-bold h-14 rounded-xl" /></div>
          <Button onClick={handleUpdateName} className="w-full h-14 rounded-xl font-black">{isAr ? "حفظ" : "Save"}</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showDateDialog} onOpenChange={(open) => { setShowDateDialog(open); if(!open) setSetupStep('date'); }}>
        <DialogContent className="rounded-[2.5rem] p-6 max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-center font-black">
              {setupStep === 'date' && (isAr ? '1. اختر التاريخ' : '1. Select Date')}
              {setupStep === 'hour' && (isAr ? '2. اختر الساعة' : '2. Select Hour')}
              {setupStep === 'minute' && (isAr ? '3. اختر الدقيقة' : '3. Select Minute')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center min-h-[350px] justify-center">
            {setupStep === 'date' && (
              <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} disabled={{ after: new Date() }} modifiers={modifiers} modifiersClassNames={modifiersClassNames} className="rounded-3xl bg-white dark:bg-slate-800 border p-2 shadow-inner" />
            )}
            {setupStep === 'hour' && (
              <div className="w-full">
                <CircularTimePicker mode="hours" value={selectedHour} onChange={setSelectedHour} onComplete={() => setSetupStep('minute')} />
                <Button variant="ghost" onClick={() => setSetupStep('date')} className="w-full mt-2 font-black opacity-40">{isAr ? "العودة للتقويم" : "Back to Calendar"}</Button>
              </div>
            )}
            {setupStep === 'minute' && (
              <div className="w-full">
                <CircularTimePicker mode="minutes" value={selectedMinute} onChange={setSelectedMinute} onComplete={handleSaveFullDate} />
                <Button variant="ghost" onClick={() => setSetupStep('hour')} className="w-full mt-2 font-black opacity-40">{isAr ? "العودة للساعة" : "Back to Hour"}</Button>
                <Button onClick={handleSaveFullDate} className="w-full h-14 mt-4 rounded-2xl font-black shadow-lg">{isAr ? "حفظ التغييرات" : "Save Changes"}</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
