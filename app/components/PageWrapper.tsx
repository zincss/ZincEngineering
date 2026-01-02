'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPlanetarium = pathname === '/collections/planetarium';

  return (
    <main className={`flex-1 relative ${isPlanetarium ? '' : 'pt-14 md:pt-20'}`}>
      {children}
    </main>
  );
}