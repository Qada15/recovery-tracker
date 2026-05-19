
"use client"

import * as React from "react"
import { ArrowLeft, Calendar as CalendarIcon, Flame, Trash2 } from "lucide-react"
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
  onReset: () => void
  onUrge: () => void
}

export function JourneyLog({ 
  isOpen, 
  onClose, 
  startDate, 
  resetDates, 
  habitName, 
  accentColor,
  onReset,
  onUrge
}: JourneyLogProps) {
  if (!isOpen) return null

  const today = new Date()

  const modifiers = {
    relapse: (date: Date) => {
      const d = startOfDay(date)
      const start = startOfDay(startDate)
      const isStartDay = isSameDay(d, start)
      const isRecordedRelapse = resetDates.some(rd => isSameDay(startOfDay(rd), d))
      return isStartDay || isRecordedRelapse
    },
    clean: (date: Date) => {
      const d = startOfDay(date)
      const start = startOfDay(startDate)
      const now = startOfDay(today)
      
      const isStrictlyAfterStart = isAfter(d, start)
      const isBeforeOrEqualToday = isBefore(d, now) || isSameDay(d, now)
      
      const isRelapseDate = isSameDay(d, start) || resetDates.some(rd => isSameDay(startOfDay(rd), d))
      
      return isStrictlyAfterStart && isBeforeOrEqualToday && !isRelapseDate
    }
  }

  const modifiersClassNames = {
    relapse: "bg-red-500 text-white hover:bg-red-600 rounded-full font-black shadow-inner scale-110 z-10",
    clean: "bg-emerald-500 text-white hover:bg-emerald-600 rounded-full font-black opacity-90"
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300 overflow-hidden select-none">
      <header className="w-full h-14 border-b flex items-center px-4 bg-white/80 backdrop-blur-md shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose} className="mr-2 rounded-full h-10 w-10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-sm font-black uppercase tracking-tighter">سجل الالتزام</h2>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="text-center mb-4 shrink-0">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">{habitName}</p>
          <div className="flex items-center justify-center space-x-2">
            <CalendarIcon className="h-3 w-3" style={{ color: accentColor }} />
            <span className="text-[11px] font-black opacity-70">بداية الالتزام: {format(startDate, 'yyyy/MM/dd')}</span>
          </div>
        </div>

        <div className="w-full max-w-[340px] bg-white rounded-[2rem] border shadow-2xl p-2 flex items-center justify-center overflow-hidden shrink-0">
          <Calendar 
            mode="single" 
            className="w-full"
            numberOfMonths={1}
            disabled={{ after: today }} 
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
          />
        </div>
        
        <div className="mt-4 flex gap-4 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm" />
            <span className="text-[9px] font-black uppercase tracking-tight opacity-60">أيام نظيفة</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm" />
            <span className="text-[9px] font-black uppercase tracking-tight opacity-60">تصفير / انتكاسة</span>
          </div>
        </div>

        {/* Action Buttons inside the Log */}
        <div className="mt-6 flex gap-3 w-full max-w-[320px] shrink-0">
          <Button onClick={onUrge} className="flex-1 h-12 rounded-2xl font-black bg-orange-500 hover:bg-orange-600 text-white shadow-lg">
            <Flame className="ml-2 h-4 w-4" /> رغبة
          </Button>
          <Button onClick={onReset} variant="destructive" className="flex-1 h-12 rounded-2xl font-black shadow-lg">
            <Trash2 className="ml-2 h-4 w-4" /> انتكاسة
          </Button>
        </div>
      </main>

      <div className="p-6 border-t bg-white/80 backdrop-blur-md shrink-0">
        <Button 
          onClick={onClose} 
          className="w-full h-14 rounded-2xl text-base font-black shadow-lg text-white"
          style={{ backgroundColor: accentColor }}
        >
          العودة للعداد
        </Button>
      </div>
    </div>
  )
}
