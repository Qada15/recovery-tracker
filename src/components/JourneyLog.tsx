
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

  // حساب الإحصائيات من كامل السجل التاريخي (منذ البداية حتى لو كانت في 1998)
  const stats = React.useMemo(() => {
    if (!today) return { highest: 0, previous: 0 }
    
    // تاريخ البداية الفعلي هو إما startDate أو أقدم انتكاسة مسجلة
    const allDates = [startOfDay(startDate), ...resetDates.map(d => startOfDay(d))].sort((a, b) => a.getTime() - b.getTime())
    const history = allDates
    
    const streaks: number[] = []
    
    // حساب الفترات بين الانتكاسات
    for (let i = 0; i < history.length - 1; i++) {
      const diff = differenceInDays(history[i + 1], history[i])
      // الفترة النظيفة هي الأيام بين تاريخين، أيام الانتكاسة نفسها تعتبر 0
      streaks.push(Math.max(0, diff - 1))
    }
    
    // الفترة الحالية (منذ آخر انتكاسة حتى اليوم)
    const latestReset = history[history.length - 1]
    const isTodayRelapse = resetDates.some(rd => isSameDay(startOfDay(rd), today))
    const currentStreak = isTodayRelapse ? 0 : differenceInDays(today, latestReset)
    
    // دمج كافة الفترات
    const allStreaks = [...streaks, currentStreak]
    const highest = allStreaks.length > 0 ? Math.max(...allStreaks) : 0
    const previous = streaks.length > 0 ? streaks[streaks.length - 1] : 0
    
    return { highest, previous }
  }, [resetDates, startDate, today])

  const latestResetDate = React.useMemo(() => {
    if (resetDates.length === 0) return startOfDay(startDate)
    return max(resetDates.map(d => startOfDay(d)))
  }, [resetDates, startDate])

  // دالة للتحقق مما إذا كان التاريخ ينتمي للشهر المعروض حالياً
  const isDateInCurrentMonth = React.useCallback((date: Date) => {
    if (!currentMonth) return false
    return date.getMonth() === currentMonth.getMonth() && 
           date.getFullYear() === currentMonth.getFullYear()
  }, [currentMonth])

  // منطق الموديفايرز: لا تظهر أي ألوان للأيام التي لا تنتمي للشهر الحالي (Outside Days)
  const modifiers = React.useMemo(() => ({
    relapse: (date: Date) => {
      // حجب الانتكاسة لو كان اليوم باهتاً (خارج الشهر الحالي)
      if (!isDateInCurrentMonth(date)) return false
      return resetDates.some(rd => isSameDay(startOfDay(rd), startOfDay(date)))
    },
    clean: (date: Date) => {
      // حجب اليوم النظيف لو كان اليوم باهتاً
      if (!today || !isDateInCurrentMonth(date)) return false
      
      const day = startOfDay(date)
      const isRelapse = resetDates.some(rd => isSameDay(startOfDay(rd), day))
      return !isRelapse && isAfter(day, latestResetDate) && (isBefore(day, today) || isSameDay(day, today))
    }
  }), [resetDates, latestResetDate, today, isDateInCurrentMonth])

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
      className={`fixed inset-0 z-[100] bg-background flex flex-col transition-all duration-300 pointer-events-auto overflow-hidden ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`} 
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <header className="w-full h-14 border-b flex items-center justify-between px-6 bg-white dark:bg-slate-900 shrink-0 shadow-sm">
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-10 w-10">
          <ChevronLeft className={`h-8 w-8 ${isAr ? 'rotate-180' : ''}`} />
        </Button>
        <h2 className="text-xl font-black uppercase tracking-tight">{isAr ? "سجل الرحلة" : "Journey Log"}</h2>
        <div className="w-10" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-between p-4 overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
        {/* قسم الإحصائيات - تم تصغيره ليناسب الشاشة الواحدة */}
        <div className="w-full max-w-[400px] grid grid-cols-2 gap-3 shrink-0">
          <div className="bg-amber-500/5 border-2 border-amber-500/20 rounded-[1.5rem] p-3 flex flex-col items-center justify-center text-center shadow-sm">
            <Trophy className="h-5 w-5 text-amber-500 mb-1" />
            <span className="text-4xl font-black text-amber-600 dark:text-amber-400 tabular-nums leading-none">{stats.highest}</span>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60 mt-1">{isAr ? "أعلى رقم تاريخي" : "Historical Best"}</span>
          </div>
          <div className="bg-slate-500/5 border-2 border-slate-500/20 rounded-[1.5rem] p-3 flex flex-col items-center justify-center text-center shadow-sm">
            <HistoryIcon className="h-5 w-5 text-slate-500 mb-1" />
            <span className="text-4xl font-black text-slate-600 dark:text-slate-400 tabular-nums leading-none">{stats.previous}</span>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60 mt-1">{isAr ? "الرقم السابق" : "Previous Streak"}</span>
          </div>
        </div>

        {/* قسم التقويم - ضبط الحجم ليتناسب مع حيز الشاشة */}
        <div className="flex-1 w-full max-w-[440px] flex items-center justify-center overflow-hidden">
          <div className="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl p-4 flex flex-col items-center justify-center overflow-hidden">
            <Calendar 
              mode="single" 
              selected={selectedDay}
              onSelect={setSelectedDay}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              disabled={[{ after: today }]} 
              modifiers={modifiers}
              modifiersClassNames={MODIFIERS_STYLES}
              className="scale-95 origin-center"
              showOutsideDays={true}
            />
            <div className="flex gap-6 py-2 border-t w-full justify-center mt-2 opacity-60">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-widest">{isAr ? "نظيف" : "Clean"}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-[9px] font-black uppercase tracking-widest">{isAr ? "انتكاسة" : "Relapse"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* شريط الإجراءات السفلي - ثابت ومحدد الحيز */}
        <div className="w-full max-w-[440px] shrink-0 h-16 flex gap-3 mt-2">
          {selectedDay && (
            getResetForDay(selectedDay) ? (
              <>
                <Button onClick={() => onRemoveReset(selectedDay)} variant="outline" className="flex-1 h-full rounded-2xl font-black border-2 border-red-500 text-red-500 text-lg shadow-sm">
                  <Trash2 className="ml-2 h-6 w-6" /> {isAr ? "حذف" : "Delete"}
                </Button>
                <Button onClick={handleAdjustTime} className="w-16 h-full rounded-2xl font-black bg-slate-200 text-slate-700 shadow-sm">
                  <Settings2 className="h-7 w-7" />
                </Button>
              </>
            ) : (
              <Button onClick={() => onReset(selectedDay)} variant="destructive" className="flex-1 h-full rounded-2xl font-black bg-red-500 text-lg shadow-lg active:scale-95 transition-all">
                <AlertCircle className="ml-2 h-7 w-7" /> {isAr ? "تسجيل انتكاسة" : "Mark Relapse"}
              </Button>
            )
          )}
        </div>
      </main>

      <Dialog open={showTimePicker} onOpenChange={setShowTimePicker}>
        <DialogContent className="rounded-[2.5rem] p-6 max-w-[340px] z-[200]">
          <DialogHeader><DialogTitle className="text-center font-black text-xl">{isAr ? "ضبط الوقت" : "Set Time"}</DialogTitle></DialogHeader>
          <div className="scale-90 flex justify-center">
            <CircularTimePicker 
              mode={pickerMode} 
              value={pickerMode === 'hours' ? tempHour : tempMinute} 
              onChange={pickerMode === 'hours' ? setTempHour : setTempMinute} 
              onComplete={() => pickerMode === 'hours' ? setPickerMode('minutes') : saveAdjustedTime()} 
            />
          </div>
          {pickerMode === 'minutes' && (
             <Button onClick={saveAdjustedTime} className="w-full mt-4 h-14 rounded-2xl font-black text-lg shadow-md">{isAr ? "تأكيد" : "Confirm"}</Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
})
JourneyLog.displayName = "JourneyLog"
