
"use client"

import * as React from "react"
import { Settings, User, Plus, Sparkles, Globe, Trash2, Info, Moon, Sun, Heart, Zap, Target, Shield, Flame, Cloud, Ghost } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TimerDisplay } from "@/components/TimerDisplay"
import { JourneyLog } from "@/components/JourneyLog"
import { SidePanel } from "@/components/SidePanel"
import { saveToStorage, getFromStorage, STORAGE_KEYS, clearAllStorage, type Habit } from "@/lib/storage"
import { parseISO, isSameDay, startOfDay } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
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
    version: "الإصدار 1.0.0",
    selectIcon: "اختر رمزاً"
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
    version: "Version 1.0.0",
    selectIcon: "Select Icon"
  }
}

const AVAILABLE_ICONS = [
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Heart', icon: Heart },
  { name: 'Zap', icon: Zap },
  { name: 'Moon', icon: Moon },
  { name: 'Sun', icon: Sun },
  { name: 'Target', icon: Target },
  { name: 'Shield', icon: Shield },
  { name: 'Flame', icon: Flame },
  { name: 'Cloud', icon: Cloud },
  { name: 'Ghost', icon: Ghost },
]

export function RecoveryTrackerApp() {
  const { toast } = useToast()
  const [mounted, setMounted] = React.useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false)
  const [isSetupOpen, setIsSetupOpen] = React.useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isClearDataOpen, setIsClearDataOpen] = React.useState(false)
  const [isFactoryResetOpen, setIsFactoryResetOpen] = React.useState(false)
  const [setupStep, setSetupStep] = React.useState<'name' | 'icon' | 'date'>('name')

  const [language, setLanguage] = React.useState<'ar' | 'en'>('ar')
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light')
  const [habits, setHabits] = React.useState<Habit[]>([])
  const [activeHabitId, setActiveHabitId] = React.useState<string | null>(null)

  const [tempName, setTempName] = React.useState("")
  const [tempIcon, setTempIcon] = React.useState("Sparkles")
  const [tempDate, setTempDate] = React.useState<Date | null>(null)
  
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
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', savedTheme === 'dark')
      }
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
    const finalDate = startOfDay(tempDate)
    const newHabit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      name: tempName,
      icon: tempIcon,
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
  }, [habits, tempName, tempIcon, tempDate])

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar'
    setLanguage(newLang)
    saveToStorage(STORAGE_KEYS.LANGUAGE, newLang)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    saveToStorage(STORAGE_KEYS.THEME, newTheme)
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
    }
  }

  const t = TRANSLATIONS[language]
  const isAr = language === 'ar'

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950" dir={isAr ? 'rtl' : 'ltr'}>
      <header className="h-14 flex items-center justify-between px-6 z-40 shrink-0 border-b bg-background/50 backdrop-blur-md">
        <Button variant="ghost" size="icon" className="rounded-full text-slate-400">
          <User className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-black tracking-tighter">{t.title}</h1>
        <Button variant="ghost" size="icon" className="rounded-full text-slate-400" onClick={() => setIsSettingsOpen(true)}>
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      <main className="flex-1 w-full flex flex-col items-center px-4 overflow-hidden">
        {activeHabit && activeHabitData ? (
          <div className="w-full flex flex-col items-center h-full max-w-[480px]">
            <div className="text-center py-2 shrink-0">
              <h2 className="text-xl font-black tracking-tighter">{t.subtitle}</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.motivation}</p>
            </div>

            <div className="flex-1 w-full flex flex-col justify-center overflow-hidden">
              <TimerDisplay 
                externalStartDate={activeHabitData.startDate} 
                externalHabitName={activeHabit.name}
                externalHabitIcon={activeHabit.icon}
                externalAccentColor={activeHabit.color}
                resetDates={activeHabitData.resetDates}
                onOpenHistory={() => setIsHistoryOpen(true)}
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

            <div className="w-full py-4 shrink-0">
              <div className="flex items-center gap-3 overflow-x-auto pb-1 custom-scrollbar px-4 w-full justify-center">
                <button onClick={() => { setIsSetupOpen(true); setSetupStep('name'); }} className="shrink-0 w-12 h-12 rounded-[1rem] bg-slate-800 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform">
                  <Plus className="h-5 w-5" />
                </button>
                {habits.map((habit) => {
                  const HabitIcon = AVAILABLE_ICONS.find(i => i.name === habit.icon)?.icon || Sparkles;
                  return (
                    <button
                      key={habit.id}
                      onClick={() => { setActiveHabitId(habit.id); saveToStorage(STORAGE_KEYS.ACTIVE_HABIT_ID, habit.id); }}
                      className={`shrink-0 h-16 w-14 rounded-[1rem] flex flex-col items-center justify-center gap-0.5 border-2 transition-all ${
                        activeHabitId === habit.id ? "bg-white dark:bg-slate-900 border-slate-800 dark:border-white text-slate-800 dark:text-white shadow-lg" : "bg-transparent border-transparent text-slate-400 opacity-50"
                      }`}
                    >
                      <div className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                         <HabitIcon className="h-3 w-3" style={{ color: habit.color }} />
                      </div>
                      <span className="text-[7px] font-black uppercase tracking-tighter truncate w-full px-1 text-center">{habit.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <button onClick={() => { setIsSetupOpen(true); setSetupStep('name'); }} className="w-24 h-24 rounded-[2rem] bg-slate-800 dark:bg-slate-900 text-white shadow-xl flex items-center justify-center active:scale-95 transition-transform">
              <Plus className="h-10 w-10" />
            </button>
            <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">{t.addHabit}</p>
          </div>
        )}
      </main>

      <JourneyLog 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        startDate={activeHabitData?.startDate || new Date()}
        resetDates={activeHabitData?.resetDates || []}
        language={language}
        onReset={(date) => {
          if (!activeHabit) return;
          const currentResets = activeHabit.resetDates.map(d => parseISO(d));
          const newResets = [...currentResets, date].sort((a, b) => a.getTime() - b.getTime());
          handleUpdateActiveHabit({
            startDate: newResets[newResets.length - 1].toISOString(),
            resetDates: newResets.map(d => d.toISOString())
          });
        }} 
        onRemoveReset={(date) => {
           if (!activeHabit) return;
           const newResets = activeHabit.resetDates.filter(d => !isSameDay(parseISO(d), date));
           if (newResets.length === 0) return;
           const sorted = newResets.map(d => parseISO(d)).sort((a, b) => a.getTime() - b.getTime());
           handleUpdateActiveHabit({ 
             startDate: sorted[sorted.length - 1].toISOString(), 
             resetDates: sorted.map(d => d.toISOString()) 
           });
        }}
        onUpdateTime={(oldDate, newDate) => {
          if (!activeHabit) return;
          const newResets = activeHabit.resetDates.map(d => {
            const current = parseISO(d);
            return current.getTime() === oldDate.getTime() ? newDate.toISOString() : d;
          }).sort((a, b) => parseISO(a).getTime() - parseISO(b).getTime());
          
          handleUpdateActiveHabit({
            startDate: newResets[newResets.length - 1],
            resetDates: newResets
          });
        }}
      />

      <SidePanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        side={isAr ? "left" : "right"}
        title={t.settings}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-[9px] font-black uppercase tracking-widest opacity-30">{t.language}</h3>
            <Button variant="outline" className="w-full h-12 rounded-xl font-black justify-between px-4" onClick={toggleLanguage}>
              <Globe className="h-4 w-4 opacity-40" />
              <span>{language === 'ar' ? "English" : "العربية"}</span>
            </Button>
          </div>
          <div className="space-y-2">
            <h3 className="text-[9px] font-black uppercase tracking-widest opacity-30">{t.theme}</h3>
            <div className="w-full h-12 rounded-xl border bg-card flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="h-4 w-4 text-slate-400" /> : <Sun className="h-4 w-4 text-orange-500" />}
                <span className="font-black text-sm">{t.darkMode}</span>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} className="scale-75" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-[9px] font-black uppercase tracking-widest opacity-30">{t.factoryReset}</h3>
            <Button variant="destructive" className="w-full h-12 rounded-xl font-black justify-between px-4 bg-red-500/10 text-red-500 border-none" onClick={() => setIsFactoryResetOpen(true)}>
              <Trash2 className="h-4 w-4" />
              <span>{t.factoryReset}</span>
            </Button>
          </div>
          <div className="pt-4 border-t opacity-40 flex items-center gap-3">
             <Info className="h-4 w-4" />
             <div className="text-[9px] font-black uppercase">{t.version}</div>
          </div>
        </div>
      </SidePanel>

      <Dialog open={isSetupOpen} onOpenChange={setIsSetupOpen}>
        <DialogContent className="rounded-[2rem] p-5 max-w-[340px] max-h-[90vh] overflow-hidden flex flex-col z-[100]">
          <DialogHeader><DialogTitle className="text-center font-black">{t.setupTitle}</DialogTitle></DialogHeader>
          <div className="flex-1 flex flex-col items-center justify-center overflow-hidden py-2">
            {setupStep === 'name' && (
              <div className="w-full space-y-4">
                <Input value={tempName} onChange={(e) => setTempName(e.target.value)} placeholder={isAr ? "اسم العداد..." : "Habit name..."} className="h-14 rounded-xl text-center font-bold" />
                <Button disabled={!tempName.trim()} onClick={() => setSetupStep('icon')} className="w-full h-14 rounded-xl font-black bg-slate-800">{isAr ? "التالي" : "Next"}</Button>
              </div>
            )}
            {setupStep === 'icon' && (
              <div className="w-full space-y-4">
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_ICONS.map((item) => (
                    <button key={item.name} onClick={() => setTempIcon(item.name)} className={`h-10 w-10 rounded-lg flex items-center justify-center transition-all ${tempIcon === item.name ? 'bg-primary text-white shadow-md' : 'bg-secondary/40 text-slate-400'}`}>
                      <item.icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
                <Button onClick={() => { setTempDate(new Date()); setSetupStep('date'); }} className="w-full h-12 mt-2 rounded-xl font-black bg-slate-800">{isAr ? "التالي" : "Next"}</Button>
              </div>
            )}
            {setupStep === 'date' && (
              <div className="scale-75 flex flex-col items-center">
                <Calendar mode="single" selected={tempDate || undefined} onSelect={(d) => { if(d) { setTempDate(d); handleFinishSetup(); } }} disabled={today ? { after: today } : undefined} className="border rounded-2xl" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isClearDataOpen} onOpenChange={setIsClearDataOpen}>
        <AlertDialogContent className="rounded-[2rem] max-w-[300px] z-[110]">
          <AlertDialogHeader><AlertDialogTitle className="font-black text-sm">{isAr ? "حذف سجلات العداد" : "Clear Habit History"}</AlertDialogTitle><AlertDialogDescription className="text-xs">{t.confirmClear}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 mt-2"><AlertDialogCancel className="rounded-xl flex-1 mt-0 text-xs">{t.cancel}</AlertDialogCancel><AlertDialogAction onClick={() => { if (!activeHabit) return; const now = new Date(); handleUpdateActiveHabit({ startDate: now.toISOString(), resetDates: [now.toISOString()] }); setIsClearDataOpen(false); toast({ title: t.historyCleared }); }} className="bg-orange-500 rounded-xl flex-1 text-xs">{t.save}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2rem] max-w-[300px] z-[110]">
          <AlertDialogHeader><AlertDialogTitle className="font-black text-sm">{isAr ? "تأكيد الحذف" : "Confirm Delete"}</AlertDialogTitle><AlertDialogDescription className="text-xs">{t.confirmDelete}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 mt-2"><AlertDialogCancel className="rounded-xl flex-1 mt-0 text-xs">{t.cancel}</AlertDialogCancel><AlertDialogAction onClick={() => { const newHabits = habits.filter(h => h.id !== activeHabitId); setHabits(newHabits); saveToStorage(STORAGE_KEYS.HABITS, JSON.stringify(newHabits)); setActiveHabitId(newHabits[0]?.id || null); setIsDeleteDialogOpen(false); }} className="bg-red-500 rounded-xl flex-1 text-xs">{isAr ? "حذف" : "Delete"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isFactoryResetOpen} onOpenChange={setIsFactoryResetOpen}>
        <AlertDialogContent className="rounded-[2rem] max-w-[300px] z-[110]">
          <AlertDialogHeader><AlertDialogTitle className="font-black text-red-500 text-sm">{t.factoryReset}</AlertDialogTitle><AlertDialogDescription className="text-xs">{t.resetWarning}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 mt-2"><AlertDialogCancel className="rounded-xl flex-1 mt-0 text-xs">{t.cancel}</AlertDialogCancel><AlertDialogAction onClick={clearAllStorage} className="bg-red-500 rounded-xl flex-1 text-xs">{isAr ? "تأكيد" : "Confirm"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
