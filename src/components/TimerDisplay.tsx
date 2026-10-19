"use client"

import * as React from "react"
import { History, MoreVertical, Settings2, RotateCcw, RefreshCw, Sparkles, Heart, Zap, Moon, Sun, Target, Shield, Flame, Cloud, Ghost, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { startOfDay, isBefore, isSameDay, max, isAfter } from "date-fns"

const ICON_MAP = {
  Sparkles, Heart, Zap, Moon, Sun, Target, Shield, Flame, Cloud, Ghost
}

const LiveClock = React.memo(({ startDate, language }: { startDate: Date; language: 'ar' | 'en' }) => {
  const [elapsed, setElapsed] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const isAr = language === 'ar'

  React.useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime()
      const start = startDate.getTime()
      const d = Math.max(0, now - start)
      setElapsed({
        seconds: Math.floor((d / 1000) % 60),
        minutes: Math.floor((d / 1000 / 60) % 60),
        hours: Math.floor((d / (1000 * 60 * 60)) % 24),
        days: Math.floor(d / (1000 * 60 * 60 * 24))
      })
    }
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [startDate])

  return (
    <div className="w-full flex flex-col items-center shrink-0">
      {/* Largest time unit in a circle */}
      <div className="relative flex items-center justify-center mb-6">
        <div className="w-44 h-44 rounded-full border-8 border-primary/10 flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-2xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-primary/5 animate-pulse" />
          
          <span className="text-7xl font-black text-primary tabular-nums leading-none relative z-10">
            {elapsed.days}
          </span>
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2 relative z-10">
            {isAr ? "يوم" : "Day"}
          </span>
        </div>
      </div>

      <div className="w-full max-w-[220px] flex justify-center gap-4 py-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl mb-6 border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="text-center">
          <span className="text-xl font-black text-slate-700 dark:text-slate-200 tabular-nums">{elapsed.hours}</span>
          <p className="text-[7px] font-black uppercase opacity-40 mt-0.5">{isAr ? "ساعة" : "H"}</p>
        </div>
        <span className="text-xl font-black text-slate-300 self-start mt-[-2px]">:</span>
        <div className="text-center">
          <span className="text-xl font-black text-slate-700 dark:text-slate-200 tabular-nums">{elapsed.minutes}</span>
          <p className="text-[7px] font-black uppercase opacity-40 mt-0.5">{isAr ? "دقيقة" : "M"}</p>
        </div>
        <span className="text-xl font-black text-slate-300 self-start mt-[-2px]">:</span>
        <div className="text-center">
          <span className="text-xl font-black text-slate-700 dark:text-slate-200 tabular-nums">{elapsed.seconds}</span>
          <p className="text-[7px] font-black uppercase opacity-40 mt-0.5">{isAr ? "ثانية" : "S"}</p>
        </div>
      </div>
    </div>
  )
})
LiveClock.displayName = "LiveClock"

interface TimerDisplayProps {
  externalStartDate: Date
  externalHabitName: string
  externalHabitIcon?: string
  externalAccentColor: string
  resetDates: Date[]
  onOpenHistory: () => void
  onUpdateDate: (date: Date) => void
  onUpdateName: (name: string) => void
  onUpdateColor: (color: string) => void
  onReset: () => void
  onDelete: () => void
  onClearData: () => void
  language: 'ar' | 'en'
}

export const TimerDisplay = React.memo(({ 
  externalStartDate, 
  externalHabitName, 
  externalHabitIcon = 'Sparkles',
  onOpenHistory,
  onUpdateName,
  onReset,
  onDelete,
  onClearData,
  language
}: TimerDisplayProps) => {
  const [showNameDialog, setShowNameDialog] = React.useState(false)
  const [tempHabitName, setTempHabitName] = React.useState(externalHabitName)
  
  const isAr = language === 'ar'
  const IconComponent = ICON_MAP[externalHabitIcon as keyof typeof ICON_MAP] || Sparkles
  
  const handleUpdateName = React.useCallback(() => {
    if (!tempHabitName.trim()) return
    onUpdateName(tempHabitName)
    setShowNameDialog(false)
  }, [tempHabitName, onUpdateName])

  return (
    <div className="w-full flex flex-col items-center overflow-hidden h-full">
      <div className="w-full max-w-[400px] bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800 p-8 flex flex-col items-center overflow-hidden">
        <div className="w-full flex items-center justify-between mb-8 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">
                <MoreVertical className="h-6 w-6 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-2xl w-52 p-2">
              <DropdownMenuItem onClick={onReset} className="text-red-500 font-black p-3 text-xs focus:bg-red-50 dark:focus:bg-red-950">
                <RefreshCw className="h-4 w-4 ml-2" /> {isAr ? "تصفير العداد" : "Reset Tracker"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowNameDialog(true)} className="p-3 font-black text-xs">
                <Settings2 className="h-4 w-4 ml-2" /> {isAr ? "تعديل الاسم" : "Edit Name"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onClearData} className="text-orange-500 font-black p-3 text-xs focus:bg-orange-50 dark:focus:bg-orange-950">
                <RotateCcw className="h-4 w-4 ml-2" /> {isAr ? "حذف السجلات" : "Clear Records"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600 font-black p-3 text-xs focus:bg-red-100 dark:focus:bg-red-900">
                <Trash2 className="h-4 w-4 ml-2" /> {isAr ? "حذف العداد نهائياً" : "Delete Habit"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight truncate max-w-[160px]">{externalHabitName}</h3>
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-sm">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        <LiveClock startDate={externalStartDate} language={language} />

        <Button onClick={onOpenHistory} className="w-full h-16 rounded-[2rem] bg-slate-900 dark:bg-slate-800 text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all shrink-0 hover:bg-slate-800 dark:hover:bg-slate-700">
          <History className="h-6 w-6" /> {isAr ? "سجل الرحلة" : "Journey Log"}
        </Button>
      </div>

      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="rounded-[2.5rem] p-6 max-w-[320px]">
          <DialogHeader><DialogTitle className="text-center font-black text-lg">{isAr ? "تعديل اسم العداد" : "Edit Habit Name"}</DialogTitle></DialogHeader>
          <div className="py-4">
            <Input 
              value={tempHabitName} 
              onChange={(e) => setTempHabitName(e.target.value)} 
              className="text-center font-black h-12 rounded-xl text-base bg-slate-50 border-none" 
            />
          </div>
          <Button onClick={handleUpdateName} className="w-full h-12 rounded-xl font-black text-base shadow-lg">{isAr ? "حفظ التغييرات" : "Save Changes"}</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
})
TimerDisplay.displayName = "TimerDisplay"
