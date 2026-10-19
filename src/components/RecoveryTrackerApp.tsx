
"use client"

import * as React from "react"
import { Settings, User as UserIcon, Plus, Sparkles, Globe, Trash2, Info, Moon, Sun, Target, Shield, Flame, Cloud, Ghost, Calendar as CalendarIcon, UserCog, AppWindow, ArrowRight, Heart, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TimerDisplay } from "@/components/TimerDisplay"
import { JourneyLog } from "@/components/JourneyLog"
import { SidePanel } from "@/components/SidePanel"
import { saveToStorage, getFromStorage, STORAGE_KEYS, clearAllStorage, type Habit, type UserProfile } from "@/lib/storage"
import { parseISO, isSameDay, startOfDay, isBefore, format, intervalToDuration, isValid, setYear, setMonth, setDate } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
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
    selectIcon: "اختر رمزاً",
    profile: "الملف الشخصي",
    welcome: "مرحباً بك",
    onboardingTitle: "لنبدأ رحلتك",
    onboardingSub: "يرجى إكمال بياناتك للبدء",
    localNote: "يتم حفظ بياناتك محلياً على هذا الجهاز",
    userName: "الاسم الأول",
    userSurname: "اللقب",
    birthDate: "تاريخ الميلاد",
    gender: "الجنس",
    male: "ذكر",
    female: "أنثى",
    start: "ابدأ الآن",
    invalidDate: "التاريخ غير صالح",
    pickDate: "اختر التاريخ",
    profileInfo: "إعدادات الملف الشخصي",
    appSettings: "إعدادات التطبيق",
    age: "العمر",
    years: "سنة",
    months: "شهر",
    days: "يوم",
    day: "يوم",
    month: "شهر",
    year: "سنة",
    next: "التالي"
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
    selectIcon: "Select Icon",
    profile: "Profile",
    welcome: "Welcome",
    onboardingTitle: "Let's Start Your Journey",
    onboardingSub: "Please complete your profile to begin",
    localNote: "Your data is saved locally on this device",
    userName: "First Name",
    userSurname: "Surname",
    birthDate: "Birth Date",
    gender: "Gender",
    male: "Male",
    female: "Female",
    start: "Start Now",
    invalidDate: "Invalid Date",
    pickDate: "Pick Date",
    profileInfo: "Profile Settings",
    appSettings: "App Settings",
    age: "Age",
    years: "Years",
    months: "Months",
    days: "Days",
    day: "Day",
    month: "Month",
    year: "Year",
    next: "Next"
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

function TripleDateInput({ 
  value, 
  onChange, 
  labels 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  labels: { day: string, month: string, year: string }
}) {
  const [parts, setParts] = React.useState(() => {
    if (!value) return { day: "", month: "", year: "" };
    const d = new Date(value);
    if (!isValid(d)) return { day: "", month: "", year: "" };
    return {
      day: d.getDate().toString(),
      month: (d.getMonth() + 1).toString(),
      year: d.getFullYear().toString()
    };
  });

  const update = (newParts: typeof parts) => {
    setParts(newParts);
    const d = parseInt(newParts.day);
    const m = parseInt(newParts.month) - 1;
    const y = parseInt(newParts.year);

    if (d > 0 && d <= 31 && m >= 0 && m < 12 && y > 1900 && y <= new Date().getFullYear()) {
      const date = setDate(setMonth(setYear(new Date(), y), m), d);
      if (isValid(date)) {
        onChange(date.toISOString().split('T')[0]);
      }
    }
  };

  const handleChar = (val: string) => val.replace(/[^0-9]/g, '');

  return (
    <div className="grid grid-cols-3 gap-2" dir="ltr">
      <div className="space-y-1">
        <Input 
          type="text" 
          inputMode="numeric"
          placeholder="DD"
          className="text-center font-black h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none tabular-nums"
          value={parts.day}
          maxLength={2}
          onChange={(e) => update({ ...parts, day: handleChar(e.target.value) })}
        />
        <label className="block text-[7px] font-black uppercase tracking-widest opacity-30 text-center">{labels.day}</label>
      </div>
      <div className="space-y-1">
        <Input 
          type="text" 
          inputMode="numeric"
          placeholder="MM"
          className="text-center font-black h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none tabular-nums"
          value={parts.month}
          maxLength={2}
          onChange={(e) => update({ ...parts, month: handleChar(e.target.value) })}
        />
        <label className="block text-[7px] font-black uppercase tracking-widest opacity-30 text-center">{labels.month}</label>
      </div>
      <div className="space-y-1">
        <Input 
          type="text" 
          inputMode="numeric"
          placeholder="YYYY"
          className="text-center font-black h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none tabular-nums"
          value={parts.year}
          maxLength={4}
          onChange={(e) => update({ ...parts, year: handleChar(e.target.value) })}
        />
        <label className="block text-[7px] font-black uppercase tracking-widest opacity-30 text-center">{labels.year}</label>
      </div>
    </div>
  );
}

export function RecoveryTrackerApp() {
  const { toast } = useToast()
  const [mounted, setMounted] = React.useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false)
  const [isSetupOpen, setIsSetupOpen] = React.useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [isProfileOpen, setIsProfileOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isClearDataOpen, setIsClearDataOpen] = React.useState(false)
  const [isFactoryResetOpen, setIsFactoryResetOpen] = React.useState(false)
  const [setupStep, setSetupStep] = React.useState<'name' | 'icon' | 'date'>('name')

  const [language, setLanguage] = React.useState<'ar' | 'en'>('ar')
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light')
  const [habits, setHabits] = React.useState<Habit[]>([])
  const [activeHabitId, setActiveHabitId] = React.useState<string | null>(null)
  const [profile, setProfile] = React.useState<UserProfile>({ name: "", surname: "", birthDate: "", gender: "" })

  const [tempName, setTempName] = React.useState("")
  const [tempIcon, setTempIcon] = React.useState("Sparkles")
  const [tempHabitDate, setTempHabitDate] = React.useState("")
  
  const [today, setToday] = React.useState<Date | null>(null)

  React.useEffect(() => {
    setMounted(true)
    const now = new Date()
    setToday(startOfDay(now))
    
    const savedHabits = getFromStorage(STORAGE_KEYS.HABITS)
    const savedActiveId = getFromStorage(STORAGE_KEYS.ACTIVE_HABIT_ID)
    const savedLang = getFromStorage(STORAGE_KEYS.LANGUAGE) as 'ar' | 'en'
    const savedTheme = getFromStorage(STORAGE_KEYS.THEME) as 'light' | 'dark'
    const savedProfile = getFromStorage(STORAGE_KEYS.USER_PROFILE)

    if (savedLang) setLanguage(savedLang)
    if (savedTheme) {
      setTheme(savedTheme)
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', savedTheme === 'dark')
      }
    }

    if (savedProfile) {
      try { setProfile(JSON.parse(savedProfile)) } catch (e) { console.error("Profile parse error") }
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

  const userBirthDate = React.useMemo(() => profile.birthDate ? startOfDay(parseISO(profile.birthDate)) : null, [profile.birthDate])
  const isProfileComplete = React.useMemo(() => {
    return profile.name.trim() !== "" && profile.surname.trim() !== "" && profile.birthDate !== "" && profile.gender !== ""
  }, [profile])

  const age = React.useMemo(() => {
    if (!profile.birthDate || !today) return null
    const birth = parseISO(profile.birthDate)
    if (!isValid(birth)) return null;
    const duration = intervalToDuration({ start: birth, end: new Date() })
    return {
      years: duration.years || 0,
      months: duration.months || 0,
      days: duration.days || 0
    }
  }, [profile.birthDate, today])

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
    if (!tempHabitDate) return
    const finalDate = startOfDay(parseISO(tempHabitDate))
    
    if (userBirthDate && isBefore(finalDate, userBirthDate)) {
      toast({ variant: "destructive", title: language === 'ar' ? "تاريخ غير مسموح" : "Invalid Date", description: language === 'ar' ? "لا يمكن اختيار تاريخ قبل ميلادك" : "Cannot choose a date before your birth" });
      return;
    }

    // عند إنشاء عداد جديد، يعتبر تاريخ البدء هو أول انتكاسة مسجلة تلقائياً
    const newHabit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      name: tempName,
      icon: tempIcon,
      startDate: finalDate.toISOString(),
      resetDates: [finalDate.toISOString()], // تسجيل تاريخ البدء كانتكاسة أولى
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
    setTempHabitDate("")
  }, [habits, tempName, tempIcon, tempHabitDate, userBirthDate, language, toast])

  const updateProfile = (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates }
    setProfile(newProfile)
    saveToStorage(STORAGE_KEYS.USER_PROFILE, JSON.stringify(newProfile))
  }

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

  if (!isProfileComplete) {
    return (
      <div className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center p-6 text-center overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-sm space-y-8">
          <header className="space-y-2">
            <div className="mx-auto w-20 h-20 rounded-[2rem] bg-slate-900 flex items-center justify-center shadow-2xl mb-6">
              <Sparkles className="h-10 w-10 text-orange-400" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter">{t.onboardingTitle}</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t.onboardingSub}</p>
          </header>

          <div className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-xl border overflow-y-auto max-h-[60vh] custom-scrollbar">
            <div className="space-y-1.5 text-right">
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 px-1">{t.userName}</label>
              <Input value={profile.name} onChange={(e) => updateProfile({ name: e.target.value })} placeholder="..." className="h-12 rounded-xl font-bold bg-slate-50 dark:bg-slate-800 border-none" />
            </div>

            <div className="space-y-1.5 text-right">
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 px-1">{t.userSurname}</label>
              <Input value={profile.surname} onChange={(e) => updateProfile({ surname: e.target.value })} placeholder="..." className="h-12 rounded-xl font-bold bg-slate-50 dark:bg-slate-800 border-none" />
            </div>

            <div className="space-y-1.5 text-right">
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 px-1">{t.birthDate}</label>
              <TripleDateInput 
                value={profile.birthDate} 
                onChange={(val) => updateProfile({ birthDate: val })} 
                labels={{ day: t.day, month: t.month, year: t.year }}
              />
            </div>

            <div className="space-y-1.5 text-right">
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 px-1">{t.gender}</label>
              <Select value={profile.gender} onValueChange={(v: any) => updateProfile({ gender: v })}>
                <SelectTrigger className="h-12 rounded-xl font-bold bg-slate-50 dark:bg-slate-800 border-none shadow-none">
                  <SelectValue placeholder="..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="male" className="font-bold">{t.male}</SelectItem>
                  <SelectItem value="female" className="font-bold">{t.female}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest leading-relaxed">
            {t.localNote}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950" dir={isAr ? 'rtl' : 'ltr'}>
      <header className="h-14 flex items-center justify-between px-6 z-40 shrink-0 border-b bg-background/50 backdrop-blur-md">
        <Button variant="ghost" size="icon" className="rounded-full text-slate-400" onClick={() => setIsProfileOpen(true)}>
          <UserIcon className="h-5 w-5" />
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
        birthDate={userBirthDate}
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
        <div className="space-y-8 pb-10">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-30 flex items-center gap-2">
              <UserCog className="h-3 w-3" /> {t.profileInfo}
            </h3>
            <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 px-1">{t.userName}</label>
                <Input value={profile.name} onChange={(e) => updateProfile({ name: e.target.value })} placeholder="..." className="h-10 rounded-xl font-bold bg-white dark:bg-slate-900 border-none shadow-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 px-1">{t.userSurname}</label>
                <Input value={profile.surname} onChange={(e) => updateProfile({ surname: e.target.value })} placeholder="..." className="h-10 rounded-xl font-bold bg-white dark:bg-slate-900 border-none shadow-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 px-1">{t.birthDate}</label>
                <TripleDateInput 
                  value={profile.birthDate} 
                  onChange={(val) => updateProfile({ birthDate: val })} 
                  labels={{ day: t.day, month: t.month, year: t.year }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 px-1">{t.gender}</label>
                <Select value={profile.gender} onValueChange={(v: any) => updateProfile({ gender: v })}>
                  <SelectTrigger className="h-10 rounded-xl font-bold bg-white dark:bg-slate-900 border-none shadow-sm">
                    <SelectValue placeholder="..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="male" className="font-bold">{t.male}</SelectItem>
                    <SelectItem value="female" className="font-bold">{t.female}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-30 flex items-center gap-2">
              <AppWindow className="h-3 w-3" /> {t.appSettings}
            </h3>
            <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
              <div className="space-y-2">
                <h3 className="text-[9px] font-black uppercase tracking-widest opacity-40 px-1">{t.language}</h3>
                <Button variant="outline" className="w-full h-10 rounded-xl font-bold justify-between px-4 border-none bg-white dark:bg-slate-900 shadow-sm" onClick={toggleLanguage}>
                  <Globe className="h-4 w-4 opacity-40" />
                  <span>{language === 'ar' ? "English" : "العربية"}</span>
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="text-[9px] font-black uppercase tracking-widest opacity-40 px-1">{t.theme}</h3>
                <div className="w-full h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-between px-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    {theme === 'dark' ? <Moon className="h-4 w-4 text-slate-400" /> : <Sun className="h-4 w-4 text-orange-500" />}
                    <span className="font-bold text-sm">{t.darkMode}</span>
                  </div>
                  <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} className="scale-75" />
                </div>
              </div>

              <div className="pt-2">
                <Button variant="destructive" className="w-full h-10 rounded-xl font-bold justify-between px-4 bg-red-500/10 text-red-500 border-none hover:bg-red-500/20" onClick={() => setIsFactoryResetOpen(true)}>
                  <Trash2 className="h-4 w-4" />
                  <span>{t.factoryReset}</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t opacity-40 flex items-center justify-between">
             <div className="flex items-center gap-2">
              <Info className="h-3 w-3" />
              <div className="text-[9px] font-black uppercase tabular-nums">{t.version}</div>
             </div>
             <Heart className="h-3 w-3 text-red-500 fill-red-500" />
          </div>
        </div>
      </SidePanel>

      <SidePanel
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        side={isAr ? "left" : "right"}
        title={t.profile}
      >
        <div className="flex flex-col space-y-8 items-center text-center">
           <div className="relative">
              <div className="w-24 h-24 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                 <UserIcon className="h-10 w-10 text-slate-400" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-4 border-background shadow-lg">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
           </div>

           <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight">{profile.name} {profile.surname}</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{profile.gender === 'male' ? t.male : t.female}</p>
           </div>

           {age && (
             <div className="w-full space-y-3">
               <h3 className="text-[9px] font-black uppercase tracking-widest opacity-30">{t.age}</h3>
               <div className="grid grid-cols-3 gap-2">
                 <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                   <div className="text-xl font-black text-primary tabular-nums">{age.years}</div>
                   <div className="text-[8px] font-black uppercase opacity-40 mt-1">{t.years}</div>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                   <div className="text-xl font-black text-primary tabular-nums">{age.months}</div>
                   <div className="text-[8px] font-black uppercase opacity-40 mt-1">{t.months}</div>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                   <div className="text-xl font-black text-primary tabular-nums">{age.days}</div>
                   <div className="text-[8px] font-black uppercase opacity-40 mt-1">{t.days}</div>
                 </div>
               </div>
             </div>
           )}

           <div className="w-full pt-4 opacity-40">
              <p className="text-[8px] font-black uppercase tracking-widest leading-relaxed">
                 {t.localNote}
              </p>
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
                <Button disabled={!tempName.trim()} onClick={() => setSetupStep('icon')} className="w-full h-14 rounded-xl font-black bg-slate-800">{t.next}</Button>
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
                <Button onClick={() => setSetupStep('date')} className="w-full h-12 mt-2 rounded-xl font-black bg-slate-800">{t.next}</Button>
              </div>
            )}
            {setupStep === 'date' && (
              <div className="w-full space-y-4">
                <div className="text-center mb-2">
                   <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{isAr ? "تاريخ بداية العداد" : "Start Date"}</p>
                </div>
                <TripleDateInput 
                  value={tempHabitDate} 
                  onChange={setTempHabitDate} 
                  labels={{ day: t.day, month: t.month, year: t.year }}
                />
                <Button 
                  disabled={!tempHabitDate} 
                  onClick={handleFinishSetup} 
                  className="w-full h-14 rounded-xl font-black bg-slate-900 mt-4 flex items-center justify-center gap-2"
                >
                  {t.save} <ArrowRight className="h-5 w-5" />
                </Button>
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
