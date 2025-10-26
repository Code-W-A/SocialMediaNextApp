## UI ↔ Data Mapping

Purpose: map core screens to Firestore data/services to minimize UI changes.

### Auth
- onAuthStateChanged → load `Users/{uid}`
- signUp → create `Users/{uid}` with base fields
- presence/last activity → write to `Users/{uid}.presence`, `lastTimeActive`

### Home/Feed
- List: `Posts` ordered by `createdAt desc`, filter `isVisible != false`
- Item fields: `postText`, `media`, `authorId`, `likesCount`, `commentsCount`, timestamps
- Actions: `likePost`/`unlikePost` (subcollection `Likes`), `addComment`

### Post details
- Document `Posts/{postId}`
- Subcollections: `Comments`, `Likes`
- Author info → hydrate from `Users/{authorId}`

### Profile
- Read `Users/{uid}`
- Edit: `updateUserProfile` (strings sanitized, optional fields kept)
- Banner: upload to `banners/{uid}/...` then update `banner_url`, `banner_id`

### Messages
- Conversations list: `Conversations` where `participants` contains `uid`
- Conversation view: subcollection `Messages` ordered by `timestamp desc`
- Reactions, ReadReceipts, Typing use corresponding subcollections

### Admin Chat (if present on mobile)
- Collection `adminChats`: filter by `userId`, order by `updatedAt desc`
- Append message by arrayUnion into `messages`

### Subscriptions (Stripe-backed)
- Read-only on mobile: use `Users/{uid}.subscription` to gate features
- Write path occurs server-side via webhook; mobile may update preferences

### Indexes
- Ensure indexes listed in `FIRESTORE_INDEXES.md`



