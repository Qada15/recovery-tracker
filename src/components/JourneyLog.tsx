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

  const latestResetDate = React.useMemo(() => {
    if (resetDates.length === 0) return startOfDay(startDate)
    return max(resetDates.map(d => startOfDay(d)))
  }, [resetDates, startDate])

  const stats = React.useMemo(() => {
    if (resetDates.length < 2) return { highest: 0, previous: 0 }
    const streaks: number[] = []
    const sortedResets = [...resetDates].sort((a, b) => a.getTime() - b.getTime())
    for (let i = 0; i < sortedResets.length - 1; i++) {
      streaks.push(differenceInDays(sortedResets[i + 1], sortedResets[i]))
    }
    return { highest: streaks.length > 0 ? Math.max(...streaks) : 0, previous: streaks.length > 0 ? streaks[streaks.length - 1] : 0 }
  }, [resetDates])

  const modifiers = React.useMemo(() => ({
    relapse: resetDates,
    clean: (date: Date) => {
      if (!today) return false
      const day = startOfDay(date)
      return isAfter(day, latestResetDate) && (isBefore(day, today) || isSameDay(day, today))
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
      <header className="w-full h-16 border-b flex items-center justify-between px-6 bg-white dark:bg-slate-900 shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-12 w-12">
          <ChevronLeft className={`h-8 w-8 ${isAr ? 'rotate-180' : ''}`} />
        </Button>
        <h2 className="text-lg font-black uppercase tracking-tighter">{isAr ? "سجل الرحلة" : "Journey Log"}</h2>
        <div className="w-12" />
      </header>

      <main className="flex-1 flex flex-col items-center p-6 overflow-y-auto custom-scrollbar">
        {/* Stats Section moved inside Journey Log */}
        <div className="w-full max-w-[480px] grid grid-cols-2 gap-4 mb-8 shrink-0">
          <div className="bg-amber-500/5 border-2 border-amber-500/20 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center shadow-sm">
            <Trophy className="h-6 w-6 text-amber-500 mb-2" />
            <span className="text-4xl font-black text-amber-600 dark:text-amber-400 tabular-nums leading-none">{stats.highest}</span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-2">{isAr ? "أعلى رقم (أيام)" : "Highest Streak"}</span>
          </div>
          <div className="bg-slate-500/5 border-2 border-slate-500/20 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center shadow-sm">
            <HistoryIcon className="h-6 w-6 text-slate-500 mb-2" />
            <span className="text-4xl font-black text-slate-600 dark:text-slate-400 tabular-nums leading-none">{stats.previous}</span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-2">{isAr ? "الرقم السابق" : "Previous"}</span>
          </div>
        </div>

        <div className="w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-[3rem] border-2 shadow-2xl p-4 flex flex-col items-center shrink-0">
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
              className="scale-105"
            />
          </div>

          <div className="flex gap-6 py-4 border-t w-full justify-center mt-4 opacity-60">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">{isAr ? "يوم نظيف" : "Clean"}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">{isAr ? "انتكاسة" : "Relapse"}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4 w-full max-w-[480px] shrink-0 h-16">
          {selectedDay && (
            getResetForDay(selectedDay) ? (
              <>
                <Button onClick={() => onRemoveReset(selectedDay)} variant="outline" className="flex-1 h-16 rounded-[1.5rem] font-black border-2 border-red-500 text-red-500 text-lg">
                  <Trash2 className="ml-3 h-5 w-5" /> {isAr ? "حذف السجل" : "Delete Record"}
                </Button>
                <Button onClick={handleAdjustTime} className="w-16 h-16 rounded-[1.5rem] font-black bg-slate-200 text-slate-700">
                  <Settings2 className="h-6 w-6" />
                </Button>
              </>
            ) : (
              <Button onClick={() => onReset(selectedDay)} variant="destructive" className="flex-1 h-16 rounded-[1.5rem] font-black bg-red-500 text-lg shadow-xl active:scale-95 transition-all">
                <AlertCircle className="ml-3 h-6 w-6" /> {isAr ? "تسجيل انتكاسة في هذا اليوم" : "Mark Relapse"}
              </Button>
            )
          )}
        </div>
      </main>

      <Dialog open={showTimePicker} onOpenChange={setShowTimePicker}>
        <DialogContent className="rounded-[3rem] p-8 max-w-[420px] z-[200]">
          <DialogHeader><DialogTitle className="text-center font-black text-xl">{isAr ? "ضبط الوقت" : "Set Time"}</DialogTitle></DialogHeader>
          <CircularTimePicker 
            mode={pickerMode} 
            value={pickerMode === 'hours' ? tempHour : tempMinute} 
            onChange={pickerMode === 'hours' ? setTempHour : setTempMinute} 
            onComplete={() => pickerMode === 'hours' ? setPickerMode('minutes') : saveAdjustedTime()} 
          />
          {pickerMode === 'minutes' && (
             <Button onClick={saveAdjustedTime} className="w-full mt-6 h-14 rounded-2xl font-black text-lg shadow-lg">تأكيد الوقت</Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
})
JourneyLog.displayName = "JourneyLog"