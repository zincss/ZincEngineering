'use server';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// --- 1. AUTHENTICATION ---
async function getAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Missing Spotify Client ID or Secret in .env file");
  }

  const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  // FIXED: The OFFICIAL Spotify Token Endpoint
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get token: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// --- 2. SEARCH ---
export async function searchTracks(query: string) {
  if (!query) return [];

  try {
    const token = await getAccessToken();

    // FIXED: The OFFICIAL Spotify Search Endpoint
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    if (!data.tracks || !data.tracks.items) return [];

    return data.tracks.items.map((track: any) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0]?.name || "Unknown Artist",
      image: track.album.images[0]?.url,
      uri: track.uri
    }));
  } catch (error) {
    console.error("Search Error:", error);
    return [];
  }
}

// --- 3. THE HARMONIC ALGORITHM ---
export async function generateFlow(seedTrackId: string) {
  try {
    const token = await getAccessToken();

    // A. Get Seed Track Details (BPM & Key)
    // FIXED: The OFFICIAL Spotify Audio Features Endpoint
    const featuresRes = await fetch(`https://api.spotify.com/v1/audio-features/${seedTrackId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!featuresRes.ok) {
      console.error("Seed Features Error:", await featuresRes.text());
      throw new Error("Could not fetch seed features");
    }
    const seedFeatures = await featuresRes.json();

    // B. Get Recommendations based on Seed
    // FIXED: The OFFICIAL Spotify Recommendations Endpoint
    const recsRes = await fetch(
      `https://api.spotify.com/v1/recommendations?seed_tracks=${seedTrackId}&limit=50&target_tempo=${seedFeatures.tempo}&target_energy=${seedFeatures.energy}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!recsRes.ok) {
      console.error("Recs Error:", await recsRes.text());
      throw new Error("Could not fetch recommendations");
    }
    const recsData = await recsRes.json();

    if (!recsData.tracks || recsData.tracks.length === 0) return [];

    // C. Fetch Audio Features for ALL recommendations
    const trackIds = recsData.tracks.map((t: any) => t.id).join(',');

    // FIXED: The OFFICIAL Batch Features Endpoint
    const allFeaturesRes = await fetch(`https://api.spotify.com/v1/audio-features?ids=${trackIds}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!allFeaturesRes.ok) throw new Error("Could not fetch batch features");
    const allFeaturesData = await allFeaturesRes.json();

    // D. The Mixing Logic (Harmonic Sort)
    let pool = recsData.tracks
      .map((track: any) => {
        // Find matching feature object (sometimes API returns null for a track)
        const features = allFeaturesData.audio_features.find((f: any) => f && f.id === track.id);

        if (!features) return null;

        return {
          id: track.id,
          name: track.name,
          artist: track.artists[0]?.name || "Unknown",
          image: track.album.images[0]?.url,
          bpm: Math.round(features.tempo || 0),
          key: features.key,
          mode: features.mode,
          camelot: getCamelotString(features.key, features.mode),
        };
      })
      .filter((t: any) => t && t.bpm > 0);

    // E. Build the Chain
    const chain = [];

    // Initial State (The Seed)
    let currentTrack = {
      bpm: Math.round(seedFeatures.tempo),
      key: seedFeatures.key,
      mode: seedFeatures.mode,
    };

    // Add Seed to list
    chain.push({
      id: seedTrackId,
      isSeed: true,
      ...currentTrack,
    });

    // Try to find up to 12 songs
    for (let i = 0; i < 12; i++) {
      // 1. Try to find a Harmonic Match within reasonable BPM
      let bestMatchIndex = pool.findIndex((candidate: any) => {
        const bpmDiff = Math.abs(candidate.bpm - currentTrack.bpm);
        // Strict: BPM within 6 AND Harmonic Match
        return bpmDiff <= 6 && isHarmonicMatch(currentTrack.key, currentTrack.mode, candidate.key, candidate.mode);
      });

      // 2. Fallback: Good BPM Match
      if (bestMatchIndex === -1) {
        bestMatchIndex = pool.findIndex((candidate: any) => {
          return Math.abs(candidate.bpm - currentTrack.bpm) <= 10;
        });
      }

      // 3. Last Resort
      if (bestMatchIndex === -1 && pool.length > 0) {
        bestMatchIndex = 0;
      }

      if (bestMatchIndex !== -1) {
        const nextSong = pool[bestMatchIndex];
        chain.push(nextSong);
        currentTrack = nextSong;
        pool.splice(bestMatchIndex, 1);
      } else {
        break;
      }
    }

    return chain.slice(1); // Return just the generated songs
  } catch (err) {
    console.error("Generator Error:", err);
    return [];
  }
}

// --- HELPER: Music Theory ---
function getCamelotString(key: number, mode: number) {
  const major = ["8B", "3B", "10B", "5B", "12B", "7B", "2B", "9B", "4B", "11B", "6B", "1B"];
  const minor = ["5A", "12A", "7A", "2A", "9A", "4A", "11A", "6A", "1A", "8A", "3A", "10A"];

  if (key === undefined || key < 0 || key > 11) return "?";
  return mode === 1 ? major[key] : minor[key];
}

function isHarmonicMatch(key1: number, mode1: number, key2: number, mode2: number) {
  // Simple mixing rules
  if (key1 === key2 && mode1 === mode2) return true; // Exact key match
  if (key1 === key2) return true; // Parallel Major/Minor (Same Tonic)
  return false;
}