# Posture Detection - Node.js Backend

This is the authentication and user management backend for the Posture Detection application.

## Features

- User registration and login
- JWT authentication
- User settings management
- Posture log tracking
- Dashboard statistics API

## Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file with:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/posture-app
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

## Running

```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Posture Logs

- `GET /api/posture/logs` - Get user's posture logs
- `POST /api/posture/logs` - Create posture log
- `GET /api/posture/dashboard/stats` - Get dashboard statistics
- `GET /api/posture/dashboard/today` - Get today's data
- `GET /api/posture/dashboard/week` - Get weekly data

### Settings

- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

## Architecture

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Note

Video streaming and posture detection are handled by the Django backend at `ws://localhost:8000/ws/posture/`
