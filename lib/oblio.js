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
    console.log('\n🌐 ===== OBLIO API REQUEST STARTED =====');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🎯 Endpoint:', endpoint);
    console.log('📦 Data Keys:', Object.keys(data));
    
    if (!OBLIO_CONFIG.enabled) {
      console.log('⚠️ Oblio is disabled, skipping invoice generation');
      return { success: false, message: 'Oblio disabled' };
    }

    console.log('🔧 Oblio Configuration Check:', {
      enabled: OBLIO_CONFIG.enabled,
      hasEmail: !!this.email,
      hasSecret: !!this.secret,
      hasCif: !!this.cif,
      baseUrl: this.baseUrl
    });

    if (!this.email || !this.secret || !this.cif) {
      console.error('❌ Oblio credentials not configured:', {
        email: this.email ? `✅ ${this.email.substring(0, 5)}...` : '❌ Missing',
        secret: this.secret ? `✅ ${this.secret.substring(0, 5)}...` : '❌ Missing',
        cif: this.cif ? `✅ ${this.cif}` : '❌ Missing'
      });
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
      console.log('📋 Request Data Structure:', {
        cif: requestData.cif,
        email: requestData.email,
        secret: requestData.secret ? '✅ Present' : '❌ Missing',
        additionalKeys: Object.keys(data)
      });
      
      console.log('🌐 Sending HTTP Request to Oblio API...');
      console.log('🔗 Full URL:', `${this.baseUrl}${endpoint}`);
      console.log('📄 Request Body Size:', JSON.stringify(requestData).length, 'bytes');
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      console.log('📡 Response Status:', response.status, response.statusText);
      console.log('📋 Response Headers:', {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        server: response.headers.get('server')
      });

      const result = await response.json();
      
      console.log('📦 Response Data:', {
        success: response.ok,
        statusCode: response.status,
        dataKeys: Object.keys(result),
        hasError: !!result.error,
        hasData: !!result.data
      });
      
      if (!response.ok) {
        console.error('❌ Oblio API error response:', {
          status: response.status,
          statusText: response.statusText,
          error: result
        });
        return { success: false, error: result };
      }

      console.log('✅ Oblio API success response:', result);
      return { success: true, data: result };
      
    } catch (error) {
      console.error('❌ Oblio API request failed:', {
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name,
        endpoint: endpoint
      });
      console.log('🌐 ===== OBLIO API REQUEST FAILED =====\n');
      return { success: false, error: error.message };
    }
    
    console.log('🌐 ===== OBLIO API REQUEST COMPLETED =====\n');
  }

  /**
   * Create invoice in Oblio for subscription payment
   */
  async createSubscriptionInvoice(paymentData) {
    console.log('\n🏭 ===== OBLIO INVOICE CREATION STARTED =====');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('📦 Input Data:', {
      customerData: paymentData.customerData ? '✅ Present' : '❌ Missing',
      subscriptionData: paymentData.subscriptionData ? '✅ Present' : '❌ Missing',
      paymentAmount: paymentData.paymentAmount,
      currency: paymentData.currency,
      invoiceNumber: paymentData.invoiceNumber,
      paymentDate: paymentData.paymentDate
    });
    
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

      console.log('📅 Date Processing:', {
        originalPaymentDate: paymentDate,
        formattedIssueDate: issueDate,
        formattedDueDate: dueDate
      });
      
      console.log('👤 Customer Data Processing:', {
        name: `${customerData.firstName} ${customerData.lastName}`,
        email: customerData.email,
        address: customerData.address || 'N/A',
        city: customerData.city || 'N/A',
        country: customerData.country || 'Romania',
        hasCompanyVat: !!customerData.companyVat,
        hasCompanyReg: !!customerData.companyReg
      });
      
      console.log('💰 Payment Processing:', {
        originalAmount: paymentAmount,
        amountInUnits: (paymentAmount / 100),
        currency: currency,
        oblioCurrency: currency === 'eur' ? 'EUR' : 'RON'
      });

      console.log('📄 Document Series Configuration:', {
        environmentVariable: process.env.OBLIO_SERIES ? `✅ ${process.env.OBLIO_SERIES}` : '❌ Not Set',
        defaultSeries: 'YD',
        finalSeries: process.env.OBLIO_SERIES || 'YD',
        configuredInEnv: !!process.env.OBLIO_SERIES
      });

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
        seriesName: process.env.OBLIO_SERIES || 'YD', // Invoice series
        collect: [],
        referenceDocument: [],
        language: 'RO',
        precision: 2,
        currency: currency === 'eur' ? 'EUR' : 'RON',
        
        products: [
          {
            name: 'Abonament Premium YDestiny',
            code: 'PREMIUM-MONTHLY',
            description: 'Abonament lunar Premium pentru aplicația YDestiny - funcționalități avansate',
            price: (paymentAmount / 100).toString(), // Convert from cents
            measuringUnit: 'buc',
            currency: currency === 'eur' ? 'EUR' : 'RON',
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

      console.log('📋 Final Invoice Data Structure:', {
        clientName: invoiceData.client.name,
        clientEmail: invoiceData.client.email,
        clientAddress: invoiceData.client.address,
        clientCity: invoiceData.client.city,
        clientCountry: invoiceData.client.country,
        hasCompanyVat: !!invoiceData.client.cif,
        productName: invoiceData.products[0].name,
        productPrice: invoiceData.products[0].price,
        productCurrency: invoiceData.products[0].currency,
        issueDate: invoiceData.issueDate,
        dueDate: invoiceData.dueDate,
        currency: invoiceData.currency,
        vatIncluded: invoiceData.products[0].vatIncluded
      });

      console.log('📋 Creating Oblio invoice for subscription payment:', {
        customer: customerData.email,
        amount: paymentAmount,
        currency,
        endpoint: OBLIO_CONFIG.endpoints.createInvoice
      });

      const result = await this.makeRequest(OBLIO_CONFIG.endpoints.createInvoice, invoiceData);
      
      console.log('📋 Oblio API Result:', {
        success: result.success,
        hasData: !!result.data,
        hasError: !!result.error,
        errorMessage: result.error?.message || 'None'
      });
      
      if (result.success) {
        console.log('✅ Oblio invoice created successfully:', {
          invoiceId: result.data?.id,
          invoiceNumber: result.data?.number,
          invoiceUrl: result.data?.url,
          fullData: result.data
        });
        
        const returnData = {
          success: true,
          invoiceId: result.data?.id,
          invoiceNumber: result.data?.number,
          invoiceUrl: result.data?.url,
          oblioData: result.data
        };
        
        console.log('📋 Returning Invoice Data:', returnData);
        console.log('🏭 ===== OBLIO INVOICE CREATION COMPLETED SUCCESSFULLY =====\n');
        return returnData;
      } else {
        console.error('❌ Failed to create Oblio invoice:', {
          error: result.error,
          hasErrorMessage: !!result.error?.message,
          errorKeys: result.error ? Object.keys(result.error) : []
        });
        
        const errorData = {
          success: false,
          error: result.error
        };
        
        console.log('❌ Returning Error Data:', errorData);
        console.log('🏭 ===== OBLIO INVOICE CREATION FAILED =====\n');
        return errorData;
      }
      
    } catch (error) {
      console.error('❌ Error creating Oblio invoice:', {
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name,
        inputData: {
          hasCustomerData: !!paymentData.customerData,
          hasSubscriptionData: !!paymentData.subscriptionData,
          paymentAmount: paymentData.paymentAmount,
          currency: paymentData.currency
        }
      });
      console.log('🏭 ===== OBLIO INVOICE CREATION CRASHED =====\n');
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
    console.log('\n🔍 ===== OBLIO GET INVOICE STARTED =====');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🆔 Invoice ID:', invoiceId);
    
    try {
      const result = await this.makeRequest(OBLIO_CONFIG.endpoints.getInvoice, {
        invoiceId: invoiceId
      });
      
      console.log('📋 Get Invoice Result:', {
        success: result.success,
        hasData: !!result.data,
        hasError: !!result.error
      });
      
      if (result.success) {
        console.log('✅ Invoice details retrieved successfully');
        console.log('🔍 ===== OBLIO GET INVOICE COMPLETED =====\n');
      } else {
        console.error('❌ Failed to retrieve invoice details:', result.error);
        console.log('🔍 ===== OBLIO GET INVOICE FAILED =====\n');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error getting Oblio invoice:', {
        errorMessage: error.message,
        errorStack: error.stack,
        invoiceId: invoiceId
      });
      console.log('🔍 ===== OBLIO GET INVOICE CRASHED =====\n');
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel invoice in Oblio
   */
  async cancelInvoice(invoiceId) {
    console.log('\n🚫 ===== OBLIO CANCEL INVOICE STARTED =====');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🆔 Invoice ID:', invoiceId);
    
    try {
      const result = await this.makeRequest(OBLIO_CONFIG.endpoints.cancelInvoice, {
        invoiceId: invoiceId,
        cancel: true
      });
      
      console.log('📋 Cancel Invoice Result:', {
        success: result.success,
        hasData: !!result.data,
        hasError: !!result.error
      });
      
      if (result.success) {
        console.log('✅ Invoice canceled successfully');
        console.log('🚫 ===== OBLIO CANCEL INVOICE COMPLETED =====\n');
      } else {
        console.error('❌ Failed to cancel invoice:', result.error);
        console.log('🚫 ===== OBLIO CANCEL INVOICE FAILED =====\n');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error canceling Oblio invoice:', {
        errorMessage: error.message,
        errorStack: error.stack,
        invoiceId: invoiceId
      });
      console.log('🚫 ===== OBLIO CANCEL INVOICE CRASHED =====\n');
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
  console.log('\n👤 ===== PREPARING CUSTOMER DATA FOR OBLIO =====');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('📦 Input Data:', {
    hasUserData: !!user,
    hasStripeCustomer: !!stripeCustomer,
    hasCustomerDetails: !!customerDetails,
    userId: user?.id || 'N/A',
    stripeCustomerId: stripeCustomer?.id || 'N/A'
  });
  
  // Priority: customerDetails (from checkout) > stripeCustomer > user data > defaults
  
  // Extract name parts
  const fullName = customerDetails?.name || stripeCustomer?.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
  const nameParts = fullName.split(' ');
  const firstName = user.firstName || nameParts[0] || 'Client';
  const lastName = user.lastName || nameParts.slice(1).join(' ') || 'YDestiny';
  
  console.log('📝 Name Processing:', {
    originalUserName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    stripeCustomerName: stripeCustomer?.name || 'N/A',
    customerDetailsName: customerDetails?.name || 'N/A',
    finalFullName: fullName,
    extractedFirstName: firstName,
    extractedLastName: lastName
  });
  
  // Extract address information with priority to customerDetails (checkout session)
  const billingAddress = customerDetails?.address || stripeCustomer?.address;
  
  console.log('📍 Address Processing:', {
    hasCustomerDetailsAddress: !!customerDetails?.address,
    hasStripeCustomerAddress: !!stripeCustomer?.address,
    hasUserAddress: !!user.address,
    billingAddressLine1: billingAddress?.line1 || 'N/A',
    billingAddressLine2: billingAddress?.line2 || 'N/A',
    billingAddressCity: billingAddress?.city || 'N/A',
    billingAddressCountry: billingAddress?.country || 'N/A',
    userAddress: user.address || 'N/A'
  });
  
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
  
  console.log('🏠 Final Address:', {
    fullAddress: fullAddress || 'N/A',
    city: billingAddress?.city || user.city || 'N/A',
    state: billingAddress?.state || user.state || user.county || 'N/A',
    country: billingAddress?.country || user.country || 'Romania',
    postalCode: billingAddress?.postal_code || user.postalCode || 'N/A'
  });
  
  const finalCustomerData = {
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
  
  console.log('📋 Final Customer Data:', {
    firstName: finalCustomerData.firstName,
    lastName: finalCustomerData.lastName,
    email: finalCustomerData.email,
    phone: finalCustomerData.phone || 'N/A',
    fullAddress: finalCustomerData.address || 'N/A',
    city: finalCustomerData.city || 'N/A',
    state: finalCustomerData.state || 'N/A',
    country: finalCustomerData.country,
    hasCompany: !!finalCustomerData.company,
    hasCompanyVat: !!finalCustomerData.companyVat,
    hasCompanyReg: !!finalCustomerData.companyReg,
    isVatPayer: finalCustomerData.isVatPayer
  });
  
  console.log('👤 ===== CUSTOMER DATA PREPARATION COMPLETED =====\n');
  return finalCustomerData;
};

/**
 * Helper function to extract subscription data for invoice
 */
export const prepareSubscriptionDataForOblio = (subscription, priceAmount) => {
  console.log('\n💳 ===== PREPARING SUBSCRIPTION DATA FOR OBLIO =====');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('📦 Input Data:', {
    hasSubscription: !!subscription,
    subscriptionId: subscription?.id || 'N/A',
    priceAmount: priceAmount || 'N/A',
    subscriptionCurrency: subscription?.currency || 'N/A',
    hasItems: !!subscription?.items?.data?.length,
    itemsCount: subscription?.items?.data?.length || 0
  });
  
  const subscriptionData = {
    subscriptionId: subscription.id,
    priceId: subscription.items?.data?.[0]?.price?.id,
    amount: priceAmount || subscription.items?.data?.[0]?.price?.unit_amount || 500, // Default to 5.00 EUR
    currency: subscription.currency || 'eur',
    interval: subscription.items?.data?.[0]?.price?.recurring?.interval || 'month',
    intervalCount: subscription.items?.data?.[0]?.price?.recurring?.interval_count || 1,
  };
  
  console.log('📋 Processed Subscription Data:', {
    subscriptionId: subscriptionData.subscriptionId,
    priceId: subscriptionData.priceId || 'N/A',
    amount: subscriptionData.amount,
    currency: subscriptionData.currency,
    interval: subscriptionData.interval,
    intervalCount: subscriptionData.intervalCount,
    amountInUnits: subscriptionData.amount / 100
  });
  
  console.log('💳 ===== SUBSCRIPTION DATA PREPARATION COMPLETED =====\n');
  return subscriptionData;
};

export default oblioAPI; 