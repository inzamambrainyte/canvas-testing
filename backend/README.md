# Canvas Editor Backend API

Backend API server for Canvas Editor built with Node.js, Express.js, MongoDB, and Mongoose.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Setup environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   MONGODB_URI=mongodb://localhost:27017/canvas_editor_db
   OPENAI_API_KEY=sk-your-key-here
   ELEVENLABS_API_KEY=your-key-here
   PEXELS_API_KEY=your-key-here
   FREESOUND_API_KEY=your-key-here
   ```

3. **Start MongoDB:**
   - **Local**: Make sure MongoDB is running on `localhost:27017`
   - **Atlas**: Use your MongoDB Atlas connection string in `MONGODB_URI`

4. **Run the server:**
   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm run build
   npm start
   ```

The server will start on `http://localhost:4000`

## 📡 API Endpoints

### Projects
- `GET /api/v1/projects` - Get all projects
- `POST /api/v1/projects` - Create a project
- `GET /api/v1/projects/:id` - Get a project
- `PUT /api/v1/projects/:id` - Update a project
- `DELETE /api/v1/projects/:id` - Delete a project

### Scenes
- `GET /api/v1/projects/:projectId/scenes` - Get all scenes for a project
- `POST /api/v1/projects/:projectId/scenes` - Create a scene
- `GET /api/v1/scenes/:id` - Get a scene (with elements)
- `PUT /api/v1/scenes/:id` - Update a scene
- `DELETE /api/v1/scenes/:id` - Delete a scene
- `POST /api/v1/scenes/:id/duplicate` - Duplicate a scene

### Elements
- `GET /api/v1/scenes/:sceneId/elements` - Get all elements for a scene
- `POST /api/v1/scenes/:sceneId/elements` - Create an element
- `GET /api/v1/elements/:id` - Get an element
- `PUT /api/v1/elements/:id` - Update an element
- `DELETE /api/v1/elements/:id` - Delete an element
- `PUT /api/v1/elements/reorder` - Reorder elements

### Media
- `GET /api/v1/media/images?query=...&page=1&per_page=20` - Search images (Pexels)
- `GET /api/v1/media/videos?query=...&page=1&per_page=20` - Search videos (Pexels)
- `GET /api/v1/media/audio?query=...&page=1&page_size=20` - Search audio (Freesound)

### Text-to-Speech
- `POST /api/v1/tts/generate` - Generate TTS audio
  ```json
  {
    "text": "Hello world",
    "provider": "openai" | "elevenlabs",
    "voice": "alloy",
    "model": "tts-1"
  }
  ```

### AI
- `POST /api/v1/ai/generate-script` - Generate video script
  ```json
  {
    "prompt": "A video about nature",
    "aspectRatio": "16:9" | "9:16" | "1:1"
  }
  ```

## 🗄️ Database Schema

### Projects
- `title`: String
- `aspectRatio`: "16:9" | "9:16" | "1:1"
- `zoom`: Number (0.1 - 2)

### Scenes
- `projectId`: ObjectId (ref: Project)
- `title`: String
- `script`: String
- `duration`: Number (seconds)
- `keywords`: String
- `thumbnail`: String (URL)
- `orderIndex`: Number
- `voiceover`: Object (embedded)
- `captions`: Array (embedded)

### Elements
- `sceneId`: ObjectId (ref: Scene)
- `type`: "text" | "shape" | "image" | "video" | "audio"
- `x`, `y`, `width`, `height`: Number
- `animations`: Array (embedded)
- `orderIndex`: Number
- ... (many other optional fields)

## 🔧 Development

### Project Structure
```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # Mongoose models
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── routes/          # Express routes
│   ├── middleware/     # Middleware functions
│   ├── types/           # TypeScript types
│   ├── app.ts           # Express app setup
│   └── server.ts        # Entry point
├── .env                 # Environment variables
└── package.json
```

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Lint code

## 🔒 Security

- API keys stored in backend `.env` only
- CORS configured for allowed origins
- Helmet.js for security headers
- Input validation with Mongoose schemas

## 📝 Environment Variables

See `.env.example` for all required variables.

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env`
- Check MongoDB logs

### API Key Errors
- Verify all API keys are set in `.env`
- Check API key validity
- Check API rate limits

### Port Already in Use
- Change `PORT` in `.env`
- Or kill the process using port 4000

## 📚 Learn More

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)

