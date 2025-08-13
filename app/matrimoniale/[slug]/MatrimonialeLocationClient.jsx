'use client';

import { Typography, Row, Col, Card, Button } from 'antd';
import { HeartOutlined, CheckOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const { Title, Paragraph } = Typography;

export default function MatrimonialeLocationClient({ name, county, landmarks = [], slug }) {
  const router = useRouter();
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F8F6F0 0%, #F0EDE5 100%)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: `Matrimoniale ${name}`,
            url: `https://destiny.ro/matrimoniale/${slug}`,
            description: `Cauți matrimoniale în ${name}? Profiluri verificate și chat nelimitat.`,
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Acasă', item: 'https://destiny.ro' },
                { '@type': 'ListItem', position: 2, name: 'Matrimoniale', item: 'https://destiny.ro' },
                { '@type': 'ListItem', position: 3, name: `Matrimoniale ${name}`, item: `https://destiny.ro/matrimoniale/${slug}` }
              ]
            }
          })
        }}
      />

      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '4rem 0 2rem', color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <Title level={1} style={{ color: 'white', fontSize: '3rem', marginBottom: '1rem', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            Matrimoniale {name}
          </Title>
          <Paragraph style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.9)', marginBottom: '2rem' }}>
            Cel mai bun site de matrimoniale din {county}
          </Paragraph>
          <Button
            type="primary"
            size="large"
            icon={<HeartOutlined />}
            style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', border: 'none', borderRadius: '25px', height: '60px', fontSize: '18px', fontWeight: '600', padding: '0 3rem', color: '#000' }}
            onClick={() => router.push('/')}
          >
            Înregistrează-te Gratuit
          </Button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
        <Card style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'white', marginBottom: '3rem' }}>
          <Title level={2} style={{ color: '#2C3E50', marginBottom: '2rem' }}>
            <HeartOutlined style={{ color: '#FFD700', marginRight: '10px' }} />
            Matrimoniale Serioase în {name} - Găsește-ți Jumătatea
          </Title>
          <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '1.5rem' }}>
            Bine ai venit pe platforma de <strong>matrimoniale din {name}</strong>! Destiny conectează persoane
            serioase din {county} care caută relații stabile și căsătorie. Comunitatea activă din {name} îți oferă
            șanse reale să întâlnești pe cineva compatibil.
          </Paragraph>
        </Card>

        <Card style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'white', marginBottom: '3rem' }}>
          <Title level={2} style={{ color: '#2C3E50', marginBottom: '2rem', textAlign: 'center' }}>
            De ce Matrimonialele Destiny sunt Alegerea #1 în {name}?
          </Title>
          <Row gutter={[24, 24]}>
            {[ 
              { title: 'Profiluri Verificate', description: `Profiluri reale și verificate manual în ${name}.` },
              { title: 'Chat Nelimitat', description: `Comunică liber cu persoane din ${name}.` },
              { title: 'Căutare Avansată', description: `Filtrează după criterii relevante pentru tine în ${name}.` },
              { title: 'Notificări Instant', description: `Află imediat când primești mesaje în ${name}.` },
              { title: 'Suport 24/7', description: `Echipa Destiny te ajută oricând, oriunde în ${county}.` },
              { title: 'Protecția Datelor', description: `Respectăm GDPR și protejăm datele utilizatorilor din ${name}.` }
            ].map((f, i) => (
              <Col xs={24} sm={12} lg={8} key={i}>
                <div style={{ textAlign: 'center', padding: '2rem', background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,165,0,0.05))', borderRadius: '15px', height: '100%', border: '1px solid rgba(255,215,0,0.2)' }}>
                  <div style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 20px rgba(255, 215, 0, 0.3)' }}>
                    <CheckOutlined style={{ color: '#2C3E50', fontSize: '1.5rem' }} />
                  </div>
                  <Title level={4} style={{ color: '#2C3E50', marginBottom: '1rem' }}>{f.title}</Title>
                  <Paragraph style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>{f.description}</Paragraph>
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        {landmarks.length > 0 && (
          <Card style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'white', marginBottom: '3rem' }}>
            <Title level={2} style={{ color: '#2C3E50', marginBottom: '1.5rem' }}>{name} – Locuri Romantice</Title>
            <Paragraph style={{ fontSize: 16, color: '#666' }}>
              Locuri populare pentru întâlniri: {landmarks.join(', ')}.
            </Paragraph>
          </Card>
        )}

        <Card style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', background: 'white', marginBottom: '3rem' }}>
          <Title level={2} style={{ color: '#2C3E50', marginBottom: '1rem' }}>Cum creezi un profil care atrage în {name}</Title>
          <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>Fotografiile clare, un zâmbet natural și o descriere autentică îți cresc vizibil șansele. Scrie despre valorile tale, pasiunile din {name}, hobby-uri și despre ce îți dorești într-o relație serioasă. Evită clișeele, oferă detalii concrete și rămâi politicos(ă) în conversații.</Paragraph>
          <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>Folosește “căutare avansată” pentru a găsi femei și bărbați singuri din {name} sau din localitățile apropiate din {county}. Un profil complet, verificat, îți oferă încredere și mai multe răspunsuri. Activează notificările ca să nu ratezi mesaje importante.</Paragraph>
        </Card>

        <Card style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', background: 'white', marginBottom: '3rem' }}>
          <Title level={2} style={{ color: '#2C3E50', marginBottom: '1rem' }}>Prima conversație – sfaturi utile pentru {name}</Title>
          <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>Începe cu un salut prietenos și o întrebare deschisă. Fă referire la un detaliu din profilul persoanei: o carte preferată, un loc din {name}, un hobby comun. Menține tonul pozitiv, evită întrebările invazive și propune o întâlnire relaxată într-un spațiu public după ce vă cunoașteți câteva zile.</Paragraph>
        </Card>

        <Card style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', background: 'white', marginBottom: '3rem' }}>
          <Title level={3} style={{ color: '#2C3E50', marginBottom: '1rem' }}>Pagini utile pentru căutarea ta</Title>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li><Link href="/matrimoniale/bucuresti" style={{ color: '#667eea', textDecoration: 'none' }}>Matrimoniale București</Link></li>
            <li><Link href="/matrimoniale/cluj-napoca" style={{ color: '#667eea', textDecoration: 'none' }}>Matrimoniale Cluj-Napoca</Link></li>
            <li><Link href="/matrimoniale/timisoara" style={{ color: '#667eea', textDecoration: 'none' }}>Matrimoniale Timișoara</Link></li>
            <li><Link href="/matrimoniale/iasi" style={{ color: '#667eea', textDecoration: 'none' }}>Matrimoniale Iași</Link></li>
            <li><Link href="/matrimoniale/brasov" style={{ color: '#667eea', textDecoration: 'none' }}>Matrimoniale Brașov</Link></li>
          </ul>
        </Card>

        <Card style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', background: 'white', marginBottom: '3rem' }}>
          <Title level={2} style={{ color: '#2C3E50', marginBottom: '1rem' }}>
            Nu doar matrimoniale în {name} – și întâlniri sociale (meetings)
          </Title>
          <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
            Destiny nu este doar o platformă de <strong>matrimoniale {name}</strong>. Mulți membri folosesc aplicația pentru
            întâlniri sociale, prietenii noi, networking și ieșiri în oraș. Fie că ești în căutarea unei relații serioase sau a unei
            conexiuni plăcute de weekend, comunitatea din {name} te primește cu brațele deschise.
          </Paragraph>
          <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
            Poți crea evenimente informale, propune întâlniri la cafenele sau plimbări în parcurile din {name}, ori expune-ți pasiunea pentru
            cultură, sport sau gastronomie. Respectul, eleganța și comunicarea autentică rămân baza oricărei interacțiuni.
          </Paragraph>
        </Card>

        <Card style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'white' }}>
          <Title level={2} style={{ color: '#2C3E50', marginBottom: '2rem', textAlign: 'center' }}>
            Începe Astăzi Căutarea Dragostei în {name}!
          </Title>
          <Paragraph style={{ fontSize: '18px', color: '#555', marginBottom: '2rem', textAlign: 'center' }}>
            Înregistrează-te gratuit și descoperă persoane compatibile din {name} și {county}.
          </Paragraph>
          <div style={{ textAlign: 'center' }}>
          <Button
            type="primary"
            size="large"
            icon={<HeartOutlined />}
            style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', border: 'none', borderRadius: '25px', height: '60px', fontSize: '18px', fontWeight: '600', padding: '0 3rem', color: '#000' }}
            onClick={() => router.push('/')}
          >
            Înregistrează-te Gratuit Acum
          </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}


