## Firebase Integration (Mobile - Expo)

Goal: wire the Expo app to the same Firebase project with minimal UI changes and reuse of shared services.

### 1) Install deps
```bash
expo install firebase
```

Optional (push, perf):
```bash
expo install expo-notifications
```

### 2) Config and env
- Use the same config keys as web (see `FIREBASE_SETUP.md`):
  - FIREBASE_API_KEY
  - FIREBASE_AUTH_DOMAIN
  - FIREBASE_PROJECT_ID
  - FIREBASE_STORAGE_BUCKET
  - FIREBASE_MESSAGING_SENDER_ID
  - FIREBASE_APP_ID

Recommended: inject via `app.config.js`:
```js
// app.config.js
export default ({ config }) => ({
  ...config,
  extra: {
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    },
  },
});
```

### 3) Initialize Firebase in RN
```js
// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';

const firebaseConfig = Constants.expoConfig?.extra?.firebase;
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

If using shared services, expose db:
```js
// src/bootstrapDb.ts
import { setDb } from 'shared/db';
import { db } from './firebase';
setDb(db);
```

Call `bootstrapDb` once at app startup (root component).

### 4) Auth wiring
- Use Firebase Auth JS SDK:
  - email/password (createUserWithEmailAndPassword, signInWithEmailAndPassword)
  - Google/Apple: recommended native flows (or Web SDK popups for dev)
- On sign up, create `Users/{uid}` mirroring web fields (see `FIREBASE_DATA_CONTRACT.md`).
- Subscribe to `onAuthStateChanged` to load `Users/{uid}` and update presence/last activity.

### 5) Shared services usage
Import shared services and call them directly after `setDb(db)`:
```js
import { fetchFeed, createPost, likePost } from 'shared/services/posts';
```

### 6) Timestamps serialization
- Use the same utilities from web (`utils/firebaseHelpers.js`, `utils/dateHelpers.js`) or mirror their logic in RN to turn Firestore `Timestamp` into ISO strings for state/UI.

### 7) Push notifications (optional)
- Register device token via `expo-notifications`; store under `Users/{uid}/deviceTokens` or a field list.
- Cloud Functions/backends can fan out via FCM using the saved tokens.

### 8) Storage
- Use identical paths documented in `FIREBASE_DATA_CONTRACT.md` (`banners/{userId}/...`, `posts/{authorId}/...`, `conversations/{conversationId}/images/...`).
- Use `uploadBytes` + `getDownloadURL`.

### 9) Firestore rules/indexes
- Ensure indexes listed in `FIRESTORE_INDEXES.md` exist in the project for mobile queries.

### 10) Minimal UI mapping
- After bootstrap, most screens need only to call the shared service:
  - Feed: `fetchFeed` → render posts; like: `likePost`/`unlikePost`
  - Create Post: `createPost`
  - Chat: `getUserConversations`, `sendMessage`, `subscribeToConversationMessages`
  - Profile: `getUserById`, `updateUserProfile`, `updateBanner`



