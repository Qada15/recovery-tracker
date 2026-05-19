"use client"

import * as React from "react"
import { Settings, User, Languages, Moon, Sun, Trash2, Plus, Flame, Clock, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidePanel } from "@/components/SidePanel"
import { TimerDisplay } from "@/components/TimerDisplay"
import { JourneyLog } from "@/components/JourneyLog"
import { saveToStorage, getFromStorage, STORAGE_KEYS, clearAllStorage, type Habit } from "@/lib/storage"
import { isValid, parseISO, startOfDay, isBefore, isSameDay, setHours, setMinutes, isAfter } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

const TRANSLATIONS = {
  ar: {
    title: "متابع التعافي",
    settings: "الإعدادات",
    account: "الحساب",
    language: "اللغة",
    theme: "المظهر",
    darkMode: "الوضع الداكن",
    deleteData: "حذف كافة البيانات",
    confirmDelete: "هل أنت متأكد؟ سيتم حذف كل شيء نهائياً ولا يمكن التراجع.",
    stayStrong: "كن قوياً",
    journey: "رحلتك",
    habitDefault: "الامتناع",
    profile: "ملف المستخدم",
    localActive: "التخزين المحلي نشط",
    addHabit: "إضافة عداد جديد",
    setupTitle: "إعداد العداد",
    enterName: "أدخل اسم العادة أو الهدف",
    save: "حفظ",
    stepDate: "1. اختر التاريخ",
    stepHour: "2. اختر الساعة",
    stepMinute: "3. اختر الدقيقة",
    confirmTitle: "تأكيد الحذف النهائي",
    cancel: "إلغاء",
    delete: "حذف نهائي",
    myTrackers: "عداداتي",
    deleteHabitConfirm: "هل أنت متأكد من حذف هذا العداد؟ سيتم حذف كافة سجلاته بشكل نهائي."
  },
  en: {
    title: "Recovery Tracker",
    settings: "Settings",
    account: "Account",
    language: "Language",
    theme: "Theme",
    darkMode: "Dark Mode",
    deleteData: "Delete All Data",
    confirmDelete: "Are you sure? Everything will be permanently deleted and cannot be undone.",
    stayStrong: "Stay Strong",
    journey: "Your Journey",
    habitDefault: "Abstinence",
    profile: "User Profile",
    localActive: "Local Storage Active",
    addHabit: "Add New Tracker",
    setupTitle: "Setup Tracker",
    enterName: "Enter habit or goal name",
    save: "Save",
    stepDate: "1. Select Date",
    stepHour: "2. Select Hour",
    stepMinute: "3. Select Minute",
    confirmTitle: "Confirm Permanent Deletion",
    cancel: "Cancel",
    delete: "Delete All",
    myTrackers: "My Trackers",
    deleteHabitConfirm: "Are you sure you want to delete this tracker? All its records will be permanently removed."
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
  const [isHabitDeleteDialogOpen, setIsHabitDeleteDialogOpen] = React.useState(false)
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

  if (!mounted) {
    return <div className="flex-1 bg-background h-screen w-screen" />
  }

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

  const handleUpdateStartDate = (newDate: Date) => {
    if (!activeHabit) return
    const startOfNewDate = startOfDay(newDate)
    const currentResets = activeHabit.resetDates.map(d => parseISO(d))
    
    const filteredResets = currentResets.filter(rd => isBefore(startOfDay(rd), startOfNewDate))
    const finalResets = [...filteredResets, newDate]

    handleUpdateActiveHabit({
      startDate: newDate.toISOString(),
      resetDates: finalResets.map(d => d.toISOString())
    })
  }

  const handleResetAction = (targetDate?: Date) => {
    if (!activeHabit) return
    const dateToReset = targetDate || new Date()
    const startOfDate = startOfDay(dateToReset)
    
    const currentResets = activeHabit.resetDates.map(d => parseISO(d))
    
    // Check if there is already a reset on this day to update it, or add new
    const existingIndex = currentResets.findIndex(rd => isSameDay(startOfDay(rd), startOfDate))
    
    let newResets = [...currentResets]
    if (existingIndex >= 0) {
      newResets[existingIndex] = dateToReset
    } else {
      newResets.push(dateToReset)
    }

    // Sort resets by time
    newResets.sort((a, b) => a.getTime() - b.getTime())

    // Update startDate if the reset is today or the latest
    const now = new Date()
    const latestReset = newResets[newResets.length - 1]
    
    handleUpdateActiveHabit({
      startDate: latestReset.toISOString(),
      resetDates: newResets.map(d => d.toISOString())
    })
  }

  const handleRemoveResetAction = (dateToRemove: Date) => {
    if (!activeHabit) return
    const currentResets = activeHabit.resetDates.map(d => parseISO(d))
    const newResets = currentResets.filter(rd => !isSameDay(startOfDay(rd), startOfDay(dateToRemove)))
    
    // Ensure startDate is always the latest reset
    const latestReset = newResets.length > 0 ? newResets[newResets.length - 1] : parseISO(activeHabit.startDate)

    handleUpdateActiveHabit({
      startDate: latestReset.toISOString(),
      resetDates: newResets.map(d => d.toISOString())
    })
  }

  const handleDeleteActiveHabit = () => {
    if (!activeHabitId) return
    const newHabits = habits.filter(h => h.id !== activeHabitId)
    updateHabits(newHabits)
    
    const nextActiveId = newHabits.length > 0 ? newHabits[0].id : null
    setActiveHabitId(nextActiveId)
    saveToStorage(STORAGE_KEYS.ACTIVE_HABIT_ID, nextActiveId || "")
    
    setIsHabitDeleteDialogOpen(false)
    toast({ title: isAr ? "تم حذف العداد بنجاح" : "Tracker deleted successfully" })
  }

  const toggleTheme = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', checked)
    saveToStorage(STORAGE_KEYS.THEME, newTheme)
  }

  const handleLanguageChange = (lang: string) => {
    const newLang = lang as 'ar' | 'en'
    setLanguage(newLang)
    saveToStorage(STORAGE_KEYS.LANGUAGE, newLang)
  }

  return (
    <div className="flex-1 flex flex-col items-center bg-background relative h-full overflow-hidden select-none touch-none" dir={isAr ? 'rtl' : 'ltr'}>
      <header className="w-full h-14 bg-white dark:bg-slate-950 border-b flex items-center justify-between px-6 shadow-sm z-40 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => setIsAccountOpen(true)} className="rounded-full">
          <User className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-black tracking-tighter uppercase">{t.title}</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} className="rounded-full">
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      <main className="flex-1 w-full flex flex-col items-center justify-center p-4 relative overflow-hidden pb-20">
        {habits.length > 0 && activeHabit ? (
          <>
            <div className="text-center space-y-1 mb-2 shrink-0">
              <p className="text-muted-foreground font-black text-[8px] uppercase tracking-[0.3em]">{t.journey}</p>
              <h2 className="text-lg font-black tracking-tight">{t.stayStrong}</h2>
            </div>

            <div className="w-full flex-1 flex items-center justify-center min-h-0 overflow-hidden">
              <TimerDisplay 
                externalStartDate={parseISO(activeHabit.startDate)} 
                externalHabitName={activeHabit.name}
                externalAccentColor={activeHabit.color}
                resetDates={activeHabit.resetDates.map(d => parseISO(d))}
                onOpenHistory={() => setIsHistoryOpen(true)}
                onUpdateDate={handleUpdateStartDate}
                onUpdateName={(name) => handleUpdateActiveHabit({ name })}
                onUpdateColor={(color) => handleUpdateActiveHabit({ color })}
                onReset={() => handleResetAction()}
                onUrge={() => toast({ title: isAr ? "تنبيه رغبة" : "Urge Recorded", className: "bg-orange-500 text-white" })}
                onDelete={() => setIsHabitDeleteDialogOpen(true)}
                language={language}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <Button 
              onClick={() => setIsSetupOpen(true)}
              className="w-24 h-24 rounded-full bg-primary text-white shadow-2xl hover:scale-110 transition-transform"
            >
              <Plus className="w-12 h-12" />
            </Button>
            <p className="text-sm font-black uppercase tracking-widest opacity-40">{t.addHabit}</p>
          </div>
        )}
      </main>

      {habits.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border shadow-2xl z-50 flex items-center px-4 overflow-hidden">
          <ScrollArea className="w-full h-full">
            <div className="flex items-center h-full gap-3 py-2 px-1">
              {habits.map((habit) => (
                <button
                  key={habit.id}
                  onClick={() => {
                    setActiveHabitId(habit.id);
                    saveToStorage(STORAGE_KEYS.ACTIVE_HABIT_ID, habit.id);
                  }}
                  className={`shrink-0 h-10 px-4 rounded-2xl font-black text-[10px] uppercase tracking-tighter transition-all flex items-center gap-2 border-2 ${
                    activeHabitId === habit.id 
                      ? "bg-primary text-white border-primary shadow-lg scale-105" 
                      : "bg-secondary/50 text-muted-foreground border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: habit.color }} />
                  {habit.name}
                </button>
              ))}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSetupOpen(true)}
                className="shrink-0 h-10 w-10 rounded-2xl bg-secondary/30 text-muted-foreground border-2 border-dashed border-muted-foreground/20"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {activeHabit && (
        <JourneyLog 
          isOpen={isHistoryOpen} 
          onClose={() => setIsHistoryOpen(false)} 
          startDate={parseISO(activeHabit.startDate)}
          resetDates={activeHabit.resetDates.map(d => parseISO(d))}
          habitName={activeHabit.name}
          accentColor={activeHabit.color}
          onReset={handleResetAction}
          onRemoveReset={handleRemoveResetAction}
          onUrge={(date) => toast({ title: isAr ? "تم تسجيل رغبة" : "Urge Recorded" })}
          language={language}
        />
      )}

      <Dialog open={isSetupOpen} onOpenChange={(open) => { setIsSetupOpen(open); if(!open) setSetupStep('name'); }}>
        <DialogContent className="rounded-[2.5rem] p-6 max-w-[420px]">
          <DialogHeader><DialogTitle className="text-center font-black">
            {setupStep === 'name' && t.setupTitle}
            {setupStep === 'date' && t.stepDate}
            {setupStep === 'hour' && t.stepHour}
            {setupStep === 'minute' && t.stepMinute}
          </DialogTitle></DialogHeader>
          <div className="flex flex-col items-center min-h-[350px] justify-center">
            {setupStep === 'name' && (
              <div className="w-full space-y-6">
                <Input value={tempName} onChange={(e) => setTempName(e.target.value)} placeholder={isAr ? "اسم العداد..." : "Habit name..."} className="h-14 rounded-2xl text-center font-bold" />
                <Button disabled={!tempName.trim()} onClick={() => setSetupStep('date')} className="w-full h-14 rounded-2xl font-black">{t.save}</Button>
              </div>
            )}
            {setupStep === 'date' && (
              <Calendar mode="single" selected={tempDate} onSelect={(date) => { if(date) { setTempDate(date); setSetupStep('hour'); } }} disabled={{ after: new Date() }} className="rounded-3xl border" />
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

      <AlertDialog open={isHabitDeleteDialogOpen} onOpenChange={setIsHabitDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2.5rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black text-center">{isAr ? "حذف العداد" : "Delete Tracker"}</AlertDialogTitle>
            <AlertDialogDescription className="text-center font-bold">{t.deleteHabitConfirm}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="rounded-xl font-black">{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteActiveHabit} className="bg-destructive text-destructive-foreground rounded-xl font-black">{t.delete}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2.5rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black text-center">{t.confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription className="text-center font-bold">{t.confirmDelete}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="rounded-xl font-black">{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={clearAllStorage} className="bg-destructive text-destructive-foreground rounded-xl font-black">{t.delete}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SidePanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} side={isAr ? 'left' : 'right'} title={t.settings}>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-3xl">
            <div className="flex items-center gap-3"><Languages className="w-5 h-5 opacity-60" /><Label className="font-bold">{t.language}</Label></div>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-24 h-10 rounded-xl border-none shadow-sm"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-3xl">
            <div className="flex items-center gap-3">{theme === 'dark' ? <Moon className="w-5 h-5 opacity-60" /> : <Sun className="w-5 h-5 opacity-60" />}<Label className="font-bold">{t.darkMode}</Label></div>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>
          <Button variant="destructive" className="w-full h-14 rounded-2xl font-black gap-2 mt-10 shadow-lg" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="w-5 h-5" /> {t.deleteData}
          </Button>
        </div>
      </SidePanel>

      <SidePanel isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} side={isAr ? 'right' : 'left'} title={t.account}>
        <div className="flex flex-col items-center space-y-4 pt-4">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center"><User className="w-10 h-10 text-accent" /></div>
          <div className="text-center">
            <h3 className="text-lg font-bold">{t.profile}</h3>
            <p className="text-xs text-muted-foreground">{t.localActive}</p>
          </div>
        </div>
      </SidePanel>
    </div>
  )
}
