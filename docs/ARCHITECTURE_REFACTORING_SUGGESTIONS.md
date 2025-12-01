# Architecture Refactoring Suggestions
## Frontend/Backend Separation for Multi-Platform Support

## 🎯 Overview

Refactor the current Next.js monolith into:
- **Frontend**: Next.js (Web) + Flutter (Mobile) - UI only
- **Backend**: Separate API server - All business logic & third-party integrations

---

## 📐 Recommended Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   Next.js Web   │         │  Flutter Mobile │
│    (Frontend)   │         │    (Frontend)   │
└────────┬────────┘         └────────┬────────┘
         │                            │
         │  HTTP/REST API            │
         │  (or GraphQL)              │
         └────────────┬───────────────┘
                      │
         ┌────────────▼────────────┐
         │   Backend API Server    │
         │  (Node.js/Express/Fastify)│
         └────────────┬────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
┌───▼───┐      ┌──────▼──────┐   ┌──────▼──────┐
│OpenAI │      │  ElevenLabs │   │   Pexels    │
└───────┘      └─────────────┘   └─────────────┘
```

---

## 🛠️ Technology Stack Recommendations

### Option 1: Node.js/Express (Recommended for Quick Start)
**Pros:**
- ✅ Easy migration from Next.js API routes
- ✅ Large ecosystem
- ✅ TypeScript support
- ✅ Fast development

**Tech Stack:**
- **Runtime**: Node.js 18+
- **Framework**: Express.js or Fastify
- **Language**: TypeScript
- **Database**: PostgreSQL (for user data, projects, scenes)
- **ORM**: Prisma or TypeORM
- **Validation**: Zod or Joi
- **Authentication**: JWT or Passport.js
- **Caching**: Redis (optional, for API rate limiting)

### Option 2: NestJS (Recommended for Enterprise)
**Pros:**
- ✅ Built-in TypeScript
- ✅ Modular architecture
- ✅ Dependency injection
- ✅ Built-in validation, guards, interceptors
- ✅ Excellent for large teams

**Tech Stack:**
- **Framework**: NestJS
- **Database**: PostgreSQL + Prisma
- **Validation**: class-validator
- **Authentication**: @nestjs/passport

### Option 3: Python/FastAPI (Alternative)
**Pros:**
- ✅ Great for AI/ML integrations
- ✅ Fast performance
- ✅ Auto-generated API docs
- ✅ Type hints

**Tech Stack:**
- **Framework**: FastAPI
- **Database**: PostgreSQL + SQLAlchemy
- **Validation**: Pydantic

---

## 📁 Recommended Project Structure

### Backend Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── env.ts
│   │   └── constants.ts
│   ├── controllers/
│   │   ├── scenes.controller.ts
│   │   ├── media.controller.ts
│   │   ├── tts.controller.ts
│   │   └── projects.controller.ts
│   ├── services/
│   │   ├── openai.service.ts
│   │   ├── elevenlabs.service.ts
│   │   ├── pexels.service.ts
│   │   ├── freesound.service.ts
│   │   └── project.service.ts
│   ├── models/
│   │   ├── project.model.ts
│   │   ├── scene.model.ts
│   │   └── element.model.ts
│   ├── routes/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── projects.ts
│   │   │   │   ├── scenes.ts
│   │   │   │   ├── media.ts
│   │   │   │   └── tts.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── errors.ts
│   └── app.ts (or main.ts)
├── .env
├── package.json
└── tsconfig.json
```

### Frontend Structure (Next.js)
```
frontend/ (or keep current structure)
├── app/
│   ├── api/ (REMOVE - all API calls go to backend)
│   └── ...
├── lib/
│   ├── api/
│   │   ├── client.ts (API client configuration)
│   │   ├── projects.ts
│   │   ├── scenes.ts
│   │   ├── media.ts
│   │   └── tts.ts
└── ...
```

---

## 🔌 API Design Recommendations

### RESTful API Endpoints

#### Projects
```
GET    /api/v1/projects              # List all projects
POST   /api/v1/projects              # Create new project
GET    /api/v1/projects/:id          # Get project details
PUT    /api/v1/projects/:id          # Update project
DELETE /api/v1/projects/:id          # Delete project
```

#### Scenes
```
GET    /api/v1/projects/:projectId/scenes
POST   /api/v1/projects/:projectId/scenes
GET    /api/v1/scenes/:id
PUT    /api/v1/scenes/:id
DELETE /api/v1/scenes/:id
POST   /api/v1/scenes/:id/duplicate
```

#### Media (Pexels)
```
GET    /api/v1/media/images?query=...&page=1&per_page=20
GET    /api/v1/media/videos?query=...&page=1&per_page=20
```

#### Audio (Freesound)
```
GET    /api/v1/media/audio?query=...&page=1&page_size=20
```

#### Text-to-Speech
```
POST   /api/v1/tts/generate
Body: {
  text: string,
  provider: "openai" | "elevenlabs",
  voice?: string,
  model?: string
}
Response: {
  audioUrl: string (base64 or URL),
  duration: number,
  format: string
}
```

#### Script Generation
```
POST   /api/v1/ai/generate-script
Body: {
  prompt: string,
  aspectRatio: "16:9" | "9:16" | "1:1"
}
Response: {
  scenes: Array<{
    title: string,
    script: string,
    duration: number,
    keywords: string
  }>
}
```

### Alternative: GraphQL API
If you prefer GraphQL:
```
type Query {
  projects: [Project!]!
  project(id: ID!): Project
  scenes(projectId: ID!): [Scene!]!
}

type Mutation {
  createProject(input: ProjectInput!): Project!
  generateScript(input: ScriptInput!): ScriptResponse!
  generateTTS(input: TTSInput!): TTSResponse!
}
```

---

## 🔒 Security Considerations

### 1. API Authentication
- **JWT Tokens**: Issue tokens on login
- **Refresh Tokens**: For long-lived sessions
- **API Keys**: For server-to-server (if needed)

### 2. Environment Variables (Backend Only)
```env
# Backend .env (NEVER commit)
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
PEXELS_API_KEY=...
FREESOUND_API_KEY=...
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

### 3. Rate Limiting
- Implement rate limiting per user/IP
- Use Redis for distributed rate limiting
- Example: 100 requests/minute per user

### 4. CORS Configuration
```typescript
// Backend CORS config
const allowedOrigins = [
  'http://localhost:3000',      // Next.js dev
  'https://yourdomain.com',      // Production web
  'com.yourapp.flutter',         // Flutter app
];
```

### 5. Input Validation
- Validate all inputs on backend
- Use Zod or Joi schemas
- Sanitize user inputs

### 6. Error Handling
- Don't expose internal errors to frontend
- Return generic error messages
- Log detailed errors server-side

---

## 📊 Database Schema Suggestions

### Projects Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR(255),
  aspect_ratio VARCHAR(10),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Scenes Table
```sql
CREATE TABLE scenes (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  title VARCHAR(255),
  script TEXT,
  duration INTEGER,
  keywords TEXT,
  thumbnail_url TEXT,
  voiceover_data JSONB,
  captions JSONB,
  order_index INTEGER,
  created_at TIMESTAMP
);
```

### Elements Table
```sql
CREATE TABLE elements (
  id UUID PRIMARY KEY,
  scene_id UUID REFERENCES scenes(id),
  type VARCHAR(50),
  data JSONB,  -- Store all element properties
  order_index INTEGER,
  created_at TIMESTAMP
);
```

---

## 🚀 Migration Strategy

### Phase 1: Setup Backend (Week 1)
1. Create new backend project
2. Setup Express/NestJS
3. Configure database
4. Setup authentication
5. Create basic project/scene CRUD endpoints

### Phase 2: Move Third-Party APIs (Week 2)
1. Move OpenAI script generation
2. Move OpenAI TTS
3. Move ElevenLabs TTS
4. Move Pexels integration
5. Move Freesound integration

### Phase 3: Update Frontend (Week 3)
1. Create API client in Next.js
2. Replace `/api/*` calls with backend calls
3. Update Zustand store to use backend
4. Test all functionality

### Phase 4: Flutter Integration (Week 4)
1. Create Flutter project
2. Setup HTTP client (Dio or http package)
3. Reuse same API endpoints
4. Implement UI similar to web

### Phase 5: Testing & Optimization (Week 5)
1. End-to-end testing
2. Performance optimization
3. Error handling improvements
4. Documentation

---

## 💡 Best Practices

### 1. API Client Pattern (Frontend)
```typescript
// lib/api/client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
```

### 2. Service Layer Pattern (Backend)
```typescript
// services/openai.service.ts
export class OpenAIService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY!;
  }

  async generateScript(prompt: string, aspectRatio: string) {
    // Implementation
  }

  async textToSpeech(text: string, voice: string) {
    // Implementation
  }
}
```

### 3. Error Handling
```typescript
// Backend error middleware
app.use((err, req, res, next) => {
  console.error(err); // Log to server
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
  });
});
```

### 4. Request Validation
```typescript
// Using Zod
import { z } from 'zod';

const generateScriptSchema = z.object({
  prompt: z.string().min(10).max(1000),
  aspectRatio: z.enum(['16:9', '9:16', '1:1']),
});

// In controller
const validated = generateScriptSchema.parse(req.body);
```

---

## 📦 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
# No API keys here!
```

### Backend (.env)
```env
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/canvas_db

# Third-Party APIs
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
PEXELS_API_KEY=...
FREESOUND_API_KEY=...

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

---

## 🎯 Benefits of This Architecture

### 1. Security
- ✅ API keys never exposed to frontend
- ✅ Centralized authentication
- ✅ Rate limiting on backend
- ✅ Input validation on backend

### 2. Reusability
- ✅ Same backend for web and mobile
- ✅ Consistent API across platforms
- ✅ Shared business logic

### 3. Scalability
- ✅ Backend can scale independently
- ✅ Can add caching layer (Redis)
- ✅ Can add CDN for static assets
- ✅ Can use load balancers

### 4. Maintainability
- ✅ Clear separation of concerns
- ✅ Easier to test (unit tests for services)
- ✅ Easier to debug
- ✅ Version API endpoints independently

### 5. Cost Optimization
- ✅ Can cache API responses
- ✅ Can batch requests
- ✅ Can optimize third-party API usage

---

## ⚠️ Trade-offs & Considerations

### Pros
- ✅ Better security (API keys hidden)
- ✅ Multi-platform support (web + mobile)
- ✅ Centralized business logic
- ✅ Easier to scale
- ✅ Better error handling

### Cons
- ❌ More complex setup initially
- ❌ Need to manage two projects
- ❌ Additional deployment step
- ❌ Network latency (extra hop)
- ❌ Need to handle CORS

### Mitigations
- Use Docker for easy deployment
- Implement caching to reduce latency
- Use WebSockets for real-time features
- Consider API versioning from start

---

## 🔄 Deployment Options

### Option 1: Separate Servers
- **Frontend**: Vercel/Netlify (Next.js)
- **Backend**: Railway/Render/Heroku (Node.js)
- **Database**: Supabase/PlanetScale (PostgreSQL)

### Option 2: Docker Compose (Development)
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://...
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000
  
  database:
    image: postgres:15
    environment:
      - POSTGRES_DB=canvas_db
```

### Option 3: Monorepo (Recommended)
Use a monorepo tool like:
- **Turborepo** (recommended)
- **Nx**
- **Lerna**

Structure:
```
canvas-app/
├── apps/
│   ├── web/          # Next.js
│   ├── mobile/       # Flutter
│   └── backend/       # Node.js API
├── packages/
│   ├── shared-types/ # TypeScript types
│   └── api-client/   # Shared API client
└── package.json
```

---

## 📝 Next Steps (When Ready to Implement)

1. **Choose Backend Framework** (Express vs NestJS)
2. **Setup Database** (PostgreSQL + Prisma)
3. **Create API Client** (Frontend)
4. **Migrate One Endpoint** (Test the pattern)
5. **Migrate All Endpoints** (Systematic migration)
6. **Add Authentication** (JWT)
7. **Setup Flutter Project** (Reuse API)
8. **Deploy** (Separate or together)

---

## 🎓 Learning Resources

- **Express.js**: https://expressjs.com/
- **NestJS**: https://nestjs.com/
- **Prisma**: https://www.prisma.io/
- **REST API Design**: https://restfulapi.net/
- **GraphQL**: https://graphql.org/

---

## ❓ Questions to Consider

1. **Authentication**: Will users have accounts? (affects database schema)
2. **Persistence**: Do you need to save projects? (affects database)
3. **Real-time**: Need WebSockets for collaboration?
4. **File Storage**: Where to store generated audio/videos?
5. **Caching**: Need Redis for performance?
6. **Monitoring**: Need error tracking (Sentry)?
7. **Analytics**: Track API usage?

---

**Ready to implement?** Start with Phase 1 and migrate one endpoint at a time! 🚀

