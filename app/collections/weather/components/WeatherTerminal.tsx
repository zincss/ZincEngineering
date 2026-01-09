'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudRain, Wind, Search, Globe, MapPin, Loader2, 
  Droplets, Gauge, Navigation, Calendar, CloudSnow, 
  CloudLightning, Sun, Crosshair, ArrowRight, ChevronLeft,
  Info, Sunrise, Sunset, Home, X, Shield
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });

// --- RADAR COMPONENT ---
const RadarDisplay = ({ lat, lon, color }: { lat: number, lon: number, color: string }) => {
  const [frames, setFrames] = useState<{ path: string, time: number }[]>([]);
  const [currentIndex, setCurrentFrameIndex] = useState(0);
  const [host, setHost] = useState('');

  useEffect(() => {
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(res => res.json())
      .then(data => {
        const allFrames = [
          ...(data.radar?.past || []),
          ...(data.radar?.nowcast || [])
        ];
        setFrames(allFrames);
        setHost(data.host);
      });
  }, []);

  useEffect(() => {
    if (frames.length === 0) return;
    const interval = setInterval(() => {
      setCurrentFrameIndex(prev => (prev + 1) % frames.length);
    }, 800);
    return () => clearInterval(interval);
  }, [frames]);

  const currentFrame = frames[currentIndex];

  return (
    <div className="w-full h-full relative group">
      <div className="absolute inset-0 z-10 pointer-events-none border border-white/10 rounded-[2rem] overflow-hidden">
          <div className="absolute top-4 right-4 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-30">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">
                {currentFrame ? new Date(currentFrame.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Loading Map...'}
              </span>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/5 z-30">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">Rain Radar Loop</span>
          </div>
      </div>

      <MapContainer 
        center={[lat, lon]} 
        zoom={9} 
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
        style={{ height: '100%', width: '100%', background: '#000', borderRadius: '2rem' }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        {currentFrame && host && (
          <TileLayer 
            key={currentFrame.time}
            url={`${host}${currentFrame.path}/256/{z}/{x}/{y}/2/1_1.png`}
            opacity={0.6}
          />
        )}
      </MapContainer>
    </div>
  );
};

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
  const isFoggy = condition === 'FOGGY';
  const isHazy = condition === 'HAZY';

  const starCount = isMobile ? 8 : 30;
  const cloudCount = isMobile ? (isCloudy || isStorm || !isDay ? 3 : 1) : (isCloudy || isStorm || !isDay ? 8 : 4);
  const rainCount = isMobile ? (isStorm ? 15 : 8) : (isStorm ? 60 : 30);
  const snowCount = isMobile ? 10 : 40;
  const leafCount = isMobile ? 5 : 20;

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
              isFoggy ? 'bg-gradient-to-b from-slate-500 via-zinc-600 to-zinc-900' :
              isHazy ? 'bg-gradient-to-b from-orange-200 via-amber-100 to-slate-300' :
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

          {/* Fog / Deep Mist Layer */}
          {(isFoggy || isStorm) && (
            <motion.div 
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.05, 1] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-white/10 blur-[120px] mix-blend-overlay"
            />
          )}

          {/* Hazy Shimmer & Dust (Clear Day or Hazy) */}
          {(isHazy || (condition === 'CLEAR' && isDay)) && (
            <div className="absolute inset-0 pointer-events-none">
                <motion.div 
                    animate={{ opacity: [0.05, 0.1, 0.05] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute inset-0 bg-orange-500/5 mix-blend-color-burn"
                />
                {isHazy && [...Array(isMobile ? 10 : 20)].map((_, i) => (
                    <div key={`d-${i}`} className="absolute bg-orange-900/20 animate-leaf blur-[2px]"
                        style={{ 
                            width: '2px', height: '2px',
                            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                            animationDuration: `${2 + Math.random() * 2}s`,
                            animationDelay: `${Math.random() * -5}s`,
                            borderRadius: '50%'
                        }} 
                    />
                ))}
            </div>
          )}

          {/* Birds (Clear Day or Hazy) - Flocks of 3 */}
          {(condition === 'CLEAR' || condition === 'HAZY') && isDay && [...Array(isMobile ? 1 : 2)].map((_, flockIndex) => (
            <div key={`flock-${flockIndex}`} className="absolute animate-bird-fly pointer-events-none blur-[1.5px] opacity-0"
              style={{ 
                top: `${10 + Math.random() * 40}%`, 
                animationDuration: `${40 + Math.random() * 20}s`, 
                animationDelay: `${flockIndex * 15 + Math.random() * 10}s` 
              }} 
            >
              {[...Array(3)].map((__, birdIndex) => (
                <div 
                  key={`bird-${birdIndex}`}
                  className="absolute"
                  style={{
                    left: `${birdIndex * -35}px`,
                    top: `${birdIndex === 1 ? -20 : birdIndex === 2 ? 20 : 0}px`,
                    animationDelay: `${birdIndex * 0.5}s`
                  }}
                >
                  <div className="animate-bird-soar" style={{ animationDuration: `${4 + Math.random() * 2}s` }}>
                    <svg width="16" height="6" viewBox="0 0 20 10" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-black/20">
                      <path d="M0 5 C 4 2, 6 2, 10 5 C 14 2, 16 2, 20 5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
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
  const [unit, setUnit] = useState<'C' | 'F'>('C');

  useEffect(() => {
    const savedUnit = localStorage.getItem('zinc_weather_unit');
    if (savedUnit === 'C' || savedUnit === 'F') setUnit(savedUnit);
    
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleUnit = () => {
    const newUnit = unit === 'C' ? 'F' : 'C';
    setUnit(newUnit);
    localStorage.setItem('zinc_weather_unit', newUnit);
  };

  const convertTemp = (temp: number) => {
    if (unit === 'C') return Math.round(temp);
    return Math.round((temp * 9/5) + 32);
  };
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchingGeo, setIsSearchingGeo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<any | null>(null);
  const [selectedHour, setSelectedHour] = useState<number>(new Date().getHours());
  const [scrubberView, setScrubberView] = useState<'FORECAST' | 'RADAR'>('FORECAST');
  const [homeLocation, setHomeLocation] = useState<any | null>(null);
  const [isSavingHome, setIsSavingHome] = useState(false);
  
  // Montage Logic
  const [montageIndex, setMontageIndex] = useState(0);
  const [isDayMontage, setIsDayMontage] = useState(true);
  const conditions = ['CLEAR', 'RAINING', 'WINDY', 'CLOUDY', 'SNOWING', 'STORMING', 'FOGGY', 'HAZY'];

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

  const currentCondition = step === 'SEARCH' ? activeMontageCondition : weather?.condition;
  const currentIsDay = step === 'SEARCH' ? isDayMontage : weather?.isDay;

  const accentColor = (() => {
    if (!currentCondition) return '#DFFF00';
    const c = currentCondition;
    if (c === 'RAINING') return '#60A5FA'; // Blue
    if (c === 'STORM' || c === 'STORMING' || c === 'STORMING') return '#A855F7'; // Purple
    if (c === 'SNOW' || c === 'SNOWING') return '#BAE6FD'; // Light Blue
    if (c === 'WINDY') return '#2DD4BF'; // Cyan
    if (c === 'CLOUDY') return '#94A3B8'; // Slate
    return currentIsDay ? '#FDE047' : '#94A3B8'; // Yellow for Day, Slate for Night
  })();

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
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&hourly=temperature_2m,precipitation_probability,uv_index&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset&timezone=auto&forecast_days=6`);
        const d = await res.json();
        
        const getCond = (c: number) => {
            if (c === 0) return 'CLEAR';
            if (c <= 3) return 'CLOUDY';
            if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(c)) return 'RAINING';
            if (c >= 95) return 'STORM';
            if ([71, 73, 75, 85, 86].includes(c)) return 'SNOW';
            return 'CLOUDY';
        };

        const currentHour = new Date().getHours();
        const hourlyData = d.hourly.time.slice(currentHour, currentHour + 24).map((t: string, i: number) => ({
            time: t,
            temp: d.hourly.temperature_2m[currentHour + i],
            precip: d.hourly.precipitation_probability[currentHour + i],
            uv: d.hourly.uv_index[currentHour + i]
        }));

        // Fetch Marine Data (Surf/Beach)
        let marineData = null;
        try {
          const marineRes = await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${loc.latitude}&longitude=${loc.longitude}&current=wave_height,wave_period,wave_direction&timezone=auto`);
          const md = await marineRes.json();
          if (md.current) {
            marineData = {
              waveHeight: md.current.wave_height,
              wavePeriod: md.current.wave_period,
              waveDirection: md.current.wave_direction
            };
          }
        } catch (me) {
          console.log("Marine data unavailable for this location");
        }

        setWeather({
            temp: d.current.temperature_2m,
            feelsLike: d.current.apparent_temperature,
            minTemp: d.daily.temperature_2m_min[0],
            maxTemp: d.daily.temperature_2m_max[0],
            condition: getCond(d.current.weather_code),
            windSpeed: d.current.wind_speed_10m,
            humidity: d.current.relative_humidity_2m,
            uvIndex: d.hourly.uv_index[currentHour] || 0,
            location: loc.name,
            isDay: !!d.current.is_day,
            sunrise: d.daily.sunrise[0],
            sunset: d.daily.sunset[0],
            latitude: loc.latitude,
            longitude: loc.longitude,
            hourly: hourlyData,
            marine: marineData,
            forecast: d.daily.time.map((t: any, i: number) => ({
                date: t,
                maxTemp: d.daily.temperature_2m_max[i],
                minTemp: d.daily.temperature_2m_min[i],
                condition: getCond(d.daily.weather_code[i])
            })).slice(1)
        });
        setSelectedHour(0);
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

  function getAdvice(w: any) {
    const temp = w.temp;
    const precip = Math.max(...w.hourly.map((h: any) => h.precip));
    const uv = w.uvIndex;
    
    let items = [];
    let activity = "";

    if (precip > 30) items.push({ label: "Umbrella", icon: "☂️", desc: `${precip}% chance of rain` });
    if (temp < 10) items.push({ label: "Heavy Coat", icon: "🧥", desc: "Temperatures near freezing" });
    else if (temp < 18) items.push({ label: "Light Jacket", icon: "🧥", desc: "Cool breeze expected" });
    else if (temp > 28) items.push({ label: "Light Clothing", icon: "👕", desc: "High heat warning" });
    
    if (uv > 6) items.push({ label: "Sunscreen", icon: "🧴", desc: "High UV radiation" });

    if (precip > 50) activity = "Looks like a good day to stay inside and stay dry.";
    else if (temp > 15 && temp < 25) activity = "The weather is perfect for a walk or some outdoor time.";
    else if (temp >= 25) activity = "It's quite warm out, make sure to drink plenty of water.";
    else activity = "It's pretty cold out there—make sure to wrap up warm.";

    return { items, activity };
  }

  const advice = weather ? getAdvice(weather) : null;

  // --- MATERIAL EFFECTS ENGINE ---
  const getGlassStyles = (condition: string) => {
    let styles = {};
    let overlay = null;

    if (condition === 'RAINING' || condition === 'STORM') {
      overlay = (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
          <div className="absolute inset-0 bg-white/5 animate-glass-rain w-[200%] h-[200%]" 
               style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
        </div>
      );
    } else if (condition === 'SNOW') {
      styles = { boxShadow: 'inset 0 0 20px rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)' };
    } else if (condition === 'CLEAR' && weather?.isDay) {
      styles = { boxShadow: '0 -15px 40px rgba(253,224,71,0.05)' };
    }

    return { styles, overlay };
  };

  return (
    <div 
      className="w-full h-screen flex flex-col relative select-none overflow-y-auto bg-black text-white"
      style={{ '--accent': accentColor } as React.CSSProperties}
    >
      {/* Background System */}
      <AtmosphericBackground 
        condition={step === 'SEARCH' ? activeMontageCondition : weather.condition} 
        isDay={step === 'SEARCH' ? isDayMontage : weather.isDay} 
        isMobile={isMobile}
      />

      {/* Main Container */}
      <div className="relative z-10 w-full flex-1 flex flex-col selection-accent">
          <AnimatePresence mode="wait">
              {step === 'SEARCH' ? (
                  <motion.div 
                    key="search-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }}
                    className="w-full min-h-screen flex flex-col items-center justify-start pt-[15vh] md:pt-[25vh] px-6 relative z-10"
                  >
                      {/* Top Action Bar for Search View */}
                      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-50">
                          <button 
                            onClick={() => router.push('/')} 
                            className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/40 hover:bg-white border border-white/20 text-white hover:text-black transition-all flex items-center justify-center backdrop-blur-md shadow-lg group"
                            title="Exit Weather"
                          >
                              <X size={20} className="group-hover:rotate-90 transition-transform" />
                          </button>
                      </div>

                      {/* CYCLING HEADER */}
                      <div className="text-center mb-[12vh] md:mb-[18vh] w-full max-w-[90vw]">
                          <div className="flex flex-col items-center justify-center gap-8 md:gap-16">
                              <h1 className="text-3xl md:text-5xl font-medium tracking-tight opacity-60 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                                Check if it's going to
                              </h1>
                              <div className="relative h-[1.2em] flex items-center justify-center w-full">
                                  <AnimatePresence>
                                      <motion.span
                                        key={activeMontageCondition}
                                        initial={{ opacity: 0, filter: 'blur(40px)', scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, filter: 'blur(0px)', scale: 1, y: 0 }}
                                        exit={{ opacity: 0, filter: 'blur(40px)', scale: 1.1, y: -20, position: 'absolute' }}
                                        transition={{ 
                                          duration: 2.5, 
                                          ease: [0.4, 0, 0.2, 1]
                                        }}
                                        className="text-6xl md:text-[12rem] font-bold tracking-tight leading-none text-white block whitespace-nowrap drop-shadow-[0_10px_50px_rgba(0,0,0,0.8)] mix-blend-screen"
                                        style={{ color: accentColor }}
                                      >
                                        {(() => {
                                            const c = activeMontageCondition;
                                            if (c === 'CLEAR') return 'be clear';
                                            if (c === 'RAINING') return 'rain';
                                            if (c === 'WINDY') return 'be windy';
                                            if (c === 'CLOUDY') return 'be cloudy';
                                            if (c === 'SNOWING') return 'snow';
                                            if (c === 'STORMING') return 'storm';
                                            if (c === 'FOGGY') return 'be foggy';
                                            if (c === 'HAZY') return 'be hazy';
                                            return c.toLowerCase();
                                        })()}
                                      </motion.span>
                                  </AnimatePresence>
                              </div>
                          </div>
                      </div>

                      {/* SEARCH BAR */}
                      <div className="w-full max-w-2xl relative mt-[-2rem] flex flex-col items-center gap-8">
                          <div className="w-full bg-black/40 md:bg-white/10 backdrop-blur-md md:backdrop-blur-3xl border border-white/20 rounded-full h-14 md:h-24 flex items-center px-3 md:px-6 shadow-2xl focus-within:border-[var(--accent)] transition-all" style={{ borderColor: `${accentColor}33` }}>
                              <div className="pl-2 md:pl-6 text-white/40 shrink-0">
                                {isSearchingGeo ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} className="md:w-6 md:h-6" />}
                              </div>
                              <input 
                                type="text"
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Search for a city..."
                                className="flex-1 bg-transparent border-none outline-none px-4 md:px-6 text-base md:text-2xl font-medium text-white placeholder:text-white/40"
                              />
                              <button 
                                onClick={(e) => { 
                                  e.preventDefault();
                                  if(navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition(
                                      pos => executeFetch({ name: 'current sector', latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                                      err => alert("Location access denied. Please enable GPS.")
                                    );
                                  } 
                                }}
                                title="Use Current Location"
                                className="h-10 w-10 md:h-16 md:w-16 rounded-full transition-all flex items-center justify-center shrink-0 active:scale-90 border group/loc"
                                style={{ 
                                  backgroundColor: `${accentColor}1A`, 
                                  color: accentColor,
                                  borderColor: `${accentColor}33`
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = accentColor; e.currentTarget.style.color = 'black'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${accentColor}1A`; e.currentTarget.style.color = accentColor; }}
                              >
                                <Crosshair size={20} className="md:w-7 md:h-7 group-hover/loc:rotate-90 transition-transform duration-700" />
                              </button>
                          </div>

                          {homeLocation && (
                            <motion.button
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              onClick={() => executeFetch(homeLocation)}
                              className="px-8 py-3 bg-white/5 hover:bg-white border border-white/10 text-white/60 hover:text-black rounded-full transition-all backdrop-blur-md md:backdrop-blur-xl flex items-center gap-3 group"
                            >
                              <Home size={16} style={{ color: accentColor }} className="group-hover:text-black transition-colors" />
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
                                    className="absolute top-full left-0 w-full mt-4 bg-black/80 md:bg-white/10 backdrop-blur-xl md:backdrop-blur-3xl border border-white/20 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] z-50 p-2 md:p-3"
                                >
                                    <div className="max-h-[300px] md:max-h-[400px] overflow-y-auto pr-1 scrollbar-hide">
                                        {suggestions.map((loc, i) => (
                                            <button
                                                key={i}
                                                onClick={() => executeFetch(loc)}
                                                className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-white/10 active:bg-white/20 rounded-[1.5rem] md:rounded-[2.5rem] transition-all group text-left mb-1 last:mb-0"
                                            >
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-lg md:text-xl font-bold text-white group-hover:pl-2 transition-all drop-shadow-md">{loc.name.toLowerCase()}</span>
                                                    <span className="text-[10px] md:text-sm font-medium text-white/50 lowercase bg-white/5 px-3 py-0.5 rounded-full w-fit">
                                                        {loc.country.toLowerCase()}
                                                    </span>
                                                </div>
                                                <div className="h-10 w-10 md:h-14 md:w-14 rounded-full bg-white/5 flex items-center justify-center group-hover:text-black transition-all" style={{ backgroundColor: `${accentColor}1A` }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accentColor} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${accentColor}1A`}>
                                                    <ArrowRight size={18} className="md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
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
                        className="w-full bg-white/5 backdrop-blur-md md:backdrop-blur-3xl border border-white/10 rounded-2xl md:rounded-full p-2 md:p-3 flex flex-col md:flex-row items-center justify-between gap-3 md:px-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                      >
                          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
                              <button 
                                onClick={reset} 
                                title="Back to Search"
                                className="h-9 w-9 md:h-12 md:w-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all shrink-0 border border-white/10"
                              >
                                  <ChevronLeft size={18} />
                              </button>
                              
                              <button 
                                onClick={() => router.push('/')} 
                                title="Exit Weather"
                                className="h-9 w-9 md:h-12 md:w-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all shrink-0 border border-white/10 group"
                              >
                                  <X size={16} className="group-hover:rotate-90 transition-transform" />
                              </button>

                              <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-4 overflow-hidden ml-1">
                                  <span className="text-[8px] md:text-xs font-black text-white/40 uppercase tracking-widest whitespace-nowrap drop-shadow-sm">Location</span>
                                  <span className="text-xs md:text-base font-bold text-white truncate drop-shadow-md">
                                    {weather?.location || ''}
                                  </span>
                              </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-2 md:gap-8 w-full md:w-auto border-t border-white/5 md:border-none pt-2 md:pt-0">
                              <button 
                                onClick={toggleUnit}
                                className="h-9 px-3 md:h-12 md:px-6 rounded-full bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-all flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest"
                              >
                                <span style={{ color: unit === 'C' ? accentColor : undefined }} className={unit !== 'C' ? 'text-white/40' : ''}>°C</span>
                                <div className="w-px h-3 bg-white/10" />
                                <span style={{ color: unit === 'F' ? accentColor : undefined }} className={unit !== 'F' ? 'text-white/40' : ''}>°F</span>
                              </button>

                              <div className="hidden md:flex items-center gap-3 text-xs font-medium" style={{ color: accentColor }}>
                                  <span className="animate-pulse text-[8px]">●</span>
                                  <span>It's {weather.condition.toLowerCase()} right now</span>
                              </div>

                              <button 
                                onClick={() => saveHomeLocation(weather)}
                                disabled={isSavingHome}
                                className={`flex items-center justify-center md:justify-start gap-2 h-9 px-4 md:h-12 md:px-6 rounded-full border transition-all text-[9px] md:text-[10px] font-bold lowercase tracking-[0.1em] shrink-0
                                  ${isSavingHome ? 'bg-[var(--accent)] border-[var(--accent)] text-black' : 
                                    homeLocation?.name === (weather?.location || weather?.name) ? 'bg-white/10 border-white/20' : 
                                    'bg-white/5 border-white/10 text-white/60 hover:bg-white hover:text-black'}
                                `}
                                style={{ 
                                  backgroundColor: isSavingHome ? accentColor : (homeLocation?.name === (weather?.location || weather?.name) ? `${accentColor}1A` : undefined),
                                  borderColor: isSavingHome ? accentColor : (homeLocation?.name === (weather?.location || weather?.name) ? `${accentColor}33` : undefined),
                                  color: isSavingHome ? 'black' : (homeLocation?.name === (weather?.location || weather?.name) ? accentColor : undefined)
                                }}
                              >
                                {isSavingHome ? <Loader2 size={12} className="animate-spin" /> : <Home size={12} />}
                                <span className="capitalize">
                                  {isSavingHome ? 'Saving' : 
                                   homeLocation?.name === (weather?.location || weather?.name) ? (isMobile ? 'Home' : 'Current home') : 
                                   (isMobile ? 'Set Home' : 'Set as home')}
                                </span>
                              </button>
                          </div>
                      </motion.div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 flex-1">
                          
                          {/* HERO & HOURLY COLUMN */}
                          <div className="lg:col-span-8 flex flex-col gap-6 md:gap-8">
                              <motion.div 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex-1 bg-black/20 md:bg-white/[0.03] backdrop-blur-md md:backdrop-blur-3xl border border-white/10 rounded-[3rem] md:rounded-[4rem] p-8 md:p-20 relative overflow-hidden group min-h-[400px] md:min-h-0 shadow-2xl transition-all duration-1000"
                                style={getGlassStyles(weather.condition).styles}
                              >
                                  {getGlassStyles(weather.condition).overlay}
                                  {/* LIVE HERO BACKGROUND EFFECTS */}
                                  <div className="absolute inset-0 pointer-events-none opacity-40">
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
                                          <div className="absolute -top-32 -right-32 md:-top-60 md:-right-60 w-[400px] h-[400px] md:w-[800px] md:h-[800px] pointer-events-none">
                                              {/* Outer Atmospheric Haze */}
                                              <motion.div 
                                                animate={{ 
                                                    scale: [1, 1.15, 1],
                                                    opacity: [0.2, 0.4, 0.2] 
                                                }}
                                                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                                                className="absolute inset-0 bg-orange-600/20 rounded-full blur-[100px] md:blur-[150px]"
                                              />
                                              {/* Inner Warm Glow */}
                                              <motion.div 
                                                animate={{ 
                                                    scale: [0.8, 1, 0.8],
                                                    opacity: [0.3, 0.6, 0.3] 
                                                }}
                                                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                                                className="absolute inset-[15%] bg-yellow-500/30 rounded-full blur-[60px] md:blur-[100px]"
                                              />
                                              {/* Sun Core (Hazy) */}
                                              <motion.div 
                                                animate={{ 
                                                    scale: [0.9, 1.1, 0.9],
                                                    opacity: [0.4, 0.7, 0.4] 
                                                }}
                                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                                className="absolute inset-[35%] bg-white/40 rounded-full blur-[30px] md:blur-[60px]"
                                              />
                                              {/* Subtle Rotating Rays / Lens Flares */}
                                              <motion.div 
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-0 opacity-10 md:opacity-20"
                                              >
                                                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent blur-md" />
                                                <div className="absolute top-0 left-1/2 w-[2px] h-full bg-gradient-to-b from-transparent via-white to-transparent blur-md" />
                                                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-200 to-transparent blur-sm rotate-45" />
                                                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-200 to-transparent blur-sm -rotate-45" />
                                              </motion.div>
                                          </div>
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
                                  
                                  <div className="relative z-10 flex flex-col h-full">
                                      {/* TOP STATUS BAR */}
                                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/5">
                                          <div className="flex flex-col">
                                              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Current Stats</span>
                                              <span className="text-sm font-bold text-white/60">Local Weather</span>
                                          </div>
                                          
                                          <div className="flex items-center gap-6 md:gap-12">
                                              {[
                                                  { label: 'Wind', value: Math.round(weather.windSpeed), unit: 'km/h', icon: <Wind size={14} /> },
                                                  { label: 'Humidity', value: weather.humidity, unit: '%', icon: <Droplets size={14} /> },
                                                  { label: 'Sun UV', value: weather.uvIndex.toFixed(1), unit: '', icon: <Gauge size={14} /> }
                                              ].map((m, idx) => (
                                                  <div key={idx} className="flex items-center gap-3 group/m">
                                                      <div style={{ color: accentColor }} className="opacity-40 group-hover/m:opacity-100 transition-opacity">
                                                          {m.icon}
                                                      </div>
                                                      <div className="flex flex-col">
                                                          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">{m.label}</span>
                                                          <div className="text-sm font-bold text-white/80">{m.value}<span className="text-[10px] ml-0.5 opacity-20 font-black">{m.unit}</span></div>
                                                      </div>
                                                  </div>
                                              ))}
                                          </div>
                                      </div>

                                      {/* CENTER TEMPERATURE */}
                                      <div className="flex-1 flex items-center justify-center py-12">
                                          <h1 className="text-[10rem] md:text-[22rem] font-bold leading-none tracking-tighter text-white drop-shadow-2xl [text-shadow:_0_4px_30px_rgb(0_0_0_/_50%)]">
                                              {convertTemp(weather.temp)}<span className="text-[4rem] md:text-[6rem] text-white/20 align-top mt-6 md:mt-12 inline-block ml-4 md:ml-8">°</span>
                                          </h1>
                                      </div>
                                      
                                      {/* BOTTOM CONDITIONS BAR */}
                                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-0 pt-8 border-t border-white/5">
                                          <div className="flex items-center gap-6">
                                              <div style={{ color: accentColor }} className="p-4 bg-white/5 rounded-2xl border border-white/5 shadow-xl">
                                                  {getIcon(weather.condition, 32)}
                                              </div>
                                              <div className="flex flex-col">
                                                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Weather Today</span>
                                                  <span className="text-3xl md:text-4xl font-bold text-white tracking-tight">{weather.condition.charAt(0) + weather.condition.slice(1).toLowerCase()}</span>
                                              </div>
                                          </div>
                                          
                                          <div className="flex flex-col md:items-end text-left md:text-right">
                                              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Feels Like</span>
                                              <span className="text-2xl md:text-3xl font-bold text-white/60 tracking-tight">{convertTemp(weather.feelsLike)}°</span>
                                          </div>
                                      </div>
                                  </div>
                              </motion.div>

                              {/* HOURLY FORECAST / RADAR */}
                              <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="bg-black/20 md:bg-white/5 backdrop-blur-md border border-white/10 rounded-[3rem] p-6 md:p-10 relative overflow-hidden"
                              >
                                  <div className="flex items-center justify-between mb-8 relative z-20">
                                      <div className="flex items-center gap-3">
                                          <div 
                                            onClick={() => setScrubberView('FORECAST')}
                                            className={`cursor-pointer px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${scrubberView === 'FORECAST' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}
                                          >
                                              Hourly
                                          </div>
                                          <div 
                                            onClick={() => setScrubberView('RADAR')}
                                            className={`cursor-pointer px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${scrubberView === 'RADAR' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}
                                          >
                                              Rain Radar
                                          </div>
                                      </div>
                                      <div className="text-right">
                                          {scrubberView === 'FORECAST' ? (
                                              <span className="text-xs font-black uppercase tracking-widest" style={{ color: accentColor }}>
                                                  {new Date(weather.hourly[selectedHour].time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                              </span>
                                          ) : (
                                              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Live Area</span>
                                          )}
                                      </div>
                                  </div>

                                  <div className="relative h-48 md:h-64 mb-10 overflow-hidden rounded-[2rem]">
                                      <AnimatePresence mode="wait">
                                          {scrubberView === 'FORECAST' ? (
                                              <motion.div 
                                                key="chart"
                                                initial={{ x: 50, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                exit={{ x: -50, opacity: 0 }}
                                                className="absolute inset-0 flex items-end gap-1 md:gap-2 group"
                                              >
                                                  {weather.hourly.map((h: any, i: number) => {
                                                      const maxTemp = Math.max(...weather.hourly.map((x: any) => x.temp));
                                                      const minTemp = Math.min(...weather.hourly.map((x: any) => x.temp));
                                                      const range = maxTemp - minTemp || 1;
                                                      const height = ((h.temp - minTemp) / range) * 100;

                                                      return (
                                                          <div 
                                                            key={i} 
                                                            className="flex-1 flex flex-col items-center justify-end gap-2 h-full cursor-pointer group/bar"
                                                            onMouseEnter={() => setSelectedHour(i)}
                                                            onClick={() => setSelectedHour(i)}
                                                          >
                                                              <div className="relative w-full h-full flex items-end">
                                                                  <motion.div 
                                                                    initial={{ height: 0 }}
                                                                    animate={{ height: `${Math.max(20, height)}%` }}
                                                                    className={`w-full rounded-t-sm transition-all duration-300 ${i === selectedHour ? '' : 'bg-white/10 group-hover/bar:bg-white/20'}`}
                                                                    style={{ backgroundColor: i === selectedHour ? accentColor : undefined }}
                                                                  />
                                                                  <div 
                                                                    className="absolute bottom-0 left-0 w-full bg-blue-500/30 transition-all duration-500"
                                                                    style={{ height: `${h.precip}%` }}
                                                                  />
                                                              </div>
                                                          </div>
                                                      );
                                                  })}
                                              </motion.div>
                                          ) : (
                                              <motion.div 
                                                key="radar"
                                                initial={{ x: 50, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                exit={{ x: -50, opacity: 0 }}
                                                className="absolute inset-0 bg-zinc-900 rounded-[2rem] overflow-hidden"
                                              >
                                                  <RadarDisplay lat={weather.latitude} lon={weather.longitude} color={accentColor} />
                                              </motion.div>
                                          )}
                                      </AnimatePresence>
                                  </div>

                                  <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-8">
                                      <div className="flex flex-col items-center">
                                          <span className="text-[9px] font-black text-white/30 uppercase mb-1">{scrubberView === 'FORECAST' ? 'Temperature' : 'Cloud Cover'}</span>
                                          <span className="text-xl font-bold">{scrubberView === 'FORECAST' ? convertTemp(weather.hourly[selectedHour].temp) + '°' : '24%'}</span>
                                      </div>
                                      <div className="flex flex-col items-center border-x border-white/5">
                                          <span className="text-[9px] font-black text-white/30 uppercase mb-1">{scrubberView === 'FORECAST' ? 'Rain Chance' : 'Visibility'}</span>
                                          <span className="text-xl font-bold text-blue-400">{scrubberView === 'FORECAST' ? weather.hourly[selectedHour].precip + '%' : '10.0km'}</span>
                                      </div>
                                      <div className="flex flex-col items-center">
                                          <span className="text-[9px] font-black text-white/30 uppercase mb-1">{scrubberView === 'FORECAST' ? 'Sun UV' : 'Map Status'}</span>
                                          <span className="text-xl font-bold text-orange-400">{scrubberView === 'FORECAST' ? weather.hourly[selectedHour].uv.toFixed(1) : 'ONLINE'}</span>
                                      </div>
                                  </div>
                              </motion.div>
                          </div>

                          {/* RIGHT COLUMN: ADVICE & FORECAST */}
                          <div className="lg:col-span-4 flex flex-col gap-6 md:gap-8">
                              
                              {/* WEATHER ADVICE MODULE */}
                              <motion.div 
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="bg-black/20 md:bg-white/5 backdrop-blur-md md:backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 shadow-2xl"
                              >
                                  <div className="flex items-center gap-3 mb-6">
                                      <div className="p-2 bg-white/5 rounded-xl" style={{ color: accentColor }}>
                                          <Info size={18} />
                                      </div>
                                      <span className="text-xs font-black uppercase tracking-widest text-white/40">Daily Recommendations</span>
                                  </div>

                                  <div className="space-y-6">
                                      <div className="grid grid-cols-2 gap-3">
                                          {advice?.items.map((item: any, i: number) => (
                                              <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                                  <div className="text-2xl mb-2">{item.icon}</div>
                                                  <div className="text-[10px] font-black uppercase leading-tight mb-1 text-white">{item.label}</div>
                                                  <div className="text-[9px] font-bold text-white/40 leading-tight">{item.desc}</div>
                                              </div>
                                          ))}
                                      </div>
                                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                          <p className="text-xs font-medium leading-relaxed italic text-white/60">
                                              {advice?.activity}
                                          </p>
                                      </div>
                                  </div>
                              </motion.div>

                              {/* 5-DAY FORECAST */}
                              <motion.div 
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="bg-black/20 md:bg-white/5 backdrop-blur-md md:backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 flex flex-col flex-1"
                              >
                                  <div className="flex items-center justify-between mb-8">
                                      <span className="text-xs md:text-sm font-black text-white/40 uppercase tracking-widest drop-shadow-sm">5-Day Forecast</span>
                                      <Calendar size={16} style={{ color: accentColor }} />
                                  </div>

                                  <div className="flex flex-col gap-3">
                                      {weather.forecast.map((day: any, i: number) => {
                                          const allTemps = weather.forecast.map((d: any) => d.maxTemp);
                                          const avgTemp = allTemps.reduce((a: number, b: number) => a + b, 0) / allTemps.length;
                                          const isHottest = day.maxTemp === Math.max(...allTemps) && day.maxTemp > avgTemp + 2;
                                          const isColdest = day.maxTemp === Math.min(...allTemps) && day.maxTemp < avgTemp - 2;
                                          const isStormy = day.condition === 'STORM';
                                          const isOutlier = isHottest || isColdest || isStormy;

                                          const outlierColor = isHottest ? '#FB923C' : isColdest ? '#38BDF8' : accentColor;

                                          return (
                                              <div 
                                                key={i}
                                                className={`flex items-center justify-between p-4 rounded-2xl transition-all relative
                                                  ${isOutlier ? 'bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]' : 'bg-white/5 border border-transparent hover:border-white/10'}
                                                `}
                                                style={{ borderColor: isOutlier ? `${outlierColor}4D` : undefined, borderWidth: isOutlier ? '1px' : undefined }}
                                              >
                                                  {isOutlier && (
                                                      <div className="absolute -top-2 -right-2 px-3 py-1 text-black text-[8px] font-black rounded-full uppercase tracking-widest shadow-lg" style={{ backgroundColor: outlierColor }}>
                                                          {isStormy ? 'Alert' : isHottest ? 'Warmest' : 'Coldest'}
                                                      </div>
                                                  )}
                                                  <div className="flex flex-col">
                                                      <span className="text-xs font-black text-white capitalize">
                                                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                                      </span>
                                                      <span className="text-[10px] font-bold text-white/30 uppercase">{day.condition.toLowerCase()}</span>
                                                  </div>
                                                  <div className="flex items-center gap-6">
                                                      {getIcon(day.condition, 18)}
                                                      <div className="text-right min-w-[40px]">
                                                          <div className="text-sm font-black">{convertTemp(day.maxTemp)}°</div>
                                                          <div className="text-[10px] font-bold text-white/30">{convertTemp(day.minTemp)}°</div>
                                                      </div>
                                                  </div>
                                              </div>
                                          );
                                      })}
                                  </div>

                                  <div className="mt-8 md:mt-12 pt-10 border-t border-white/5 flex flex-col gap-10">
                                      {/* INTEGRATED SOLAR ORBIT TRACKER */}
                                      <div className="w-full px-2">
                                          <div className="flex items-center justify-between mb-6">
                                              <span className="text-[10px] font-black tracking-widest text-white/40 uppercase drop-shadow-sm">Celestial position</span>
                                              <span className="text-[10px] font-black tracking-widest text-white/40 uppercase drop-shadow-sm">
                                                  {weather.isDay ? 'Daylight cycle' : 'Lunar cycle'}
                                              </span>
                                          </div>

                                          <div className="relative h-20 w-full flex items-center justify-between px-2 mb-8">
                                              {/* THE ORBIT PATH */}
                                              <div className="absolute inset-0 overflow-hidden">
                                                  <svg className="w-full h-full opacity-20" preserveAspectRatio="none">
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
                                                      <div className={`h-5 w-5 rounded-full shadow-[0_0_25px_rgba(255,255,255,0.6)] ${weather.isDay ? '' : 'bg-blue-200'}`} style={{ backgroundColor: weather.isDay ? accentColor : undefined }} />
                                                      <div className={`absolute inset-[-8px] h-10 w-10 rounded-full border border-white/10 animate-spin-slow`} />
                                                  </div>
                                              </motion.div>

                                              <div className="flex flex-col items-start gap-1 relative z-20">
                                                  <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter drop-shadow-md">Sunrise</span>
                                                  <div className="flex items-center gap-2">
                                                      <Sunrise size={14} style={{ color: accentColor }} />
                                                      <span className="text-[10px] font-black text-white drop-shadow-md">{new Date(weather.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()}</span>
                                                  </div>
                                              </div>

                                              <div className="flex flex-col items-center gap-1 relative z-20 mt-12">
                                                  <span className="text-[8px] font-black text-white/30 uppercase tracking-widest drop-shadow-md">Zenith</span>
                                                  <div className="h-4 w-px bg-white/20" />
                                              </div>

                                              <div className="flex flex-col items-end gap-1 relative z-20">
                                                  <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter drop-shadow-md">Sunset</span>
                                                  <div className="flex items-center gap-2">
                                                      <span className="text-[10px] font-black text-white drop-shadow-md">{new Date(weather.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()}</span>
                                                      <Sunset size={14} className="text-blue-400" />
                                                  </div>
                                              </div>
                                          </div>

                                                                                {/* PROGRESS BAR */}

                                                                                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden relative border border-white/10">

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

                                                                                      className="h-full"

                                                                                      style={{ 

                                                                                        background: weather.isDay 

                                                                                          ? `linear-gradient(to right, ${accentColor}66, ${accentColor})` 

                                                                                          : 'linear-gradient(to right, rgba(59, 130, 246, 0.4), #BAE6FD)'

                                                                                      }}

                                                                                    />

                                                                                </div>

                                                                                <div className="flex justify-between mt-2 px-1">

                                                                                    <span className="text-[8px] font-black text-white/30 uppercase drop-shadow-sm">Cycle start</span>

                                                                                    <span className="text-[8px] font-black uppercase animate-pulse drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" style={{ color: accentColor }}>

                                                                                        {weather.isDay ? 'Solar active' : 'Lunar active'}

                                                                                    </span>

                                                                                    <span className="text-[8px] font-black text-white/30 uppercase drop-shadow-sm">Cycle end</span>

                                                                                </div>

                                          
                                      </div>

                                      <div className="text-[8px] md:text-[10px] font-mono text-white/10 text-center uppercase tracking-widest pb-2">
                                          Sync status: nominal // {weather.latitude.toFixed(2)}n {weather.longitude.toFixed(2)}e
                                      </div>
                                  </div>
                              </motion.div>

                          </div>
                      </div>

                      {/* SURF & BEACH REPORT SECTION */}
                      {weather?.marine && (
                        <motion.div 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                          className="w-full bg-black/20 md:bg-white/5 backdrop-blur-md border border-white/10 rounded-[3rem] p-8 md:p-12 overflow-hidden relative"
                        >
                            {/* Decorative Background Wave */}
                            <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-5 pointer-events-none">
                                <svg viewBox="0 0 1440 320" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                                    <path fill={accentColor} d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,218.7C960,235,1056,213,1152,186.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                                </svg>
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/5 rounded-2xl" style={{ color: accentColor }}>
                                            <Navigation size={24} className="rotate-[135deg]" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Coastal Status</span>
                                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Surf & Beach Report</h2>
                                        </div>
                                    </div>
                                    <div className="text-right hidden md:block">
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-1">Water Quality</span>
                                        <span className="text-sm font-bold text-emerald-400">EXCELLENT</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                    {/* WAVE HEIGHT */}
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Wave Height</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-bold text-white tabular-nums">{weather.marine.waveHeight.toFixed(1)}</span>
                                            <span className="text-lg font-bold text-white/20 uppercase">Meters</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-white/40 uppercase">
                                            {weather.marine.waveHeight < 0.5 ? 'Very Small / Flat' : 
                                             weather.marine.waveHeight < 1.2 ? 'Good for Beginners' : 
                                             weather.marine.waveHeight < 2.0 ? 'Fun & Playful' : 'Heavy / Advanced'}
                                        </span>
                                    </div>

                                    {/* WAVE PERIOD */}
                                    <div className="flex flex-col gap-2 border-l border-white/5 md:pl-8">
                                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Wave Interval</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-bold text-white tabular-nums">{Math.round(weather.marine.wavePeriod)}</span>
                                            <span className="text-lg font-bold text-white/20 uppercase">Secs</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-white/40 uppercase">
                                            {weather.marine.wavePeriod < 6 ? 'Wind Swell' : 
                                             weather.marine.wavePeriod < 10 ? 'Standard Swell' : 'Ground Swell (Strong)'}
                                        </span>
                                    </div>

                                    {/* DIRECTION */}
                                    <div className="flex flex-col gap-2 border-l border-white/5 md:pl-8">
                                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Swell Direction</span>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div 
                                                className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center relative"
                                                style={{ transform: `rotate(${weather.marine.waveDirection}deg)` }}
                                            >
                                                <div className="w-1 h-6 bg-[#DFFF00] rounded-full absolute top-0" style={{ backgroundColor: accentColor }} />
                                                <Navigation size={12} className="text-white/20" />
                                            </div>
                                            <span className="text-2xl font-bold text-white">{weather.marine.waveDirection}°</span>
                                        </div>
                                    </div>

                                    {/* ADVICE */}
                                    <div className="flex flex-col justify-center">
                                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                            <p className="text-xs font-medium leading-relaxed italic text-white/60">
                                                {weather.marine.waveHeight > 1.5 ? "Ocean conditions are active today. Caution advised for casual swimmers." : "Calm coastal waters. Great day for a swim or paddle."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                      )}

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
        @keyframes bird-fly {
          0% { transform: translate(-20vw, 5vh) translateZ(0); opacity: 0; }
          10% { opacity: 0.4; }
          50% { transform: translate(50vw, -5vh) translateZ(0); }
          90% { opacity: 0.4; }
          100% { transform: translate(120vw, 2vh) translateZ(0); opacity: 0; }
        }
        @keyframes bird-soar {
          0%, 100% { transform: rotateZ(-2deg) translateY(0) scaleX(1); }
          50% { transform: rotateZ(2deg) translateY(-3px) scaleX(1.05); }
        }
        @keyframes radar-sweep {
          0% { transform: translateX(-100%); }
          50% { opacity: 0.3; }
          100% { transform: translateX(200%); }
        }
        @keyframes glass-rain {
          0% { transform: translateY(-100%) translateX(-100%) rotate(45deg); }
          100% { transform: translateY(200%) translateX(200%) rotate(45deg); }
        }
        .animate-rain { animation: rain linear infinite; will-change: transform; }
        .animate-snow { animation: snow linear infinite; will-change: transform; }
        .animate-leaf { animation: leaf linear infinite; will-change: transform; }
        .animate-cloud { animation: cloud linear infinite; will-change: transform; }
        .animate-lightning { animation: lightning 8s linear infinite; }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
        .animate-wind-gust { animation: wind-gust 5s linear infinite; }
        .animate-bird-fly { animation: bird-fly linear infinite; will-change: transform; }
        .animate-bird-soar { animation: bird-soar ease-in-out infinite; transform-origin: center; }
        .animate-radar-sweep { animation: radar-sweep 4s ease-in-out infinite; }
        .animate-glass-rain { animation: glass-rain 3s linear infinite; opacity: 0.1; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}