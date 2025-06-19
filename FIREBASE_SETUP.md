# Firebase Setup Instructions

## 1. Configurarea variabilelor de mediu

Creează un fișier `.env.local` în rădăcina proiectului cu următoarele variabile:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 2. Obținerea configurației Firebase

1. Mergi la [Firebase Console](https://console.firebase.google.com/)
2. Selectează proiectul tău existent `destiny-3b584`
3. Click pe Settings (setări) > Project settings
4. Scroll down la "Your apps" și click pe "Web app"
5. Copiază valorile din `firebaseConfig` object

## 3. Activarea Authentication

1. În Firebase Console, mergi la Authentication
2. Click pe "Get started"
3. În tab-ul "Sign-in method", activează:
   - Email/Password
   - Google (opțional)
   - Facebook (opțional)

## 4. Configurarea Firestore Rules

Mergi la Firestore Database > Rules și actualizează cu:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own documents
    match /Users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read other users' public data
    match /Users/{userId} {
      allow read: if request.auth != null;
    }
  }
}
```

## 5. Structura documentelor utilizatori

Documentele din colecția `Users` vor avea următoarea structură:

```javascript
{
  email: "user@example.com",
  username: "Username",
  gender: "female", // "male", "female", "other"
  firstName: "First",
  lastName: "Last",
  images: [
    {
      fileName: "79d76158-ca13-4be6-9f59-0fb4a1d456b2",
      fileUri: "https://firebasestorage.googleapis.com/v0/b/destiny-3b584.firebasestorage.app/o/images%2F79d76158-ca13-4be6-9f59-0fb4a1d456b2?alt=media&token=1ea802b3-14e4-4edb-b81d-73492d05d28a",
      isMain: true
    },
    {
      fileName: "c44ce6f5-2263-407f-83e8-585e38ef1c91",
      fileUri: "https://firebasestorage.googleapis.com/v0/b/destiny-3b584.firebasestorage.app/o/images%2Fc44ce6f5-2263-407f-83e8-585e38ef1c91?alt=media&token=d22815ca-dbe0-43dc-b71e-d132223b8d98",
      isMain: false
    }
  ],
  bio: "",
  location: "",
  website: "",
  verified: false,
  followers: [],
  following: [],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 6. Adăugarea imaginilor de profil

Pentru a adăuga imagini de profil, folosește helper functions din `@/utils/imageHelpers`:

```javascript
import { createImageObject, setMainImage } from '@/utils/imageHelpers';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Creează un nou obiect imagine
const newImage = createImageObject(fileName, firebaseStorageUrl, true);

// Actualizează array-ul de imagini
const updatedImages = [...user.images, newImage];

// Salvează în Firestore
await updateDoc(doc(db, 'Users', userId), {
  images: updatedImages,
  updatedAt: serverTimestamp()
});
``` 