# 📄 Configurarea Seriei Documentului în Oblio

## 🚨 Problema: "Selecteaza Seria Documentului"

Această eroare apare când seria documentului nu este configurată corect în contul Oblio.

## 🔧 Soluții pentru Fixarea Problemei

### **Soluția 1: Configurare Automată (Recomandată)**

Aplicația va încerca automat să:
1. Verifice seriile disponibile în contul Oblio
2. Creeze o serie implicită dacă nu există
3. Folosească prima serie disponibilă

### **Soluția 2: Configurare Manuală în Oblio**

#### **Pasii de configurare:**

1. **Accesează Oblio Dashboard**
   ```
   https://www.oblio.eu
   ```

2. **Navighează la Settings > Document Series**
   - Mergi la secțiunea "Setări"
   - Selectează "Serii de documente" sau "Document Series"

3. **Creează o nouă serie**
   - Click pe "Adaugă serie nouă"
   - Completează următoarele câmpuri:
     - **Nume serie**: `YD` (sau orice denumire dorești)
     - **Tip document**: `Factură` / `Invoice`
     - **Număr început**: `1`
     - **Prefix**: `YD`
     - **Descriere**: `Facturi YDestiny Premium`

4. **Salvează seria**
   - Click pe "Salvează" sau "Save"

### **Soluția 3: Configurare prin Environment Variables**

#### **Setează variabila de mediu:**

```bash
# În fișierul .env.local sau în configurația Vercel
OBLIO_SERIES=YD
```

#### **Verifică toate variabilele Oblio:**

```bash
# Credențiale de autentificare
OBLIO_EMAIL=your-oblio-email@domain.com
OBLIO_SECRET=your-oblio-secret-token
OBLIO_CIF=your-company-cif

# Informații companie
OBLIO_COMPANY_NAME="Your Company Name"
OBLIO_COMPANY_ADDRESS="Your Address"
OBLIO_COMPANY_CITY="Your City"
OBLIO_COMPANY_STATE="Your State"
OBLIO_COMPANY_COUNTRY="Romania"
OBLIO_COMPANY_PHONE="+40xxxxxxxxx"
OBLIO_COMPANY_EMAIL="contact@domain.com"

# Configurație factură
OBLIO_SERIES=YD
OBLIO_ENABLED=true
```

## 🔍 Verificarea Configurației

### **Testare configurație automată:**

1. **Rulează funcția de verificare:**
   ```javascript
   const oblioService = require('./lib/oblio-invoice-service');
   
   // Verifică seriile disponibile
   oblioService.checkAvailableSeries().then(series => {
     console.log('Available series:', series);
   });
   ```

2. **Testare creare serie automată:**
   ```javascript
   // Creează seria implicită
   oblioService.createDefaultSeries('YD').then(result => {
     console.log('Created series:', result);
   });
   ```

## 📋 Serii Recomandate

### **Denumiri populare pentru serii:**

- `YD` - YDestiny (recomandat)
- `FACT` - Factură
- `INV` - Invoice  
- `PREM` - Premium
- `SUB` - Subscription

### **Configurația recomandată:**

```javascript
{
  name: "YD",
  type: "invoice",
  prefix: "YD",
  startNumber: 1,
  description: "Facturi abonament Premium YDestiny"
}
```

## 🐛 Debugging

### **Verifică logurile pentru:**

1. **Configurația seriei:**
   ```
   📄 Document Series Configuration: {
     environmentVariable: "✅ YD" | "❌ Not Set",
     defaultSeries: "YD",
     finalSeries: "YD",
     configuredInEnv: true | false
   }
   ```

2. **Răspunsul Oblio:**
   ```
   ❌ Oblio API error response: {
     status: 400,
     statusMessage: "Selecteaza Seria Documentului."
   }
   ```

3. **Verificarea seriilor disponibile:**
   ```
   📄 ===== CHECKING AVAILABLE DOCUMENT SERIES =====
   ✅ Available Document Series: ["YD", "FACT", "INV"]
   ```

## ✅ Confirmarea Funcționării

După configurarea corectă, ar trebui să vezi în loguri:

```
✅ Factură Oblio generată cu succes: {
  seria: "YD",
  numar: "1",
  link: "https://www.oblio.eu/..."
}
```

## 🆘 Suport

Dacă problema persistă:

1. **Verifică credențialele Oblio** sunt corecte
2. **Contactează suportul Oblio** pentru verificarea contului
3. **Rulează testele automate** din aplicație

---

**📧 Contact:** Pentru probleme tehnice, verifică logurile detaliate sau contactează echipa de dezvoltare. 