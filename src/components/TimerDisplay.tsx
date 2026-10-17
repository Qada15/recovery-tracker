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
      <div className="flex flex-col items-center justify-center mb-4">
        <div className="relative flex flex-col items-center">
          <span className="text-7xl font-black text-orange-500 tabular-nums leading-none">
            {elapsed.days}
          </span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">
            {isAr ? "يوم" : "Day"}
          </span>
        </div>
      </div>

      <div className="w-full max-w-[240px] flex justify-center gap-4 py-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl mb-8 border border-slate-100 dark:border-slate-800">
        <div className="text-center">
          <span className="text-xl font-black text-slate-700 dark:text-slate-200 tabular-nums">{elapsed.hours}</span>
          <p className="text-[7px] font-black uppercase opacity-40">{isAr ? "ساعة" : "H"}</p>
        </div>
        <span className="text-xl font-black text-slate-300">:</span>
        <div className="text-center">
          <span className="text-xl font-black text-slate-700 dark:text-slate-200 tabular-nums">{elapsed.minutes}</span>
          <p className="text-[7px] font-black uppercase opacity-40">{isAr ? "دقيقة" : "M"}</p>
        </div>
        <span className="text-xl font-black text-slate-300">:</span>
        <div className="text-center">
          <span className="text-xl font-black text-slate-700 dark:text-slate-200 tabular-nums">{elapsed.seconds}</span>
          <p className="text-[7px] font-black uppercase opacity-40">{isAr ? "ثانية" : "S"}</p>
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
    <div className="w-full flex flex-col items-center overflow-hidden h-full px-4">
      <div className="w-full max-w-[420px] bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 flex flex-col items-center overflow-hidden">
        <div className="w-full flex items-center justify-between mb-8 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <MoreVertical className="h-6 w-6 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-2xl w-56">
              <DropdownMenuItem onClick={onReset} className="text-red-500 font-bold p-3">
                <RefreshCw className="h-4 w-4 ml-2" /> {isAr ? "تصفير العداد" : "Reset Counter"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight truncate max-w-[180px]">{externalHabitName}</h3>
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
              <IconComponent className="h-6 w-6 text-orange-400" />
            </div>
          </div>
        </div>

        <LiveClock startDate={externalStartDate} language={language} />

        <Button onClick={onOpenHistory} className="w-full h-16 rounded-[1.5rem] bg-slate-900 dark:bg-slate-800 text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all shrink-0">
          <History className="h-6 w-6" /> {isAr ? "سجل الرحلة" : "Journey Log"}
        </Button>
      </div>

      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="rounded-[2.5rem] p-6 max-w-[340px]">
          <DialogHeader><DialogTitle className="text-center font-black">{isAr ? "تعديل الاسم" : "Edit Name"}</DialogTitle></DialogHeader>
          <div className="py-4"><Input value={tempHabitName} onChange={(e) => setTempHabitName(e.target.value)} className="text-center font-bold h-12 rounded-xl" /></div>
          <Button onClick={handleUpdateName} className="w-full h-12 rounded-xl font-black">{isAr ? "حفظ" : "Save"}</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showDateDialog} onOpenChange={(open) => { setShowDateDialog(open); if(!open) setSetupStep('date'); }}>
        <DialogContent className="rounded-[2.5rem] p-5 max-w-[380px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader><DialogTitle className="text-center font-black">{isAr ? "تعديل الوقت" : "Edit Time"}</DialogTitle></DialogHeader>
          <div className="flex-1 flex flex-col items-center justify-center overflow-hidden py-2">
            {setupStep === 'date' && (
              <div className="w-full flex flex-col items-center">
                <Calendar mode="single" selected={selectedDate} onSelect={(d) => { if(d) { setSelectedDate(d); setSetupStep('hour'); } }} disabled={today ? { after: today } : undefined} className="rounded-3xl border p-2 scale-90" modifiers={modifiers} modifiersClassNames={MODIFIERS_STYLES} />
                <div className="flex gap-4 py-2 border-t w-full justify-center mt-2 opacity-60">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[8px] font-black uppercase">{isAr ? "يوم نظيف" : "Clean"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-[8px] font-black uppercase">{isAr ? "انتكاسة" : "Relapse"}</span>
                  </div>
                </div>
              </div>
            )}
            {setupStep === 'hour' && (
              <div className="w-full">
                <CircularTimePicker mode="hours" value={selectedHour} onChange={setSelectedHour} onComplete={() => setSetupStep('minute')} />
                <Button variant="ghost" onClick={() => setSetupStep('date')} className="w-full mt-2 font-black opacity-40 text-xs">العودة</Button>
              </div>
            )}
            {setupStep === 'minute' && (
              <div className="w-full">
                <CircularTimePicker mode="minutes" value={selectedMinute} onChange={setSelectedMinute} onComplete={handleSaveFullDate} />
                <Button onClick={handleSaveFullDate} className="w-full h-12 mt-4 rounded-xl font-black shadow-lg">حفظ التغييرات</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
})
TimerDisplay.displayName = "TimerDisplay"