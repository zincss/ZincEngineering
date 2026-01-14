'use server'

import { createClient } from '@/utils/supabase/server';

export async function getPublicSystemMessage() {
  const supabase = createClient();
  
  // Fetch the first active message
  const { data, error } = await supabase
    .from('system_updates')
    .select('message, link')
    .eq('active', true)
    .limit(1)
    .single();

  if (error) {
    // Fallback if table doesn't exist or empty
    return { 
        message: 'SYSTEM UPDATES // ONLINE', 
        link: '/collections/astro' 
    };
  }

  return data;
}
