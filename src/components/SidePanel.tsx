"use client"

import * as React from "react"
import { X, ChevronLeft } from "lucide-react"
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
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div
        className={cn(
          "relative bg-background w-[90%] max-w-md h-[80%] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-transform duration-500 ease-out",
          isOpen ? "translate-x-0" : side === "left" ? "-translate-x-full" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold font-headline">{title}</h2>
          <div className="w-10" /> {/* Spacer for symmetry */}
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
