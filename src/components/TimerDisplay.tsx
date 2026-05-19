
"use client"

import * as React from "react"
import { MoreVertical, Edit2, Calendar as CalendarIcon, Trash2, Palette, Check } from "lucide-react"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
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

export function TimerDisplay() {
  const { toast } = useToast()
  const [habitName, setHabitName] = React.useState("Abstinence")
  const [accentColor, setAccentColor] = React.useState('hsl(var(--accent))')
  const [elapsed, setElapsed] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  // Dialog states
  const [isEditNameOpen, setIsEditNameOpen] = React.useState(false)
  const [tempHabitName, setTempHabitName] = React.useState("")
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false)
  const [startDate, setStartDate] = React.useState<Date>(new Date())

  const refreshData = React.useCallback(() => {
    const storedName = getFromStorage(STORAGE_KEYS.HABIT_NAME)
    const storedColor = getFromStorage(STORAGE_KEYS.HABIT_COLOR)
    const storedDate = getFromStorage(STORAGE_KEYS.START_DATE)

    if (storedName) {
      setHabitName(storedName)
      setTempHabitName(storedName)
    }
    if (storedColor) setAccentColor(storedColor)
    if (storedDate) setStartDate(new Date(storedDate))
  }, [])

  React.useEffect(() => {
    refreshData()
    const updateTimer = () => {
      const storedDate = getFromStorage(STORAGE_KEYS.START_DATE)
      if (!storedDate) return

      const start = new Date(storedDate).getTime()
      const now = new Date().getTime()
      const diff = now - start

      if (diff < 0) {
        setElapsed({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const seconds = Math.floor((diff / 1000) % 60)
      const minutes = Math.floor((diff / 1000 / 60) % 60)
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))

      setElapsed({ days, hours, minutes, seconds })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    
    // Listen for storage changes in same window (via custom event if needed)
    const handleRefresh = () => refreshData()
    window.addEventListener('storage-update', handleRefresh)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage-update', handleRefresh)
    }
  }, [refreshData])

  const handleUpdateName = () => {
    if (!tempHabitName.trim()) return
    saveToStorage(STORAGE_KEYS.HABIT_NAME, tempHabitName)
    setHabitName(tempHabitName)
    setIsEditNameOpen(false)
    window.dispatchEvent(new Event('storage-update'))
    toast({ title: "Updated", description: "Habit name updated successfully." })
  }

  const handleUpdateColor = (color: string) => {
    saveToStorage(STORAGE_KEYS.HABIT_COLOR, color)
    setAccentColor(color)
    toast({ title: "Color Changed", description: "The counter color has been updated." })
  }

  const handleUpdateDate = (date: Date | undefined) => {
    if (!date) return
    const isoDate = date.toISOString()
    saveToStorage(STORAGE_KEYS.START_DATE, isoDate)
    setStartDate(date)
    setIsDatePickerOpen(false)
    toast({ title: "Date Reset", description: `Counter started from ${format(date, "PPP")}` })
  }

  const handleReset = () => {
    const now = new Date().toISOString()
    saveToStorage(STORAGE_KEYS.START_DATE, now)
    setStartDate(new Date())
    toast({ title: "Counter Reset", description: "The journey restarts now." })
  }

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center justify-center p-4">
      <span className="text-5xl md:text-7xl font-bold font-headline transition-colors duration-500" style={{ color: accentColor }}>
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-2 font-bold opacity-70">
        {label}
      </span>
    </div>
  )

  return (
    <div className="relative w-full max-w-[480px] group">
      {/* The Window Container */}
      <div className="aspect-square w-full bg-white rounded-[40px] shadow-2xl border border-primary/5 flex flex-col items-center justify-center p-10 relative overflow-hidden transition-all hover:shadow-primary/10 hover:scale-[1.01] duration-500">
        
        {/* Top Options Bar */}
        <div className="absolute top-6 right-6 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary">
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuLabel>Manage Counter</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsEditNameOpen(true)}>
                <Edit2 className="mr-2 h-4 w-4" /> Change Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDatePickerOpen(true)}>
                <CalendarIcon className="mr-2 h-4 w-4" /> Set Start Date
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-sm font-semibold">Change Color</div>
              <div className="grid grid-cols-6 gap-1 p-2">
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
              <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={handleReset}>
                <Trash2 className="mr-2 h-4 w-4" /> Reset / Clear
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Inner Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-1">{habitName}</h2>
          <span className="text-xs font-bold uppercase tracking-widest opacity-40">Progress Tracker</span>
        </div>
        
        <div className="grid grid-cols-2 gap-8 w-full">
          <TimeBox value={elapsed.days} label="Days" />
          <TimeBox value={elapsed.hours} label="Hours" />
          <TimeBox value={elapsed.minutes} label="Minutes" />
          <TimeBox value={elapsed.seconds} label="Seconds" />
        </div>
        
        {/* Progress bar visual */}
        <div className="mt-10 w-24 h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full animate-pulse transition-all duration-1000" 
            style={{ width: '100%', backgroundColor: accentColor }} 
          />
        </div>
      </div>

      {/* Edit Name Dialog */}
      <Dialog open={isEditNameOpen} onOpenChange={setIsEditNameOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Habit Name</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Habit Name</Label>
              <Input
                id="name"
                value={tempHabitName}
                onChange={(e) => setTempHabitName(e.target.value)}
                placeholder="e.g. Social Media Detox"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateName}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Date Picker Dialog */}
      <Dialog open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Start Date</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={handleUpdateDate}
              initialFocus
              className="rounded-md border shadow"
            />
            <p className="mt-4 text-sm text-muted-foreground">
              Current start: {format(startDate, "PPP")}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
