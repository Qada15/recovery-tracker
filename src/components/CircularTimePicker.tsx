"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CircularTimePickerProps {
  mode: 'hours' | 'minutes'
  value: number
  period?: 'AM' | 'PM'
  onChange: (value: number) => void
  onPeriodChange?: (period: 'AM' | 'PM') => void
  onComplete?: () => void
  language: 'ar' | 'en'
}

export function CircularTimePicker({ 
  mode, 
  value, 
  period, 
  onChange, 
  onPeriodChange, 
  onComplete,
  language
}: CircularTimePickerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const isDragging = React.useRef(false)

  const isAr = language === 'ar'
  const count = mode === 'hours' ? 12 : 60
  const step = 360 / count

  const handlePointer = (e: React.PointerEvent | PointerEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const x = e.clientX - centerX
    const y = e.clientY - centerY
    
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90
    if (angle < 0) angle += 360
    
    let newValue = Math.round(angle / step) % count
    if (mode === 'hours' && newValue === 0) newValue = 12
    
    onChange(newValue)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    handlePointer(e)
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId)
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (isDragging.current) {
      handlePointer(e)
    }
  }

  const onPointerUp = () => {
    if (isDragging.current) {
      isDragging.current = false
      // تمت إزالة الانتقال التلقائي بناءً على طلب المستخدم
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-2 select-none touch-none">
      <div className="mb-4 text-center">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-black text-primary tabular-nums">
            {value.toString().padStart(2, '0')}
          </span>
          {mode === 'hours' && period && (
            <span className="text-lg font-black text-slate-400">
              {period === 'AM' ? (isAr ? 'ص' : 'AM') : (isAr ? 'م' : 'PM')}
            </span>
          )}
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">
          {mode === 'hours' 
            ? (isAr ? 'اختر الساعة (1-12)' : 'Select Hour (1-12)') 
            : (isAr ? 'اختر الدقيقة (0-59)' : 'Select Minute (0-59)')}
        </p>
      </div>

      <div 
        ref={containerRef}
        className="relative w-56 h-56 rounded-full bg-secondary/30 border-4 border-white shadow-inner flex items-center justify-center cursor-crosshair mb-6"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className="absolute w-2 h-2 bg-primary rounded-full z-20" />
        
        <div 
          className="absolute bottom-1/2 left-1/2 w-1 bg-primary origin-bottom transition-all duration-150 ease-out z-10"
          style={{ 
            height: '40%',
            transform: `translateX(-50%) rotate(${value * step}deg)`,
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full shadow-lg flex items-center justify-center">
             <div className="w-1 h-1 bg-white rounded-full" />
          </div>
        </div>

        {Array.from({ length: 12 }).map((_, i) => {
          const num = mode === 'hours' ? (i === 0 ? 12 : i) : i * 5
          const angle = (i * 30) * (Math.PI / 180)
          const radius = 85
          return (
            <div 
              key={i}
              className="absolute text-xs font-black opacity-30 tabular-nums"
              style={{
                left: `calc(50% + ${Math.sin(angle) * radius}px)`,
                top: `calc(50% - ${Math.cos(angle) * radius}px)`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {num}
            </div>
          )
        })}
      </div>

      {mode === 'hours' && onPeriodChange && (
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-full max-w-[200px] shadow-inner">
          <button 
            type="button"
            onClick={() => onPeriodChange('AM')}
            className={cn(
              "flex-1 h-10 rounded-xl font-black text-xs transition-all",
              period === 'AM' ? "bg-white dark:bg-slate-700 text-primary shadow-sm scale-[1.02]" : "text-slate-400"
            )}
          >
            {isAr ? "صباحاً" : "AM"}
          </button>
          <button 
            type="button"
            onClick={() => onPeriodChange('PM')}
            className={cn(
              "flex-1 h-10 rounded-xl font-black text-xs transition-all",
              period === 'PM' ? "bg-white dark:bg-slate-700 text-primary shadow-sm scale-[1.02]" : "text-slate-400"
            )}
          >
            {isAr ? "مساءً" : "PM"}
          </button>
        </div>
      )}
    </div>
  )
}
