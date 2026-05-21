
"use client"

import * as React from "react"
import { Settings, User, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TimerDisplay } from "@/components/TimerDisplay"
import { JourneyLog } from "@/components/JourneyLog"
import { saveToStorage, getFromStorage, STORAGE_KEYS, type Habit } from "@/lib/storage"
import { parseISO, setHours, setMinutes, isSameDay, startOfDay } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { CircularTimePicker } from "./CircularTimePicker"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const TRANSLATIONS = {
  ar: {
    title: "نقاهة",
    subtitle: "المتابعة",
    motivation: "أنت تبلي بلاءً حسنًا!",
    addHabit: "إضافة عداد جديد",
    setupTitle: "إعداد العداد",
    save: "حفظ",
    cancel: "إلغاء",
    confirmDelete: "سيتم حذف كافة البيانات نهائياً.",
    confirmClear: "سيتم تصفير السجل وحذف كافة الزلات والرغبات لهذا العداد.",
    historyCleared: "تم تصفير السجل"
  },
  en: {
    title: "Recovery",
    subtitle: "Tracking",
    motivation: "You are doing great!",
    addHabit: "Add New Tracker",
    setupTitle: "Setup Tracker",
    save: "Save",
    cancel: "Cancel",
    confirmDelete: "All data will be permanently deleted.",
    confirmClear: "All relapses and urges for this tracker will be deleted.",
    historyCleared: "History Cleared"
  }
}

export function RecoveryTrackerApp() {
  const { toast } = useToast()
  const [mounted, setMounted] = React.useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false)
  const [isSetupOpen, setIsSetupOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isClearDataOpen, setIsClearDataOpen] = React.useState(false)
  const [setupStep, setSetupStep] = React.useState<'name' | 'date' | 'hour' | 'minute'>('name')

  const [language] = React.useState<'ar' | 'en'>('ar')
  const [habits, setHabits] = React.useState<Habit[]>([])
  const [activeHabitId, setActiveHabitId] = React.useState<string | null>(null)

  const [tempName, setTempName] = React.useState("")
  const [tempDate, setTempDate] = React.useState<Date>(new Date())
  const [tempHour, setTempHour] = React.useState(new Date().getHours())
  const [tempMinute, setTempMinute] = React.useState(new Date().getMinutes())

  React.useEffect(() => {
    setMounted(true)
    const savedHabits = getFromStorage(STORAGE_KEYS.HABITS)
    const savedActiveId = getFromStorage(STORAGE_KEYS.ACTIVE_HABIT_ID)

    if (savedHabits) {
      try {
        const parsed = JSON.parse(savedHabits)
        setHabits(parsed)
        if (savedActiveId && parsed.some((h: Habit) => h.id === savedActiveId)) {
          setActiveHabitId(savedActiveId)
        } else if (parsed.length > 0) {
          setActiveHabitId(parsed[0].id)
        }
      } catch (e) { console.error("Parse error") }
    }
  }, [])

  const activeHabit = React.useMemo(() => habits.find(h => h.id === activeHabitId), [habits, activeHabitId]);

  const activeHabitData = React.useMemo(() => {
    if (!activeHabit) return null;
    return {
      startDate: parseISO(activeHabit.startDate),
      resetDates: activeHabit.resetDates.map(d => parseISO(d)),
      urgeDates: (activeHabit.urgeDates || []).map(d => parseISO(d))
    };
  }, [activeHabit]);

  if (!mounted) return null

  const t = TRANSLATIONS[language]
  const isAr = language === 'ar'

  const updateHabits = (newHabits: Habit[]) => {
    setHabits(newHabits)
    saveToStorage(STORAGE_KEYS.HABITS, JSON.stringify(newHabits))
  }

  const handleFinishSetup = () => {
    const finalDate = setMinutes(setHours(tempDate, tempHour), tempMinute)
    const newHabit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      name: tempName,
      startDate: finalDate.toISOString(),
      resetDates: [finalDate.toISOString()],
      urgeDates: [],
      color: 'hsl(var(--accent))'
    }
    const newHabits = [...habits, newHabit]
    updateHabits(newHabits)
    setActiveHabitId(newHabit.id)
    saveToStorage(STORAGE_KEYS.ACTIVE_HABIT_ID, newHabit.id)
    setIsSetupOpen(false)
    setSetupStep('name')
    setTempName("")
  }

  const handleUpdateActiveHabit = (updates: Partial<Habit>) => {
    if (!activeHabitId) return
    const newHabits = habits.map(h => h.id === activeHabitId ? { ...h, ...updates } : h)
    updateHabits(newHabits)
  }

  const handleResetAction = () => {
    if (!activeHabit) return
    const now = new Date()
    const currentResets = activeHabit.resetDates.map(d => parseISO(d))
    const newResets = [...currentResets, now].sort((a, b) => a.getTime() - b.getTime())
    handleUpdateActiveHabit({
      startDate: now.toISOString(),
      resetDates: newResets.map(d => d.toISOString())
    })
  }

  const handleUrgeAction = () => {
    if (!activeHabit) return
    const now = new Date()
    const newUrges = [...(activeHabit.urgeDates || []), now.toISOString()]
    handleUpdateActiveHabit({ urgeDates: newUrges })
  }

  return (
    <div className="flex-1 flex flex-col items-center bg-slate-50 dark:bg-slate-950 relative h-full overflow-hidden select-none touch-none" dir={isAr ? 'rtl' : 'ltr'}>
      <header className="w-full h-16 flex items-center justify-between px-6 z-40 shrink-0">
        <Button variant="ghost" size="icon" className="rounded-full text-slate-400">
          <User className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-black text-slate-700 dark:text-white tracking-tighter">{t.title}</h1>
        <Button variant="ghost" size="icon" className="rounded-full text-slate-400">
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      <main className="flex-1 w-full flex flex-col items-center p-6 pt-2 overflow-hidden">
        {activeHabit && activeHabitData ? (
          <div className="w-full flex flex-col items-center space-y-6 h-full">
            <div className="text-center space-y-1">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">{t.subtitle}</h2>
              <p className="text-sm font-bold text-slate-400">{t.motivation}</p>
            </div>

            <TimerDisplay 
              externalStartDate={activeHabitData.startDate} 
              externalHabitName={activeHabit.name}
              externalAccentColor={activeHabit.color}
              resetDates={activeHabitData.resetDates}
              urgeDates={activeHabitData.urgeDates}
              onOpenHistory={() => setIsHistoryOpen(true)}
              onUpdateDate={(d) => {
                const currentResets = activeHabit.resetDates.map(rd => parseISO(rd));
                const filtered = currentResets.filter(rd => !isSameDay(rd, activeHabitData.startDate));
                const newResets = [...filtered, d].sort((a, b) => a.getTime() - b.getTime());
                handleUpdateActiveHabit({ startDate: d.toISOString(), resetDates: newResets.map(rd => rd.toISOString()) });
              }}
              onUpdateName={(name) => handleUpdateActiveHabit({ name })}
              onUpdateColor={(color) => handleUpdateActiveHabit({ color })}
              onReset={handleResetAction}
              onUrge={handleUrgeAction}
              onDelete={() => setIsDeleteDialogOpen(true)}
              onClearData={() => setIsClearDataOpen(true)}
              language={language}
            />

            <div className="w-full mt-auto pb-10">
              <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar px-4 w-full justify-center">
                <button onClick={() => setIsSetupOpen(true)} className="shrink-0 w-16 h-16 rounded-[1.5rem] bg-slate-800 text-white flex items-center justify-center shadow-xl">
                  <Plus className="h-6 w-6" />
                </button>
                {habits.map((habit) => (
                  <button
                    key={habit.id}
                    onClick={() => { setActiveHabitId(habit.id); saveToStorage(STORAGE_KEYS.ACTIVE_HABIT_ID, habit.id); }}
                    className={`shrink-0 h-24 w-20 rounded-[1.5rem] flex flex-col items-center justify-center gap-2 border-2 transition-all ${
                      activeHabitId === habit.id ? "bg-white border-slate-800 text-slate-800 shadow-2xl" : "bg-transparent border-transparent text-slate-400 opacity-60"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                       <Sparkles className="h-5 w-5" style={{ color: habit.color }} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tighter">{habit.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <button onClick={() => setIsSetupOpen(true)} className="w-32 h-32 rounded-[3rem] bg-slate-800 text-white shadow-2xl flex items-center justify-center">
              <Plus className="h-12 w-12" />
            </button>
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">{t.addHabit}</p>
          </div>
        )}
      </main>

      {activeHabit && activeHabitData && (
        <JourneyLog 
          isOpen={isHistoryOpen} 
          onClose={() => setIsHistoryOpen(false)} 
          startDate={activeHabitData.startDate}
          resetDates={activeHabitData.resetDates}
          urgeDates={activeHabitData.urgeDates}
          habitName={activeHabit.name}
          accentColor={activeHabit.color}
          onReset={(date) => {
            const currentResets = activeHabit.resetDates.map(d => parseISO(d));
            const newResets = [...currentResets, date].sort((a, b) => a.getTime() - b.getTime());
            handleUpdateActiveHabit({
              startDate: newResets[newResets.length - 1].toISOString(),
              resetDates: newResets.map(d => d.toISOString())
            });
          }} 
          onRemoveReset={(date) => {
             const newResets = activeHabit.resetDates.filter(d => !isSameDay(parseISO(d), date));
             if (newResets.length === 0) return;
             const sorted = newResets.map(d => parseISO(d)).sort((a, b) => a.getTime() - b.getTime());
             handleUpdateActiveHabit({ 
               startDate: sorted[sorted.length - 1].toISOString(), 
               resetDates: sorted.map(d => d.toISOString()) 
             });
          }}
          onUrge={(date) => {
            const newUrges = [...(activeHabit.urgeDates || []), date.toISOString()];
            handleUpdateActiveHabit({ urgeDates: newUrges });
          }}
          onRemoveUrge={(date) => {
            const newUrges = (activeHabit.urgeDates || []).filter(d => !isSameDay(parseISO(d), date));
            handleUpdateActiveHabit({ urgeDates: newUrges });
          }}
          language={language}
        />
      )}

      <Dialog open={isSetupOpen} onOpenChange={setIsSetupOpen}>
        <DialogContent className="rounded-[2.5rem] p-8 max-w-[420px]">
          <DialogHeader><DialogTitle className="text-center font-black">{t.setupTitle}</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center min-h-[350px] justify-center">
            {setupStep === 'name' && (
              <div className="w-full space-y-6">
                <Input value={tempName} onChange={(e) => setTempName(e.target.value)} placeholder={isAr ? "اسم العداد..." : "Habit name..."} className="h-16 rounded-[1.5rem] text-center font-bold text-lg" />
                <Button disabled={!tempName.trim()} onClick={() => setSetupStep('date')} className="w-full h-16 rounded-[1.5rem] font-black bg-slate-800 text-lg">{t.save}</Button>
              </div>
            )}
            {setupStep === 'date' && (
              <Calendar mode="single" selected={tempDate} onSelect={(date) => { if(date) { setTempDate(date); setSetupStep('hour'); } }} className="rounded-3xl border p-4" />
            )}
            {setupStep === 'hour' && <CircularTimePicker mode="hours" value={tempHour} onChange={setTempHour} onComplete={() => setSetupStep('minute')} />}
            {setupStep === 'minute' && <CircularTimePicker mode="minutes" value={tempMinute} onChange={setTempMinute} onComplete={handleFinishSetup} />}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isClearDataOpen} onOpenChange={setIsClearDataOpen}>
        <AlertDialogContent className="rounded-[2.5rem]">
          <AlertDialogHeader><AlertDialogTitle className="font-black">حذف سجلات العداد</AlertDialogTitle><AlertDialogDescription>{t.confirmClear}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="rounded-xl">{t.cancel}</AlertDialogCancel><AlertDialogAction onClick={() => {
            if (!activeHabit) return;
            const now = new Date();
            handleUpdateActiveHabit({ startDate: now.toISOString(), resetDates: [now.toISOString()], urgeDates: [] });
            setIsClearDataOpen(false);
            toast({ title: t.historyCleared });
          }} className="bg-orange-500 rounded-xl">{t.save}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2.5rem]">
          <AlertDialogHeader><AlertDialogTitle className="font-black">{isAr ? "تأكيد الحذف" : "Confirm Delete"}</AlertDialogTitle><AlertDialogDescription>{t.confirmDelete}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="rounded-xl">{t.cancel}</AlertDialogCancel><AlertDialogAction onClick={() => {
            const newHabits = habits.filter(h => h.id !== activeHabitId);
            updateHabits(newHabits);
            setActiveHabitId(newHabits[0]?.id || null);
            setIsDeleteDialogOpen(false);
          }} className="bg-red-500 rounded-xl">{isAr ? "حذف" : "Delete"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
