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
      {/* Backdrop - Click here to close */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] cursor-pointer" 
        onClick={onClose}
      />
      
      {/* Panel Content */}
      <div
        className={cn(
          "relative bg-background w-[90%] max-w-md h-[80%] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden transition-transform duration-500 ease-out",
          isOpen ? "translate-x-0 scale-100" : side === "left" ? "-translate-x-full scale-95" : "translate-x-full scale-95"
        )}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the panel
      >
        <div className="flex items-center justify-between p-6 border-b bg-white/50 backdrop-blur-md">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-secondary">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-xl font-black font-headline tracking-tight">{title}</h2>
          <div className="w-10" />
        </div>
        
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  )
}
