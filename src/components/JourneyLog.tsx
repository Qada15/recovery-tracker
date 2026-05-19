
"use client"

import * as React from "react"
import { ArrowLeft, Calendar as CalendarIcon, Trophy, Flame, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

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
    <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300 overflow-hidden">
      {/* Header */}
      <header className="w-full h-16 border-b flex items-center px-6 bg-white/50 backdrop-blur-md shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose} className="mr-4 rounded-full">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h2 className="text-xl font-black uppercase tracking-tighter">سجل الرحلة</h2>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Habit Summary Card */}
        <div 
          className="w-full p-8 rounded-[2.5rem] text-white shadow-2xl space-y-4"
          style={{ backgroundColor: accentColor }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black">{habitName}</h3>
            <Trophy className="h-8 w-8 opacity-50" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest opacity-70">تاريخ الانطلاق</p>
            <p className="text-lg font-black">{format(startDate, 'yyyy/MM/dd')}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2rem] border shadow-sm flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-orange-100 rounded-2xl">
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
            <p className="text-[10px] font-black uppercase opacity-40">نشاط مستمر</p>
            <p className="text-xl font-black">فعال</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border shadow-sm flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <Target className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-[10px] font-black uppercase opacity-40">الهدف الحالي</p>
            <p className="text-xl font-black">الثبات</p>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 px-2">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-black text-sm uppercase tracking-widest opacity-60">تقويم الالتزام</h4>
          </div>
          <div className="bg-white rounded-[2.5rem] border shadow-xl p-4 overflow-hidden">
            <Calendar 
              mode="single" 
              selected={startDate} 
              className="w-full"
            />
          </div>
        </div>

        <div className="h-10" />
      </main>

      {/* Bottom Action */}
      <div className="p-6 border-t bg-white/50 backdrop-blur-md shrink-0">
        <Button 
          onClick={onClose} 
          className="w-full h-16 rounded-2xl text-lg font-black shadow-lg"
          style={{ backgroundColor: accentColor }}
        >
          العودة للعداد
        </Button>
      </div>
    </div>
  )
}
