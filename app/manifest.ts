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
        src: '/icon', // This points to the file we just created
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}