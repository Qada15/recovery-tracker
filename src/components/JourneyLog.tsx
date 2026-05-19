
"use client"

import * as React from "react"
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { format, isSameDay } from "date-fns"

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

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300 overflow-hidden select-none">
      <header className="w-full h-14 border-b flex items-center px-4 bg-white/80 backdrop-blur-md shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose} className="mr-2 rounded-full h-10 w-10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-sm font-black uppercase tracking-tighter">سجل الالتزام</h2>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="text-center mb-8 shrink-0">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">{habitName}</p>
          <div className="flex items-center justify-center space-x-2">
            <CalendarIcon className="h-4 w-4" style={{ color: accentColor }} />
            <span className="text-sm font-black opacity-70">بداية الرحلة: {format(startDate, 'yyyy/MM/dd')}</span>
          </div>
        </div>

        <div className="w-full max-w-[360px] bg-white rounded-[2.5rem] border shadow-2xl p-4 flex items-center justify-center overflow-hidden">
          <Calendar 
            mode="single" 
            selected={startDate} 
            className="w-full"
            numberOfMonths={1}
            modifiers={{
              relapse: resetDates
            }}
            modifiersClassNames={{
              relapse: "bg-red-500 text-white hover:bg-red-600 rounded-full font-black shadow-inner"
            }}
          />
        </div>
        
        <div className="mt-6 flex items-center space-x-2 opacity-50">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-[10px] font-black uppercase">أيام الانتكاسة (تم التصفير)</span>
        </div>
      </main>

      <div className="p-6 border-t bg-white/80 backdrop-blur-md shrink-0">
        <Button 
          onClick={onClose} 
          className="w-full h-14 rounded-2xl text-base font-black shadow-lg"
          style={{ backgroundColor: accentColor }}
        >
          العودة للعداد
        </Button>
      </div>
    </div>
  )
}
