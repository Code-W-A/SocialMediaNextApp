## Întrebările și pașii actuali din onboarding

### Pasul 1: Fotografii
- **Tip**: încărcare fotografii de profil
- **Cerințe**:
  - Minim 1 fotografie, maxim 6 fotografii
  - Se poate seta o fotografie principală (Main)
  - Imaginile sunt procesate/standardizate pentru compatibilitate (posibil crop)

### Pasul 2: Profil — Interese
- **Tip**: selecție multiplă
- **Limită**: maxim 8 interese
- **Opțiuni**:
  - Travel
  - Photography
  - Music
  - Sports
  - Art
  - Technology
  - Food
  - Fashion
  - Books
  - Movies
  - Gaming
  - Fitness
  - Nature
  - Dancing
  - Cooking
  - Languages
  - Science
  - History

### Pasul 3: Chestionar final
Sursă: `mock/astroQuestions.js` (folosite în `app/onboarding/questionnaire/page.jsx`).

- **Întrebarea 1**: Care este zodia ta?
  - **Tip**: alegere unică
  - **Opțiuni**:
    - Berbec
    - Taur
    - Gemeni
    - Rac
    - Leu
    - Fecioară
    - Balanță
    - Scorpion
    - Săgetător
    - Capricorn
    - Vărsător
    - Pești

- **Întrebarea 2**: Care este data ta de naștere? (Format: ZZ/LL/AAAA)
  - **Tip**: input text (dată)
  - **Placeholder**: `dd/MM/yyyy`
  - **Validare**: format `DD/MM/YYYY`

- **Întrebarea 3**: Ce tip de relație cauți?
  - **Tip**: alegere unică
  - **Opțiuni**:
    - Relație de lungă durată
    - Relație casual
    - Prietenie

Notă: Dacă se adaugă întrebări noi în `mock/astroQuestions.js` sau se extinde pasul de profil, actualizează și acest fișier.
