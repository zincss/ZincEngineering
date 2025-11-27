import './globals.css'
import type { Metadata } from 'next'
import Header from './components/Header'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'ZINC ENGINEERING // HUB',
  description: 'Advanced Tactical & Athletic Telemetry',
}

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
          <main className="flex-1 relative">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}