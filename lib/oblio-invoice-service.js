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
    console.log('\n🧾 ===== OBLIO INVOICE SERVICE - GENERATE INVOICE =====');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('📦 Input Invoice Data:', {
      hasSubscriptionId: !!invoiceData.subscriptionId,
      subscriptionId: invoiceData.subscriptionId || 'N/A',
      clientName: invoiceData.clientName || 'N/A',
      clientEmail: invoiceData.clientEmail || 'N/A',
      totalCost: invoiceData.totalCost || 'N/A',
      billingType: invoiceData.billingType || 'N/A',
      hasStartDate: !!invoiceData.startDate,
      hasEndDate: !!invoiceData.endDate,
      hasCompany: !!invoiceData.company,
      hasCompanyVAT: !!invoiceData.companyVAT,
      hasClientAddress: !!invoiceData.clientAddress
    });
    
    try {
      console.log('🧾 Generând factură Oblio pentru abonamentul:', invoiceData.subscriptionId);
      console.log('📧 Oblio va trimite automat factura pe email:', invoiceData.clientEmail);

      console.log('🔐 Requesting authentication token...');
      const token = await this.authenticate();
      console.log('✅ Authentication successful, token received');

      // Pregătire date pentru Oblio API
      console.log('📋 Preparing invoice data for Oblio API...');
      const oblioInvoiceData = this.prepareInvoiceData(invoiceData);
      console.log('📋 Invoice data prepared successfully');

      console.log('🌐 Sending invoice request to Oblio API...');
      console.log('🔗 Request URL: https://www.oblio.eu/api/docs/invoice');
      console.log('📄 Request Body Size:', JSON.stringify(oblioInvoiceData).length, 'bytes');
      console.log('🔐 Authorization token length:', token ? token.length : 'N/A');

      const response = await fetch('https://www.oblio.eu/api/docs/invoice', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(oblioInvoiceData),
      });

      console.log('📡 Response Status:', response.status, response.statusText);
      console.log('📋 Response Headers:', {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        server: response.headers.get('server')
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Oblio API error response:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        throw new Error(`Oblio API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('📦 Oblio API Response:', {
        status: result.status,
        statusMessage: result.statusMessage,
        hasData: !!result.data,
        dataKeys: result.data ? Object.keys(result.data) : []
      });

      if (result.status === 200) {
        console.log('✅ Factură Oblio generată cu succes:', {
          seria: result.data.seriesName,
          numar: result.data.number,
          link: result.data.link,
        });
        console.log('📧 Email cu factura trimis automat către:', invoiceData.clientEmail);

        const successResult = {
          success: true,
          invoiceNumber: `${result.data.seriesName} ${result.data.number}`,
          invoiceUrl: result.data.link,
        };
        
        console.log('📋 Returning Success Result:', successResult);
        console.log('🧾 ===== OBLIO INVOICE SERVICE - SUCCESS =====\n');
        return successResult;
      } else {
        console.error('❌ Oblio returned error status:', {
          status: result.status,
          statusMessage: result.statusMessage,
          fullResult: result
        });
        
        // Check if error is about document series
        if (result.statusMessage && result.statusMessage.includes('Seria Documentului')) {
          console.log('🔍 Document series error detected. Checking available series...');
          const availableSeries = await this.checkAvailableSeries();
          
          if (availableSeries && availableSeries.length > 0) {
            console.log('📄 Retrying with first available series:', availableSeries[0]);
            
            // Retry with the first available series
            const modifiedInvoiceData = { ...invoiceData };
            const retryOblioData = this.prepareInvoiceData(modifiedInvoiceData);
            retryOblioData.seriesName = availableSeries[0].name || availableSeries[0];
            
            console.log('🔄 Retrying invoice creation with series:', retryOblioData.seriesName);
            
            const retryResponse = await fetch('https://www.oblio.eu/api/docs/invoice', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(retryOblioData),
            });
            
            if (retryResponse.ok) {
              const retryResult = await retryResponse.json();
              if (retryResult.status === 200) {
                console.log('✅ Invoice created successfully with alternative series!');
                return {
                  success: true,
                  invoiceNumber: `${retryResult.data.seriesName} ${retryResult.data.number}`,
                  invoiceUrl: retryResult.data.link,
                };
              }
            }
          } else {
            console.log('❌ No available series found. Attempting to create default series...');
            
            // Try to create a default series
            const defaultSeriesName = this.config.defaultSeries || 'YD';
            const createdSeries = await this.createDefaultSeries(defaultSeriesName);
            
            if (createdSeries) {
              console.log('✅ Default series created. Retrying invoice creation...');
              
              // Retry with the newly created series
              const modifiedInvoiceData = { ...invoiceData };
              const retryOblioData = this.prepareInvoiceData(modifiedInvoiceData);
              retryOblioData.seriesName = defaultSeriesName;
              
              console.log('🔄 Retrying invoice creation with new series:', defaultSeriesName);
              
              const retryResponse = await fetch('https://www.oblio.eu/api/docs/invoice', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(retryOblioData),
              });
              
              if (retryResponse.ok) {
                const retryResult = await retryResponse.json();
                if (retryResult.status === 200) {
                  console.log('✅ Invoice created successfully with new series!');
                  return {
                    success: true,
                    invoiceNumber: `${retryResult.data.seriesName} ${retryResult.data.number}`,
                    invoiceUrl: retryResult.data.link,
                  };
                }
              }
            } else {
              console.log('❌ Failed to create default series. Manual configuration required.');
              console.log('📋 Manual Instructions:');
              console.log('   1. Login to Oblio dashboard: https://www.oblio.eu');
              console.log('   2. Go to Settings > Document Series');
              console.log('   3. Create a new series (e.g., "YD", "INV", "FACT")');
              console.log('   4. Set OBLIO_SERIES environment variable to the series name');
            }
          }
        }
        
        throw new Error(`Oblio returned error: ${result.statusMessage}`);
      }

    } catch (error) {
      console.error('❌ Eroare la generarea facturii Oblio:', {
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name,
        subscriptionId: invoiceData.subscriptionId || 'N/A'
      });
      
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Eroare necunoscută',
      };
      
      console.log('❌ Returning Error Result:', errorResult);
      console.log('🧾 ===== OBLIO INVOICE SERVICE - FAILED =====\n');
      return errorResult;
    }
  }

  // 3. Pregătire date pentru API Oblio
  // IMPORTANT: Factura afișează suma totală plătită (TVA inclus) pentru consistență cu suma retrânsă din contul bancar
  // Înainte: Factura 4.20 EUR + TVA 0.80 EUR = Total 5.00 EUR (confuz pentru client)
  // Acum: Factura 5.00 EUR (TVA inclus) = suma retrânsă din cont (transparent)
  prepareInvoiceData(invoiceData) {
    console.log('\n📋 ===== PREPARING INVOICE DATA FOR OBLIO API =====');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('💰 Price Calculation Input:', {
      totalCostInCents: invoiceData.totalCost,
      totalCostInEuros: invoiceData.totalCost / 100
    });
    
    // Afișează prețul total plătit (TVA inclus) pentru consistență cu suma retrânsă din cont
    const totalWithVAT = invoiceData.totalCost / 100; // Convert from cents (suma reală plătită)
    const priceWithoutVAT = Math.round((totalWithVAT / 1.19) * 100) / 100;
    
    console.log('💰 Price Calculation Result (Updated for Customer Clarity):', {
      totalPaidByCustomer: totalWithVAT, // Suma retrânsă din cont
      priceWithoutVAT: priceWithoutVAT,
      vatAmount: totalWithVAT - priceWithoutVAT,
      vatPercentage: 19,
      invoiceDisplayMethod: 'TVA inclus în preț pentru consistență cu plata'
    });

    console.log('📄 Document Series Configuration:', {
      environmentVariable: process.env.OBLIO_SERIES ? `✅ ${process.env.OBLIO_SERIES}` : '❌ Not Set',
      configDefaultSeries: this.config.defaultSeries,
      finalSeries: this.config.defaultSeries,
      configuredInEnv: !!process.env.OBLIO_SERIES
    });

    const baseInvoiceData = {
      cif: this.config.companyCif,
      client: this.prepareClientData(invoiceData),
      issueDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      seriesName: this.config.defaultSeries,
      language: 'RO',
      precision: 2,
      currency: 'EUR',
      sendEmail: 1, // Trimite automat factura pe email
      products: [
        {
          name: `Abonament Premium YDestiny`,
          description: `Abonament Premium pentru aplicația YDestiny\nPerioda: ${invoiceData.startDate} - ${invoiceData.endDate}\nFuncționalități avansate, acces nelimitat\n\n✅ Suma afișată corespunde cu suma retrânsă din cont (${totalWithVAT} EUR)`,
          price: totalWithVAT,
          measuringUnit: 'bucată',
          vatName: 'Normala',
          vatPercentage: 19,
          vatIncluded: true,
          quantity: 1,
          productType: 'Serviciu',
        },
      ],
      mentions: `Factură generată automat pentru abonamentul Premium YDestiny #${invoiceData.subscriptionId}. Plata a fost procesată prin Stripe. Suma afișată (${totalWithVAT} EUR) corespunde cu suma retrânsă din contul bancar.`,
      internalNote: `Subscription ID: ${invoiceData.subscriptionId} | Stripe Payment | Amount: ${totalWithVAT} EUR`,
      collect: {
        type: 'Card',
        documentNumber: `STRIPE-${invoiceData.subscriptionId}`,
        value: totalWithVAT,
        issueDate: new Date().toISOString().split('T')[0],
        mentions: `Plată procesată prin Stripe - ${totalWithVAT} EUR (TVA inclus)`,
      },
    };

    console.log('📋 Final Invoice Data Structure:', {
      cif: baseInvoiceData.cif,
      clientInfo: {
        hasClient: !!baseInvoiceData.client,
        clientType: invoiceData.billingType || 'individual'
      },
      issueDate: baseInvoiceData.issueDate,
      seriesName: baseInvoiceData.seriesName,
      currency: baseInvoiceData.currency,
      sendEmail: baseInvoiceData.sendEmail,
      productInfo: {
        name: baseInvoiceData.products[0].name,
        price: baseInvoiceData.products[0].price,
        quantity: baseInvoiceData.products[0].quantity,
        vatPercentage: baseInvoiceData.products[0].vatPercentage,
        vatIncluded: baseInvoiceData.products[0].vatIncluded,
        note: 'Preț afișat = suma retrânsă din contul bancar'
      },
      collectInfo: {
        type: baseInvoiceData.collect.type,
        value: baseInvoiceData.collect.value,
        documentNumber: baseInvoiceData.collect.documentNumber
      }
    });
    
    console.log('📋 ===== INVOICE DATA PREPARATION COMPLETED =====\n');
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

  // Helper method to check available document series in Oblio
  async checkAvailableSeries() {
    console.log('\n📄 ===== CHECKING AVAILABLE DOCUMENT SERIES =====');
    console.log('📅 Timestamp:', new Date().toISOString());
    
    try {
      const token = await this.authenticate();
      
      // Try to get company info which might include available series
      const response = await fetch(`https://www.oblio.eu/api/nomenclature/series?cif=${this.config.companyCif}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Series Check Response Status:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('📋 Available Series Result:', result);
        
        if (result.status === 200 && result.data) {
          console.log('✅ Available Document Series:', result.data);
          return result.data;
        }
      } else {
        const errorText = await response.text();
        console.log('⚠️ Could not fetch available series:', errorText);
      }
    } catch (error) {
      console.log('⚠️ Error checking available series:', error.message);
    }
    
    console.log('📄 ===== SERIES CHECK COMPLETED =====\n');
    return null;
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

  // Helper method to create a default document series in Oblio
  async createDefaultSeries(seriesName = 'YD') {
    console.log('\n📄 ===== CREATING DEFAULT DOCUMENT SERIES =====');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('📋 Series Name:', seriesName);
    
    try {
      const token = await this.authenticate();
      
      const seriesData = {
        cif: this.config.companyCif,
        name: seriesName,
        type: 'invoice', // Type of document
        prefix: seriesName,
        startNumber: 1,
        description: `Serie automatică pentru facturi YDestiny - ${seriesName}`
      };
      
      console.log('📋 Creating series with data:', seriesData);
      
      const response = await fetch('https://www.oblio.eu/api/nomenclature/series', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(seriesData),
      });

      console.log('📡 Create Series Response Status:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Series created successfully:', result);
        console.log('📄 ===== SERIES CREATION COMPLETED =====\n');
        return result;
      } else {
        const errorText = await response.text();
        console.log('❌ Failed to create series:', errorText);
        console.log('📄 ===== SERIES CREATION FAILED =====\n');
        return null;
      }
    } catch (error) {
      console.log('❌ Error creating series:', error.message);
      console.log('📄 ===== SERIES CREATION CRASHED =====\n');
      return null;
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