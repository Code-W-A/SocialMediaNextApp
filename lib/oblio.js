// Oblio API service for automatic invoice generation
// Integrates with Stripe webhooks to generate invoices for Romanian compliance

/**
 * Oblio API Configuration
 */
export const OBLIO_CONFIG = {
  email: process.env.OBLIO_EMAIL,
  secret: process.env.OBLIO_SECRET,
  cif: process.env.OBLIO_CIF,
  enabled: process.env.OBLIO_ENABLED === 'true',
  
  // Company information for invoices
  company: {
    name: process.env.OBLIO_COMPANY_NAME || 'Popescu Pompiliu Ion P.F.A.',
    address: process.env.OBLIO_COMPANY_ADDRESS || 'Strada Soroca, Bl.D5, sc.A, et.2, Ap.9',
    city: process.env.OBLIO_COMPANY_CITY || 'Targoviste',
    state: process.env.OBLIO_COMPANY_STATE || 'Dambovita',
    country: process.env.OBLIO_COMPANY_COUNTRY || 'Romania',
    phone: process.env.OBLIO_COMPANY_PHONE || '+0774550758',
    email: process.env.OBLIO_COMPANY_EMAIL || 'contact@ydestiny.com',
  },
  
  // API endpoints
  endpoints: {
    base: 'https://www.oblio.eu/api',
    createInvoice: '/create_invoice',
    getInvoice: '/get_invoice',
    cancelInvoice: '/cancel_invoice'
  }
};

/**
 * Oblio API Client
 */
class OblioAPI {
  constructor() {
    this.email = OBLIO_CONFIG.email;
    this.secret = OBLIO_CONFIG.secret;
    this.cif = OBLIO_CONFIG.cif;
    this.baseUrl = OBLIO_CONFIG.endpoints.base;
  }

  /**
   * Make authenticated request to Oblio API
   */
  async makeRequest(endpoint, data = {}) {
    if (!OBLIO_CONFIG.enabled) {
      console.log('📋 Oblio is disabled, skipping invoice generation');
      return { success: false, message: 'Oblio disabled' };
    }

    if (!this.email || !this.secret || !this.cif) {
      console.error('❌ Oblio credentials not configured');
      return { success: false, message: 'Oblio credentials missing' };
    }

    try {
      const requestData = {
        cif: this.cif,
        email: this.email,
        secret: this.secret,
        ...data
      };

      console.log('🔄 Making Oblio API request:', endpoint);
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Oblio API error:', result);
        return { success: false, error: result };
      }

      console.log('✅ Oblio API success:', result);
      return { success: true, data: result };
      
    } catch (error) {
      console.error('❌ Oblio API request failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create invoice in Oblio for subscription payment
   */
  async createSubscriptionInvoice(paymentData) {
    try {
      const {
        customerData,
        subscriptionData,
        paymentAmount,
        currency,
        invoiceNumber,
        paymentDate
      } = paymentData;

      // Format date for Oblio (YYYY-MM-DD)
      const issueDate = new Date(paymentDate).toISOString().split('T')[0];
      const dueDate = issueDate; // Immediate payment

      // Prepare invoice data for Oblio
      const invoiceData = {
        client: {
          // For individual customers (Romanian e-factura compliance)
          name: `${customerData.firstName} ${customerData.lastName}`,
          address: customerData.address || '', // Adresa principală (strada + numărul)
          state: customerData.state || '', // Județul
          city: customerData.city || '', // Orașul/Localitatea  
          country: customerData.country || 'Romania', // Țara (default Romania)
          email: customerData.email || '',
          phone: customerData.phone || '',
          vatPayer: customerData.isVatPayer || false,
          save: 1, // Salvează clientul în baza de date Oblio
          
          // Optional fields for companies
          cif: customerData.companyVat || '', // CIF pentru firme
          rc: customerData.companyReg || '', // Nr. registrul comerțului pentru firme
          code: '', // Cod intern client
          iban: '', // IBAN dacă e necesar
          bank: '', // Banca
          contact: `${customerData.firstName} ${customerData.lastName}`, // Persoana de contact
        },
        
        issueDate: issueDate,
        dueDate: dueDate,
        deliveryDate: issueDate,
        collectDate: issueDate,
        seriesName: 'YD', // Invoice series
        collect: [],
        referenceDocument: [],
        language: 'RO',
        precision: 2,
        currency: currency === 'ron' ? 'RON' : 'EUR',
        
        products: [
          {
            name: 'Abonament Premium YDestiny',
            code: 'PREMIUM-MONTHLY',
            description: 'Abonament lunar Premium pentru aplicația YDestiny - funcționalități avansate',
            price: (paymentAmount / 100).toString(), // Convert from cents
            measuringUnit: 'buc',
            currency: currency === 'ron' ? 'RON' : 'EUR',
            vatName: 'Normala',
            vatPercentage: 19,
            vatIncluded: true,
            quantity: 1,
            productType: 'Serviciu',
          }
        ],
        
        issuerName: OBLIO_CONFIG.company.name,
        issuerId: '',
        noticeNumber: '',
        internalNote: `Plată Stripe: ${subscriptionData.subscriptionId || 'N/A'}`,
        deputyName: '',
        deputyIdentityCard: '',
        deputyAuto: '',
        selesAgent: '',
        mentions: `Factură generată automat pentru plata abonamentului Premium YDestiny. Nr. referință Stripe: ${invoiceNumber}`,
        value: 0, // Will be calculated automatically
        workStation: 'Sediu',
        useStock: 0,
      };

      console.log('📋 Creating Oblio invoice for subscription payment:', {
        customer: customerData.email,
        amount: paymentAmount,
        currency
      });

      const result = await this.makeRequest(OBLIO_CONFIG.endpoints.createInvoice, invoiceData);
      
      if (result.success) {
        console.log('✅ Oblio invoice created successfully:', result.data);
        return {
          success: true,
          invoiceId: result.data?.id,
          invoiceNumber: result.data?.number,
          invoiceUrl: result.data?.url,
          oblioData: result.data
        };
      } else {
        console.error('❌ Failed to create Oblio invoice:', result.error);
        return {
          success: false,
          error: result.error
        };
      }
      
    } catch (error) {
      console.error('❌ Error creating Oblio invoice:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get invoice details from Oblio
   */
  async getInvoice(invoiceId) {
    try {
      const result = await this.makeRequest(OBLIO_CONFIG.endpoints.getInvoice, {
        invoiceId: invoiceId
      });
      
      return result;
    } catch (error) {
      console.error('❌ Error getting Oblio invoice:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel invoice in Oblio
   */
  async cancelInvoice(invoiceId) {
    try {
      const result = await this.makeRequest(OBLIO_CONFIG.endpoints.cancelInvoice, {
        invoiceId: invoiceId,
        cancel: true
      });
      
      return result;
    } catch (error) {
      console.error('❌ Error canceling Oblio invoice:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export the API instance
export const oblioAPI = new OblioAPI();

/**
 * Helper function to prepare customer data for Oblio invoice
 */
export const prepareCustomerDataForOblio = (user, stripeCustomer = null, customerDetails = null) => {
  // Priority: customerDetails (from checkout) > stripeCustomer > user data > defaults
  
  // Extract name parts
  const fullName = customerDetails?.name || stripeCustomer?.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
  const nameParts = fullName.split(' ');
  const firstName = user.firstName || nameParts[0] || 'Client';
  const lastName = user.lastName || nameParts.slice(1).join(' ') || 'YDestiny';
  
  // Extract address information with priority to customerDetails (checkout session)
  const billingAddress = customerDetails?.address || stripeCustomer?.address;
  
  // Build complete address string for Oblio (required for e-factura)
  let fullAddress = '';
  if (billingAddress?.line1) {
    fullAddress = billingAddress.line1;
    if (billingAddress.line2) {
      fullAddress += `, ${billingAddress.line2}`;
    }
  } else if (user.address) {
    fullAddress = user.address;
  }
  
  return {
    firstName,
    lastName,
    email: customerDetails?.email || stripeCustomer?.email || user.email || '',
    phone: customerDetails?.phone || stripeCustomer?.phone || user.phone || '',
    
    // Address fields for Romanian e-factura compliance
    address: fullAddress, // Full street address (strada + numărul)
    city: billingAddress?.city || user.city || '', // Orașul/Localitatea
    state: billingAddress?.state || user.state || user.county || '', // Județul (county in Romania)
    country: billingAddress?.country || user.country || 'Romania', // Țara
    postalCode: billingAddress?.postal_code || user.postalCode || '', // Cod poștal
    
    // Romanian specific fields
    taxId: user.taxId || user.cnp || '', // Romanian CNP for individuals or CIF for companies
    isVatPayer: false, // Most individual customers are not VAT payers
    
    // Additional fields that might be useful
    company: user.company || '', // Company name if business customer
    companyVat: user.companyVat || '', // Company VAT number
    companyReg: user.companyReg || '', // Company registration number
  };
};

/**
 * Helper function to extract subscription data for invoice
 */
export const prepareSubscriptionDataForOblio = (subscription, priceAmount) => {
  return {
    subscriptionId: subscription.id,
    priceId: subscription.items?.data?.[0]?.price?.id,
    amount: priceAmount || subscription.items?.data?.[0]?.price?.unit_amount || 1999, // Default to 19.99 RON
    currency: subscription.currency || 'ron',
    interval: subscription.items?.data?.[0]?.price?.recurring?.interval || 'month',
    intervalCount: subscription.items?.data?.[0]?.price?.recurring?.interval_count || 1,
  };
};

export default oblioAPI; 