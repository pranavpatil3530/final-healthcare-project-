# Mental Health Check-in Application

A beautiful, responsive web application for daily mental health check-ins with secure user authentication, data encryption, and comprehensive analytics.

## 🚀 Features

- **Daily Check-ins**: Track mood, stress levels, and personal reflections with interactive sliders
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Data Encryption**: AES-256 encryption for sensitive user data (feelings/notes)
- **Data Visualization**: Beautiful mood trends and personal statistics dashboard
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Privacy-First**: All data is encrypted and secured with proper authentication
- **RESTful API**: Complete Node.js/Express backend with MongoDB integration

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **AES-256** encryption for sensitive data
- **Rate limiting** and security middleware

## 📋 Requirements Met

✅ **Front-end Development**
- Responsive React interface with TypeScript
- Mood rating slider (1-10), stress level slider, and feelings notes
- Mobile-first responsive design

✅ **Back-end Development**
- RESTful API with Node.js and Express
- JWT-based authentication system
- MongoDB database with proper indexing

✅ **Data Security**
- AES-256 encryption for sensitive user data
- bcrypt password hashing
- JWT token-based authentication
- Rate limiting and CORS protection

✅ **Deployment Ready**
- Frontend ready for Netlify/Vercel
- Backend ready for Railway/Render/Heroku
- MongoDB Atlas configuration included

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd mental-health-checkin
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set up environment variables:**

   **Frontend (.env):**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

   **Backend (server/.env):**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mental-health-app
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   ENCRYPTION_KEY=your-32-character-encryption-key
   NODE_ENV=development
   ```

5. **Start MongoDB:**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (update MONGODB_URI in server/.env)
   ```

6. **Start the backend server:**
   ```bash
   cd server
   npm run dev
   ```

7. **Start the frontend development server:**
   ```bash
   # In a new terminal, from the root directory
   npm run dev
   ```

8. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

## 🏗 Application Architecture

```
mental-health-checkin/
├── src/                          # Frontend React application
│   ├── components/               # React components
│   │   ├── Login.tsx            # Authentication component
│   │   ├── Dashboard.tsx        # Main dashboard with analytics
│   │   └── CheckinForm.tsx      # Daily check-in form
│   ├── lib/                     # Utilities and API client
│   │   └── api.ts               # API client for backend communication
│   └── App.tsx                  # Main application component
├── server/                       # Backend Node.js application
│   ├── models/                  # MongoDB models
│   │   ├── User.js              # User model with authentication
│   │   └── CheckIn.js           # Check-in model with encryption
│   ├── routes/                  # API routes
│   │   ├── auth.js              # Authentication endpoints
│   │   └── checkins.js          # Check-in CRUD endpoints
│   ├── middleware/              # Express middleware
│   │   ├── auth.js              # JWT authentication middleware
│   │   └── validation.js        # Input validation middleware
│   ├── utils/                   # Utility functions
│   │   └── encryption.js        # AES-256 encryption utilities
│   ├── config/                  # Configuration
│   │   └── database.js          # MongoDB connection setup
│   └── server.js                # Express server setup
└── README.md                    # This file
```

## 🔐 Security Features

### Authentication
- **JWT Tokens**: Secure, stateless authentication
- **bcrypt Hashing**: Industry-standard password hashing with salt rounds
- **Token Expiration**: 7-day token expiration for security

### Data Protection
- **AES-256 Encryption**: Sensitive user data (feelings/notes) encrypted at rest
- **Input Validation**: Comprehensive validation on all user inputs
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Proper CORS configuration for cross-origin requests

### Database Security
- **MongoDB Indexing**: Optimized queries with proper indexing
- **User Isolation**: Users can only access their own data
- **Input Sanitization**: Protection against injection attacks

## 📊 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com"
  }
}
```

#### POST /api/auth/login
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com"
  }
}
```

### Check-in Endpoints

#### GET /api/checkins
Get all check-ins for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "_id": "checkin_id",
    "moodRating": 8,
    "stressLevel": 3,
    "feelingsNotes": "Feeling great today!",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

#### POST /api/checkins
Create a new check-in entry.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "moodRating": 8,
  "stressLevel": 3,
  "feelingsNotes": "Had a productive day at work"
}
```

**Response:**
```json
{
  "_id": "checkin_id",
  "moodRating": 8,
  "stressLevel": 3,
  "feelingsNotes": "Had a productive day at work",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variable: `VITE_API_URL=https://your-backend-url.com/api`

3. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

### Backend Deployment (Railway/Render/Heroku)

1. **Railway Deployment:**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Render Deployment:**
   - Connect your GitHub repository to Render
   - Create a new Web Service
   - Set build command: `cd server && npm install`
   - Set start command: `cd server && npm start`
   - Add environment variables

3. **Heroku Deployment:**
   ```bash
   # Install Heroku CLI and login
   heroku create your-app-name
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_atlas_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set ENCRYPTION_KEY=your_encryption_key
   
   # Deploy
   git subtree push --prefix server heroku main
   ```

### Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account:**
   - Sign up at https://www.mongodb.com/atlas
   - Create a new cluster
   - Create a database user
   - Whitelist your IP addresses

2. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

3. **Update Environment Variables:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mental-health-app?retryWrites=true&w=majority
   ```

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration with email/password
- [ ] User login with valid credentials
- [ ] User login with invalid credentials (should fail)
- [ ] Create daily check-in with mood, stress, and notes
- [ ] View dashboard with statistics and trends
- [ ] Responsive design on mobile devices
- [ ] Data persistence across browser sessions
- [ ] Logout functionality

### API Testing with curl

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create check-in (replace TOKEN with actual JWT)
curl -X POST http://localhost:5000/api/checkins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"moodRating":8,"stressLevel":3,"feelingsNotes":"Great day!"}'

# Get check-ins
curl -X GET http://localhost:5000/api/checkins \
  -H "Authorization: Bearer TOKEN"
```

## 🔧 Development Challenges & Solutions

### Challenge 1: Data Encryption
**Problem**: Ensuring sensitive user data (feelings/notes) is encrypted at rest.
**Solution**: Implemented AES-256 encryption with unique initialization vectors for each entry.

### Challenge 2: Authentication Security
**Problem**: Secure user authentication without exposing sensitive data.
**Solution**: JWT tokens with bcrypt password hashing and proper token expiration.

### Challenge 3: Responsive Design
**Problem**: Creating a beautiful interface that works on all device sizes.
**Solution**: Mobile-first design approach with Tailwind CSS and careful component structuring.

### Challenge 4: Data Visualization
**Problem**: Displaying mood trends in an intuitive way.
**Solution**: Custom bar chart component with hover states and responsive design.

### Challenge 5: API Rate Limiting
**Problem**: Preventing API abuse and ensuring fair usage.
**Solution**: Implemented express-rate-limit middleware with appropriate limits.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

## 🔮 Future Enhancements

- [ ] Email notifications for missed check-ins
- [ ] Advanced analytics and insights
- [ ] Export data functionality
- [ ] Integration with wearable devices
- [ ] Therapist/counselor sharing features
- [ ] Mood prediction using machine learning
- [ ] Social features for support groups