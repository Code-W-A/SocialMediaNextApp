# 🧾 Sistemul de Facturare Oblio - Documentație Completă

## 📋 Prezentare Generală

YDestiny aplicația are acum un sistem complet de facturare automată integrat cu Oblio pentru conformitatea cu legislația românească. Sistemul generează automat facturi pentru toate plățile de abonament Premium prin Stripe.

- ✅ **Integrare Automată** - Facturi generate automat la fiecare plată
- ✅ **Conformitate Românească** - Respect complet al legislației fiscale
- ✅ **Siguranță Totală** - Nu afectează sistemul de premium existent
- ✅ **API Complet** - Endpoint-uri pentru gestionare manuală
- ✅ **UI Integrat** - Afișare facturi în pagina Premium

---

## 🔧 Configurare

### 1. **Variabile de Mediu (.env.local)**

```env
# Oblio Configuration for Invoice Generation
OBLIO_EMAIL=your_oblio_email@example.com
OBLIO_SECRET=your_oblio_secret_key
OBLIO_CIF=your_company_cif
OBLIO_ENABLED=true

# Oblio Company Information for Invoices
OBLIO_COMPANY_NAME=YDestiny SRL
OBLIO_COMPANY_ADDRESS=Your Company Address
OBLIO_COMPANY_CITY=Bucharest
OBLIO_COMPANY_STATE=Bucharest
OBLIO_COMPANY_COUNTRY=Romania
OBLIO_COMPANY_PHONE=+40123456789
OBLIO_COMPANY_EMAIL=contact@ydestiny.com
```

### 2. **Activare/Dezactivare Sistem**

Pentru a dezactiva temporar sistemul Oblio (fără să strice premium-ul):
```env
OBLIO_ENABLED=false
```

---

## 🔗 Integrare cu Stripe

### **Puncte de Integrare Automată:**

#### 🎯 **Checkout Session Completed**
- **Când**: Prima plată de abonament
- **Webhook**: `checkout.session.completed`
- **Factură**: Se generează pentru setup fee sau prima plată

#### 💰 **Invoice Payment Succeeded**
- **Când**: Plăți recurente lunare
- **Webhook**: `invoice.payment_succeeded`
- **Factură**: Se generează pentru fiecare plată recurentă

### **Date Salvate în Firestore:**

Pentru fiecare utilizator se salvează:
```javascript
{
  subscription: {
    // Facturi automate (Stripe webhooks)
    oblioInvoiceId: "invoice_id_from_oblio",
    oblioInvoiceNumber: "YD001234",
    oblioInvoiceUrl: "https://oblio.eu/invoice/link",
    lastOblioInvoiceDate: Date,
    
    // Facturi manuale (API endpoint)
    lastManualOblioInvoiceId: "manual_invoice_id",
    lastManualOblioInvoiceNumber: "YD005678",
    lastManualOblioInvoiceUrl: "https://oblio.eu/manual/link",
    lastManualOblioInvoiceDate: Date,
    
    // Status plăți
    lastPaymentStatus: "succeeded",
    lastPaymentDate: Date,
    updatedAt: Date
  }
}
```

---

## 🛠️ API Endpoints

### **1. Creare Factură Manuală**

**POST** `/api/oblio/create-invoice`

```javascript
// Request Body
{
  "userId": "user_id", // Optional if called by authenticated user
  "amount": 1999, // Amount in cents (19.99 RON)
  "currency": "ron",
  "description": "Custom description", // Optional
  "reference": "custom_reference" // Optional
}

// Response
{
  "success": true,
  "message": "Invoice created successfully",
  "invoice": {
    "id": "oblio_invoice_id",
    "number": "YD001234",
    "url": "https://oblio.eu/invoice/link",
    "amount": 1999,
    "currency": "ron",
    "customer": "user@example.com",
    "reference": "custom_reference",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### **2. Status Facturi**

**GET** `/api/oblio/invoice-status?invoiceId=xxx`
**GET** `/api/oblio/invoice-status` (facturi utilizator curent)

```javascript
// Response
{
  "success": true,
  "invoiceInfo": {
    "lastOblioInvoice": {
      "id": "invoice_id",
      "number": "YD001234",
      "url": "https://oblio.eu/invoice/link",
      "date": "2024-01-15T10:30:00Z"
    },
    "lastManualOblioInvoice": {
      "id": "manual_invoice_id",
      "number": "YD005678",
      "url": "https://oblio.eu/manual/link",
      "date": "2024-01-16T14:20:00Z"
    },
    "subscriptionInfo": {
      "status": "active",
      "isPremium": true,
      "lastPaymentStatus": "succeeded",
      "lastPaymentDate": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

## 📄 Structura Factură Oblio

### **Date Client (Automat extrase din profil):**

```javascript
{
  client: {
    cif: "", // CNP sau CIF din profil (optional)
    name: "John Doe", // firstName + lastName
    address: "Strada Exemplu, nr. 1", // Din profil utilizator
    city: "Bucharest", // Din profil sau Stripe
    country: "Romania", // Default România
    email: "user@example.com", // Email utilizator
    phone: "+40123456789", // Din profil
    vatPayer: false // Pentru persoane fizice
  }
}
```

### **Produse/Servicii:**

```javascript
{
  products: [
    {
      name: "Abonament Premium YDestiny",
      code: "PREMIUM-MONTHLY",
      description: "Abonament lunar Premium pentru aplicația YDestiny - funcționalități avansate",
      price: "19.99", // Din Stripe (convertit din cents)
      measuringUnit: "buc",
      currency: "RON",
      vatName: "Normala",
      vatPercentage: 19,
      vatIncluded: true,
      quantity: 1,
      productType: "Serviciu"
    }
  ]
}
```

---

## 🎯 UI Components

### **1. OblioInvoiceInfo Component**

Locație: `components/Billing/OblioInvoiceInfo.jsx`

**Funcționalități:**
- ✅ Afișare ultimele facturi (automate și manuale)
- ✅ Link-uri către facturile Oblio
- ✅ Status abonament Premium
- ✅ Refresh automat informații
- ✅ Design responsive

**Utilizare:**
```jsx
import OblioInvoiceInfo from '@/components/Billing/OblioInvoiceInfo';

// În pagina Premium
<OblioInvoiceInfo />
```

### **2. Integrare în Pagina Premium**

Componenta se afișează automat în pagina `/premium` pentru utilizatorii cu abonament Premium activ.

---

## 🔒 Securitate și Backup

### **Protecții Implementate:**

1. **Webhook nu Eșuează**: Dacă Oblio API eșuează, webhook-ul Stripe continuă normal
2. **Validare Date**: Toate datele sunt validate înainte de trimitere
3. **Rate Limiting**: Respectă limitele API-ului Oblio
4. **Logging Complet**: Toate operațiile sunt înregistrate în console

### **Error Handling:**

```javascript
// În webhook-uri Stripe
try {
  const oblioResult = await oblioAPI.createSubscriptionInvoice(paymentData);
  if (oblioResult.success) {
    // Save invoice data
  } else {
    console.error('❌ Failed to create Oblio invoice:', oblioResult.error);
    // Don't fail the webhook if Oblio fails - premium system should still work
  }
} catch (oblioError) {
  console.error('❌ Error generating Oblio invoice:', oblioError);
  // Don't fail the webhook if Oblio fails - premium system should still work
}
```

---

## 🧪 Testare

### **1. Testare Automată (Stripe Test Mode)**

1. Folosește carduri de test Stripe
2. Webhook-urile vor genera facturi în Oblio
3. Verifică console logs pentru debugging

### **2. Testare Manuală**

```bash
# Creează factură manuală prin API
curl -X POST /api/oblio/create-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1999,
    "currency": "ron",
    "description": "Test Invoice",
    "reference": "TEST001"
  }'
```

### **3. Verificare Status**

```bash
# Verifică status facturi
curl -X GET /api/oblio/invoice-status
```

---

## 📊 Monitoring

### **Logs Importante:**

```bash
# Webhook Stripe cu Oblio
🔔 ===== STRIPE WEBHOOK RECEIVED =====
📋 ===== GENERATING OBLIO INVOICE (CHECKOUT) =====
✅ Oblio invoice created successfully
📋 ===== OBLIO INVOICE GENERATION COMPLETED =====

# API Manual
📋 Manual Oblio invoice creation requested
✅ Manual Oblio invoice created successfully
```

### **Erori Comune:**

1. **Credentials Missing**: Verifică variabilele de mediu
2. **Oblio API Down**: Nu afectează sistemul Premium
3. **Invalid Customer Data**: Verifică datele din profil

---

## 🚀 Beneficii

### **Pentru Business:**
- ✅ **Conformitate Legală**: Respect complet legislație românească
- ✅ **Automatizare Completă**: Zero intervenție manuală
- ✅ **Transparență**: Utilizatorii văd toate facturile
- ✅ **Integrare Perfectă**: Nu afectează sistemul existent

### **Pentru Utilizatori:**
- ✅ **Facturi Automate**: Generate la fiecare plată
- ✅ **Acces Facil**: Link-uri directe în aplicație
- ✅ **Transparență Totală**: Status clar abonament
- ✅ **Conformitate**: Facturi valide pentru contabilitate

---

## 🔄 Mentenanță

### **Task-uri Regulate:**

1. **Verificare Status Facturi**: Weekly check prin API
2. **Monitor Error Logs**: Daily check pentru erori Oblio
3. **Testare Webhook-uri**: Monthly test cu plăți de test
4. **Update Credentials**: Când se schimbă datele Oblio

### **Procedură Update Date Companie:**

1. Update variabile mediu cu noile date
2. Test cu factură manuală
3. Verificare în Oblio console
4. Deploy în producție

---

## 🎯 **Status Sistem: PRODUCTION READY** ✅

Sistemul de facturare Oblio este **complet funcțional și sigur** cu:
- Integrare automată cu Stripe webhooks
- API endpoints pentru gestionare manuală
- UI component pentru afișare facturi
- Error handling complet și securitate maximă
- Zero impact asupra sistemului Premium existent 