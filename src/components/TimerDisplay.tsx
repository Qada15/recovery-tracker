"use client"

import * as React from "react"
import { History, MoreVertical, Settings2, RotateCcw, RefreshCw, Sparkles, Heart, Zap, Moon, Sun, Target, Shield, Flame, Cloud, Ghost, Trash2, Trophy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const ICON_MAP = {
  Sparkles, Heart, Zap, Moon, Sun, Target, Shield, Flame, Cloud, Ghost
}

const AVAILABLE_COLORS = [
  "hsl(212 100% 45%)", // Blue
  "hsl(160 84% 39%)",  // Emerald
  "hsl(346 84% 61%)",  // Rose
  "hsl(38 92% 50%)",   // Amber
  "hsl(262 83% 58%)",  // Violet
  "hsl(215 25% 27%)",  // Slate
]

const CHALLENGES = [
  { days: 3, labelAr: "تحدي 3 أيام", labelEn: "3 Days Challenge" },
  { days: 7, labelAr: "تحدي أسبوع", labelEn: "1 Week Challenge" },
  { days: 14, labelAr: "تحدي أسبوعين", labelEn: "2 Weeks Challenge" },
  { days: 30, labelAr: "تحدي شهر", labelEn: "1 Month Challenge" },
  { days: 60, labelAr: "تحدي شهرين", labelEn: "2 Months Challenge" },
  { days: 90, labelAr: "تحدي 3 أشهر", labelEn: "3 Months Challenge" },
  { days: 180, labelAr: "تحدي 6 أشهر", labelEn: "6 Months Challenge" },
  { days: 365, labelAr: "تحدي سنة", labelEn: "1 Year Challenge" },
]

const LiveClock = React.memo(({ startDate, language, color }: { startDate: Date; language: 'ar' | 'en'; color: string }) => {
  const [elapsed, setElapsed] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 })
  const isAr = language === 'ar'

  React.useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime()
      const start = startDate.getTime()
      const d = Math.max(0, now - start)
      setElapsed({
        seconds: Math.floor((d / 1000) % 60),
        minutes: Math.floor((d / 1000 / 60) % 60),
        hours: Math.floor((d / (1000 * 60 * 60)) % 24),
        days: Math.floor(d / (1000 * 60 * 60 * 24)),
        totalMs: d
      })
    }
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [startDate])

  const challengeInfo = React.useMemo(() => {
    const currentDays = elapsed.totalMs / (1000 * 60 * 60 * 24)
    const nextChallengeIndex = CHALLENGES.findIndex(c => c.days > currentDays)
    
    if (nextChallengeIndex === -1) {
      return { 
        label: isAr ? "بطل التعافي" : "Recovery Hero", 
        progress: 100,
        targetDays: CHALLENGES[CHALLENGES.length - 1].days 
      }
    }

    const nextChallenge = CHALLENGES[nextChallengeIndex]
    const prevDays = nextChallengeIndex === 0 ? 0 : CHALLENGES[nextChallengeIndex - 1].days
    const range = nextChallenge.days - prevDays
    const currentInRange = currentDays - prevDays
    const progress = Math.min(100, (currentInRange / range) * 100)

    return {
      label: isAr ? nextChallenge.labelAr : nextChallenge.labelEn,
      progress,
      targetDays: nextChallenge.days
    }
  }, [elapsed.totalMs, isAr])

  const displayUnit = React.useMemo(() => {
    if (elapsed.days > 0) return { value: elapsed.days, label: isAr ? "يوم" : "Day" }
    if (elapsed.hours > 0) return { value: elapsed.hours, label: isAr ? "ساعة" : "Hour" }
    if (elapsed.minutes > 0) return { value: elapsed.minutes, label: isAr ? "دقيقة" : "Min" }
    return { value: elapsed.seconds, label: isAr ? "ثانية" : "Sec" }
  }, [elapsed, isAr])

  const radius = 90
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (challengeInfo.progress / 100) * circumference

  return (
    <div className="w-full flex flex-col items-center shrink-0">
      <div className="relative flex items-center justify-center mb-6">
        <svg className="absolute w-56 h-56 -rotate-90 pointer-events-none">
          <circle
            cx="112"
            cy="112"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            className="text-slate-200 dark:text-slate-800"
          />
          <circle
            cx="112"
            cy="112"
            r={radius}
            stroke={color}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            style={{ 
              strokeDashoffset,
              transition: 'stroke-dashoffset 1s linear',
              filter: `drop-shadow(0 0 12px ${color})`
            }}
            strokeLinecap="round"
          />
        </svg>

        <div className="w-40 h-40 rounded-full flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 animate-pulse" style={{ backgroundColor: color }} />
          <span className="text-7xl font-black tabular-nums leading-none relative z-10" style={{ color: color }}>
            {displayUnit.value}
          </span>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2 relative z-10">
            {displayUnit.label}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center mb-6 w-full max-w-sm px-4">
        <div className="flex items-center gap-1.5 px-6 py-2 rounded-full mb-3 shadow-sm" style={{ backgroundColor: `${color}1A` }}>
          <Trophy className="h-4 w-4" style={{ color: color }} />
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: color }}>{challengeInfo.label}</span>
        </div>
        <div className="w-full grid grid-cols-5 items-center gap-2 py-3 px-6 bg-white dark:bg-slate-900 rounded-3xl border shadow-sm">
          <div className="text-center">
            <span className="text-2xl font-black text-slate-700 dark:text-slate-200 tabular-nums">{elapsed.hours}</span>
            <p className="text-[8px] font-black uppercase opacity-40 mt-1">{isAr ? "ساعة" : "H"}</p>
          </div>
          <span className="text-xl font-black text-slate-300 text-center">:</span>
          <div className="text-center">
            <span className="text-2xl font-black text-slate-700 dark:text-slate-200 tabular-nums">{elapsed.minutes}</span>
            <p className="text-[8px] font-black uppercase opacity-40 mt-1">{isAr ? "دقيقة" : "M"}</p>
          </div>
          <span className="text-xl font-black text-slate-300 text-center">:</span>
          <div className="text-center">
            <span className="text-2xl font-black text-slate-700 dark:text-slate-200 tabular-nums">{elapsed.seconds}</span>
            <p className="text-[8px] font-black uppercase opacity-40 mt-1">{isAr ? "ثانية" : "S"}</p>
          </div>
        </div>
      </div>
    </div>
  )
})
LiveClock.displayName = "LiveClock"

interface TimerDisplayProps {
  externalStartDate: Date
  externalHabitName: string
  externalHabitIcon?: string
  externalAccentColor: string
  resetDates: Date[]
  onOpenHistory: () => void
  onUpdateName: (name: string) => void
  onUpdateColor: (color: string) => void
  onReset: () => void
  onDelete: () => void
  onClearData: () => void
  language: 'ar' | 'en'
}

export const TimerDisplay = React.memo(({ 
  externalStartDate, 
  externalHabitName, 
  externalHabitIcon = 'Sparkles',
  externalAccentColor,
  onOpenHistory,
  onUpdateName,
  onUpdateColor,
  onReset,
  onDelete,
  onClearData,
  language
}: TimerDisplayProps) => {
  const [showSettingsDialog, setShowSettingsDialog] = React.useState(false)
  const [tempHabitName, setTempHabitName] = React.useState(externalHabitName)
  const [tempColor, setTempColor] = React.useState(externalAccentColor)
  
  const isAr = language === 'ar'
  const IconComponent = ICON_MAP[externalHabitIcon as keyof typeof ICON_MAP] || Sparkles
  
  const handleSaveSettings = React.useCallback(() => {
    if (tempHabitName.trim()) {
      onUpdateName(tempHabitName)
    }
    onUpdateColor(tempColor)
    setShowSettingsDialog(false)
  }, [tempHabitName, tempColor, onUpdateName, onUpdateColor])

  return (
    <div className="w-full flex flex-col items-center h-full max-w-[480px] mx-auto overflow-hidden">
      {/* Header section */}
      <div className="w-full flex items-center justify-between px-6 pt-6 mb-4 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:bg-slate-50 transition-colors">
              <MoreVertical className="h-5 w-5 text-slate-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isAr ? "end" : "start"} className="rounded-2xl w-52 p-2 z-[60]">
            <DropdownMenuItem onClick={onReset} className="text-red-500 font-black p-3 text-xs focus:bg-red-50 dark:focus:bg-red-950">
              <RefreshCw className="h-4 w-4 ml-2" /> {isAr ? "تصفير العداد" : "Reset Tracker"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowSettingsDialog(true)} className="p-3 font-black text-xs">
              <Settings2 className="h-4 w-4 ml-2" /> {isAr ? "تعديل العداد" : "Edit Tracker"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onClearData} className="text-orange-500 font-black p-3 text-xs focus:bg-orange-50 dark:focus:bg-orange-950">
              <RotateCcw className="h-4 w-4 ml-2" /> {isAr ? "حذف السجلات" : "Clear Records"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-600 font-black p-3 text-xs focus:bg-red-100 dark:focus:bg-red-900">
              <Trash2 className="h-4 w-4 ml-2" /> {isAr ? "حذف العداد نهائياً" : "Delete Habit"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-3">
          <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight truncate max-w-[180px]">{externalHabitName}</h3>
          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
            <IconComponent className="h-5 w-5" style={{ color: externalAccentColor }} />
          </div>
        </div>
      </div>

      {/* Main Clock section */}
      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0">
        <LiveClock startDate={externalStartDate} language={language} color={externalAccentColor} />
      </div>

      {/* Bottom Action Section - Reduced padding to stay above tabs */}
      <div className="w-full px-6 pb-6 shrink-0">
        <Button 
          onClick={onOpenHistory} 
          className="w-full h-16 rounded-[2rem] bg-slate-900 dark:bg-slate-800 text-white font-black text-lg flex items-center justify-center gap-4 shadow-xl active:scale-[0.97] transition-all hover:bg-slate-800 dark:hover:bg-slate-700"
        >
          <History className="h-6 w-6" /> {isAr ? "سجل الرحلة" : "Journey Log"}
        </Button>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="rounded-[2.5rem] p-6 max-w-[340px] z-[100]">
          <DialogHeader><DialogTitle className="text-center font-black text-lg">{isAr ? "تعديل العداد" : "Edit Tracker"}</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">{isAr ? "اسم العداد" : "Habit Name"}</label>
              <Input 
                value={tempHabitName} 
                onChange={(e) => setTempHabitName(e.target.value)} 
                className="text-center font-black h-12 rounded-xl text-base bg-slate-50 border-none" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">{isAr ? "لون العداد" : "Habit Color"}</label>
              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_COLORS.map((color) => (
                  <button 
                    key={color} 
                    onClick={() => setTempColor(color)} 
                    className={cn(
                      "h-10 rounded-xl flex items-center justify-center transition-all border-4",
                      tempColor === color ? "border-slate-800 scale-105" : "border-transparent opacity-60"
                    )}
                    style={{ backgroundColor: color }}
                  >
                    {tempColor === color && <Check className="h-4 w-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={handleSaveSettings} className="w-full h-12 rounded-xl font-black text-base shadow-lg">{isAr ? "حفظ التغييرات" : "Save Changes"}</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
})
TimerDisplay.displayName = "TimerDisplay"
