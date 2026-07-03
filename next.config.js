/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
    ],
  },
  async redirects() {
    return [
      // Tracking redirect for guide lead-magnet opens.
      // /g/<guide>?lead=<id> → n8n guide-open webhook, keeping ?lead for attribution.
      // The incoming ?lead=... is NOT consumed by the source pattern, so Next.js
      // automatically merges it into the destination query (…?guide=<guide>&lead=<id>).
      {
        source: '/g/:guide',
        destination:
          'https://n8n.srv939707.hstgr.cloud/webhook/guide-open?guide=:guide',
        // 302 explicite (au lieu du 307 par défaut de `permanent: false`).
        statusCode: 302,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
