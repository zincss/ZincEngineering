'use client';

import React from 'react';
import WeatherTerminal from './components/WeatherTerminal';

export default function WeatherPage() {

  return (

    <div className="fixed inset-0 z-[9999] bg-black text-white selection:bg-[#DFFF00] selection:text-black overflow-hidden">

      <WeatherTerminal />

    </div>

  );

}
