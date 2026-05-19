"use client"

import * as React from "react"
import { MoreVertical, Edit2, Calendar as CalendarIcon, Trash2, Check, History, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"

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
        className="text-4xl sm:text-5xl md:text-7xl font-black font-headline transition-colors duration-500 tabular-nums tracking-tighter" 
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
  onOpenHistory: () => void
  onUpdateDate: (date: Date) => void
  onUpdateName: (name: string) => void
  onUpdateColor: (color: string) => void
}

export function TimerDisplay({ 
  externalStartDate, 
  externalHabitName, 
  externalAccentColor, 
  onOpenHistory,
  onUpdateDate,
  onUpdateName,
  onUpdateColor
}: TimerDisplayProps) {
  const { toast } = useToast()
  
  const [elapsed, setElapsed] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [showNameDialog, setShowNameDialog] = React.useState(false)
  const [showDateDialog, setShowDateDialog] = React.useState(false)
  const [tempHabitName, setTempHabitName] = React.useState(externalHabitName)

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
    setTimeout(() => setShowNameDialog(false), 100)
    toast({ title: "تم التحديث", description: "تم تغيير اسم العادة بنجاح." })
  }

  const handleUpdateColor = (color: string) => {
    onUpdateColor(color)
    toast({ title: "تم التغيير", description: "تم تحديث لون العداد." })
  }

  const handleUpdateDate = (date: Date | undefined) => {
    if (!date) return
    onUpdateDate(date)
    setTimeout(() => setShowDateDialog(false), 100)
    toast({ title: "تم التعديل", description: "تم تغيير تاريخ البداية." })
  }

  const handleReset = () => {
    const now = new Date()
    onUpdateDate(now)
    toast({ variant: "destructive", title: "إعادة تعيين", description: "بدأ العداد من جديد الآن." })
  }

  const handleUrge = () => {
    toast({ 
      title: "تنبيه رغبة", 
      description: "تذكر لماذا بدأت، استمر في الصمود!",
      className: "bg-orange-500 text-white border-none"
    })
  }

  return (
    <div className="relative w-full max-w-[600px] flex-1 flex flex-col items-center justify-center p-2 md:p-4 min-h-0 overflow-hidden">
      <div className="w-full bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border border-primary/5 flex flex-col items-center justify-center p-6 md:p-10 relative overflow-hidden transition-all duration-500 max-h-full">
        
        {/* Top Options */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary w-10 h-10 md:w-12 md:h-12">
                <MoreVertical className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-3 shadow-2xl border-border/50 rounded-2xl z-[60]">
              <DropdownMenuLabel className="text-[10px] font-black uppercase opacity-40 px-3 pb-2 text-right">لوحة التحكم</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer py-4 rounded-xl flex-row-reverse text-right"
                onSelect={(e) => {
                  e.preventDefault();
                  setTempHabitName(externalHabitName);
                  setTimeout(() => setShowNameDialog(true), 100);
                }}
              >
                <Edit2 className="ml-3 h-5 w-5" /> تعديل الاسم
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer py-4 rounded-xl flex-row-reverse text-right"
                onSelect={(e) => {
                  e.preventDefault();
                  setTimeout(() => setShowDateDialog(true), 100);
                }}
              >
                <CalendarIcon className="ml-3 h-5 w-5" /> تاريخ البداية
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-3 py-3">
                <p className="text-[10px] font-black uppercase opacity-30 mb-3 text-right">لون المظهر</p>
                <div className="grid grid-cols-6 gap-3">
                  {COLORS.map((c) => (
                    <button 
                      key={c.value} 
                      onClick={() => handleUpdateColor(c.value)} 
                      className="w-7 h-7 rounded-full border border-black/5 flex items-center justify-center transition-transform hover:scale-110 active:scale-95" 
                      style={{ backgroundColor: c.value }}
                    >
                      {externalAccentColor === c.value && <Check className="h-4 w-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Display Title */}
        <div className="text-center mb-4 md:mb-6">
          <h2 className="text-xl md:text-3xl font-black text-foreground mb-1 tracking-tight">{externalHabitName}</h2>
          <div className="flex items-center justify-center space-x-3">
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: externalAccentColor }} />
            <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-30">عداد نشط</span>
          </div>
        </div>
        
        {/* Big Numbers Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 md:gap-y-4 w-full max-w-[280px] md:max-w-sm">
          <TimeBox value={elapsed.days} label="أيام" color={externalAccentColor} />
          <TimeBox value={elapsed.hours} label="ساعات" color={externalAccentColor} />
          <TimeBox value={elapsed.minutes} label="دقائق" color={externalAccentColor} />
          <TimeBox value={elapsed.seconds} label="ثواني" color={externalAccentColor} />
        </div>
        
        {/* Progress Visualizer */}
        <div className="mt-4 md:mt-6 w-24 h-1.5 bg-secondary rounded-full overflow-hidden shrink-0">
          <div className="h-full transition-all duration-1000 ease-out" style={{ width: '100%', backgroundColor: externalAccentColor }} />
        </div>

        {/* Action Buttons Row */}
        <div className="flex gap-3 w-full max-w-[320px] mt-6 md:mt-8 shrink-0">
          <Button 
            onClick={handleUrge}
            className="flex-1 h-12 md:h-14 rounded-2xl text-xs md:text-base font-black shadow-lg bg-orange-500 hover:bg-orange-600 text-white transition-all active:scale-95"
          >
            <Flame className="ml-2 h-4 w-4 md:h-5 md:w-5" /> رغبة
          </Button>
          <Button 
            onClick={handleReset}
            variant="destructive"
            className="flex-1 h-12 md:h-14 rounded-2xl text-xs md:text-base font-black shadow-lg transition-all active:scale-95"
          >
            <Trash2 className="ml-2 h-4 w-4 md:h-5 md:w-5" /> تصفير
          </Button>
        </div>

        {/* History Button */}
        <Button 
          variant="ghost" 
          onClick={onOpenHistory}
          className="mt-4 rounded-full font-black text-[9px] md:text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
        >
          <History className="mr-2 h-3.5 w-3.5" /> سجل الرحلة
        </Button>
      </div>

      {/* Global Dialogs */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="rounded-[2.5rem] p-8 max-w-md border-none shadow-2xl z-[110]">
          <DialogHeader><DialogTitle className="text-2xl font-black tracking-tight text-center">تعديل الاسم</DialogTitle></DialogHeader>
          <div className="py-6 space-y-4">
            <Label className="text-[10px] font-black uppercase opacity-40 tracking-widest block text-center">اسم العادة الجديد</Label>
            <Input 
              autoFocus
              value={tempHabitName} 
              onChange={(e) => setTempHabitName(e.target.value)} 
              className="h-14 rounded-xl font-bold text-lg border-secondary bg-secondary/20 focus:bg-white transition-all text-center" 
            />
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateName} className="w-full h-14 rounded-xl text-lg font-black shadow-lg transition-all">
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
        <DialogContent className="rounded-[2.5rem] p-6 flex flex-col items-center max-w-[400px] border-none shadow-2xl z-[110]">
          <DialogHeader className="mb-4 text-center w-full"><DialogTitle className="text-xl font-black text-center">تحديد تاريخ البداية</DialogTitle></DialogHeader>
          <div className="bg-secondary/20 p-4 rounded-3xl w-full flex justify-center">
            <Calendar 
              mode="single" 
              selected={externalStartDate} 
              onSelect={handleUpdateDate} 
              className="rounded-3xl bg-white border shadow-sm" 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
