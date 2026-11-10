
"use client"

import * as React from "react"
import { Trash2, ChevronLeft, AlertCircle, Trophy, History as HistoryIcon, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { startOfDay, isBefore, isSameDay, max, isAfter, differenceInDays, setHours, setMinutes } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CircularTimePicker } from "@/components/CircularTimePicker"

const MODIFIERS_STYLES = {
  relapse: "bg-red-500/10 text-red-600 rounded-full font-black relative !opacity-100",
  clean: "bg-emerald-500/10 text-emerald-600 rounded-full font-black relative !opacity-100",
  selectedRelapse: "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-red-500 after:rounded-full z-20",
  selectedClean: "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-emerald-500 after:rounded-full z-20",
  outsideRelapse: "opacity-10 grayscale",
  outsideClean: "opacity-10 grayscale",
  selectedOutsideRelapse: "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-slate-400 after:rounded-full z-20"
}

interface JourneyLogProps {
  startDate: Date
  birthDate: Date | null
  resetDates: Date[]
  language: 'ar' | 'en'
  onReset: (date: Date) => void
  onRemoveReset: (date: Date) => void
  onUpdateTime: (oldDate: Date, newDate: Date) => void
}

export const JourneyLog = React.memo(({ 
  startDate, 
  birthDate,
  resetDates,
  onReset,
  onRemoveReset,
  onUpdateTime,
  language
}: JourneyLogProps) => {
  const [selectedDay, setSelectedDay] = React.useState<Date | undefined>(undefined)
  const [currentMonth, setCurrentMonth] = React.useState<Date | null>(null)
  const [today, setToday] = React.useState<Date | null>(null)
  const [isTimePickerOpen, setIsTimePickerOpen] = React.useState(false)
  const [pickerMode, setPickerMode] = React.useState<'hours' | 'minutes'>('hours')
  const [tempTime, setTempTime] = React.useState({ hours12: 12, period: 'AM' as 'AM' | 'PM', minutes: 0 })

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const now = new Date()
      setToday(startOfDay(now))
      setCurrentMonth(now)
    }
  }, [])

  const stats = React.useMemo(() => {
    if (!today || resetDates.length === 0) return { highest: 0, previous: 0 }
    
    const uniqueTimestamps = Array.from(new Set(
      resetDates.map(d => startOfDay(d).getTime())
    )).sort((a, b) => a - b)

    if (uniqueTimestamps.length === 0) return { highest: 0, previous: 0 }

    const uniqueEvents = uniqueTimestamps.map(t => new Date(t))

    const streaks: number[] = []
    for (let i = 0; i < uniqueEvents.length - 1; i++) {
      const diff = differenceInDays(uniqueEvents[i + 1], uniqueEvents[i])
      streaks.push(Math.max(0, diff))
    }
    
    const latestReset = uniqueEvents[uniqueEvents.length - 1]
    const isTodayRelapse = resetDates.some(rd => isSameDay(startOfDay(rd), today))
    const currentStreak = isTodayRelapse ? 0 : differenceInDays(today, latestReset)
    
    const allStreaks = [...streaks, currentStreak]
    const highest = allStreaks.length > 0 ? Math.max(...allStreaks) : 0
    const previous = streaks.length > 0 ? streaks[streaks.length - 1] : 0
    
    return { highest, previous }
  }, [resetDates, today])

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
    selectedRelapse: (date: Date) => selectedDay && isSameDay(date, selectedDay) && isRelapse(date) && isDateInCurrentMonth(date),
    selectedClean: (date: Date) => selectedDay && isSameDay(date, selectedDay) && isClean(date) && isDateInCurrentMonth(date),
    outsideRelapse: (date: Date) => !isDateInCurrentMonth(date) && isRelapse(date),
    outsideClean: (date: Date) => !isDateInCurrentMonth(date) && isClean(date),
    selectedOutsideRelapse: (date: Date) => selectedDay && isSameDay(date, selectedDay) && !isDateInCurrentMonth(date) && (isRelapse(date) || isClean(date))
  }), [isDateInCurrentMonth, isRelapse, isClean, selectedDay])

  const handleOpenTimePicker = () => {
    if (!selectedDay) return
    const record = resetDates.find(d => isSameDay(d, selectedDay)) || selectedDay
    const h24 = record.getHours()
    const period = h24 >= 12 ? 'PM' : 'AM'
    let h12 = h24 % 12
    if (h12 === 0) h12 = 12
    
    setTempTime({ hours12: h12, period, minutes: record.getMinutes() })
    setPickerMode('hours')
    setIsTimePickerOpen(true)
  }

  const handleSaveTime = () => {
    if (!selectedDay) return
    const oldRecord = resetDates.find(d => isSameDay(d, selectedDay)) || selectedDay
    
    let h24 = tempTime.hours12 % 12
    if (tempTime.period === 'PM') h24 += 12
    
    const newDate = setMinutes(setHours(selectedDay, h24), tempTime.minutes)
    onUpdateTime(oldRecord, newDate)
    setIsTimePickerOpen(false)
  }

  const isAr = language === 'ar'
  if (!today || !currentMonth) return null

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/50 dark:bg-slate-950/50" dir={isAr ? 'rtl' : 'ltr'}>
      <header className="w-full h-14 border-b flex items-center justify-center px-6 bg-white dark:bg-slate-900 shrink-0 z-10 shadow-sm">
        <h2 className="text-lg font-black uppercase tracking-tight">{isAr ? "سجل الرحلة" : "Journey Log"}</h2>
      </header>

      <main className="flex-1 flex flex-col items-center justify-between p-4 overflow-hidden">
        <div className="w-full max-w-[380px] grid grid-cols-2 gap-3 mb-2 shrink-0">
          <div className="bg-amber-500/5 border-2 border-amber-500/20 rounded-2xl p-2 flex flex-col items-center justify-center text-center">
            <Trophy className="h-4 w-4 text-amber-500 mb-1" />
            <span className="text-2xl font-black text-amber-600 tabular-nums leading-none">{stats.highest}</span>
            <span className="text-[7px] font-black uppercase tracking-widest opacity-60 mt-1">{isAr ? "أعلى رقم" : "Highest"}</span>
          </div>
          <div className="bg-slate-500/5 border-2 border-slate-500/20 rounded-2xl p-2 flex flex-col items-center justify-center text-center">
            <HistoryIcon className="h-4 w-4 text-slate-500 mb-1" />
            <span className="text-2xl font-black text-slate-600 tabular-nums leading-none">{stats.previous}</span>
            <span className="text-[7px] font-black uppercase tracking-widest opacity-60 mt-1">{isAr ? "السابق" : "Previous"}</span>
          </div>
        </div>

        <div className="flex-1 w-full max-w-[420px] flex items-center justify-center overflow-hidden">
          <div className="w-full h-fit bg-white dark:bg-slate-900 rounded-[2rem] border shadow-xl p-2 flex flex-col items-center">
            <Calendar 
              mode="single" 
              selected={selectedDay}
              onSelect={setSelectedDay}
              month={currentMonth}
              onMonthChange={(m) => {
                 const now = new Date();
                 if (birthDate && isBefore(m, startOfDay(new Date(birthDate.getFullYear(), birthDate.getMonth(), 1)))) {
                   return;
                 }
                 if (m.getFullYear() > now.getFullYear() || (m.getFullYear() === now.getFullYear() && m.getMonth() > now.getMonth())) {
                   return;
                 }
                 setCurrentMonth(m);
              }}
              disabled={[{ after: today }, ...(birthDate ? [{ before: birthDate }] : [])]} 
              fromDate={birthDate || undefined}
              toMonth={today}
              modifiers={modifiers as any}
              modifiersClassNames={MODIFIERS_STYLES}
              className="scale-[0.85] origin-top"
              showOutsideDays={true}
            />
          </div>
        </div>

        <div className="w-full max-w-[420px] shrink-0 h-14 mt-4 flex gap-2">
          {selectedDay && (
            isRelapse(selectedDay) ? (
              <>
                <Button onClick={() => onRemoveReset(selectedDay)} variant="outline" className="flex-1 h-full rounded-2xl font-black border-2 border-red-500 text-red-500 shadow-sm">
                  <Trash2 className="ml-2 h-5 w-5" /> {isAr ? "حذف" : "Delete"}
                </Button>
                <Button onClick={handleOpenTimePicker} variant="secondary" className="flex-1 h-full rounded-2xl font-black shadow-sm bg-slate-100 text-slate-700">
                  <Clock className="ml-2 h-5 w-5" /> {isAr ? "تعديل الوقت" : "Edit Time"}
                </Button>
              </>
            ) : (
              <Button onClick={() => onReset(selectedDay)} variant="destructive" className="flex-1 h-full rounded-2xl font-black bg-red-500 shadow-lg active:scale-95 transition-all">
                <AlertCircle className="ml-2 h-6 w-6" /> {isAr ? "تسجيل انتكاسة" : "Mark Relapse"}
              </Button>
            )
          )}
        </div>
      </main>

      <Dialog open={isTimePickerOpen} onOpenChange={setIsTimePickerOpen}>
        <DialogContent className="rounded-[2.5rem] p-4 max-w-[320px] z-[120]">
          <DialogHeader><DialogTitle className="text-center font-black">{isAr ? "تعديل الوقت" : "Edit Time"}</DialogTitle></DialogHeader>
          <div className="py-2">
            <CircularTimePicker 
              mode={pickerMode} 
              value={pickerMode === 'hours' ? tempTime.hours12 : tempTime.minutes}
              period={tempTime.period}
              language={language}
              onChange={(v) => setTempTime(prev => ({ ...prev, [pickerMode === 'hours' ? 'hours12' : 'minutes']: v }))}
              onPeriodChange={(p) => setTempTime(prev => ({ ...prev, period: p }))}
            />
          </div>
          <div className="flex gap-2">
             {pickerMode === 'hours' ? (
               <>
                 <Button variant="outline" onClick={() => setIsTimePickerOpen(false)} className="flex-1 rounded-xl h-10 font-black">{isAr ? "إلغاء" : "Cancel"}</Button>
                 <Button onClick={() => setPickerMode('minutes')} className="flex-1 rounded-xl h-10 font-black bg-primary">{isAr ? "التالي" : "Next"}</Button>
               </>
             ) : (
               <>
                 <Button variant="outline" onClick={() => setPickerMode('hours')} className="flex-1 rounded-xl h-10 font-black">{isAr ? "السابق" : "Back"}</Button>
                 <Button onClick={handleSaveTime} className="flex-1 rounded-xl h-10 font-black bg-primary">{isAr ? "حفظ" : "Save"}</Button>
               </>
             )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
})
JourneyLog.displayName = "JourneyLog"
