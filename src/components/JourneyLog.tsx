"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Flame, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { format, isAfter, isBefore, isSameDay, startOfDay } from "date-fns"

interface JourneyLogProps {
  isOpen: boolean
  onClose: () => void
  startDate: Date
  resetDates: Date[]
  habitName: string
  accentColor: string
  onReset: (date?: Date) => void
  onUrge: (date?: Date) => void
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
  onUrge,
  language
}: JourneyLogProps) {
  const [selectedDay, setSelectedDay] = React.useState<Date | undefined>(undefined)
  
  if (!isOpen) return null

  const isAr = language === 'ar'
  const today = startOfDay(new Date())
  const start = startOfDay(startDate)

  const isRelapse = (date: Date) => {
    const d = startOfDay(date)
    return resetDates.some(rd => isSameDay(startOfDay(rd), d)) || isSameDay(d, start)
  }

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
              {isAr ? "بداية الالتزام" : "Journey Start"}: {format(startDate, 'yyyy/MM/dd')}
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
            <>
              <Button onClick={() => { onUrge(selectedDay); setSelectedDay(undefined); }} className="flex-1 h-12 rounded-2xl font-black bg-orange-500 hover:bg-orange-600 text-white shadow-lg animate-in zoom-in-95">
                <Flame className="ml-2 h-4 w-4" /> {isAr ? "رغبة" : "Urge"}
              </Button>
              <Button onClick={() => { onReset(selectedDay); setSelectedDay(undefined); }} variant="destructive" className="flex-1 h-12 rounded-2xl font-black shadow-lg animate-in zoom-in-95">
                <Trash2 className="ml-2 h-4 w-4" /> {isAr ? "انتكاسة" : "Relapse"}
              </Button>
            </>
          )}
        </div>
      </main>

      <div className="p-6 border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
        <Button onClick={onClose} className="w-full h-14 rounded-2xl text-base font-black shadow-lg text-white" style={{ backgroundColor: accentColor }}>
          {isAr ? "العودة للعداد" : "Back to Timer"}
        </Button>
      </div>
    </div>
  )
}
