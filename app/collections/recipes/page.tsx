'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChefHat, Utensils, Coffee, Cake, Cookie, 
  Croissant, RefreshCw, Clock, Flame, Globe, 
  PlayCircle, ExternalLink, ListChecks, Scale, 
  Search, ScanLine, ArrowLeft, ArrowRight, CheckCircle2,
  Leaf, Nut, Milk, Wheat, Info, Beef, X, Zap
} from 'lucide-react';
import BackButton from '../../components/BackButton';
import { getRandomRecipe, searchRecipesByIngredients, getRecipeById, Recipe, RecipeSummary } from './actions';

// --- UTILITY: Measurement Converter ---
const convertToMetric = (measure: string): string => {
  const regex = /(\d+(?:\s+\d+\/\d+)?|\d+\/\d+|\d+(?:\.\d+)?)\s*(oz|ounce|lb|pound|cup|tbsp|tsp|tablespoon|teaspoon)(s?)\b/gi;

  const fractionToDecimal = (str: string) => {
    if (str.includes('/')) {
      const [num, denom] = str.split('/').map(Number);
      return num / denom;
    }
    return Number(str);
  };

  const parseNumber = (str: string) => {
    const parts = str.trim().split(/\s+/);
    let total = 0;
    for (const part of parts) {
      total += fractionToDecimal(part);
    }
    return total;
  };

  return measure.replace(regex, (match, amountStr, unit) => {
    const amount = parseNumber(amountStr);
    const u = unit.toLowerCase();

    if (u.startsWith('oz') || u.startsWith('ounce')) return `${Math.round(amount * 28.35)}g`;
    if (u.startsWith('lb') || u.startsWith('pound')) return `${Math.round(amount * 453.6)}g`;
    if (u.startsWith('cup')) return `${Math.round(amount * 236.6)}ml`;
    if (u.startsWith('tbsp') || u.startsWith('tablespoon')) return `${Math.round(amount * 15)}ml`;
    if (u.startsWith('tsp') || u.startsWith('teaspoon')) return `${Math.round(amount * 5)}ml`;
    
    return match; 
  });
};

// --- UTILITY: Detect Dietary Attributes ---
interface Attribute {
  label: string;
  icon: React.ReactNode;
  color: string;
}

const detectAttributes = (recipe: Recipe): Attribute[] => {
  const attrs: Attribute[] = [];
  const ingredients = recipe.ingredients.map(i => i.item.toLowerCase()).join(' ');
  const category = recipe.category.toLowerCase();
  
  if (category === 'vegan') {
    attrs.push({ label: 'Vegan', icon: <Leaf size={12} />, color: 'bg-green-500/20 text-green-400 border-green-500/50' });
  } else if (category === 'vegetarian') {
    attrs.push({ label: 'Vegetarian', icon: <Leaf size={12} />, color: 'bg-green-500/20 text-green-400 border-green-500/50' });
  }

  if (ingredients.match(/nut|almond|cashew|pecan|walnut|pistachio/)) {
    attrs.push({ label: 'Contains Nuts', icon: <Nut size={12} />, color: 'bg-amber-600/20 text-amber-400 border-amber-600/50' });
  }

  if (ingredients.match(/milk|cream|cheese|butter|yogurt/)) {
    attrs.push({ label: 'Dairy', icon: <Milk size={12} />, color: 'bg-blue-200/20 text-blue-200 border-blue-200/50' });
  }

  if (ingredients.match(/beef|steak|pork|bacon|ham|lamb|chicken|duck/)) {
    attrs.push({ label: 'Non-Veg', icon: <Beef size={12} />, color: 'bg-red-500/20 text-red-400 border-red-500/50' });
  }

  if (ingredients.match(/flour|bread|pasta|wheat/)) {
    attrs.push({ label: 'Gluten', icon: <Wheat size={12} />, color: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/50' });
  }

  return attrs;
};

// --- UTILITY: Generate Smart Description ---
const generateDescription = (recipe: Recipe): string => {
  const topIngredients = recipe.ingredients
    .slice(0, 4) 
    .map(i => i.item)
    .join(', ');

  return `A classic ${recipe.area} ${recipe.category} dish prepared with ${topIngredients} and other fresh ingredients.`;
};

// --- COMPONENT: Tutorial Modal ---
const TutorialModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 p-6 opacity-20">
        <ChefHat size={120} className="text-zinc-700" />
      </div>

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#DFFF00]/10 border border-[#DFFF00]/30 rounded-full text-[#DFFF00] text-[10px] font-bold uppercase tracking-widest mb-6">
          <Zap size={12} /> System Onboarding
        </div>

        <h2 className="text-3xl font-black uppercase text-white mb-2">Welcome, Chef.</h2>
        <p className="text-zinc-400 font-mono text-sm mb-8">
          The Recipe Database provides two protocols for meal acquisition.
        </p>

        <div className="space-y-6 mb-8">
          
          {/* Step 1 */}
          <div className="flex gap-4">
             <div className="flex-shrink-0 w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700 text-[#DFFF00]">
                <Utensils size={24} />
             </div>
             <div>
                <h3 className="text-white font-bold uppercase tracking-wide text-sm mb-1">Random Generation</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">
                  Feeling adventurous? Select a category (e.g., Breakfast, Dinner) to instantly retrieve a complete meal schematic.
                </p>
             </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
             <div className="flex-shrink-0 w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700 text-[#DFFF00]">
                <ScanLine size={24} />
             </div>
             <div>
                <h3 className="text-white font-bold uppercase tracking-wide text-sm mb-1">Inventory Scanner</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">
                  Have ingredients? Switch to Scanner mode and input materials like <span className="text-zinc-300">"Chicken, Rice, Garlic"</span>. The system will find the best matches.
                </p>
             </div>
          </div>

        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-[#DFFF00] text-black font-black uppercase tracking-widest rounded-xl hover:bg-[#ccee00] transition-colors flex items-center justify-center gap-2"
        >
          Initialize Systems <ArrowRight size={18} />
        </button>
      </div>
    </div>
  </div>
);

export default function RecipesPage() {
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [useMetric, setUseMetric] = useState(false); 
  
  const [searchMode, setSearchMode] = useState(false);
  const [ingredientQuery, setIngredientQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RecipeSummary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // --- TUTORIAL STATE ---
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Check Local Storage on Mount
    const hasSeenTutorial = localStorage.getItem('zinc_recipe_tutorial_seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('zinc_recipe_tutorial_seen', 'true');
    setShowTutorial(false);
  };

  const categories = [
    { id: 'Breakfast', icon: <Coffee size={18} />, color: 'hover:bg-amber-500/20 hover:border-amber-500/50' },
    { id: 'Lunch', icon: <Utensils size={18} />, color: 'hover:bg-orange-500/20 hover:border-orange-500/50' },
    { id: 'Dinner', icon: <Flame size={18} />, color: 'hover:bg-red-500/20 hover:border-red-500/50' },
    { id: 'Desserts', icon: <Cake size={18} />, color: 'hover:bg-pink-500/20 hover:border-pink-500/50' },
    { id: 'Treats', icon: <Cookie size={18} />, color: 'hover:bg-purple-500/20 hover:border-purple-500/50' },
    { id: 'Bake', icon: <Croissant size={18} />, color: 'hover:bg-yellow-500/20 hover:border-yellow-500/50' },
  ];

  const handleRandomFetch = async (category: string) => {
    setLoading(true);
    setActiveCategory(category);
    setRecipe(null);
    setUseMetric(false);
    setSearchResults([]); 
    
    try {
      const data = await getRandomRecipe(category);
      setRecipe(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleIngredientSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredientQuery.trim()) return;

    setLoading(true);
    setRecipe(null);
    setSearchResults([]);
    setUseMetric(false);

    try {
      const results = await searchRecipesByIngredients(ingredientQuery);
      setSearchResults(results);
      
      if (results.length > 0) {
        setCurrentIndex(0);
        const firstRecipe = await getRecipeById(results[0].id);
        setRecipe(firstRecipe);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const navigateResults = async (direction: 'next' | 'prev') => {
    if (searchResults.length === 0) return;

    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= searchResults.length) newIndex = 0;
    if (newIndex < 0) newIndex = searchResults.length - 1;

    setCurrentIndex(newIndex);
    setLoading(true);
    try {
      const nextRecipe = await getRecipeById(searchResults[newIndex].id);
      setRecipe(nextRecipe);
    } finally {
      setLoading(false);
    }
  };

  const currentMatch = searchResults[currentIndex];
  
  const description = recipe ? generateDescription(recipe) : '';
  const detectedAttrs = recipe ? detectAttributes(recipe) : [];

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20 relative">
      
      {/* TUTORIAL MODAL */}
      {showTutorial && <TutorialModal onClose={handleCloseTutorial} />}

      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-5" />
         <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-zinc-950" />
      </div>

      <BackButton href="/collections" label="COLLECTIONS HUB" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pt-32 md:pt-24">
        
        {/* HEADER */}
        <div className="flex flex-col items-center text-center mb-10 md:mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="p-4 bg-zinc-900/80 rounded-full border border-zinc-800 mb-6 shadow-2xl relative z-20">
              <ChefHat size={40} className="md:w-12 md:h-12 text-[#DFFF00]" />
           </div>
           <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4">
             {searchMode ? 'Ingredient' : 'Random'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DFFF00] to-green-500">{searchMode ? 'Scanner' : 'Recipes'}</span>
           </h1>
           
           <div className="flex items-center gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-full">
              <button 
                onClick={() => { setSearchMode(false); setRecipe(null); setSearchResults([]); }}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${!searchMode ? 'bg-[#DFFF00] text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Categories
              </button>
              <button 
                onClick={() => { setSearchMode(true); setRecipe(null); }}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${searchMode ? 'bg-[#DFFF00] text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Inventory Scan
              </button>
           </div>
        </div>

        {/* CONTROLS */}
        <div className="mb-12 md:mb-16 max-w-4xl mx-auto min-h-[80px]">
          {!searchMode ? (
            <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleRandomFetch(cat.id)}
                  disabled={loading}
                  className={`
                    group relative flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-3 px-4 py-4 md:px-6 rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm
                    transition-all duration-300
                    ${activeCategory === cat.id ? 'border-[#DFFF00] bg-zinc-800' : 'text-zinc-400'}
                    ${cat.color}
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <span className={`transition-colors ${activeCategory === cat.id ? 'text-[#DFFF00]' : 'group-hover:text-white'}`}>
                    {cat.icon}
                  </span>
                  <span className="font-bold uppercase tracking-widest text-xs md:text-sm">
                    {cat.id}
                  </span>
                  {loading && activeCategory === cat.id && (
                    <RefreshCw className="animate-spin md:ml-2 text-[#DFFF00]" size={14} />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleIngredientSearch} className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="relative flex-1">
                 <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <ScanLine className="text-zinc-500" size={20} />
                 </div>
                 <input 
                   type="text" 
                   value={ingredientQuery}
                   onChange={(e) => setIngredientQuery(e.target.value)}
                   placeholder="Enter ingredients (e.g. Chicken, Garlic)"
                   className="w-full h-14 pl-12 pr-4 bg-zinc-900/80 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#DFFF00] focus:ring-1 focus:ring-[#DFFF00] transition-all font-mono text-sm md:text-base"
                 />
               </div>
               <button 
                 type="submit"
                 disabled={loading || !ingredientQuery}
                 className="h-14 px-8 bg-[#DFFF00] text-black font-bold uppercase tracking-widest rounded-xl hover:bg-[#ccee00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
               >
                 {loading ? <RefreshCw className="animate-spin" size={20} /> : <Search size={20} />}
                 <span>Analyze</span>
               </button>
            </form>
          )}
        </div>

        {/* RECIPE DISPLAY */}
        {recipe ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            
            {searchMode && searchResults.length > 0 && (
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/80 border border-zinc-800 rounded-t-2xl p-4 border-b-0">
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                     <button 
                       onClick={() => navigateResults('prev')}
                       className="flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-zinc-800 px-4 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wider"
                     >
                       <ArrowLeft size={16} /> Prev
                     </button>
                     <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest md:hidden">
                        {currentIndex + 1} / {searchResults.length}
                     </span>
                  </div>

                  <div className="flex items-center gap-3">
                     <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest hidden md:inline">
                        Result {currentIndex + 1} of {searchResults.length}
                     </span>
                     
                     {currentMatch && currentMatch.matchCount !== undefined && (
                        <div className={`
                            flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider
                            ${currentMatch.matchCount === currentMatch.totalSearchTerms 
                              ? 'bg-[#DFFF00]/10 border-[#DFFF00] text-[#DFFF00]' 
                              : 'bg-zinc-800 border-zinc-700 text-zinc-300'}
                        `}>
                            <CheckCircle2 size={12} />
                            Matches {currentMatch.matchCount}/{currentMatch.totalSearchTerms}
                        </div>
                     )}
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <button 
                        onClick={() => navigateResults('next')}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-zinc-800 px-4 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wider"
                    >
                        Next <ArrowRight size={16} />
                    </button>
                  </div>
              </div>
            )}

            <div className={`bg-zinc-900/60 border border-zinc-800 overflow-hidden backdrop-blur-xl shadow-2xl ${searchMode && searchResults.length > 0 ? 'rounded-b-[2rem] rounded-tr-[2rem] border-t-0' : 'rounded-[2rem]'}`}>
              
              {/* IMAGE HEADER */}
              <div className="relative h-64 md:h-[450px] w-full overflow-hidden">
                 <img 
                   src={recipe.thumbnail} 
                   alt={recipe.name}
                   className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
                 
                 <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full max-w-5xl">
                    <div className="flex flex-wrap gap-2 md:gap-3 mb-4">
                       <span className="bg-[#DFFF00] text-black px-2 py-1 md:px-3 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1 md:gap-2">
                         <Globe size={10} className="md:w-3 md:h-3" /> {recipe.area}
                       </span>
                       <span className="bg-zinc-800 text-white border border-zinc-700 px-2 py-1 md:px-3 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1 md:gap-2">
                         <Utensils size={10} className="md:w-3 md:h-3" /> {recipe.category}
                       </span>
                    </div>

                    <h2 className="text-3xl md:text-6xl font-black uppercase text-white leading-none break-words mb-4">
                      {recipe.name}
                    </h2>

                    {/* DESCRIPTION & DIETARY ICONS */}
                    <div className="flex flex-col gap-4">
                        <p className="text-zinc-300 text-sm md:text-lg font-medium leading-relaxed max-w-2xl line-clamp-2 md:line-clamp-none">
                           {description}
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {detectedAttrs.map((attr, i) => (
                                <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] md:text-xs font-bold uppercase tracking-wider ${attr.color}`}>
                                    {attr.icon}
                                    {attr.label}
                                </div>
                            ))}
                            {recipe.tags.slice(0, 3).map((tag, i) => (
                                <div key={`tag-${i}`} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-800 text-zinc-300 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                                    <Info size={12} />
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </div>

                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                
                {/* INGREDIENTS */}
                <div className="md:col-span-4 bg-zinc-950/30 p-6 md:p-8 border-b md:border-b-0 md:border-r border-zinc-800/50">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg md:text-xl font-bold uppercase text-[#DFFF00] flex items-center gap-2">
                        <Clock size={18} className="md:w-5 md:h-5" /> Components
                      </h3>
                      <button 
                        onClick={() => setUseMetric(!useMetric)}
                        className={`
                          flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all
                          ${useMetric 
                             ? 'bg-[#DFFF00]/20 border-[#DFFF00] text-[#DFFF00]' 
                             : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}
                        `}
                      >
                         <Scale size={12} />
                         {useMetric ? 'Metric' : 'Original'}
                      </button>
                   </div>
                   <ul className="space-y-3 font-mono text-sm text-zinc-300">
                     {recipe.ingredients.map((ing, i) => (
                       <li key={i} className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                          <span className="mr-2">{ing.item}</span>
                          <span className={`text-right transition-all duration-500 ${useMetric ? 'text-[#DFFF00]' : 'text-zinc-500'}`}>
                             {useMetric ? convertToMetric(ing.measure) : ing.measure}
                          </span>
                       </li>
                     ))}
                   </ul>
                   <div className="mt-8 flex flex-col gap-3">
                      {recipe.youtube && (
                        <a href={recipe.youtube} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-red-600/20 border border-red-600/50 hover:bg-red-600 hover:text-white text-red-400 rounded-lg transition-all text-xs font-bold uppercase tracking-widest">
                           <PlayCircle size={16} /> Watch Tutorial
                        </a>
                      )}
                      {recipe.source && (
                        <a href={recipe.source} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-all text-xs font-bold uppercase tracking-widest">
                           <ExternalLink size={16} /> Source
                        </a>
                      )}
                   </div>
                </div>

                {/* INSTRUCTIONS */}
                <div className="md:col-span-8 p-6 md:p-12">
                   <div className="flex items-center gap-3 mb-6 md:mb-8">
                       <ListChecks className="text-[#DFFF00]" size={20} />
                       <h3 className="text-lg md:text-xl font-bold uppercase text-white">Execution Steps</h3>
                   </div>
                   <div className="space-y-6">
                      {recipe.instructions.map((step, index) => (
                        <div key={index} className="flex gap-4 group">
                           <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[#DFFF00] text-sm md:text-base font-mono font-bold group-hover:bg-[#DFFF00] group-hover:text-black transition-colors duration-300 shadow-lg">
                             {index + 1}
                           </div>
                           <div className="pt-1">
                               <p className="text-zinc-300 leading-relaxed text-sm md:text-lg group-hover:text-white transition-colors duration-300">
                                 {step}
                               </p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

              </div>
            </div>
          </div>
        ) : !loading && (
            <div className="text-center py-20 opacity-30">
                {searchMode ? <ScanLine size={48} className="mx-auto mb-4" /> : <Utensils size={48} className="mx-auto mb-4" />}
                <p className="uppercase tracking-widest text-sm md:text-base">
                  {searchMode ? 'Awaiting Inventory Input...' : 'System Idle. Select a category.'}
                </p>
                {searchMode && searchResults.length === 0 && ingredientQuery && (
                   <p className="text-red-400 text-xs mt-2 uppercase tracking-widest">No matches found for provided components.</p>
                )}
            </div>
        )}

      </div>
    </main>
  );
}