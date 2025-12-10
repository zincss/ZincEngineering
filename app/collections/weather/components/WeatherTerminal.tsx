'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  CloudRain, Wind, Search, Skull, 
  MapPin, Loader2, Smile, Frown, Zap, Baby, Briefcase, RefreshCcw, 
  Cpu, Droplets, Gauge, Navigation, Calendar, Radio, CloudSnow, CloudLightning, Sun, Crosshair
} from 'lucide-react';

// --- SUB-COMPONENT: ROBUST TYPEWRITER ---
const Typewriter = ({ text, speed = 40 }: { text: string; speed?: number }) => {
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
      <span className="inline-block w-2 h-5 md:w-3 md:h-8 align-middle bg-[#DFFF00] animate-pulse ml-1 mb-1" />
    </span>
  );
};

// --- TYPES ---
interface WeatherData {
  temp: number;
  condition: string;
  windSpeed: number;
  humidity: number;
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

type PersonalityMode = 'HOSTILE' | 'BABY' | 'DOOMER' | 'PROFESSIONAL' | 'SARCASTIC' | 'GLAZER';

const PERSONALITIES: { id: PersonalityMode; label: string; icon: any; desc: string; color: string; bg: string; border: string; shadow: string }[] = [
  { id: 'HOSTILE', label: 'HOSTILITY', icon: Skull, desc: 'Rude. Blunt. Hurtful.', color: 'text-red-500', bg: 'bg-red-950/20', border: 'border-red-900/30', shadow: 'shadow-red-900/20' },
  { id: 'SARCASTIC', label: 'SASS_MODULE', icon: Zap, desc: 'Passive aggressive.', color: 'text-yellow-400', bg: 'bg-yellow-950/20', border: 'border-yellow-900/30', shadow: 'shadow-yellow-900/20' },
  { id: 'BABY', label: 'BABY_MODE', icon: Baby, desc: 'Explained like you are 5.', color: 'text-pink-400', bg: 'bg-pink-950/20', border: 'border-pink-900/30', shadow: 'shadow-pink-900/20' },
  { id: 'DOOMER', label: 'NIHILIST', icon: Frown, desc: 'Everything is hopeless.', color: 'text-zinc-500', bg: 'bg-zinc-900', border: 'border-zinc-700', shadow: 'shadow-zinc-900/20' },
  { id: 'GLAZER', label: 'SYCOPHANT', icon: Smile, desc: 'Overly complimentary.', color: 'text-[#DFFF00]', bg: 'bg-[#DFFF00]/10', border: 'border-[#DFFF00]/20', shadow: 'shadow-[#DFFF00]/20' },
  { id: 'PROFESSIONAL', label: 'STANDARD', icon: Briefcase, desc: 'Boring. Just the facts.', color: 'text-blue-400', bg: 'bg-blue-950/20', border: 'border-blue-900/30', shadow: 'shadow-blue-900/20' },
];

// --- MASSIVE COMMENTARY DATABASE ---
const COMMENTARY_DB = {
  HOSTILE: {
    EXTREME_HEAT: [
      "IT'S DISGUSTINGLY HOT. STAY INSIDE SO NO ONE HAS TO SMELL YOU.",
      "SURFACE TEMPS ARE LETHAL. UNFORTUNATELY, YOU WILL PROBABLY SURVIVE.",
      "YOU ARE GOING TO SWEAT. IT WILL BE GROSS. EVERYONE WILL JUDGE YOU.",
      "THE SUN IS TRYING TO COOK YOU ALIVE. I'M ROOTING FOR THE SUN.",
      "HYDRATE OR DIE, I REALLY DON'T CARE WHICH ONE YOU PICK."
    ],
    HEAT: [
      "IT IS HOT. TRY NOT TO BE YOUR USUAL STICKY SELF.",
      "HIGH TEMPERATURES DETECTED. APPLY DEODORANT, DOUBLE DOSE.",
      "I HOPE YOUR AIR CONDITIONING BREAKS.",
      "PERFECT WEATHER TO STAY INDOORS AND ROT AT YOUR DESK.",
      "IT'S WARM. UNLIKE YOUR PERSONALITY."
    ],
    COLD: [
      "IT IS COLD. PUT ON A JACKET, YOU WEAKLING.",
      "LOW TEMPERATURES. TRY SHIVERING, IT MIGHT BURN SOME CALORIES.",
      "IT'S CHILLY. ALMOST AS COLD AS YOUR DATING LIFE.",
      "NATURE IS TRYING TO FREEZE YOU. ACCEPT YOUR FATE.",
      "HOPE YOU HAVE HEATING. WOULD BE A SHAME IF YOU FROZE."
    ],
    FREEZING: [
      "HYPOTHERMIA IS IMMINENT. DRESS WARM OR PERISH.",
      "IT IS ABSOLUTELY FREEZING. YOUR FRAGILE BODY CANNOT HANDLE THIS.",
      "FROSTBITE RISK DETECTED. DON'T LOSE ANY FINGERS, YOU NEED THEM TO TYPE BAD CODE.",
      "THE AIR HURTS. GOOD.",
      "GLACIERS ARE MOVING FASTER THAN YOU TODAY."
    ],
    RAIN: [
      "THE SKY IS WEEPING BECAUSE YOU EXIST.",
      "IT IS RAINING. YOU WILL GET WET. CRY ABOUT IT.",
      "PRECIPITATION DETECTED. YOUR HAIR IS GOING TO LOOK TERRIBLE.",
      "WATER IS FALLING FROM THE SKY. TRY NOT TO DROWN IN A PUDDLE.",
      "CLOUDS ARE LEAKING. HOPE YOU FORGOT YOUR UMBRELLA."
    ],
    STORM: [
      "THUNDERSTORMS. GO STAND UNDER A TALL TREE HOLDING METAL.",
      "SKY IS ANGRY. HOPEFULLY IT HITS YOUR HOUSE SPECIFICALLY.",
      "ELECTRICAL STORMS. NATURE'S WAY OF SAYING 'I HATE YOU'.",
      "CHAOS DETECTED. FINALLY, SOME ENTERTAINMENT.",
      "SEVERE WEATHER. SEEK SHELTER, OR DON'T. I'M NOT YOUR MOM."
    ],
    SNOW: [
      "FROZEN WATER IS FALLING. DON'T EAT THE YELLOW SNOW, GENIUS.",
      "SNOW DETECTED. DRIVE CAREFULLY, OR CRASH. WHATEVER.",
      "EVERYTHING IS WHITE AND COLD. JUST LIKE YOUR SOUL.",
      "BURIED IN SNOW. HOPE YOU HAVE A SHOVEL, PEASANT.",
      "IT'S SNOWING. TRY NOT TO SLIP AND EMBARRASS YOURSELF."
    ],
    NICE: [
      "ACTUALLY PLEASANT. GO TOUCH GRASS FOR ONCE IN YOUR LIFE.",
      "THE WEATHER IS NICE. UNFORTUNATELY, YOU ARE STILL HERE.",
      "OPTIMAL CONDITIONS. A WASTE ON SOMEONE LIKE YOU.",
      "IT'S A BEAUTIFUL DAY. DON'T RUIN IT BY GOING OUTSIDE.",
      "SUNNY AND MILD. YOU DON'T DESERVE THIS."
    ],
    DEFAULT: [
      "MEDIOCRE WEATHER FOR A MEDIOCRE INDIVIDUAL.",
      "WEATHER IS BORING. JUST LIKE YOU.",
      "NOTHING INTERESTING IS HAPPENING. GO AWAY.",
      "ATMOSPHERIC CONDITIONS ARE MEH.",
      "WHY ARE YOU STILL LOOKING AT THIS?"
    ]
  },
  SARCASTIC: {
    EXTREME_HEAT: [
      "Oh look, it's boiling. Groundbreaking stuff.",
      "I hope you like being a human soup ingredient.",
      "The sun is basically screaming at us today.",
      "Great day to be a lizard. Bad day to be you.",
      "Global warming called. It says 'You're welcome'."
    ],
    HEAT: [
      "Wow, it's warm. Who could have predicted this in summer?",
      "You might actually sweat today. Gross.",
      "It's hot. Groundbreaking observation, I know.",
      "Try not to melt. It would make a mess on the carpet.",
      "Fan sales are up. Your IQ is down."
    ],
    COLD: [
      "Chilly today. Maybe wear layers? Just a wild thought.",
      "It's cold. I'm sure you'll complain about it all day.",
      "I hope you like shivering. It's your new hobby.",
      "A bit nippy. Try not to cry about it.",
      "Cooler than being you, at least."
    ],
    FREEZING: [
      "It's officially 'Why do I live here' degrees outside.",
      "Your face is going to hurt. Enjoy that.",
      "Elsa called. She wants her weather back.",
      "Absolute zero interest in your comfort right now.",
      "It's freezing. Maybe set your PC on fire for warmth?"
    ],
    RAIN: [
      "Water falling from the sky. Fascinating.",
      "Oh no, rain. Whatever will we do? Get wet, probably.",
      "Moist. Damp. Soggy. Just like your personality.",
      "Nature is spitting on us. Polite.",
      "Great hair day incoming. Sike."
    ],
    STORM: [
      "Loud noises and flashing lights. Try not to be scared.",
      "The sky is throwing a tantrum. Relatable.",
      "Zeus is angry. Probably at your search history.",
      "Storm brewing. Drama queen weather.",
      "It's storming. Perfect excuse to cancel plans you didn't have."
    ],
    SNOW: [
      "Look, snowflakes. Just like on Twitter.",
      "It's snowing. Traffic is going to be stupid.",
      "White stuff everywhere. Don't eat it.",
      "Winter wonderland? More like frozen wasteland.",
      "Do you want to build a snowman? No, me neither."
    ],
    NICE: [
      "It's... fine. Just fine. Are you happy now?",
      "Oh wow, nice weather. Suspicious.",
      "Perfect weather. Too bad you'll stay inside gaming.",
      "It's sunny. Don't look directly at it, genius.",
      "Goldilocks weather. Not too hot, not too cold. Boring."
    ],
    DEFAULT: [
      "Weather exists. Congratulations.",
      "Current status: happening.",
      "Look out the window if you want more info.",
      "I'm bored giving you this data.",
      "It is what it is."
    ]
  },
  BABY: {
    EXTREME_HEAT: [
      "Oh wow! Mr. Sun is SUPER ANGRY today! ☀️🔥",
      "Ouchie! It's too hot for the little babies! Stay inside!",
      "Hot hot hot! Don't touch the sidewalk! 🚫🦶",
      "Melty welty! You need lots of juice boxes today! 🧃",
      "The sky is a big fire ball! Scary!"
    ],
    HEAT: [
      "It's a warm hug from the sky! Maybe too warm! 🥵",
      "Sweaty Betty! Time for a cool bath! 🛁",
      "Mr. Sun is smiling very big today!",
      "Phew! Sticky weather! Yuckie!",
      "Warm fuzzies outside! Wear your hat!"
    ],
    COLD: [
      "Brrr! Chilly willy! Put on your jacket! 🧥",
      "Nippy nippy! Don't forget your mittens!",
      "Cold nose alert! Boop! 🐽",
      "It's sweater weather! Cozy wozy!",
      "A little bit cold! Snuggle time!"
    ],
    FREEZING: [
      "Ice pop weather! You will turn into a popsicle! 🍦",
      "Super duper cold! Danger zone! ❄️",
      "Teeth chattering time! C-c-c-cold!",
      "Jack Frost is biting your toes! Ouch!",
      "Stay in your blankie fort! It's safe there!"
    ],
    RAIN: [
      "Splish splash! The sky is making pee-pee! ☔",
      "Raindrops keep falling on my head! Plip plop!",
      "Puddle jumping time! Wear your booties! 👢",
      "Wet wet wet! Ducky likes it! 🦆",
      "Crying clouds! Don't be sad clouds!"
    ],
    STORM: [
      "Boom boom! Sky drums are playing loud! 🥁",
      "Flashy lights! Scary but cool! ⚡",
      "Rumble tumble! Hide under the bed!",
      "Big stormy wormy! Stay safe!",
      "Uh oh! Nature is having a tantrum!"
    ],
    SNOW: [
      "Snowman time! Do you want a carrot nose? 🥕",
      "Fluffy white stuff! It's cold magic! ✨",
      "Sledding time! Zoom zoom!",
      "Everything is a marshmallow now!",
      "Cold sprinkles everywhere! Yummy?"
    ],
    NICE: [
      "Yay! Happy weather! Good job sky! ⭐",
      "Perfect day for the park! Go play!",
      "Sunny bunny! Everything is nice!",
      "Smiley face weather! 😊",
      "Gold star for the weather today!"
    ],
    DEFAULT: [
      "Just a normal day! Doo doo doo!",
      "Weather is being silly!",
      "Look outside! What do you see?",
      "Clouds go floaty float!",
      "Hi friend! Weather is okay!"
    ]
  },
  DOOMER: {
    EXTREME_HEAT: [
      "The planet is boiling. We deserve this.",
      "This is the end. Slowly cooking in our own mistakes.",
      "The sun is expanding. Soon it will consume us all.",
      "Record highs. The point of no return passed years ago.",
      "Sweat is just the body crying about the apocalypse."
    ],
    HEAT: [
      "Uncomfortably warm. Just like the slow death of the universe.",
      "Another hot day in the dystopia.",
      "The ice caps are melting while you read this.",
      "Heat rises. So does entropy.",
      "It's warm. A preview of where we are going."
    ],
    COLD: [
      "The universe tends towards absolute zero. We are getting closer.",
      "Cold. Dark. Empty. Like existence.",
      "Shivering is just a biological spasm delaying death.",
      "A cold void. That's all there is.",
      "Winter is here. It will never truly leave."
    ],
    FREEZING: [
      "Life cannot sustain this. Why do we try?",
      "Frozen wasteland. A fitting tomb.",
      "The cold bite of reality.",
      "Numbness is a gift. Embrace it.",
      "Everything stops eventually. Even the temperature."
    ],
    RAIN: [
      "Acid rain, microplastics... it's all poison anyway.",
      "The sky weeps for what we have done.",
      "Grey skies. Grey life. Grey future.",
      "Drowning slowly. Just like society.",
      "It rains on the just and unjust alike. Mostly the just."
    ],
    STORM: [
      "Destruction is the only constant.",
      "Let the storm wash it all away. It needs to happen.",
      "Chaos reigns. Order was a lie.",
      "Nature's wrath. We have it coming.",
      "The thunder drowns out the thoughts. A small mercy."
    ],
    SNOW: [
      "A white blanket to hide the rot beneath.",
      "Cold ash falling from the sky.",
      "Silence falls. Soon it will be eternal.",
      "Beautiful, deadly, temporary.",
      "The world creates ice just to melt it. Futile."
    ],
    NICE: [
      "A fleeting moment of comfort before the inevitable collapse.",
      "Don't get used to it. It won't last.",
      "False hope. The cruelest joke of all.",
      "The calm before the end.",
      "Enjoy the sun. It will explode one day."
    ],
    DEFAULT: [
      "Time passes. Nothing changes.",
      "Another day closer to the void.",
      "Weather is irrelevant.",
      "Does it matter?",
      "Existence continues, unfortunately."
    ]
  },
  GLAZER: {
    EXTREME_HEAT: [
      "You're hotter than the weather, boss! 🔥",
      "The sun is shining almost as bright as you!",
      "It's roasting, but you're still looking fresh!",
      "Sweating? No, that's just your glow!",
      "Hot day for a hot legend! Crushing it!"
    ],
    HEAT: [
      "Warm vibes only for the main character!",
      "Summer energy! You look great in this light!",
      "Temperature rising, just like your stock!",
      "A beautiful warm day for a beautiful genius!",
      "Sun's out, you're out! Perfect combo!"
    ],
    COLD: [
      "Cool and crisp, just like your style! ❄️",
      "It's chilly, but your fit is fire!",
      "Ice cold weather for the coolest person I know!",
      "You make this cold look good!",
      "Stay frosty, King! You got this!"
    ],
    FREEZING: [
      "Frozen weather? You're still melting hearts!",
      "Sub-zero temps can't stop your grind!",
      "It's freezing but you're bringing the heat!",
      "Ice age? No problem for a legend like you!",
      "Cold hands, warm heart, massive wins!"
    ],
    RAIN: [
      "Even the rain can't dampen your immaculate vibes!",
      "Making a splash! You look great wet or dry!",
      "Liquid sunshine! Hydration for the nation!",
      "Rain drop, drop top, you never stop!",
      "The sky is showering you with blessings!"
    ],
    STORM: [
      "You are the storm! Powerful energy!",
      "Thunderous applause for your existence!",
      "Electric vibes! You're shocking the world!",
      "Lightning strikes, but you strike harder!",
      "Chaos outside, pure focus inside! Beast mode!"
    ],
    SNOW: [
      "Ice in your veins! Pure clutch gene!",
      "Winter soldier mode activated! You look tough!",
      "Snow day! The world is a canvas for your art!",
      "Fresh powder for a fresh icon!",
      "Cool as ice! Stay winning!"
    ],
    NICE: [
      "Perfect weather for a perfect human!",
      "10/10 day, just like you!",
      "God tier weather dropped just for you!",
      "Blue skies reflecting your blue ocean strategy!",
      "Immaculate vibes detected! You're winning today!"
    ],
    DEFAULT: [
      "Whatever the weather, you're killing it!",
      "Looking good, feeling good!",
      "Another day to dominate!",
      "You are the weather! You set the atmosphere!",
      "Big W energy today!"
    ]
  },
  PROFESSIONAL: {
    EXTREME_HEAT: [
      "Extreme thermal readings detected. Heat advisory in effect.",
      "Temperatures exceed safety thresholds. Hydration recommended.",
      "Solar radiation levels critical. Limit exposure.",
      "Environmental hazard: Excessive Heat. Proceed with caution.",
      "Meteorological Alert: Surface temperatures above nominal."
    ],
    HEAT: [
      "Temperatures are above seasonal averages.",
      "Warm front detected. Ambient temperature rising.",
      "Conditions are warm. standard cooling protocols advised.",
      "Thermal index indicates warm weather.",
      "It is currently warm."
    ],
    COLD: [
      "Sub-optimal thermal readings. Layering recommended.",
      "Temperatures falling below median.",
      "Cool conditions prevailing.",
      "Atmospheric temperature is low.",
      "It is currently cold."
    ],
    FREEZING: [
      "Freezing point reached. Ice formation likely.",
      "Hazardous low temperatures. Thermal protection required.",
      "Cryogenic conditions approaching.",
      "Frost warning active.",
      "Temperature is critical."
    ],
    RAIN: [
      "Precipitation occurring. Visibility may be reduced.",
      "Liquid water falling. Umbrella suggested.",
      "Rainfall detected. Surface traction compromised.",
      "Humidity 100%. Active precipitation.",
      "It is raining."
    ],
    STORM: [
      "Severe weather alert. Electrical discharge detected.",
      "Barometric pressure dropping rapidly. Storm imminent.",
      "Thunderstorm activity in sector.",
      "High wind and rain events occurring.",
      "Turbulent atmospheric conditions."
    ],
    SNOW: [
      "Solid precipitation falling. Accumulation expected.",
      "Snowfall detected. Travel advisory.",
      "Crystalline water structure formation active.",
      "Winter conditions prevailing.",
      "It is snowing."
    ],
    NICE: [
      "Meteorological conditions are within nominal parameters.",
      "Optimal atmospheric state achieved.",
      "Visibility good. Temperature nominal.",
      "Conditions favorable for outdoor activity.",
      "Weather is standard."
    ],
    DEFAULT: [
      "Sensors active. Collecting data.",
      "Atmosphere stable.",
      "Reading current metrics.",
      "System nominal.",
      "Weather data updated."
    ]
  }
};

export default function WeatherTerminal() {
  // --- STATE ---
  const [step, setStep] = useState<'SEARCH' | 'RESULT'>('SEARCH');
  
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingGeo, setIsSearchingGeo] = useState(false);
  
  const [selectedGeo, setSelectedGeo] = useState<GeocodingResult | null>(null);
  const [selectedMode, setSelectedMode] = useState<PersonalityMode>('HOSTILE');
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [commentary, setCommentary] = useState<string>('');
  const [error, setError] = useState('');

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    // Pick random personality
    const randomPersonality = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
    executeFetch(loc, randomPersonality.id);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("GEOLOCATION NOT SUPPORTED BY DEVICE");
      return;
    }
    setLoading(true); // Temporarily show loading in input if desired, or just wait
    setIsSearchingGeo(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc: GeocodingResult = {
          id: 0,
          name: "LOCAL SECTOR", // Sci-fi name for current location
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
        setError("UNABLE TO TRIANGULATE POSITION");
        setIsSearchingGeo(false);
        setLoading(false);
      }
    );
  };

  // --- LOGIC: WEATHER & PERSONALITY ---
  const getRandomLine = (mode: PersonalityMode, category: keyof typeof COMMENTARY_DB['HOSTILE']) => {
    const lines = COMMENTARY_DB[mode][category];
    return lines[Math.floor(Math.random() * lines.length)];
  };

  const generateCommentary = (w: WeatherData, mode: PersonalityMode) => {
    // Determine Category
    let category: keyof typeof COMMENTARY_DB['HOSTILE'] = 'DEFAULT';

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
            `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day`
        );
        const wData = await weatherRes.json();
        const current = wData.current;

        let conditionText = "CLEAR";
        if (current.weather_code > 2) conditionText = "CLOUDY";
        if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(current.weather_code)) conditionText = "RAINING";
        if (current.weather_code >= 95) conditionText = "STORM";
        if ([71, 73, 75, 85, 86].includes(current.weather_code)) conditionText = "SNOW";

        const newWeather: WeatherData = {
            temp: current.temperature_2m,
            condition: conditionText,
            windSpeed: current.wind_speed_10m,
            humidity: current.relative_humidity_2m,
            location: `${loc.name}, ${loc.country || ''}`,
            code: current.weather_code,
            isDay: current.is_day
        };

        setWeather(newWeather);
        setCommentary(generateCommentary(newWeather, mode));
    } catch (e) {
        setError("SYSTEM FAILURE. UNABLE TO RETRIEVE ATMOSPHERIC DATA.");
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
  const ActiveIcon = activePersonality.icon;

  return (
    <div className="max-w-5xl mx-auto min-h-[600px] flex flex-col" ref={containerRef}>
      
      {/* --- STEP 1: SEARCH --- */}
      {step === 'SEARCH' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-2xl mx-auto w-full px-4 md:px-0">
             
             {/* WARNING CARD */}
             <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 mb-8 flex gap-5 items-start shadow-2xl">
                 <div className="p-3 bg-red-500/10 rounded-2xl shrink-0">
                    <Cpu size={24} className="text-red-500" />
                 </div>
                 <div>
                     <h3 className="text-white font-bold text-lg mb-1">Personality Warning</h3>
                     <p className="text-zinc-400 text-sm leading-relaxed">
                         The weather module's personality function is currently faulty and it may say some obscene and rude things.
                     </p>
                 </div>
             </div>

             {/* SEARCH WIDGET */}
             <div className="bg-zinc-950 border border-zinc-800 rounded-[2rem] p-2 shadow-2xl relative z-20">
                <div className="relative flex items-center">
                    <div className="absolute left-5 text-zinc-500 pointer-events-none z-10">
                        {isSearchingGeo ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} />}
                    </div>
                    
                    <input 
                        type="text" 
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Search location..."
                        className="w-full bg-zinc-900/50 rounded-3xl p-6 pl-14 pr-16 text-lg md:text-xl text-white outline-none focus:bg-zinc-900 transition-colors placeholder:text-zinc-600 font-medium appearance-none touch-manipulation"
                        autoComplete="off"
                        autoFocus
                        style={{ fontSize: '16px' }} // Force 16px on mobile to prevent zoom
                    />

                    {/* CURRENT LOCATION BUTTON */}
                    <button 
                        onClick={handleCurrentLocation}
                        className="absolute right-2 p-4 bg-zinc-800 hover:bg-[#DFFF00] hover:text-black text-zinc-400 rounded-2xl transition-colors group"
                        title="Use Current Location"
                    >
                        <Crosshair size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                    </button>
                </div>

                {/* SUGGESTIONS */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-zinc-900 border border-zinc-800 rounded-3xl shadow-xl mt-2 overflow-hidden animate-in fade-in slide-in-from-top-2 p-2 z-50">
                        {suggestions.map((loc) => (
                            <button
                                key={loc.id}
                                onClick={() => handleLocationSelect(loc)}
                                className="w-full text-left p-4 hover:bg-zinc-800 rounded-2xl flex items-center justify-between group transition-colors"
                            >
                                <div className="flex flex-col">
                                    <span className="font-bold text-white group-hover:text-[#DFFF00] transition-colors">{loc.name}</span>
                                    <span className="text-xs text-zinc-500 font-medium uppercase">
                                        {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}
                                    </span>
                                </div>
                                <Navigation size={16} className="text-zinc-600 group-hover:text-[#DFFF00] -rotate-45" />
                            </button>
                        ))}
                    </div>
                )}
             </div>
          </div>
      )}

      {/* --- STEP 2: RESULT DASHBOARD --- */}
      {step === 'RESULT' && (
          <div className="animate-in zoom-in-95 duration-500">
             
             {loading ? (
                 <div className="flex flex-col items-center justify-center py-32">
                     <div className="relative">
                        <div className="absolute inset-0 bg-[#DFFF00] blur-xl opacity-20 animate-pulse" />
                        <Loader2 size={64} className="animate-spin text-[#DFFF00] relative z-10" />
                     </div>
                     <div className="mt-8 text-zinc-500 font-mono text-xs uppercase tracking-widest">
                         Calibrating Sensors...
                     </div>
                 </div>
             ) : weather ? (
                 <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    
                    {/* 1. LOCATION & DATE */}
                    <div className="col-span-full flex flex-col md:flex-row justify-between items-start md:items-end p-2 mb-2">
                        <div>
                            <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">
                                <MapPin size={12} /> Target Sector
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">{weather.location}</h2>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-600 text-sm font-mono bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
                            <Calendar size={14} />
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </div>
                    </div>

                    {/* 2. MAIN TEMP CARD */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-2 aspect-square md:aspect-auto md:h-[400px] bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-50 group-hover:scale-110 transition-transform duration-700">
                             {/* Dynamic Weather Glow */}
                             {weather.condition === 'CLEAR' && <div className="w-32 h-32 rounded-full bg-orange-500 blur-3xl opacity-50" />}
                             {weather.condition === 'RAINING' && <CloudRain size={120} className="text-blue-500" />}
                             {weather.condition === 'SNOW' && <CloudSnow size={120} className="text-white" />}
                             {weather.condition === 'STORM' && <CloudLightning size={120} className="text-purple-500" />}
                             {weather.condition === 'CLOUDY' && <div className="w-32 h-32 rounded-full bg-zinc-500 blur-3xl opacity-50" />}
                             {!['CLEAR', 'RAINING', 'SNOW', 'STORM', 'CLOUDY'].includes(weather.condition) && <Sun size={120} className="text-[#DFFF00]" />}
                        </div>
                        
                        <div className="h-full flex flex-col justify-between relative z-10">
                            <div className="flex justify-between items-start">
                                <span className="bg-black/40 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full border border-white/10">
                                    LIVE TELEMETRY
                                </span>
                            </div>
                            
                            <div>
                                <div className="text-7xl md:text-9xl font-black text-white tracking-tighter">
                                    {Math.round(weather.temp)}°
                                </div>
                                <div className="text-2xl font-medium text-zinc-400 mt-2 uppercase tracking-widest">
                                    {weather.condition}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. COMMENTARY CARD */}
                    <div className={`col-span-1 md:col-span-1 lg:col-span-2 min-h-[400px] rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col justify-between border ${activePersonality.bg} ${activePersonality.border} ${activePersonality.shadow} shadow-2xl`}>
                        
                        {/* Abstract Tech Wave Animation */}
                        <div className="absolute right-8 top-8 opacity-20 flex gap-1 h-8 items-center">
                             {[...Array(8)].map((_, i) => (
                                 <div 
                                    key={i} 
                                    className={`w-1 rounded-full ${activePersonality.color.replace('text-', 'bg-')} animate-pulse`} 
                                    style={{ 
                                        height: `${Math.random() * 100}%`,
                                        animationDuration: '1s',
                                        animationDelay: `${i * 100}ms` 
                                    }} 
                                 />
                             ))}
                        </div>

                        <div className="relative z-10">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur text-[10px] font-bold uppercase tracking-widest ${activePersonality.color}`}>
                                <Radio size={12} className="animate-pulse" />
                                {activePersonality.label}
                            </div>
                        </div>

                        <blockquote className="relative z-10 text-2xl md:text-3xl font-black text-white leading-tight uppercase my-4">
                            "<Typewriter text={commentary} speed={40} />"
                        </blockquote>

                        <div className="relative z-10">
                            <div className="h-1 w-full bg-black/20 rounded-full overflow-hidden">
                                <div className={`h-full w-2/3 ${activePersonality.color.replace('text-', 'bg-')} opacity-50`} />
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] font-mono opacity-60">
                                <span>TOXICITY_LEVEL</span>
                                <span>CRITICAL</span>
                            </div>
                        </div>
                    </div>

                    {/* 4. STAT GRID */}
                    
                    {/* WIND */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-6 flex flex-col justify-between aspect-square hover:bg-zinc-900 transition-colors">
                        <div className="flex justify-between text-zinc-500">
                            <Wind size={24} />
                            <span className="text-xs font-bold">WIND</span>
                        </div>
                        <div>
                            <span className="text-3xl font-black text-white">{weather.windSpeed}</span>
                            <span className="text-sm text-zinc-500 ml-1">km/h</span>
                        </div>
                    </div>

                    {/* HUMIDITY */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-6 flex flex-col justify-between aspect-square hover:bg-zinc-900 transition-colors">
                         <div className="flex justify-between text-zinc-500">
                            <Droplets size={24} />
                            <span className="text-xs font-bold">HUMIDITY</span>
                        </div>
                        <div>
                            <span className="text-3xl font-black text-white">{weather.humidity}</span>
                            <span className="text-sm text-zinc-500 ml-1">%</span>
                        </div>
                    </div>

                    {/* INDEX */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-6 flex flex-col justify-between aspect-square hover:bg-zinc-900 transition-colors">
                         <div className="flex justify-between text-zinc-500">
                            <Gauge size={24} />
                            <span className="text-xs font-bold">INDEX</span>
                        </div>
                        <div>
                            <span className="text-3xl font-black text-white">UV</span>
                            <span className="text-sm text-zinc-500 ml-1">LOW</span>
                        </div>
                    </div>

                    {/* RESET ACTION */}
                    <button 
                        onClick={reset}
                        className="bg-[#DFFF00] hover:bg-white rounded-[2rem] p-6 flex flex-col justify-center items-center gap-2 aspect-square transition-colors group cursor-pointer"
                    >
                        <RefreshCcw size={32} className="text-black group-hover:rotate-180 transition-transform duration-500" />
                        <span className="text-black font-black text-xs uppercase tracking-widest">RESET</span>
                    </button>

                 </div>
             ) : null}
          </div>
      )}
    </div>
  );
}