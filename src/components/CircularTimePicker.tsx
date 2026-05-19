"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CircularTimePickerProps {
  mode: 'hours' | 'minutes'
  value: number
  onChange: (value: number) => void
  onComplete: () => void
}

export function CircularTimePicker({ mode, value, onChange, onComplete }: CircularTimePickerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const isDragging = React.useRef(false)

  const count = mode === 'hours' ? 24 : 60
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
    
    const newValue = Math.round(angle / step) % count
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
      // تأخير بسيط للانتقال للمرحلة التالية ليعرف المستخدم القيمة المختارة
      setTimeout(onComplete, 200)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 select-none touch-none">
      <div className="mb-6 text-center">
        <span className="text-4xl font-black text-primary tabular-nums">
          {value.toString().padStart(2, '0')}
        </span>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">
          {mode === 'hours' ? 'اختر الساعة (0-23)' : 'اختر الدقيقة (0-59)'}
        </p>
      </div>

      <div 
        ref={containerRef}
        className="relative w-64 h-64 rounded-full bg-secondary/30 border-4 border-white shadow-inner flex items-center justify-center cursor-crosshair"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* Center Point */}
        <div className="absolute w-2 h-2 bg-primary rounded-full z-20" />
        
        {/* Hand */}
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

        {/* Numbers */}
        {Array.from({ length: mode === 'hours' ? 12 : 12 }).map((_, i) => {
          const num = mode === 'hours' ? (i === 0 ? 12 : i) : i * 5
          const angle = (i * 30) * (Math.PI / 180)
          const radius = 100
          return (
            <div 
              key={i}
              className="absolute text-xs font-black opacity-30"
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
    </div>
  )
}
