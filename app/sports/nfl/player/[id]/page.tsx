// app/sports/nfl/player/[id]/page.tsx
import React from 'react';
import { getPlayerProfile } from '../../actions';
import NFLPlayerClientView from './client-view';

export const dynamic = 'force-dynamic';

export default async function NFLPlayerPage({ params }: { params: { id: string } }) {
    const player = await getPlayerProfile(params.id);

    if (!player) return (
        <div className="min-h-screen bg-black flex items-center justify-center font-mono text-zinc-500">
            PLAYER PROFILE NOT FOUND.
        </div>
    );

    return <NFLPlayerClientView player={player} />;
}