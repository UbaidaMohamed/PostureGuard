# Render Deployment Guide

This project consists of three separate applications that need to be deployed on Render.

## Architecture

1. **Django Backend** - Posture detection & WebSocket (port 8000)
2. **Node.js Backend** - Authentication & user management (port 5000)
3. **React Frontend** - User interface (port 8080 dev, static in production)

---

## Deployment Steps

### 1. Django Backend (Posture Detection)

**Create New Web Service:**
- **Name:** `postureguard-django`
- **Root Directory:** `DjangoBackend`
- **Environment:** `Python 3`
- **Build Command:** `bash build.sh`
- **Start Command:** `cd "gemini variant/posture_project/posture_project" && daphne -b 0.0.0.0 -p $PORT posture_project.asgi:application`

**Environment Variables:**
```
PYTHON_VERSION=3.11.9
DEBUG=False
ALLOWED_HOSTS=postureguard-django.onrender.com
CORS_ALLOWED_ORIGINS=https://postureguard-frontend.onrender.com
```

---

### 2. Node.js Backend (Authentication)

**Create New Web Service:**
- **Name:** `postureguard-auth`
- **Root Directory:** `backend`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Environment Variables:**
```
PORT=5000
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<generate-secure-random-string>
NODE_ENV=production
```

**MongoDB Setup:**
- Option A: Use MongoDB Atlas (free tier)
- Option B: Create MongoDB on Render (paid)

---

### 3. React Frontend

**Create New Static Site:**
- **Name:** `postureguard-frontend`
- **Root Directory:** `ReactApp/frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

**Environment Variables:**
```
VITE_API_URL=https://postureguard-auth.onrender.com/api
VITE_DJANGO_URL=https://postureguard-django.onrender.com
VITE_WS_URL=wss://postureguard-django.onrender.com/ws/posture/
```

---

## Post-Deployment Configuration

### Update Frontend API URLs

After deployment, update these files with your Render URLs:

**1. `ReactApp/frontend/src/lib/api.ts`:**
```typescript
baseURL: "https://postureguard-auth.onrender.com/api"
```

**2. `ReactApp/frontend/src/pages/Video.tsx`:**
```typescript
const ws = new WebSocket('wss://postureguard-django.onrender.com/ws/posture/');
```

**3. `ReactApp/frontend/src/pages/Dashboard.tsx`:**
```typescript
const response = await fetch('https://postureguard-django.onrender.com/posture/dashboard/stats');
```

### Update Django CORS Settings

In `DjangoBackend/gemini variant/posture_project/posture_project/posture_project/settings.py`:
```python
ALLOWED_HOSTS = ['postureguard-django.onrender.com']
CORS_ALLOWED_ORIGINS = [
    'https://postureguard-frontend.onrender.com',
]
```

---

## Important Notes

1. **Free Tier Limitations:**
   - Services spin down after 15 minutes of inactivity
   - First request after spin-down takes ~30-60 seconds
   - 750 hours/month free per service

2. **MongoDB:**
   - Must use MongoDB Atlas or external provider
   - Render doesn't offer free MongoDB

3. **WebSocket:**
   - Django's Daphne server handles WebSocket connections
   - Make sure to use `wss://` (secure) in production

4. **Static Files:**
   - Django static files collected during build
   - React builds to `dist` folder automatically

---

## Testing Deployment

After all services are deployed:

1. Test Auth Backend: `https://postureguard-auth.onrender.com/api/health`
2. Test Django Backend: `https://postureguard-django.onrender.com/posture/dashboard/stats`
3. Open Frontend: `https://postureguard-frontend.onrender.com`

---

## Troubleshooting

- **Django not starting:** Check Python version is 3.11.9
- **WebSocket failing:** Ensure using `wss://` not `ws://`
- **CORS errors:** Verify CORS_ALLOWED_ORIGINS includes frontend URL
- **Auth failing:** Check MongoDB connection string and JWT_SECRET

---

## Alternative: Single Dockerfile (Advanced)

If you prefer Docker deployment, you can create a multi-service Docker setup, but this requires Render's paid plan for custom Dockerfiles.
