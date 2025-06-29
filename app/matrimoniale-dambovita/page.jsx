'use client';

import { Typography, Row, Col, Card, Button, Space, Rate } from 'antd';
import { HeartOutlined, UserOutlined, CrownOutlined, CheckOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;

export default function MatrimonialePageDambovita() {
  const cityData = {
    name: 'Dâmbovița',
    county: 'Dâmbovița',
    population: '518.745',
    description: 'județul cu tradiție și istorie',
    landmarks: ['Curtea Domnească Târgoviște', 'Mănăstirea Dealu', 'Lacul Vidraru', 'Castelul Peleș'],
    districts: ['Târgoviște', 'Moreni', 'Pucioasa', 'Găești', 'Titu']
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F8F6F0 0%, #F0EDE5 100%)',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '4rem 0 2rem',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <Title level={1} style={{ 
            color: 'white', 
            fontSize: '3rem', 
            marginBottom: '1rem',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            Matrimoniale {cityData.name}
          </Title>
          <Paragraph style={{ 
            fontSize: '1.5rem', 
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '2rem'
          }}>
            Cel mai bun site de matrimoniale din {cityData.county}
          </Paragraph>
          <Button
            type="primary"
            size="large"
            icon={<HeartOutlined />}
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              border: 'none',
              borderRadius: '25px',
              height: '60px',
              fontSize: '18px',
              fontWeight: '600',
              padding: '0 3rem',
              color: '#000'
            }}
          >
            <Link href="/register" style={{ color: '#000', textDecoration: 'none' }}>
              Înregistrează-te Gratuit
            </Link>
          </Button>
        </div>
      </div>

      {/* Conținut principal */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
        
        {/* Introducere detaliată */}
        <Card style={{
          borderRadius: '20px',
          border: 'none',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          background: 'white',
          marginBottom: '3rem'
        }}>
          <Title level={2} style={{ color: '#2C3E50', marginBottom: '2rem' }}>
            <HeartOutlined style={{ color: '#FFD700', marginRight: '10px' }} />
            Matrimoniale Serioase în {cityData.name} - Găsește-ți Jumătatea Perfectă
          </Title>
          
          <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '1.5rem' }}>
            Bun venit pe cea mai de încredere platformă de <strong>matrimoniale din {cityData.name}</strong>! 
            Destiny este site-ul preferat de mii de persoane din {cityData.county} care caută relații serioase 
            și căsătorie. Cu o comunitate activă de membri verificați din {cityData.name}, șansele tale de a găsi 
            pe cineva special sunt mai mari ca niciodată.
          </Paragraph>

          <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '1.5rem' }}>
            <strong>De ce să alegi matrimonialele Destiny în {cityData.name}?</strong> Pentru că înțelegem 
            importanța unei relații autentice și durabile. Membrii noștri din {cityData.name} și din întregul 
            județ {cityData.county} sunt persoane educate, cu principii solide, care caută adevărata dragoste.
          </Paragraph>

          <div style={{
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            padding: '2rem',
            borderRadius: '15px',
            marginTop: '2rem'
          }}>
            <Title level={3} style={{ color: '#2C3E50', marginBottom: '1rem', textAlign: 'center' }}>
              🎯 Statistici Matrimoniale {cityData.name} - Anul 2024
            </Title>
            <Row gutter={[24, 24]}>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2C3E50' }}>2000+</div>
                  <div style={{ color: '#2C3E50', fontSize: '14px', fontWeight: '600' }}>Membri activi</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2C3E50' }}>150+</div>
                  <div style={{ color: '#2C3E50', fontSize: '14px', fontWeight: '600' }}>Cupluri în 2024</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2C3E50' }}>95%</div>
                  <div style={{ color: '#2C3E50', fontSize: '14px', fontWeight: '600' }}>Satisfacție</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2C3E50' }}>24/7</div>
                  <div style={{ color: '#2C3E50', fontSize: '14px', fontWeight: '600' }}>Suport</div>
                </div>
              </Col>
            </Row>
          </div>
        </Card>

        {/* Avantajele platformei */}
        <Card style={{
          borderRadius: '20px',
          border: 'none',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          background: 'white',
          marginBottom: '3rem'
        }}>
          <Title level={2} style={{ color: '#2C3E50', marginBottom: '2rem', textAlign: 'center' }}>
            De ce Matrimonialele Destiny sunt Alegerea #1 în {cityData.name}?
          </Title>
          
          <Row gutter={[24, 24]}>
            {[
              {
                title: 'Profil Verificat și Sigur',
                description: `Toate profilurile din ${cityData.name} sunt verificate manual de echipa noastră. Garantăm autenticitatea informațiilor și siguranța utilizatorilor.`
              },
              {
                title: 'Chat Gratuit și Nelimitat',
                description: `Comunicarea cu persoanele din ${cityData.name} este complet gratuită. Poți trimite mesaje nelimitat și poți vorbi la telefon prin aplicația noastră.`
              },
              {
                title: 'Căutare Avansată după Criterii',
                description: `Găsește exact tipul de persoană pe care o cauți în ${cityData.name}. Filtrează după vârstă, educație, profesie, religie, hobby-uri și multe altele.`
              },
              {
                title: 'Notificări Instant pentru Mesaje',
                description: `Primești notificări în timp real când cineva din ${cityData.name} îți trimite un mesaj sau vizitează profilul tău. Nu vei rata nicio oportunitate.`
              },
              {
                title: 'Suport 24/7 pentru Utilizatori',
                description: `Echipa noastră de specialiști în relații este disponibilă non-stop pentru a te ajuta să găsești dragostea în ${cityData.name}. Oferim consiliere gratuită.`
              },
              {
                title: 'Protecția Datelor Personale',
                description: `Respectăm GDPR și protejăm cu maximă atenție datele tale personale. Informațiile tale din ${cityData.name} sunt în siguranță completă.`
              }
            ].map((feature, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,165,0,0.05))',
                  borderRadius: '15px',
                  height: '100%',
                  border: '1px solid rgba(255,215,0,0.2)'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    boxShadow: '0 8px 20px rgba(255, 215, 0, 0.3)'
                  }}>
                    <CheckOutlined style={{ color: '#2C3E50', fontSize: '1.5rem' }} />
                  </div>
                  <Title level={4} style={{ color: '#2C3E50', marginBottom: '1rem' }}>
                    {feature.title}
                  </Title>
                  <Paragraph style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                    {feature.description}
                  </Paragraph>
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Despre județul */}
        <Card style={{
          borderRadius: '20px',
          border: 'none',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          background: 'white',
          marginBottom: '3rem'
        }}>
          <Title level={2} style={{ color: '#2C3E50', marginBottom: '2rem' }}>
            {cityData.name} - Județul Perfect pentru Întâlniri Romantice și Căsătorie
          </Title>
          
          <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '1.5rem' }}>
            {cityData.name}, cu o populație de {cityData.population} de locuitori, este unul dintre cele mai 
            frumoase și vibrant județe din România pentru a găsi dragostea adevărată. Cunoscut ca {cityData.description}, 
            {cityData.name} oferă numeroase locuri romantice pentru întâlniri, o viață culturală bogată și o 
            comunitate diversă de persoane educate și ambițioase care caută relații serioase și căsătorie.
          </Paragraph>

          <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '1.5rem' }}>
            Printre cele mai populare și romantice locuri pentru întâlniri în {cityData.name} se numără: {' '}
            {cityData.landmarks.join(', ')}. Aceste locații oferă cadrul perfect pentru prima întâlnire 
            cu persoana pe care o vei cunoaște prin matrimonialele Destiny. Fie că preferi o plimbare liniștită 
            prin parcuri, o vizită la muzee și atracții culturale, sau o cină romantică la unul dintre 
            restaurantele de top din {cityData.name}, județul oferă infinite posibilități pentru a impresiona 
            și a cunoaște mai bine persoana specială din viața ta.
          </Paragraph>

          <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '1.5rem' }}>
            Orașele principale din {cityData.name} unde membrii noștri sunt cel mai activi includ: {' '}
            {cityData.districts?.join(', ')}. Indiferent de orașul în care locuiești în {cityData.name}, 
            vei găsi persoane compatibile din apropierea ta. Platforma noastră îți permite să setezi raza 
            de căutare și să găsești persoane care locuiesc la distanța dorită de tine, facilitând astfel 
            întâlnirile și dezvoltarea relației în mod natural și convenient.
          </Paragraph>

          <div style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            padding: '2rem',
            borderRadius: '15px',
            marginTop: '2rem'
          }}>
            <Title level={3} style={{ color: 'white', marginBottom: '1rem', textAlign: 'center' }}>
              🏆 {cityData.name} - Capitala Dragostei Adevărate în România
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', marginBottom: 0, textAlign: 'center' }}>
              Alătură-te comunității de matrimoniale din {cityData.name} și descoperă de ce atât de multe 
              cupluri și-au găsit fericirea și și-au construit familii fericite aici. Cu membri activi din 
              toate orașele și zonele județului, șansele tale de a găsi pe cineva cu adevărat compatibil 
              sunt excepționale! Începe astăzi călătoria către dragostea adevărată în {cityData.name}.
            </Paragraph>
          </div>
        </Card>

        {/* Testimoniale și povești de succes */}
        <Card style={{
          borderRadius: '20px',
          border: 'none',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          background: 'white',
          marginBottom: '3rem'
        }}>
          <Title level={2} style={{ textAlign: 'center', color: '#2C3E50', marginBottom: '3rem' }}>
            Povești de Succes și Testimoniale din {cityData.name}
          </Title>
          
          <Row gutter={[24, 24]}>
            {[
              {
                name: 'Maria și Alexandru din ' + cityData.name,
                text: `Ne-am cunoscut prin Destiny în ${cityData.name} în primăvara anului trecut și acum suntem căsătoriți de 6 luni! Mulțumim echipei Destiny pentru că ne-ați unit destinele. Site-ul vostru de matrimoniale este cu adevărat cel mai serios din ${cityData.county}.`,
                rating: 5
              },
              {
                name: 'Elena și Cristian din ' + cityData.county,
                text: `După multe încercări pe alte site-uri de matrimoniale, am găsit în sfârșit pe Destiny exact ce căutam. Site-ul de matrimoniale cel mai de încredere din ${cityData.name}. Recomandăm cu căldură tuturor persoanelor serioase care caută dragostea adevărată.`,
                rating: 5
              },
              {
                name: 'Andreea și Marius din ' + cityData.name,
                text: `Suntem împreună de 2 ani și planificăm nunta pentru anul viitor. Destiny ne-a schimbat viața! Matrimonialele din ${cityData.name} pe această platformă sunt cu adevărat pentru persoane serioase. Mulțumim că existați!`,
                rating: 5
              }
            ].map((testimonial, index) => (
              <Col xs={24} md={8} key={index}>
                <div style={{
                  padding: '2rem',
                  background: 'linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.05))',
                  borderRadius: '15px',
                  height: '100%',
                  border: '1px solid rgba(102,126,234,0.2)'
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <Rate disabled defaultValue={testimonial.rating} style={{ color: '#FFD700' }} />
                  </div>
                  <Paragraph style={{ 
                    fontStyle: 'italic', 
                    fontSize: '15px', 
                    lineHeight: '1.6',
                    marginBottom: '1.5rem',
                    color: '#555'
                  }}>
                    "{testimonial.text}"
                  </Paragraph>
                  <div style={{ textAlign: 'center' }}>
                    <Text strong style={{ color: '#2C3E50', fontSize: '16px' }}>
                      {testimonial.name}
                    </Text>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Întrebări frecvente */}
        <Card style={{
          borderRadius: '20px',
          border: 'none',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          background: 'white',
          marginBottom: '3rem'
        }}>
          <Title level={2} style={{ textAlign: 'center', color: '#2C3E50', marginBottom: '3rem' }}>
            Întrebări Frecvente - Matrimoniale {cityData.name}
          </Title>
          
          <Row gutter={[24, 24]}>
            {[
              {
                question: `Cum funcționează matrimonialele în ${cityData.name}?`,
                answer: `Matrimonialele Destiny în ${cityData.name} funcționează foarte simplu și intuitiv: te înregistrezi gratuit pe platforma noastră, completezi profilul cu informații detaliate despre tine și despre persoana pe care o cauți, folosești funcția de căutare avansată pentru a găsi persoane compatibile din ${cityData.county}, și începi să comunici prin chat securizat. Echipa noastră te ghidează pas cu pas în acest proces.`
              },
              {
                question: `Este sigur să folosesc site-ul de matrimoniale în ${cityData.name}?`,
                answer: `Absolut da! Destiny este cel mai sigur și de încredere site de matrimoniale din ${cityData.name}. Toate profilurile sunt verificate manual de echipa noastră, datele personale sunt protejate conform GDPR, iar echipa noastră de moderatori monitorizează activitatea 24/7 pentru a asigura un mediu sigur și respectuos pentru toți membrii din ${cityData.name}.`
              },
              {
                question: `Câte persoane sunt înregistrate din ${cityData.name}?`,
                answer: `Avem peste 2000 de membri activi din ${cityData.name} și din întregul județ ${cityData.county}, cu noi înregistrări zilnice. Comunitatea noastră din ${cityData.name} este în continuă creștere, ceea ce înseamnă că șansele să găsești pe cineva cu adevărat compatibil sunt foarte mari și în continuă creștere.`
              },
              {
                question: `Pot să caut persoane din alte județe din România?`,
                answer: `Desigur! Poți căuta persoane din întreaga România sau chiar din alte județe. Funcția noastră de căutare avansată îți permite să setezi raza de căutare exactă, de la ${cityData.name} la nivel național, în funcție de preferințele tale și de cât de departe ești dispus(ă) să călătorești pentru dragostea adevărată.`
              }
            ].map((faq, index) => (
              <Col xs={24} lg={12} key={index}>
                <div style={{
                  padding: '2rem',
                  background: 'rgba(248,246,240,0.5)',
                  borderRadius: '15px',
                  height: '100%',
                  border: '1px solid rgba(255,215,0,0.2)'
                }}>
                  <Title level={4} style={{ color: '#2C3E50', marginBottom: '1rem' }}>
                    {faq.question}
                  </Title>
                  <Paragraph style={{ color: '#666', fontSize: '15px', lineHeight: '1.6', marginBottom: 0 }}>
                    {faq.answer}
                  </Paragraph>
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Call to action final */}
        <Card style={{
          borderRadius: '20px',
          border: 'none',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <Title level={2} style={{ color: 'white', marginBottom: '2rem' }}>
            Începe Astăzi Căutarea Dragostei în {cityData.name}!
          </Title>
          <Paragraph style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '2rem' }}>
            Nu mai aștepta! Mii de persoane din {cityData.name} te așteaptă să le descoperi. 
            Înregistrează-te gratuit și începe să construiești relația visurilor tale.
          </Paragraph>
          <Button
            type="primary"
            size="large"
            icon={<HeartOutlined />}
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              border: 'none',
              borderRadius: '25px',
              height: '60px',
              fontSize: '18px',
              fontWeight: '600',
              padding: '0 3rem',
              color: '#000'
            }}
          >
            <Link href="/register" style={{ color: '#000', textDecoration: 'none' }}>
              Înregistrează-te Gratuit Acum
            </Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}