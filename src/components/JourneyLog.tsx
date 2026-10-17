"use client"

import * as React from "react"
import { Trash2, Settings2, ChevronLeft, AlertCircle, Trophy, History as HistoryIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { startOfDay, isBefore, isSameDay, max, setHours, setMinutes, isAfter, differenceInDays } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CircularTimePicker } from "./CircularTimePicker"

const MODIFIERS_STYLES = {
  relapse: "bg-red-500 text-white rounded-full font-black !opacity-100",
  clean: "bg-emerald-500 text-white rounded-full font-black !opacity-100"
}

interface JourneyLogProps {
  isOpen: boolean
  onClose: () => void
  startDate: Date
  resetDates: Date[]
  language: 'ar' | 'en'
  onReset: (date: Date) => void
  onRemoveReset: (date: Date) => void
}

export const JourneyLog = React.memo(({ 
  isOpen, 
  onClose, 
  startDate, 
  resetDates,
  onReset,
  onRemoveReset,
  language
}: JourneyLogProps) => {
  const [selectedDay, setSelectedDay] = React.useState<Date | undefined>(undefined)
  const [currentMonth, setCurrentMonth] = React.useState<Date | null>(null)
  const [showTimePicker, setShowTimePicker] = React.useState(false)
  const [pickerMode, setPickerMode] = React.useState<'hours' | 'minutes'>('hours')
  const [tempHour, setTempHour] = React.useState(12)
  const [tempMinute, setTempMinute] = React.useState(0)
  
  const [today, setToday] = React.useState<Date | null>(null)

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const now = new Date()
      setToday(startOfDay(now))
      setCurrentMonth(now)
    }
  }, [])

  const stats = React.useMemo(() => {
    if (!today || resetDates.length === 0) return { highest: 0, previous: 0 }
    
    const streaks: number[] = []
    const sortedResets = [...resetDates].map(d => startOfDay(d)).sort((a, b) => a.getTime() - b.getTime())
    
    // حساب الفترات النظيفة بين الانتكاسات
    // القاعدة: اليوم الأحمر لا يُحسب (0)، لذا الأيام النظيفة هي الفرق مطروحاً منه 1
    for (let i = 0; i < sortedResets.length - 1; i++) {
      const diff = differenceInDays(sortedResets[i + 1], sortedResets[i])
      streaks.push(Math.max(0, diff - 1))
    }
    
    // حساب الفترة الحالية (من آخر انتكاسة حتى اليوم)
    // إذا كان اليوم هو يوم انتكاسة، الرقم الحالي هو 0
    const isTodayRelapse = sortedResets.some(rd => isSameDay(rd, today))
    const currentStreak = isTodayRelapse ? 0 : differenceInDays(today, sortedResets[sortedResets.length - 1])
    
    const allStreaks = [...streaks, currentStreak]
    const highest = allStreaks.length > 0 ? Math.max(...allStreaks) : 0
    const previous = streaks.length > 0 ? streaks[streaks.length - 1] : 0
    
    return { highest, previous }
  }, [resetDates, today])

  const latestResetDate = React.useMemo(() => {
    if (resetDates.length === 0) return startOfDay(startDate)
    return max(resetDates.map(d => startOfDay(d)))
  }, [resetDates, startDate])

  const modifiers = React.useMemo(() => ({
    relapse: resetDates,
    clean: (date: Date) => {
      if (!today) return false
      const day = startOfDay(date)
      // اليوم يكون نظيفاً إذا كان بعد آخر انتكاسة وليس هو نفسه يوم انتكاسة
      const isRelapse = resetDates.some(rd => isSameDay(startOfDay(rd), day))
      return !isRelapse && isAfter(day, latestResetDate) && (isBefore(day, today) || isSameDay(day, today))
    }
  }), [resetDates, latestResetDate, today])

  const getResetForDay = React.useCallback((date: Date) => {
    return resetDates.find(rd => isSameDay(startOfDay(rd), startOfDay(date)))
  }, [resetDates])

  const handleAdjustTime = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (!selectedDay) return
    const existingReset = getResetForDay(selectedDay) || selectedDay
    setTempHour(existingReset.getHours())
    setTempMinute(existingReset.getMinutes())
    setPickerMode('hours')
    setShowTimePicker(true)
  }, [selectedDay, getResetForDay])

  const saveAdjustedTime = React.useCallback(() => {
    if (!selectedDay) return
    const newDateTime = setMinutes(setHours(startOfDay(selectedDay), tempHour), tempMinute)
    onReset(newDateTime)
    setShowTimePicker(false)
  }, [selectedDay, tempHour, tempMinute, onReset])

  const isAr = language === 'ar'

  if (!today || !currentMonth) return null

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-background flex flex-col transition-all duration-300 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`} 
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <header className="w-full h-20 border-b flex items-center justify-between px-8 bg-white dark:bg-slate-900 shrink-0 shadow-sm">
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-14 w-14">
          <ChevronLeft className={`h-10 w-10 ${isAr ? 'rotate-180' : ''}`} />
        </Button>
        <h2 className="text-2xl font-black uppercase tracking-tighter">{isAr ? "سجل الرحلة" : "Journey Log"}</h2>
        <div className="w-14" />
      </header>

      <main className="flex-1 flex flex-col items-center p-8 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
        {/* Stats Section */}
        <div className="w-full max-w-[540px] grid grid-cols-2 gap-6 mb-10 shrink-0">
          <div className="bg-amber-500/10 border-4 border-amber-500/20 rounded-[3rem] p-8 flex flex-col items-center justify-center text-center shadow-md">
            <Trophy className="h-8 w-8 text-amber-500 mb-3" />
            <span className="text-6xl font-black text-amber-600 dark:text-amber-400 tabular-nums leading-none">{stats.highest}</span>
            <span className="text-xs font-black uppercase tracking-widest opacity-60 mt-4">{isAr ? "أعلى رقم (أيام)" : "Highest Streak"}</span>
          </div>
          <div className="bg-slate-500/10 border-4 border-slate-500/20 rounded-[3rem] p-8 flex flex-col items-center justify-center text-center shadow-md">
            <HistoryIcon className="h-8 w-8 text-slate-500 mb-3" />
            <span className="text-6xl font-black text-slate-600 dark:text-slate-400 tabular-nums leading-none">{stats.previous}</span>
            <span className="text-xs font-black uppercase tracking-widest opacity-60 mt-4">{isAr ? "الرقم السابق" : "Previous"}</span>
          </div>
        </div>

        <div className="w-full max-w-[540px] bg-white dark:bg-slate-900 rounded-[4rem] border-4 shadow-2xl p-6 flex flex-col items-center shrink-0">
          <div className="w-full">
            <Calendar 
              mode="single" 
              selected={selectedDay}
              onSelect={setSelectedDay}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              disabled={[{ after: today }]} 
              modifiers={modifiers}
              modifiersClassNames={MODIFIERS_STYLES}
              className="scale-110"
            />
          </div>

          <div className="flex gap-8 py-6 border-t w-full justify-center mt-6 opacity-60">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-emerald-500" />
              <span className="text-xs font-black uppercase tracking-widest">{isAr ? "يوم نظيف" : "Clean"}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span className="text-xs font-black uppercase tracking-widest">{isAr ? "انتكاسة" : "Relapse"}</span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex gap-6 w-full max-w-[540px] shrink-0 h-20">
          {selectedDay && (
            getResetForDay(selectedDay) ? (
              <>
                <Button onClick={() => onRemoveReset(selectedDay)} variant="outline" className="flex-1 h-20 rounded-[2rem] font-black border-4 border-red-500 text-red-500 text-xl shadow-lg">
                  <Trash2 className="ml-4 h-6 w-6" /> {isAr ? "حذف السجل" : "Delete Record"}
                </Button>
                <Button onClick={handleAdjustTime} className="w-20 h-20 rounded-[2rem] font-black bg-slate-200 text-slate-700 shadow-md">
                  <Settings2 className="h-8 w-8" />
                </Button>
              </>
            ) : (
              <Button onClick={() => onReset(selectedDay)} variant="destructive" className="flex-1 h-20 rounded-[2rem] font-black bg-red-500 text-xl shadow-2xl active:scale-95 transition-all">
                <AlertCircle className="ml-4 h-8 w-8" /> {isAr ? "تسجيل انتكاسة (0)" : "Mark Relapse (0)"}
              </Button>
            )
          )}
        </div>
      </main>

      <Dialog open={showTimePicker} onOpenChange={setShowTimePicker}>
        <DialogContent className="rounded-[4rem] p-10 max-w-[460px] z-[200]">
          <DialogHeader><DialogTitle className="text-center font-black text-2xl">{isAr ? "ضبط الوقت" : "Set Time"}</DialogTitle></DialogHeader>
          <CircularTimePicker 
            mode={pickerMode} 
            value={pickerMode === 'hours' ? tempHour : tempMinute} 
            onChange={pickerMode === 'hours' ? setTempHour : setTempMinute} 
            onComplete={() => pickerMode === 'hours' ? setPickerMode('minutes') : saveAdjustedTime()} 
          />
          {pickerMode === 'minutes' && (
             <Button onClick={saveAdjustedTime} className="w-full mt-8 h-16 rounded-[2rem] font-black text-xl shadow-xl">تأكيد الوقت</Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
})
JourneyLog.displayName = "JourneyLog"
