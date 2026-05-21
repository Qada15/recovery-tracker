
"use client"

import * as React from "react"
import { History, Flame, Trophy, RefreshCw, MoreVertical, Settings2, Calendar as CalendarIcon, Sparkles, Trash2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { setHours, setMinutes, differenceInDays, startOfDay, isAfter, isBefore, isSameDay, max } from "date-fns"
import { CircularTimePicker } from "./CircularTimePicker"

// مكوّن العداد معزول تماماً لمنع إعادة رندرة التقويم الثقيل كل ثانية
const LiveClock = React.memo(({ startDate, language }: { startDate: Date; language: 'ar' | 'en' }) => {
  const [elapsed, setElapsed] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const isAr = language === 'ar'

  React.useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime()
      const start = startDate.getTime()
      const d = Math.max(0, now - start)
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
  }, [startDate])

  return (
    <>
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="relative flex flex-col items-center">
          <span className="text-7xl font-black text-orange-500 tabular-nums leading-none">
            {elapsed.days}
          </span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">
            {isAr ? "يوم" : "Day"}
          </span>
        </div>
      </div>

      <div className="w-full flex justify-center gap-4 py-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl mb-8">
        <div className="text-center">
          <span className="text-xl font-black text-slate-700 dark:text-slate-200 tabular-nums">{elapsed.hours}</span>
          <p className="text-[8px] font-black uppercase opacity-40">{isAr ? "ساعة" : "H"}</p>
        </div>
        <span className="text-xl font-black text-slate-300">:</span>
        <div className="text-center">
          <span className="text-xl font-black text-slate-700 dark:text-slate-200 tabular-nums">{elapsed.minutes}</span>
          <p className="text-[8px] font-black uppercase opacity-40">{isAr ? "دقيقة" : "M"}</p>
        </div>
        <span className="text-xl font-black text-slate-300">:</span>
        <div className="text-center">
          <span className="text-xl font-black text-slate-700 dark:text-slate-200 tabular-nums">{elapsed.seconds}</span>
          <p className="text-[8px] font-black uppercase opacity-40">{isAr ? "ثانية" : "S"}</p>
        </div>
      </div>
    </>
  )
})
LiveClock.displayName = "LiveClock"

interface TimerDisplayProps {
  externalStartDate: Date
  externalHabitName: string
  externalAccentColor: string
  resetDates: Date[]
  urgeDates: Date[]
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

export const TimerDisplay = React.memo(({ 
  externalStartDate, 
  externalHabitName, 
  resetDates,
  urgeDates,
  onOpenHistory,
  onUpdateDate,
  onUpdateName,
  onReset,
  onUrge,
  onDelete,
  onClearData,
  language
}: TimerDisplayProps) => {
  const [showNameDialog, setShowNameDialog] = React.useState(false)
  const [showDateDialog, setShowDateDialog] = React.useState(false)
  const [tempHabitName, setTempHabitName] = React.useState(externalHabitName)
  
  const [setupStep, setSetupStep] = React.useState<'date' | 'hour' | 'minute'>('date')
  const [selectedDate, setSelectedDate] = React.useState<Date>(externalStartDate)
  const [selectedHour, setSelectedHour] = React.useState(externalStartDate.getHours())
  const [selectedMinute, setSelectedMinute] = React.useState(externalStartDate.getMinutes())

  const isAr = language === 'ar'
  const today = React.useMemo(() => startOfDay(new Date()), [])

  const currentDays = Math.floor(Math.max(0, new Date().getTime() - externalStartDate.getTime()) / (1000 * 60 * 60 * 24))

  // تحسين جذري: بدلاً من مصفوفة آلاف الأيام، نستخدم دالة فحص (Matcher)
  const latestResetDate = React.useMemo(() => {
    return resetDates.length === 0 ? startOfDay(externalStartDate) : max(resetDates.map(d => startOfDay(d)));
  }, [resetDates, externalStartDate]);

  const modifiers = React.useMemo(() => ({
    relapse: resetDates,
    urge: urgeDates,
    clean: (date: Date) => {
      const d = startOfDay(date);
      return isAfter(d, latestResetDate) && (isBefore(d, today) || isSameDay(d, today));
    }
  }), [resetDates, urgeDates, latestResetDate, today]);

  const modifiersClassNames = React.useMemo(() => ({
    relapse: "bg-red-500 text-white rounded-full font-black !opacity-100",
    clean: "bg-emerald-500 text-white rounded-full font-black !opacity-100",
    urge: "urge-dot"
  }), []);

  const stats = React.useMemo(() => {
    if (resetDates.length < 2) return { highest: 0, previous: 0 }
    const streaks: number[] = []
    const sortedResets = [...resetDates].sort((a, b) => a.getTime() - b.getTime())
    
    for (let i = 0; i < sortedResets.length - 1; i++) {
      const diff = differenceInDays(sortedResets[i + 1], sortedResets[i])
      streaks.push(diff)
    }
    
    return { highest: streaks.length > 0 ? Math.max(...streaks) : 0, previous: streaks.length > 0 ? streaks[streaks.length - 1] : 0 }
  }, [resetDates])

  const handleUpdateName = () => {
    if (!tempHabitName.trim()) return
    onUpdateName(tempHabitName)
    setShowNameDialog(false)
  }

  const handleSaveFullDate = () => {
    const finalDate = setMinutes(setHours(selectedDate, selectedHour), selectedMinute)
    onUpdateDate(finalDate)
    setShowDateDialog(false)
    setSetupStep('date')
  }

  return (
    <div className="w-full max-w-[480px] flex flex-col items-center">
      <div className="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <MoreVertical className="h-5 w-5 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-2xl w-56">
              <DropdownMenuItem onClick={() => setShowNameDialog(true)} className="p-3 font-bold">
                <Settings2 className="h-4 w-4 ml-2" /> {isAr ? "تعديل الاسم" : "Edit Name"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDateDialog(true)} className="p-3 font-bold">
                <CalendarIcon className="h-4 w-4 ml-2" /> {isAr ? "تعديل وقت البداية" : "Edit Start Time"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onClearData} className="text-orange-500 font-bold p-3">
                <RotateCcw className="h-4 w-4 ml-2" /> {isAr ? "حذف سجلات العداد" : "Clear Records"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-500 font-bold p-3">
                <Trash2 className="h-4 w-4 ml-2" /> {isAr ? "حذف العداد نهائياً" : "Delete Permanently"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{externalHabitName}</h3>
            <Sparkles className="h-5 w-5 text-orange-400" />
          </div>
        </div>

        <div className="w-full flex justify-between gap-3 mb-8">
          <div className="flex-1 bg-amber-500/5 border border-amber-500/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
            <Trophy className="h-4 w-4 text-amber-500 mb-1" />
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 tabular-nums leading-none">
              {stats.highest}
            </span>
            <span className="text-[8px] font-black uppercase tracking-tighter opacity-40 mt-1">
              {isAr ? "أعلى رقم قياسي" : "Highest Record"}
            </span>
          </div>
          <div className="flex-1 bg-slate-500/5 border border-slate-500/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
            <History className="h-4 w-4 text-slate-500 mb-1" />
            <span className="text-xl font-black text-slate-600 dark:text-slate-400 tabular-nums leading-none">
              {stats.previous}
            </span>
            <span className="text-[8px] font-black uppercase tracking-tighter opacity-40 mt-1">
              {isAr ? "الرقم السابق" : "Previous Record"}
            </span>
          </div>
        </div>

        <LiveClock startDate={externalStartDate} language={language} />

        <div className="w-full grid grid-cols-5 gap-3 mb-3">
          {currentDays >= 1 ? (
            <>
              <button onClick={onUrge} className="col-span-3 h-14 rounded-2xl border-2 border-orange-100 text-orange-500 font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all">
                <Flame className="h-5 w-5" />
                {isAr ? "أشعر برغبة" : "Feel Urge"}
              </button>
              <button onClick={onReset} className="col-span-2 h-14 rounded-2xl border-2 border-red-100 text-red-500 font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all">
                <RefreshCw className="h-5 w-5" />
                {isAr ? "تصفير" : "Reset"}
              </button>
            </>
          ) : (
            <button onClick={onReset} className="col-span-5 h-14 rounded-2xl border-2 border-red-100 text-red-500 font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all">
              <RefreshCw className="h-5 w-5" />
              {isAr ? "تصفير" : "Reset"}
            </button>
          )}
        </div>

        <Button onClick={onOpenHistory} className="w-full h-16 rounded-[1.5rem] bg-slate-900 dark:bg-slate-800 text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
          <History className="h-6 w-6" />
          {isAr ? "سجل الرحلة" : "Journey Log"}
        </Button>
      </div>

      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="rounded-[2.5rem] p-8 max-w-[380px]">
          <DialogHeader><DialogTitle className="text-center font-black">{isAr ? "تعديل الاسم" : "Edit Name"}</DialogTitle></DialogHeader>
          <div className="py-4"><Input value={tempHabitName} onChange={(e) => setTempHabitName(e.target.value)} className="text-center font-bold h-12 rounded-xl" /></div>
          <Button onClick={handleUpdateName} className="w-full h-12 rounded-xl font-black">{isAr ? "حفظ" : "Save"}</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showDateDialog} onOpenChange={(open) => { setShowDateDialog(open); if(!open) setSetupStep('date'); }}>
        <DialogContent className="rounded-[2.5rem] p-6 max-w-[400px]">
          <DialogHeader><DialogTitle className="text-center font-black">{isAr ? "تعديل الوقت" : "Edit Time"}</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center min-h-[320px] justify-center">
            {setupStep === 'date' && (
              <div className="w-full flex flex-col items-center">
                <Calendar mode="single" selected={selectedDate} onSelect={(d) => { if(d) { setSelectedDate(d); setSetupStep('hour'); } }} disabled={{ after: today }} className="rounded-3xl border p-2" modifiers={modifiers} modifiersClassNames={modifiersClassNames} />
                <div className="flex gap-6 py-4 border-t w-full justify-center mt-2 opacity-60">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black uppercase">{isAr ? "يوم نظيف" : "Clean"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-[10px] font-black uppercase">{isAr ? "انتكاسة" : "Relapse"}</span>
                  </div>
                </div>
              </div>
            )}
            {setupStep === 'hour' && (
              <div className="w-full">
                <CircularTimePicker mode="hours" value={selectedHour} onChange={setSelectedHour} onComplete={() => setSetupStep('minute')} />
                <Button variant="ghost" onClick={() => setSetupStep('date')} className="w-full mt-2 font-black opacity-40">{isAr ? "العودة" : "Back"}</Button>
              </div>
            )}
            {setupStep === 'minute' && (
              <div className="w-full">
                <CircularTimePicker mode="minutes" value={selectedMinute} onChange={setSelectedMinute} onComplete={handleSaveFullDate} />
                <Button onClick={handleSaveFullDate} className="w-full h-12 mt-4 rounded-xl font-black shadow-lg">{isAr ? "حفظ التغييرات" : "Save Changes"}</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
})
TimerDisplay.displayName = "TimerDisplay"
