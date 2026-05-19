
"use client"

import * as React from "react"
import { ArrowLeft, Trophy, Flame, Target, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

interface JourneyLogProps {
  isOpen: boolean
  onClose: () => void
  startDate: Date
  habitName: string
  accentColor: string
}

export function JourneyLog({ isOpen, onClose, startDate, habitName, accentColor }: JourneyLogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300 overflow-hidden select-none">
      {/* Header - Fixed Height */}
      <header className="w-full h-14 border-b flex items-center px-4 bg-white/80 backdrop-blur-md shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose} className="mr-2 rounded-full h-10 w-10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-base font-black uppercase tracking-tighter">سجل الرحلة</h2>
      </header>

      {/* Content - No Scrolling */}
      <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden justify-between">
        
        {/* Habit Summary Card - Compressed */}
        <div 
          className="w-full p-5 rounded-[2rem] text-white shadow-lg flex flex-col justify-center shrink-0"
          style={{ backgroundColor: accentColor }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-black truncate">{habitName}</h3>
            <Trophy className="h-6 w-6 opacity-40" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">تاريخ الانطلاق</p>
            <p className="text-base font-black">{format(startDate, 'yyyy/MM/dd')}</p>
          </div>
        </div>

        {/* Stats Grid - Smaller Icons */}
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <div className="bg-white p-4 rounded-[1.5rem] border shadow-sm flex flex-col items-center text-center space-y-1">
            <div className="p-2 bg-orange-100 rounded-xl">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-[8px] font-black uppercase opacity-40">نشاط مستمر</p>
            <p className="text-base font-black">فعال</p>
          </div>
          <div className="bg-white p-4 rounded-[1.5rem] border shadow-sm flex flex-col items-center text-center space-y-1">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Target className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-[8px] font-black uppercase opacity-40">الهدف الحالي</p>
            <p className="text-base font-black">الثبات</p>
          </div>
        </div>

        {/* Calendar Section - Flexible but constrained */}
        <div className="flex-1 flex flex-col min-h-0 space-y-2">
          <div className="flex items-center space-x-2 px-2 shrink-0">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-black text-[10px] uppercase tracking-widest opacity-60">تقويم الالتزام</h4>
          </div>
          <div className="flex-1 bg-white rounded-[2rem] border shadow-md p-2 overflow-hidden flex items-center justify-center">
            <div className="w-full max-w-[300px]">
              <Calendar 
                mode="single" 
                selected={startDate} 
                className="w-full"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Action - Fixed Height */}
      <div className="p-4 border-t bg-white/80 backdrop-blur-md shrink-0">
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
