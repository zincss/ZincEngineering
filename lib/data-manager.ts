import { supabase } from './supabaseClient';

export interface DataFetchOptions {
  table: string;      // e.g., 'nba_profiles'
  keyField: string;   // e.g., 'espn_id' or 'player_id'
  id: string;         // The ID we are looking for
  expirationHours?: number; // How long until we consider data "stale"?
}

export async function getOrFetchResource<T>(
  options: DataFetchOptions,
  fetcher: () => Promise<T | null>
): Promise<T | null> {
  const { table, keyField, id, expirationHours = 24 } = options;

  console.log(`[ZINC_DB] Checking ${table} for ${id}...`);

  try {
    // 1. CHECK LOCAL DB (If table exists)
    const { data: local, error } = await supabase
        .from(table)
        .select('data, last_updated')
        .eq(keyField, id)
        .single();

    if (!error && local) {
      const lastUpdate = new Date(local.last_updated).getTime();
      const now = new Date().getTime();
      const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60);

      if (hoursDiff < expirationHours) {
        console.log(`[ZINC_DB] HIT: Returning cached data for ${id}`);
        return local.data as T;
      }
      console.log(`[ZINC_DB] STALE: Data for ${id} is ${hoursDiff.toFixed(1)}h old. Refetching...`);
    }
  } catch (dbError) {
    // Ignore DB errors (like missing tables) and proceed to fetch live
    console.warn(`[ZINC_DB] DB SKIP: ${dbError}`);
  }

  // 2. FETCH EXTERNAL
  console.log(`[ZINC_DB] MISS: Fetching external data...`);
  const freshData = await fetcher();

  if (!freshData) {
    console.warn(`[ZINC_DB] ERROR: External fetch failed for ${id}`);
    return null;
  }

  // 3. UPSERT TO SUPABASE (Fire and Forget)
  try {
      const payload: any = {
        [keyField]: id,
        data: freshData,
        last_updated: new Date().toISOString()
      };

      const { error: saveError } = await supabase
        .from(table)
        .upsert(payload, { onConflict: keyField });

      if (saveError) console.warn(`[ZINC_DB] SAVE WARNING: Could not save to ${table} (Check if table exists)`);
      else console.log(`[ZINC_DB] SNAPSHOT: Saved fresh data for ${id}`);
      
  } catch (saveError) {
      console.warn(`[ZINC_DB] SAVE FAILED:`, saveError);
  }

  return freshData;
}