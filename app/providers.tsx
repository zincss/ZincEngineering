'use client'

import { ThemeProvider } from 'next-themes'
import { AuthProvider } from './context/AuthContext'

// [UPDATE] Accept initialUser prop
export function Providers({ children, initialUser }: { children: React.ReactNode, initialUser: any }) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      forcedTheme="dark" 
      enableSystem={false}
    >
      <AuthProvider initialUser={initialUser}>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}