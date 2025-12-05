import { supabase } from '@/lib/supabaseClient';

export interface DataFetchOptions {
  table: string;      // e.g. 'golf_snapshots'
  keyField: string;   // e.g. 'key'
  id: string;         // e.g. 'pga_schedule_reliable'
  expirationHours?: number; 
}

export async function getOrFetchResource<T>(
  options: DataFetchOptions,
  fetcher: () => Promise<T | null>
): Promise<T | null> {
  const { table, keyField, id, expirationHours = 24 } = options;
  let cachedData: T | null = null;

  try {
    // 1. CHECK DB (Snapshot)
    const { data: local, error } = await supabase
        .from(table)
        .select('data, last_updated')
        .eq(keyField, id)
        .single();

    if (!error && local) {
      cachedData = local.data as T;
      const lastUpdate = new Date(local.last_updated).getTime();
      const hoursDiff = (new Date().getTime() - lastUpdate) / (1000 * 60 * 60);

      // If fresh, return immediately
      if (hoursDiff < expirationHours) {
        console.log(`[DATA] HIT: ${id} is fresh (${hoursDiff.toFixed(1)}h old).`);
        return cachedData; 
      }
      console.log(`[DATA] STALE: ${id} is ${hoursDiff.toFixed(1)}h old. Refreshing...`);
    }
  } catch (e) { /* Ignore DB errors */ }

  // 2. FETCH NEW DATA (If missing or stale)
  try {
    console.log(`[DATA] FETCHING: ${id} from source...`);
    const freshData = await fetcher();

    if (freshData) {
      // Save Snapshot
      await supabase.from(table).upsert({
        [keyField]: id,
        data: freshData,
        last_updated: new Date().toISOString()
      }, { onConflict: keyField });
      
      console.log(`[DATA] SAVED: ${id} updated.`);
      return freshData;
    } 
    
    throw new Error("Fetcher returned null/empty");

  } catch (fetchError) {
    console.error(`[DATA] FETCH FAILED for ${id}:`, fetchError);
    // 3. FAILSAFE: If scrape fails, return old data so UI doesn't break
    if (cachedData) return cachedData;
    return null;
  }
}