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
    
    for (let i = 0; i < sortedResets.length - 1; i++) {
      const diff = differenceInDays(sortedResets[i + 1], sortedResets[i])
      streaks.push(Math.max(0, diff - 1))
    }
    
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
      <header className="w-full h-16 border-b flex items-center justify-between px-6 bg-white dark:bg-slate-900 shrink-0 shadow-sm">
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-10 w-10">
          <ChevronLeft className={`h-8 w-8 ${isAr ? 'rotate-180' : ''}`} />
        </Button>
        <h2 className="text-xl font-black uppercase tracking-tight">{isAr ? "سجل الرحلة" : "Journey Log"}</h2>
        <div className="w-10" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-between p-4 overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
        {/* Stats Section - More Compact */}
        <div className="w-full max-w-[480px] grid grid-cols-2 gap-4 shrink-0">
          <div className="bg-amber-500/5 border-2 border-amber-500/20 rounded-[2rem] p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <Trophy className="h-5 w-5 text-amber-500 mb-1" />
            <span className="text-4xl font-black text-amber-600 dark:text-amber-400 tabular-nums leading-none">{stats.highest}</span>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60 mt-1">{isAr ? "أعلى رقم (أيام)" : "Highest Streak"}</span>
          </div>
          <div className="bg-slate-500/5 border-2 border-slate-500/20 rounded-[2rem] p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <HistoryIcon className="h-5 w-5 text-slate-500 mb-1" />
            <span className="text-4xl font-black text-slate-600 dark:text-slate-400 tabular-nums leading-none">{stats.previous}</span>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60 mt-1">{isAr ? "الرقم السابق" : "Previous"}</span>
          </div>
        </div>

        {/* Calendar Section - Centered and Scaled to Fit */}
        <div className="flex-1 w-full max-w-[480px] flex items-center justify-center overflow-hidden py-2">
          <div className="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl p-4 flex flex-col items-center">
            <Calendar 
              mode="single" 
              selected={selectedDay}
              onSelect={setSelectedDay}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              disabled={[{ after: today }]} 
              modifiers={modifiers}
              modifiersClassNames={MODIFIERS_STYLES}
              className="scale-90 sm:scale-100"
            />
            <div className="flex gap-4 py-2 border-t w-full justify-center mt-2 opacity-60">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-widest">{isAr ? "نظيف" : "Clean"}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-[9px] font-black uppercase tracking-widest">{isAr ? "انتكاسة" : "Relapse"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Section - Bottom Bar */}
        <div className="w-full max-w-[480px] shrink-0 h-16 flex gap-4 mt-2">
          {selectedDay && (
            getResetForDay(selectedDay) ? (
              <>
                <Button onClick={() => onRemoveReset(selectedDay)} variant="outline" className="flex-1 h-full rounded-[1.5rem] font-black border-2 border-red-500 text-red-500 text-lg shadow-sm">
                  <Trash2 className="ml-2 h-5 w-5" /> {isAr ? "حذف" : "Delete"}
                </Button>
                <Button onClick={handleAdjustTime} className="w-16 h-full rounded-[1.5rem] font-black bg-slate-200 text-slate-700 shadow-sm">
                  <Settings2 className="h-6 w-6" />
                </Button>
              </>
            ) : (
              <Button onClick={() => onReset(selectedDay)} variant="destructive" className="flex-1 h-full rounded-[1.5rem] font-black bg-red-500 text-lg shadow-lg active:scale-95 transition-all">
                <AlertCircle className="ml-2 h-6 w-6" /> {isAr ? "تسجيل انتكاسة" : "Mark Relapse"}
              </Button>
            )
          )}
        </div>
      </main>

      <Dialog open={showTimePicker} onOpenChange={setShowTimePicker}>
        <DialogContent className="rounded-[2.5rem] p-6 max-w-[360px] z-[200]">
          <DialogHeader><DialogTitle className="text-center font-black text-xl">{isAr ? "ضبط الوقت" : "Set Time"}</DialogTitle></DialogHeader>
          <div className="scale-90">
            <CircularTimePicker 
              mode={pickerMode} 
              value={pickerMode === 'hours' ? tempHour : tempMinute} 
              onChange={pickerMode === 'hours' ? setTempHour : setTempMinute} 
              onComplete={() => pickerMode === 'hours' ? setPickerMode('minutes') : saveAdjustedTime()} 
            />
          </div>
          {pickerMode === 'minutes' && (
             <Button onClick={saveAdjustedTime} className="w-full mt-4 h-14 rounded-[1.5rem] font-black text-lg shadow-md">تأكيد</Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
})
JourneyLog.displayName = "JourneyLog"
