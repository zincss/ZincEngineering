'use client'

import { ThemeProvider } from 'next-themes'
import { AuthProvider } from './context/AuthContext' // Import this

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      forcedTheme="dark" 
      enableSystem={false}
    >
      <AuthProvider> {/* Wrap here */}
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}