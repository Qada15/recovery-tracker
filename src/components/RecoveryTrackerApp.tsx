
"use client"

import * as React from "react"
import { Home, Settings, User as UserIcon, Plus, Sparkles, Globe, Trash2, Info, Moon, Sun, Target, Shield, Flame, Cloud, Ghost, Calendar as CalendarIcon, UserCog, AppWindow, ArrowRight, Heart, Zap, Check, Cigarette, Coffee, Candy, Wine, Dices, Smartphone, Skull, Ban, LayoutGrid, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TimerDisplay } from "@/components/TimerDisplay"
import { JourneyLog } from "@/components/JourneyLog"
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
    motivation: "أنت تبلي بلاءً حسنًا!",
    addHabit: "إضافة عداد جديد",
    setupTitle: "إعداد العداد",
    save: "حفظ وبدء",
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
    selectColor: "اختر لوناً",
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
    profileInfo: "إعدادات الملف الشخصي",
    appSettings: "إعدادات التطبيق",
    age: "العمر",
    years: "سنة",
    months: "شهر",
    days: "يوم",
    day: "يوم",
    month: "شهر",
    year: "سنة",
    next: "التالي",
    home: "الرئيسية",
    trackers: "العدادات",
    noTrackers: "لا توجد عدادات حالياً",
    clickToAdd: "اضغط لإضافة عداد جديد"
  },
  en: {
    title: "Recovery",
    motivation: "You are doing great!",
    addHabit: "Add New Tracker",
    setupTitle: "Setup Tracker",
    save: "Save & Start",
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
    selectColor: "Select Color",
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
    profileInfo: "Profile Settings",
    appSettings: "App Settings",
    age: "Age",
    years: "Years",
    months: "Months",
    days: "Days",
    day: "Day",
    month: "Month",
    year: "Year",
    next: "Next",
    home: "Home",
    trackers: "Trackers",
    noTrackers: "No trackers found",
    clickToAdd: "Add a new tracker"
  }
}

const AVAILABLE_ICONS = [
  { name: 'Cigarette', icon: Cigarette },
  { name: 'Coffee', icon: Coffee },
  { name: 'Candy', icon: Candy },
  { name: 'Wine', icon: Wine },
  { name: 'Dices', icon: Dices },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Skull', icon: Skull },
  { name: 'Ban', icon: Ban },
  { name: 'Flame', icon: Flame },
  { name: 'Shield', icon: Shield },
  { name: 'Target', icon: Target },
  { name: 'Sparkles', icon: Sparkles },
]

const AVAILABLE_COLORS = [
  "hsl(217 91% 60%)",
  "hsl(160 84% 39%)",
  "hsl(190 90% 45%)",
  "hsl(230 70% 60%)",
  "hsl(260 75% 65%)",
  "hsl(215 20% 45%)",
]

type AppView = 'home' | 'trackers' | 'profile' | 'settings';

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
  const [activeView, setActiveView] = React.useState<AppView>('home')
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false)
  const [isSetupOpen, setIsSetupOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isClearDataOpen, setIsClearDataOpen] = React.useState(false)
  const [isFactoryResetOpen, setIsFactoryResetOpen] = React.useState(false)
  const [setupStep, setSetupStep] = React.useState<'name' | 'icon' | 'color'>('name')

  const [language, setLanguage] = React.useState<'ar' | 'en'>('ar')
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light')
  const [habits, setHabits] = React.useState<Habit[]>([])
  const [activeHabitId, setActiveHabitId] = React.useState<string | null>(null)
  const [profile, setProfile] = React.useState<UserProfile>({ name: "", surname: "", birthDate: "", gender: "" })

  const [tempName, setTempName] = React.useState("")
  const [tempIcon, setTempIcon] = React.useState("Cigarette")
  const [tempColor, setTempColor] = React.useState(AVAILABLE_COLORS[0])
  
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
    if (!tempName.trim()) return
    const now = new Date()
    const newHabit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      name: tempName,
      icon: tempIcon,
      startDate: now.toISOString(),
      resetDates: [now.toISOString()],
      color: tempColor
    }
    const newHabits = [...habits, newHabit]
    setHabits(newHabits)
    saveToStorage(STORAGE_KEYS.HABITS, JSON.stringify(newHabits))
    setActiveHabitId(newHabit.id)
    saveToStorage(STORAGE_KEYS.ACTIVE_HABIT_ID, newHabit.id)
    setIsSetupOpen(false)
    setSetupStep('name')
    setTempName("")
    setTempIcon("Cigarette")
    setTempColor(AVAILABLE_COLORS[0])
    setActiveView('home')
  }, [habits, tempName, tempIcon, tempColor])

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
        <div className="w-full max-sm space-y-8">
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

  const renderHomeView = () => {
    if (activeHabit && activeHabitData) {
      return (
        <div className="w-full h-full flex flex-col items-center">
          <div className="text-center py-6 shrink-0 mt-8">
            <h1 className="text-2xl font-black tracking-tighter mb-1">{t.title}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.motivation}</p>
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
        </div>
      );
    }
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        <button onClick={() => { setActiveView('trackers'); }} className="w-24 h-24 rounded-[2.5rem] bg-slate-800 dark:bg-slate-900 text-white shadow-xl flex items-center justify-center active:scale-95 transition-transform">
          <Target className="h-10 w-10" />
        </button>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black tracking-tighter">{t.onboardingTitle}</h2>
          <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">{isAr ? "انتقل لصفحة العدادات للبدء" : "Go to Trackers to start"}</p>
        </div>
      </div>
    );
  };

  const renderTrackersView = () => (
    <div className="w-full h-full flex flex-col p-6 overflow-hidden">
      <header className="shrink-0 flex items-center justify-between mb-8 pt-4">
        <h2 className="text-3xl font-black tracking-tighter">{t.trackers}</h2>
        <Button onClick={() => { setIsSetupOpen(true); setSetupStep('name'); }} size="icon" className="h-12 w-12 rounded-2xl bg-slate-900 text-white shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pb-24">
        {habits.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center opacity-40">
            <LayoutGrid className="h-12 w-12 mb-4" />
            <p className="text-sm font-black uppercase tracking-widest">{t.noTrackers}</p>
            <p className="text-[10px] mt-1">{t.clickToAdd}</p>
          </div>
        ) : (
          habits.map((habit) => {
            const HabitIcon = AVAILABLE_ICONS.find(i => i.name === habit.icon)?.icon || Sparkles;
            const isActive = activeHabitId === habit.id;
            return (
              <button
                key={habit.id}
                onClick={() => { setActiveHabitId(habit.id); saveToStorage(STORAGE_KEYS.ACTIVE_HABIT_ID, habit.id); setActiveView('home'); }}
                className={cn(
                  "w-full p-5 rounded-[2rem] flex items-center gap-4 transition-all border-2 text-right",
                  isActive ? "bg-white dark:bg-slate-900 border-primary/20 shadow-xl scale-[1.02]" : "bg-white/50 dark:bg-slate-900/50 border-transparent hover:bg-white dark:hover:bg-slate-900"
                )}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0" style={{ backgroundColor: `${habit.color}15` }}>
                  <HabitIcon className="h-7 w-7" style={{ color: habit.color }} />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-black tracking-tight">{habit.name}</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    {isAr ? "انقر للبدء" : "Click to view"}
                  </p>
                </div>
                {isActive && <div className="w-2 h-2 rounded-full bg-primary" />}
              </button>
            )
          })
        )}
      </div>
    </div>
  );

  const renderProfileView = () => (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-10">
      <div className="relative">
        <div className="w-32 h-32 rounded-[3rem] bg-white dark:bg-slate-900 flex items-center justify-center shadow-2xl border">
          <UserIcon className="h-14 w-14 text-slate-300" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center border-4 border-background shadow-lg">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      </div>

      <div className="space-y-1">
        <h2 className="text-3xl font-black tracking-tighter">{profile.name} {profile.surname}</h2>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{profile.gender === 'male' ? t.male : t.female}</p>
      </div>

      {age && (
        <div className="w-full max-w-xs space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest opacity-30">{t.age}</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border shadow-sm">
              <div className="text-2xl font-black text-primary tabular-nums">{age.years}</div>
              <div className="text-[8px] font-black uppercase opacity-40 mt-1">{t.years}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border shadow-sm">
              <div className="text-2xl font-black text-primary tabular-nums">{age.months}</div>
              <div className="text-[8px] font-black uppercase opacity-40 mt-1">{t.months}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border shadow-sm">
              <div className="text-2xl font-black text-primary tabular-nums">{age.days}</div>
              <div className="text-[8px] font-black uppercase opacity-40 mt-1">{t.days}</div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-8 opacity-40">
        <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed">
          {t.localNote}
        </p>
      </div>
    </div>
  );

  const renderSettingsView = () => (
    <div className="w-full h-full flex flex-col p-6 overflow-hidden">
      <header className="shrink-0 mb-8 pt-4">
        <h2 className="text-3xl font-black tracking-tighter">{t.settings}</h2>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pb-24">
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest opacity-30 flex items-center gap-2">
            <UserCog className="h-3 w-3" /> {t.profileInfo}
          </h3>
          <div className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border shadow-sm">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 px-1">{t.userName}</label>
              <Input value={profile.name} onChange={(e) => updateProfile({ name: e.target.value })} className="h-12 rounded-xl font-bold bg-slate-50 dark:bg-slate-800 border-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 px-1">{t.userSurname}</label>
              <Input value={profile.surname} onChange={(e) => updateProfile({ surname: e.target.value })} className="h-12 rounded-xl font-bold bg-slate-50 dark:bg-slate-800 border-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 px-1">{t.birthDate}</label>
              <TripleDateInput value={profile.birthDate} onChange={(val) => updateProfile({ birthDate: val })} labels={{ day: t.day, month: t.month, year: t.year }} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest opacity-30 flex items-center gap-2">
            <AppWindow className="h-3 w-3" /> {t.appSettings}
          </h3>
          <div className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">{t.language}</span>
              <Button variant="ghost" className="rounded-xl font-bold" onClick={toggleLanguage}>
                {language === 'ar' ? "English" : "العربية"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">{t.darkMode}</span>
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            </div>
            <div className="pt-4 border-t">
              <Button variant="destructive" className="w-full h-12 rounded-xl font-black bg-red-500/10 text-red-500 hover:bg-red-500/20 border-none" onClick={() => setIsFactoryResetOpen(true)}>
                <Trash2 className="h-4 w-4 ml-2" /> {t.factoryReset}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950" dir={isAr ? 'rtl' : 'ltr'}>
      <main className="flex-1 w-full relative overflow-hidden">
        {activeView === 'home' && renderHomeView()}
        {activeView === 'trackers' && renderTrackersView()}
        {activeView === 'profile' && renderProfileView()}
        {activeView === 'settings' && renderSettingsView()}
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-md">
        <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 rounded-[2.5rem] shadow-2xl p-2 flex items-center justify-around">
          <button 
            onClick={() => setActiveView('home')}
            className={cn(
              "w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all duration-500",
              activeView === 'home' ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-110" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Home className="h-6 w-6" />
          </button>

          <button 
            onClick={() => setActiveView('trackers')}
            className={cn(
              "w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all duration-500",
              activeView === 'trackers' ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-110" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <LayoutGrid className="h-6 w-6" />
          </button>

          <button 
            onClick={() => setActiveView('profile')}
            className={cn(
              "w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all duration-500",
              activeView === 'profile' ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-110" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <UserIcon className="h-6 w-6" />
          </button>

          <button 
            onClick={() => setActiveView('settings')}
            className={cn(
              "w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all duration-500",
              activeView === 'settings' ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-110" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Settings className="h-6 w-6" />
          </button>
        </nav>
      </div>

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

      <Dialog open={isSetupOpen} onOpenChange={setIsSetupOpen}>
        <DialogContent className="rounded-[2.5rem] p-5 max-w-[340px] max-h-[90vh] overflow-hidden flex flex-col z-[200]">
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
                <div className="text-center mb-2">
                   <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{t.selectIcon}</p>
                </div>
                <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto p-1">
                  {AVAILABLE_ICONS.map((item) => (
                    <button key={item.name} onClick={() => setTempIcon(item.name)} className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${tempIcon === item.name ? 'bg-primary text-white shadow-md scale-105' : 'bg-secondary/40 text-slate-400'}`}>
                      <item.icon className="h-5 w-5" />
                    </button>
                  ))}
                </div>
                <Button onClick={() => setSetupStep('color')} className="w-full h-12 mt-2 rounded-xl font-black bg-slate-800">{t.next}</Button>
              </div>
            )}
            {setupStep === 'color' && (
              <div className="w-full space-y-4">
                <div className="text-center mb-2">
                   <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{t.selectColor}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {AVAILABLE_COLORS.map((color) => (
                    <button 
                      key={color} 
                      onClick={() => setTempColor(color)} 
                      className={cn(
                        "h-12 rounded-xl flex items-center justify-center transition-all border-4",
                        tempColor === color ? "border-slate-800 scale-105" : "border-transparent opacity-60"
                      )}
                      style={{ backgroundColor: color }}
                    >
                      {tempColor === color && <Check className="h-5 w-5 text-white" />}
                    </button>
                  ))}
                </div>
                <Button 
                  onClick={handleFinishSetup} 
                  className="w-full h-14 rounded-xl font-black bg-slate-900 mt-4 flex items-center justify-center gap-2 shadow-lg"
                >
                  {t.save} <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isClearDataOpen} onOpenChange={setIsClearDataOpen}>
        <AlertDialogContent className="rounded-[2rem] max-w-[300px] z-[210]">
          <AlertDialogHeader><AlertDialogTitle className="font-black text-sm">{isAr ? "حذف سجلات العداد" : "Clear Habit History"}</AlertDialogTitle><AlertDialogDescription className="text-xs">{t.confirmClear}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 mt-2"><AlertDialogCancel className="rounded-xl flex-1 mt-0 text-xs">{t.cancel}</AlertDialogCancel><AlertDialogAction onClick={() => { if (!activeHabit) return; const now = new Date(); handleUpdateActiveHabit({ startDate: now.toISOString(), resetDates: [now.toISOString()] }); setIsClearDataOpen(false); toast({ title: t.historyCleared }); }} className="bg-orange-500 rounded-xl flex-1 text-xs">{t.save}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2rem] max-w-[300px] z-[210]">
          <AlertDialogHeader><AlertDialogTitle className="font-black text-sm">{isAr ? "تأكيد الحذف" : "Confirm Delete"}</AlertDialogTitle><AlertDialogDescription className="text-xs">{t.confirmDelete}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 mt-2"><AlertDialogCancel className="rounded-xl flex-1 mt-0 text-xs">{t.cancel}</AlertDialogCancel><AlertDialogAction onClick={() => { const newHabits = habits.filter(h => h.id !== activeHabitId); setHabits(newHabits); saveToStorage(STORAGE_KEYS.HABITS, JSON.stringify(newHabits)); setActiveHabitId(newHabits[0]?.id || null); setIsDeleteDialogOpen(false); setActiveView('trackers'); }} className="bg-red-500 rounded-xl flex-1 text-xs">{isAr ? "حذف" : "Delete"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isFactoryResetOpen} onOpenChange={setIsFactoryResetOpen}>
        <AlertDialogContent className="rounded-[2rem] max-w-[300px] z-[210]">
          <AlertDialogHeader><AlertDialogTitle className="font-black text-red-500 text-sm">{t.factoryReset}</AlertDialogTitle><AlertDialogDescription className="text-xs">{t.resetWarning}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 mt-2"><AlertDialogCancel className="rounded-xl flex-1 mt-0 text-xs">{t.cancel}</AlertDialogCancel><AlertDialogAction onClick={clearAllStorage} className="bg-red-500 rounded-xl flex-1 text-xs">{isAr ? "تأكيد" : "Confirm"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
