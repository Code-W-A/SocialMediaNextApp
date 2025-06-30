# 🔗 Configurarea Webhook-urilor Stripe pentru YDestiny

## 📊 **Rezumat:**
**Numărul total de endpoint-uri webhook Stripe:** `1`

---

## 🎯 **Endpoint Principal Stripe Webhook**

### **URL:**
```
https://ydestiny.com/api/webhooks/stripe
```

### **Descriere:**
Endpoint principal care gestionează toate evenimentele legate de subscripții, plăți și Customer Portal.

---

## 📋 **Evenimente care TREBUIE configurate în Stripe Dashboard:**

### **🔴 Critice pentru funcționarea aplicației:**

#### **1. Subscription Events (Obligatorii)**
```
✅ customer.subscription.created
✅ customer.subscription.updated  
✅ customer.subscription.deleted
```
**De ce:** Acestea sunt ESENȚIALE pentru sincronizarea status-ului premium în Firestore.

#### **2. Payment Events (Obligatorii)**
```
✅ checkout.session.completed
✅ invoice.payment_succeeded
✅ invoice.payment_failed
```
**De ce:** Pentru confirmarea plăților și gestionarea erorilor de plată.

### **🟡 Opționale pentru funcții avansate:**

#### **3. Trial & Notification Events**
```
🟡 customer.subscription.trial_will_end
🟡 invoice.upcoming
```
**De ce:** Pentru notificări utilizatori (de implementat în viitor).

---

## ⚙️ **Configurarea în Stripe Dashboard:**

### **Pasul 1: Accesează Webhooks**
1. Mergi la [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click pe "Add endpoint" sau editează endpoint-ul existent

### **Pasul 2: Configurează URL-ul**
```
Endpoint URL: https://ydestiny.com/api/webhooks/stripe
Description: YDestiny Main Webhook
```

### **Pasul 3: Selectează Evenimentele**
**Bifează exact aceste evenimente:**

```
☑️ checkout.session.completed
☑️ customer.subscription.created
☑️ customer.subscription.deleted
☑️ customer.subscription.trial_will_end
☑️ customer.subscription.updated
☑️ invoice.payment_failed
☑️ invoice.payment_succeeded
☑️ invoice.upcoming
```

### **Pasul 4: Configurări avansate**
```
✅ Enable webhook
✅ Send test webhook
API Version: Latest (2024-06-20)
```

### **Pasul 5: Salvează Webhook Secret**
1. După salvare, copiază **Signing Secret**
2. Adaugă în `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_your_signing_secret_here
```

---

## 🧪 **Testarea Configurării:**

### **Test 1: Webhook Status**
```bash
curl -X POST https://ydestiny.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": "ping"}'
```
**Rezultat așteptat:** Status 400 (webhook signature verification failed) - este normal!

### **Test 2: Test din Stripe Dashboard**
1. În Stripe Dashboard → Webhooks
2. Click pe webhook-ul tău
3. Click "Send test webhook"
4. Alege `customer.subscription.updated`
5. Click "Send test webhook"

**Rezultat așteptat:** Status 200 cu răspuns JSON

### **Test 3: Verificare evenimente reale**
1. Creează un test subscription
2. Verifică logs în webhook
3. Confirmă că Firestore se actualizează

---

## 🔍 **Verificarea Configurării Curente:**

### **Check 1: Verifică endpoint-ul**
```bash
# Rulează din terminal în proiect:
node -e "console.log('Webhook URL:', process.env.NEXT_PUBLIC_APP_URL + '/api/webhooks/stripe')"
```

### **Check 2: Verifică secret-ul**
```bash
# Verifică că ai secret-ul configurat:
node -e "console.log('Webhook Secret configured:', !!process.env.STRIPE_WEBHOOK_SECRET)"
```

### **Check 3: Test endpoint local**
```bash
# Rulează scriptul de testare:
node test-webhook-stripe.js
```

---

## 📈 **Monitoring & Debug:**

### **Logs în aplicație**
Webhook-ul loghează detaliat în consolă:
```
🔔 ===== STRIPE WEBHOOK RECEIVED =====
📅 Timestamp: [timestamp]
📋 Event Type: customer.subscription.updated
🆔 Event ID: evt_xxx
✅ Event processed successfully
```

### **Verificare în Stripe Dashboard**
1. Mergi la Webhooks → [numele webhook-ului]
2. Verifică "Recent deliveries"
3. Status 200 = OK, Status 4xx/5xx = Eroare

### **Debugging Events**
Pentru debugging, webhook-ul acceptă orice event Stripe și va loga:
```
⚠️ Unhandled event type: [tip_event]
📦 Event data keys: [chei_disponibile]
```

---

## 🚨 **Troubleshooting:**

### **Problema: Webhook nu funcționează**
```
1. ✅ Verifică URL-ul: https://ydestiny.com/api/webhooks/stripe
2. ✅ Verifică STRIPE_WEBHOOK_SECRET în .env
3. ✅ Verifică că aplicația rulează pe HTTPS
4. ✅ Test din Stripe Dashboard
```

### **Problema: Signature verification failed**
```
❌ Cauza: STRIPE_WEBHOOK_SECRET incorect
✅ Soluția: Re-copiază signing secret din Stripe Dashboard
```

### **Problema: Events nu se procesează**
```
❌ Cauza: Event type nu este în switch statement
✅ Soluția: Adaugă event-ul în webhook handler
```

---

## 🎯 **Summary pentru Stripe Dashboard:**

```
URL: https://ydestiny.com/api/webhooks/stripe
Events: 8 evenimente selectate
Status: Active
Latest API Version: 2024-06-20

Critice (6):
- checkout.session.completed
- customer.subscription.created  
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed

Opționale (2):
- customer.subscription.trial_will_end
- invoice.upcoming
```

**📝 Notă:** Acest singur endpoint gestionează TOATE evenimentele Stripe pentru aplicația YDestiny. Nu sunt necesare webhook-uri suplimentare. 