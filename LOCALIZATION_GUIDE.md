# 🌍 Ghid de Localizare YDestiny

## Prezentare Generală

Aplicația YDestiny suportă acum **română** și **engleză** cu posibilitatea de a schimba limba din mai multe locuri în aplicație.

## 🔧 Cum Funcționează

### Limbile Disponibile
- **🇷🇴 Română** (limba implicită)
- **🇺🇸 English**

### Unde Poți Schimba Limba
1. **Header** (desktop) - selector mic în partea de sus
2. **Sidebar** (desktop) - selector în meniul lateral
3. **Setările** utilizatorului (viitor)

### Salvarea Preferințelor
Limba selectată este salvată în `localStorage` și va fi reținută între sesiuni.

## 🛠️ Pentru Dezvoltatori

### Utilizarea Traducerilor

```jsx
import { useLanguage } from '@/lib/i18n';

const MyComponent = () => {
  const { t, language, changeLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('common.title')}</h1>
      <p>{t('messages.welcome', { name: 'John' })}</p>
      <button onClick={() => changeLanguage('en')}>
        Switch to English
      </button>
    </div>
  );
};
```

### Structura Traducerilor

Traducerile sunt organizate în categorii:

```javascript
{
  common: {
    loading: "Se încarcă...",
    error: "Eroare",
    success: "Succes"
  },
  nav: {
    home: "Acasă",
    messages: "Mesaje",
    matches: "Match-uri"
  },
  messages: {
    title: "Mesaje",
    noConversations: "Încă nu ai conversații"
  }
  // ...
}
```

### Adăugarea de Traduceri Noi

1. **Adaugă cheia în `lib/i18n.js`** în ambele limbi:
```javascript
ro: {
  mySection: {
    newKey: "Text în română"
  }
},
en: {
  mySection: {
    newKey: "Text in English"
  }
}
```

2. **Folosește în componentă**:
```jsx
{t('mySection.newKey')}
```

### Parametri în Traduceri

Pentru texte cu variabile:

```javascript
// În traduceri
welcome: "Bun venit, {name}!"

// În componentă
{t('welcome', { name: userName })}
```

## 📱 Componente Traduse

### Componente Principale
- ✅ **Header** - meniu utilizator, butoane
- ✅ **Sidebar** - navigare principală
- ✅ **Messages** - pagina de mesaje
- ✅ **Matches** - pagina de match-uri
- ✅ **V1WelcomeDialog** - dialogul de bun venit
- ✅ **PostGenerator** - generator de postări
- ✅ **Onboarding** - procesul de configurare

### Componente de Tradus (viitor)
- ⏳ **Profile** - pagina de profil
- ⏳ **Premium** - pagina premium
- ⏳ **Settings** - setările aplicației
- ⏳ **Comments** - secțiunea de comentarii
- ⏳ **Admin** - panoul de administrare

## 🎯 Categorii de Traduceri

### `common`
Texte comune folosite în toată aplicația (butoane, mesaje de eroare, etc.)

### `nav`
Elementele de navigare (meniu, sidebar)

### `messages`
Pagina și funcționalitățile de mesagerie

### `matches`
Pagina de match-uri și compatibilitate

### `premium`
Funcționalitățile Premium

### `v1`
Sistemul de migrare V1 → V2

### `posts`
Generarea și afișarea postărilor

### `onboarding`
Procesul de configurare inițială

## 🔄 Schimbarea Limbii

Utilizatorii pot schimba limba din:

1. **Header** (🌐 icon) - pentru desktop
2. **Sidebar** - selector în partea de jos
3. **Viitor**: Pagina de setări

## 💾 Persistența Datelor

- Limba este salvată în `localStorage` cu cheia `ydestiny_language`
- Se încarcă automat la pornirea aplicației
- Fallback la română dacă nu există limba salvată

## 🚀 Implementare Completă

Sistemul este complet funcțional și integrat în:
- Layout principal (`app/(app)/layout.jsx`)
- Toate componentele majore
- Sistem de fallback pentru traduceri lipsă
- Schimbător de limbă accesibil

---

*Sistemul de localizare este gata de utilizare și poate fi extins ușor cu noi limbi și traduceri!* 