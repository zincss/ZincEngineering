export type Question = {
    id: string;
    text: string;
    options: string[];
    answerIdx: number;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE';
};

// A small sample set - in production, fetch this from a DB
export const QUESTIONS: Question[] = [
    // --- EASY ---
    { id: '1', difficulty: 'EASY', text: "In computer science, what does 'CPU' stand for?", options: ["Central Processing Unit", "Computer Power Unit", "Central Power User", "Core Processing Utility"], answerIdx: 0 },
    { id: '2', difficulty: 'EASY', text: "Which protocol is primarily used for secure web browsing?", options: ["FTP", "HTTP", "HTTPS", "SMTP"], answerIdx: 2 },
    { id: '3', difficulty: 'EASY', text: "What is the binary representation of the decimal number 5?", options: ["100", "101", "110", "111"], answerIdx: 1 },
    { id: '4', difficulty: 'EASY', text: "Which company developed the Windows operating system?", options: ["Apple", "IBM", "Microsoft", "Oracle"], answerIdx: 2 },
    
    // --- MEDIUM ---
    { id: '5', difficulty: 'MEDIUM', text: "In the Matrix, which pill does Neo take?", options: ["The Blue Pill", "The Red Pill", "The Green Pill", "The Black Pill"], answerIdx: 1 },
    { id: '6', difficulty: 'MEDIUM', text: "What represents the 'brains' of a blockchain network?", options: ["The Miner", "The Smart Contract", "The Wallet", "The Node"], answerIdx: 1 },
    { id: '7', difficulty: 'MEDIUM', text: "Which element is commonly used in semiconductors?", options: ["Zinc", "Silicon", "Copper", "Gold"], answerIdx: 1 },
    { id: '8', difficulty: 'MEDIUM', text: "What is the name of the AI in the Halo video game series?", options: ["Siri", "Cortana", "Alexa", "GLaDOS"], answerIdx: 1 },

    // --- HARD ---
    { id: '9', difficulty: 'HARD', text: "Who is considered the first computer programmer?", options: ["Alan Turing", "Charles Babbage", "Ada Lovelace", "Grace Hopper"], answerIdx: 2 },
    { id: '10', difficulty: 'HARD', text: "What is the port number typically used for SSH?", options: ["21", "22", "80", "443"], answerIdx: 1 },
    { id: '11', difficulty: 'HARD', text: "In cyberpunk literature, what is a 'Deck'?", options: ["A skateboard", "A computer terminal", "A card game", "A weapon"], answerIdx: 1 },

    // --- INSANE ---
    { id: '12', difficulty: 'INSANE', text: "Which sorting algorithm has the worst-case time complexity of O(n!)?", options: ["Bubble Sort", "Quick Sort", "Bogosort", "Merge Sort"], answerIdx: 2 },
    { id: '13', difficulty: 'INSANE', text: "What was the first message ever sent over ARPANET?", options: ["HELLO", "LOGIN", "LO", "SYSTEM READY"], answerIdx: 2 },
    { id: '14', difficulty: 'INSANE', text: "In cryptography, what does RSA stand for?", options: ["Rivest-Shamir-Adleman", "Random-Secure-Algorithm", "Royal-Security-Agency", "Rotational-Symmetric-Auth"], answerIdx: 0 },
    { id: '15', difficulty: 'INSANE', text: "What is the Zinc atomic number?", options: ["28", "29", "30", "32"], answerIdx: 2 },
];

export const PRIZE_LADDER = [
    100, 200, 300, 500, 1000, // Safety Net 1
    2000, 4000, 8000, 16000, 32000, // Safety Net 2
    64000, 125000, 250000, 500000, 1000000 // The Zinc Millionaire
];

export const SAFETY_NETS = [4, 9]; // Indexes of safe havens