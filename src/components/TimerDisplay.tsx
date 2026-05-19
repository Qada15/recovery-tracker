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
    <div className="flex flex-col items-center justify-center px-3 shrink-0">
      <span 
        className="text-2xl sm:text-3xl font-black tabular-nums tracking-tighter" 
        style={{ color: color }}
      >
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[7px] uppercase tracking-widest text-muted-foreground font-black opacity-50">
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

  // حساب الإحصائيات (الأرقام القياسية)
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
    <div className="relative w-full max-w-[600px] flex-1 flex flex-col items-center justify-center p-2 min-h-0 overflow-hidden">
      <div className="w-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border flex flex-col items-center justify-center p-8 relative overflow-hidden max-h-full">
        
        <div className={`absolute top-6 ${isAr ? 'left-6' : 'right-6'} z-20`}>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-10 h-10">
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isAr ? "start" : "end"} className="w-64 p-3 shadow-2xl rounded-2xl">
              <DropdownMenuItem onSelect={() => setShowNameDialog(true)} className="font-bold">
                {isAr ? "تعديل الاسم" : "Edit Name"}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setShowDateDialog(true)} className="font-bold">
                {isAr ? "تعديل التاريخ والوقت" : "Edit Date & Time"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="grid grid-cols-6 gap-2 p-2">
                {COLORS.map((c) => (
                  <button key={c.value} onClick={() => onUpdateColor(c.value)} className="w-6 h-6 rounded-full border shadow-sm transition-transform hover:scale-125" style={{ backgroundColor: c.value }} title={c.name} />
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onDelete} className="font-bold text-destructive focus:text-destructive">
                <Trash2 className="ml-2 h-4 w-4" />
                {isAr ? "حذف العداد بالكامل" : "Delete Tracker"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-lg font-black text-muted-foreground/60 tracking-widest uppercase mb-1">{externalHabitName}</h2>
          <div className="flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: externalAccentColor }} />
            <span className="text-[7px] font-black uppercase opacity-40 tracking-widest">{isAr ? "عداد نشط" : "Active Tracker"}</span>
          </div>
        </div>

        {/* Statistics Section - Moved to Top and Enlarged */}
        <div className="w-full max-w-[340px] grid grid-cols-2 gap-4 mb-8">
          <div className="bg-secondary/10 rounded-3xl p-4 flex flex-col items-center justify-center text-center border border-white/20 shadow-sm">
            <Trophy className="h-6 w-6 text-amber-500 mb-2 opacity-90" />
            <span className="text-2xl font-black tabular-nums leading-none" style={{ color: externalAccentColor }}>
              {stats.highest !== null ? stats.highest : "—"}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-60 mt-2">
              {isAr ? "أعلى رقم قياسي" : "Best Record"}
            </span>
          </div>
          <div className="bg-secondary/10 rounded-3xl p-4 flex flex-col items-center justify-center text-center border border-white/20 shadow-sm">
            <RotateCcw className="h-6 w-6 text-slate-400 mb-2 opacity-90" />
            <span className="text-2xl font-black tabular-nums leading-none text-slate-700 dark:text-slate-300">
              {stats.previous !== null ? stats.previous : "—"}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-60 mt-2">
              {isAr ? "الرقم السابق" : "Prev Record"}
            </span>
          </div>
        </div>

        {/* Hero Unit: Days */}
        <div className="flex flex-col items-center justify-center mb-4">
          <span 
            className="text-[9rem] leading-none font-black tabular-nums tracking-tighter transition-all duration-700 select-none"
            style={{ 
              color: externalAccentColor,
              textShadow: '0 15px 30px rgba(0,0,0,0.05)'
            }}
          >
            {elapsed.days}
          </span>
          <span className="text-sm font-black uppercase tracking-[0.4em] text-muted-foreground -mt-1 opacity-50">
            {isAr ? "يوم" : "Days"}
          </span>
        </div>
        
        {/* Completion Units: H, M, S */}
        <div className="flex items-center justify-center divide-x divide-border rtl:divide-x-reverse mb-8">
          <MiniTimeBox value={elapsed.hours} label={isAr ? "ساعة" : "Hour"} color={externalAccentColor} />
          <MiniTimeBox value={elapsed.minutes} label={isAr ? "دقيقة" : "Min"} color={externalAccentColor} />
          <MiniTimeBox value={elapsed.seconds} label={isAr ? "ثانية" : "Sec"} color={externalAccentColor} />
        </div>
        
        <div className="flex gap-3 w-full max-w-[320px] shrink-0">
          {elapsed.days >= 1 && (
            <Button onClick={onUrge} className="flex-1 h-14 rounded-2xl font-black bg-orange-500 hover:bg-orange-600 text-white shadow-xl hover:scale-105 active:scale-95 transition-all">
              <Flame className="ml-2 h-4 w-4" /> {isAr ? "رغبة" : "Urge"}
            </Button>
          )}
          <Button onClick={onReset} variant="destructive" className="flex-1 h-14 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all">
            <Trash2 className="ml-2 h-4 w-4" /> {isAr ? "انتكاسة" : "Relapse"}
          </Button>
        </div>

        <Button variant="ghost" onClick={onOpenHistory} className="mt-6 rounded-full font-black text-[10px] uppercase opacity-40 hover:opacity-100 transition-opacity">
          <History className="mr-2 h-3.5 w-3.5" /> {isAr ? "سجل الرحلة" : "Journey Log"}
        </Button>
      </div>

      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="rounded-[2.5rem] p-8 max-md">
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
              <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} disabled={{ after: new Date() }} modifiers={modifiers} modifiersClassNames={modifiersClassNames} className="rounded-3xl bg-white dark:bg-slate-800 border p-2" />
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
