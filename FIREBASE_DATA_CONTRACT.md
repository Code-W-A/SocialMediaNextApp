## Firebase Data Contract

This document describes the canonical data model and integration points for Firestore, Storage, and Auth used by this project. Use it to align the React Native (Expo) app with the existing web app.

### Firestore

Collections and key subcollections (case-sensitive):

- Users
  - Fields (representative):
    - firstName string
    - lastName string
    - username string
    - email string
    - gender 'male' | 'female' | string
    - bio string
    - location string
    - website string (normalized URL)
    - interests string[]
    - images Array<{ fileName string, fileUri string, isMain boolean }>
    - gpsCoordinates { latitude number, longitude number }
    - banner_url string | null
    - banner_id string | null
    - createdAt Timestamp
    - updatedAt Timestamp
    - lastTimeActive Timestamp
    - presence { status 'online'|'away'|'offline', lastSeen Timestamp, lastActivity Timestamp, connectedAt Timestamp?, sessionId string? }
    - questionnaire any (see onboarding docs)
    - age number | null
    - onboardingCompleted boolean
    - subscription { status string, isPremium boolean, type string?, source string?, customerId string?, subscriptionId string?, currentPeriodStart Timestamp|ISO, currentPeriodEnd Timestamp|ISO, cancelAtPeriodEnd boolean, updatedAt Timestamp }

- Posts
  - Fields:
    - postText string
    - media string | null (Firebase Storage URL)
    - mediaFileName string | null
    - authorId string (ref Users/{uid})
    - createdAt Timestamp
    - updatedAt Timestamp
    - edited boolean
    - editedAt Timestamp?
    - isVisible boolean
    - likesCount number
    - commentsCount number
  - Subcollections:
    - Comments
      - comment string
      - authorId string
      - createdAt Timestamp
      - updatedAt Timestamp?
      - edited boolean?
      - editedAt Timestamp?
    - Likes
      - authorId string
      - postId string
      - createdAt Timestamp

- Conversations
  - Fields:
    - participants string[] (two user IDs)
    - createdAt Timestamp
    - updatedAt Timestamp
    - lastMessage { id string, text string, senderId string, timestamp Timestamp, type 'text'|'image' } | null
    - lastMessageTime Timestamp | null
    - lastMessageType string? ('text'|'image')
    - unreadCounts { [userId]: number }
  - Subcollections:
    - Messages
      - senderId string
      - text string? (present if type==='text')
      - type 'text'|'image'|'deleted'
      - imageUrl string?
      - imageName string?
      - imageSize number?
      - caption string?
      - timestamp Timestamp
      - read boolean?
      - createdAt Timestamp?
      - deleted boolean?
      - deletedAt Timestamp?
      - deletedFor { [userId]: boolean }?
      - lastEditAt Timestamp?
      - edited boolean?
    - Reactions (per message)
      - key: `${userId}_${emoji}`
      - userId string
      - emoji string
      - timestamp Timestamp
    - ReadReceipts (per message)
      - key: userId
      - userId string
      - readAt Timestamp
    - Typing (ephemeral; may be doc per user or collection)
      - isTyping boolean
      - timestamp Timestamp
      - userId string

- Compatibilities
  - Fields:
    - userId string
    - targetUserId string
    - createdAt Date|Timestamp
    - createdBy string

- ResonanceRequests
  - Fields:
    - requesterId string
    - targetUserId string
    - status 'pending'|'approved'|'rejected'
    - type 'resonance'
    - createdAt Timestamp
    - updatedAt Timestamp

- adminChats
  - Fields:
    - userId string
    - userEmail string
    - userName string
    - userImage string|null
    - subject string
    - initialMessage string
    - language string ('ro' default)
    - status 'pending'|'active'|'closed'
    - priority 'low'|'medium'|'high'
    - isAdminOnline boolean
    - adminId string|null
    - adminName string|null
    - createdAt Timestamp
    - updatedAt Timestamp
    - lastMessage { text string, timestamp number|Timestamp, from 'user'|'admin' }
    - unreadCount number
    - messages Array<{ id string, text string, timestamp number|Timestamp, from 'user'|'admin', read boolean }>

- application_errors (logging)
  - Fields: error data blob, createdAt Timestamp

Indexes commonly used:
- Posts: orderBy(createdAt desc), where(isVisible != false)
- Posts: where(authorId == uid) + orderBy(createdAt desc)
- Conversations: where(participants array-contains uid)
- Compatibilities: where(userId==uid), where(targetUserId==uid), orderBy(createdAt desc)
- adminChats: orderBy(updatedAt desc); where(status==X) + orderBy(updatedAt desc)

Timestamp handling:
- Client UI should serialize Firestore Timestamp to ISO string when crossing server/client boundaries. This project uses utils/firebaseHelpers.js and utils/dateHelpers.js for that purpose.

### Storage

Paths and usage patterns:
- banners/{userId}/{fileName}
  - User profile banners (JPEG/PNG). On update, previous banner may be deleted.
- posts/{authorId}/post_{timestamp}.{ext}
  - Images/videos uploaded for posts. Returns Firebase Storage URL.
- conversations/{conversationId}/images/{fileName}
  - Images sent in chat messages.
- images/{fileName}
  - Generic uploads from onboarding/profile edit flows.

Operations used:
- getStorage(), ref(storage, path), uploadBytes(ref, blob|file), getDownloadURL(ref), deleteObject(ref)

### Auth

Providers and flows:
- Firebase Auth (email/password, Google popup on web). For mobile, use the Firebase JS SDK or native SDK per platform.
- onAuthStateChanged to track session.
- On sign up, create a corresponding Users/{uid} document with base profile plus subscription: { status: 'free', isPremium: false }.
- On sign-in, UI loads Users/{uid}; presence and lastTimeActive are updated via serverTimestamp and debounced calls.

User presence model (stored in Users/{uid}.presence):
- status 'online'|'away'|'offline'
- lastSeen Timestamp
- lastActivity Timestamp
- connectedAt Timestamp? (set when going online)
- sessionId string? (session tracking)

Subscription model (stored under Users/{uid}.subscription):
- status string (e.g., 'active','trialing','past_due','canceled','inactive')
- isPremium boolean
- type string? (lifetime, temporary, admin_granted, legacy_premium)
- source string? (stripe, admin_granted, subscriptionActive_property)
- customerId string? (Stripe)
- subscriptionId string? (Stripe)
- currentPeriodStart Timestamp|ISO string
- currentPeriodEnd Timestamp|ISO string
- cancelAtPeriodEnd boolean
- updatedAt Timestamp

### Env and Initialization

Web (Next.js): see lib/firebase.js, uses NEXT_PUBLIC_* envs:
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID

Mobile (Expo): initialize Firebase with same config; expose Firestore instance to shared services.

### Notes
- Collection names are PascalCase in this project: Users, Posts, Conversations, Compatibilities, ResonanceRequests, adminChats (lowercase for this one).
- Timestamps are often written with serverTimestamp() and must be converted for UI rendering.
- Some lists (comments/likes/messages) are stored as subcollections for scalability.


