import './globals.css'
import type { Metadata, Viewport } from 'next'
import Header from './components/Header'
import { Providers } from './providers'
import { createClient } from '@/utils/supabase/server' 
import PageWrapper from './components/PageWrapper' // Import the new wrapper

export const metadata: Metadata = {
  title: "Zinc Engineering",
  appleWebApp: {
    title: "Zinc Engineering",
    statusBarStyle: "default",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
}

export const viewport: Viewport = {
  themeColor: "#fafafa",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 min-h-screen flex flex-col selection:bg-[#DFFF00] selection:text-black">
        <Providers initialUser={user}>
          <Header /> 
          <PageWrapper>
            {children}
          </PageWrapper>
        </Providers>
      </body>
    </html>
  )
}