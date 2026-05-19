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

// Pure component to avoid re-renders of the whole timer logic
const TimeBox = React.memo(({ value, label, color }: { value: number; label: string; color: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-1 md:p-2 shrink-0">
      <span 
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-headline transition-colors duration-500 tabular-nums tracking-tighter" 
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
  
  // Core States
  const [habitName, setHabitName] = React.useState("Abstinence")
  const [accentColor, setAccentColor] = React.useState('hsl(var(--accent))')
  const [startDate, setStartDate] = React.useState<Date>(new Date())
  const [elapsed, setElapsed] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  // UI Control States - Using separate booleans to prevent dropdown conflict
  const [showNameDialog, setShowNameDialog] = React.useState(false)
  const [showDateDialog, setShowDateDialog] = React.useState(false)
  const [tempHabitName, setTempHabitName] = React.useState("")

  // Load Initial Data
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

  // Timer Logic
  React.useEffect(() => {
    const updateTimer = () => {
      const start = startDate.getTime()
      const now = new Date().getTime()
      const diff = now - start

      if (diff < 0) {
        setElapsed({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setElapsed({
        seconds: Math.floor((diff / 1000) % 60),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        days: Math.floor(diff / (1000 * 60 * 60 * 24))
      })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [startDate])

  // Handlers
  const handleUpdateName = React.useCallback(() => {
    if (!tempHabitName.trim()) return
    saveToStorage(STORAGE_KEYS.HABIT_NAME, tempHabitName)
    setHabitName(tempHabitName)
    setShowNameDialog(false)
    toast({ title: "Updated", description: "Habit name updated." })
  }, [tempHabitName, toast])

  const handleUpdateColor = React.useCallback((color: string) => {
    saveToStorage(STORAGE_KEYS.HABIT_COLOR, color)
    setAccentColor(color)
    toast({ title: "Updated", description: "Color changed." })
  }, [toast])

  const handleUpdateDate = React.useCallback((date: Date | undefined) => {
    if (!date) return
    saveToStorage(STORAGE_KEYS.START_DATE, date.toISOString())
    setStartDate(date)
    setShowDateDialog(false)
    toast({ title: "Reset", description: `New start date: ${format(date, "PPP")}` })
  }, [toast])

  const handleReset = React.useCallback(() => {
    const now = new Date()
    saveToStorage(STORAGE_KEYS.START_DATE, now.toISOString())
    setStartDate(now)
    toast({ title: "Success", description: "Counter reset to now." })
  }, [toast])

  return (
    <div className="relative w-full max-w-[540px] px-4 animate-in fade-in zoom-in duration-500 flex flex-col items-center justify-center min-h-0">
      <div className="w-full bg-white rounded-[32px] md:rounded-[48px] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] border border-primary/5 flex flex-col items-center justify-center p-6 md:p-8 relative overflow-hidden shrink-0">
        
        {/* Options Trigger */}
        <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-secondary">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 z-50">
              <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase opacity-40">Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onSelect={(e) => {
                  e.preventDefault()
                  setTempHabitName(habitName)
                  setTimeout(() => setShowNameDialog(true), 100)
                }}
                className="rounded-xl py-2.5 cursor-pointer"
              >
                <Edit2 className="mr-3 h-4 w-4" /> Edit Name
              </DropdownMenuItem>
              <DropdownMenuItem 
                onSelect={(e) => {
                  e.preventDefault()
                  setTimeout(() => setShowDateDialog(true), 100)
                }}
                className="rounded-xl py-2.5 cursor-pointer"
              >
                <CalendarIcon className="mr-3 h-4 w-4" /> Set Date
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <div className="px-3 py-1.5 text-xs font-bold text-muted-foreground uppercase">Color</div>
              <div className="grid grid-cols-6 gap-2 p-2">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => handleUpdateColor(c.value)}
                    className="w-6 h-6 rounded-full border border-black/5 flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: c.value }}
                  >
                    {accentColor === c.value && <Check className="h-3 w-3 text-white" />}
                  </button>
                ))}
              </div>

              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:bg-destructive/10 rounded-xl py-2.5 cursor-pointer" 
                onSelect={(e) => {
                  e.preventDefault()
                  handleReset()
                }}
              >
                <Trash2 className="mr-3 h-4 w-4" /> Reset Now
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Header Info */}
        <div className="text-center mb-4 md:mb-6">
          <h2 className="text-lg md:text-2xl font-black text-foreground mb-1 tracking-tight line-clamp-1">{habitName}</h2>
          <div className="flex items-center justify-center space-x-2">
            <span className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
            <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.4em] opacity-30">Tracking</span>
          </div>
        </div>
        
        {/* Timer Grid */}
        <div className="grid grid-cols-2 gap-x-4 md:gap-x-8 gap-y-2 md:gap-y-4 w-full px-2">
          <TimeBox value={elapsed.days} label="Days" color={accentColor} />
          <TimeBox value={elapsed.hours} label="Hours" color={accentColor} />
          <TimeBox value={elapsed.minutes} label="Minutes" color={accentColor} />
          <TimeBox value={elapsed.seconds} label="Seconds" color={accentColor} />
        </div>
        
        {/* Visual Progress Bar */}
        <div className="mt-6 md:mt-8 w-16 h-1 bg-secondary rounded-full overflow-hidden shrink-0">
          <div 
            className="h-full animate-pulse transition-all duration-1000" 
            style={{ width: '100%', backgroundColor: accentColor }} 
          />
        </div>
      </div>

      {/* Dialogs - Controlled independently to prevent UI lock */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="sm:max-w-[400px] rounded-[24px] p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Rename Habit</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="name" className="text-[10px] font-bold uppercase opacity-50 mb-2 block">New Name</Label>
            <Input
              id="name"
              value={tempHabitName}
              onChange={(e) => setTempHabitName(e.target.value)}
              className="rounded-xl h-12 text-base font-bold"
              placeholder="Ex: No Sweets"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateName} className="w-full h-12 rounded-xl text-base font-bold">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
        <DialogContent className="sm:max-w-[400px] rounded-[24px] p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Select Start Date</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={handleUpdateDate}
              initialFocus
              className="rounded-2xl border p-2"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
