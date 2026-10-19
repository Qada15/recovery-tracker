import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Recovery Tracker',
  description: 'Track your commitment and progress efficiently.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Recovery Tracker',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // تم تغيير lang إلى "en" لفرض الأرقام الغربية 0-9 مع الحفاظ على dir="rtl" للتخطيط العربي
  return (
    <html lang="en" dir="rtl" suppressHydrationWarning className={inter.variable}>
      <head suppressHydrationWarning>
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <FirebaseClientProvider>
          <div className="flex flex-col h-full w-full fixed inset-0 overflow-hidden pointer-events-auto">
            {children}
          </div>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
