'use client'

import { ThemeProvider } from 'next-themes'
import { AuthProvider } from './context/AuthContext'
import { SportsModeProvider } from './context/SportsModeContext'

// [UPDATE] Accept initialUser prop

export function Providers({ children, initialUser }: { children: React.ReactNode, initialUser: any }) {

  return (

    <ThemeProvider 

      attribute="class" 

      defaultTheme="dark" 

      forcedTheme="dark" 

      enableSystem={false}

    >
      <SportsModeProvider>
        <AuthProvider initialUser={initialUser}>

          {children}

        </AuthProvider>
      </SportsModeProvider>

    </ThemeProvider>

  )

}


