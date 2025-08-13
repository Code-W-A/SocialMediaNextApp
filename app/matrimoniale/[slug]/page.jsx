 
import Link from 'next/link';
import { getLocationBySlug, getAllLocationSlugs } from '@/data/locations';
import MatrimonialeLocationClient from './MatrimonialeLocationClient';

export async function generateStaticParams() {
  return getAllLocationSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = params;
  const loc = getLocationBySlug(slug);
  const name = loc?.name || 'România';
  const county = loc?.county || name;
  const title = `Matrimoniale ${name} | Destine serioase în ${county}`;
  const description = `Cauți matrimoniale în ${name}? Intră pe Destiny: profiluri verificate, chat nelimitat și căutare avansată. Găsește-ți jumătatea în ${county}. Înscriere gratuită!`;
  const url = `https://destiny.ro/matrimoniale/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website'
    }
  };
}

export default async function MatrimonialeLocationPage({ params }) {
  const { slug } = params;
  const cityData = getLocationBySlug(slug);

  if (!cityData) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>Pagina nu a fost găsită</h2>
        <p>Întoarce-te la pagina principală.</p>
        <Link href="/" style={{ color: '#1677ff', textDecoration: 'underline' }}>Acasă</Link>
      </div>
    );
  }

  const name = cityData.name;
  const county = cityData.county || cityData.name;
  const landmarks = cityData.landmarks || [];

  return (
    <MatrimonialeLocationClient
      name={name}
      county={county}
      landmarks={landmarks}
      slug={slug}
    />
  );
}


