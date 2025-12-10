'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  CloudRain, Wind, Search, Skull, 
  MapPin, Loader2, Smile, Frown, Zap, Baby, Briefcase, RefreshCcw, 
  Cpu, Droplets, Gauge, Navigation, Calendar, Radio, CloudSnow, CloudLightning, Sun, Crosshair, History, X,
  CloudHail // Added CloudHail for the Header
} from 'lucide-react';

// Import the massive commentary database
import { COMMENTARY_DB, PersonalityMode } from '../lib/commentary';

// --- SUB-COMPONENT: ROBUST TYPEWRITER ---
const Typewriter = ({ text, speed = 30 }: { text: string; speed?: number }) => {
  const [displayLength, setDisplayLength] = useState(0);

  useEffect(() => {
    setDisplayLength(0);
    const timer = setInterval(() => {
      setDisplayLength((prev) => {
        if (prev < text.length) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span>
      {text.slice(0, displayLength)}
      <span className="inline-block w-1.5 h-4 md:w-2 md:h-6 align-middle bg-[#DFFF00] animate-pulse ml-1" />
    </span>
  );
};

// --- SUB-COMPONENT: WEATHER ANIMATION LAYER ---
const WeatherBackground = ({ condition, isDay }: { condition: string, isDay: number }) => {
  if (condition === 'RAINING') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-blue-950/20 mix-blend-overlay" />
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-blue-400/30 w-[1px] h-12 md:h-24 rounded-full animate-rain"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`,
              animationDuration: `${0.5 + Math.random() * 0.5}s`,
              animationDelay: `${Math.random() * 1}s`
            }}
          />
        ))}
      </div>
    );
  }

  if (condition === 'SNOW') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-white/5 mix-blend-overlay" />
        {[...Array(30)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-white/60 w-1 h-1 rounded-full animate-snow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`,
              animationDuration: `${3 + Math.random() * 4}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    );
  }

  if (condition === 'CLOUDY') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-zinc-400/10 w-96 h-48 rounded-full blur-[60px] animate-cloud"
            style={{
              top: `${10 + Math.random() * 40}%`,
              left: `-20%`,
              animationDuration: `${25 + i * 10}s`,
              animationDelay: `${i * -5}s`,
              transform: `scale(${0.8 + Math.random() * 0.5})`
            }}
          />
        ))}
      </div>
    );
  }

  if (condition === 'STORM') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-purple-950/20 mix-blend-overlay" />
        {[...Array(3)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-zinc-900/30 w-[500px] h-[200px] rounded-full blur-[80px] animate-cloud-fast"
            style={{
              top: `${Math.random() * 30}%`,
              left: `-20%`,
              animationDuration: `${10 + i * 2}s`,
              animationDelay: `${i * -2}s`
            }}
          />
        ))}
        <div className="absolute inset-0 bg-white/10 animate-lightning opacity-0" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isDay ? (
            <div className="absolute -top-1/2 -right-1/2 w-[150%] h-[150%] bg-orange-400/5 rounded-full blur-[100px] animate-pulse-slow" />
        ) : (
            <div className="absolute -top-1/2 -right-1/2 w-[150%] h-[150%] bg-blue-400/5 rounded-full blur-[100px] animate-pulse-slow" />
        )}
    </div>
  );
};

// --- TYPES ---
interface WeatherData {
  temp: number;
  feelsLike: number;
  minTemp: number;
  maxTemp: number;
  condition: string;
  windSpeed: number;
  humidity: number;
  uvIndex: number;
  location: string;
  code: number;
  isDay: number;
}

interface GeocodingResult {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

const PERSONALITIES: { id: PersonalityMode; label: string; icon: any; desc: string; color: string; bg: string; border: string; shadow: string }[] = [
  { id: 'HOSTILE', label: 'HOSTILITY', icon: Skull, desc: 'Rude. Blunt. Hurtful.', color: 'text-red-500', bg: 'bg-red-950/10', border: 'border-red-500/20', shadow: 'shadow-red-500/10' },
  { id: 'SARCASTIC', label: 'SASS_MODULE', icon: Zap, desc: 'Passive aggressive.', color: 'text-yellow-400', bg: 'bg-yellow-950/10', border: 'border-yellow-500/20', shadow: 'shadow-yellow-500/10' },
  { id: 'BABY', label: 'BABY_MODE', icon: Baby, desc: 'Explained like you are 5.', color: 'text-pink-400', bg: 'bg-pink-950/10', border: 'border-pink-500/20', shadow: 'shadow-pink-500/10' },
  { id: 'DOOMER', label: 'NIHILIST', icon: Frown, desc: 'Everything is hopeless.', color: 'text-zinc-500', bg: 'bg-zinc-900/50', border: 'border-zinc-500/20', shadow: 'shadow-zinc-500/10' },
  { id: 'GLAZER', label: 'SYCOPHANT', icon: Smile, desc: 'Overly complimentary.', color: 'text-[#DFFF00]', bg: 'bg-[#DFFF00]/5', border: 'border-[#DFFF00]/20', shadow: 'shadow-[#DFFF00]/10' },
  { id: 'PROFESSIONAL', label: 'STANDARD', icon: Briefcase, desc: 'Boring. Just the facts.', color: 'text-blue-400', bg: 'bg-blue-950/10', border: 'border-blue-500/20', shadow: 'shadow-blue-500/10' },
];

export default function WeatherTerminal() {
  // --- STATE ---
  const [step, setStep] = useState<'SEARCH' | 'RESULT'>('SEARCH');
  
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingGeo, setIsSearchingGeo] = useState(false);
  const [showWarning, setShowWarning] = useState(true); // NEW: State for warning visibility
  
  const [selectedGeo, setSelectedGeo] = useState<GeocodingResult | null>(null);
  const [selectedMode, setSelectedMode] = useState<PersonalityMode>('HOSTILE');
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [commentary, setCommentary] = useState<string>('');
  const [error, setError] = useState('');
  
  // Recent Searches State
  const [recentSearches, setRecentSearches] = useState<GeocodingResult[]>([]);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('zinc_weather_history');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) { console.error("History load error", e); }
    }
  }, []);

  const saveRecentSearch = (loc: GeocodingResult) => {
    const newList = [loc, ...recentSearches.filter(i => i.id !== loc.id)].slice(0, 5);
    setRecentSearches(newList);
    localStorage.setItem('zinc_weather_history', JSON.stringify(newList));
  };

  const removeRecentSearch = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newList = recentSearches.filter(item => item.id !== id);
    setRecentSearches(newList);
    localStorage.setItem('zinc_weather_history', JSON.stringify(newList));
  };

  // --- LOGIC: SEARCH ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    setError('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsSearchingGeo(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(val)}&count=5&language=en&format=json`);
        const data = await res.json();
        setSuggestions(data.results || []);
        setShowSuggestions(true);
      } catch (err) { console.error(err); } 
      finally { setIsSearchingGeo(false); }
    }, 400);
  };

  const handleLocationSelect = (loc: GeocodingResult) => {
    setSelectedGeo(loc);
    setInput(`${loc.name}, ${loc.country || ''}`);
    setShowSuggestions(false);
    saveRecentSearch(loc);
    const randomPersonality = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
    executeFetch(loc, randomPersonality.id);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("GEOLOCATION UNAVAILABLE");
      return;
    }
    setLoading(true); 
    setIsSearchingGeo(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc: GeocodingResult = {
          id: 0,
          name: "LOCAL SECTOR",
          country: "DETECTED",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setIsSearchingGeo(false);
        setLoading(false);
        handleLocationSelect(loc);
      },
      (err) => {
        console.error(err);
        setError("LOCATION SIGNAL LOST");
        setIsSearchingGeo(false);
        setLoading(false);
      }
    );
  };

  // --- LOGIC: WEATHER & PERSONALITY ---
  const getRandomLine = (mode: PersonalityMode, category: string) => {
    const lines = COMMENTARY_DB[mode][category] || COMMENTARY_DB[mode]['DEFAULT'];
    return lines[Math.floor(Math.random() * lines.length)];
  };

  const generateCommentary = (w: WeatherData, mode: PersonalityMode) => {
    let category = 'DEFAULT';
    
    if (w.condition === 'STORM') category = 'STORM';
    else if (w.condition === 'SNOW') category = 'SNOW';
    else if (w.condition === 'RAINING') category = 'RAIN';
    else if (w.temp > 35) category = 'EXTREME_HEAT';
    else if (w.temp > 28) category = 'HEAT';
    else if (w.temp < 0) category = 'FREEZING';
    else if (w.temp < 10) category = 'COLD';
    else if (w.temp >= 18 && w.temp <= 25) category = 'NICE';
    
    return getRandomLine(mode, category);
  };

  const executeFetch = async (loc: GeocodingResult, mode: PersonalityMode) => {
    setLoading(true);
    setSelectedMode(mode);
    setStep('RESULT');

    try {
        const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&hourly=uv_index&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`
        );
        const wData = await weatherRes.json();
        const current = wData.current;
        const daily = wData.daily;

        const timeString = current.time;
        const hourString = timeString.split('T')[1].split(':')[0];
        const currentHourIndex = parseInt(hourString, 10);
        const uvIndex = wData.hourly?.uv_index?.[currentHourIndex] ?? 0;

        let conditionText = "CLEAR";
        if (current.weather_code > 2) conditionText = "CLOUDY";
        if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(current.weather_code)) conditionText = "RAINING";
        if (current.weather_code >= 95) conditionText = "STORM";
        if ([71, 73, 75, 85, 86].includes(current.weather_code)) conditionText = "SNOW";

        const newWeather: WeatherData = {
            temp: current.temperature_2m,
            feelsLike: current.apparent_temperature,
            minTemp: daily.temperature_2m_min[0],
            maxTemp: daily.temperature_2m_max[0],
            condition: conditionText,
            windSpeed: current.wind_speed_10m,
            humidity: current.relative_humidity_2m,
            uvIndex: uvIndex,
            location: `${loc.name}, ${loc.country || ''}`,
            code: current.weather_code,
            isDay: current.is_day
        };

        setWeather(newWeather);
        setCommentary(generateCommentary(newWeather, mode));
    } catch (e) {
        console.error(e);
        setError("SYSTEM FAILURE");
        setStep('SEARCH');
    } finally {
        setLoading(false);
    }
  };

  const reset = () => {
      setStep('SEARCH');
      setWeather(null);
      setCommentary('');
      setInput('');
      setSelectedGeo(null);
  };

  const activePersonality = PERSONALITIES.find(p => p.id === selectedMode) || PERSONALITIES[0];
  
  const getUvColor = (uv: number) => {
      if (uv <= 2) return 'bg-blue-500';
      if (uv <= 5) return 'bg-yellow-500';
      if (uv <= 7) return 'bg-orange-500';
      if (uv <= 10) return 'bg-red-500';
      return 'bg-purple-500';
  };

  const getUvLabel = (uv: number) => {
      if (uv <= 2) return 'LOW';
      if (uv <= 5) return 'MODERATE';
      if (uv <= 7) return 'HIGH';
      if (uv <= 10) return 'VERY HIGH';
      return 'EXTREME';
  };

  return (
    <div className="max-w-5xl mx-auto min-h-[500px] flex flex-col" ref={containerRef}>
      
      {/* --- HEADER (MOVED HERE TO COLLAPSE ON SEARCH) --- */}
      {step === 'SEARCH' && (
        <div className="pt-20 pb-8 px-6 border-b border-zinc-800 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-[10px] font-black tracking-widest uppercase mb-2">
                        <span>ATMOSPHERIC_SENSORS</span>
                        <span className="text-zinc-600">/</span>
                        <span>PERSONALITY_MATRIX</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter">
                        Weather <span className="text-zinc-800 text-stroke-white">Station</span>
                    </h1>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-2 flex items-center gap-2">
                        <CloudHail size={12} /> Live Environment Analysis
                    </p>
                </div>
            </div>
        </div>
      )}

      {/* --- STEP 1: SEARCH --- */}
      {step === 'SEARCH' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-2xl mx-auto w-full px-4 md:px-0">
             
             {/* WARNING CARD (NOW DISMISSIBLE) */}
             {showWarning && (
                <div className="relative bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-4 md:p-6 mb-6 md:mb-8 flex gap-4 items-start shadow-xl group">
                    <button 
                        onClick={() => setShowWarning(false)}
                        className="absolute top-2 right-2 p-2 text-zinc-600 hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                    <div className="p-2 md:p-3 bg-red-500/10 rounded-2xl shrink-0">
                        <Cpu size={20} className="text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-base md:text-lg mb-1">Personality Warning</h3>
                        <p className="text-zinc-400 text-xs md:text-sm leading-relaxed pr-6">
                            The weather module's personality function is currently faulty and it may say some obscene and rude things.
                        </p>
                    </div>
                </div>
             )}

             {/* SEARCH WIDGET */}
             <div className="bg-zinc-950/80 backdrop-blur-lg border border-zinc-800 rounded-[2rem] p-2 shadow-2xl relative z-20 mb-8">
                <div className="relative flex items-center">
                    <div className="absolute left-4 md:left-5 text-zinc-500 pointer-events-none z-10">
                        {isSearchingGeo ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                    </div>
                    
                    <input 
                        type="text" 
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Search location..."
                        className="w-full bg-zinc-900/50 rounded-3xl py-4 md:py-6 pl-12 md:pl-14 pr-16 text-base md:text-xl text-white outline-none focus:bg-zinc-900 transition-colors placeholder:text-zinc-600 font-medium appearance-none touch-manipulation"
                        autoComplete="off"
                        autoFocus
                        style={{ fontSize: '16px' }} 
                    />

                    <button 
                        onClick={handleCurrentLocation}
                        className="absolute right-2 p-3 md:p-4 bg-zinc-800 hover:bg-[#DFFF00] hover:text-black text-zinc-400 rounded-2xl transition-colors group touch-manipulation"
                        title="Use Current Location"
                    >
                        <Crosshair size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                    </button>
                </div>

                {/* SUGGESTIONS */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-zinc-900 border border-zinc-800 rounded-3xl shadow-xl mt-2 overflow-hidden animate-in fade-in slide-in-from-top-2 p-2 z-50">
                        {suggestions.map((loc) => (
                            <button
                                key={loc.id}
                                onClick={() => handleLocationSelect(loc)}
                                className="w-full text-left p-3 md:p-4 hover:bg-zinc-800 rounded-2xl flex items-center justify-between group transition-colors touch-manipulation"
                            >
                                <div className="flex flex-col">
                                    <span className="font-bold text-white group-hover:text-[#DFFF00] transition-colors">{loc.name}</span>
                                    <span className="text-[10px] md:text-xs text-zinc-500 font-medium uppercase">
                                        {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}
                                    </span>
                                </div>
                                <Navigation size={14} className="text-zinc-600 group-hover:text-[#DFFF00] -rotate-45" />
                            </button>
                        ))}
                    </div>
                )}
             </div>

             {/* RECENT SEARCHES */}
             {recentSearches.length > 0 && (
                 <div className="animate-in fade-in slide-in-from-bottom-4 delay-300">
                     <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3 pl-2 flex items-center gap-2">
                         <History size={12} /> Recent Targets
                     </h3>
                     <div className="flex flex-wrap gap-2">
                         {recentSearches.map((loc) => (
                             <div key={loc.id} className="relative group">
                                <button
                                    onClick={() => handleLocationSelect(loc)}
                                    className="px-4 py-2 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-[#DFFF00]/50 rounded-full transition-all flex items-center gap-2"
                                >
                                    <span className="font-bold text-xs text-zinc-300 group-hover:text-white truncate max-w-[120px]">{loc.name}</span>
                                </button>
                                <button 
                                    onClick={(e) => removeRecentSearch(loc.id, e)}
                                    className="absolute -top-1 -right-1 bg-zinc-800 text-zinc-400 hover:text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={10} />
                                </button>
                             </div>
                         ))}
                     </div>
                 </div>
             )}
          </div>
      )}

      {/* --- STEP 2: RESULT DASHBOARD (UNIFIED CARD) --- */}
      {step === 'RESULT' && (
          <div className="animate-in zoom-in-95 duration-500 pt-8">
             
             {loading ? (
                 <div className="flex flex-col items-center justify-center py-20 md:py-32">
                     <div className="relative">
                        <div className="absolute inset-0 bg-[#DFFF00] blur-xl opacity-20 animate-pulse" />
                        <Loader2 size={48} className="animate-spin text-[#DFFF00] relative z-10" />
                     </div>
                     <div className="mt-8 text-zinc-500 font-mono text-xs uppercase tracking-widest">
                         Calibrating Sensors...
                     </div>
                 </div>
             ) : weather ? (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                    
                    {/* 1. LOCATION & DATE */}
                    <div className="col-span-2 md:col-span-3 lg:col-span-4 flex flex-col md:flex-row justify-between items-start md:items-end p-2 mb-2">
                        <div>
                            <div className="flex items-center gap-2 text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">
                                <MapPin size={12} /> Target Sector
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight leading-none">{weather.location}</h2>
                        </div>
                        <div className="mt-2 md:mt-0 flex items-center gap-2 text-zinc-600 text-xs md:text-sm font-mono bg-zinc-900/50 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-zinc-800">
                            <Calendar size={12} />
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </div>
                    </div>

                    {/* 2. UNIFIED COMMAND CENTER CARD */}
                    <div className={`col-span-2 md:col-span-3 lg:col-span-4 bg-zinc-900 border rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden group shadow-2xl transition-all duration-500 ${activePersonality.border} ${activePersonality.shadow}`}>
                        
                        {/* ANIMATED WEATHER BACKGROUND */}
                        <WeatherBackground condition={weather.condition} isDay={weather.isDay} />

                        {/* Tech Wave Animation (Bottom Right) */}
                        <div className="absolute bottom-0 right-8 opacity-20 flex gap-1 h-12 items-end pointer-events-none">
                             {[...Array(10)].map((_, i) => (
                                 <div 
                                    key={i} 
                                    className={`w-1 rounded-t-full ${activePersonality.color.replace('text-', 'bg-')} animate-pulse`} 
                                    style={{ 
                                        height: `${Math.random() * 100}%`,
                                        animationDuration: '1s',
                                        animationDelay: `${i * 100}ms` 
                                    }} 
                                 />
                             ))}
                        </div>
                        
                        {/* Content Grid */}
                        <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12">
                            
                            {/* Left: Telemetry */}
                            <div className="flex-1 flex flex-col justify-center">
                                <span className="bg-black/40 backdrop-blur-md text-white text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 mb-4 inline-block shadow-lg self-start">
                                    LIVE TELEMETRY
                                </span>
                                <div className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-none mb-2 drop-shadow-2xl">
                                    {Math.round(weather.temp)}°
                                </div>
                                <div className="text-xl md:text-2xl font-medium text-white/80 uppercase tracking-widest flex items-center gap-3 drop-shadow-md mb-6">
                                    {weather.condition}
                                    {weather.condition === 'RAINING' && <CloudRain size={24} className="text-blue-400" />}
                                    {weather.condition === 'STORM' && <CloudLightning size={24} className="text-purple-400" />}
                                    {weather.condition === 'SNOW' && <CloudSnow size={24} className="text-white" />}
                                    {!['RAINING', 'STORM', 'SNOW'].includes(weather.condition) && <Sun size={24} className={weather.isDay ? "text-orange-400" : "text-blue-300"} />}
                                </div>

                                {/* NEW: Feels Like / High / Low Grid */}
                                <div className="flex items-center gap-4 md:gap-8 bg-black/20 rounded-2xl p-3 md:p-4 border border-white/5 backdrop-blur-sm self-start">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Feels Like</span>
                                        <span className="text-lg md:text-xl font-bold text-white">{Math.round(weather.feelsLike)}°</span>
                                    </div>
                                    <div className="w-px h-8 bg-white/10" />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Low</span>
                                        <span className="text-lg md:text-xl font-bold text-blue-200">{Math.round(weather.minTemp)}°</span>
                                    </div>
                                    <div className="w-px h-8 bg-white/10" />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">High</span>
                                        <span className="text-lg md:text-xl font-bold text-orange-200">{Math.round(weather.maxTemp)}°</span>
                                    </div>
                                </div>
                            </div>

                            {/* Divider (Desktop Only) */}
                            <div className="hidden md:block w-px bg-white/10 self-stretch relative overflow-hidden">
                                <div className={`absolute top-0 w-full h-1/2 bg-gradient-to-b from-transparent ${activePersonality.color.replace('text-', 'via-')} to-transparent opacity-50 animate-pulse`} />
                            </div>

                            {/* Right: Personality Interface */}
                            <div className="flex-1 flex flex-col justify-end">
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xl text-[10px] font-bold uppercase tracking-widest self-start mb-4 ${activePersonality.color} border border-white/5`}>
                                    <Radio size={12} className="animate-pulse" />
                                    {activePersonality.label} CHANNEL
                                </div>
                                
                                <blockquote className="text-lg md:text-2xl font-black text-white leading-tight uppercase min-h-[80px] md:min-h-[100px] drop-shadow-xl">
                                    "<Typewriter text={commentary} speed={40} />"
                                </blockquote>
                            </div>

                        </div>
                    </div>

                    {/* 4. STAT GRID (2x2 on Mobile) */}
                    
                    {/* WIND CARD with Animation */}
                    <div className="col-span-1 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-[2rem] p-5 md:p-6 flex flex-col justify-between aspect-square hover:bg-zinc-900 transition-colors relative overflow-hidden group">
                        {/* Wind Animation Lines */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <div className="absolute top-1/4 -left-10 w-full h-0.5 bg-white animate-[wind_3s_linear_infinite]" />
                            <div className="absolute top-1/2 -left-10 w-full h-0.5 bg-white animate-[wind_2s_linear_infinite_0.5s]" />
                            <div className="absolute top-3/4 -left-10 w-full h-0.5 bg-white animate-[wind_4s_linear_infinite_1s]" />
                        </div>
                        <div className="flex justify-between text-zinc-500 relative z-10">
                            <Wind size={20} className="md:w-6 md:h-6" />
                            <span className="text-[10px] md:text-xs font-bold">WIND</span>
                        </div>
                        <div className="relative z-10">
                            <span className="text-2xl md:text-3xl font-black text-white">{weather.windSpeed}</span>
                            <span className="text-xs md:text-sm text-zinc-500 ml-1">km/h</span>
                        </div>
                    </div>

                    {/* HUMIDITY CARD with Water Level */}
                    <div className="col-span-1 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-[2rem] relative overflow-hidden flex flex-col justify-between aspect-square hover:bg-zinc-900 transition-colors group">
                         {/* Water Fill Background */}
                         <div 
                            className="absolute bottom-0 left-0 right-0 bg-blue-500/20 transition-all duration-1000 ease-out"
                            style={{ height: `${weather.humidity}%` }}
                         >
                             {/* Top Wave Border */}
                             <div className="absolute top-0 left-0 right-0 h-px bg-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                         </div>

                         <div className="flex justify-between text-zinc-500 p-5 md:p-6 relative z-10">
                            <Droplets size={20} className="md:w-6 md:h-6 group-hover:text-blue-400 transition-colors" />
                            <span className="text-[10px] md:text-xs font-bold">HUMIDITY</span>
                        </div>
                        <div className="p-5 md:p-6 pt-0 relative z-10">
                            <span className="text-2xl md:text-3xl font-black text-white">{weather.humidity}</span>
                            <span className="text-xs md:text-sm text-zinc-500 ml-1">%</span>
                        </div>
                    </div>

                    {/* INDEX CARD with Color Scale */}
                    <div className="col-span-1 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-[2rem] p-5 md:p-6 flex flex-col justify-between aspect-square hover:bg-zinc-900 transition-colors relative overflow-hidden">
                         {/* UV Gradient Background */}
                         <div className={`absolute inset-0 opacity-10 ${getUvColor(weather.uvIndex)} transition-colors duration-1000`} />
                         
                         <div className="flex justify-between text-zinc-500 relative z-10">
                            <Gauge size={20} className="md:w-6 md:h-6" />
                            <span className="text-[10px] md:text-xs font-bold">INDEX</span>
                        </div>
                        <div className="relative z-10">
                            <span className="text-2xl md:text-3xl font-black text-white">{weather.uvIndex.toFixed(1)}</span>
                            <div className="text-[10px] font-bold tracking-widest mt-1 opacity-80">
                                {getUvLabel(weather.uvIndex)}
                            </div>
                        </div>
                    </div>

                    {/* RESET ACTION */}
                    <button 
                        onClick={reset}
                        className="col-span-1 bg-[#DFFF00] hover:bg-white rounded-[2rem] p-5 md:p-6 flex flex-col justify-center items-center gap-2 aspect-square transition-colors group cursor-pointer"
                    >
                        <RefreshCcw size={28} className="text-black group-hover:rotate-180 transition-transform duration-500 md:w-8 md:h-8" />
                        <span className="text-black font-black text-[10px] md:text-xs uppercase tracking-widest">RESET</span>
                    </button>

                 </div>
             ) : null}
          </div>
      )}
      
      {/* Global Style for Animations */}
      <style jsx global>{`
        @keyframes wind {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateX(200%); opacity: 0; }
        }
        @keyframes rain {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1200%); }
        }
        @keyframes snow {
          0% { transform: translateY(-20%) translateX(0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(120%) translateX(20px); opacity: 0; }
        }
        @keyframes cloud {
          0% { transform: translateX(-100%) scale(0.8); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(200%) scale(1.2); opacity: 0; }
        }
        @keyframes cloud-fast {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(300%); opacity: 0; }
        }
        @keyframes lightning {
          0%, 90%, 100% { opacity: 0; }
          92% { opacity: 1; }
          94% { opacity: 0; }
          96% { opacity: 0.8; }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.1); opacity: 0.3; }
        }
        .animate-rain { animation: rain 1s linear infinite; }
        .animate-snow { animation: snow 3s linear infinite; }
        .animate-cloud { animation: cloud 20s linear infinite; }
        .animate-cloud-fast { animation: cloud-fast 5s linear infinite; }
        .animate-lightning { animation: lightning 5s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}