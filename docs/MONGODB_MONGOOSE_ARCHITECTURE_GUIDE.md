# MongoDB + Mongoose Architecture Guide
## Node.js + Express.js + MongoDB + Mongoose Stack

---

## 🎯 Why MongoDB + Mongoose for This Project?

### Advantages for Your Use Case

1. **Flexible Schema** ✅
   - Canvas elements have varying properties (text, image, video, audio)
   - Animations array can be different per element
   - Easy to add new element types without migrations

2. **JSON-like Documents** ✅
   - Your Zustand store already uses JSON
   - Direct mapping: Store → MongoDB
   - No complex joins needed

3. **Nested Data** ✅
   - Scenes contain arrays of elements
   - Elements contain arrays of animations
   - Perfect for nested document structure

4. **Rapid Development** ✅
   - No migrations needed
   - Schema changes are flexible
   - Fast prototyping

5. **Mongoose Benefits** ✅
   - TypeScript support
   - Built-in validation
   - Middleware (pre/post hooks)
   - Easy relationships (references)

---

## 📐 Architecture Overview

```
┌─────────────────┐         ┌─────────────────┐
│   Next.js Web   │         │  Flutter Mobile │
│    (Frontend)   │         │    (Frontend)   │
└────────┬────────┘         └────────┬────────┘
         │                            │
         │  HTTP/REST API            │
         │  (Express.js)              │
         └────────────┬───────────────┘
                      │
         ┌────────────▼────────────┐
         │   Express.js Backend   │
         │   + Mongoose ODM       │
         └────────────┬────────────┘
                      │
         ┌────────────▼────────────┐
         │      MongoDB Atlas      │
         │   (or Local MongoDB)    │
         └─────────────────────────┘
```

---

## 📁 Recommended Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # MongoDB connection
│   │   ├── env.ts                # Environment variables
│   │   └── constants.ts
│   │
│   ├── models/                   # Mongoose Models
│   │   ├── User.model.ts
│   │   ├── Project.model.ts
│   │   ├── Scene.model.ts
│   │   └── Element.model.ts
│   │
│   ├── controllers/              # Request handlers
│   │   ├── projects.controller.ts
│   │   ├── scenes.controller.ts
│   │   ├── media.controller.ts
│   │   └── tts.controller.ts
│   │
│   ├── services/                 # Business logic
│   │   ├── openai.service.ts
│   │   ├── elevenlabs.service.ts
│   │   ├── pexels.service.ts
│   │   ├── freesound.service.ts
│   │   └── project.service.ts
│   │
│   ├── routes/                   # Express routes
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── projects.routes.ts
│   │   │       ├── scenes.routes.ts
│   │   │       ├── media.routes.ts
│   │   │       └── tts.routes.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── asyncHandler.middleware.ts
│   │
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── errors.ts
│   │   └── validators.ts
│   │
│   ├── types/                    # TypeScript types
│   │   ├── express.d.ts          # Extend Express types
│   │   └── models.types.ts
│   │
│   └── app.ts                    # Express app setup
│
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── server.ts                     # Entry point
```

---

## 🗄️ MongoDB Database Design

### Database Name
```
canvas_editor_db
```

### Collections Structure

#### 1. **users** Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed),
  name: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. **projects** Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'users'),
  title: String,
  aspectRatio: String ('16:9' | '9:16' | '1:1'),
  zoom: Number (default: 1),
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. **scenes** Collection
```javascript
{
  _id: ObjectId,
  projectId: ObjectId (ref: 'projects'),
  title: String,
  script: String,
  duration: Number (seconds),
  keywords: String,
  thumbnail: String (URL),
  orderIndex: Number,
  
  // Voiceover data (embedded)
  voiceover: {
    audioUrl: String,
    duration: Number,
    voice: String,
    model: String,
    provider: String ('openai' | 'elevenlabs')
  },
  
  // Captions array (embedded)
  captions: [{
    id: String,
    text: String,
    startTime: Number,
    endTime: Number,
    style: {
      fontSize: Number,
      fontFamily: String,
      fill: String,
      backgroundColor: String
    }
  }],
  
  createdAt: Date,
  updatedAt: Date
}
```

#### 4. **elements** Collection
```javascript
{
  _id: ObjectId,
  sceneId: ObjectId (ref: 'scenes'),
  type: String ('text' | 'shape' | 'image' | 'video' | 'audio'),
  label: String,
  
  // Position & Size
  x: Number,
  y: Number,
  width: Number,
  height: Number,
  rotation: Number (default: 0),
  
  // Styling (varies by type)
  fill: String,
  fontSize: Number,
  fontFamily: String,
  textAlign: String,
  content: String,
  assetUrl: String,
  shapeVariant: String,
  cornerRadius: Number,
  stroke: String,
  strokeWidth: Number,
  opacity: Number,
  imageFit: String,
  
  // State
  locked: Boolean (default: false),
  
  // Animations array (embedded)
  animations: [{
    id: String,
    type: String,
    duration: Number,
    delay: Number,
    easing: String,
    direction: String,
    from: Object,
    to: Object
  }],
  
  orderIndex: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes to Create

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true })

// Projects
db.projects.createIndex({ userId: 1 })
db.projects.createIndex({ createdAt: -1 })

// Scenes
db.scenes.createIndex({ projectId: 1 })
db.scenes.createIndex({ projectId: 1, orderIndex: 1 })

// Elements
db.elements.createIndex({ sceneId: 1 })
db.elements.createIndex({ sceneId: 1, orderIndex: 1 })
```

---

## 📝 Mongoose Schema Examples

### Project Schema
```typescript
// Key points:
// - Reference to User
// - Store aspectRatio and zoom
// - Timestamps enabled
// - Virtual for scene count (optional)
```

### Scene Schema
```typescript
// Key points:
// - Reference to Project
// - Embedded voiceover object
// - Embedded captions array
// - orderIndex for sorting
// - Pre-save hook to set orderIndex if not provided
```

### Element Schema
```typescript
// Key points:
// - Reference to Scene
// - Flexible schema (many optional fields)
// - Embedded animations array
// - orderIndex for layer ordering
// - Pre-save hook to set orderIndex
```

### User Schema (if needed)
```typescript
// Key points:
// - Email unique and required
// - Password hashed with bcrypt
// - Timestamps enabled
```

---

## 🔌 API Endpoints Design

### Projects Endpoints
```
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:id
PUT    /api/v1/projects/:id
DELETE /api/v1/projects/:id
```

**Request/Response Examples:**
- POST: Create project with aspectRatio
- GET: Return project with populated scenes count
- PUT: Update title, aspectRatio, zoom

### Scenes Endpoints
```
GET    /api/v1/projects/:projectId/scenes
POST   /api/v1/projects/:projectId/scenes
GET    /api/v1/scenes/:id
PUT    /api/v1/scenes/:id
DELETE /api/v1/scenes/:id
POST   /api/v1/scenes/:id/duplicate
PUT    /api/v1/scenes/reorder
```

**Request/Response Examples:**
- POST: Create scene with script, duration, keywords
- GET: Return scene with populated elements
- PUT: Update script, duration, voiceover, captions
- POST /duplicate: Clone scene with new _id

### Elements Endpoints
```
GET    /api/v1/scenes/:sceneId/elements
POST   /api/v1/scenes/:sceneId/elements
GET    /api/v1/elements/:id
PUT    /api/v1/elements/:id
DELETE /api/v1/elements/:id
PUT    /api/v1/elements/reorder
```

**Request/Response Examples:**
- POST: Create element (text, shape, image, video, audio)
- PUT: Update element properties, animations
- PUT /reorder: Update orderIndex for multiple elements

### Media Endpoints (Third-party)
```
GET    /api/v1/media/images?query=...&page=1&per_page=20
GET    /api/v1/media/videos?query=...&page=1&per_page=20
GET    /api/v1/media/audio?query=...&page=1&page_size=20
```

### TTS Endpoints
```
POST   /api/v1/tts/generate
Body: {
  text: string,
  provider: "openai" | "elevenlabs",
  voice?: string,
  model?: string
}
```

### AI Endpoints
```
POST   /api/v1/ai/generate-script
Body: {
  prompt: string,
  aspectRatio: "16:9" | "9:16" | "1:1"
}
```

---

## 🔧 Mongoose Best Practices

### 1. Connection Management
```typescript
// config/database.ts
// - Use connection pooling
// - Handle connection errors
// - Reconnect on failure
// - Close connection gracefully on app shutdown
```

### 2. Schema Design Principles
- **Embed vs Reference:**
  - Embed: Voiceover, Captions, Animations (small, rarely queried alone)
  - Reference: Scenes → Project, Elements → Scene (large, queried independently)

- **Array Size:**
  - Keep arrays small (< 100 items)
  - For large arrays, consider separate collection

- **Document Size:**
  - MongoDB limit: 16MB per document
  - If scene has 1000+ elements, consider pagination

### 3. Validation
```typescript
// Use Mongoose validators:
// - required: true
// - enum: ['16:9', '9:16', '1:1']
// - min/max for numbers
// - custom validators for complex rules
```

### 4. Middleware (Hooks)
```typescript
// Pre-save hooks:
// - Auto-generate orderIndex
// - Hash passwords
// - Set timestamps

// Post-save hooks:
// - Update parent document
// - Send notifications
```

### 5. Queries
```typescript
// Use:
// - .populate() for references
// - .lean() for read-only (faster)
// - .select() to limit fields
// - .sort() for ordering
// - .limit() and .skip() for pagination
```

### 6. Error Handling
```typescript
// Handle:
// - Validation errors (400)
// - Cast errors (404)
// - Duplicate key errors (409)
// - Database connection errors (500)
```

---

## 🔒 Security Considerations

### 1. Input Validation
- Use Mongoose validators
- Additional validation with Zod/Joi
- Sanitize user inputs

### 2. Authentication
- JWT tokens stored in HTTP-only cookies or Authorization header
- Refresh token rotation
- Password hashing with bcrypt (if user auth needed)

### 3. Authorization
- Check user owns project before operations
- Middleware to verify permissions
- Role-based access (if needed)

### 4. API Keys
- Store in backend `.env` only
- Never expose to frontend
- Rotate keys regularly

### 5. MongoDB Security
- Use MongoDB Atlas (cloud) or secure local instance
- Enable authentication
- Use connection string with credentials
- Whitelist IP addresses (if using Atlas)

---

## 📦 Environment Variables

### Backend `.env`
```env
# Server
PORT=4000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/canvas_editor_db
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/canvas_editor_db?retryWrites=true&w=majority

# Third-Party APIs
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
PEXELS_API_KEY=...
FREESOUND_API_KEY=...

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

---

## 🚀 Development Workflow

### 1. Setup MongoDB
**Option A: Local MongoDB**
- Install MongoDB Community Edition
- Start MongoDB service
- Connection: `mongodb://localhost:27017/canvas_editor_db`

**Option B: MongoDB Atlas (Cloud)**
- Create free account at mongodb.com/cloud/atlas
- Create cluster (free tier available)
- Get connection string
- Whitelist IP addresses

### 2. Install Dependencies
```bash
npm install express mongoose dotenv cors helmet morgan
npm install -D typescript @types/node @types/express @types/cors nodemon ts-node
```

### 3. Project Structure Setup
- Create `src/` folder
- Setup TypeScript config
- Create entry point (`server.ts`)

### 4. Database Connection
- Create `config/database.ts`
- Connect to MongoDB on app start
- Handle connection errors
- Graceful shutdown

### 5. Create Models
- Start with Project model
- Then Scene model
- Then Element model
- Test with simple CRUD operations

### 6. Create Routes & Controllers
- Setup Express app
- Create route files
- Create controller functions
- Add error handling middleware

### 7. Add Services
- Move third-party API calls to services
- Create service layer for business logic
- Keep controllers thin

---

## 📊 Data Flow Example

### Creating a Project with Scenes

1. **Frontend** → POST `/api/v1/projects`
   ```json
   {
     "title": "My Video",
     "aspectRatio": "16:9"
   }
   ```

2. **Backend Controller** → Receives request
   - Validates input
   - Calls Project Service

3. **Project Service** → Creates project
   - Creates Project document
   - Returns project with `_id`

4. **Frontend** → POST `/api/v1/ai/generate-script`
   ```json
   {
     "prompt": "A video about nature",
     "aspectRatio": "16:9"
   }
   ```

5. **Backend** → Calls OpenAI Service
   - Generates script
   - Returns scenes array

6. **Frontend** → POST `/api/v1/projects/:id/scenes` (for each scene)
   - Creates Scene documents
   - Each scene references projectId

7. **Backend** → For each scene:
   - Fetches image from Pexels (using keywords)
   - Generates voiceover (OpenAI/ElevenLabs)
   - Creates Element documents:
     - Background image element
     - Voiceover audio element
     - Caption text element

---

## 🔄 Migration from Current Zustand Store

### Current State (Zustand)
```typescript
// Store structure:
{
  scenes: Scene[],
  activeSceneId: string,
  selectedElementId: string | null,
  aspectRatio: "16:9",
  zoom: 1
}
```

### MongoDB Structure
```typescript
// Projects collection:
{
  _id: ObjectId,
  aspectRatio: "16:9",
  zoom: 1
}

// Scenes collection:
{
  _id: ObjectId,
  projectId: ObjectId,
  title: string,
  script: string,
  ...
}

// Elements collection:
{
  _id: ObjectId,
  sceneId: ObjectId,
  type: string,
  ...
}
```

### Migration Strategy
1. **Keep Zustand for UI State**
   - activeSceneId
   - selectedElementId
   - zoom (local preference)

2. **Move to MongoDB**
   - Projects
   - Scenes
   - Elements
   - User preferences

3. **Sync Zustand with MongoDB**
   - Load project on mount
   - Save changes to MongoDB
   - Optimistic updates in Zustand

---

## 💡 Mongoose-Specific Tips

### 1. Virtual Populate
```typescript
// Get project with scene count (without storing count)
// Use virtual populate to count scenes
```

### 2. Aggregation Pipeline
```typescript
// For complex queries:
// - Count elements per scene
// - Calculate total duration
// - Group by type
```

### 3. Transactions
```typescript
// For multi-document operations:
// - Create project + initial scene (atomic)
// - Update scene + reorder elements (atomic)
```

### 4. Change Streams (Advanced)
```typescript
// Real-time updates:
// - Watch for scene changes
// - Push updates to connected clients (WebSocket)
```

### 5. Indexes
```typescript
// Create indexes for:
// - Frequently queried fields
// - Sort operations
// - Text search (if needed)
```

---

## 🎯 Advantages of MongoDB for This Project

1. **No Migrations** ✅
   - Add new element types easily
   - Change schema without downtime
   - Perfect for rapid iteration

2. **Natural JSON Structure** ✅
   - Matches your frontend state
   - Easy serialization
   - Direct mapping

3. **Embedded Documents** ✅
   - Animations in elements
   - Voiceover in scenes
   - No complex joins

4. **Flexible Queries** ✅
   - Query by any field
   - Array queries (find element with animation)
   - Text search (if needed)

5. **Scalability** ✅
   - Horizontal scaling (sharding)
   - Replica sets for high availability
   - MongoDB Atlas handles infrastructure

---

## ⚠️ Considerations & Limitations

### 1. Document Size Limit
- **16MB per document limit**
- If scene has 1000+ elements, consider:
  - Pagination
  - Separate elements collection
  - Archive old elements

### 2. No Joins
- Use `.populate()` for references
- Or fetch separately and combine
- Consider denormalization for performance

### 3. Transactions
- MongoDB supports transactions (v4.0+)
- Use for multi-document operations
- Slightly slower than single-document ops

### 4. Schema Flexibility
- Can lead to inconsistent data
- Use Mongoose validators strictly
- Consider schema versioning

### 5. Learning Curve
- Different from SQL
- Need to think in documents
- Aggregation pipeline can be complex

---

## 📚 Recommended Learning Resources

1. **MongoDB University** (free courses)
   - MongoDB Basics
   - MongoDB for Node.js Developers

2. **Mongoose Documentation**
   - Official docs: mongoosejs.com
   - Schema guide
   - Query guide

3. **Express.js + MongoDB Tutorials**
   - Building REST APIs
   - Error handling patterns
   - Authentication with JWT

---

## 🎓 Next Steps (When Ready)

1. **Setup MongoDB** (local or Atlas)
2. **Create Express.js project**
3. **Connect to MongoDB** (Mongoose)
4. **Create first model** (Project)
5. **Create first route** (GET /projects)
6. **Test with Postman/Thunder Client**
7. **Add more models** (Scene, Element)
8. **Integrate with frontend**

---

## ❓ Common Questions

**Q: Should I embed or reference?**
- Embed: Small, rarely queried alone (animations, voiceover)
- Reference: Large, queried independently (scenes, elements)

**Q: How to handle relationships?**
- Use `ObjectId` references
- Use `.populate()` to fetch related documents
- Or denormalize for performance

**Q: What about migrations?**
- No migrations needed!
- Add fields as needed
- Use default values for new fields

**Q: How to query nested arrays?**
- Use dot notation: `elements.animations.type`
- Use `$elemMatch` for complex queries
- Use aggregation pipeline for advanced queries

---

**Ready to start?** Begin with MongoDB connection and first model! 🚀

