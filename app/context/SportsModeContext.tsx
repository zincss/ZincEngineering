'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type SportsModeContextType = {
    isSportsMode: boolean;
    toggleSportsMode: () => void;
};

const SportsModeContext = createContext<SportsModeContextType>({
    isSportsMode: false,
    toggleSportsMode: () => {},
});

export const useSportsMode = () => useContext(SportsModeContext);

export const SportsModeProvider = ({ children }: { children: React.ReactNode }) => {
    const [isSportsMode, setIsSportsMode] = useState(false);

    useEffect(() => {
        // Load preference
        const saved = localStorage.getItem('zinc_sports_mode');
        if (saved === 'true') {
            setIsSportsMode(true);
            document.body.classList.add('theme-sports');
        }
    }, []);

    const toggleSportsMode = () => {
        setIsSportsMode(prev => {
            const next = !prev;
            if (next) {
                document.body.classList.add('theme-sports');
            } else {
                document.body.classList.remove('theme-sports');
            }
            localStorage.setItem('zinc_sports_mode', String(next));
            return next;
        });
    };

    return (
        <SportsModeContext.Provider value={{ isSportsMode, toggleSportsMode }}>
            {children}
        </SportsModeContext.Provider>
    );
};
