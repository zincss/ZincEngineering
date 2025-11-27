'use client'

import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      forcedTheme="dark" // <--- This locks it permanently
      enableSystem={false}
    >
      {children}
    </ThemeProvider>
  )
}