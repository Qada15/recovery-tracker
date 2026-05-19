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

const COLORS = [
  { name: 'Default', value: 'hsl(var(--accent))' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Violet', value: '#8b5cf6' },
]

// Component moved outside to prevent re-creation and focus loss during timer updates
function TimeBox({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-1 sm:p-2 shrink-0">
      <span 
        className="text-4xl sm:text-5xl md:text-7xl font-black font-headline transition-colors duration-500 tabular-nums tracking-tighter" 
        style={{ color: color }}
      >
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[8px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground mt-0.5 font-black opacity-60">
        {label}
      </span>
    </div>
  )
}

export function TimerDisplay() {
  const { toast } = useToast()
  
  // States
  const [habitName, setHabitName] = React.useState("Abstinence")
  const [accentColor, setAccentColor] = React.useState('hsl(var(--accent))')
  const [startDate, setStartDate] = React.useState<Date>(new Date())
  const [elapsed, setElapsed] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  // Dialog control states
  const [isEditNameOpen, setIsEditNameOpen] = React.useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false)
  const [tempHabitName, setTempHabitName] = React.useState("")

  // Load initial data
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

  // Timer logic
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

  const handleUpdateName = () => {
    if (!tempHabitName.trim()) return
    saveToStorage(STORAGE_KEYS.HABIT_NAME, tempHabitName)
    setHabitName(tempHabitName)
    setIsEditNameOpen(false)
    toast({ title: "Updated", description: "Habit name updated successfully." })
  }

  const handleUpdateColor = (color: string) => {
    saveToStorage(STORAGE_KEYS.HABIT_COLOR, color)
    setAccentColor(color)
    toast({ title: "Color Changed", description: "Counter accent color updated." })
  }

  const handleUpdateDate = (date: Date | undefined) => {
    if (!date) return
    saveToStorage(STORAGE_KEYS.START_DATE, date.toISOString())
    setStartDate(date)
    setIsDatePickerOpen(false)
    toast({ title: "Date Reset", description: `Counter starts from ${format(date, "PPP")}` })
  }

  const handleReset = () => {
    const now = new Date()
    saveToStorage(STORAGE_KEYS.START_DATE, now.toISOString())
    setStartDate(now)
    toast({ title: "Reset", description: "Your journey starts now." })
  }

  return (
    <div className="relative w-full max-w-[500px] px-2 animate-in fade-in zoom-in duration-500 shrink min-h-0">
      <div className="w-full bg-white rounded-[40px] md:rounded-[60px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-primary/5 flex flex-col items-center justify-center p-6 md:p-10 relative transition-all duration-500 overflow-hidden shrink min-h-0">
        
        {/* Options Trigger */}
        <div className="absolute top-4 right-4 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 md:h-10 md:w-10 hover:bg-secondary">
                <MoreVertical className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
              <DropdownMenuLabel className="px-3 py-2 text-xs font-black uppercase opacity-40">Counter Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                setTempHabitName(habitName)
                setIsEditNameOpen(true)
              }} className="rounded-xl py-3 cursor-pointer">
                <Edit2 className="mr-3 h-4 w-4" /> Edit Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDatePickerOpen(true)} className="rounded-xl py-3 cursor-pointer">
                <CalendarIcon className="mr-3 h-4 w-4" /> Set Start Date
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <div className="px-3 py-2 text-sm font-bold">Theme Color</div>
              <div className="grid grid-cols-6 gap-2 p-2">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => handleUpdateColor(c.value)}
                    className="w-7 h-7 rounded-full border border-black/5 flex items-center justify-center transition-transform hover:scale-125"
                    style={{ backgroundColor: c.value }}
                  >
                    {accentColor === c.value && <Check className="h-3 w-3 text-white" />}
                  </button>
                ))}
              </div>

              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:bg-destructive/10 rounded-xl py-3 cursor-pointer" onClick={handleReset}>
                <Trash2 className="mr-3 h-4 w-4" /> Reset Counter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Info */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-xl md:text-3xl font-black text-foreground mb-1 tracking-tight line-clamp-1">{habitName}</h2>
          <div className="flex items-center justify-center space-x-2">
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
            <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-30">Live Progress</span>
          </div>
        </div>
        
        {/* Timer Grid - More compact to fit screen */}
        <div className="grid grid-cols-2 gap-x-4 md:gap-x-10 gap-y-4 md:gap-y-8 w-full">
          <TimeBox value={elapsed.days} label="Days" color={accentColor} />
          <TimeBox value={elapsed.hours} label="Hours" color={accentColor} />
          <TimeBox value={elapsed.minutes} label="Minutes" color={accentColor} />
          <TimeBox value={elapsed.seconds} label="Seconds" color={accentColor} />
        </div>
        
        {/* Aesthetic Progress Bar */}
        <div className="mt-6 md:mt-10 w-20 h-1 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full animate-pulse transition-all duration-1000" 
            style={{ width: '100%', backgroundColor: accentColor }} 
          />
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditNameOpen} onOpenChange={setIsEditNameOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[32px] p-6">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-black">Edit Habit Name</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-xs font-bold uppercase opacity-50">New Name</Label>
              <Input
                id="name"
                value={tempHabitName}
                onChange={(e) => setTempHabitName(e.target.value)}
                className="rounded-2xl h-14 text-lg font-bold border-2 focus-visible:ring-offset-0"
                placeholder="Ex: Social Media Fast"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateName} className="w-full h-14 rounded-2xl text-lg font-bold">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Date Dialog */}
      <Dialog open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[32px] p-6">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-black">Select Start Date</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={handleUpdateDate}
              initialFocus
              className="rounded-[24px] border-2 shadow-sm p-4"
            />
            <div className="mt-6 p-4 bg-secondary/50 rounded-2xl w-full text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Selected Date</p>
              <p className="text-base font-black">{format(startDate, "PPP")}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
