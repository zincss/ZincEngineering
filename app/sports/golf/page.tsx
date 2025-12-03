import React from 'react';
import GolfDashboard from './components/GolfDashboard';
import BackButton from '../../components/BackButton';

export default function GolfPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black">
            <BackButton href="/sports" />
            <div className="pt-24 pb-20">
                {/* We pass no initial data, triggering the client-side fetch */}
                <GolfDashboard />
            </div>
        </div>
    );
}