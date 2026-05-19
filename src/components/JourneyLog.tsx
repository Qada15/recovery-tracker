
"use client"

import * as React from "react"
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react"
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
}

export function JourneyLog({ isOpen, onClose, startDate, resetDates, habitName, accentColor }: JourneyLogProps) {
  if (!isOpen) return null

  const today = new Date()

  // منطق الملقبات (Modifiers): الانتكاسة (أحمر) والالتزام (أخضر)
  const modifiers = {
    relapse: (date: Date) => {
      const d = startOfDay(date)
      const start = startOfDay(startDate)
      // يعتبر اليوم انتكاسة إذا كان هو يوم البداية (يوم التصفير) أو مسجلاً في قائمة الانتكاسات
      const isStartDay = isSameDay(d, start)
      const isRecordedRelapse = resetDates.some(rd => isSameDay(startOfDay(rd), d))
      return isStartDay || isRecordedRelapse
    },
    clean: (date: Date) => {
      const d = startOfDay(date)
      const start = startOfDay(startDate)
      const now = startOfDay(today)
      
      // اليوم النظيف يبدأ بـعـد يوم البداية وحتى اليوم الحالي
      const isAfterStart = isAfter(d, start)
      const isBeforeOrEqualToday = isBefore(d, now) || isSameDay(d, now)
      
      // إذا كان مسجلاً كانتكاسة، الأحمر له الأولوية
      const isRelapse = resetDates.some(rd => isSameDay(startOfDay(rd), d))
      
      return isAfterStart && isBeforeOrEqualToday && !isRelapse
    }
  }

  const modifiersClassNames = {
    relapse: "bg-red-500 text-white hover:bg-red-600 rounded-full font-black shadow-inner scale-110 z-10",
    clean: "bg-emerald-500 text-white hover:bg-emerald-600 rounded-full font-black opacity-90"
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300 overflow-hidden select-none">
      {/* Header */}
      <header className="w-full h-14 border-b flex items-center px-4 bg-white/80 backdrop-blur-md shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose} className="mr-2 rounded-full h-10 w-10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-sm font-black uppercase tracking-tighter">سجل الالتزام</h2>
      </header>

      {/* Main Content - No Scroll */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="text-center mb-6 shrink-0">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">{habitName}</p>
          <div className="flex items-center justify-center space-x-2">
            <CalendarIcon className="h-4 w-4" style={{ color: accentColor }} />
            <span className="text-sm font-black opacity-70">بداية الالتزام: {format(startDate, 'yyyy/MM/dd')}</span>
          </div>
        </div>

        {/* Calendar Box */}
        <div className="w-full max-w-[360px] bg-white rounded-[2.5rem] border shadow-2xl p-4 flex items-center justify-center overflow-hidden">
          <Calendar 
            mode="single" 
            className="w-full"
            numberOfMonths={1}
            disabled={{ after: today }} 
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
          />
        </div>
        
        {/* Legend */}
        <div className="mt-8 flex flex-col space-y-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-sm" />
            <span className="text-[11px] font-black uppercase tracking-tight opacity-60">أيام الالتزام (نظيفة)</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm" />
            <span className="text-[11px] font-black uppercase tracking-tight opacity-60">أيام التصفير / الانتكاسة</span>
          </div>
        </div>
      </main>

      {/* Footer Button */}
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
