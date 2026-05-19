
"use client"

import * as React from "react"
import { MoreVertical, Edit2, Calendar as CalendarIcon, Trash2, Check } from "lucide-react"
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
import { format, isValid } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

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
      <span className="text-[7px] md:text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5 font-black opacity-60">
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

  // الحالات المنفصلة للتحكم في النوافذ المنبثقة
  const [showNameDialog, setShowNameDialog] = React.useState(false)
  const [showDateDialog, setShowDateDialog] = React.useState(false)
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
    setShowNameDialog(false)
    toast({ title: "Updated", description: "Habit name updated." })
  }

  const handleUpdateColor = (color: string) => {
    saveToStorage(STORAGE_KEYS.HABIT_COLOR, color)
    setAccentColor(color)
    toast({ title: "Updated", description: "Color changed." })
  }

  const handleUpdateDate = (date: Date | undefined) => {
    if (!date) return
    saveToStorage(STORAGE_KEYS.START_DATE, date.toISOString())
    setStartDate(date)
    setShowDateDialog(false)
    toast({ title: "Reset", description: "Start date changed." })
  }

  const handleReset = () => {
    const now = new Date()
    saveToStorage(STORAGE_KEYS.START_DATE, now.toISOString())
    setStartDate(now)
    toast({ title: "Success", description: "Counter reset to now." })
  }

  return (
    <div className="relative w-full max-w-[500px] h-full flex flex-col items-center justify-center p-2">
      <div className="w-full bg-white rounded-[40px] shadow-2xl border border-primary/5 flex flex-col items-center justify-center p-6 md:p-10 relative overflow-hidden aspect-square sm:aspect-auto sm:min-h-[400px]">
        
        {/* Options Button */}
        <div className="absolute top-4 right-4 z-20">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary">
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 shadow-xl border-border/50">
              <DropdownMenuLabel className="text-[10px] font-black uppercase opacity-40">Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setTempHabitName(habitName); setShowNameDialog(true); }} className="cursor-pointer py-3">
                <Edit2 className="mr-3 h-4 w-4" /> Edit Name
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setShowDateDialog(true); }} className="cursor-pointer py-3">
                <CalendarIcon className="mr-3 h-4 w-4" /> Set Date
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="grid grid-cols-6 gap-2 p-2">
                {COLORS.map((c) => (
                  <button key={c.value} onClick={() => handleUpdateColor(c.value)} className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: c.value }}>
                    {accentColor === c.value && <Check className="h-3 w-3 text-white m-auto" />}
                  </button>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:bg-destructive/10 cursor-pointer py-3" onSelect={(e) => { e.preventDefault(); handleReset(); }}>
                <Trash2 className="mr-3 h-4 w-4" /> Reset Now
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-3xl font-black text-foreground mb-1 tracking-tight">{habitName}</h2>
          <div className="flex items-center justify-center space-x-2">
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
            <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-30">Live Tracking</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 w-full">
          <TimeBox value={elapsed.days} label="Days" color={accentColor} />
          <TimeBox value={elapsed.hours} label="Hours" color={accentColor} />
          <TimeBox value={elapsed.minutes} label="Minutes" color={accentColor} />
          <TimeBox value={elapsed.seconds} label="Seconds" color={accentColor} />
        </div>
        
        <div className="mt-8 w-20 h-1.5 bg-secondary rounded-full overflow-hidden shrink-0">
          <div className="h-full transition-all duration-1000" style={{ width: '100%', backgroundColor: accentColor }} />
        </div>
      </div>

      {/* Dialogs - Moved Outside for better stability */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="rounded-[32px] p-8">
          <DialogHeader><DialogTitle className="text-2xl font-black">Rename</DialogTitle></DialogHeader>
          <div className="py-6 space-y-4">
            <Label className="text-[10px] font-bold uppercase opacity-50">New Name</Label>
            <Input value={tempHabitName} onChange={(e) => setTempHabitName(e.target.value)} className="h-14 rounded-2xl font-bold text-lg" />
          </div>
          <DialogFooter><Button onClick={handleUpdateName} className="w-full h-14 rounded-2xl text-lg font-bold">Save Changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
        <DialogContent className="rounded-[32px] p-4 flex flex-col items-center">
          <DialogHeader><DialogTitle className="text-2xl font-black">Start Date</DialogTitle></DialogHeader>
          <Calendar mode="single" selected={startDate} onSelect={handleUpdateDate} className="rounded-3xl p-4" />
        </DialogContent>
      </Dialog>
    </div>
  )
}
