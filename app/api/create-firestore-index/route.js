import { NextResponse } from 'next/server';

export async function GET() {
  const indexInfo = {
    message: "Firestore Composite Index Required",
    collection: "Posts",
    fields: [
      { field: "authorId", type: "ASCENDING" },
      { field: "createdAt", type: "DESCENDING" }
    ],
    instructions: [
      "1. Go to Firebase Console",
      "2. Navigate to Firestore Database > Indexes",
      "3. Click 'Create Index'",
      "4. Collection ID: Posts",
      "5. Add field: authorId (Ascending)",
      "6. Add field: createdAt (Descending)",
      "7. Click 'Create'"
    ],
    automaticLink: "https://console.firebase.google.com/v1/r/project/destiny-3b584/firestore/indexes?create_composite=Cktwcm9qZWN0cy9kZXN0aW55LTNiNTg0L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9Qb3N0cy9pbmRleGVzL18QARoMCghhdXRob3JJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI",
    note: "The app will work with fallback queries until the index is created. Creating the index will improve performance."
  };

  return NextResponse.json(indexInfo);
} 