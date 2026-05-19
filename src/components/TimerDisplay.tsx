"use client"

import * as React from "react"
import { MoreVertical, Trash2, History, Flame, ArrowRight, ArrowLeft, Clock } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { isAfter, isBefore, isSameDay, startOfDay, setHours, setMinutes } from "date-fns"
import { CircularTimePicker } from "./CircularTimePicker"

const COLORS = [
  { name: 'Default', value: 'hsl(var(--accent))' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Violet', value: '#8b5cf6' },
]

const TimeBox = React.memo(({ value, label, color }: { value: number; label: string; color: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-1 md:p-2 shrink-0">
      <span 
        className="text-4xl sm:text-5xl md:text-7xl font-black transition-colors duration-500 tabular-nums tracking-tighter" 
        style={{ color: color }}
      >
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[7px] md:text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1 font-black opacity-60">
        {label}
      </span>
    </div>
  )
})
TimeBox.displayName = "TimeBox"

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
  onUrge
}: TimerDisplayProps) {
  const { toast } = useToast()
  const [elapsed, setElapsed] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [showNameDialog, setShowNameDialog] = React.useState(false)
  const [showDateDialog, setShowDateDialog] = React.useState(false)
  const [tempHabitName, setTempHabitName] = React.useState(externalHabitName)
  
  // مراحل تعيين الوقت
  const [setupStep, setSetupStep] = React.useState<SetupStep>('date')
  const [selectedDate, setSelectedDate] = React.useState<Date>(externalStartDate)
  const [selectedHour, setSelectedHour] = React.useState(externalStartDate.getHours())
  const [selectedMinute, setSelectedMinute] = React.useState(externalStartDate.getMinutes())

  React.useEffect(() => {
    const updateTimer = () => {
      const start = externalStartDate.getTime()
      const now = new Date().getTime()
      const diff = now - start
      const d = Math.max(0, diff)

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
    toast({ title: "تم التحديث", description: "تم تغيير اسم العادة بنجاح." })
  }

  const handleUpdateColor = (color: string) => {
    onUpdateColor(color)
    toast({ title: "تم التغيير", description: "تم تحديث لون العداد." })
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    if (isAfter(startOfDay(date), startOfDay(new Date()))) {
      toast({ variant: "destructive", title: "خطأ", description: "لا يمكن اختيار تاريخ مستقبلي." })
      return
    }
    setSelectedDate(date)
    setSetupStep('hour')
  }

  const handleSaveFullDate = () => {
    const finalDate = setMinutes(setHours(selectedDate, selectedHour), selectedMinute)
    
    if (isAfter(finalDate, new Date())) {
      toast({ variant: "destructive", title: "خطأ", description: "الوقت المحدد في المستقبل." })
      return
    }

    onUpdateDate(finalDate)
    setShowDateDialog(false)
    setSetupStep('date')
    toast({ title: "تم الحفظ", description: "تم تحديث تاريخ ووقت البداية بنجاح." })
  }

  const today = startOfDay(new Date())
  const start = startOfDay(externalStartDate)

  const isRelapse = (date: Date) => {
    const d = startOfDay(date)
    return resetDates.some(rd => isSameDay(startOfDay(rd), d)) || isSameDay(d, start)
  }

  const isClean = (date: Date) => {
    const d = startOfDay(date)
    const isStrictlyAfterStart = isAfter(d, start)
    const isBeforeOrEqualToday = isBefore(d, today) || isSameDay(d, today)
    return isStrictlyAfterStart && isBeforeOrEqualToday && !isRelapse(d)
  }

  const modifiers = {
    relapse: (date: Date) => isRelapse(date),
    clean: (date: Date) => isClean(date)
  }

  const modifiersClassNames = {
    relapse: "bg-red-500 text-white hover:bg-red-600 rounded-full font-black shadow-inner scale-110 z-10",
    clean: "bg-emerald-500 text-white hover:bg-emerald-600 rounded-full font-black opacity-90"
  }

  return (
    <div className="relative w-full max-w-[600px] flex-1 flex flex-col items-center justify-center p-2 min-h-0 overflow-hidden">
      <div className="w-full bg-white rounded-[2.5rem] shadow-2xl border flex flex-col items-center justify-center p-6 md:p-10 relative overflow-hidden max-h-full">
        
        <div className="absolute top-4 right-4 z-20">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-10 h-10">
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-3 shadow-2xl rounded-2xl">
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setTempHabitName(externalHabitName); setShowNameDialog(true); }}>
                تعديل الاسم
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setSetupStep('date'); setShowDateDialog(true); }}>
                تعديل التاريخ والوقت
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="grid grid-cols-6 gap-2 p-2">
                {COLORS.map((c) => (
                  <button key={c.value} onClick={() => handleUpdateColor(c.value)} className="w-6 h-6 rounded-full border" style={{ backgroundColor: c.value }} />
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="text-center mb-4">
          <h2 className="text-xl md:text-3xl font-black text-foreground mb-1">{externalHabitName}</h2>
          <div className="flex items-center justify-center space-x-2">
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: externalAccentColor }} />
            <span className="text-[8px] font-black uppercase opacity-30">عداد نشط</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          <TimeBox value={elapsed.days} label="أيام" color={externalAccentColor} />
          <TimeBox value={elapsed.hours} label="ساعات" color={externalAccentColor} />
          <TimeBox value={elapsed.minutes} label="دقائق" color={externalAccentColor} />
          <TimeBox value={elapsed.seconds} label="ثواني" color={externalAccentColor} />
        </div>
        
        <div className="flex gap-3 w-full max-w-[320px] mt-8 shrink-0">
          <Button onClick={onUrge} className="flex-1 h-12 rounded-2xl font-black bg-orange-500 hover:bg-orange-600 text-white shadow-lg">
            <Flame className="ml-2 h-4 w-4" /> رغبة
          </Button>
          <Button onClick={onReset} variant="destructive" className="flex-1 h-12 rounded-2xl font-black shadow-lg">
            <Trash2 className="ml-2 h-4 w-4" /> انتكاسة
          </Button>
        </div>

        <Button variant="ghost" onClick={onOpenHistory} className="mt-4 rounded-full font-black text-[10px] uppercase opacity-40 hover:opacity-100">
          <History className="mr-2 h-3.5 w-3.5" /> سجل الرحلة
        </Button>
      </div>

      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="rounded-[2.5rem] p-8 max-w-md">
          <DialogHeader><DialogTitle className="text-center font-black">تعديل الاسم</DialogTitle></DialogHeader>
          <div className="py-4"><Input value={tempHabitName} onChange={(e) => setTempHabitName(e.target.value)} className="text-center font-bold h-14 rounded-xl" /></div>
          <div className="flex gap-2">
            <Button onClick={handleUpdateName} className="w-full h-14 rounded-xl font-black">حفظ</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDateDialog} onOpenChange={(open) => { setShowDateDialog(open); if(!open) setSetupStep('date'); }}>
        <DialogContent className="rounded-[2.5rem] p-6 max-w-[420px] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-center font-black flex items-center justify-center gap-2">
              {setupStep === 'date' && '1. اختر التاريخ'}
              {setupStep === 'hour' && '2. اختر الساعة'}
              {setupStep === 'minute' && '3. اختر الدقيقة'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center min-h-[350px] justify-center">
            {setupStep === 'date' && (
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-300">
                <Calendar 
                  mode="single" 
                  selected={selectedDate} 
                  onSelect={handleDateSelect} 
                  disabled={{ after: new Date() }}
                  modifiers={modifiers}
                  modifiersClassNames={modifiersClassNames}
                  className="rounded-3xl bg-white border shadow-sm p-2" 
                />
              </div>
            )}

            {setupStep === 'hour' && (
              <div className="w-full animate-in fade-in slide-in-from-right-4 duration-300">
                <CircularTimePicker 
                  mode="hours" 
                  value={selectedHour} 
                  onChange={setSelectedHour} 
                  onComplete={() => setSetupStep('minute')} 
                />
                <Button variant="ghost" onClick={() => setSetupStep('date')} className="w-full mt-2 font-black opacity-40">
                  <ArrowLeft className="ml-2 h-4 w-4" /> العودة للتقويم
                </Button>
              </div>
            )}

            {setupStep === 'minute' && (
              <div className="w-full animate-in fade-in slide-in-from-right-4 duration-300">
                <CircularTimePicker 
                  mode="minutes" 
                  value={selectedMinute} 
                  onChange={setSelectedMinute} 
                  onComplete={handleSaveFullDate} 
                />
                <Button variant="ghost" onClick={() => setSetupStep('hour')} className="w-full mt-2 font-black opacity-40">
                  <ArrowLeft className="ml-2 h-4 w-4" /> العودة للساعة
                </Button>
                <Button onClick={handleSaveFullDate} className="w-full h-14 mt-4 rounded-2xl font-black shadow-lg">
                  حفظ التغييرات
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
