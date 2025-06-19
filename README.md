# Social Media App - Frontend Only

This is a **frontend-only** social media application built with **Next.js 14** and **Ant Design**. The application uses **mock data** instead of a real backend to demonstrate all UI functionality.

## 🚀 Features

- **Posts Management**: Create, view, like, and comment on posts
- **User Profiles**: View user profiles with banners and follower counts
- **Trending Topics**: Display popular hashtags and trends
- **Follow System**: Follow/unfollow users with mock data
- **File Upload Simulation**: Mock file upload functionality
- **Responsive Design**: Mobile-friendly UI with Ant Design
- **Infinite Scroll**: Paginated posts with smooth loading

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI Library**: Ant Design (AntD)
- **State Management**: TanStack React Query
- **Styling**: CSS Modules + Ant Design
- **Icons**: Iconify React
- **Date Handling**: Day.js
- **Notifications**: React Hot Toast

## 📊 Mock Data

The application uses comprehensive mock data that includes:

- **Users**: Pre-defined user profiles with avatars and banners
- **Posts**: Sample posts with images, likes, and comments
- **Trends**: Popular hashtags with post counts
- **Follows**: Mock follower/following relationships
- **Comments**: Nested comments with user data

## 🎯 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SocialMediaNextApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── app/                    # Next.js App Router
├── components/            # Reusable UI components
├── sections/              # Page-specific sections
├── actions/               # Mock server actions
├── mock/                  # Mock data definitions
├── lib/                   # Utilities and configurations
├── styles/                # CSS modules and global styles
├── context/               # React contexts
├── hooks/                 # Custom React hooks
└── utils/                 # Utility functions
```

## 🎨 UI Components

- **Post Components**: Post creation, display, and interactions
- **User Components**: Profile cards, follow buttons, suggestions
- **Navigation**: Sidebar with routing and user menu
- **Trends**: Popular hashtags display
- **Responsive Layout**: Mobile-friendly design

## 🔧 Mock Authentication

The app includes a mock authentication system that simulates a logged-in user without requiring actual authentication. The current user is pre-defined in the mock data.

## 🎭 Mock Functionality

All backend functionality has been replaced with mock implementations:

- **Create Posts**: Simulates post creation with file upload
- **Like/Unlike**: Toggle likes with optimistic updates
- **Comments**: Add comments with mock user data
- **Follow/Unfollow**: Manage follow relationships
- **Trends**: Display popular hashtags
- **File Upload**: Simulate image/video uploads

## 📱 Features Demonstrated

1. **Dynamic Content**: All content updates dynamically using mock data
2. **User Interactions**: Like, comment, follow functionality
3. **Real-time Updates**: Optimistic updates with React Query
4. **File Upload**: Mock file upload with progress simulation
5. **Pagination**: Infinite scroll with mock pagination
6. **Responsive Design**: Works on all device sizes

## 🚀 Deployment

Since this is a frontend-only application, it can be deployed to any static hosting service:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **GitHub Pages**
- **AWS S3 + CloudFront**

## 📝 Notes

- All data is temporary and resets on page refresh
- No database or backend services required
- Perfect for UI/UX demonstrations and frontend development
- Can be easily converted back to use real backend services

## 🔄 Converting to Real Backend

To convert this back to use a real backend:

1. Replace mock actions with real API calls
2. Set up authentication (Clerk, Auth0, etc.)
3. Configure database (PostgreSQL, MongoDB, etc.)
4. Set up file storage (Cloudinary, AWS S3, etc.)
5. Update environment variables

## 🤝 Contributing

Feel free to contribute to this project by:

1. Adding new mock data scenarios
2. Improving UI components
3. Adding new features
4. Enhancing responsive design
5. Optimizing performance

---

**Note**: This is a demo application with mock data. All user interactions and data are simulated for demonstration purposes.
