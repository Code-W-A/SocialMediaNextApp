import { mockUsers, mockCurrentUser } from "./mockData";

// Mock conversations with last messages
export const mockConversations = [
  {
    id: 1,
    participants: [mockCurrentUser, mockUsers.find(u => u.id === "user_2")],
    lastMessage: {
      id: 15,
      text: "That sounds amazing! Let's do it this weekend 🎉",
      senderId: "user_2",
      timestamp: new Date("2024-01-16T14:30:00Z"),
      read: false
    },
    unreadCount: 2
  },
  {
    id: 2,
    participants: [mockCurrentUser, mockUsers.find(u => u.id === "user_3")],
    lastMessage: {
      id: 28,
      text: "Thanks for sharing the recipe! 👨‍🍳",
      senderId: "user_1",
      timestamp: new Date("2024-01-16T10:15:00Z"),
      read: true
    },
    unreadCount: 0
  },
  {
    id: 3,
    participants: [mockCurrentUser, mockUsers.find(u => u.id === "user_4")],
    lastMessage: {
      id: 42,
      text: "See you at the gym tomorrow morning! 💪",
      senderId: "user_4",
      timestamp: new Date("2024-01-15T18:45:00Z"),
      read: false
    },
    unreadCount: 1
  },
  {
    id: 4,
    participants: [mockCurrentUser, mockUsers.find(u => u.id === "user_5")],
    lastMessage: {
      id: 67,
      text: "The design looks perfect! Great work 🎨",
      senderId: "user_1",
      timestamp: new Date("2024-01-15T16:20:00Z"),
      read: true
    },
    unreadCount: 0
  }
];

// Mock detailed messages for conversations
export const mockMessages = {
  1: [
    {
      id: 1,
      text: "Hey! How was your beach trip?",
      senderId: "user_1",
      timestamp: new Date("2024-01-16T09:00:00Z"),
      read: true
    },
    {
      id: 2,
      text: "It was absolutely incredible! 🏖️ The sunset was breathtaking",
      senderId: "user_2",
      timestamp: new Date("2024-01-16T09:15:00Z"),
      read: true
    },
    {
      id: 3,
      text: "I saw your post! The photos were stunning 📸",
      senderId: "user_1",
      timestamp: new Date("2024-01-16T09:16:00Z"),
      read: true
    },
    {
      id: 4,
      text: "Thank you! We should plan a trip together sometime",
      senderId: "user_2",
      timestamp: new Date("2024-01-16T09:20:00Z"),
      read: true
    },
    {
      id: 5,
      text: "That sounds amazing! Let's do it this weekend 🎉",
      senderId: "user_2",
      timestamp: new Date("2024-01-16T14:30:00Z"),
      read: false
    }
  ],
  2: [
    {
      id: 20,
      text: "Hey Mike! That pizza looked delicious in your post",
      senderId: "user_1",
      timestamp: new Date("2024-01-15T20:00:00Z"),
      read: true
    },
    {
      id: 21,
      text: "Thanks! It was a family recipe. Want me to share it?",
      senderId: "user_3",
      timestamp: new Date("2024-01-15T20:15:00Z"),
      read: true
    },
    {
      id: 22,
      text: "Yes please! I'd love to try making it 🍕",
      senderId: "user_1",
      timestamp: new Date("2024-01-16T08:30:00Z"),
      read: true
    },
    {
      id: 23,
      text: "I'll send you the full recipe with photos later today",
      senderId: "user_3",
      timestamp: new Date("2024-01-16T08:45:00Z"),
      read: true
    },
    {
      id: 24,
      text: "Thanks for sharing the recipe! 👨‍🍳",
      senderId: "user_1",
      timestamp: new Date("2024-01-16T10:15:00Z"),
      read: true
    }
  ],
  3: [
    {
      id: 30,
      text: "Your morning run post motivated me! 🏃‍♀️",
      senderId: "user_1",
      timestamp: new Date("2024-01-15T12:00:00Z"),
      read: true
    },
    {
      id: 31,
      text: "That's awesome! Running is so therapeutic",
      senderId: "user_4",
      timestamp: new Date("2024-01-15T12:15:00Z"),
      read: true
    },
    {
      id: 32,
      text: "I'm thinking of starting a morning routine. Any tips?",
      senderId: "user_1",
      timestamp: new Date("2024-01-15T12:30:00Z"),
      read: true
    },
    {
      id: 33,
      text: "Start slow, maybe 15-20 minutes. Consistency is key!",
      senderId: "user_4",
      timestamp: new Date("2024-01-15T12:45:00Z"),
      read: true
    },
    {
      id: 34,
      text: "See you at the gym tomorrow morning! 💪",
      senderId: "user_4",
      timestamp: new Date("2024-01-15T18:45:00Z"),
      read: false
    }
  ],
  4: [
    {
      id: 40,
      text: "Love the coffee shop vibes in your latest post! ☕",
      senderId: "user_1",
      timestamp: new Date("2024-01-15T14:00:00Z"),
      read: true
    },
    {
      id: 41,
      text: "Thank you! It's my favorite spot for creative work",
      senderId: "user_5",
      timestamp: new Date("2024-01-15T14:30:00Z"),
      read: true
    },
    {
      id: 42,
      text: "The design concepts you mentioned sound interesting",
      senderId: "user_1",
      timestamp: new Date("2024-01-15T15:00:00Z"),
      read: true
    },
    {
      id: 43,
      text: "I'm working on a mobile app interface. Want to see some previews?",
      senderId: "user_5",
      timestamp: new Date("2024-01-15T15:15:00Z"),
      read: true
    },
    {
      id: 44,
      text: "The design looks perfect! Great work 🎨",
      senderId: "user_1",
      timestamp: new Date("2024-01-15T16:20:00Z"),
      read: true
    }
  ]
};

// Helper function to get conversation by ID
export const getConversationById = (id) => {
  return mockConversations.find(conv => conv.id === parseInt(id));
};

// Helper function to get messages for a conversation
export const getMessagesByConversationId = (id) => {
  return mockMessages[parseInt(id)] || [];
};

// Helper function to get other participant in conversation
export const getOtherParticipant = (conversation, currentUserId) => {
  return conversation.participants.find(p => p.id !== currentUserId);
};

// Helper function to mark messages as read
export const markMessagesAsRead = (conversationId) => {
  const conversation = mockConversations.find(conv => conv.id === parseInt(conversationId));
  if (conversation) {
    conversation.unreadCount = 0;
    conversation.lastMessage.read = true;
  }
};

// Helper function to send a new message
export const sendMessage = (conversationId, text, senderId) => {
  const messages = mockMessages[parseInt(conversationId)] || [];
  const newMessage = {
    id: Date.now(),
    text,
    senderId,
    timestamp: new Date(),
    read: false
  };
  
  messages.push(newMessage);
  
  // Update conversation last message
  const conversation = mockConversations.find(conv => conv.id === parseInt(conversationId));
  if (conversation) {
    conversation.lastMessage = newMessage;
    if (senderId !== mockCurrentUser.id) {
      conversation.unreadCount += 1;
    }
  }
  
  return newMessage;
}; 