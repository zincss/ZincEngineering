'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getOrFetchResource } from '@/lib/data-manager';
import { fetchDriverFullProfile } from '../../actions';
import DriverClientView from './client-view';
import { Loader2 } from 'lucide-react';

export default function DriverPageClient() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      const d = await getOrFetchResource(
        { 
          table: 'f1_profiles', 
          keyField: 'driver_id', 
          id: id as string,
          expirationHours: 0 
        },
        () => fetchDriverFullProfile(id as string)
      );
      setData(d);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center gap-3 text-[#DFFF00] font-mono text-xs uppercase animate-pulse">
        <Loader2 size={16} className="animate-spin" /> Accessing Driver Archive...
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono text-zinc-500">
        DRIVER DOSSIER NOT FOUND.
    </div>
  );

  return <DriverClientView data={data} id={id as string} />;
}
