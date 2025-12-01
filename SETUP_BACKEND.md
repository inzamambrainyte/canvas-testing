# Backend Setup Instructions

## 🚀 Quick Start

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and add your API keys:

```env
MONGODB_URI=mongodb://localhost:27017/canvas_editor_db
OPENAI_API_KEY=sk-your-key-here
ELEVENLABS_API_KEY=your-key-here
PEXELS_API_KEY=your-key-here
FREESOUND_API_KEY=your-key-here
```

### 3. Setup MongoDB

**Option A: Local MongoDB**

- Install MongoDB Community Edition
- Start MongoDB service
- Default connection: `mongodb://localhost:27017/canvas_editor_db`

**Option B: MongoDB Atlas (Cloud)**

- Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create a free cluster
- Get connection string
- Update `MONGODB_URI` in `.env`

### 4. Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:4000`

### 5. Setup Frontend Environment

Create/update `.env.local` in root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### 6. Start Frontend

```bash
# In root directory
npm run dev
```

Frontend will run on `http://localhost:3000`

## ✅ Verify Setup

1. **Check Backend Health:**

   - Visit: `http://localhost:4000/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Check API:**

   - Visit: `http://localhost:4000/api/v1/projects`
   - Should return: `{"success":true,"data":[]}`

3. **Test Frontend:**
   - Open: `http://localhost:3000`
   - Try generating a script
   - Try searching for images/videos

## 🐛 Troubleshooting

### MongoDB Connection Error

```
❌ MongoDB connection error: ...
```

**Solution:**

- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env`
- For Atlas: Check IP whitelist

### CORS Error

```
Access to fetch at 'http://localhost:4000' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**

- Add `http://localhost:3000` to `ALLOWED_ORIGINS` in backend `.env`

### API Key Errors

```
Error: OpenAI API key is not configured
```

**Solution:**

- Verify all API keys are in `backend/.env`
- Restart backend server after adding keys

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::4000
```

**Solution:**

- Change `PORT` in backend `.env`
- Or kill process using port 4000

## 📝 Next Steps

1. **Test API Endpoints:**

   - Use Postman or Thunder Client
   - Test all endpoints

2. **Update Frontend Store:**

   - Currently using local Zustand store
   - Future: Sync with backend

3. **Add Authentication:**
   - User registration/login
   - JWT tokens
   - Protected routes

## 🔗 Useful Links

- Backend API: `http://localhost:4000/api/v1`
- Backend Health: `http://localhost:4000/health`
- Frontend: `http://localhost:3000`
