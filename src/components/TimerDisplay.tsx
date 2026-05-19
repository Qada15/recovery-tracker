
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
  onOpenHistory: () => void
  onUpdateDate: (date: Date) => void
  onUpdateName: (name: string) => void
  onUpdateColor: (color: string) => void
  onReset: () => void
}

export function TimerDisplay({ 
  externalStartDate, 
  externalHabitName, 
  externalAccentColor, 
  onOpenHistory,
  onUpdateDate,
  onUpdateName,
  onUpdateColor,
  onReset
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
    setShowNameDialog(false)
    toast({ title: "تم التحديث", description: "تم تغيير اسم العادة بنجاح." })
  }

  const handleUpdateColor = (color: string) => {
    onUpdateColor(color)
    toast({ title: "تم التغيير", description: "تم تحديث لون العداد." })
  }

  const handleUpdateDate = (date: Date | undefined) => {
    if (!date) return
    onUpdateDate(date)
    setShowDateDialog(false)
    toast({ title: "تم التعديل", description: "تم تغيير تاريخ البداية." })
  }

  const handleResetClick = () => {
    onReset()
    toast({ variant: "destructive", title: "إعادة تعيين", description: "بدأ العداد من جديد وتم تسجيل اليوم في السجل." })
  }

  const handleUrge = () => {
    toast({ 
      title: "تنبيه رغبة", 
      description: "تذكر لماذا بدأت، استمر في الصمود!",
      className: "bg-orange-500 text-white border-none"
    })
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
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setShowDateDialog(true); }}>
                تاريخ البداية
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
          <Button onClick={handleUrge} className="flex-1 h-12 rounded-2xl font-black bg-orange-500 hover:bg-orange-600 text-white shadow-lg">
            <Flame className="ml-2 h-4 w-4" /> رغبة
          </Button>
          <Button onClick={handleResetClick} variant="destructive" className="flex-1 h-12 rounded-2xl font-black shadow-lg">
            <Trash2 className="ml-2 h-4 w-4" /> تصفير
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
          <DialogFooter><Button onClick={handleUpdateName} className="w-full h-14 rounded-xl font-black">حفظ</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
        <DialogContent className="rounded-[2.5rem] p-6 max-w-[400px]">
          <DialogHeader><DialogTitle className="text-center font-black">تحديد تاريخ البداية</DialogTitle></DialogHeader>
          <div className="flex justify-center bg-secondary/20 p-4 rounded-3xl">
            <Calendar mode="single" selected={externalStartDate} onSelect={handleUpdateDate} className="rounded-3xl bg-white border shadow-sm" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
