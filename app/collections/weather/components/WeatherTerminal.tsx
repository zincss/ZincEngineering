'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudRain, Wind, Search, Globe, MapPin, Loader2, 
  Droplets, Gauge, Navigation, Calendar, CloudSnow, 
  CloudLightning, Sun, Crosshair, ArrowRight, ChevronLeft,
  Info, Sunrise, Sunset, Home, X
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

// --- COMPONENT: ATMOSPHERIC BACKGROUND ---
const AtmosphericBackground = ({ condition, isDay, isMobile }: { condition: string, isDay: boolean, isMobile: boolean }) => {
  const isStorm = condition === 'STORMING' || condition === 'STORM';
  const isRain = condition === 'RAINING' || isStorm;
  const isSnow = condition === 'SNOWING' || condition === 'SNOW';
  const isWindy = condition === 'WINDY';
  const isCloudy = condition === 'CLOUDY';

  const starCount = isMobile ? 15 : 30;
  const cloudCount = isMobile ? (isCloudy || isStorm || !isDay ? 4 : 2) : (isCloudy || isStorm || !isDay ? 8 : 4);
  const rainCount = isMobile ? (isStorm ? 30 : 15) : (isStorm ? 60 : 30);
  const snowCount = isMobile ? 20 : 40;
  const leafCount = isMobile ? 10 : 20;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0">
      <AnimatePresence>
        <motion.div
          key={`${condition}-${isDay}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{ willChange: 'transform, opacity' }}
        >
          {/* Base Gradient Layer */}
          <div className={`absolute inset-0 transition-colors duration-[2000ms] ease-in-out
            ${isStorm ? 'bg-zinc-950' : 
              isRain ? 'bg-gradient-to-b from-zinc-900 to-black' : 
              isSnow ? 'bg-gradient-to-b from-slate-200 to-zinc-400' :
              isWindy ? 'bg-gradient-to-b from-sky-400 via-sky-200 to-sky-100' :
              isCloudy ? 'bg-gradient-to-b from-zinc-700 via-zinc-800 to-black' :
              isDay ? 'bg-gradient-to-b from-sky-400 via-sky-300 to-sky-100' : 'bg-gradient-to-b from-[#020617] via-[#0f172a] to-black'}
          `} />
          
          {/* Celestial Layer (Moon/Stars for Night) */}
          {!isDay && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,0.5)_0%,transparent_100%)]" />
              <div className="absolute inset-0">
                {[...Array(starCount)].map((_, i) => (
                  <div 
                    key={`star-organic-${i}`}
                    className="absolute bg-white rounded-full"
                    style={{
                      width: '1px',
                      height: '1px',
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      opacity: 0.1 + Math.random() * 0.5,
                      animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite alternate`,
                      animationDelay: `${Math.random() * 5}s`
                    }}
                  />
                ))}
              </div>
              <motion.div 
                initial={{ x: '100%', y: '15%' }}
                animate={{ x: '-10%', y: '10%' }}
                transition={{ duration: 600, repeat: Infinity, ease: "linear" }}
                className="absolute w-64 h-64 rounded-full bg-white/5 blur-[60px]"
              >
                <div className="absolute inset-12 rounded-full bg-slate-100/20 blur-3xl shadow-[0_0_100px_rgba(255,255,255,0.1)]" />
              </motion.div>
            </div>
          )}

          {/* Cloud Layers (Optimized) */}
          {[...Array(cloudCount)].map((_, i) => (
            <div key={`c-${i}`} className={`absolute bg-white rounded-full blur-[100px] animate-cloud transition-opacity duration-[2000ms]
              ${isCloudy ? 'opacity-20' : isStorm ? 'opacity-15' : 'opacity-10'}`} 
              style={{ 
                width: `${isMobile ? 300 + i * 100 : 400 + i * 150}px`, 
                height: `${isMobile ? 150 + i * 50 : 200 + i * 80}px`, 
                top: `${5 + Math.random() * 70}%`, 
                left: '-40%', 
                animationDuration: `${100 + i * 40}s`, 
                animationDelay: `${i * -25}s`,
                opacity: isDay ? undefined : 0.05
              }} 
            />
          ))}

          {/* Rain Particles */}
          {isRain && [...Array(rainCount)].map((_, i) => (
            <div key={`r-${i}`} className="absolute bg-white/20 w-[1px] h-24 rounded-full animate-rain"
              style={{ 
                left: `${Math.random() * 100}%`, 
                top: `-${Math.random() * 20}%`, 
                animationDuration: `${isStorm ? 0.4 : 0.7}s`, 
                animationDelay: `${Math.random() * -2}s`,
                transform: `rotate(${isStorm ? '15deg' : '5deg'})`
              }} 
            />
          ))}

          {/* Lightning */}
          {isStorm && (
            <div className="absolute inset-0 bg-white/10 animate-lightning opacity-0 z-10 pointer-events-none" />
          )}

          {/* Solar Flare (Clear Day) */}
          {condition === 'CLEAR' && isDay && (
            <div className="absolute top-[-10%] right-[-10%] w-[60%] aspect-square pointer-events-none">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.3, 0.2] 
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="w-full h-full bg-orange-400/20 rounded-full blur-[120px]"
                />
            </div>
          )}

          {/* Mist / Fog Layer */}
          {(isRain || condition === 'CLOUDY') && (
            <div className="absolute inset-0 bg-gradient-to-t from-white/5 via-transparent to-transparent opacity-40 mix-blend-overlay pointer-events-none" />
          )}

          {/* Snow Particles */}
          {isSnow && [...Array(snowCount)].map((_, i) => (
            <div key={`s-${i}`} className="absolute bg-white rounded-full animate-snow blur-[1.5px]"
              style={{ 
                width: `${3 + Math.random() * 4}px`, 
                height: `${3 + Math.random() * 4}px`, 
                left: `${Math.random() * 100}%`, 
                top: `-${Math.random() * 20}%`, 
                animationDuration: `${8 + Math.random() * 8}s`, 
                animationDelay: `${Math.random() * -10}s`, 
                opacity: 0.2 + Math.random() * 0.4 
              }} 
            />
          ))}

          {/* Wind Gusts */}
          {(isWindy || condition === 'CLEAR') && [...Array(isMobile ? 2 : 3)].map((_, i) => (
            <div key={`w-${i}`} className="absolute bg-white/5 w-[800px] h-[1px] blur-md animate-wind-gust"
              style={{ top: `${20 + i * 25}%`, left: '-50%', animationDuration: `${4 + i}s`, animationDelay: `${i * -2}s` }} 
            />
          ))}

          {/* Windy Particles (Leaves) */}
          {isWindy && [...Array(leafCount)].map((_, i) => (
            <div key={`l-${i}`} className="absolute bg-emerald-900/30 animate-leaf blur-[1px]"
              style={{ 
                width: `${12 + Math.random() * 15}px`,
                height: `${6 + Math.random() * 10}px`,
                left: `${Math.random() * 100}%`, 
                top: `${Math.random() * 100}%`, 
                animationDuration: `${3 + Math.random() * 3}s`, 
                animationDelay: `${Math.random() * -5}s`,
                opacity: 0.2 + Math.random() * 0.3,
                borderRadius: '2px 100% 2px 100%',
                transform: `rotate(${Math.random() * 360}deg)`
              }} 
            />
          ))}


        </motion.div>
      </AnimatePresence>

      {/* Global Grain/Noise */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
    </div>
  );
};

export default function WeatherTerminal() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<'SEARCH' | 'RESULT'>('SEARCH');
  const [input, setInput] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const CloseButton = () => (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => router.push('/')}
      className="fixed top-8 right-8 z-[100] h-12 w-12 rounded-full bg-white/5 hover:bg-white border border-white/10 text-white/40 hover:text-black transition-all flex items-center justify-center backdrop-blur-xl"
    >
      <X size={24} />
    </motion.button>
  );
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchingGeo, setIsSearchingGeo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<any | null>(null);
  const [homeLocation, setHomeLocation] = useState<any | null>(null);
  const [isSavingHome, setIsSavingHome] = useState(false);
  
  // Montage Logic
  const [montageIndex, setMontageIndex] = useState(0);
  const [isDayMontage, setIsDayMontage] = useState(true);
  const conditions = ['CLEAR', 'RAINING', 'WINDY', 'CLOUDY', 'SNOWING', 'STORMING'];

  useEffect(() => {
    const homeKey = user ? `zinc_weather_home_${user.id}` : 'zinc_weather_home_guest';
    const savedHome = localStorage.getItem(homeKey);
    if (savedHome) {
      try {
        const parsedHome = JSON.parse(savedHome);
        setHomeLocation(parsedHome);
        if (step === 'SEARCH') {
          executeFetch(parsedHome);
        }
      } catch (e) {}
    }
  }, [user]);

  const saveHomeLocation = (loc: any) => {
    setIsSavingHome(true);
    const homeKey = user ? `zinc_weather_home_${user.id}` : 'zinc_weather_home_guest';
    const dataToSave = {
      ...loc,
      name: loc.name || loc.location
    };
    localStorage.setItem(homeKey, JSON.stringify(dataToSave));
    setHomeLocation(dataToSave);
    setTimeout(() => setIsSavingHome(false), 1500);
  };

  useEffect(() => {
    if (step !== 'SEARCH') return;
    const interval = setInterval(() => {
      setMontageIndex((prev) => {
        const next = (prev + 1) % conditions.length;
        if (next === 0) setIsDayMontage(d => !d);
        return next;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [step]);

  const activeMontageCondition = conditions[montageIndex];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    if (val.length < 3) { setSuggestions([]); return; }
    
    setIsSearchingGeo(true);
    const debounce = setTimeout(async () => {
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(val)}&count=5&language=en&format=json`);
        const data = await res.json();
        setSuggestions(data.results || []);
      } catch (err) {} finally { setIsSearchingGeo(false); }
    }, 400);
    return () => clearTimeout(debounce);
  };

  const executeFetch = async (loc: any) => {
    setLoading(true);
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&hourly=uv_index&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset&timezone=auto&forecast_days=6`);
        const d = await res.json();
        
        const getCond = (c: number) => {
            if (c === 0) return 'CLEAR';
            if (c <= 3) return 'CLOUDY';
            if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(c)) return 'RAINING';
            if (c >= 95) return 'STORM';
            if ([71, 73, 75, 85, 86].includes(c)) return 'SNOW';
            return 'CLOUDY';
        };

        setWeather({
            temp: d.current.temperature_2m,
            feelsLike: d.current.apparent_temperature,
            minTemp: d.daily.temperature_2m_min[0],
            maxTemp: d.daily.temperature_2m_max[0],
            condition: getCond(d.current.weather_code),
            windSpeed: d.current.wind_speed_10m,
            humidity: d.current.relative_humidity_2m,
            uvIndex: d.hourly.uv_index[new Date().getHours()] || 0,
            location: loc.name,
            isDay: !!d.current.is_day,
            sunrise: d.daily.sunrise[0],
            sunset: d.daily.sunset[0],
            latitude: loc.latitude,
            longitude: loc.longitude,
            forecast: d.daily.time.map((t: any, i: number) => ({
                date: t,
                maxTemp: d.daily.temperature_2m_max[i],
                minTemp: d.daily.temperature_2m_min[i],
                condition: getCond(d.daily.weather_code[i])
            })).slice(1)
        });
        setStep('RESULT');
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const reset = () => {
    setStep('SEARCH');
    setWeather(null);
    setInput('');
  };

  function getIcon(cond: string, size = 24) {
      if (cond === 'RAINING') return <CloudRain size={size} strokeWidth={1} className="text-blue-300" />;
      if (cond === 'STORM') return <CloudLightning size={size} strokeWidth={1} className="text-purple-300" />;
      if (cond === 'SNOW') return <CloudSnow size={size} strokeWidth={1} className="text-white" />;
      if (cond === 'CLOUDY') return <CloudRain size={size} strokeWidth={1} className="text-zinc-400" opacity={0.5} />;
      return <Sun size={size} strokeWidth={1} className="text-orange-300" />;
  }

  return (
    <div className="w-full h-screen flex flex-col relative select-none overflow-y-auto bg-black text-white selection:bg-[#DFFF00] selection:text-black">
      <CloseButton />
      {/* Background System */}
      <AtmosphericBackground 
        condition={step === 'SEARCH' ? activeMontageCondition : weather.condition} 
        isDay={step === 'SEARCH' ? isDayMontage : weather.isDay} 
        isMobile={isMobile}
      />

      {/* Main Container */}
      <div className="relative z-10 w-full flex-1 flex flex-col">
          <AnimatePresence mode="wait">
              {step === 'SEARCH' ? (
                  <motion.div 
                    key="search-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }}
                    className="w-full min-h-screen flex flex-col items-center justify-start pt-[15vh] md:pt-[25vh] px-6 relative z-10"
                  >
                      {/* CYCLING HEADER */}
                      <div className="text-center mb-[12vh] md:mb-[18vh] w-full max-w-[90vw]">
                          <div className="flex flex-col items-center justify-center gap-8 md:gap-16">
                              <h1 className="text-3xl md:text-5xl font-medium tracking-tight opacity-40">
                                Check if it's going to
                              </h1>
                              <div className="relative h-[1.2em] flex items-center justify-center w-full">
                                  <AnimatePresence>
                                      <motion.span
                                        key={activeMontageCondition}
                                        initial={{ opacity: 0, filter: 'blur(40px)', scale: 0.9, y: 20 }}
                                        animate={{ opacity: 0.4, filter: 'blur(0px)', scale: 1, y: 0 }}
                                        exit={{ opacity: 0, filter: 'blur(40px)', scale: 1.1, y: -20, position: 'absolute' }}
                                        transition={{ 
                                          duration: 2.5, 
                                          ease: [0.4, 0, 0.2, 1]
                                        }}
                                        className="text-6xl md:text-[12rem] font-bold tracking-tight leading-none text-white block whitespace-nowrap drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)] mix-blend-screen"
                                      >
                                        {(() => {
                                            const c = activeMontageCondition;
                                            if (c === 'CLEAR') return 'be clear';
                                            if (c === 'RAINING') return 'rain';
                                            if (c === 'WINDY') return 'be windy';
                                            if (c === 'CLOUDY') return 'be cloudy';
                                            if (c === 'SNOWING') return 'snow';
                                            if (c === 'STORMING') return 'storm';
                                            return c.toLowerCase();
                                        })()}
                                      </motion.span>
                                  </AnimatePresence>
                              </div>
                          </div>
                      </div>

                      {/* SEARCH BAR */}
                      <div className="w-full max-w-2xl relative mt-[-2rem] flex flex-col items-center gap-8">
                                                        <div className="w-full bg-white/10 backdrop-blur-md md:backdrop-blur-3xl border border-white/10 rounded-full h-20 md:h-24 flex items-center px-4 md:px-6 shadow-2xl focus-within:border-white/30 transition-all">
                          
                              <div className="pl-4 md:pl-6 text-white/20 shrink-0">
                                {isSearchingGeo ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} />}
                              </div>
                              <input 
                                type="text"
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Search for a city..."
                                className="flex-1 bg-transparent border-none outline-none px-6 text-xl md:text-2xl font-medium text-white placeholder:text-white/30"
                              />
                              <button 
                                onClick={(e) => { 
                                  e.preventDefault();
                                  if(navigator.geolocation) navigator.geolocation.getCurrentPosition(pos => executeFetch({ name: 'current sector', latitude: pos.coords.latitude, longitude: pos.coords.longitude })) 
                                }}
                                className="h-14 w-14 md:h-16 md:w-16 bg-white/5 hover:bg-[#DFFF00] text-white/60 hover:text-black rounded-full transition-all flex items-center justify-center shrink-0 active:scale-90 border border-white/5 group/loc"
                              >
                                <Crosshair size={28} className="group-hover/loc:rotate-90 transition-transform duration-700" />
                              </button>
                          </div>

                          {homeLocation && (
                            <motion.button
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              onClick={() => executeFetch(homeLocation)}
                              className="px-8 py-3 bg-white/5 hover:bg-white border border-white/10 text-white/60 hover:text-black rounded-full transition-all backdrop-blur-md md:backdrop-blur-xl flex items-center gap-3 group"
                            >
                              <Home size={16} className="text-[#DFFF00] group-hover:text-black transition-colors" />
                              <span className="text-xs font-bold tracking-widest">Go to {(homeLocation.name || homeLocation.location || 'home')}</span>
                            </motion.button>
                          )}

                          {/* SUGGESTIONS */}
                          <AnimatePresence>
                            {input.length >= 3 && suggestions.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                    className="absolute top-full left-0 w-full mt-6 bg-white/10 backdrop-blur-md md:backdrop-blur-3xl border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] z-50 p-3"
                                >
                                    <div className="max-h-[400px] overflow-y-auto pr-1 scrollbar-hide">
                                        {suggestions.map((loc, i) => (
                                            <button
                                                key={i}
                                                onClick={() => executeFetch(loc)}
                                                className="w-full flex items-center justify-between p-6 hover:bg-white/10 rounded-[2.5rem] transition-all group text-left mb-1 last:mb-0"
                                            >
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xl font-bold text-white group-hover:pl-2 transition-all drop-shadow-md">{loc.name.toLowerCase()}</span>
                                                    <span className="text-sm font-medium text-white/50 lowercase bg-black/20 backdrop-blur-sm px-3 py-0.5 rounded-full w-fit">
                                                        {loc.country.toLowerCase()}
                                                    </span>
                                                </div>
                                                <div className="h-14 w-14 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#DFFF00] group-hover:text-black transition-all">
                                                    <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                          </AnimatePresence>
                      </div>
                  </motion.div>
              ) : (
                  <motion.div 
                    key="result-view"
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 w-full max-w-[1600px] mx-auto px-6 md:px-16 py-8 md:py-12 flex flex-col gap-8"
                  >
                      {/* STATUS BAR */}
                      <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="w-full bg-white/5 backdrop-blur-md md:backdrop-blur-3xl border border-white/10 rounded-full p-2 md:p-3 flex items-center justify-between px-4 md:px-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                      >
                          <div className="flex items-center gap-3 md:gap-6 flex-1">
                              <button onClick={reset} className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all shrink-0">
                                  <ChevronLeft size={20} />
                              </button>
                              
                              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 overflow-hidden">
                                  <span className="text-[10px] md:text-xs font-medium text-white/40 whitespace-nowrap">Location</span>
                                  <span className="text-sm md:text-base font-bold text-white truncate">
                                    {weather?.location || ''}
                                  </span>
                              </div>
                          </div>

                          <div className="flex items-center gap-3 md:gap-8">
                              <div className="hidden md:flex items-center gap-3 text-xs font-medium text-[#DFFF00]">
                                  <span className="animate-pulse text-[8px]">●</span>
                                  <span>It's {weather.condition.toLowerCase()} right now</span>
                              </div>

                              <div className="h-8 w-px bg-white/10 hidden md:block" />

                              <button 
                                onClick={() => saveHomeLocation(weather)}
                                disabled={isSavingHome}
                                className={`flex items-center gap-2 px-5 py-2 md:px-6 md:py-2.5 rounded-full border transition-all text-[10px] font-bold lowercase tracking-[0.1em] shrink-0
                                  ${isSavingHome ? 'bg-[#DFFF00] border-[#DFFF00] text-black' : 
                                    homeLocation?.name === (weather?.location || weather?.name) ? 'bg-white/10 border-white/20 text-[#DFFF00]' : 
                                    'bg-white/5 border-white/10 text-white/60 hover:bg-white hover:text-black'}
                                `}
                              >
                                {isSavingHome ? <Loader2 size={12} className="animate-spin" /> : <Home size={12} />}
                                <span className="capitalize">
                                  {isSavingHome ? 'Saving...' : 
                                   homeLocation?.name === (weather?.location || weather?.name) ? 'Current home' : 
                                   'Set as home'}
                                </span>
                              </button>
                          </div>
                      </motion.div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 flex-1">
                          
                          {/* HERO MODULE */}
                          <div className="lg:col-span-8 flex flex-col gap-6 md:gap-8">
                              <motion.div 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex-1 bg-white/[0.03] backdrop-blur-md md:backdrop-blur-3xl border border-white/5 rounded-[3rem] md:rounded-[4rem] p-8 md:p-20 relative overflow-hidden group min-h-[400px] md:min-h-0"
                              >
                                  {/* LIVE HERO BACKGROUND EFFECTS */}
                                  <div className="absolute inset-0 pointer-events-none opacity-30">
                                      {weather.condition === 'RAINING' && [...Array(20)].map((_, i) => (
                                          <motion.div 
                                            key={i}
                                            initial={{ y: -100, x: `${Math.random() * 100}%` }}
                                            animate={{ y: 600 }}
                                            transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, ease: "linear", delay: Math.random() * 2 }}
                                            className="absolute w-[1px] h-20 bg-white/20"
                                          />
                                      ))}
                                      {weather.condition === 'SNOW' && [...Array(30)].map((_, i) => (
                                          <motion.div 
                                            key={i}
                                            initial={{ y: -20, x: `${Math.random() * 100}%` }}
                                            animate={{ y: 600, x: `${Math.random() * 100 + 20}%` }}
                                            transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
                                            className="absolute w-2 h-2 rounded-full bg-white/40 blur-[1px]"
                                          />
                                      ))}
                                      {weather.condition === 'CLEAR' && (
                                          <motion.div 
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-orange-400/20 rounded-full blur-[100px]"
                                          />
                                      )}
                                      {(weather.condition === 'CLOUDY' || weather.condition === 'WINDY') && [...Array(4)].map((_, i) => (
                                          <motion.div 
                                            key={i}
                                            animate={{ x: ['-100%', '200%'] }}
                                            transition={{ duration: 30 + i * 10, repeat: Infinity, ease: "linear", delay: i * -10 }}
                                            className="absolute bg-white/10 w-96 h-48 rounded-full blur-[80px]"
                                            style={{ top: `${20 + i * 20}%` }}
                                          />
                                      ))}
                                  </div>
                                  
                                  <div className="relative z-10 flex flex-col h-full justify-between">
                                      <div>
                                          <span className="text-xs md:text-sm font-medium text-white/20 mb-2 md:mb-4 block">Temperature</span>
                                          <h1 className="text-[10rem] md:text-[22rem] font-bold leading-none tracking-tighter text-white drop-shadow-[0_20px_100px_rgba(0,0,0,0.8)] [text-shadow:_0_10px_50px_rgb(0_0_0_/_50%)]">
                                              {Math.round(weather.temp)}<span className="text-[4rem] md:text-[6rem] text-white/10 align-top mt-6 md:mt-12 inline-block">°</span>
                                          </h1>
                                      </div>
                                      
                                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-0">
                                          <div className="flex flex-col gap-2">
                                              <span className="text-xs md:text-sm font-medium text-white/20">Conditions</span>
                                              <div className="flex items-center gap-4">
                                                  <div className="text-white/80">
                                                      {getIcon(weather.condition, 28)}
                                                  </div>
                                                  <span className="text-4xl md:text-5xl font-bold tracking-tight drop-shadow-md">{weather.condition.charAt(0) + weather.condition.slice(1).toLowerCase()}</span>
                                              </div>
                                          </div>
                                          <div className="flex flex-col md:items-end text-left md:text-right">
                                              <span className="text-xs md:text-sm font-medium text-white/20">Thermal index</span>
                                              <span className="text-2xl md:text-4xl font-bold text-white/40 tracking-tight">Feels like {Math.round(weather.feelsLike)}°</span>
                                          </div>
                                      </div>
                                  </div>
                              </motion.div>

                              {/* QUICK STATS */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                  {[
                                      { label: 'Wind speed', value: Math.round(weather.windSpeed), unit: 'km/h', icon: <Wind size={18} /> },
                                      { label: 'Humidity', value: weather.humidity, unit: '%', icon: <Droplets size={18} /> },
                                      { label: 'UV index', value: weather.uvIndex.toFixed(1), unit: 'Level', icon: <Gauge size={18} /> },
                                      { label: 'Visibility', value: '10.0', unit: 'km', icon: <Navigation size={18} /> }
                                  ].map((stat, i) => (
                                      <motion.div 
                                        key={i} 
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 + (i * 0.1) }}
                                        className="bg-white/5 backdrop-blur-md md:backdrop-blur-2xl border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col justify-between hover:bg-white/10 transition-all cursor-default"
                                      >
                                          <div className="flex items-center gap-3 text-white/20 mb-4">
                                              {stat.icon}
                                              <span className="text-[10px] md:text-xs font-medium">{stat.label}</span>
                                          </div>
                                          <div>
                                              <div className="text-3xl md:text-4xl font-bold tracking-tight mb-1">{stat.value}</div>
                                              <div className="text-[10px] font-medium text-white/20">{stat.unit}</div>
                                          </div>
                                      </motion.div>
                                  ))}
                              </div>
                          </div>

                          {/* FORECAST COLUMN */}
                          <motion.div 
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="lg:col-span-4 bg-white/5 backdrop-blur-md md:backdrop-blur-3xl border border-white/10 rounded-[3rem] md:rounded-[4rem] p-8 md:p-10 flex flex-col"
                          >
                              <div className="flex items-center justify-between mb-8 md:mb-12">
                                  <span className="text-xs md:text-sm font-medium text-white/20">5-Day forecast</span>
                                  <div className="h-px flex-1 mx-4 md:mx-6 bg-white/5" />
                                  <Calendar size={16} className="text-white/20" />
                              </div>

                              <div className="flex-1 flex flex-col gap-3 md:gap-4">
                                  {weather.forecast.map((day: any, i: number) => {
                                      const allTemps = weather.forecast.map((d: any) => d.maxTemp);
                                      const avgTemp = allTemps.reduce((a: number, b: number) => a + b, 0) / allTemps.length;
                                      const isHottest = day.maxTemp === Math.max(...allTemps) && day.maxTemp > avgTemp + 3;
                                      const isColdest = day.maxTemp === Math.min(...allTemps) && day.maxTemp < avgTemp - 3;
                                      const isStormy = day.condition === 'STORM';
                                      const isOutlier = isHottest || isColdest || isStormy;

                                      return (
                                          <motion.div 
                                            key={i}
                                            whileHover={{ x: 10 }}
                                            className={`flex items-center justify-between p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] transition-all group relative
                                              ${isOutlier ? 'bg-white/10 border border-[#DFFF00]/30 shadow-[0_0_30px_rgba(223,255,0,0.1)]' : 'bg-white/5 border border-transparent hover:bg-white/10'}
                                            `}
                                          >
                                              {isOutlier && (
                                                  <div className="absolute -top-2 -right-2 px-3 py-1 bg-[#DFFF00] text-black text-[8px] font-bold rounded-full uppercase tracking-widest shadow-lg">
                                                      {isStormy ? 'Alert' : isHottest ? 'Warmest' : 'Coldest'}
                                                  </div>
                                              )}
                                              <div className="flex flex-col">
                                                  <span className="text-xs md:text-sm font-bold text-white capitalize">
                                                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                                  </span>
                                                  <span className="text-[10px] md:text-xs font-medium text-white/20 capitalize">{day.condition.toLowerCase()}</span>
                                              </div>
                                              <div className="flex items-center gap-4 md:gap-8">
                                                  {getIcon(day.condition, 20)}
                                                  <div className="flex flex-col items-end min-w-[50px] md:min-w-[60px]">
                                                      <span className={`text-lg md:text-xl font-bold ${isHottest ? 'text-orange-400' : isColdest ? 'text-blue-400' : 'text-white'}`}>
                                                          {Math.round(day.maxTemp)}°
                                                      </span>
                                                      <span className="text-[10px] md:text-xs font-medium text-white/20">{Math.round(day.minTemp)}°</span>
                                                  </div>
                                              </div>
                                          </motion.div>
                                      );
                                  })}
                              </div>

                              <div className="mt-8 md:mt-12 pt-10 border-t border-white/5 flex flex-col gap-10">
                                  {/* INTEGRATED SOLAR ORBIT TRACKER */}
                                  <div className="w-full px-2">
                                      <div className="flex items-center justify-between mb-6 opacity-40">
                                          <span className="text-[10px] font-bold tracking-widest">Celestial position</span>
                                          <span className="text-[10px] font-bold tracking-widest">
                                              {weather.isDay ? 'Daylight cycle' : 'Lunar cycle'}
                                          </span>
                                      </div>

                                      <div className="relative h-20 w-full flex items-center justify-between px-2 mb-8">
                                          {/* THE ORBIT PATH */}
                                          <div className="absolute inset-0 overflow-hidden">
                                              <svg className="w-full h-full opacity-10" preserveAspectRatio="none">
                                                  <path d="M 0 80 Q 50% -20 100% 80" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="6 6" />
                                              </svg>
                                          </div>
                                          
                                          {/* THE SUN/MOON INDICATOR */}
                                          <motion.div 
                                            className="absolute bottom-0 z-10"
                                            style={{
                                                left: `${(() => {
                                                    const now = new Date().getTime();
                                                    const start = new Date(weather.sunrise).getTime();
                                                    const end = new Date(weather.sunset).getTime();
                                                    const progress = Math.max(0, Math.min(1, (now - start) / (end - start)));
                                                    return progress * 100;
                                                })()}%`,
                                                transform: 'translate(-50%, 50%)'
                                            }}
                                          >
                                              <div className="relative">
                                                  <div className={`h-4 w-4 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)] ${weather.isDay ? 'bg-orange-400' : 'bg-blue-200'}`} />
                                                  <div className={`absolute inset-[-8px] h-10 w-10 rounded-full border border-white/10 animate-spin-slow`} />
                                                  <div className={`absolute inset-0 h-4 w-4 rounded-full animate-ping opacity-20 ${weather.isDay ? 'bg-orange-400' : 'bg-blue-200'}`} />
                                              </div>
                                          </motion.div>

                                          <div className="flex flex-col items-start gap-1 relative z-20">
                                              <span className="text-[8px] font-black text-white/20 uppercase">Sunrise</span>
                                              <div className="flex items-center gap-2">
                                                  <Sunrise size={14} className="text-orange-400/60" />
                                                  <span className="text-[10px] font-bold">{new Date(weather.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()}</span>
                                              </div>
                                          </div>

                                          <div className="flex flex-col items-center gap-1 relative z-20 mt-12">
                                              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Zenith</span>
                                              <div className="h-4 w-px bg-white/10" />
                                          </div>

                                          <div className="flex flex-col items-end gap-1 relative z-20">
                                              <span className="text-[8px] font-black text-white/20 uppercase">Sunset</span>
                                              <div className="flex items-center gap-2">
                                                  <span className="text-[10px] font-bold">{new Date(weather.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()}</span>
                                                  <Sunset size={14} className="text-blue-400/60" />
                                              </div>
                                          </div>
                                      </div>

                                      {/* PROGRESS BAR */}
                                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                                          <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ 
                                                width: `${(() => {
                                                    const now = new Date().getTime();
                                                    const start = new Date(weather.sunrise).getTime();
                                                    const end = new Date(weather.sunset).getTime();
                                                    return Math.max(0, Math.min(1, (now - start) / (end - start))) * 100;
                                                })()}%` 
                                            }}
                                            transition={{ duration: 2, ease: "easeOut" }}
                                            className={`h-full ${weather.isDay ? 'bg-gradient-to-r from-orange-500/40 to-orange-400' : 'bg-gradient-to-r from-blue-500/40 to-blue-200'}`}
                                          />
                                      </div>
                                      <div className="flex justify-between mt-2 px-1">
                                          <span className="text-[8px] font-bold text-white/20 uppercase">Cycle start</span>
                                          <span className="text-[8px] font-bold text-[#DFFF00] uppercase animate-pulse">
                                              {weather.isDay ? 'Solar active' : 'Lunar active'}
                                          </span>
                                          <span className="text-[8px] font-bold text-white/20 uppercase">Cycle end</span>
                                      </div>
                                  </div>

                                  <div className="text-[8px] md:text-[10px] font-mono text-white/10 text-center uppercase tracking-widest pb-2">
                                      Sync status: nominal // {weather.latitude.toFixed(2)}n {weather.longitude.toFixed(2)}e
                                  </div>
                              </div>
                          </motion.div>
                      </div>

                      {/* DATA FOOTER - SIMPLIFIED */}
                      <footer className="mt-12 md:mt-16 flex justify-center opacity-20 hover:opacity-40 transition-opacity duration-500">
                          <div className="text-xs font-medium lowercase tracking-tight text-center">
                              updated just now // high confidence // data source: open-meteo
                          </div>
                      </footer>
                  </motion.div>
              )}
          </AnimatePresence>
      </div>

      <style jsx global>{`
        @keyframes rain { 
          0% { transform: translateY(-100%) translateZ(0); } 
          100% { transform: translateY(120vh) translateZ(0); } 
        }
        @keyframes snow { 
          0% { transform: translateY(-10vh) translateX(0) translateZ(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(110vh) translateX(20px) translateZ(0); opacity: 0; }
        }
        @keyframes cloud { 
          0% { transform: translateX(-100%) scale(0.8) translateZ(0); }
          100% { transform: translateX(200vw) scale(1.2) translateZ(0); }
        }
        @keyframes leaf {
          0% { transform: translate3d(-10vw, -10vh, 0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate3d(110vw, 110vh, 0) rotate(1080deg); opacity: 0; }
        }
        @keyframes lightning {
          0%, 90%, 100% { opacity: 0; }
          92% { opacity: 1; }
          94% { opacity: 0; }
          96% { opacity: 0.5; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes wind-gust {
          0% { transform: translateX(-100%) scaleX(0.5); opacity: 0; }
          50% { opacity: 0.2; }
          100% { transform: translateX(200vw) scaleX(2); opacity: 0; }
        }
        .animate-rain { animation: rain linear infinite; will-change: transform; }
        .animate-snow { animation: snow linear infinite; will-change: transform; }
        .animate-leaf { animation: leaf linear infinite; will-change: transform; }
        .animate-cloud { animation: cloud linear infinite; will-change: transform; }
        .animate-lightning { animation: lightning 8s linear infinite; }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
        .animate-wind-gust { animation: wind-gust 5s linear infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}