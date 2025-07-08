// Serviciu Oblio pentru generarea facturilor din webhook Stripe
// Bazat pe codul funcțional de la proiectul de parcări

interface OblioInvoiceData {
  subscriptionId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  planName: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  billingType: 'individual' | 'corporate';
  company?: string;
  companyVAT?: string;
  companyReg?: string;
  companyAddress?: string;
  // Date adresă client individual
  clientAddress?: string;
  clientCity?: string;
  clientCounty?: string;
  clientCountry?: string;
  currency?: string;
}

interface OblioConfig {
  clientId: string; // email de logare Oblio
  clientSecret: string; // token secret din setări
  companyCif: string; // CIF-ul companiei tale
  defaultSeries: string; // seria de facturi (ex: "FACT")
}

interface OblioAPIResponse {
  status: number;
  statusMessage: string;
  data: {
    seriesName: string;
    number: string;
    link: string;
  };
}

class OblioInvoiceService {
  private config: OblioConfig;
  private accessToken: string | null = null;
  private tokenExpires: number = 0;

  constructor(config: OblioConfig) {
    this.config = config;
  }

  // 1. Autentificare și obținere token
  private async authenticate(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpires) {
      console.log('🔄 Using cached Oblio token');
      return this.accessToken;
    }

    try {
      console.log('🔐 Attempting Oblio authentication...');
      console.log('🔐 Client ID (email):', this.config.clientId ? 'SET' : 'NOT SET');
      console.log('🔐 Client Secret:', this.config.clientSecret ? `SET (${this.config.clientSecret.length} chars)` : 'NOT SET');
      console.log('🔐 Company CIF:', this.config.companyCif ? 'SET' : 'NOT SET');
      
      const authPayload = {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      };
      
      console.log('🔐 Auth payload prepared, sending request to Oblio...');
      
      const response = await fetch('https://www.oblio.eu/api/authorize/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(authPayload),
      });

      console.log(`🔐 Oblio auth response status: ${response.status}`);
      console.log(`🔐 Oblio auth response statusText: ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Oblio auth failed - Response body:', errorText);
        throw new Error(`Oblio authentication failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Oblio auth successful, token received');
      console.log('🔐 Token expires in:', data.expires_in, 'seconds');
      
      this.accessToken = data.access_token;
      this.tokenExpires = Date.now() + (data.expires_in * 1000) - 60000; // -1 min pentru siguranță

      return this.accessToken!;
    } catch (error) {
      console.error('❌ Oblio authentication error:', error);
      // Resetează cache-ul în caz de eroare
      this.accessToken = null;
      this.tokenExpires = 0;
      throw error;
    }
  }

  // 2. Generare factură în Oblio
  async generateInvoice(invoiceData: OblioInvoiceData): Promise<{ success: boolean; invoiceNumber?: string; invoiceUrl?: string; error?: string }> {
    try {
      console.log('🧾 Generând factură Oblio pentru subscripția:', invoiceData.subscriptionId);
      console.log('📧 Oblio va trimite automat factura pe email:', invoiceData.clientEmail);

      const token = await this.authenticate();

      // Pregătire date pentru Oblio API
      const oblioInvoiceData = this.prepareInvoiceData(invoiceData);

      console.log('📋 Oblio invoice data prepared:', {
        clientName: oblioInvoiceData.client.name,
        clientEmail: oblioInvoiceData.client.email,
        hasAddress: !!oblioInvoiceData.client.address,
        hasCity: !!oblioInvoiceData.client.city,
        hasState: !!oblioInvoiceData.client.state,
        totalCost: invoiceData.totalCost,
        currency: oblioInvoiceData.currency
      });

      const response = await fetch('https://www.oblio.eu/api/docs/invoice', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(oblioInvoiceData),
      });

      console.log(`🏭 Oblio API response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Oblio API error response:', errorText);
        throw new Error(`Oblio API error: ${response.status} - ${errorText}`);
      }

      const result: OblioAPIResponse = await response.json();

      console.log('📊 Oblio API result:', {
        status: result.status,
        statusMessage: result.statusMessage,
        hasData: !!result.data,
        seriesName: result.data?.seriesName,
        number: result.data?.number,
        hasLink: !!result.data?.link
      });

      if (result.status === 200) {
        console.log('✅ Factură Oblio generată cu succes:', {
          seria: result.data.seriesName,
          numar: result.data.number,
          link: result.data.link,
        });
        console.log('📧 Email cu factura trimis automat către:', invoiceData.clientEmail);

        return {
          success: true,
          invoiceNumber: `${result.data.seriesName} ${result.data.number}`,
          invoiceUrl: result.data.link,
        };
      } else {
        throw new Error(`Oblio returned error: ${result.statusMessage}`);
      }

    } catch (error) {
      console.error('❌ Eroare la generarea facturii Oblio:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Eroare necunoscută',
      };
    }
  }

  // 3. Pregătire date pentru API Oblio
  private prepareInvoiceData(invoiceData: OblioInvoiceData) {
    // Calculare preț fără TVA pentru România (19% TVA)
    const totalWithVAT = invoiceData.totalCost;
    const isRON = invoiceData.currency === 'ron' || !invoiceData.currency;
    
    // Pentru RON aplicăm TVA 19%, pentru alte valute trimitem prețul ca este
    const priceWithoutVAT = isRON ? 
      Math.round((totalWithVAT / 1.19) * 100) / 100 : 
      totalWithVAT;

    const vatPercentage = isRON ? 19 : 0;
    const currency = isRON ? 'RON' : 'EUR';

    const planDisplayName = this.getPlanDisplayName(invoiceData.planName);

    const baseInvoiceData = {
      cif: this.config.companyCif,
      client: this.prepareClientData(invoiceData),
      issueDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      seriesName: this.config.defaultSeries,
      language: 'RO',
      precision: 2,
      currency: currency,
      sendEmail: 1, // Trimite automat factura pe email
      products: [
        {
          name: `Abonament ${planDisplayName}`,
          description: `Subscripție #${invoiceData.subscriptionId}\nPerioda: ${invoiceData.startDate} - ${invoiceData.endDate}\nPlan: ${planDisplayName}`,
          price: priceWithoutVAT,
          measuringUnit: 'bucată',
          vatName: vatPercentage > 0 ? 'Normala' : 'Neimpozabila',
          vatPercentage: vatPercentage,
          vatIncluded: false,
          quantity: 1,
          productType: 'Serviciu',
        },
      ],
      mentions: `Factură generată automat pentru abonamentul #${invoiceData.subscriptionId}. Plata a fost procesată prin Stripe.`,
      internalNote: `Subscription ID: ${invoiceData.subscriptionId} | Stripe Payment`,
      collect: {
        type: 'Card',
        documentNumber: `STRIPE-${invoiceData.subscriptionId}`,
        value: totalWithVAT,
        issueDate: new Date().toISOString().split('T')[0],
        mentions: 'Plată procesată prin Stripe',
      },
    };

    return baseInvoiceData;
  }

  // 4. Pregătire date client
  private prepareClientData(invoiceData: OblioInvoiceData) {
    if (invoiceData.billingType === 'corporate' && invoiceData.company) {
      // Client corporativ
      console.log('📊 Preparing corporate client data for:', invoiceData.company);
      return {
        cif: invoiceData.companyVAT || '',
        name: invoiceData.company,
        rc: invoiceData.companyReg || '',
        address: invoiceData.companyAddress || invoiceData.clientAddress || '',
        email: invoiceData.clientEmail,
        phone: invoiceData.clientPhone || '',
        contact: invoiceData.clientName,
        vatPayer: true,
        save: 1, // Salvează clientul în baza de date Oblio
      };
    } else {
      // Client individual - trimitem câmpurile separate pentru a fi procesate corect de Oblio
      console.log('📊 Preparing individual client data for:', invoiceData.clientName);
      console.log('📊 Address details:', {
        address: invoiceData.clientAddress || 'MISSING',
        city: invoiceData.clientCity || 'MISSING',
        county: invoiceData.clientCounty || 'MISSING',
        country: invoiceData.clientCountry || 'Romania'
      });
      
      return {
        name: invoiceData.clientName,
        address: invoiceData.clientAddress || '', // Adresa principală (strada + numărul)
        state: invoiceData.clientCounty || '', // Județul
        city: invoiceData.clientCity || '', // Orașul/Localitatea
        country: invoiceData.clientCountry || 'Romania', // Țara (default Romania)
        email: invoiceData.clientEmail,
        phone: invoiceData.clientPhone || '',
        vatPayer: false,
        save: 1,
      };
    }
  }

  // 5. Obținere nume plan user-friendly
  private getPlanDisplayName(priceId: string): string {
    const planNames: { [key: string]: string } = {
      'price_premium_monthly': 'Premium Lunar',
      'price_premium_yearly': 'Premium Anual',
      'premium_monthly': 'Premium Lunar',
      'premium_yearly': 'Premium Anual',
    };

    return planNames[priceId] || `Abonament Premium (${priceId})`;
  }

  // 6. Obținere detalii factură
  async getInvoiceDetails(seriesName: string, number: string) {
    try {
      const token = await this.authenticate();

      const response = await fetch(
        `https://www.oblio.eu/api/docs/invoice?cif=${this.config.companyCif}&seriesName=${seriesName}&number=${number}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get invoice details: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting invoice details:', error);
      throw error;
    }
  }
}

// Configurare serviciu pentru SocialMediaApp
const oblioConfig: OblioConfig = {
  clientId: process.env.OBLIO_EMAIL!, // Email-ul tău Oblio
  clientSecret: process.env.OBLIO_SECRET!, // Token din setări Oblio  
  companyCif: process.env.OBLIO_CIF!, // CIF-ul companiei tale
  defaultSeries: process.env.OBLIO_SERIES || 'FACT', // Seria de facturi
};

console.log('🔧 Oblio Service Initialization:', {
  hasEmail: !!process.env.OBLIO_EMAIL,
  hasSecret: !!process.env.OBLIO_SECRET,
  hasCIF: !!process.env.OBLIO_CIF,
  hasSeries: !!process.env.OBLIO_SERIES,
  defaultSeries: oblioConfig.defaultSeries
});

// Export serviciu configurat
export const oblioService = new OblioInvoiceService(oblioConfig);

// Funcție helper pentru generarea facturilor
export async function generateOblioInvoice(invoiceData: OblioInvoiceData) {
  return await oblioService.generateInvoice(invoiceData);
}

// Funcție pentru convertirea datelor de la Stripe la formatul Oblio
export function convertStripeToOblioData(customerData: any, subscriptionData: any, totalAmount: number): OblioInvoiceData {
  // Determinăm tipul de client
  const billingType = customerData.company ? 'corporate' : 'individual';
  
  // Formatăm datele pentru Oblio
  const startDate = new Date().toISOString().split('T')[0];
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // +30 zile

  return {
    subscriptionId: subscriptionData.subscriptionId,
    clientName: customerData.firstName && customerData.lastName ? 
      `${customerData.firstName} ${customerData.lastName}` : 
      customerData.firstName || 'Client YDestiny',
    clientEmail: customerData.email,
    clientPhone: customerData.phone,
    planName: subscriptionData.priceId || 'premium',
    startDate: startDate,
    endDate: endDate,
    totalCost: totalAmount / 100, // Stripe trimite în cenți
    billingType: billingType,
    company: customerData.company,
    companyVAT: customerData.companyVat,
    companyReg: customerData.companyReg,
    companyAddress: customerData.address,
    clientAddress: customerData.address,
    clientCity: customerData.city,
    clientCounty: customerData.state,
    clientCountry: customerData.country || 'Romania',
    currency: subscriptionData.currency || 'ron'
  };
}

export type { OblioInvoiceData }; 