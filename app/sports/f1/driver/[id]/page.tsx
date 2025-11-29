import React from 'react';
import { notFound } from 'next/navigation';
import { getOrFetchResource } from '@/lib/data-manager';
import { fetchDriverFullProfile } from '../../actions';
import DriverClientView from './client-view';

export const dynamic = 'force-dynamic';

export default async function F1DriverPage({ params }: { params: { id: string } }) {
  
  // SNAPSHOT TRIGGER
  const data = await getOrFetchResource(
    { table: 'f1_profiles', keyField: 'driver_id', id: params.id },
    () => fetchDriverFullProfile(params.id)
  );

  if (!data) return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono text-zinc-500">
        DRIVER DOSSIER NOT FOUND.
    </div>
  );

  return <DriverClientView data={data} id={params.id} />;
}