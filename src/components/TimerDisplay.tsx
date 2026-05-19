
"use client"

import * as React from "react"
import { MoreVertical, Edit2, Calendar as CalendarIcon, Trash2, Check, History } from "lucide-react"
import { getFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage"
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
import { isValid, format } from "date-fns"
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
    <div className="flex flex-col items-center justify-center p-2 shrink-0">
      <span 
        className="text-5xl sm:text-6xl md:text-8xl font-black font-headline transition-colors duration-500 tabular-nums tracking-tighter" 
        style={{ color: color }}
      >
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[8px] md:text-[12px] uppercase tracking-[0.3em] text-muted-foreground mt-1 font-black opacity-60">
        {label}
      </span>
    </div>
  )
})
TimeBox.displayName = "TimeBox"

export function TimerDisplay() {
  const { toast } = useToast()
  
  const [habitName, setHabitName] = React.useState("Abstinence")
  const [accentColor, setAccentColor] = React.useState('hsl(var(--accent))')
  const [startDate, setStartDate] = React.useState<Date>(new Date())
  const [elapsed, setElapsed] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  const [showNameDialog, setShowNameDialog] = React.useState(false)
  const [showDateDialog, setShowDateDialog] = React.useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = React.useState(false)
  const [tempHabitName, setTempHabitName] = React.useState("")

  React.useEffect(() => {
    const storedName = getFromStorage(STORAGE_KEYS.HABIT_NAME)
    const storedColor = getFromStorage(STORAGE_KEYS.HABIT_COLOR)
    const storedDate = getFromStorage(STORAGE_KEYS.START_DATE)

    if (storedName) {
      setHabitName(storedName)
      setTempHabitName(storedName)
    }
    if (storedColor) setAccentColor(storedColor)
    if (storedDate) {
      const parsedDate = new Date(storedDate)
      if (isValid(parsedDate)) setStartDate(parsedDate)
    }
  }, [])

  React.useEffect(() => {
    const updateTimer = () => {
      const start = startDate.getTime()
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
  }, [startDate])

  const handleUpdateName = () => {
    if (!tempHabitName.trim()) return
    saveToStorage(STORAGE_KEYS.HABIT_NAME, tempHabitName)
    setHabitName(tempHabitName)
    setTimeout(() => setShowNameDialog(false), 100)
    toast({ title: "تم التحديث", description: "تم تغيير اسم العادة بنجاح." })
  }

  const handleUpdateColor = (color: string) => {
    saveToStorage(STORAGE_KEYS.HABIT_COLOR, color)
    setAccentColor(color)
    toast({ title: "تم التغيير", description: "تم تحديث لون العداد." })
  }

  const handleUpdateDate = (date: Date | undefined) => {
    if (!date) return
    saveToStorage(STORAGE_KEYS.START_DATE, date.toISOString())
    setStartDate(date)
    setTimeout(() => setShowDateDialog(false), 100)
    toast({ title: "تم التعديل", description: "تم تغيير تاريخ البداية." })
  }

  const handleReset = () => {
    const now = new Date()
    saveToStorage(STORAGE_KEYS.START_DATE, now.toISOString())
    setStartDate(now)
    toast({ title: "إعادة تعيين", description: "بدأ العداد من جديد الآن." })
  }

  return (
    <div className="relative w-full max-w-[600px] flex-1 flex flex-col items-center justify-center p-4 min-h-0 overflow-hidden">
      <div className="w-full bg-white rounded-[3rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border border-primary/5 flex flex-col items-center justify-center p-8 md:p-14 relative overflow-hidden transition-all duration-500 max-h-full">
        
        {/* Top Options */}
        <div className="absolute top-6 right-6 z-20">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary w-12 h-12">
                <MoreVertical className="h-6 w-6 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-3 shadow-2xl border-border/50 rounded-2xl z-[60]">
              <DropdownMenuLabel className="text-[10px] font-black uppercase opacity-40 px-3 pb-2">لوحة التحكم</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer py-4 rounded-xl"
                onSelect={(e) => {
                  e.preventDefault();
                  setTempHabitName(habitName);
                  setTimeout(() => setShowNameDialog(true), 100);
                }}
              >
                <Edit2 className="mr-3 h-5 w-5" /> تعديل الاسم
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer py-4 rounded-xl"
                onSelect={(e) => {
                  e.preventDefault();
                  setTimeout(() => setShowDateDialog(true), 100);
                }}
              >
                <CalendarIcon className="mr-3 h-5 w-5" /> تاريخ البداية
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-3 py-3">
                <p className="text-[10px] font-black uppercase opacity-30 mb-3">لون المظهر</p>
                <div className="grid grid-cols-6 gap-3">
                  {COLORS.map((c) => (
                    <button 
                      key={c.value} 
                      onClick={() => handleUpdateColor(c.value)} 
                      className="w-7 h-7 rounded-full border border-black/5 flex items-center justify-center transition-transform hover:scale-110 active:scale-95" 
                      style={{ backgroundColor: c.value }}
                    >
                      {accentColor === c.value && <Check className="h-4 w-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:bg-destructive/10 cursor-pointer py-4 rounded-xl" 
                onSelect={(e) => {
                  e.preventDefault();
                  handleReset();
                }}
              >
                <Trash2 className="mr-3 h-5 w-5" /> إعادة ضبط (الآن)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Display Title */}
        <div className="text-center mb-6 md:mb-10">
          <h2 className="text-2xl md:text-4xl font-black text-foreground mb-2 tracking-tight">{habitName}</h2>
          <div className="flex items-center justify-center space-x-3">
            <span className="h-2.5 w-2.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30">عداد نشط</span>
          </div>
        </div>
        
        {/* Big Numbers Grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 md:gap-y-6 w-full max-w-sm">
          <TimeBox value={elapsed.days} label="أيام" color={accentColor} />
          <TimeBox value={elapsed.hours} label="ساعات" color={accentColor} />
          <TimeBox value={elapsed.minutes} label="دقائق" color={accentColor} />
          <TimeBox value={elapsed.seconds} label="ثواني" color={accentColor} />
        </div>
        
        {/* Progress Visualizer */}
        <div className="mt-8 md:mt-12 w-32 h-2 bg-secondary rounded-full overflow-hidden shrink-0">
          <div className="h-full transition-all duration-1000 ease-out" style={{ width: '100%', backgroundColor: accentColor }} />
        </div>

        {/* History Button - New */}
        <Button 
          variant="ghost" 
          onClick={() => setShowHistoryDialog(true)}
          className="mt-6 rounded-full font-black text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
        >
          <History className="mr-2 h-4 w-4" /> سجل الرحلة
        </Button>
      </div>

      {/* Global Dialogs */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="rounded-[2.5rem] p-10 max-w-md border-none shadow-2xl z-[100]">
          <DialogHeader><DialogTitle className="text-3xl font-black tracking-tight">تعديل الاسم</DialogTitle></DialogHeader>
          <div className="py-8 space-y-4">
            <Label className="text-xs font-black uppercase opacity-40 tracking-widest">اسم العادة الجديد</Label>
            <Input 
              autoFocus
              value={tempHabitName} 
              onChange={(e) => setTempHabitName(e.target.value)} 
              className="h-16 rounded-2xl font-bold text-xl border-secondary bg-secondary/20 focus:bg-white transition-all" 
            />
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateName} className="w-full h-16 rounded-2xl text-xl font-black shadow-lg hover:translate-y-[-2px] active:translate-y-0 transition-all">
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
        <DialogContent className="rounded-[2.5rem] p-6 flex flex-col items-center max-w-sm border-none shadow-2xl z-[100]">
          <DialogHeader className="mb-4"><DialogTitle className="text-2xl font-black">تحديد تاريخ البداية</DialogTitle></DialogHeader>
          <div className="bg-secondary/20 p-4 rounded-3xl">
            <Calendar 
              mode="single" 
              selected={startDate} 
              onSelect={handleUpdateDate} 
              className="rounded-3xl" 
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog - New */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="rounded-[2.5rem] p-8 flex flex-col items-center max-w-sm border-none shadow-2xl z-[100]">
          <DialogHeader className="mb-4 text-center">
            <DialogTitle className="text-2xl font-black">سجل الرحلة</DialogTitle>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-2">
              تاريخ البدء: {format(startDate, 'yyyy/MM/dd')}
            </p>
          </DialogHeader>
          <div className="bg-secondary/10 p-4 rounded-[2rem] border border-primary/5">
            <Calendar 
              mode="single" 
              selected={startDate} 
              className="rounded-3xl pointer-events-none" 
            />
          </div>
          <Button 
            variant="secondary" 
            onClick={() => setShowHistoryDialog(false)}
            className="w-full mt-6 h-14 rounded-2xl font-black"
          >
            إغلاق
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
