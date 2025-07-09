# MindfulCheck - Mental Health Check-in Application

A beautiful, responsive web application for daily mental health check-ins with secure user authentication, data encryption, and comprehensive analytics dashboard.

## 🚀 Features

- **Daily Check-ins**: Interactive mood and stress level tracking with visual feedback
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Data Encryption**: AES-256 encryption for sensitive user data (feelings/notes)
- **Beautiful Dashboard**: Comprehensive analytics with mood trends and statistics
- **Responsive Design**: Mobile-first design that works seamlessly across all devices
- **Privacy-First**: All sensitive data is encrypted and secured
- **Real-time Analytics**: Track streaks, averages, and mood patterns
- **Production Ready**: Complete full-stack application with MongoDB backend

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for beautiful, responsive styling
- **Lucide React** for consistent iconography
- **Vite** for fast development and optimized builds

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for secure authentication
- **bcrypt** for password hashing
- **AES-256** encryption for sensitive data
- **Rate limiting** and comprehensive security middleware
- **Performance monitoring** and caching

## 📋 Key Features Implemented

✅ **Authentication System**
- User registration and login
- JWT token-based authentication
- Secure password hashing with bcrypt
- Account lockout protection after failed attempts

✅ **Daily Check-ins**
- Interactive mood rating slider (1-10)
- Stress level tracking with visual indicators
- Optional feelings notes with character limit
- One check-in per day validation
- Real-time visual feedback

✅ **Dashboard Analytics**
- Total check-ins counter
- Average mood and stress calculations
- Current streak tracking
- Recent check-ins history
- Mood trend visualization (last 7 days)
- Beautiful bar chart representation

✅ **Data Security**
- AES-256 encryption for feelings notes
- JWT token expiration (7 days)
- Rate limiting on all endpoints
- Input validation and sanitization
- CORS protection

✅ **User Experience**
- Mobile-responsive navigation
- Loading states and error handling
- Smooth animations and transitions
- Intuitive mood/stress indicators
- Clean, modern interface design

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd mindful-check
   npm install
   cd server && npm install && cd ..
   ```

2. **Set up environment variables:**

   **Frontend (.env):**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

   **Backend (server/.env):**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mental-health-app
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   ENCRYPTION_KEY=your-32-character-encryption-key-here
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

3. **Start the application:**
   ```bash
   # Start backend (in one terminal)
   cd server && npm run dev
   
   # Start frontend (in another terminal)
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

## 🏗 Application Architecture

```
mindful-check/
├── src/                          # Frontend React application
│   ├── components/               # React components
│   │   ├── Login.tsx            # Authentication component
│   │   ├── Dashboard.tsx        # Analytics dashboard
│   │   └── CheckinForm.tsx      # Daily check-in form
│   ├── lib/                     # API client and utilities
│   │   └── api.ts               # Backend API client
│   └── App.tsx                  # Main application with navigation
├── server/                       # Backend Node.js application
│   ├── models/                  # MongoDB models
│   │   ├── User.js              # User model with auth
│   │   ├── CheckIn.js           # Check-in model with encryption
│   │   └── Analytics.js         # Analytics aggregation model
│   ├── routes/                  # API routes
│   │   ├── auth.js              # Authentication endpoints
│   │   ├── checkins.js          # Check-in CRUD operations
│   │   └── admin.js             # Admin analytics endpoints
│   ├── middleware/              # Express middleware
│   │   ├── auth.js              # JWT authentication
│   │   ├── validation.js        # Input validation
│   │   ├── rateLimiting.js      # Rate limiting
│   │   └── cache.js             # Response caching
│   ├── utils/                   # Utility functions
│   │   ├── encryption.js        # AES-256 encryption
│   │   └── monitoring.js        # Performance monitoring
│   ├── config/                  # Configuration
│   │   └── database.js          # MongoDB connection
│   └── server.js                # Express server setup
└── README.md                    # This file
```

## 🔐 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure, stateless authentication with 7-day expiration
- **Password Security**: bcrypt hashing with salt rounds
- **Account Protection**: Automatic lockout after 5 failed login attempts
- **Token Validation**: Middleware validates tokens on protected routes

### Data Protection
- **Encryption at Rest**: AES-256 encryption for sensitive feelings notes
- **Input Validation**: Comprehensive validation on all user inputs
- **Rate Limiting**: API rate limiting to prevent abuse and attacks
- **CORS Protection**: Proper cross-origin resource sharing configuration

### Database Security
- **User Isolation**: Users can only access their own data
- **Injection Protection**: Mongoose ODM prevents injection attacks
- **Connection Security**: Secure MongoDB connection with proper indexing

## 📊 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "id": "...", "email": "user@example.com" },
    "token": "jwt_token_here"
  }
}
```

#### POST /api/auth/login
Authenticate existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### Check-in Endpoints

#### POST /api/checkins
Create daily check-in (one per day).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "moodRating": 8,
  "stressLevel": 3,
  "feelingsNotes": "Feeling great today!"
}
```

#### GET /api/checkins
Get user's check-ins with pagination.

**Query Parameters:**
- `limit`: Number of results (default: 30)
- `page`: Page number (default: 1)

#### GET /api/checkins/stats
Get user statistics and analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCheckins": 15,
    "averageMood": 7.2,
    "averageStress": 4.1,
    "streak": 5,
    "moodTrend": [...]
  }
}
```

## 🎨 UI/UX Features

### Design System
- **Color Palette**: Blue-based theme with semantic colors for mood states
- **Typography**: Clean, readable fonts with proper hierarchy
- **Spacing**: Consistent 8px grid system
- **Icons**: Lucide React icons for consistency

### Interactive Elements
- **Mood Slider**: Visual feedback with emoji indicators
- **Stress Meter**: Color-coded stress level visualization
- **Responsive Charts**: Beautiful mood trend visualization
- **Loading States**: Smooth loading animations throughout
- **Error Handling**: User-friendly error messages

### Mobile Experience
- **Mobile Navigation**: Collapsible hamburger menu
- **Touch Optimized**: Large touch targets for mobile devices
- **Responsive Layout**: Adapts beautifully to all screen sizes
- **Performance**: Optimized for mobile performance

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)

1. **Build and deploy:**
   ```bash
   npm run build
   # Deploy dist/ folder to your hosting provider
   ```

2. **Environment Variables:**
   - `VITE_API_URL`: Your backend API URL

### Backend Deployment (Railway/Render/Heroku)

1. **Environment Variables:**
   ```env
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_production_jwt_secret
   ENCRYPTION_KEY=your_production_encryption_key
   CORS_ORIGIN=your_frontend_domain
   ```

2. **MongoDB Atlas Setup:**
   - Create cluster at https://cloud.mongodb.com
   - Create database user and whitelist IP addresses
   - Get connection string and update MONGODB_URI

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration with email validation
- [ ] User login with correct/incorrect credentials
- [ ] Daily check-in creation with mood/stress sliders
- [ ] One check-in per day validation
- [ ] Dashboard statistics calculation
- [ ] Mood trend visualization
- [ ] Mobile responsive design
- [ ] Data persistence across sessions
- [ ] Logout functionality
- [ ] Error handling for network issues

### API Testing

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create check-in
curl -X POST http://localhost:5000/api/checkins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"moodRating":8,"stressLevel":3,"feelingsNotes":"Great day!"}'
```

## 🔧 Development

### Available Scripts

```bash
# Frontend development
npm run dev              # Start Vite dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Backend development
cd server
npm run dev             # Start server with auto-reload
npm start               # Start production server

# Full-stack development
npm run dev:full        # Start both frontend and backend
```

### Code Structure

- **Components**: Reusable React components with TypeScript
- **API Client**: Centralized API communication in `/src/lib/api.ts`
- **Models**: MongoDB models with proper validation and indexing
- **Middleware**: Express middleware for auth, validation, and security
- **Utils**: Utility functions for encryption and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please create an issue in the repository or contact the development team.

## 🔮 Future Enhancements

- [ ] Email notifications for missed check-ins
- [ ] Advanced analytics with machine learning insights
- [ ] Data export functionality (CSV/PDF)
- [ ] Integration with wearable devices
- [ ] Therapist/counselor sharing features
- [ ] Social features for support groups
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Progressive Web App (PWA) features
- [ ] Voice notes for feelings