# 🧘 Posture Detection

A comprehensive full-stack application that monitors your sitting posture in real-time using AI-powered pose detection. Features a Django backend with WebSocket support and a modern React frontend with dashboard analytics.

![Python](https://img.shields.io/badge/Python-3.11-blue.svg)
![Django](https://img.shields.io/badge/Django-5.2+-green.svg)
![React](https://img.shields.io/badge/React-18+-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6.svg)

## ✨ Features

### Real-Time Monitoring

- 🎥 **Live Video Feed**: WebSocket-based streaming at ~30 FPS
- 🤖 **AI Pose Detection**: Google MediaPipe for accurate body landmark tracking
- 📐 **Posture Analysis**: Real-time hip angle calculation (good posture: >90°)
- 🎨 **Visual Feedback**: Skeleton overlay with posture metrics on video

### Dashboard & Analytics

- 📊 **Interactive Charts**: Today, weekly, and monthly posture trends
- 📈 **Statistics**: Current angle, weekly average, progress tracking
- 📝 **Activity Log**: Recent posture sessions with timestamps
- 🎯 **Multiple Views**: Area, bar, and line charts for different timeframes

### User Experience

- 🔔 **Visual Alerts**: Real-time posture warnings
- 🔊 **Audio Notifications**: Optional sound alerts for bad posture
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Built with shadcn/ui and Tailwind CSS

### Data Management

- 💾 **Persistent Storage**: SQLite database for posture logs
- 📊 **Automatic Logging**: Saves posture data every 30 seconds
- 🔄 **Change Tracking**: Records when posture status changes
- 🗄️ **Historical Data**: Query by day, week, or month

## 🏗️ Architecture

```
┌─────────────────┐         HTTP/WS           ┌──────────────────┐
│   React Frontend│ ←──────────────────────→  │  Django Backend  │
│   (Port 8081)   │   localhost:8000          │   (Port 8000)    │
│                 │                            │                  │
│  - Dashboard    │   WebSocket: Video        │  - WebSocket     │
│  - Video Page   │   REST API: Stats         │  - REST API      │
│  - Charts       │                            │  - MediaPipe     │
└─────────────────┘                            └────────┬─────────┘
                                                        │
                                                 ┌──────▼──────┐
                                                 │  Database   │
                                                 │  (SQLite)   │
                                                 └─────────────┘
```

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## 🔧 Prerequisites

### Required Software

- **Python 3.11** (MediaPipe compatibility requirement)
- **Node.js 18+** and npm
- **Git**
- **Webcam** (built-in or external)

### Platform-Specific Requirements

**Windows:**

- Ensure Python 3.11 is in PATH
- Git Bash or PowerShell

**macOS/Linux:**

- Standard terminal
- May need additional permissions for camera access

## 📥 Installation

### 1. Clone the Repository

```bash
cd "d:/Download/AIT/Capstone Project/Posture"
# Or navigate to your preferred directory
```

### 2. Set Up Python Environment

```bash
# Create Python 3.11 virtual environment
python -m venv venv311

# Activate virtual environment
# Windows:
venv311\Scripts\activate
# macOS/Linux:
source venv311/bin/activate
```

### 3. Install Backend Dependencies

```bash
cd "DjangoBackend/gemini variant/posture_project/posture_project"

# Install required packages
pip install django channels daphne opencv-python mediapipe numpy django-cors-headers
```

**Key Dependencies:**

- `django==5.2+` - Web framework
- `channels==4.3.2` - WebSocket support
- `daphne==4.2.1` - ASGI server
- `mediapipe==0.10.14` - Pose detection
- `opencv-python==4.12.0` - Video processing
- `django-cors-headers==4.9.0` - CORS handling

### 4. Set Up Database

```bash
# Run migrations
python manage.py migrate
```

### 5. Install Frontend Dependencies

```bash
cd ../../../../ReactApp/frontend

# Install npm packages
npm install
```

### 6. (Optional) Create Sample Data

```bash
# Navigate to Django project
cd "../../DjangoBackend/gemini variant/posture_project/posture_project"

# Run sample data script
python create_sample_data.py
```

This creates test posture data for demonstrating the dashboard.

## 🚀 Running the Application

### Start Django Backend

**Terminal 1:**

```bash
cd "d:/Download/AIT/Capstone Project/Posture/DjangoBackend/gemini variant/posture_project/posture_project"

# Activate Python 3.11 environment
../../../../../venv311/Scripts/activate  # Windows
# source ../../../../../venv311/bin/activate  # macOS/Linux

# Start Daphne ASGI server
python -m daphne -b 0.0.0.0 -p 8000 posture_project.asgi:application
```

**Expected Output:**

```
2025-12-04 02:16:43,217 INFO     Starting server at tcp:port=8000:interface=0.0.0.0
2025-12-04 02:16:43,219 INFO     Listening on TCP address 0.0.0.0:8000
```

> ⚠️ **Important**: Do NOT use `python manage.py runserver` - it doesn't support WebSockets!

### Start React Frontend

**Terminal 2:**

```bash
cd "d:/Download/AIT/Capstone Project/Posture/ReactApp/frontend"

# Start development server
npm run dev
```

**Expected Output:**

```
  VITE v5.4.19  ready in 1268 ms

  ➜  Local:   http://localhost:8081/
  ➜  Network: http://192.168.x.x:8081/
```

### Access the Application

Open your browser to: **http://localhost:8081**

**Available Pages:**

- `/` - Dashboard with charts and statistics
- `/video` - Live posture monitoring
- `/login` - Authentication (not yet connected to Django)
- `/register` - User registration (not yet connected to Django)

## 📁 Project Structure

```
Posture/
├── README.md                          # This file
├── venv311/                           # Python 3.11 virtual environment
│
├── DjangoBackend/
│   ├── README.md                      # Backend-specific documentation
│   └── gemini variant/
│       └── posture_project/
│           └── posture_project/
│               ├── manage.py          # Django management script
│               ├── db.sqlite3         # SQLite database
│               ├── create_sample_data.py  # Test data generator
│               │
│               ├── posture_project/   # Django project settings
│               │   ├── settings.py    # Configuration (CORS, Channels, etc.)
│               │   ├── urls.py        # URL routing
│               │   └── asgi.py        # ASGI config for WebSockets
│               │
│               └── posture_stream/    # Main application
│                   ├── models.py      # PostureLog model
│                   ├── views.py       # REST API endpoints
│                   ├── consumers.py   # WebSocket consumer
│                   ├── routing.py     # WebSocket URL routing
│                   └── migrations/    # Database migrations
│
└── ReactApp/
    └── frontend/
        ├── package.json               # Node dependencies
        ├── vite.config.ts             # Vite configuration
        ├── tailwind.config.ts         # Tailwind CSS config
        │
        ├── public/                    # Static assets
        │   ├── robots.txt
        │   └── _redirects             # Netlify redirects
        │
        └── src/
            ├── main.tsx               # React entry point
            ├── App.tsx                # Main app component
            │
            ├── pages/                 # Route pages
            │   ├── Dashboard.tsx      # Analytics dashboard
            │   ├── Video.tsx          # Live monitoring
            │   ├── Login.tsx          # Authentication
            │   ├── Register.tsx       # User registration
            │   ├── Index.tsx          # Landing page
            │   └── NotFound.tsx       # 404 page
            │
            ├── components/            # Reusable components
            │   ├── layout/
            │   │   ├── Layout.tsx     # Main layout wrapper
            │   │   └── Navbar.tsx     # Navigation bar
            │   │
            │   └── ui/                # shadcn/ui components
            │       ├── button.tsx
            │       ├── card.tsx
            │       ├── chart.tsx
            │       └── ...            # 40+ UI components
            │
            ├── contexts/              # React contexts
            │   └── AuthContext.tsx    # Authentication context
            │
            ├── hooks/                 # Custom React hooks
            │   ├── use-toast.ts
            │   └── use-mobile.tsx
            │
            └── lib/                   # Utility libraries
                ├── api.ts             # Axios API client
                └── utils.ts           # Helper functions
```

## 📡 API Documentation

### WebSocket API

**Endpoint:** `ws://localhost:8000/ws/posture/`

**Client → Server Messages:**

```json
{
  "command": "start" | "stop"
}
```

**Server → Client Messages:**

```json
{
  "frame": "base64_encoded_jpeg_string",
  "posture": "Good Posture" | "Bad Posture",
  "angle": 95
}
```

### REST API Endpoints

**Base URL:** `http://localhost:8000`

#### Dashboard Statistics

```http
GET /posture/dashboard/stats
```

**Response:**

```json
{
  "currentScore": 95.5,
  "weeklyAverage": 92.3,
  "weeklyChange": 2.8
}
```

#### Today's Data

```http
GET /posture/dashboard/today
```

**Response:**

```json
{
  "data": [
    {
      "time": "09:00",
      "good": 1200,
      "poor": 300,
      "score": 95.5
    }
  ]
}
```

#### Weekly Data

```http
GET /posture/dashboard/week
```

**Response:**

```json
{
  "data": [
    {
      "day": "Mon",
      "score": 92.3,
      "sessions": 15
    }
  ]
}
```

#### Monthly Data

```http
GET /posture/dashboard/month
```

**Response:**

```json
{
  "data": [
    {
      "date": "12/01",
      "score": 90.5,
      "sessions": 45
    }
  ]
}
```

#### Recent Activity Logs

```http
GET /posture/logs?limit=6
```

**Response:**

```json
{
  "data": [
    {
      "_id": "123",
      "timestamp": "2025-12-04T02:16:58Z",
      "postureType": "good",
      "angle": 95.5,
      "duration": 120,
      "notes": "95.5° for 120s"
    }
  ]
}
```

## 🎯 Usage Guide

### Starting a Monitoring Session

1. **Navigate to Video Page**: Click "Video" in the navigation bar
2. **Grant Camera Permission**: Click "Start Camera" and allow browser camera access
3. **Position Yourself**: Sit in front of the camera with your full upper body visible
4. **Monitor Posture**: The system displays:
   - Live video feed with skeleton overlay
   - Current posture status (Good/Poor)
   - Hip angle measurement
   - Visual progress bar

### Understanding Posture Metrics

**Hip Angle:**

- **> 90°**: Good Posture ✅ (Green)
- **< 90°**: Poor Posture ❌ (Red)

The angle is calculated between:

1. Shoulder landmark
2. Hip landmark (vertex)
3. Knee landmark

### Viewing Analytics

1. **Navigate to Dashboard**: Click "Dashboard" in the navigation bar
2. **Select Timeframe**: Choose Today, Week, or Month view
3. **Analyze Trends**:
   - **Current Score**: Your latest posture angle
   - **Weekly Average**: Average angle over 7 days
   - **Charts**: Visual trends showing posture over time
   - **Recent Activity**: Latest monitoring sessions

### Customizing Alerts

On the Video page, you can:

- **Toggle Visual Alerts**: Enable/disable warning banners
- **Toggle Audio Notifications**: Enable/disable sound alerts
- **Audio repeats every 200ms** while posture is poor
- **Confirmation sound** plays when posture improves

## 🐛 Troubleshooting

### Backend Issues

**Issue: "Address already in use" on port 8000**

**Solution:**

```bash
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill -9
```

**Issue: "Apps aren't loaded yet" error**

**Cause:** Django app registry initialization order

**Solution:** Already fixed in `asgi.py` - ensure you're using the latest version

**Issue: MediaPipe not compatible**

**Cause:** Python version mismatch

**Solution:** Use Python 3.11 specifically (not 3.12 or 3.13)

### Frontend Issues

**Issue: Port 8080 already in use**

**Solution:** Vite automatically tries port 8081 (or next available)

**Issue: CORS errors**

**Solution:** Verify `settings.py` includes:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
]
```

**Issue: Dashboard shows "No data"**

**Solution:** Run the sample data generator:

```bash
python create_sample_data.py
```

### Camera Issues

**Issue: Camera not accessible**

**Solution:**

1. Check browser permissions (click lock icon in address bar)
2. Ensure no other app is using the camera
3. Try different camera index in `consumers.py`:
   ```python
   self.cap = cv2.VideoCapture(1)  # Try 0, 1, 2, etc.
   ```

**Issue: Video is laggy**

**Solution:** Reduce frame quality in `consumers.py`:

```python
encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 70]
_, buffer = cv2.imencode('.jpg', image, encode_param)
```

### Database Issues

**Issue: "No such table: posture_stream_posturelog"**

**Solution:** Run migrations:

```bash
python manage.py migrate
```

**Issue: Database locked**

**Solution:** Stop all Django processes and restart

## 🔧 Configuration

### Backend Configuration

**File:** `DjangoBackend/gemini variant/posture_project/posture_project/posture_project/settings.py`

**Key Settings:**

```python
# CORS - Add your frontend URLs
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:8081",
]

# Channel Layers - Using in-memory (no Redis required)
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer'
    },
}

# ASGI Application
ASGI_APPLICATION = 'posture_project.asgi.application'
```

### Frontend Configuration

**File:** `ReactApp/frontend/src/pages/Video.tsx`

**WebSocket URL:**

```typescript
const ws = new WebSocket("ws://localhost:8000/ws/posture/");
```

**File:** `ReactApp/frontend/src/pages/Dashboard.tsx`

**API Base URL:**

```typescript
const djangoBaseUrl = "http://localhost:8000";
```

## 🚀 Production Deployment

### Backend

1. **Use environment variables** for sensitive settings
2. **Configure WSGI server** (Gunicorn + Daphne)
3. **Set up reverse proxy** (Nginx)
4. **Use PostgreSQL** instead of SQLite
5. **Enable HTTPS** for secure WebSocket (WSS)
6. **Configure Redis** for Channel Layers in production

### Frontend

1. **Build production bundle:**
   ```bash
   npm run build
   ```
2. **Deploy to static hosting** (Netlify, Vercel, etc.)
3. **Update API URLs** to production backend
4. **Configure environment variables**

## 🤝 Contributing

Contributions are welcome! Areas for improvement:

- [ ] User authentication with Django
- [ ] User profiles and settings
- [ ] Multi-user support
- [ ] Mobile app version
- [ ] Additional posture metrics
- [ ] Posture correction exercises
- [ ] Email/push notifications
- [ ] Export data to CSV/PDF

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **MediaPipe** - Google's ML solutions for pose detection
- **Django Channels** - WebSocket support for Django
- **OpenCV** - Computer vision library
- **shadcn/ui** - Beautiful React component library
- **Recharts** - React charting library
- **Tailwind CSS** - Utility-first CSS framework

## 📞 Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [API Documentation](#api-documentation)
3. Consult the backend-specific README in `DjangoBackend/`

---

**Built with ❤️ for better posture and health**

**Tech Stack:** Django · Channels · MediaPipe · OpenCV · React · TypeScript · Vite · Tailwind CSS · shadcn/ui
