"use client"

import * as React from "react"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidePanelProps {
  isOpen: boolean
  onClose: () => void
  side: "left" | "right"
  title: string
  children: React.ReactNode
}

export function SidePanel({ isOpen, onClose, side, title, children }: SidePanelProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] cursor-pointer" onClick={onClose} />
      
      <div
        className={cn(
          "relative bg-background w-[92%] max-w-sm h-auto max-h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden transition-transform duration-500 ease-out",
          isOpen ? "translate-y-0 scale-100" : "translate-y-10 scale-95"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shrink-0">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-10 w-10">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-lg font-black tracking-tight">{title}</h2>
          <div className="w-10" />
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
