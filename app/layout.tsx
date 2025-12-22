import './globals.css'
import type { Metadata, Viewport } from 'next'
import Header from './components/Header'
import { Providers } from './providers'
import { createClient } from '@/utils/supabase/server' // Import the server helper

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
  // [UPDATE] Fetch the user server-side
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 min-h-screen flex flex-col selection:bg-[#DFFF00] selection:text-black">
        {/* [UPDATE] Pass the user to Providers */}
        <Providers initialUser={user}>
          <Header /> 
          <main className="flex-1 relative pt-14 md:pt-20">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}