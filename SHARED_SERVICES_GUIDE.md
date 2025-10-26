## Shared Services Guide

Goal: reuse the same Firestore CRUD between web and mobile with a thin DB adapter.

### 1) DB adapter
```js
// shared/db.js
let dbInstance = null;
export const setDb = (db) => { dbInstance = db; };
export const getDb = () => { if (!dbInstance) throw new Error('db not set'); return dbInstance; };
```

### 2) Service pattern
```js
// shared/services/posts.js
import { collection, addDoc, getDoc, doc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getDb } from '../db';

export async function createPost({ authorId, postText, media }) {
  const db = getDb();
  const ref = await addDoc(collection(db, 'Posts'), { authorId, postText, media, createdAt: new Date() });
  const snap = await getDoc(ref);
  return { id: snap.id, ...snap.data() };
}

export async function fetchFeed({ pageSize = 20 } = {}) {
  const db = getDb();
  const q = query(collection(db, 'Posts'), orderBy('createdAt', 'desc'), limit(pageSize));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
```

### 3) Web wiring
```js
// web/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { setDb } from 'shared/db';

const app = initializeApp(firebaseConfig);
setDb(getFirestore(app));
```

### 4) Mobile wiring
```js
// mobile/src/bootstrapDb.ts
import { setDb } from 'shared/db';
import { db } from './firebase';
setDb(db);
```

### 5) Serialization utils
- Reuse `utils/firebaseHelpers.js` and `utils/dateHelpers.js` so UI receives ISO strings.

### 6) Naming and contracts
- Collection names are canonical; see `FIREBASE_DATA_CONTRACT.md`.
- Services must not import `@/lib/firebase` directly; always use `getDb()`.



