## Required Firestore Indexes

Create these composite indexes to support queries used by web and mobile.

### Posts
- where(isVisible != false) + orderBy(createdAt desc)
- where(authorId == uid) + where(isVisible != false) + orderBy(createdAt desc)

### Conversations
- where(participants array-contains uid)
  - Note: array-contains alone typically needs no composite index, but if combined with orderBy, add index accordingly.

### Compatibilities
- where(userId == uid) + orderBy(createdAt desc)
- where(userId == uid) + where(targetUserId == uid) (existence checks)

### adminChats
- orderBy(updatedAt desc)
- where(status == 'pending'|'active'|'closed') + orderBy(updatedAt desc)

### Comments (subcollections under Posts)
- orderBy(createdAt asc/desc)

If the Firebase console prompts for additional indexes during query failures, accept and create them; then append here.



