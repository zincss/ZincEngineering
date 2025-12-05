/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for the scraper to run on Vercel
  experimental: {
    serverComponentsExternalPackages: ['puppeteer-core', '@sparticuz/chromium-min'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'commons.wikimedia.org' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'pga-tour-res.cloudinary.com' },
      { protocol: 'https', hostname: 'flagcdn.com' },
    ],
  },
};

module.exports = nextConfig;