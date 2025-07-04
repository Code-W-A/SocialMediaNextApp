// Oblio Invoice Service for YDestiny Social Media App
// Adapted from parking app example for subscription-based social media platform

/**
 * Oblio Invoice Data structure for YDestiny subscriptions
 * @typedef {Object} OblioInvoiceData
 * @property {string} subscriptionId
 * @property {string} clientName
 * @property {string} clientEmail
 * @property {string} [clientPhone]
 * @property {string} startDate
 * @property {string} endDate
 * @property {number} totalCost - in cents from Stripe
 * @property {'individual'|'corporate'} billingType
 * @property {string} [company]
 * @property {string} [companyVAT]
 * @property {string} [companyReg]
 * @property {string} [companyAddress]
 * @property {string} [clientAddress] - Adresa client individual pentru e-factura
 * @property {string} [clientCity] - Orașul
 * @property {string} [clientCounty] - Județul
 * @property {string} [clientCountry] - Țara
 */

/**
 * Oblio Configuration
 * @typedef {Object} OblioConfig
 * @property {string} clientId - email de logare Oblio
 * @property {string} clientSecret - token secret din setări
 * @property {string} companyCif - CIF-ul companiei YDestiny
 * @property {string} defaultSeries - seria de facturi (ex: "YD")
 */

/**
 * Oblio API Response
 * @typedef {Object} OblioAPIResponse
 * @property {number} status
 * @property {string} statusMessage
 * @property {Object} data
 * @property {string} data.seriesName
 * @property {string} data.number
 * @property {string} data.link
 */

class OblioInvoiceService {
  constructor(config) {
    this.config = config;
    this.accessToken = null;
    this.tokenExpires = 0;
  }

  // 1. Autentificare și obținere token
  async authenticate() {
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

      return this.accessToken;
    } catch (error) {
      console.error('❌ Oblio authentication error:', error);
      // Resetează cache-ul în caz de eroare
      this.accessToken = null;
      this.tokenExpires = 0;
      throw error;
    }
  }

  // 2. Generare factură în Oblio pentru YDestiny
  async generateInvoice(invoiceData) {
    try {
      console.log('🧾 Generând factură Oblio pentru abonamentul:', invoiceData.subscriptionId);
      console.log('📧 Oblio va trimite automat factura pe email:', invoiceData.clientEmail);

      const token = await this.authenticate();

      // Pregătire date pentru Oblio API
      const oblioInvoiceData = this.prepareInvoiceData(invoiceData);

      const response = await fetch('https://www.oblio.eu/api/docs/invoice', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(oblioInvoiceData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Oblio API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

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
  prepareInvoiceData(invoiceData) {
    // Calculare preț fără TVA (19% este inclus în totalCost din Stripe)
    const totalWithVAT = invoiceData.totalCost / 100; // Convert from cents
    const priceWithoutVAT = Math.round((totalWithVAT / 1.19) * 100) / 100;

    const baseInvoiceData = {
      cif: this.config.companyCif,
      client: this.prepareClientData(invoiceData),
      issueDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      seriesName: this.config.defaultSeries,
      language: 'RO',
      precision: 2,
      currency: 'RON',
      sendEmail: 1, // Trimite automat factura pe email
      products: [
        {
          name: `Abonament Premium YDestiny`,
          description: `Abonament Premium pentru aplicația YDestiny\nPerioda: ${invoiceData.startDate} - ${invoiceData.endDate}\nFuncționalități avansate, acces nelimitat`,
          price: priceWithoutVAT,
          measuringUnit: 'bucată',
          vatName: 'Normala',
          vatPercentage: 19,
          vatIncluded: false,
          quantity: 1,
          productType: 'Serviciu',
        },
      ],
      mentions: `Factură generată automat pentru abonamentul Premium YDestiny #${invoiceData.subscriptionId}. Plata a fost procesată prin Stripe.`,
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

  // 4. Pregătire date client conform exemplului
  prepareClientData(invoiceData) {
    if (invoiceData.billingType === 'corporate' && invoiceData.company) {
      // Client corporativ
      return {
        cif: invoiceData.companyVAT || '',
        name: invoiceData.company,
        rc: invoiceData.companyReg || '',
        address: invoiceData.companyAddress || '',
        email: invoiceData.clientEmail,
        phone: invoiceData.clientPhone || '',
        contact: invoiceData.clientName,
        vatPayer: true,
        save: 1, // Salvează clientul în baza de date Oblio
      };
    } else {
      // Client individual - trimitem câmpurile separate pentru a fi procesate corect de Oblio
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

  // 5. Obținere detalii factură
  async getInvoiceDetails(seriesName, number) {
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

// Configurare serviciu pentru YDestiny
const oblioConfig = {
  clientId: process.env.OBLIO_EMAIL,
  clientSecret: process.env.OBLIO_SECRET,
  companyCif: process.env.OBLIO_CIF,
  defaultSeries: process.env.OBLIO_SERIES || 'YD',
};

// Export serviciu configurat
export const oblioService = new OblioInvoiceService(oblioConfig);

// Funcție helper pentru generarea facturilor pentru YDestiny
export async function generateOblioInvoice(invoiceData) {
  return await oblioService.generateInvoice(invoiceData);
}

// Helper pentru convertirea datelor din Stripe la format Oblio
export function convertStripeToOblioData(customerData, subscriptionData, paymentAmount) {
  const startDate = new Date().toISOString().split('T')[0];
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // +30 days

  return {
    subscriptionId: subscriptionData.subscriptionId || 'N/A',
    clientName: `${customerData.firstName} ${customerData.lastName}`,
    clientEmail: customerData.email,
    clientPhone: customerData.phone,
    startDate,
    endDate,
    totalCost: paymentAmount,
    billingType: customerData.company ? 'corporate' : 'individual',
    company: customerData.company,
    companyVAT: customerData.companyVat,
    companyReg: customerData.companyReg,
    companyAddress: customerData.company ? customerData.address : undefined,
    // Date adresă client individual pentru e-factura
    clientAddress: !customerData.company ? customerData.address : undefined,
    clientCity: !customerData.company ? customerData.city : undefined,
    clientCounty: !customerData.company ? customerData.state : undefined,
    clientCountry: !customerData.company ? customerData.country : undefined,
  };
} 