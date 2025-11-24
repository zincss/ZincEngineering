import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from './components/Header'
import { Providers } from './providers' // Import the provider

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ZINC ENGINEERING',
  description: 'Warframe Tactical Database',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-300`}>
        <Providers>
          <Header /> 
          {children}
        </Providers>
      </body>
    </html>
  )
}