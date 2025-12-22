'use client';

import React from 'react';
import ZincSearchInterface from './components/ZincSearchInterface';

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black relative overflow-x-hidden">
      
      {/* GLOBAL BACKGROUND */}
      <div className="bg-starfield fixed inset-0 z-0" />
      
      {/* NAVIGATION */}

      {/* SEARCH MODULE */}
      <ZincSearchInterface />

    </main>
  );
}