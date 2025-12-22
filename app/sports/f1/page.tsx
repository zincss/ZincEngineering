// app/sports/f1/page.tsx
import React from 'react';
import { getF1DashboardData } from './actions';
import F1Dashboard from './components/Dashboard';

export const dynamic = 'force-dynamic';

export default async function F1Page() {
    const data = await getF1DashboardData();

    if (!data) return <div className="min-h-screen flex items-center justify-center font-mono">F1 UPLINK FAILED</div>;

    return (
        <>
            <F1Dashboard 
                activeDrivers={data.drivers} 
                teams={data.teams} 
                tracks={data.tracks} 
                season={data.season}
            />
        </>
    );
}