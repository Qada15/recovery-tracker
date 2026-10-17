"use client"

import * as React from "react"
import { Trash2, Settings2, ChevronLeft, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { startOfDay, isBefore, isSameDay, max, setHours, setMinutes, isAfter } from "date-fns"
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
    if (isOpen) {
      const now = new Date()
      setToday(startOfDay(now))
      setCurrentMonth(now)
    }
  }, [isOpen])

  const latestResetDate = React.useMemo(() => {
    if (resetDates.length === 0) return startOfDay(startDate)
    return max(resetDates.map(d => startOfDay(d)))
  }, [resetDates, startDate])

  const modifiers = React.useMemo(() => ({
    relapse: resetDates,
    clean: (date: Date) => {
      if (!today) return false
      const day = startOfDay(date)
      // اليوم نظيف إذا كان بعد آخر انتكاسة وقبل اليوم أو هو اليوم
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

  if (!isOpen || !today || !currentMonth) return null

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300 overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      <header className="w-full h-14 border-b flex items-center justify-between px-4 bg-white dark:bg-slate-900 shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <ChevronLeft className={`h-6 w-6 ${isAr ? 'rotate-180' : ''}`} />
        </Button>
        <h2 className="text-sm font-black uppercase tracking-tighter">{isAr ? "سجل الالتزام" : "Commitment Log"}</h2>
        <div className="w-10" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-[340px] bg-white dark:bg-slate-900 rounded-[2.5rem] border shadow-2xl p-2 flex flex-col items-center shrink-0">
          <div className="scale-90 w-full">
            <Calendar 
              mode="single" 
              selected={selectedDay}
              onSelect={setSelectedDay}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              disabled={[{ after: today }]} 
              modifiers={modifiers}
              modifiersClassNames={MODIFIERS_STYLES}
            />
          </div>

          <div className="flex gap-4 py-2 border-t w-full justify-center mt-1 opacity-60">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[8px] font-black uppercase">{isAr ? "يوم نظيف" : "Clean"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-[8px] font-black uppercase">{isAr ? "انتكاسة" : "Relapse"}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3 w-full max-w-[320px] shrink-0 h-12">
          {selectedDay && (
            getResetForDay(selectedDay) ? (
              <>
                <Button onClick={() => onRemoveReset(selectedDay)} variant="outline" className="flex-1 h-12 rounded-2xl font-black border-2 border-red-500 text-red-500">
                  <Trash2 className="ml-2 h-4 w-4" /> {isAr ? "حذف" : "Delete"}
                </Button>
                <Button onClick={handleAdjustTime} className="w-12 h-12 rounded-2xl font-black bg-slate-200 text-slate-700">
                  <Settings2 className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button onClick={() => onReset(selectedDay)} variant="destructive" className="flex-1 h-12 rounded-2xl font-black bg-red-500">
                <AlertCircle className="ml-2 h-4 w-4" /> {isAr ? "انتكاسة" : "Relapse"}
              </Button>
            )
          )}
        </div>
      </main>

      <Dialog open={showTimePicker} onOpenChange={setShowTimePicker}>
        <DialogContent className="rounded-[2.5rem] p-6 max-w-[420px] z-[200]">
          <DialogHeader><DialogTitle className="text-center font-black">{isAr ? "ضبط الوقت" : "Set Time"}</DialogTitle></DialogHeader>
          <CircularTimePicker 
            mode={pickerMode} 
            value={pickerMode === 'hours' ? tempHour : tempMinute} 
            onChange={pickerMode === 'hours' ? setTempHour : setTempMinute} 
            onComplete={() => pickerMode === 'hours' ? setPickerMode('minutes') : saveAdjustedTime()} 
          />
          {pickerMode === 'minutes' && (
             <Button onClick={saveAdjustedTime} className="w-full mt-4 h-12 rounded-xl font-black">تأكيد الوقت</Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
})
JourneyLog.displayName = "JourneyLog"
