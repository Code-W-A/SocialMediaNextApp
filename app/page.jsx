import LandingPage from '@/components/LandingPage';

export const metadata = {
  title: 'Destiny - Site Matrimoniale România | Găsește-ți Jumătatea Perfectă',
  description: 'Cel mai bun site de matrimoniale din România. Matrimoniale serioase București, Cluj, Iași, Timișoara. Înregistrare gratuită, profil verificat, chat securizat.',
  keywords: 'matrimoniale romania, site matrimoniale, matrimoniale bucuresti, matrimoniale cluj, matrimoniale iasi, matrimoniale timisoara, matrimoniale constanta, matrimoniale brasov, matrimoniale galati, matrimoniale craiova, casatorie, intalniri, dating romania',
  openGraph: {
    title: 'Destiny - Cel Mai Bun Site de Matrimoniale din România',
    description: 'Găsește-ți jumătatea perfectă pe cel mai de încredere site de matrimoniale. Mii de persoane verificate din toată România te așteaptă.',
    type: 'website',
    locale: 'ro_RO',
    url: 'https://destiny.ro',
    siteName: 'Destiny',
    images: [
      {
        url: 'https://destiny.ro/images/landing-page.jpg',
        width: 1200,
        height: 630,
        alt: 'Destiny - Site Matrimoniale România',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Destiny - Site Matrimoniale România',
    description: 'Cel mai bun site de matrimoniale din România. Înregistrare gratuită!',
    images: ['https://destiny.ro/images/landing-page.jpg'],
  },
  alternates: {
    canonical: 'https://destiny.ro',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function HomePage() {
  return (
    <>
      <LandingPage />
      
      {/* Schema.org structured data pentru SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Destiny",
            "description": "Cel mai bun site de matrimoniale din România",
            "url": "https://destiny.ro",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://destiny.ro/search?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            },
            "sameAs": [
              "https://www.facebook.com/destiny",
              "https://www.instagram.com/destiny",
              "https://www.twitter.com/destiny"
            ]
          })
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Destiny",
            "description": "Platforma de matrimoniale și dating din România",
            "url": "https://destiny.ro",
            "logo": "https://destiny.ro/images/destiny-logo.svg",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+40-XXX-XXX-XXX",
              "contactType": "customer service",
              "availableLanguage": "Romanian"
            },
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "RO"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "15000"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "RON",
              "description": "Înregistrare gratuită pe platforma de matrimoniale"
            }
          })
        }}
      />
    </>
  );
} 