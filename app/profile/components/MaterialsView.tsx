'use client';

import React from 'react';
import { Hammer } from 'lucide-react';
import { Material } from '../types';

interface MaterialsViewProps {
    materials: Material[];
}

export const MaterialsView = ({ materials }: MaterialsViewProps) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {materials.map((mat) => (
                <div key={mat.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3 text-blue-400">
                        <Hammer size={24} />
                    </div>
                    <h3 className="text-xs font-black uppercase text-white mb-1">
                        {mat.material_type.replace('_', ' ')}
                    </h3>
                    <div className="text-xl font-mono text-zinc-400">x{mat.quantity}</div>
                </div>
            ))}
            {materials.length === 0 && (
                <div className="col-span-full py-12 text-center text-zinc-500 font-mono text-xs">
                    NO COMPONENTS FOUND. BREAK DOWN ITEMS TO COLLECT PARTS.
                </div>
            )}
        </div>
    );
};