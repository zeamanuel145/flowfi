import type { Metadata, Viewport } from 'next';
import { Inter, Source_Code_Pro } from 'next/font/google';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { AuthSessionProvider } from '@/components/layout/AuthSessionProvider';
import { Toaster } from 'sonner';
// Suppress missing type declarations for CSS side-effect import
// @ts-ignore
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: { default: 'FlowFi — Smart Money Management', template: '%s | FlowFi' },
  description: 'A modern, shared money tracker for you and your people. Track expenses, plan budgets, and grow your savings.',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
};

const geistSans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const geistMono = Source_Code_Pro({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <AuthSessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <Toaster richColors position="top-right" expand={false} />
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
