# Backend Migration Guide

This guide explains how the frontend has been updated to use the new backend API.

## 🔄 What Changed

### Before (Next.js API Routes)
- Frontend called `/api/pexels`, `/api/openai/...`, etc.
- API keys exposed in frontend environment
- All logic in Next.js API routes

### After (Separate Backend)
- Frontend calls `http://localhost:4000/api/v1/...`
- API keys only in backend
- All logic in Express.js backend

## 📝 Updated Files

### 1. `lib/api/client.ts` (NEW)
- API client for all backend calls
- Centralized error handling
- Type-safe methods

### 2. `components/editor/AssetTabs.tsx`
- Updated to use `apiClient.getImages()`, `apiClient.getVideos()`, `apiClient.getAudio()`

### 3. `components/editor/GenerateScriptModal.tsx`
- Updated to use `apiClient.generateScript()`
- Updated to use `apiClient.generateTTS()`

### 4. `store/editorStore.ts`
- Will be updated to sync with backend
- Currently still uses local Zustand store
- Future: Load from backend on mount, save to backend on changes

## 🚀 Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev
```

### 2. Frontend Setup
```bash
# In root directory
# Add to .env.local:
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### 3. Start Both Servers
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev
```

## 🔌 API Endpoints Used

### Media
- `GET /api/v1/media/images?query=...&page=1&per_page=20`
- `GET /api/v1/media/videos?query=...&page=1&per_page=20`
- `GET /api/v1/media/audio?query=...&page=1&page_size=20`

### AI
- `POST /api/v1/ai/generate-script`
- `POST /api/v1/tts/generate`

## ⚠️ Breaking Changes

1. **Environment Variables:**
   - Frontend now needs `NEXT_PUBLIC_API_URL`
   - Backend needs all API keys in `.env`

2. **API Response Format:**
   - Backend returns `{ success: true, data: ... }`
   - Frontend extracts `data` property

3. **Error Handling:**
   - Backend errors are caught and thrown as Error objects
   - Frontend needs try/catch blocks

## 🔄 Migration Status

- ✅ Backend API created
- ✅ API client created
- ✅ AssetTabs updated (images, videos, audio)
- ✅ GenerateScriptModal updated
- ⏳ editorStore.ts (still using local state, needs backend sync)
- ⏳ Scene management (needs backend integration)

## 📋 Next Steps

1. **Update editorStore.ts:**
   - Load projects from backend on mount
   - Save changes to backend
   - Sync state with backend

2. **Add Authentication:**
   - User login/register
   - JWT tokens
   - Protected routes

3. **Add Real-time Sync:**
   - WebSocket for collaborative editing
   - Optimistic updates

## 🐛 Troubleshooting

### CORS Errors
- Check `ALLOWED_ORIGINS` in backend `.env`
- Add frontend URL to allowed origins

### Connection Refused
- Make sure backend is running on port 4000
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`

### API Key Errors
- Verify API keys in backend `.env`
- Check backend logs for errors

