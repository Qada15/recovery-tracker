
"use client"

import * as React from "react"
import { History, Trophy, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const ICON_MAP = {
  Sparkles: (props: any) => <Sparkles {...props} />,
  Heart: (props: any) => import("lucide-react").then(m => <m.Heart {...props} />),
  Zap: (props: any) => import("lucide-react").then(m => <m.Zap {...props} />),
  Moon: (props: any) => import("lucide-react").then(m => <m.Moon {...props} />),
  Sun: (props: any) => import("lucide-react").then(m => <m.Sun {...props} />),
  Target: (props: any) => import("lucide-react").then(m => <m.Target {...props} />),
  Shield: (props: any) => import("lucide-react").then(m => <m.Shield {...props} />),
  Flame: (props: any) => import("lucide-react").then(m => <m.Flame {...props} />),
  Cloud: (props: any) => import("lucide-react").then(m => <m.Cloud {...props} />),
  Ghost: (props: any) => import("lucide-react").then(m => <m.Ghost {...props} />),
  Cigarette: (props: any) => import("lucide-react").then(m => <m.Cigarette {...props} />),
  Coffee: (props: any) => import("lucide-react").then(m => <m.Coffee {...props} />),
  Candy: (props: any) => import("lucide-react").then(m => <m.Candy {...props} />),
  Wine: (props: any) => import("lucide-react").then(m => <m.Wine {...props} />),
  Dices: (props: any) => import("lucide-react").then(m => <m.Dices {...props} />),
  Smartphone: (props: any) => import("lucide-react").then(m => <m.Smartphone {...props} />),
  Skull: (props: any) => import("lucide-react").then(m => <m.Skull {...props} />),
  Ban: (props: any) => import("lucide-react").then(m => <m.Ban {...props} />),
}

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
  language: 'ar' | 'en'
}

export const TimerDisplay = React.memo(({ 
  externalStartDate, 
  externalHabitName, 
  externalAccentColor,
  language
}: TimerDisplayProps) => {
  return (
    <div className="w-full flex flex-col items-center h-full max-w-[480px] mx-auto overflow-hidden">
      <div className="w-full flex items-center justify-center px-6 pt-6 mb-4 shrink-0">
        <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter truncate max-w-[280px]">
          {externalHabitName}
        </h3>
      </div>

      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0">
        <LiveClock startDate={externalStartDate} language={language} color={externalAccentColor} />
      </div>
    </div>
  )
})
TimerDisplay.displayName = "TimerDisplay"
