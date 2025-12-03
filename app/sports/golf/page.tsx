// app/sports/golf/page.tsx
import React from 'react';
import GolfDashboard from './components/GolfDashboard';
import BackButton from '../../components/BackButton';
import { getDashboardData } from './actions';

export const dynamic = 'force-dynamic';

export default async function GolfPage() {
    // Server-side fetch (hits Cache or API)
    const data = await getDashboardData();

    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black">
            <BackButton href="/sports" />
            <div className="pt-24 pb-20">
                <GolfDashboard initialData={data} />
            </div>
        </div>
    );
}