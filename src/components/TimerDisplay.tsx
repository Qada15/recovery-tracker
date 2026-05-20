
"use client"

import * as React from "react"
import { MoreVertical, Trash2, History, Flame, Clock, Trophy, RotateCcw, Eraser } from "lucide-react"
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
    <div className="flex flex-col items-center justify-center px-4 shrink-0">
      <span 
        className="text-xl sm:text-2xl font-black tabular-nums tracking-tighter leading-none" 
        style={{ color: color }}
      >
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[7px] uppercase tracking-widest text-muted-foreground font-black opacity-40 mt-1">
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
  onClearData: () => void
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
  onClearData,
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
    <div className="relative w-full max-w-[600px] flex flex-col items-center justify-center p-2">
      <div className="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border flex flex-col items-center p-6 relative overflow-hidden transition-all duration-500">
        
        {/* Dropdown Menu */}
        <div className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} z-20`}>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 hover:bg-secondary/50">
                <MoreVertical className="h-4 w-4 text-muted-foreground/60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isAr ? "start" : "end"} className="w-64 p-2 shadow-2xl rounded-2xl border-none">
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
              <DropdownMenuItem onSelect={onClearData} className="font-bold py-2 text-orange-600">
                <Eraser className="ml-2 h-4 w-4" />
                {isAr ? "حذف بيانات العداد" : "Clear Tracker Data"}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onDelete} className="font-bold text-destructive focus:text-destructive py-2">
                <Trash2 className="ml-2 h-4 w-4" />
                {isAr ? "حذف العداد نهائياً" : "Delete Tracker"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 1. Statistics (TOP) */}
        <div className="w-full flex justify-center gap-4 mb-4 shrink-0">
          <div className="bg-secondary/10 rounded-2xl px-4 py-2 flex flex-col items-center justify-center min-w-[100px] border border-white/10">
            <Trophy className="h-3 w-3 text-amber-500 mb-0.5" />
            <span className="text-xl font-black tabular-nums leading-none" style={{ color: externalAccentColor }}>
              {stats.highest !== null ? stats.highest : "—"}
            </span>
            <span className="text-[7px] font-black uppercase opacity-40 mt-1">{isAr ? "أعلى رقم" : "Best Streak"}</span>
          </div>
          <div className="bg-secondary/10 rounded-2xl px-4 py-2 flex flex-col items-center justify-center min-w-[100px] border border-white/10">
            <RotateCcw className="h-3 w-3 text-slate-400 mb-0.5" />
            <span className="text-xl font-black tabular-nums text-slate-700 dark:text-slate-300 leading-none">
              {stats.previous !== null ? stats.previous : "—"}
            </span>
            <span className="text-[7px] font-black uppercase opacity-40 mt-1">{isAr ? "الرقم السابق" : "Previous"}</span>
          </div>
        </div>

        {/* 2. Main Day Counter (MIDDLE) */}
        <div className="flex flex-col items-center justify-center mb-4">
          <div className="relative">
            <span 
              className="text-7xl sm:text-8xl font-black tabular-nums tracking-tighter leading-none"
              style={{ 
                color: externalAccentColor,
                textShadow: '0 8px 25px rgba(0,0,0,0.05)'
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

        {/* 3. Time Details (BOTTOM) */}
        <div className="flex items-center justify-center divide-x divide-border/20 rtl:divide-x-reverse mb-2">
          <MiniTimeBox value={elapsed.hours} label={isAr ? "ساعة" : "H"} color={externalAccentColor} />
          <MiniTimeBox value={elapsed.minutes} label={isAr ? "دقيقة" : "M"} color={externalAccentColor} />
          <MiniTimeBox value={elapsed.seconds} label={isAr ? "ثانية" : "S"} color={externalAccentColor} />
        </div>
        
        {/* Buttons Row */}
        <div className="flex gap-3 w-full max-w-[360px] mt-6">
          {elapsed.days >= 1 && (
            <Button onClick={onUrge} className="flex-1 h-12 rounded-xl font-black bg-orange-500 hover:bg-orange-600 text-white shadow-md active:scale-95 transition-transform">
              <Flame className="ml-2 h-4 w-4" /> {isAr ? "رغبة" : "Urge"}
            </Button>
          )}
          <Button onClick={onReset} variant="destructive" className="flex-1 h-12 rounded-xl font-black shadow-md active:scale-95 transition-transform">
            <Trash2 className="ml-2 h-4 w-4" /> {isAr ? "انتكاسة" : "Relapse"}
          </Button>
        </div>

        {/* Journal Link */}
        <Button variant="ghost" onClick={onOpenHistory} className="h-8 mt-4 rounded-full font-black text-[8px] uppercase opacity-30 hover:opacity-100 transition-all gap-1.5">
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
