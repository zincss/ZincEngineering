'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Loader2, Check, MapPin } from 'lucide-react';

// Fix for default Leaflet marker icons in Next.js
const icon = L.divIcon({
  className: 'custom-icon',
  html: `<div class="w-6 h-6 bg-[#DFFF00] rounded-full border-2 border-black shadow-[0_0_15px_rgba(223,255,0,0.6)] animate-bounce relative"><div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#DFFF00] rotate-45"></div></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

interface WeatherMapPickerProps {
  onSelectLocation: (loc: { lat: number; lon: number; name: string; country: string }) => void;
}

const LocationMarker = ({ position, setPosition }: { position: L.LatLng | null, setPosition: (latlng: L.LatLng) => void }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={icon} />
  );
};

export default function WeatherMapPicker({ onSelectLocation }: WeatherMapPickerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewName, setPreviewName] = useState<string>('');

  // Auto-resolve name when pin moves
  useEffect(() => {
    if (position) {
      resolveLocationName(position.lat, position.lng);
    }
  }, [position]);

  const resolveLocationName = async (lat: number, lon: number) => {
    try {
      // Using BigDataCloud's free client-side reverse geocoding (no API key needed usually)
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
      const data = await res.json();
      
      const city = data.city || data.locality || data.principalSubdivision || "Unknown Sector";
      const country = data.countryName || "International Waters";
      
      setPreviewName(`${city}, ${country}`);
    } catch (e) {
      setPreviewName(`${lat.toFixed(2)}, ${lon.toFixed(2)}`);
    }
  };

  const handleConfirm = () => {
    if (position) {
      const [city, country] = previewName.split(', ');
      onSelectLocation({
        lat: position.lat,
        lon: position.lng,
        name: city || 'Custom Coordinates',
        country: country || ''
      });
    }
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden border border-zinc-700 group">
      
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '100%', width: '100%', background: '#09090b' }}
        zoomControl={false}
      >
        {/* Dark Matter Tiles for Cyberpunk Look */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>

      {/* Overlay UI */}
      <div className="absolute top-4 left-4 z-[400] bg-black/80 backdrop-blur-md border border-zinc-800 p-4 rounded-xl max-w-xs shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
             <MapPin size={14} className="text-[#DFFF00]" />
             <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">Map Nav</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
             Click anywhere on the global grid to drop a relay pin.
          </p>
      </div>

      {position && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] flex flex-col items-center gap-3 w-full max-w-sm px-4 animate-in fade-in slide-in-from-bottom-4">
             <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-700 px-6 py-3 rounded-full shadow-2xl text-center">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Target Coordinates</div>
                <div className="text-white font-bold text-sm">{previewName || "Scanning..."}</div>
             </div>
             
             <button 
                onClick={handleConfirm}
                className="flex items-center gap-2 bg-[#DFFF00] hover:bg-white text-black font-black uppercase text-xs tracking-[0.2em] py-4 px-8 rounded-full shadow-[0_0_30px_rgba(223,255,0,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transition-all active:scale-95"
             >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                <span>Initialize Scan</span>
             </button>
        </div>
      )}
    </div>
  );
}