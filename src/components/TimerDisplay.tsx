
"use client"

import * as React from "react"
import { MoreVertical, Trash2, History, Flame, Trophy, RefreshCw, Settings2, Calendar as CalendarIcon, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { isAfter, isBefore, isSameDay, startOfDay, setHours, setMinutes, differenceInDays } from "date-fns"
import { CircularTimePicker } from "./CircularTimePicker"

const COLORS = [
  { name: 'Default', value: 'hsl(var(--accent))' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Violet', value: '#8b5cf6' },
]

interface TimerDisplayProps {
  externalStartDate: Date
  externalHabitName: string
  externalAccentColor: string
  resetDates: Date[]
  onOpenHistory: () => void
  onUpdateDate: (date: Date) => void
  onUpdateName: (name: string) => void
  onUpdateColor: (color: string) => void
  onReset: () => void
  onUrge: () => void
  onDelete: () => void
  onClearData: () => void
  language: 'ar' | 'en'
}

type SetupStep = 'date' | 'hour' | 'minute'

export function TimerDisplay({ 
  externalStartDate, 
  externalHabitName, 
  externalAccentColor, 
  resetDates,
  onOpenHistory,
  onUpdateDate,
  onUpdateName,
  onUpdateColor,
  onReset,
  onUrge,
  onDelete,
  onClearData,
  language
}: TimerDisplayProps) {
  const [elapsed, setElapsed] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [showNameDialog, setShowNameDialog] = React.useState(false)
  const [showDateDialog, setShowDateDialog] = React.useState(false)
  const [tempHabitName, setTempHabitName] = React.useState(externalHabitName)
  
  const [setupStep, setSetupStep] = React.useState<SetupStep>('date')
  const [selectedDate, setSelectedDate] = React.useState<Date>(externalStartDate)
  const [selectedHour, setSelectedHour] = React.useState(externalStartDate.getHours())
  const [selectedMinute, setSelectedMinute] = React.useState(externalStartDate.getMinutes())

  const isAr = language === 'ar'

  const stats = React.useMemo(() => {
    if (resetDates.length < 2) return { highest: 0 }
    const streaks: number[] = []
    const sortedResets = [...resetDates].sort((a, b) => a.getTime() - b.getTime())
    for (let i = 0; i < sortedResets.length - 1; i++) {
      streaks.push(differenceInDays(sortedResets[i + 1], sortedResets[i]))
    }
    const highest = streaks.length > 0 ? Math.max(...streaks) : 0
    return { highest }
  }, [resetDates])

  React.useEffect(() => {
    const updateTimer = () => {
      const start = externalStartDate.getTime()
      const now = new Date().getTime()
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
  }, [externalStartDate])

  const handleUpdateName = () => {
    if (!tempHabitName.trim()) return
    onUpdateName(tempHabitName)
    setShowNameDialog(false)
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    if (isAfter(startOfDay(date), startOfDay(new Date()))) return
    setSelectedDate(date)
    setSetupStep('hour')
  }

  const handleSaveFullDate = () => {
    const finalDate = setMinutes(setHours(selectedDate, selectedHour), selectedMinute)
    onUpdateDate(finalDate)
    setShowDateDialog(false)
    setSetupStep('date')
  }

  return (
    <div className="w-full max-w-[450px] flex flex-col items-center p-4">
      {/* العداد الرئيسي المصمم كبطاقة */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
        
        {/* الشريط العلوي للبطاقة */}
        <div className="w-full h-12 px-6 flex items-center justify-between border-b border-slate-50 dark:border-slate-800 bg-slate-50/30">
          <Trophy className="h-4 w-4 text-orange-400" />
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
            onClick={onOpenHistory}
          >
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
              {isAr ? "الأعلى" : "Highest"}: {stats.highest} {isAr ? "يوم" : "Days"}
            </span>
            <History className="h-4 w-4 text-slate-300" />
          </div>
        </div>

        {/* جسم البطاقة */}
        <div className="p-8 flex flex-col items-center">
          {/* اسم العادة والأيقونات المساعدة */}
          <div className="w-full flex items-center justify-between mb-8">
            <div className="flex gap-4">
               <button onClick={() => setShowNameDialog(true)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                  <Settings2 className="h-4 w-4 text-slate-400" />
               </button>
               <button onClick={() => setShowDateDialog(true)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                  <CalendarIcon className="h-4 w-4 text-slate-400" />
               </button>
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{externalHabitName}</h3>
              <Sparkles className="h-5 w-5 text-orange-400" />
            </div>
          </div>

          {/* العداد المركزي */}
          <div className="flex flex-col items-center justify-center space-y-2 mb-10">
            <div className="relative flex flex-col items-center">
              <span className="text-8xl font-black text-orange-500 tabular-nums leading-none">
                {elapsed.days}
              </span>
              <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                {isAr ? "يوم" : "Day"}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-2 rounded-2xl">
              <span className="text-sm font-black text-slate-600 dark:text-slate-300 tabular-nums">
                {elapsed.hours} {isAr ? "ساعة" : "H"} : {elapsed.minutes} {isAr ? "دقيقة" : "M"}
              </span>
            </div>
          </div>

          {/* أزرار العمليات الكبيرة */}
          <div className="w-full grid grid-cols-2 gap-4">
            <Button 
              onClick={onUrge}
              variant="outline"
              className="h-16 rounded-[1.5rem] border-2 border-orange-100 text-orange-500 font-black text-sm flex flex-col gap-1 shadow-sm hover:bg-orange-50/50"
            >
              <Flame className="h-4 w-4" />
              {isAr ? "أشعر برغبة" : "Feel Urge"}
            </Button>
            <Button 
              onClick={onReset}
              className="h-16 rounded-[1.5rem] bg-red-500 hover:bg-red-600 text-white font-black text-sm flex flex-col gap-1 shadow-lg shadow-red-200 dark:shadow-none"
            >
              <RefreshCw className="h-4 w-4" />
              {isAr ? "تعثرت" : "Relapsed"}
            </Button>
          </div>
        </div>
      </div>

      {/* حوارات التعديل */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="rounded-[2.5rem] p-8 max-w-[380px]">
          <DialogHeader><DialogTitle className="text-center font-black">{isAr ? "تعديل الاسم" : "Edit Name"}</DialogTitle></DialogHeader>
          <div className="py-4"><Input value={tempHabitName} onChange={(e) => setTempHabitName(e.target.value)} className="text-center font-bold h-12 rounded-xl" /></div>
          <Button onClick={handleUpdateName} className="w-full h-12 rounded-xl font-black">{isAr ? "حفظ" : "Save"}</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showDateDialog} onOpenChange={(open) => { setShowDateDialog(open); if(!open) setSetupStep('date'); }}>
        <DialogContent className="rounded-[2.5rem] p-6 max-w-[400px]">
          <DialogHeader><DialogTitle className="text-center font-black">{isAr ? "تعديل الوقت" : "Edit Time"}</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center min-h-[320px] justify-center">
            {setupStep === 'date' && (
              <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} disabled={{ after: new Date() }} className="rounded-3xl bg-white dark:bg-slate-800 border p-2 shadow-inner" />
            )}
            {setupStep === 'hour' && (
              <div className="w-full">
                <CircularTimePicker mode="hours" value={selectedHour} onChange={setSelectedHour} onComplete={() => setSetupStep('minute')} />
                <Button variant="ghost" onClick={() => setSetupStep('date')} className="w-full mt-2 font-black opacity-40">{isAr ? "العودة" : "Back"}</Button>
              </div>
            )}
            {setupStep === 'minute' && (
              <div className="w-full">
                <CircularTimePicker mode="minutes" value={selectedMinute} onChange={setSelectedMinute} onComplete={handleSaveFullDate} />
                <Button onClick={handleSaveFullDate} className="w-full h-12 mt-4 rounded-xl font-black shadow-lg">{isAr ? "حفظ التغييرات" : "Save Changes"}</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
