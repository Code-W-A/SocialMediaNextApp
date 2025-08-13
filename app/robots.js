export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/onboarding/',
          '/(auth)/',
          '/messages/',
          '/profile/',
          '/feed/',
          '/compatibility/',
          '/settings/',
          '/offline'
        ],
      },
    ],
    sitemap: 'https://ydestiny.ro/sitemap.xml',
  };
} 