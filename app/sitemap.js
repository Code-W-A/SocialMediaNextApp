export default function sitemap() {
  const baseUrl = 'https://destiny.ro';
  
  // Orașele pentru care avem pagini de matrimoniale
  const cities = [
    'bucuresti', 'targoviste', 'ploiesti', 'constanta', 'cluj-napoca', 
    'timisoara', 'iasi', 'brasov', 'galati', 'craiova', 'oradea', 
    'arad', 'pitesti', 'bacau', 'sibiu', 'baia-mare', 'suceava', 'dambovita'
  ];

  // Paginile statice
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/premium`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Paginile dinamice de matrimoniale
  const matrimonialPages = cities.map((city) => ({
    url: `${baseUrl}/matrimoniale-${city}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...matrimonialPages];
} 