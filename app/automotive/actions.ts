'use server'

import { createClient } from '@/utils/supabase/client'; // CHANGED: Import the Cookie/SSR client

const WIKI_API = "https://en.wikipedia.org/w/api.php";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

// --- LEVEL 1: HTML PARSING HELPERS ---

const stripHtml = (html: string) => {
    if (!html) return "";
    let text = html;
    
    // Remove invisible structural elements
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    text = text.replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, ""); // Citations [1]
    
    // Replace formatting tags with clean spacers
    text = text.replace(/<br\s*\/?>/gi, ", ");
    text = text.replace(/<\/li>/gi, ", ");
    
    // Strip all other tags
    text = text.replace(/<[^>]+>/g, " ");
    
    // Decode Entities
    text = text.replace(/&nbsp;/g, " ");
    text = text.replace(/&#160;/g, " ");
    text = text.replace(/&ndash;/g, "-");
    text = text.replace(/&mdash;/g, "-");
    text = text.replace(/&amp;/g, "&");
    
    // Clean Whitespace
    return text.replace(/\s+/g, " ").trim();
};

// --- LEVEL 2: HTML TABLE SCRAPER ---

const parseAllInfoboxes = (fullHtml: string) => {
    const infoboxes: Record<string, string>[] = [];
    
    const tableMatches = fullHtml.split(/<table[^>]*class="[^"]*infobox[^"]*"[^>]*>/i);
    
    for (let i = 1; i < tableMatches.length; i++) {
        const tableHtml = tableMatches[i].split("</table>")[0]; 
        const rows = tableHtml.split("<tr");
        const boxData: Record<string, string> = {};

        for (const row of rows) {
            const labelMatch = row.match(/<th[^>]*>(.*?)<\/th>/i);
            const valueMatch = row.match(/<td[^>]*>(.*?)<\/td>/i);

            if (labelMatch && valueMatch) {
                const label = stripHtml(labelMatch[1]).toLowerCase();
                const value = stripHtml(valueMatch[1]);
                if (label && value) {
                    boxData[label] = value;
                }
            }
        }
        if (Object.keys(boxData).length > 0) {
            infoboxes.push(boxData);
        }
    }
    
    return infoboxes;
};

// --- LEVEL 3: FALLBACK TEXT SCANNER ---

const scanTextForSpecs = (fullText: string) => {
    const specs: any = {};
    const lowerText = fullText.toLowerCase();

    // 1. Acceleration (0-100 or 0-60)
    const accelMatch = fullText.match(/0\s*(?:[–-]|to)\s*(?:100\s*km\/?h|60\s*mph).*?(?:in|:)?\s*([0-9\.]+)\s*s/i) ||
                       fullText.match(/(?:sprints|accelerates).*?(?:100\s*km\/?h|60\s*mph).*?(?:in|:)?\s*([0-9\.]+)\s*s/i);
    
    if (accelMatch) specs.acceleration = `${accelMatch[1]}s`;

    // 2. Top Speed
    const speedMatch = fullText.match(/(?:top|maximum)\s*speed.*?(?:of|is)?\s*(\d{3,})\s*(?:km\/?h|mph)/i);
    if (speedMatch) {
        const window = fullText.substring(speedMatch.index!, speedMatch.index! + 20);
        specs.topSpeed = window.match(/\d+\s*(?:km\/?h|mph)/i)?.[0] || `${speedMatch[1]} km/h`;
    }

    // 3. Torque
    const torqueMatch = fullText.match(/(\d{3,}(?:,\d{3})?)\s*(?:N⋅m|lb⋅ft|Nm|lb-ft)/i);
    if (torqueMatch) {
         const window = fullText.substring(torqueMatch.index!, torqueMatch.index! + 15);
         specs.torque = window.match(/[\d,]+\s*(?:N⋅m|lb⋅ft|Nm|lb-ft)/i)?.[0] || torqueMatch[1];
    }

    // 4. Power (Fallback)
    const powerMatch = fullText.match(/output.*?(\d{3,4})\s*(?:hp|bhp|PS|kW)/i);
    if (powerMatch) {
         const window = fullText.substring(powerMatch.index!, powerMatch.index! + 20);
         specs.power = window.match(/[\d,]+\s*(?:hp|bhp|PS|kW)/i)?.[0] || `${powerMatch[1]} hp`;
    }

    return specs;
};

// --- LEVEL 4: CLASS LOGIC ---

const determineClass = (extractedClass: string, fullText: string) => {
    const combined = (extractedClass + " " + fullText).toLowerCase();
    
    if (combined.includes("hypercar")) return "Hypercar";
    if (combined.includes("supercar")) return "Supercar";
    if (combined.includes("muscle car")) return "Muscle Car";
    if (combined.includes("wrc") || combined.includes("rally car")) return "WRC / Rally";
    if (combined.includes("grand tourer") || combined.includes("GT")) return "Grand Tourer";
    if (combined.includes("suv") || combined.includes("crossover")) return "SUV";
    if (combined.includes("electric")) return "Electric";
    if (combined.includes("sedan") || combined.includes("saloon")) return "Sedan";
    if (combined.includes("hatchback")) return "Hatchback";
    if (combined.includes("concept")) return "Concept";

    return extractedClass || "Sports Car";
};

// --- MAIN ACTIONS ---

export async function searchWikipedia(query: string) {
    if (!query) return [];
    try {
        const res = await fetch(`${WIKI_API}?action=query&list=search&srsearch=${encodeURIComponent(query + " car")}&format=json&origin=*`);
        const data = await res.json();
        return data.query?.search?.map((item: any) => ({
            title: item.title,
            snippet: stripHtml(item.snippet)
        })) || [];
    } catch (e) {
        return [];
    }
}

export async function fetchCarDetails(title: string) {
  if (!title) return null;

  try {
    // 1. Parallel Fetch: Get HTML (for specs) AND Extract (for history)
    const [parseRes, queryRes] = await Promise.all([
        fetch(`${WIKI_API}?action=parse&format=json&page=${encodeURIComponent(title)}&prop=text&redirects=1&origin=*`),
        fetch(`${WIKI_API}?action=query&prop=extracts|pageimages&exintro=1&piprop=original&titles=${encodeURIComponent(title)}&format=json&origin=*`)
    ]);

    const parseData = await parseRes.json();
    const queryData = await queryRes.json();

    const fullHtml = parseData.parse?.text?.['*'] || "";
    
    // Get History and Image from Query API
    const pageId = Object.keys(queryData.query.pages)[0];
    const pageObj = queryData.query.pages[pageId];
    const cleanHistory = pageObj.extract ? stripHtml(pageObj.extract) : ""; 

    // 2. Extract Infoboxes
    const infoboxes = parseAllInfoboxes(fullHtml);
    
    // 3. Merge Logic (Newest -> Oldest)
    let mergedInfo: Record<string, string> = {};
    for (let i = infoboxes.length - 1; i >= 0; i--) {
        const box = infoboxes[i];
        if (!mergedInfo['engine']) mergedInfo['engine'] = box['engine'] || box['motor'] || box['electric motor'];
        if (!mergedInfo['power']) mergedInfo['power'] = box['power output'] || box['power'];
        if (!mergedInfo['torque']) mergedInfo['torque'] = box['torque'];
        if (!mergedInfo['weight']) mergedInfo['weight'] = box['curb weight'] || box['kerb weight'] || box['weight'];
        if (!mergedInfo['transmission']) mergedInfo['transmission'] = box['transmission'] || box['gearbox'];
        if (!mergedInfo['class']) mergedInfo['class'] = box['class'];
        if (!mergedInfo['manufacturer']) mergedInfo['manufacturer'] = box['manufacturer'] || box['brand'];
        if (!mergedInfo['production']) mergedInfo['production'] = box['production'];
        if (!mergedInfo['layout']) mergedInfo['layout'] = box['layout'];
        if (!mergedInfo['accel']) mergedInfo['accel'] = box['acceleration'] || box['0–100 km/h'] || box['0–60 mph'];
        if (!mergedInfo['top_speed']) mergedInfo['top_speed'] = box['top_speed'] || box['top speed'];
    }

    // 4. Fallback Scanner
    const textSpecs = scanTextForSpecs(stripHtml(fullHtml));

    // --- DATA CLEANUP ---
    const manufacturer = mergedInfo['manufacturer'] || (title.split(" ")[0]);
    const year = (mergedInfo['production'] || "").match(/\d{4}/)?.[0] || new Date().getFullYear().toString();
    const carClass = determineClass(mergedInfo['class'] || "", stripHtml(fullHtml).slice(0, 500));

    // Image Strategy
    let image = pageObj.original?.source; 
    
    if (!image) {
        // Fallback: Commons Search
        const imgQuery = `${title} car front`;
        const imgRes = await fetch(`${COMMONS_API}?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(imgQuery)}&gsrlimit=1&prop=imageinfo&iiprop=url&format=json&origin=*`);
        const imgData = await imgRes.json();
        if (imgData.query?.pages) {
            const pages = Object.values(imgData.query.pages);
            // @ts-ignore
            image = pages[0]?.imageinfo?.[0]?.url;
        }
    }

    return {
        name: title,
        manufacturer: manufacturer,
        year: year,
        class: carClass,
        history: cleanHistory || "History not available.",
        image: image || "",
        specs: {
            engine: mergedInfo['engine'] || "N/A",
            power: mergedInfo['power'] || textSpecs.power || "N/A",
            torque: mergedInfo['torque'] || textSpecs.torque || "N/A",
            weight: mergedInfo['weight'] || "N/A",
            topSpeed: mergedInfo['top_speed'] || textSpecs.topSpeed || "N/A",
            transmission: mergedInfo['transmission'] || "N/A",
            acceleration: mergedInfo['accel'] || textSpecs.acceleration || "N/A",
            drivetrain: mergedInfo['layout'] || "N/A"
        }
    };

  } catch (e) {
    console.error("Auto-populate failed:", e);
    return null;
  }
}

// --- DATABASE UTILITIES ---

export async function saveCarToDatabase(car: any) {
    const supabase = createClient(); // CHANGED: Instantiate here
    const { error } = await supabase.from('cars').upsert(car);
    return { success: !error, error };
}

// FIXED: Specific Update Action that cleans data
export async function updateCar(car: any) {
    const supabase = createClient(); // CHANGED: Instantiate here
    
    // 1. Clone the object so we don't mutate state
    const carData = { ...car };
    
    // 2. Map camelCase (UI) to snake_case (DB) if needed
    if (carData.accentColor) {
        carData.accent_color = carData.accentColor;
    }
    
    // 3. Remove the frontend-only key to avoid "Column not found" error
    delete carData.accentColor;

    const { error } = await supabase.from('cars').update(carData).eq('id', car.id);
    return { success: !error, error };
}

export async function deleteCar(id: string) {
    const supabase = createClient(); // CHANGED: Instantiate here
    const { data, error } = await supabase.from('cars').delete().eq('id', id).select('id');
    if (error) return { success: false, message: error.message };
    if (!data || data.length === 0) return { success: false, message: "Database blocked deletion." };
    return { success: true };
}

export async function getDatabaseCars() {
    const supabase = createClient(); // CHANGED: Instantiate here
    const { data, error } = await supabase.from('cars').select('*').order('created_at', { ascending: true });
    if (error) return [];
    return data.map((d: any) => ({ ...d, accentColor: d.accent_color }));
}

export async function seedCars(cars: any[]) {
    const supabase = createClient(); // CHANGED: Instantiate here
    const formatted = cars.map(c => ({
        id: c.id,
        name: c.name,
        manufacturer: c.manufacturer,
        year: c.year,
        class: c.class,
        specs: c.specs,
        history: c.history,
        image: c.image,
        accent_color: c.accentColor
    }));

    const { error } = await supabase.from('cars').upsert(formatted);
    return { success: !error };
}