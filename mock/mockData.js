// Mock Users
export const mockUsers = [
  {
    id: "user_1",
    email_address: "john.doe@email.com",
    first_name: "John",
    last_name: "Doe",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    banner_url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=200&fit=crop",
    banner_id: "banner_1",
    username: "johndoe",
  },
  {
    id: "user_2",
    email_address: "jane.smith@email.com",
    first_name: "Jane",
    last_name: "Smith",
    image_url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    banner_url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=200&fit=crop",
    banner_id: "banner_2",
    username: "janesmith",
  },
  {
    id: "user_3",
    email_address: "mike.johnson@email.com",
    first_name: "Mike",
    last_name: "Johnson",
    image_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    banner_url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=200&fit=crop",
    banner_id: "banner_3",
    username: "mikejohnson",
  },
  {
    id: "user_4",
    email_address: "sarah.wilson@email.com",
    first_name: "Sarah",
    last_name: "Wilson",
    image_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    banner_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=200&fit=crop",
    banner_id: "banner_4",
    username: "sarahwilson",
  },
  {
    id: "user_5",
    email_address: "alex.brown@email.com",
    first_name: "Alex",
    last_name: "Brown",
    image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    banner_url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=200&fit=crop",
    banner_id: "banner_5",
    username: "alexbrown",
  },
];

// Mock Posts
export const mockPosts = [
  {
    id: 1,
    postText: "Just had an amazing day at the beach! 🏖️ The weather was perfect and the sunset was absolutely stunning. Can't wait to go back next weekend!",
    media: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    authorId: "user_1",
    cld_id: "beach_sunset_1",
    createdAt: new Date("2024-01-15T10:30:00Z"),
    likes: [
      { id: 1, postId: 1, authorId: "user_2", createdAt: new Date("2024-01-15T11:00:00Z") },
      { id: 2, postId: 1, authorId: "user_3", createdAt: new Date("2024-01-15T11:15:00Z") },
      { id: 3, postId: 1, authorId: "user_4", createdAt: new Date("2024-01-15T11:30:00Z") },
    ],
    comments: [
      {
        id: 1,
        comment: "Looks absolutely beautiful! 😍",
        authorId: "user_2",
        postId: 1,
        createdAt: new Date("2024-01-15T11:45:00Z"),
        author: mockUsers.find(u => u.id === "user_2"),
      },
      {
        id: 2,
        comment: "I'm so jealous! Need a beach day too 🌊",
        authorId: "user_3",
        postId: 1,
        createdAt: new Date("2024-01-15T12:00:00Z"),
        author: mockUsers.find(u => u.id === "user_3"),
      },
    ],
    trends: [
      { id: 1, name: "Beach", postId: 1 },
      { id: 2, name: "Sunset", postId: 1 },
    ],
    author: mockUsers.find(u => u.id === "user_1"),
  },
  {
    id: 2,
    postText: "Working on my new Next.js project and loving every minute of it! 💻 The new features in Next.js 14 are incredible. #NextJS #WebDev",
    media: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop",
    authorId: "user_2",
    cld_id: "coding_setup_1",
    createdAt: new Date("2024-01-14T14:20:00Z"),
    likes: [
      { id: 4, postId: 2, authorId: "user_1", createdAt: new Date("2024-01-14T14:30:00Z") },
      { id: 5, postId: 2, authorId: "user_5", createdAt: new Date("2024-01-14T14:45:00Z") },
    ],
    comments: [
      {
        id: 3,
        comment: "What's your favorite new feature?",
        authorId: "user_1",
        postId: 2,
        createdAt: new Date("2024-01-14T15:00:00Z"),
        author: mockUsers.find(u => u.id === "user_1"),
      },
    ],
    trends: [
      { id: 3, name: "NextJS", postId: 2 },
      { id: 4, name: "WebDev", postId: 2 },
    ],
    author: mockUsers.find(u => u.id === "user_2"),
  },
  {
    id: 3,
    postText: "Homemade pizza night! 🍕 Tried a new recipe with mozzarella and fresh basil. Family approved! 👨‍👩‍👧‍👦",
    media: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop",
    authorId: "user_3",
    cld_id: "pizza_night_1",
    createdAt: new Date("2024-01-13T18:45:00Z"),
    likes: [
      { id: 6, postId: 3, authorId: "user_1", createdAt: new Date("2024-01-13T19:00:00Z") },
      { id: 7, postId: 3, authorId: "user_2", createdAt: new Date("2024-01-13T19:15:00Z") },
      { id: 8, postId: 3, authorId: "user_4", createdAt: new Date("2024-01-13T19:30:00Z") },
      { id: 9, postId: 3, authorId: "user_5", createdAt: new Date("2024-01-13T19:45:00Z") },
    ],
    comments: [
      {
        id: 4,
        comment: "That looks delicious! Recipe please? 🤤",
        authorId: "user_4",
        postId: 3,
        createdAt: new Date("2024-01-13T20:00:00Z"),
        author: mockUsers.find(u => u.id === "user_4"),
      },
      {
        id: 5,
        comment: "Pizza night is the best night!",
        authorId: "user_5",
        postId: 3,
        createdAt: new Date("2024-01-13T20:15:00Z"),
        author: mockUsers.find(u => u.id === "user_5"),
      },
    ],
    trends: [
      { id: 5, name: "Pizza", postId: 3 },
      { id: 6, name: "Cooking", postId: 3 },
    ],
    author: mockUsers.find(u => u.id === "user_3"),
  },
  {
    id: 4,
    postText: "Morning run in the park ✨ Nothing beats the fresh air and peaceful atmosphere. Ready to tackle the day!",
    media: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
    authorId: "user_4",
    cld_id: "morning_run_1",
    createdAt: new Date("2024-01-12T07:30:00Z"),
    likes: [
      { id: 10, postId: 4, authorId: "user_2", createdAt: new Date("2024-01-12T08:00:00Z") },
      { id: 11, postId: 4, authorId: "user_3", createdAt: new Date("2024-01-12T08:15:00Z") },
    ],
    comments: [
      {
        id: 6,
        comment: "You're so motivated! I should start running too 💪",
        authorId: "user_2",
        postId: 4,
        createdAt: new Date("2024-01-12T08:30:00Z"),
        author: mockUsers.find(u => u.id === "user_2"),
      },
    ],
    trends: [
      { id: 7, name: "Running", postId: 4 },
      { id: 8, name: "Fitness", postId: 4 },
    ],
    author: mockUsers.find(u => u.id === "user_4"),
  },
  {
    id: 5,
    postText: "Coffee shop vibes ☕ Working on some new design concepts. The creativity flows better with good coffee and jazz music in the background.",
    media: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop",
    authorId: "user_5",
    cld_id: "coffee_shop_1",
    createdAt: new Date("2024-01-11T16:20:00Z"),
    likes: [
      { id: 12, postId: 5, authorId: "user_1", createdAt: new Date("2024-01-11T16:30:00Z") },
      { id: 13, postId: 5, authorId: "user_3", createdAt: new Date("2024-01-11T16:45:00Z") },
      { id: 14, postId: 5, authorId: "user_4", createdAt: new Date("2024-01-11T17:00:00Z") },
    ],
    comments: [
      {
        id: 7,
        comment: "Love that cozy atmosphere! ✨",
        authorId: "user_1",
        postId: 5,
        createdAt: new Date("2024-01-11T17:15:00Z"),
        author: mockUsers.find(u => u.id === "user_1"),
      },
    ],
    trends: [
      { id: 9, name: "Coffee", postId: 5 },
      { id: 10, name: "Design", postId: 5 },
    ],
    author: mockUsers.find(u => u.id === "user_5"),
  },
  {
    id: 6,
    postText: "Weekend hiking adventure! 🏔️ Reached the summit just in time for the most incredible view. Nature never fails to amaze me.",
    media: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    authorId: "user_1",
    cld_id: "hiking_summit_1",
    createdAt: new Date("2024-01-10T12:00:00Z"),
    likes: [
      { id: 15, postId: 6, authorId: "user_2", createdAt: new Date("2024-01-10T12:15:00Z") },
      { id: 16, postId: 6, authorId: "user_5", createdAt: new Date("2024-01-10T12:30:00Z") },
    ],
    comments: [
      {
        id: 8,
        comment: "That view is breathtaking! 🤩",
        authorId: "user_2",
        postId: 6,
        createdAt: new Date("2024-01-10T12:45:00Z"),
        author: mockUsers.find(u => u.id === "user_2"),
      },
    ],
    trends: [
      { id: 11, name: "Hiking", postId: 6 },
      { id: 12, name: "Nature", postId: 6 },
    ],
    author: mockUsers.find(u => u.id === "user_1"),
  },
];

// Mock Follows
export const mockFollows = [
  { id: 1, followerId: "user_1", followingId: "user_2", createdAt: new Date("2024-01-01T00:00:00Z") },
  { id: 2, followerId: "user_1", followingId: "user_3", createdAt: new Date("2024-01-01T00:00:00Z") },
  { id: 3, followerId: "user_2", followingId: "user_1", createdAt: new Date("2024-01-01T00:00:00Z") },
  { id: 4, followerId: "user_2", followingId: "user_4", createdAt: new Date("2024-01-01T00:00:00Z") },
  { id: 5, followerId: "user_3", followingId: "user_1", createdAt: new Date("2024-01-01T00:00:00Z") },
  { id: 6, followerId: "user_3", followingId: "user_5", createdAt: new Date("2024-01-01T00:00:00Z") },
  { id: 7, followerId: "user_4", followingId: "user_2", createdAt: new Date("2024-01-01T00:00:00Z") },
  { id: 8, followerId: "user_5", followingId: "user_3", createdAt: new Date("2024-01-01T00:00:00Z") },
];

// Mock current user (this will be the logged-in user)
export const mockCurrentUser = {
  id: "user_1",
  email_address: "john.doe@email.com",
  first_name: "John",
  last_name: "Doe",
  image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  banner_url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=200&fit=crop",
  banner_id: "banner_1",
  username: "johndoe",
  imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", // For Clerk compatibility
  firstName: "John", // For Clerk compatibility
  lastName: "Doe", // For Clerk compatibility
};

// Mock trends with counts (matching mockTrends.js format)
export const mockTrendsWithCounts = [
  { name: "Mozarella Panckaes", _count: { name: 19000 } },
  { name: "NEXTJS 14", _count: { name: 15000 } },
  { name: "Zainkeepscode", _count: { name: 10000 } },
];

// Helper function to get posts with full relationships
export const getPostsWithRelations = () => {
  return mockPosts.map(post => ({
    ...post,
    author: mockUsers.find(u => u.id === post.authorId),
    likes: post.likes || [],
    comments: (post.comments || []).map(comment => ({
      ...comment,
      author: mockUsers.find(u => u.id === comment.authorId),
    })),
    trends: post.trends || [],
  }));
};

// Helper function to simulate pagination
export const paginatePosts = (posts, lastCursor, take = 5) => {
  let startIndex = 0;
  
  if (lastCursor) {
    const cursorIndex = posts.findIndex(post => post.id === lastCursor);
    startIndex = cursorIndex + 1;
  }
  
  const paginatedPosts = posts.slice(startIndex, startIndex + take);
  const hasMore = startIndex + take < posts.length;
  const lastPost = paginatedPosts[paginatedPosts.length - 1];
  
  return {
    data: paginatedPosts,
    metaData: {
      lastCursor: lastPost ? lastPost.id : null,
      hasMore,
    },
  };
}; 