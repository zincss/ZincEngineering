// scripts/seed-database.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Fetching Warframe data from GitHub...");
  
  // CHANGED: Using the raw GitHub URL which is more stable
  const response = await fetch('https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/All.json');
  
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  const allItems = await response.json();
  console.log(`Found ${allItems.length} total items. Filtering...`);

  const formattedItems = allItems
    .filter(item => ['Warframes', 'Primary', 'Secondary', 'Melee'].includes(item.category))
    .map(item => ({
      unique_name: item.uniqueName,
      name: item.name,
      category: item.category, 
      description: item.description || "No description available.",
      image_name: item.imageName,
      stats: {
        health: item.health,
        shield: item.shield,
        armor: item.armor,
        mastery: item.masteryReq,
        damage: item.totalDamage
      }
    }));

  console.log(`Uploading ${formattedItems.length} items to Supabase...`);

  // Upload in chunks of 100
  const chunkSize = 100;
  for (let i = 0; i < formattedItems.length; i += chunkSize) {
    const chunk = formattedItems.slice(i, i + chunkSize);
    const { error } = await supabase.from('items').insert(chunk);
    
    if (error) {
      console.error('Error uploading chunk:', error.message);
    } else {
      console.log(`Uploaded items ${i} to ${i + chunkSize}`);
    }
  }

  console.log("Done!");
}

seed().catch(console.error);