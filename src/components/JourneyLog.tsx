"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Flame, Trash2, Settings2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { format, isAfter, isBefore, isSameDay, startOfDay, setHours, setMinutes, parseISO } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CircularTimePicker } from "./CircularTimePicker"

interface JourneyLogProps {
  isOpen: boolean
  onClose: () => void
  startDate: Date
  resetDates: Date[]
  habitName: string
  accentColor: string
  onReset: (date: Date) => void
  onRemoveReset: (date: Date) => void
  onUrge: (date: Date) => void
  language: 'ar' | 'en'
}

export function JourneyLog({ 
  isOpen, 
  onClose, 
  startDate, 
  resetDates, 
  habitName, 
  accentColor,
  onReset,
  onRemoveReset,
  onUrge,
  language
}: JourneyLogProps) {
  const [selectedDay, setSelectedDay] = React.useState<Date | undefined>(undefined)
  const [showTimePicker, setShowTimePicker] = React.useState(false)
  const [pickerMode, setPickerMode] = React.useState<'hours' | 'minutes'>('hours')
  const [tempHour, setTempHour] = React.useState(12)
  const [tempMinute, setTempMinute] = React.useState(0)
  
  if (!isOpen) return null

  const isAr = language === 'ar'
  const today = startOfDay(new Date())
  const start = startOfDay(startDate)

  const getResetForDay = (date: Date) => {
    return resetDates.find(rd => isSameDay(startOfDay(rd), startOfDay(date)))
  }

  const isRelapse = (date: Date) => !!getResetForDay(date) || isSameDay(startOfDay(date), start)

  const isClean = (date: Date) => {
    const d = startOfDay(date)
    return isAfter(d, start) && (isBefore(d, today) || isSameDay(d, today)) && !isRelapse(d)
  }

  const handleSelect = (date: Date | undefined) => {
    if (!date || isClean(date)) {
      setSelectedDay(undefined)
      return
    }
    setSelectedDay(date)
  }

  const handleAdjustTime = () => {
    if (!selectedDay) return
    const existingReset = getResetForDay(selectedDay) || selectedDay
    setTempHour(existingReset.getHours())
    setTempMinute(existingReset.getMinutes())
    setPickerMode('hours')
    setShowTimePicker(true)
  }

  const saveAdjustedTime = () => {
    if (!selectedDay) return
    const newDateTime = setMinutes(setHours(startOfDay(selectedDay), tempHour), tempMinute)
    onReset(newDateTime)
    setShowTimePicker(false)
  }

  const existingReset = selectedDay ? getResetForDay(selectedDay) : null

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300 overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      <header className="w-full h-14 border-b flex items-center px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-10 w-10">
          {isAr ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
        </Button>
        <h2 className="text-sm font-black uppercase tracking-tighter mx-4">{isAr ? "سجل الالتزام" : "Commitment Log"}</h2>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="text-center mb-2 shrink-0">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">{habitName}</p>
          <div className="flex items-center justify-center gap-2">
            <CalendarIcon className="h-3 w-3" style={{ color: accentColor }} />
            <span className="text-[11px] font-black opacity-70">
              {isAr ? "بداية الالتزام" : "Journey Start"}: {format(startDate, 'yyyy/MM/dd HH:mm')}
            </span>
          </div>
        </div>

        <div className="w-full max-w-[340px] bg-white dark:bg-slate-900 rounded-[2rem] border shadow-2xl p-2 flex items-center justify-center shrink-0">
          <Calendar 
            mode="single" 
            selected={selectedDay}
            onSelect={handleSelect}
            disabled={[{ after: today }, (date) => isClean(date)]} 
            modifiers={{ relapse: isRelapse, clean: isClean }}
            modifiersClassNames={{
              relapse: "bg-red-500 text-white rounded-full font-black scale-110",
              clean: "bg-emerald-500 text-white rounded-full font-black opacity-90"
            }}
          />
        </div>
        
        <div className="mt-4 flex gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full" />
            <span className="text-[9px] font-black uppercase opacity-60">{isAr ? "أيام نظيفة" : "Clean Days"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-[9px] font-black uppercase opacity-60">{isAr ? "انتكاسة" : "Relapse"}</span>
          </div>
        </div>

        <div className="mt-6 flex gap-3 w-full max-w-[320px] shrink-0 h-14">
          {selectedDay && (
            existingReset ? (
              <>
                <Button 
                  onClick={() => { onRemoveReset(selectedDay); setSelectedDay(undefined); }} 
                  variant="outline" 
                  className="flex-1 h-12 rounded-2xl font-black border-2 border-red-500 text-red-500 animate-in zoom-in-95"
                >
                  <X className="ml-2 h-4 w-4" /> {isAr ? "حذف الحدث" : "Delete Event"}
                </Button>
                <Button 
                  onClick={handleAdjustTime} 
                  className="w-14 h-12 rounded-2xl font-black bg-slate-200 text-slate-700 animate-in zoom-in-95"
                >
                  <Settings2 className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => { onUrge(selectedDay); setSelectedDay(undefined); }} className="flex-1 h-12 rounded-2xl font-black bg-orange-500 hover:bg-orange-600 text-white shadow-lg animate-in zoom-in-95">
                  <Flame className="ml-2 h-4 w-4" /> {isAr ? "رغبة" : "Urge"}
                </Button>
                <Button onClick={() => { onReset(selectedDay); setSelectedDay(undefined); }} variant="destructive" className="flex-1 h-12 rounded-2xl font-black shadow-lg animate-in zoom-in-95">
                  <Trash2 className="ml-2 h-4 w-4" /> {isAr ? "انتكاسة" : "Relapse"}
                </Button>
              </>
            )
          )}
        </div>
      </main>

      <div className="p-6 border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
        <Button onClick={onClose} className="w-full h-14 rounded-2xl text-base font-black shadow-lg text-white" style={{ backgroundColor: accentColor }}>
          {isAr ? "العودة للعداد" : "Back to Timer"}
        </Button>
      </div>

      <Dialog open={showTimePicker} onOpenChange={setShowTimePicker}>
        <DialogContent className="rounded-[2.5rem] p-6 max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-center font-black">
              {pickerMode === 'hours' ? (isAr ? "ضبط الساعة" : "Set Hour") : (isAr ? "ضبط الدقيقة" : "Set Minute")}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center">
            <CircularTimePicker 
              mode={pickerMode} 
              value={pickerMode === 'hours' ? tempHour : tempMinute} 
              onChange={pickerMode === 'hours' ? setTempHour : setTempMinute} 
              onComplete={() => {
                if (pickerMode === 'hours') setPickerMode('minutes')
                else saveAdjustedTime()
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
