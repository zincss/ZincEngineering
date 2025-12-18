import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ZINC ENGINEERING // HUB',
    short_name: 'ZincHub',
    description: 'Advanced Tactical & Athletic Telemetry',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafafa',
    theme_color: '#fafafa',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png', // You should add these images to your /public folder
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png', // You should add these images to your /public folder
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}