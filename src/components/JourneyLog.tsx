
"use client"

import * as React from "react"
import { Flame, Trash2, Settings2, ChevronLeft, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { startOfDay, isAfter, isBefore, isSameDay, max, setHours, setMinutes } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CircularTimePicker } from "./CircularTimePicker"

const MODIFIERS_STYLES = {
  relapse: "bg-red-500 text-white rounded-full font-black !opacity-100",
  clean: "bg-emerald-500 text-white rounded-full font-black !opacity-100",
  urge: "urge-dot"
}

interface JourneyLogProps {
  isOpen: boolean
  onClose: () => void
  startDate: Date
  resetDates: Date[]
  urgeDates: Date[]
  habitName: string
  accentColor: string
  onReset: (date: Date) => void
  onRemoveReset: (date: Date) => void
  onUrge: (date: Date) => void
  onRemoveUrge: (date: Date) => void
  language: 'ar' | 'en'
}

export const JourneyLog = React.memo(({ 
  isOpen, 
  onClose, 
  startDate, 
  resetDates, 
  urgeDates,
  onReset,
  onRemoveReset,
  onUrge,
  onRemoveUrge,
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

  const isAr = language === 'ar'

  const latestResetDate = React.useMemo(() => {
    return resetDates.length === 0 ? startOfDay(startDate) : max(resetDates.map(d => startOfDay(d)));
  }, [resetDates, startDate]);

  const isRelapseMatcher = React.useMemo(() => resetDates, [resetDates])
  const isUrgeMatcher = React.useMemo(() => urgeDates, [urgeDates])
  const isCleanMatcher = React.useCallback((date: Date) => {
    if (!today) return false;
    const d = startOfDay(date);
    return isAfter(d, latestResetDate) && (isBefore(d, today) || isSameDay(d, today));
  }, [today, latestResetDate]);

  const modifiers = React.useMemo(() => ({
    relapse: isRelapseMatcher,
    urge: isUrgeMatcher,
    clean: isCleanMatcher
  }), [isRelapseMatcher, isUrgeMatcher, isCleanMatcher])

  const getResetForDay = React.useCallback((date: Date) => {
    return resetDates.find(rd => isSameDay(startOfDay(rd), startOfDay(date)))
  }, [resetDates])

  const getUrgeForDay = React.useCallback((date: Date) => {
    return urgeDates.find(ud => isSameDay(startOfDay(ud), startOfDay(date)))
  }, [urgeDates])

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
        <div className="w-full max-w-[340px] bg-white dark:bg-slate-900 rounded-[2.5rem] border shadow-2xl p-2 flex flex-col items-center">
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

        <div className="mt-8 flex gap-3 w-full max-w-[320px] shrink-0 h-14">
          {selectedDay && (
            getResetForDay(selectedDay) ? (
              <>
                <Button onClick={() => onRemoveReset(selectedDay)} variant="outline" className="flex-1 h-12 rounded-2xl font-black border-2 border-red-500 text-red-500">
                  <Trash2 className="ml-2 h-4 w-4" /> {isAr ? "حذف" : "Delete"}
                </Button>
                <Button onClick={handleAdjustTime} className="w-14 h-12 rounded-2xl font-black bg-slate-200 text-slate-700">
                  <Settings2 className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                {getUrgeForDay(selectedDay) ? (
                  <Button onClick={() => onRemoveUrge(selectedDay)} variant="outline" className="flex-1 h-12 rounded-2xl font-black border-2 border-orange-500 text-orange-500">
                    <X className="ml-2 h-4 w-4" /> {isAr ? "حذف الرغبة" : "Clear Urge"}
                  </Button>
                ) : (
                  <Button onClick={() => onUrge(selectedDay)} disabled={resetDates.some(d => isSameDay(d, selectedDay))} className="flex-1 h-12 rounded-2xl font-black bg-orange-500 text-white">
                    <Flame className="ml-2 h-4 w-4" /> {isAr ? "رغبة" : "Urge"}
                  </Button>
                )}
                <Button onClick={() => onReset(selectedDay)} variant="destructive" className="flex-1 h-12 rounded-2xl font-black bg-red-500">
                  <AlertCircle className="ml-2 h-4 w-4" /> {isAr ? "انتكاسة" : "Relapse"}
                </Button>
              </>
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
