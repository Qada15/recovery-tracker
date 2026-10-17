
"use client"

import * as React from "react"
import { Trash2, ChevronLeft, AlertCircle, Trophy, History as HistoryIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { startOfDay, isBefore, isSameDay, max, isAfter, differenceInDays } from "date-fns"

// علامات الحالة: خلفية خفيفة فقط. النقطة تظهر فقط عند التحديد عبر الـ modifiers.
const MODIFIERS_STYLES = {
  relapse: "bg-red-500/10 text-red-600 rounded-full font-black relative !opacity-100",
  clean: "bg-emerald-500/10 text-emerald-600 rounded-full font-black relative !opacity-100",
  selectedRelapse: "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-red-300 after:rounded-full z-20",
  selectedClean: "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-emerald-300 after:rounded-full z-20",
  outsideRelapse: "opacity-20 grayscale",
  outsideClean: "opacity-20 grayscale"
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
  const [today, setToday] = React.useState<Date | null>(null)

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const now = new Date()
      setToday(startOfDay(now))
      setCurrentMonth(now)
    }
  }, [])

  const stats = React.useMemo(() => {
    if (!today) return { highest: 0, previous: 0 }
    
    const allEvents = [startOfDay(startDate), ...resetDates.map(d => startOfDay(d))].sort((a, b) => a.getTime() - b.getTime())
    const streaks: number[] = []
    
    for (let i = 0; i < allEvents.length - 1; i++) {
      const diff = differenceInDays(allEvents[i + 1], allEvents[i])
      streaks.push(Math.max(0, diff - 1))
    }
    
    const latestReset = allEvents[allEvents.length - 1]
    const isTodayRelapse = resetDates.some(rd => isSameDay(startOfDay(rd), today))
    const currentStreak = isTodayRelapse ? 0 : differenceInDays(today, latestReset)
    
    const allStreaks = [...streaks, currentStreak]
    const highest = allStreaks.length > 0 ? Math.max(...allStreaks) : 0
    const previous = streaks.length > 0 ? streaks[streaks.length - 1] : 0
    
    return { highest, previous }
  }, [resetDates, startDate, today])

  const latestResetDate = React.useMemo(() => {
    if (resetDates.length === 0) return startOfDay(startDate)
    return max(resetDates.map(d => startOfDay(d)))
  }, [resetDates, startDate])

  const isDateInCurrentMonth = React.useCallback((date: Date) => {
    if (!currentMonth) return false
    return date.getMonth() === currentMonth.getMonth() && 
           date.getFullYear() === currentMonth.getFullYear()
  }, [currentMonth])

  const isRelapse = React.useCallback((date: Date) => {
    return resetDates.some(rd => isSameDay(startOfDay(rd), startOfDay(date)))
  }, [resetDates])

  const isClean = React.useCallback((date: Date) => {
    if (!today) return false
    const day = startOfDay(date)
    return !isRelapse(day) && isAfter(day, latestResetDate) && (isBefore(day, today) || isSameDay(day, today))
  }, [isRelapse, latestResetDate, today])

  const modifiers = React.useMemo(() => ({
    relapse: (date: Date) => isDateInCurrentMonth(date) && isRelapse(date),
    clean: (date: Date) => isDateInCurrentMonth(date) && isClean(date),
    selectedRelapse: (date: Date) => selectedDay && isSameDay(date, selectedDay) && isRelapse(date),
    selectedClean: (date: Date) => selectedDay && isSameDay(date, selectedDay) && isClean(date),
    outsideRelapse: (date: Date) => !isDateInCurrentMonth(date) && isRelapse(date),
    outsideClean: (date: Date) => !isDateInCurrentMonth(date) && isClean(date)
  }), [isDateInCurrentMonth, isRelapse, isClean, selectedDay])

  const isAr = language === 'ar'

  if (!today || !currentMonth) return null

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-background flex flex-col transition-all duration-500 pointer-events-auto overflow-hidden ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`} 
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <header className="w-full h-14 border-b flex items-center justify-between px-6 bg-white dark:bg-slate-900 shrink-0 shadow-sm z-10">
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-10 w-10">
          <ChevronLeft className={`h-8 w-8 ${isAr ? 'rotate-180' : ''}`} />
        </Button>
        <h2 className="text-xl font-black uppercase tracking-tight">{isAr ? "سجل الرحلة" : "Journey Log"}</h2>
        <div className="w-10" />
      </header>

      <main className="flex-1 flex flex-col items-center p-4 overflow-hidden bg-slate-50/50 dark:bg-slate-950/50 space-y-4">
        <div className="w-full max-w-[420px] grid grid-cols-2 gap-3 shrink-0">
          <div className="bg-amber-500/5 border-2 border-amber-500/20 rounded-[1.5rem] p-3 flex flex-col items-center justify-center text-center shadow-sm">
            <Trophy className="h-5 w-5 text-amber-500 mb-1" />
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400 tabular-nums leading-none">{stats.highest}</span>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60 mt-1">{isAr ? "أعلى رقم تاريخي" : "Historical Best"}</span>
          </div>
          <div className="bg-slate-500/5 border-2 border-slate-500/20 rounded-[1.5rem] p-3 flex flex-col items-center justify-center text-center shadow-sm">
            <HistoryIcon className="h-5 w-5 text-slate-500 mb-1" />
            <span className="text-3xl font-black text-slate-600 dark:text-slate-400 tabular-nums leading-none">{stats.previous}</span>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60 mt-1">{isAr ? "الرقم السابق" : "Previous Streak"}</span>
          </div>
        </div>

        <div className="flex-1 w-full max-w-[460px] flex items-center justify-center overflow-hidden">
          <div className="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-2xl p-4 flex flex-col items-center justify-center overflow-hidden">
            <Calendar 
              mode="single" 
              selected={selectedDay}
              onSelect={setSelectedDay}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              disabled={[{ after: today }]} 
              modifiers={modifiers as any}
              modifiersClassNames={MODIFIERS_STYLES}
              className="scale-90 origin-center"
              showOutsideDays={true}
            />
            <div className="flex gap-6 py-2 border-t w-full justify-center mt-1 opacity-60">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30" />
                <span className="text-[8px] font-black uppercase tracking-widest">{isAr ? "نظيف" : "Clean"}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                <span className="text-[8px] font-black uppercase tracking-widest">{isAr ? "انتكاسة" : "Relapse"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[460px] shrink-0 h-16 flex gap-3">
          {selectedDay && (
            isRelapse(selectedDay) ? (
              <Button onClick={() => onRemoveReset(selectedDay)} variant="outline" className="flex-1 h-full rounded-2xl font-black border-2 border-red-500 text-red-500 text-lg shadow-sm">
                <Trash2 className="ml-2 h-6 w-6" /> {isAr ? "حذف الانتكاسة" : "Delete Relapse"}
              </Button>
            ) : (
              <Button onClick={() => onReset(selectedDay)} variant="destructive" className="flex-1 h-full rounded-2xl font-black bg-red-500 text-lg shadow-lg active:scale-95 transition-all">
                <AlertCircle className="ml-2 h-7 w-7" /> {isAr ? "تسجيل انتكاسة" : "Mark Relapse"}
              </Button>
            )
          )}
        </div>
      </main>
    </div>
  )
})
JourneyLog.displayName = "JourneyLog"
