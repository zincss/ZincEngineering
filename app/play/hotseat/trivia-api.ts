export type Question = {
    id: string;
    text: string;
    options: string[];
    answerIdx: number;
    difficulty: string;
    category: string;
};

// --- NATIVE DECODER (Browser Only) ---
function decodeHtml(html: string) {
    if (typeof window === 'undefined') return html;
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return doc.documentElement.textContent || html;
    } catch (e) {
        console.error("Decoding error:", e);
        return html;
    }
}

// --- GUARANTEED "LEVEL 1-2" QUESTIONS ---
// Hand-picked to ensure the game starts fun and accessible.
const STARTER_QUESTIONS: Omit<Question, 'id'>[] = [
    { text: "What device are you likely using to browse the internet?", options: ["Toaster", "Computer", "Microwave", "Rock"], answerIdx: 1, difficulty: 'intro', category: 'General' },
    { text: "Which company manufactures the iPhone?", options: ["Microsoft", "Apple", "Nokia", "Samsung"], answerIdx: 1, difficulty: 'intro', category: 'Tech' },
    { text: "What color is the 'G' in the Google logo?", options: ["Multi-colored", "Purple", "Black", "Pink"], answerIdx: 0, difficulty: 'intro', category: 'Tech' },
    { text: "In gaming, what does 'HP' usually stand for?", options: ["Harry Potter", "Health Points", "High Power", "Hot Pizza"], answerIdx: 1, difficulty: 'intro', category: 'Gaming' },
    { text: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answerIdx: 1, difficulty: 'intro', category: 'Space' },
    { text: "What is the name of the currency used in this arcade?", options: ["Gold", "Zinc", "Credits", "Bitcoin"], answerIdx: 1, difficulty: 'intro', category: 'System' },
    { text: "Which key is commonly used to 'Escape' a program?", options: ["Ctrl", "Alt", "Esc", "Shift"], answerIdx: 2, difficulty: 'intro', category: 'Tech' },
    { text: "What does 'www' stand for in a website address?", options: ["World Wide Web", "Wild Wild West", "Web World Wide", "World Web Wide"], answerIdx: 0, difficulty: 'intro', category: 'Internet' },
];

export async function fetchGameQuestions(): Promise<Question[]> {
    try {
        // 1. Fetch from API for the main game (Levels 3-15)
        // Requesting 40 to ensure we have enough good candidates
        const res = await fetch('https://opentdb.com/api.php?amount=40&type=multiple');
        const data = await res.json();

        if (data.response_code !== 0) {
            throw new Error("Failed to retrieve questions.");
        }

        const rawResults = data.results;

        // 2. Bucket API questions by difficulty
        const easyQs = rawResults.filter((q: any) => q.difficulty === 'easy');
        const mediumQs = rawResults.filter((q: any) => q.difficulty === 'medium');
        const hardQs = rawResults.filter((q: any) => q.difficulty === 'hard');

        let finalSelection: Question[] = [];

        // --- PHASE 1: THE WARM UP (Questions 1-2) ---
        // Pick 2 random questions from our curated "Starter" list
        const starters = [...STARTER_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 2);
        
        starters.forEach((q, i) => {
            finalSelection.push({
                ...q,
                id: `starter-${i}-${Date.now()}`
            });
        });

        // --- PHASE 2: EASY API (Questions 3-5) ---
        // We need 3 more 'Easy' ones from the API to finish the first sector
        const apiEasyNeeded = 3;
        const selectedEasy = easyQs.slice(0, apiEasyNeeded).map(mapApiQuestion);
        finalSelection.push(...selectedEasy);

        // --- PHASE 3: MEDIUM (Questions 6-10) ---
        // We need 5 Mediums. Backfill with Easy if API runs dry.
        const mediumNeeded = 5;
        let selectedMedium = mediumQs.slice(0, mediumNeeded).map(mapApiQuestion);
        
        // Backfill Mediums if needed
        if (selectedMedium.length < mediumNeeded) {
            const needed = mediumNeeded - selectedMedium.length;
            const extraEasy = easyQs.slice(apiEasyNeeded, apiEasyNeeded + needed).map(mapApiQuestion);
            selectedMedium = [...selectedMedium, ...extraEasy];
        }
        finalSelection.push(...selectedMedium);

        // --- PHASE 4: HARD (Questions 11-15) ---
        const hardNeeded = 5;
        let selectedHard = hardQs.slice(0, hardNeeded).map(mapApiQuestion);
        
        // Backfill Hards if needed
        if (selectedHard.length < hardNeeded) {
            const needed = hardNeeded - selectedHard.length;
            const extraMedium = mediumQs.slice(mediumNeeded, mediumNeeded + needed).map(mapApiQuestion);
            selectedHard = [...selectedHard, ...extraMedium];
        }
        finalSelection.push(...selectedHard);

        // Safety slice to ensure exactly 15
        return finalSelection.slice(0, 15);

    } catch (error) {
        console.error("API Error:", error);
        return fallbackQuestions;
    }
}

// Helper to format API data
function mapApiQuestion(q: any, index: number): Question {
    const allOptions = [...q.incorrect_answers, q.correct_answer];
    const shuffled = allOptions.sort(() => Math.random() - 0.5);
    const answerIdx = shuffled.indexOf(q.correct_answer);

    return {
        id: `api-${index}-${Date.now()}`,
        text: decodeHtml(q.question),
        options: shuffled.map((opt: string) => decodeHtml(opt)),
        answerIdx: answerIdx,
        difficulty: q.difficulty,
        category: q.category.replace('Entertainment: ', '').replace('Science: ', '')
    };
}

// Fallback data
const fallbackQuestions: Question[] = [
    { id: 'err-1', text: "Neural Link Offline. What is the standard backup protocol?", options: ["Panic", "Manual Override", "Wait", "Reboot"], answerIdx: 1, difficulty: 'easy', category: 'System' },
    { id: 'err-2', text: "Connection Lost. Identify the likely cause.", options: ["Solar Flare", "Firewall Block", "Fiber Cut", "AI Uprising"], answerIdx: 1, difficulty: 'easy', category: 'Network' },
    { id: 'err-3', text: "Database unreachable. Select recommended action.", options: ["Ignore", "Retry", "Restore Backup", "Cry"], answerIdx: 2, difficulty: 'medium', category: 'Admin' },
];