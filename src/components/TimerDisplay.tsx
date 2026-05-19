"use client"

import * as React from "react"
import { getFromStorage, STORAGE_KEYS } from "@/lib/storage"

export function TimerDisplay() {
  const [elapsed, setElapsed] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  React.useEffect(() => {
    const updateTimer = () => {
      const storedDate = getFromStorage(STORAGE_KEYS.START_DATE)
      if (!storedDate) return

      const start = new Date(storedDate).getTime()
      const now = new Date().getTime()
      const diff = now - start

      if (diff < 0) return

      const seconds = Math.floor((diff / 1000) % 60)
      const minutes = Math.floor((diff / 1000 / 60) % 60)
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))

      setElapsed({ days, hours, minutes, seconds })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [])

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center justify-center p-2">
      <span className="text-4xl md:text-5xl font-bold font-headline text-primary">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1 font-medium">
        {label}
      </span>
    </div>
  )

  return (
    <div className="aspect-square w-full max-w-[320px] bg-white rounded-3xl shadow-xl border border-primary/10 flex flex-col items-center justify-center p-8 transition-transform hover:scale-[1.02] duration-300">
      <div className="mb-4 text-center">
        <span className="text-sm font-semibold text-accent uppercase tracking-tighter">Current Progress</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 w-full">
        <TimeBox value={elapsed.days} label="Days" />
        <TimeBox value={elapsed.hours} label="Hours" />
        <TimeBox value={elapsed.minutes} label="Minutes" />
        <TimeBox value={elapsed.seconds} label="Seconds" />
      </div>
      
      <div className="mt-6 w-16 h-1.5 bg-accent/20 rounded-full overflow-hidden">
        <div className="h-full bg-accent animate-pulse w-full" />
      </div>
    </div>
  )
}
