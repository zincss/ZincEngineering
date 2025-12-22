import './globals.css'
import type { Metadata, Viewport } from 'next'
import Header from './components/Header'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: "Zinc Engineering",
  // ...
  appleWebApp: {
    title: "Zinc Engineering",
    statusBarStyle: "default",
    // capable: true, // REMOVED to fix console warning
  },
  // Add the modern equivalent manually if you really need full-screen mode
  other: {
    "mobile-web-app-capable": "yes",
  },
}

export const viewport: Viewport = {
  themeColor: "#fafafa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 min-h-screen flex flex-col selection:bg-[#DFFF00] selection:text-black">
        <Providers>
          <Header /> 
          {/* FIXED: Added padding-top so content starts below the header */}
          <main className="flex-1 relative pt-14 md:pt-20">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}