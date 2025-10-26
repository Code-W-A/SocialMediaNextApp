## Schema Firestore (colecții, câmpuri, subcolecții)

Acest fișier descrie structura actuală a datelor din Firestore folosită de aplicație, extrasă din cod și documentația existentă. Numele colecțiilor sunt sensibile la majuscule.

### Colecția `Users`
- **Câmpuri**:
  - `firstName` string
  - `lastName` string
  - `username` string
  - `email` string
  - `gender` 'male' | 'female' | string
  - `bio` string
  - `location` string
  - `website` string (URL normalizat)
  - `interests` string[]
  - `images` Array<{ `fileName` string, `fileUri` string, `isMain` boolean }>
  - `gpsCoordinates` { `latitude` number, `longitude` number }
  - `banner_url` string | null
  - `banner_id` string | null
  - `createdAt` Timestamp
  - `updatedAt` Timestamp
  - `lastTimeActive` Timestamp
  - `presence` { `status` 'online'|'away'|'offline', `lastSeen` Timestamp, `lastActivity` Timestamp, `connectedAt` Timestamp?, `sessionId` string? }
  - `questionnaire` { `zodiacSign` string, `birthDate` string (DD/MM/YYYY), `relationshipType` string, `completedAt` ISO string } | any (compatibil cu versiuni mai vechi)
  - `age` number | null (derivat din `birthDate`)
  - `onboardingCompleted` boolean
  - `subscription` {
    - `status` string (e.g. 'active','trialing','past_due','canceled','inactive')
    - `isPremium` boolean
    - `type` string?
    - `source` string? (e.g. 'stripe','admin_granted')
    - `customerId` string?
    - `subscriptionId` string?
    - `currentPeriodStart` Timestamp | ISO
    - `currentPeriodEnd` Timestamp | ISO
    - `cancelAtPeriodEnd` boolean
    - `updatedAt` Timestamp
  }

### Colecția `Posts`
- **Câmpuri**:
  - `postText` string
  - `media` string | null (Firebase Storage URL)
  - `mediaFileName` string | null
  - `authorId` string (ref `Users/{uid}`)
  - `createdAt` Timestamp
  - `updatedAt` Timestamp
  - `edited` boolean
  - `editedAt` Timestamp?
  - `isVisible` boolean
  - `likesCount` number
  - `commentsCount` number
- **Subcolecții**:
  - `Comments`
    - `comment` string
    - `authorId` string
    - `createdAt` Timestamp
    - `updatedAt` Timestamp?
    - `edited` boolean?
    - `editedAt` Timestamp?
  - `Likes`
    - `authorId` string
    - `postId` string
    - `createdAt` Timestamp

### Colecția `Conversations`
- **Câmpuri**:
  - `participants` string[] (ID-urile celor doi utilizatori)
  - `createdAt` Timestamp
  - `updatedAt` Timestamp
  - `lastMessage` { `id` string, `text` string, `senderId` string, `timestamp` Timestamp|number, `type` 'text'|'image' } | null
  - `lastMessageTime` Timestamp | null
  - `lastMessageType` string? ('text'|'image')
  - `unreadCounts` { [userId]: number }
- **Subcolecții**:
  - `Messages`
    - `senderId` string
    - `text` string? (dacă `type==='text'`)
    - `type` 'text'|'image'|'deleted'
    - `imageUrl` string?
    - `imageName` string?
    - `imageSize` number?
    - `caption` string?
    - `timestamp` Timestamp
    - `read` boolean?
    - `createdAt` Timestamp?
    - `deleted` boolean?
    - `deletedAt` Timestamp?
    - `deletedFor` { [userId]: boolean }?
    - `lastEditAt` Timestamp?
    - `edited` boolean?
  - `Reactions` (per mesaj)
    - cheie doc: `${userId}_${emoji}`
    - `userId` string
    - `emoji` string
    - `timestamp` Timestamp
  - `ReadReceipts` (per mesaj)
    - cheie doc: `userId`
    - `userId` string
    - `readAt` Timestamp
  - `Typing` (ephemeral)
    - `isTyping` boolean
    - `timestamp` Timestamp
    - `userId` string

### Colecția `Compatibilities`
- **Câmpuri**:
  - `userId` string
  - `targetUserId` string
  - `createdAt` Date|Timestamp
  - `createdBy` string

### Colecția `ResonanceRequests`
- **Câmpuri**:
  - `requesterId` string
  - `targetUserId` string
  - `status` 'pending'|'approved'|'rejected'
  - `type` 'resonance'
  - `createdAt` Timestamp
  - `updatedAt` Timestamp

### Colecția `adminChats`
- **Câmpuri**:
  - `userId` string
  - `userEmail` string
  - `userName` string
  - `userImage` string | null
  - `subject` string
  - `initialMessage` string
  - `language` string ('ro' implicit)
  - `status` 'pending'|'active'|'closed'
  - `priority` 'low'|'medium'|'high'
  - `isAdminOnline` boolean
  - `adminId` string | null
  - `adminName` string | null
  - `createdAt` Timestamp
  - `updatedAt` Timestamp
  - `lastMessage` { `text` string, `timestamp` number|Timestamp, `from` 'user'|'admin' }
  - `unreadCount` number
  - `messages` Array<{ `id` string, `text` string, `timestamp` number|Timestamp, `from` 'user'|'admin', `read` boolean }>

### Colecția `application_errors` (logging)
- **Câmpuri**:
  - orice payload de eroare serializat
  - `createdAt` Timestamp

## Indexuri recomandate (composite / ordine)
- `Posts`: `orderBy(createdAt desc)`; `where(isVisible != false) + orderBy(createdAt desc)`
- `Posts`: `where(authorId == uid) + orderBy(createdAt desc)` (opțional și `where(isVisible != false)`)
- `Conversations`: `where(participants array-contains uid)` (dacă se combină cu `orderBy`, creați index compozit)
- `Compatibilities`: `where(userId == uid) + orderBy(createdAt desc)`; opțional existență cu `where(targetUserId == uid)`
- `adminChats`: `orderBy(updatedAt desc)`; `where(status == 'pending'|'active'|'closed') + orderBy(updatedAt desc)`
- `Comments` (subcolecție Posts): `orderBy(createdAt asc|desc)`

Notă: Dacă Firestore solicită un index la runtime, acceptați crearea în consolă și adăugați-l ulterior aici.

