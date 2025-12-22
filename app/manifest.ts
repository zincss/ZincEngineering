import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ZINC ENGINEERING // HUB',
    short_name: 'ZincHub',
    description: 'Advanced Tactical & Athletic Telemetry',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b', // Changed to zinc-950 to match your dark theme
    theme_color: '#09090b', // Changed to zinc-950
    icons: [
  {
    src: '/favicon.ico', // Safest bet (always exists)
    sizes: 'any',
    type: 'image/x-icon',
  },
  {
    src: '/icon.svg', // Point to the actual file extension
    sizes: 'any',
    type: 'image/svg+xml',
  },
],
  }
}