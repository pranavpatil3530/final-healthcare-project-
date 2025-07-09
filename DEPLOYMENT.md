# 🚀 Deployment Guide: Vercel + Railway

This guide will walk you through deploying your MindfulCheck application using **Vercel** for the frontend and **Railway** for the backend.

## 🎯 Why Vercel + Railway?

- **Vercel**: Best-in-class frontend hosting with automatic deployments
- **Railway**: Modern backend hosting with excellent developer experience
- **Both**: Free tiers available, easy setup, automatic HTTPS

---

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas cluster is running
- [ ] Application tested locally
- [ ] GitHub repository is ready
- [ ] Environment variables documented

---

## 🚂 Step 1: Deploy Backend to Railway

### 1.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Verify your account

### 1.2 Deploy Backend

**Option A: Using Railway Dashboard (Recommended)**

1. **Create New Project:**
   - Click "New Project" in Railway dashboard
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your repository
   - Choose the `server` folder as root directory

2. **Configure Build Settings:**
   - Railway will auto-detect Node.js
   - Build command: `npm install`
   - Start command: `npm start`

**Option B: Using Railway CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Navigate to server directory
cd server

# Initialize and deploy
railway init
railway up
```

### 1.3 Set Environment Variables in Railway

1. Go to your Railway project dashboard
2. Click on your service
3. Go to "Variables" tab
4. Add these environment variables:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://admin:Password123@cluster0.wylg8ks.mongodb.net/mental-health-app?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-super-secure-jwt-secret-key-here-make-it-long-and-random-production-version
ENCRYPTION_KEY=your-32-character-encryption-key-production
CORS_ORIGIN=https://your-app-name.vercel.app
```

**⚠️ Important Notes:**
- Use different, more secure keys for production
- The `CORS_ORIGIN` will be updated after Vercel deployment
- Railway automatically provides the `PORT` variable

### 1.4 Get Your Railway URL

After deployment, Railway provides a URL like:
```
https://your-app-name-production.up.railway.app
```

Save this URL - you'll need it for the frontend deployment.

---

## ⚡ Step 2: Deploy Frontend to Vercel

### 2.1 Prepare Frontend Environment

1. **Create production environment file:**
   ```bash
   # In your project root directory
   echo "VITE_API_URL=https://your-railway-url.up.railway.app/api" > .env.production
   ```

2. **Update package.json (if needed):**
   ```json
   {
     "scripts": {
       "build": "vite build",
       "preview": "vite preview"
     }
   }
   ```

### 2.2 Deploy to Vercel

**Option A: Vercel Dashboard (Recommended)**

1. **Create Vercel Account:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project:**
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite project

3. **Configure Build Settings:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variables:**
   - In project settings, go to "Environment Variables"
   - Add: `VITE_API_URL` = `https://your-railway-url.up.railway.app/api`

5. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy your app

**Option B: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name: mindful-check (or your preferred name)
# - Directory: ./ (current directory)
```

### 2.3 Get Your Vercel URL

After deployment, Vercel provides URLs like:
```
https://mindful-check.vercel.app
https://mindful-check-git-main-yourusername.vercel.app
```

---

## 🔄 Step 3: Update CORS Configuration

1. **Go back to Railway dashboard**
2. **Update environment variables:**
   - Change `CORS_ORIGIN` to your Vercel URL: `https://your-app-name.vercel.app`
3. **Redeploy backend** (Railway will auto-redeploy on env var changes)

---

## 🧪 Step 4: Test Your Deployment

### 4.1 Backend Health Check
```bash
curl https://your-railway-url.up.railway.app/health
```

Expected response:
```json
{
  "success": true,
  "message": "Mental Health API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production"
}
```

### 4.2 Frontend Test
1. Visit your Vercel URL
2. Try registering a new account
3. Complete a check-in
4. Verify data appears in dashboard

### 4.3 Full Integration Test
```bash
# Register user
curl -X POST https://your-railway-url.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login and get token
curl -X POST https://your-railway-url.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create check-in (replace TOKEN)
curl -X POST https://your-railway-url.up.railway.app/api/checkins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"moodRating":8,"stressLevel":3,"feelingsNotes":"Deployed successfully!"}'
```

---

## 🔧 Advanced Configuration

### Custom Domain (Optional)

**For Vercel:**
1. Go to project settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

**For Railway:**
1. Go to project settings → Domains
2. Add custom domain
3. Configure CNAME record

### Environment-Specific Configurations

**Development:**
```env
VITE_API_URL=http://localhost:5000/api
```

**Production:**
```env
VITE_API_URL=https://your-railway-url.up.railway.app/api
```

### Automatic Deployments

Both platforms support automatic deployments:

- **Vercel**: Automatically deploys on every push to main branch
- **Railway**: Automatically deploys on every push to connected branch

---

## 🚨 Troubleshooting

### Common Issues

**1. CORS Errors:**
```
Access to fetch at 'railway-url' from origin 'vercel-url' has been blocked by CORS policy
```
**Solution:** Update `CORS_ORIGIN` in Railway environment variables

**2. Environment Variables Not Loading:**
```
VITE_API_URL is undefined
```
**Solution:** Ensure environment variables are set in Vercel dashboard and start with `VITE_`

**3. Build Failures:**
```
Module not found: Can't resolve './lib/api'
```
**Solution:** Check file paths and imports are correct

**4. Database Connection Issues:**
```
MongoServerError: Authentication failed
```
**Solution:** Verify MongoDB Atlas connection string and IP whitelist

### Debug Commands

```bash
# Check Railway logs
railway logs

# Check Vercel deployment logs
vercel logs

# Test API endpoints
curl -v https://your-railway-url.up.railway.app/health
```

---

## 📊 Monitoring & Analytics

### Railway Monitoring
- Built-in metrics dashboard
- Resource usage monitoring
- Deployment history

### Vercel Analytics
- Core Web Vitals
- Page performance metrics
- Deployment analytics

---

## 💰 Cost Considerations

### Railway Free Tier
- $5 credit per month
- Suitable for development and small projects
- Automatic scaling

### Vercel Free Tier
- 100GB bandwidth per month
- Unlimited personal projects
- Automatic HTTPS

### MongoDB Atlas Free Tier
- 512MB storage
- Shared clusters
- Perfect for development

---

## 🔐 Security Best Practices

### Production Environment Variables

Generate secure keys for production:

```bash
# Generate JWT secret (32+ characters)
openssl rand -base64 32

# Generate encryption key (exactly 32 characters)
openssl rand -base64 24
```

### MongoDB Security
- Enable IP whitelisting
- Use strong passwords
- Enable database authentication
- Regular security updates

---

## 🚀 Deployment Checklist

- [ ] Backend deployed to Railway
- [ ] Environment variables configured
- [ ] Frontend deployed to Vercel
- [ ] CORS configured correctly
- [ ] Database connection working
- [ ] Authentication flow tested
- [ ] Check-in functionality verified
- [ ] Dashboard displaying data
- [ ] Mobile responsiveness confirmed
- [ ] Error handling working
- [ ] Performance optimized

---

## 📞 Support

If you encounter issues:

1. Check Railway and Vercel documentation
2. Review application logs
3. Test API endpoints individually
4. Verify environment variables
5. Check MongoDB Atlas connectivity

---

## 🎉 Success!

Your MindfulCheck application is now live:

- **Frontend**: https://your-app-name.vercel.app
- **Backend**: https://your-app-name.up.railway.app
- **Database**: MongoDB Atlas cluster

Share your deployed application and start helping users track their mental health journey!