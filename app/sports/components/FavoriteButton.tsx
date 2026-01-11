'use client';

import React, { useState, useEffect } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { toggleFavoritePlayer, getIsPlayerFavorited } from '../actions';
import { motion, AnimatePresence } from 'framer-motion';

interface FavoriteButtonProps {
    playerId: string;
    league: string;
    playerName: string;
    headshotUrl: string;
}

export default function FavoriteButton({ playerId, league, playerName, headshotUrl }: FavoriteButtonProps) {
    const [isFavorited, setIsFavorited] = useState(false);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        getIsPlayerFavorited(playerId).then(res => {
            setIsFavorited(res);
            setLoading(false);
        });
    }, [playerId]);

    const handleToggle = async () => {
        setProcessing(true);
        try {
            const res = await toggleFavoritePlayer(playerId, league, playerName, headshotUrl);
            setIsFavorited(res.isFavorited);
        } catch (e) {
            console.error(e);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return (
        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Loader2 size={16} className="animate-spin text-zinc-600" />
        </div>
    );

    return (
        <button 
            onClick={handleToggle}
            disabled={processing}
            className={`
                group relative flex items-center gap-3 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-500
                ${isFavorited 
                    ? 'bg-[#DFFF00] text-black shadow-[0_0_30px_rgba(223,255,0,0.3)]' 
                    : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-white hover:text-white'
                }
                ${processing ? 'opacity-50 cursor-wait' : 'active:scale-95'}
            `}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={isFavorited ? 'fav' : 'unfav'}
                    initial={{ scale: 0.5, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0.5, rotate: 45 }}
                >
                    <Star size={16} fill={isFavorited ? 'black' : 'none'} className={isFavorited ? '' : 'group-hover:text-[#DFFF00] transition-colors'} />
                </motion.div>
            </AnimatePresence>
            <span>{isFavorited ? 'Tracked' : 'Follow'}</span>
        </button>
    );
}
