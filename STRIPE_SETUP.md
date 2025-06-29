# Configurare Stripe pentru Sistemul de Abonamente

## 1. Crearea Contului Stripe

1. Mergi pe [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Creează un cont nou sau conectează-te
3. Activează modul Test pentru dezvoltare

## 2. Configurarea Produselor și Prețurilor

### Crearea Produsului Premium

1. În Stripe Dashboard, mergi la **Products** → **Add Product**
2. Completează:
   - **Name**: YDestiny Premium
   - **Description**: Abonament Premium pentru funcționalități avansate
   - **Pricing Model**: Recurring
   - **Price**: 19.99 RON
   - **Billing Period**: Monthly
   - **Currency**: RON

3. Salvează și notează **Product ID** și **Price ID**

## 3. Configurarea Variabilelor de Mediu

Adaugă următoarele variabile în `.env.local`:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Product IDs
STRIPE_PREMIUM_PRICE_ID=price_your_premium_price_id_here
STRIPE_PREMIUM_PRODUCT_ID=prod_your_premium_product_id_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. Configurarea Webhook-urilor

### Crearea Webhook-ului

1. În Stripe Dashboard, mergi la **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Completează:
   - **Endpoint URL**: `http://localhost:3000/api/webhooks/stripe` (pentru dezvoltare)
   - **Events to send**: Selectează următoarele evenimente:

#### 🔥 **Evenimente ESENȚIALE pentru Plată:**
- ✅ `checkout.session.completed` - Prima confirmare de plată
- ✅ `invoice.payment_succeeded` - Confirmarea finală de plată
- ✅ `invoice.payment_failed` - Plată eșuată

#### 📋 **Evenimente pentru Gestionarea Abonamentului:**
- ✅ `customer.subscription.created` - Abonament nou creat
- ✅ `customer.subscription.updated` - Abonament modificat
- ✅ `customer.subscription.deleted` - Abonament anulat

#### 🔔 **Evenimente pentru Notificări (Opționale):**
- ⭐ `customer.subscription.trial_will_end` - Trial se încheie în curând
- ⭐ `invoice.upcoming` - Factură următoare (reminder de reînnoire)

4. Salvează și copiază **Signing secret** în `STRIPE_WEBHOOK_SECRET`

### Pentru Producție

Pentru producție, înlocuiește URL-ul cu:
```
https://your-domain.com/api/webhooks/stripe
```

## 5. Fluxul Complet de Plată

```
1. User click "Subscribe" 
   ↓
2. Stripe Checkout Session
   ↓
3. User completează plata 
   ↓ 
4. 🎉 checkout.session.completed (Prima confirmare)
   ↓
5. 💰 invoice.payment_succeeded (Confirmarea finală)
   ↓
6. 📋 customer.subscription.created/updated
   ↓
7. ✅ Abonamentul devine activ
```

## 6. Testarea Integrării

### Carduri de Test

Folosește următoarele carduri pentru testare:

- **Succes**: `4242 4242 4242 4242`
- **Eșec**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### Date de Test

- **Expiry**: Orice dată din viitor (ex: 12/25)
- **CVC**: Orice 3 cifre (ex: 123)
- **ZIP**: Orice 5 cifre (ex: 12345)

## 7. Funcționalități Implementate

### Webhook-uri pentru Plată

#### `checkout.session.completed`
- **Primul moment** de confirmare a plății
- Actualizează imediat statusul utilizatorului
- Salvează customer ID și metadata

#### `invoice.payment_succeeded`
- **Confirmarea finală** că plata a fost procesată
- Actualizează istoricul plăților
- Confirmă abonamentul activ

#### `invoice.payment_failed`
- Gestionează plățile eșuate
- Salvează motivul eșecului
- Pregătește notificări pentru user

### Date Salvate în Firestore

```javascript
subscription: {
  // Status general
  isPremium: true,
  status: 'active',
  
  // Detalii Stripe
  customerId: 'cus_xxx',
  subscriptionId: 'sub_xxx',
  
  // Tracking plăți
  checkoutCompleted: true,
  checkoutCompletedAt: Date,
  lastPaymentStatus: 'succeeded',
  lastPaymentDate: Date,
  lastInvoiceId: 'in_xxx',
  
  // Eșecuri plată
  lastPaymentFailureDate: Date,
  paymentFailureReason: 'string',
  
  // Notificări
  renewalReminderSent: true,
  upcomingInvoiceDate: Date
}
```

### Backend (Server Actions)

- `createCheckoutSession()` - Creează sesiune de plată
- `createPortalSession()` - Portal pentru gestionarea abonamentului
- `getUserSubscription()` - Obține statusul abonamentului
- `updateUserSubscription()` - Actualizează datele abonamentului
- `handleSubscriptionChange()` - Procesează webhook-uri
- `cancelSubscription()` - Anulează abonamentul
- `reactivateSubscription()` - Reactivează abonamentul

### Frontend (Components & Hooks)

- `useSubscription()` - Hook pentru gestionarea stării abonamentului
- `PremiumPage` - Pagina de upgrade la Premium
- `PremiumSuccessPage` - Pagina de confirmare
- `PremiumBadge` - Badge pentru utilizatorii Premium

### Limitări Freemium

#### Gratuit
- 2 postări pe zi
- 5 vizualizări feed pe zi
- 3 match-uri pe zi
- 3 conversații active
- Compatibilitate de bază

#### Premium (19.99 RON/lună)
- Postări nelimitate
- Feed nelimitat
- Match-uri nelimitate
- Mesaje nelimitate
- Compatibilitate avansată
- 5 Super Like-uri pe zi
- Boost profil (3h/săptămână)
- Mesaje prioritare
- Vezi cine ți-a dat like
- Filtre avansate
- Status online nelimitat
- 3 Rewind-uri pe zi
- Badge verificat

## 8. Securitate

- Toate cheile secrete sunt stocate în variabile de mediu
- Webhook-urile sunt verificate cu signing secret
- Sesiunile de checkout expiră automat
- Datele de plată sunt procesate direct de Stripe (PCI compliant)

## 9. Monitorizare și Logging

### Console Logs
- `🎉 Checkout session completed` - Prima confirmare
- `💰 Payment succeeded` - Plată reușită
- `❌ Payment failed` - Plată eșuată
- `⏰ Trial ending soon` - Trial se încheie
- `📅 Upcoming invoice` - Reminder reînnoire

### Stripe Dashboard
- Toate tranzacțiile sunt loggate
- Webhook-urile sunt monitorizate
- Erorile sunt raportate automat

## 10. Producție

Pentru producție:

1. Schimbă din Test Mode în Live Mode în Stripe
2. Actualizează cheile din .env.local cu cele live
3. Configurează webhook-ul cu URL-ul de producție
4. Testează fluxul complet de plată

## 11. Suport

Pentru probleme:
- Verifică Stripe Dashboard pentru tranzacții
- Verifică logs-urile webhook-urilor în consolă
- Consultă documentația Stripe
- Contactează suportul Stripe pentru probleme tehnice 