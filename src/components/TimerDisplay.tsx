"use client"

import * as React from "react"
import { History, MoreVertical, Settings2, Calendar as CalendarIcon, RotateCcw, RefreshCw, Sparkles, Heart, Zap, Moon, Sun, Target, Shield, Flame, Cloud, Ghost, Trash2 } from "lucide-react"
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
import { setHours, setMinutes, startOfDay, isBefore, isSameDay, max, isAfter } from "date-fns"
import { CircularTimePicker } from "./CircularTimePicker"

const ICON_MAP = {
  Sparkles, Heart, Zap, Moon, Sun, Target, Shield, Flame, Cloud, Ghost
}

const MODIFIERS_STYLES = {
  relapse: "bg-red-500 text-white rounded-full font-black !opacity-100",
  clean: "bg-emerald-500 text-white rounded-full font-black !opacity-100"
}

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
    <div className="w-full flex flex-col items-center shrink-0">
      <div className="flex flex-col items-center justify-center mb-2">
        <div className="relative flex flex-col items-center">
          <span className="text-6xl font-black text-orange-500 tabular-nums leading-none">
            {elapsed.days}
          </span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
            {isAr ? "يوم" : "Day"}
          </span>
        </div>
      </div>

      <div className="w-full max-w-[200px] flex justify-center gap-3 py-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl mb-4 border border-slate-100 dark:border-slate-800">
        <div className="text-center">
          <span className="text-lg font-black text-slate-700 dark:text-slate-200 tabular-nums">{elapsed.hours}</span>
          <p className="text-[6px] font-black uppercase opacity-40">{isAr ? "ساعة" : "H"}</p>
        </div>
        <span className="text-lg font-black text-slate-300">:</span>
        <div className="text-center">
          <span className="text-lg font-black text-slate-700 dark:text-slate-200 tabular-nums">{elapsed.minutes}</span>
          <p className="text-[6px] font-black uppercase opacity-40">{isAr ? "دقيقة" : "M"}</p>
        </div>
        <span className="text-lg font-black text-slate-300">:</span>
        <div className="text-center">
          <span className="text-lg font-black text-slate-700 dark:text-slate-200 tabular-nums">{elapsed.seconds}</span>
          <p className="text-[6px] font-black uppercase opacity-40">{isAr ? "ثانية" : "S"}</p>
        </div>
      </div>
    </div>
  )
})
LiveClock.displayName = "LiveClock"

interface TimerDisplayProps {
  externalStartDate: Date
  externalHabitName: string
  externalHabitIcon?: string
  externalAccentColor: string
  resetDates: Date[]
  onOpenHistory: () => void
  onUpdateDate: (date: Date) => void
  onUpdateName: (name: string) => void
  onUpdateColor: (color: string) => void
  onReset: () => void
  onDelete: () => void
  onClearData: () => void
  language: 'ar' | 'en'
}

export const TimerDisplay = React.memo(({ 
  externalStartDate, 
  externalHabitName, 
  externalHabitIcon = 'Sparkles',
  resetDates,
  onOpenHistory,
  onUpdateDate,
  onUpdateName,
  onReset,
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
  
  const [today, setToday] = React.useState<Date | null>(null)
  React.useEffect(() => {
    setToday(startOfDay(new Date()))
  }, [])

  const isAr = language === 'ar'
  const IconComponent = ICON_MAP[externalHabitIcon as keyof typeof ICON_MAP] || Sparkles
  
  const latestResetDate = React.useMemo(() => {
    if (resetDates.length === 0) return startOfDay(externalStartDate)
    return max(resetDates.map(d => startOfDay(d)))
  }, [resetDates, externalStartDate]);

  const modifiers = React.useMemo(() => ({
    relapse: resetDates,
    clean: (date: Date) => {
      if (!today) return false
      const day = startOfDay(date)
      return isAfter(day, latestResetDate) && (isBefore(day, today) || isSameDay(day, today))
    }
  }), [resetDates, latestResetDate, today])

  const handleUpdateName = React.useCallback(() => {
    if (!tempHabitName.trim()) return
    onUpdateName(tempHabitName)
    setShowNameDialog(false)
  }, [tempHabitName, onUpdateName])

  const handleSaveFullDate = React.useCallback(() => {
    const finalDate = setMinutes(setHours(selectedDate, selectedHour), selectedMinute)
    onUpdateDate(finalDate)
    setShowDateDialog(false)
    setSetupStep('date')
  }, [selectedDate, selectedHour, selectedMinute, onUpdateDate])

  return (
    <div className="w-full flex flex-col items-center overflow-hidden h-full">
      <div className="w-full max-w-[380px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col items-center overflow-hidden">
        <div className="w-full flex items-center justify-between mb-4 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 hover:bg-slate-50 rounded-xl transition-colors">
                <MoreVertical className="h-5 w-5 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-xl w-48">
              <DropdownMenuItem onClick={onReset} className="text-red-500 font-bold p-2 text-xs">
                <RefreshCw className="h-3 w-3 ml-2" /> {isAr ? "تصفير" : "Reset"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowNameDialog(true)} className="p-2 font-bold text-xs">
                <Settings2 className="h-3 w-3 ml-2" /> {isAr ? "تعديل الاسم" : "Edit Name"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDateDialog(true)} className="p-2 font-bold text-xs">
                <CalendarIcon className="h-3 w-3 ml-2" /> {isAr ? "تعديل الوقت" : "Edit Time"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onClearData} className="text-orange-500 font-bold p-2 text-xs">
                <RotateCcw className="h-3 w-3 ml-2" /> {isAr ? "حذف السجلات" : "Clear Records"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-500 font-bold p-2 text-xs">
                <Trash2 className="h-3 w-3 ml-2" /> {isAr ? "حذف العداد" : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-800 dark:text-white tracking-tight truncate max-w-[140px]">{externalHabitName}</h3>
            <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
              <IconComponent className="h-4 w-4 text-orange-400" />
            </div>
          </div>
        </div>

        <LiveClock startDate={externalStartDate} language={language} />

        <Button onClick={onOpenHistory} className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all shrink-0">
          <History className="h-5 w-5" /> {isAr ? "سجل الرحلة" : "Journey Log"}
        </Button>
      </div>

      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="rounded-3xl p-5 max-w-[300px]">
          <DialogHeader><DialogTitle className="text-center font-black text-base">{isAr ? "تعديل الاسم" : "Edit Name"}</DialogTitle></DialogHeader>
          <div className="py-2"><Input value={tempHabitName} onChange={(e) => setTempHabitName(e.target.value)} className="text-center font-bold h-10 rounded-lg text-sm" /></div>
          <Button onClick={handleUpdateName} className="w-full h-10 rounded-lg font-black text-sm">{isAr ? "حفظ" : "Save"}</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showDateDialog} onOpenChange={(open) => { setShowDateDialog(open); if(!open) setSetupStep('date'); }}>
        <DialogContent className="rounded-[2.5rem] p-4 max-w-[340px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader><DialogTitle className="text-center font-black text-base">{isAr ? "تعديل الوقت" : "Edit Time"}</DialogTitle></DialogHeader>
          <div className="flex-1 flex flex-col items-center justify-center overflow-hidden py-1">
            {setupStep === 'date' && (
              <div className="w-full flex flex-col items-center scale-75 origin-top">
                <Calendar mode="single" selected={selectedDate} onSelect={(d) => { if(d) { setSelectedDate(d); setSetupStep('hour'); } }} disabled={today ? { after: today } : undefined} className="rounded-2xl border p-1" modifiers={modifiers} modifiersClassNames={MODIFIERS_STYLES} />
                <div className="flex gap-2 py-1 border-t w-full justify-center mt-1 opacity-60">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[7px] font-black uppercase">{isAr ? "نظيف" : "Clean"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-[7px] font-black uppercase">{isAr ? "انتكاسة" : "Relapse"}</span>
                  </div>
                </div>
              </div>
            )}
            {setupStep === 'hour' && <div className="scale-75"><CircularTimePicker mode="hours" value={selectedHour} onChange={setSelectedHour} onComplete={() => setSetupStep('minute')} /></div>}
            {setupStep === 'minute' && <div className="scale-75"><CircularTimePicker mode="minutes" value={selectedMinute} onChange={setSelectedMinute} onComplete={handleSaveFullDate} /></div>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
})
TimerDisplay.displayName = "TimerDisplay"
