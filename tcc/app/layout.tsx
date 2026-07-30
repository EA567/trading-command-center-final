import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppStoreProvider } from "@/lib/store/AppStoreContext";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/lib/theme/ThemeContext";
import { ToastProvider } from "@/components/ui/Toast";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Trading Command Center",
  description: "A professional, institutional-style trading operating system: accounts, journal, calendar, analytics, psychology, goals, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning is required here because the inline script
    // below mutates the class attribute before React hydrates (to prevent
    // a flash of the wrong theme). This is the standard, documented pattern
    // for theme toggles in the Next.js App Router.
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Blocking script: applies the stored theme class before first
            paint, so there is no flash of the wrong theme on load. See
            lib/theme/ThemeContext.tsx for the corresponding React logic. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans bg-zinc-950 text-zinc-100">
        <ThemeProvider>
          <AppStoreProvider>
            <ToastProvider>
              <AppShell>{children}</AppShell>
            </ToastProvider>
          </AppStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
