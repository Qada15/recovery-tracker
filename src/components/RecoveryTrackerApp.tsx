"use client"

import * as React from "react"
import { Settings, User, Plus, Sparkles, Globe, Trash2, Info, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TimerDisplay } from "@/components/TimerDisplay"
import { JourneyLog } from "@/components/JourneyLog"
import { SidePanel } from "@/components/SidePanel"
import { saveToStorage, getFromStorage, STORAGE_KEYS, clearAllStorage, type Habit } from "@/lib/storage"
import { parseISO, setHours, setMinutes, isSameDay, startOfDay } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { CircularTimePicker } from "./CircularTimePicker"
import { Switch } from "@/components/ui/switch"
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
    confirmClear: "سيتم تصفير السجل وحذف كافة الزلات لهذا العداد.",
    historyCleared: "تم تصفير السجل",
    settings: "الإعدادات",
    language: "اللغة",
    theme: "المظهر",
    darkMode: "الوضع المظلم",
    factoryReset: "مسح كافة البيانات",
    resetWarning: "سيؤدي هذا إلى حذف جميع العدادات والبيانات المسجلة نهائياً ولا يمكن التراجع عن هذه الخطوة.",
    about: "عن التطبيق",
    version: "الإصدار 1.0.0"
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
    confirmClear: "All relapses for this tracker will be deleted.",
    historyCleared: "History Cleared",
    settings: "Settings",
    language: "Language",
    theme: "Theme",
    darkMode: "Dark Mode",
    factoryReset: "Factory Reset",
    resetWarning: "This will permanently delete all habits and records. This action cannot be undone.",
    about: "About",
    version: "Version 1.0.0"
  }
}

export function RecoveryTrackerApp() {
  const { toast } = useToast()
  const [mounted, setMounted] = React.useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false)
  const [isSetupOpen, setIsSetupOpen] = React.useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isClearDataOpen, setIsClearDataOpen] = React.useState(false)
  const [isFactoryResetOpen, setIsFactoryResetOpen] = React.useState(false)
  const [setupStep, setSetupStep] = React.useState<'name' | 'date' | 'hour' | 'minute'>('name')

  const [language, setLanguage] = React.useState<'ar' | 'en'>('ar')
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light')
  const [habits, setHabits] = React.useState<Habit[]>([])
  const [activeHabitId, setActiveHabitId] = React.useState<string | null>(null)

  const [tempName, setTempName] = React.useState("")
  const [tempDate, setTempDate] = React.useState<Date | null>(null)
  const [tempHour, setTempHour] = React.useState(12)
  const [tempMinute, setTempMinute] = React.useState(0)
  
  const [today, setToday] = React.useState<Date | null>(null)

  React.useEffect(() => {
    setMounted(true)
    const now = new Date()
    setToday(startOfDay(now))
    
    const savedHabits = getFromStorage(STORAGE_KEYS.HABITS)
    const savedActiveId = getFromStorage(STORAGE_KEYS.ACTIVE_HABIT_ID)
    const savedLang = getFromStorage(STORAGE_KEYS.LANGUAGE) as 'ar' | 'en'
    const savedTheme = getFromStorage(STORAGE_KEYS.THEME) as 'light' | 'dark'

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

  const activeHabit = React.useMemo(() => habits.find(h => h.id === activeHabitId), [habits, activeHabitId]);

  const activeHabitData = React.useMemo(() => {
    if (!activeHabit) return null;
    return {
      startDate: parseISO(activeHabit.startDate),
      resetDates: activeHabit.resetDates.map(d => parseISO(d))
    };
  }, [activeHabit]);

  const handleUpdateActiveHabit = React.useCallback((updates: Partial<Habit>) => {
    if (!activeHabitId) return
    setHabits(prev => {
      const newHabits = prev.map(h => h.id === activeHabitId ? { ...h, ...updates } : h)
      saveToStorage(STORAGE_KEYS.HABITS, JSON.stringify(newHabits))
      return newHabits
    })
  }, [activeHabitId])

  const handleFinishSetup = React.useCallback(() => {
    if (!tempDate) return
    const finalDate = setMinutes(setHours(startOfDay(tempDate), tempHour), tempMinute)
    const newHabit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      name: tempName,
      startDate: finalDate.toISOString(),
      resetDates: [finalDate.toISOString()],
      color: 'hsl(var(--accent))'
    }
    const newHabits = [...habits, newHabit]
    setHabits(newHabits)
    saveToStorage(STORAGE_KEYS.HABITS, JSON.stringify(newHabits))
    setActiveHabitId(newHabit.id)
    saveToStorage(STORAGE_KEYS.ACTIVE_HABIT_ID, newHabit.id)
    setIsSetupOpen(false)
    setSetupStep('name')
    setTempName("")
  }, [habits, tempName, tempDate, tempHour, tempMinute])

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar'
    setLanguage(newLang)
    saveToStorage(STORAGE_KEYS.LANGUAGE, newLang)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    saveToStorage(STORAGE_KEYS.THEME, newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const t = TRANSLATIONS[language]
  const isAr = language === 'ar'

  if (!mounted) return null;

  return (
    <div className="h-screen w-screen bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden fixed inset-0" dir={isAr ? 'rtl' : 'ltr'}>
      <header className="h-14 flex items-center justify-between px-6 z-40 shrink-0">
        <Button variant="ghost" size="icon" className="rounded-full text-slate-400">
          <User className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-black text-slate-700 dark:text-white tracking-tighter">{t.title}</h1>
        <Button variant="ghost" size="icon" className="rounded-full text-slate-400" onClick={() => setIsSettingsOpen(true)}>
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      <main className="flex-1 w-full flex flex-col items-center px-4 py-2 overflow-hidden">
        {activeHabit && activeHabitData ? (
          <div className="w-full flex flex-col items-center h-full max-w-[480px]">
            <div className="text-center space-y-0.5 mb-4 shrink-0">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">{t.subtitle}</h2>
              <p className="text-[10px] font-bold text-slate-400">{t.motivation}</p>
            </div>

            <div className="flex-1 w-full flex flex-col justify-center overflow-hidden">
              <TimerDisplay 
                externalStartDate={activeHabitData.startDate} 
                externalHabitName={activeHabit.name}
                externalAccentColor={activeHabit.color}
                resetDates={activeHabitData.resetDates}
                onOpenHistory={() => setIsHistoryOpen(true)}
                onUpdateDate={(d) => {
                  const currentResets = activeHabit.resetDates.map(rd => parseISO(rd));
                  const filtered = currentResets.filter(rd => !isSameDay(rd, activeHabitData.startDate));
                  const newResets = [...filtered, d].sort((a, b) => a.getTime() - b.getTime());
                  handleUpdateActiveHabit({ startDate: d.toISOString(), resetDates: newResets.map(rd => rd.toISOString()) });
                }}
                onUpdateName={(name) => handleUpdateActiveHabit({ name })}
                onUpdateColor={(color) => handleUpdateActiveHabit({ color })}
                onReset={() => {
                  const now = new Date()
                  const currentResets = activeHabit.resetDates.map(d => parseISO(d))
                  const newResets = [...currentResets, now].sort((a, b) => a.getTime() - b.getTime())
                  handleUpdateActiveHabit({
                    startDate: now.toISOString(),
                    resetDates: newResets.map(d => d.toISOString())
                  })
                }}
                onDelete={() => setIsDeleteDialogOpen(true)}
                onClearData={() => setIsClearDataOpen(true)}
                language={language}
              />
            </div>

            <div className="w-full py-6 shrink-0">
              <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar px-4 w-full justify-center">
                <button onClick={() => setIsSetupOpen(true)} className="shrink-0 w-14 h-14 rounded-[1.2rem] bg-slate-800 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                  <Plus className="h-5 w-5" />
                </button>
                {habits.map((habit) => (
                  <button
                    key={habit.id}
                    onClick={() => { setActiveHabitId(habit.id); saveToStorage(STORAGE_KEYS.ACTIVE_HABIT_ID, habit.id); }}
                    className={`shrink-0 h-20 w-16 rounded-[1.2rem] flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                      activeHabitId === habit.id ? "bg-white dark:bg-slate-900 border-slate-800 dark:border-white text-slate-800 dark:text-white shadow-xl" : "bg-transparent border-transparent text-slate-400 opacity-60"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                       <Sparkles className="h-4 w-4" style={{ color: habit.color }} />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-tighter truncate w-full px-1 text-center">{habit.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <button onClick={() => setIsSetupOpen(true)} className="w-28 h-28 rounded-[2.5rem] bg-slate-800 dark:bg-slate-900 text-white shadow-2xl flex items-center justify-center active:scale-95 transition-transform">
              <Plus className="h-10 w-10" />
            </button>
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">{t.addHabit}</p>
          </div>
        )}
      </main>

      {activeHabit && activeHabitData && (
        <JourneyLog 
          isOpen={isHistoryOpen} 
          onClose={() => setIsHistoryOpen(false)} 
          startDate={activeHabitData.startDate}
          resetDates={activeHabitData.resetDates}
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
          language={language}
        />
      )}

      <SidePanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        side={isAr ? "left" : "right"}
        title={t.settings}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-30">{t.language}</h3>
            <Button 
              variant="outline" 
              className="w-full h-14 rounded-2xl font-black justify-between px-6"
              onClick={toggleLanguage}
            >
              <Globe className="h-5 w-5 opacity-40" />
              <span>{language === 'ar' ? "English" : "العربية"}</span>
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-30">{t.theme}</h3>
            <div className="w-full h-14 rounded-2xl border bg-card flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="h-5 w-5 text-slate-400" /> : <Sun className="h-5 w-5 text-orange-500" />}
                <span className="font-black">{t.darkMode}</span>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-30">{t.factoryReset}</h3>
            <Button 
              variant="destructive" 
              className="w-full h-14 rounded-2xl font-black justify-between px-6 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-none"
              onClick={() => setIsFactoryResetOpen(true)}
            >
              <Trash2 className="h-5 w-5" />
              <span>{t.factoryReset}</span>
            </Button>
          </div>

          <div className="pt-8 border-t">
            <div className="flex items-center gap-4 opacity-40">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black">{t.about}</p>
                <p className="text-[10px] font-bold uppercase">{t.version}</p>
              </div>
            </div>
          </div>
        </div>
      </SidePanel>

      <Dialog open={isSetupOpen} onOpenChange={setIsSetupOpen}>
        <DialogContent className="rounded-[2.5rem] p-6 max-w-[380px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader><DialogTitle className="text-center font-black">{t.setupTitle}</DialogTitle></DialogHeader>
          <div className="flex-1 flex flex-col items-center justify-center overflow-hidden py-4">
            {setupStep === 'name' && (
              <div className="w-full space-y-6">
                <Input value={tempName} onChange={(e) => setTempName(e.target.value)} placeholder={isAr ? "اسم العداد..." : "Habit name..."} className="h-16 rounded-[1.5rem] text-center font-bold text-lg" />
                <Button disabled={!tempName.trim()} onClick={() => {
                  const now = new Date();
                  setTempDate(now);
                  setTempHour(now.getHours());
                  setTempMinute(now.getMinutes());
                  setSetupStep('date');
                }} className="w-full h-16 rounded-[1.5rem] font-black bg-slate-800 text-lg">{t.save}</Button>
              </div>
            )}
            {setupStep === 'date' && (
              <div className="w-full flex flex-col items-center">
                <Calendar 
                  mode="single" 
                  selected={tempDate || undefined} 
                  onSelect={(date) => { if(date) { setTempDate(date); setSetupStep('hour'); } }} 
                  className="rounded-3xl border p-2 scale-90" 
                  disabled={today ? { after: today } : undefined}
                />
              </div>
            )}
            {setupStep === 'hour' && <CircularTimePicker mode="hours" value={tempHour} onChange={setTempHour} onComplete={() => setSetupStep('minute')} />}
            {setupStep === 'minute' && <CircularTimePicker mode="minutes" value={tempMinute} onChange={setTempMinute} onComplete={handleFinishSetup} />}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isClearDataOpen} onOpenChange={setIsClearDataOpen}>
        <AlertDialogContent className="rounded-[2.5rem] max-w-[340px]">
          <AlertDialogHeader><AlertDialogTitle className="font-black">{isAr ? "حذف سجلات العداد" : "Clear Habit History"}</AlertDialogTitle><AlertDialogDescription>{t.confirmClear}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="rounded-xl">{t.cancel}</AlertDialogCancel><AlertDialogAction onClick={() => {
            if (!activeHabit) return;
            const now = new Date();
            handleUpdateActiveHabit({ startDate: now.toISOString(), resetDates: [now.toISOString()] });
            setIsClearDataOpen(false);
            toast({ title: t.historyCleared });
          }} className="bg-orange-500 rounded-xl">{t.save}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2.5rem] max-w-[340px]">
          <AlertDialogHeader><AlertDialogTitle className="font-black">{isAr ? "تأكيد الحذف" : "Confirm Delete"}</AlertDialogTitle><AlertDialogDescription>{t.confirmDelete}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="rounded-xl">{t.cancel}</AlertDialogCancel><AlertDialogAction onClick={() => {
            const newHabits = habits.filter(h => h.id !== activeHabitId);
            setHabits(newHabits);
            saveToStorage(STORAGE_KEYS.HABITS, JSON.stringify(newHabits));
            setActiveHabitId(newHabits[0]?.id || null);
            setIsDeleteDialogOpen(false);
          }} className="bg-red-500 rounded-xl">{isAr ? "حذف" : "Delete"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isFactoryResetOpen} onOpenChange={setIsFactoryResetOpen}>
        <AlertDialogContent className="rounded-[2.5rem] max-w-[340px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black text-red-500">{t.factoryReset}</AlertDialogTitle>
            <AlertDialogDescription>{t.resetWarning}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={clearAllStorage} className="bg-red-500 rounded-xl">{isAr ? "تأكيد المسح الشامل" : "Confirm Full Reset"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
