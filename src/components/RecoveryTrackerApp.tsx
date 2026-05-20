
"use client"

import * as React from "react"
import { Settings, User, Plus, Sparkles, MoreVertical, Trash2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidePanel } from "@/components/SidePanel"
import { TimerDisplay } from "@/components/TimerDisplay"
import { JourneyLog } from "@/components/JourneyLog"
import { saveToStorage, getFromStorage, STORAGE_KEYS, clearAllStorage, type Habit } from "@/lib/storage"
import { parseISO, startOfDay, setHours, setMinutes } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
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
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { CircularTimePicker } from "./CircularTimePicker"

const TRANSLATIONS = {
  ar: {
    title: "نقاهة",
    subtitle: "المتابعة",
    motivation: "أنت تبلي بلاءً حسناً!",
    settings: "الإعدادات",
    account: "الحساب",
    addHabit: "إضافة عداد جديد",
    setupTitle: "إعداد العداد",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف العداد نهائياً",
    clearData: "حذف سجلات العداد",
    confirmDelete: "سيتم حذف كافة البيانات نهائياً.",
    confirmClear: "سيتم تصفير السجل وحذف كافة الزلات والرغبات لهذا العداد.",
    urgeRecorded: "تم تسجيل رغبة",
    historyCleared: "تم تصفير السجل"
  },
  en: {
    title: "Recovery",
    subtitle: "Tracking",
    motivation: "You are doing great!",
    settings: "Settings",
    account: "Account",
    addHabit: "Add New Tracker",
    setupTitle: "Setup Tracker",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete Tracker Permanently",
    clearData: "Clear Tracker Records",
    confirmDelete: "All data will be permanently deleted.",
    confirmClear: "All relapses and urges for this tracker will be deleted.",
    urgeRecorded: "Urge Recorded",
    historyCleared: "History Cleared"
  }
}

export function RecoveryTrackerApp() {
  const { toast } = useToast()
  const [mounted, setMounted] = React.useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [isAccountOpen, setIsAccountOpen] = React.useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false)
  const [isSetupOpen, setIsSetupOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isClearDataOpen, setIsClearDataOpen] = React.useState(false)
  const [setupStep, setSetupStep] = React.useState<'name' | 'date' | 'hour' | 'minute'>('name')

  const [language, setLanguage] = React.useState<'ar' | 'en'>('ar')
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light')
  
  const [habits, setHabits] = React.useState<Habit[]>([])
  const [activeHabitId, setActiveHabitId] = React.useState<string | null>(null)

  const [tempName, setTempName] = React.useState("")
  const [tempDate, setTempDate] = React.useState<Date>(new Date())
  const [tempHour, setTempHour] = React.useState(new Date().getHours())
  const [tempMinute, setTempMinute] = React.useState(new Date().getMinutes())

  React.useEffect(() => {
    setMounted(true)
    const savedLang = getFromStorage(STORAGE_KEYS.LANGUAGE) as 'ar' | 'en'
    const savedTheme = getFromStorage(STORAGE_KEYS.THEME) as 'light' | 'dark'
    const savedHabits = getFromStorage(STORAGE_KEYS.HABITS)
    const savedActiveId = getFromStorage(STORAGE_KEYS.ACTIVE_HABIT_ID)

    if (savedLang) setLanguage(savedLang)
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    }
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

  if (!mounted) return null

  const t = TRANSLATIONS[language]
  const isAr = language === 'ar'
  const activeHabit = habits.find(h => h.id === activeHabitId)

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

  const handleClearTrackerData = () => {
    if (!activeHabit) return
    const now = new Date()
    handleUpdateActiveHabit({
      startDate: now.toISOString(),
      resetDates: [now.toISOString()],
      urgeDates: []
    })
    setIsClearDataOpen(false)
    toast({ title: t.historyCleared })
  }

  const handleUrgeAction = () => {
    if (!activeHabit) return
    const now = new Date()
    const newUrges = [...(activeHabit.urgeDates || []), now.toISOString()]
    handleUpdateActiveHabit({ urgeDates: newUrges })
    toast({ title: t.urgeRecorded })
  }

  return (
    <div className="flex-1 flex flex-col items-center bg-slate-50 dark:bg-slate-950 relative h-full overflow-hidden select-none touch-none" dir={isAr ? 'rtl' : 'ltr'}>
      <header className="w-full h-16 flex items-center justify-between px-6 z-40 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => setIsAccountOpen(true)} className="rounded-full text-slate-400">
          <User className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-black text-slate-700 dark:text-white tracking-tighter">{t.title}</h1>
        <div className="flex items-center gap-1">
          {activeHabit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-slate-400">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl w-48">
                <DropdownMenuItem onClick={() => setIsClearDataOpen(true)} className="text-orange-500 font-bold">
                  <RefreshCw className="h-4 w-4 ml-2" /> {t.clearData}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-red-500 font-bold">
                  <Trash2 className="h-4 w-4 ml-2" /> {t.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} className="rounded-full text-slate-400">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col items-center p-6 pt-2 overflow-hidden">
        {activeHabit ? (
          <div className="w-full flex flex-col items-center space-y-6 animate-in fade-in duration-500 h-full">
            <div className="text-center space-y-1">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">{t.subtitle}</h2>
              <p className="text-sm font-bold text-slate-400">{t.motivation}</p>
            </div>

            <TimerDisplay 
              externalStartDate={parseISO(activeHabit.startDate)} 
              externalHabitName={activeHabit.name}
              externalAccentColor={activeHabit.color}
              resetDates={activeHabit.resetDates.map(d => parseISO(d))}
              onOpenHistory={() => setIsHistoryOpen(true)}
              onUpdateDate={(d) => handleUpdateActiveHabit({ startDate: d.toISOString(), resetDates: [...activeHabit.resetDates, d.toISOString()] })}
              onUpdateName={(name) => handleUpdateActiveHabit({ name })}
              onUpdateColor={(color) => handleUpdateActiveHabit({ color })}
              onReset={handleResetAction}
              onUrge={handleUrgeAction}
              onDelete={() => { updateHabits(habits.filter(h => h.id !== activeHabitId)); setActiveHabitId(habits[0]?.id || null); }}
              onClearData={handleClearTrackerData}
              language={language}
            />

            <div className="w-full mt-auto pb-10">
              <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar px-4 w-full justify-center">
                <button 
                  onClick={() => setIsSetupOpen(true)}
                  className="shrink-0 w-16 h-16 rounded-[1.5rem] bg-slate-800 text-white flex items-center justify-center shadow-xl active:scale-90 transition-transform"
                >
                  <Plus className="h-6 w-6" />
                </button>
                {habits.map((habit) => (
                  <button
                    key={habit.id}
                    onClick={() => setActiveHabitId(habit.id)}
                    className={`shrink-0 h-24 w-20 rounded-[1.5rem] flex flex-col items-center justify-center gap-2 border-2 transition-all active:scale-95 ${
                      activeHabitId === habit.id 
                        ? "bg-white border-slate-800 text-slate-800 shadow-2xl" 
                        : "bg-transparent border-transparent text-slate-400 opacity-60"
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
            <button 
              onClick={() => setIsSetupOpen(true)}
              className="w-32 h-32 rounded-[3rem] bg-slate-800 text-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex items-center justify-center hover:scale-105 active:scale-90 transition-all"
            >
              <Plus className="h-12 w-12" />
            </button>
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">{t.addHabit}</p>
          </div>
        )}
      </main>

      {activeHabit && (
        <JourneyLog 
          isOpen={isHistoryOpen} 
          onClose={() => setIsHistoryOpen(false)} 
          startDate={parseISO(activeHabit.startDate)}
          resetDates={activeHabit.resetDates.map(d => parseISO(d))}
          urgeDates={(activeHabit.urgeDates || []).map(d => parseISO(d))}
          habitName={activeHabit.name}
          accentColor={activeHabit.color}
          onReset={() => {}} 
          onRemoveReset={() => {}}
          onUrge={() => {}}
          onRemoveUrge={() => {}}
          language={language}
        />
      )}

      <Dialog open={isSetupOpen} onOpenChange={(open) => { setIsSetupOpen(open); if(!open) setSetupStep('name'); }}>
        <DialogContent className="rounded-[2.5rem] p-8 max-w-[420px]">
          <DialogHeader><DialogTitle className="text-center font-black">{t.setupTitle}</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center min-h-[350px] justify-center">
            {setupStep === 'name' && (
              <div className="w-full space-y-6">
                <Input value={tempName} onChange={(e) => setTempName(e.target.value)} placeholder={isAr ? "اسم العداد..." : "Habit name..."} className="h-16 rounded-[1.5rem] text-center font-bold text-lg border-2" />
                <Button disabled={!tempName.trim()} onClick={() => setSetupStep('date')} className="w-full h-16 rounded-[1.5rem] font-black bg-slate-800 text-lg shadow-xl">{t.save}</Button>
              </div>
            )}
            {setupStep === 'date' && (
              <Calendar mode="single" selected={tempDate} onSelect={(date) => { if(date) { setTempDate(date); setSetupStep('hour'); } }} className="rounded-3xl border p-4" />
            )}
            {setupStep === 'hour' && (
              <CircularTimePicker mode="hours" value={tempHour} onChange={setTempHour} onComplete={() => setSetupStep('minute')} />
            )}
            {setupStep === 'minute' && (
              <CircularTimePicker mode="minutes" value={tempMinute} onChange={setTempMinute} onComplete={handleFinishSetup} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <SidePanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} side={isAr ? 'left' : 'right'} title={t.settings}>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem]">
            <Label className="font-black">{isAr ? "الوضع الليلي" : "Dark Mode"}</Label>
            <Switch checked={theme === 'dark'} onCheckedChange={(checked) => { setTheme(checked ? 'dark' : 'light'); document.documentElement.classList.toggle('dark', checked); }} />
          </div>
          <Button variant="destructive" className="w-full h-16 rounded-[1.5rem] font-black shadow-lg" onClick={clearAllStorage}>
             {isAr ? "حذف كافة البيانات" : "Delete All Data"}
          </Button>
        </div>
      </SidePanel>
      
      <AlertDialog open={isClearDataOpen} onOpenChange={setIsClearDataOpen}>
        <AlertDialogContent className="rounded-[2.5rem]">
          <AlertDialogHeader><AlertDialogTitle className="font-black">{t.clearData}</AlertDialogTitle><AlertDialogDescription>{t.confirmClear}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="rounded-xl">{t.cancel}</AlertDialogCancel><AlertDialogAction onClick={handleClearTrackerData} className="bg-orange-500 rounded-xl">{t.save}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2.5rem]">
          <AlertDialogHeader><AlertDialogTitle className="font-black">{isAr ? "تأكيد الحذف" : "Confirm Delete"}</AlertDialogTitle><AlertDialogDescription>{t.confirmDelete}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="rounded-xl">{t.cancel}</AlertDialogCancel><AlertDialogAction onClick={() => { updateHabits(habits.filter(h => h.id !== activeHabitId)); setActiveHabitId(habits[0]?.id || null); setIsDeleteDialogOpen(false); }} className="bg-red-500 rounded-xl">{isAr ? "حذف" : "Delete"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
