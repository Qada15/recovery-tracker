
"use client"

import * as React from "react"
import { Settings, User, Languages, Moon, Sun, Trash2, Plus, Flame, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidePanel } from "@/components/SidePanel"
import { TimerDisplay } from "@/components/TimerDisplay"
import { JourneyLog } from "@/components/JourneyLog"
import { saveToStorage, getFromStorage, STORAGE_KEYS, clearAllStorage } from "@/lib/storage"
import { isValid, parseISO, startOfDay, isBefore, isSameDay, setHours, setMinutes } from "date-fns"
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
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { CircularTimePicker } from "./CircularTimePicker"

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
  }
}

export function RecoveryTrackerApp() {
  const { toast } = useToast()
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [isAccountOpen, setIsAccountOpen] = React.useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false)
  const [isSetupOpen, setIsSetupOpen] = React.useState(false)
  const [setupStep, setSetupStep] = React.useState<'name' | 'date' | 'hour' | 'minute'>('name')

  const [language, setLanguage] = React.useState<'ar' | 'en'>('ar')
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light')
  const [habitName, setHabitName] = React.useState("")
  const [accentColor, setAccentColor] = React.useState('hsl(var(--accent))')
  const [startDate, setStartDate] = React.useState<Date | null>(null)
  const [resetDates, setResetDates] = React.useState<Date[]>([])

  const [tempName, setTempName] = React.useState("")
  const [tempDate, setTempDate] = React.useState<Date>(new Date())
  const [tempHour, setTempHour] = React.useState(new Date().getHours())
  const [tempMinute, setTempMinute] = React.useState(new Date().getMinutes())

  const t = TRANSLATIONS[language]
  const isAr = language === 'ar'

  React.useEffect(() => {
    const savedLang = getFromStorage(STORAGE_KEYS.LANGUAGE) as 'ar' | 'en'
    const savedTheme = getFromStorage(STORAGE_KEYS.THEME) as 'light' | 'dark'
    const savedDate = getFromStorage(STORAGE_KEYS.START_DATE)
    const savedName = getFromStorage(STORAGE_KEYS.HABIT_NAME)
    const savedColor = getFromStorage(STORAGE_KEYS.HABIT_COLOR)
    const savedResets = getFromStorage(STORAGE_KEYS.RESET_DATES)

    if (savedLang) setLanguage(savedLang)
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    }
    if (savedDate) {
      const parsed = new Date(savedDate)
      if (isValid(parsed)) setStartDate(parsed)
    }
    if (savedName) setHabitName(savedName)
    if (savedColor) setAccentColor(savedColor)
    if (savedResets) {
      try {
        const parsedResets = JSON.parse(savedResets).map((d: string) => parseISO(d))
        setResetDates(parsedResets)
      } catch (e) {
        console.error("Error parsing reset dates")
      }
    }
  }, [])

  const handleFinishSetup = () => {
    const finalDate = setMinutes(setHours(tempDate, tempHour), tempMinute)
    setHabitName(tempName)
    setStartDate(finalDate)
    
    // عند إنشاء عداد جديد، يوم البداية هو يوم تصفير
    const initialResets = [finalDate]
    setResetDates(initialResets)

    saveToStorage(STORAGE_KEYS.HABIT_NAME, tempName)
    saveToStorage(STORAGE_KEYS.START_DATE, finalDate.toISOString())
    saveToStorage(STORAGE_KEYS.RESET_DATES, JSON.stringify(initialResets.map(d => d.toISOString())))
    
    setIsSetupOpen(false)
    setSetupStep('name')
  }

  const handleUpdateStartDate = (newDate: Date) => {
    const startOfNewDate = startOfDay(newDate);
    const filteredResets = resetDates.filter(rd => isBefore(startOfDay(rd), startOfNewDate));
    const finalResets = [...filteredResets, newDate];

    setStartDate(newDate);
    setResetDates(finalResets);
    saveToStorage(STORAGE_KEYS.START_DATE, newDate.toISOString());
    saveToStorage(STORAGE_KEYS.RESET_DATES, JSON.stringify(finalResets.map(d => d.toISOString())));
  }

  const handleResetAction = (targetDate?: Date) => {
    const dateToReset = targetDate || new Date()
    const startOfDate = startOfDay(dateToReset)
    
    if (!targetDate || isSameDay(startOfDate, startOfDay(new Date()))) {
      const now = new Date()
      setStartDate(now)
      saveToStorage(STORAGE_KEYS.START_DATE, now.toISOString())
    }
    
    const isAlreadyRecorded = resetDates.some(rd => isSameDay(startOfDay(rd), startOfDate))
    if (!isAlreadyRecorded) {
      const newResets = [...resetDates, dateToReset]
      setResetDates(newResets)
      saveToStorage(STORAGE_KEYS.RESET_DATES, JSON.stringify(newResets.map(d => d.toISOString())))
    }
  }

  const handleUrgeAction = () => {
    toast({ 
      title: language === 'ar' ? "تنبيه رغبة" : "Urge Recorded", 
      description: language === 'ar' ? "استمر في الصمود!" : "Keep fighting!",
      className: "bg-orange-500 text-white border-none"
    })
  }

  const handleLanguageChange = (lang: string) => {
    const newLang = lang as 'ar' | 'en'
    setLanguage(newLang)
    saveToStorage(STORAGE_KEYS.LANGUAGE, newLang)
  }

  const toggleTheme = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', checked)
    saveToStorage(STORAGE_KEYS.THEME, newTheme)
  }

  const handleDeleteData = () => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(t.confirmDelete);
      if (confirmed) {
        clearAllStorage();
      }
    }
  }

  const hasHabit = habitName && startDate

  return (
    <div className="flex-1 flex flex-col items-center bg-background relative h-full overflow-hidden select-none touch-none" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <header className="w-full h-14 md:h-16 bg-white dark:bg-slate-950 border-b flex items-center justify-between px-6 shadow-sm z-40 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => setIsAccountOpen(true)} className="rounded-full">
          <User className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-black tracking-tighter uppercase">{t.title}</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} className="rounded-full">
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      <main className="flex-1 w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {hasHabit ? (
          <>
            <div className="text-center space-y-1 mb-2 shrink-0">
              <p className="text-muted-foreground font-black text-[8px] uppercase tracking-[0.3em]">{t.journey}</p>
              <h2 className="text-lg font-black tracking-tight">{t.stayStrong}</h2>
            </div>

            <div className="w-full flex-1 flex items-center justify-center min-h-0 overflow-hidden">
              <TimerDisplay 
                externalStartDate={startDate} 
                externalHabitName={habitName}
                externalAccentColor={accentColor}
                resetDates={resetDates}
                onOpenHistory={() => setIsHistoryOpen(true)}
                onUpdateDate={handleUpdateStartDate}
                onUpdateName={(name) => { setHabitName(name); saveToStorage(STORAGE_KEYS.HABIT_NAME, name); }}
                onUpdateColor={(color) => { setAccentColor(color); saveToStorage(STORAGE_KEYS.HABIT_COLOR, color); }}
                onReset={() => handleResetAction()}
                onUrge={handleUrgeAction}
                language={language}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <Button 
              onClick={() => setIsSetupOpen(true)}
              className="w-24 h-24 rounded-full bg-primary text-white shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
            >
              <Plus className="w-12 h-12" />
            </Button>
            <p className="text-sm font-black uppercase tracking-widest opacity-40">{t.addHabit}</p>
          </div>
        )}
      </main>

      {hasHabit && (
        <JourneyLog 
          isOpen={isHistoryOpen} 
          onClose={() => setIsHistoryOpen(false)} 
          startDate={startDate}
          resetDates={resetDates}
          habitName={habitName}
          accentColor={accentColor}
          onReset={handleResetAction}
          onUrge={(date) => handleUrgeAction()}
          language={language}
        />
      )}

      {/* Setup Wizard Dialog */}
      <Dialog open={isSetupOpen} onOpenChange={(open) => { setIsSetupOpen(open); if(!open) setSetupStep('name'); }}>
        <DialogContent className="rounded-[2.5rem] p-6 max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-center font-black">
              {setupStep === 'name' && t.setupTitle}
              {setupStep === 'date' && t.stepDate}
              {setupStep === 'hour' && t.stepHour}
              {setupStep === 'minute' && t.stepMinute}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center min-h-[350px] justify-center">
            {setupStep === 'name' && (
              <div className="w-full space-y-6">
                <p className="text-center text-xs font-black uppercase opacity-40 tracking-widest">{t.enterName}</p>
                <Input 
                  value={tempName} 
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder={isAr ? "مثال: الامتناع عن التدخين" : "e.g. Quitting Smoking"}
                  className="h-14 rounded-2xl text-center font-bold text-lg shadow-inner"
                />
                <Button 
                  disabled={!tempName.trim()}
                  onClick={() => setSetupStep('date')}
                  className="w-full h-14 rounded-2xl font-black shadow-lg"
                >
                  {t.save}
                </Button>
              </div>
            )}
            {setupStep === 'date' && (
              <div className="w-full flex flex-col items-center">
                <Calendar 
                  mode="single" 
                  selected={tempDate} 
                  onSelect={(date) => { if(date) { setTempDate(date); setSetupStep('hour'); } }} 
                  disabled={{ after: new Date() }}
                  className="rounded-3xl border p-2" 
                />
                <Button variant="ghost" onClick={() => setSetupStep('name')} className="mt-4 font-black opacity-40 uppercase text-[10px] tracking-widest">
                  {isAr ? "العودة للاسم" : "Back to Name"}
                </Button>
              </div>
            )}
            {setupStep === 'hour' && (
              <div className="w-full">
                <CircularTimePicker mode="hours" value={tempHour} onChange={setTempHour} onComplete={() => setSetupStep('minute')} />
                <Button variant="ghost" onClick={() => setSetupStep('date')} className="w-full mt-2 font-black opacity-40 uppercase text-[10px] tracking-widest">
                  {isAr ? "العودة للتقويم" : "Back to Calendar"}
                </Button>
              </div>
            )}
            {setupStep === 'minute' && (
              <div className="w-full">
                <CircularTimePicker mode="minutes" value={tempMinute} onChange={setTempMinute} onComplete={handleFinishSetup} />
                <Button variant="ghost" onClick={() => setSetupStep('hour')} className="w-full mt-2 font-black opacity-40 uppercase text-[10px] tracking-widest">
                  {isAr ? "العودة للساعة" : "Back to Hour"}
                </Button>
                <Button onClick={handleFinishSetup} className="w-full h-14 mt-4 rounded-2xl font-black shadow-lg">
                  {isAr ? "بدء الالتزام" : "Start Journey"}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <SidePanel isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} side={language === 'ar' ? 'right' : 'left'} title={t.account}>
        <div className="flex flex-col items-center space-y-6 pt-4">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-accent" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold">{t.profile}</h3>
            <p className="text-xs text-muted-foreground">{t.localActive}</p>
          </div>
        </div>
      </SidePanel>

      <SidePanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} side={language === 'ar' ? 'left' : 'right'} title={t.settings}>
        <div className="space-y-8 py-4">
          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-3xl">
            <div className="flex items-center gap-3">
              <Languages className="w-5 h-5 opacity-60" />
              <Label className="font-bold">{t.language}</Label>
            </div>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-24 h-10 rounded-xl border-none bg-background shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-3xl">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="w-5 h-5 opacity-60" /> : <Sun className="w-5 h-5 opacity-60" />}
              <Label className="font-bold">{t.darkMode}</Label>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>

          <div className="pt-10">
            <Button 
              variant="destructive" 
              className="w-full h-14 rounded-2xl font-black gap-2 shadow-lg"
              onClick={handleDeleteData}
            >
              <Trash2 className="w-5 h-5" />
              {t.deleteData}
            </Button>
          </div>
        </div>
      </SidePanel>
    </div>
  )
}
