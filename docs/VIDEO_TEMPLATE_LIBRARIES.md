# Video Template Libraries Comparison
## NPM Libraries for Video Templates with JSON/XML Support

---

## 🎯 Top Recommendations

### 1. **Remotion** ⭐⭐⭐⭐⭐ (Best for React/Next.js)
**Package:** `remotion`

**Why it's perfect for your project:**
- ✅ **React-based** - Works seamlessly with your Next.js setup
- ✅ **JSON/TypeScript templates** - Define templates as React components
- ✅ **Dynamic content** - Pass images/videos as props
- ✅ **Browser-based rendering** - Preview in browser, render server-side
- ✅ **TypeScript support** - Full type safety
- ✅ **Active development** - Well-maintained, large community

**Template Format:**
```typescript
// Template as React component
export const MyTemplate: React.FC<{
  images: string[];
  videos: string[];
  text: string;
}> = ({ images, videos, text }) => {
  return (
    <Composition
      id="MyTemplate"
      component={VideoTemplate}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
    >
      <VideoTemplate images={images} videos={videos} text={text} />
    </Composition>
  );
};
```

**Pros:**
- Perfect for React/Next.js projects
- Browser preview
- TypeScript support
- Can export to video file
- Rich animation library

**Cons:**
- Requires React knowledge
- Server-side rendering needed for final video
- Learning curve

**Installation:**
```bash
npm install remotion
```

**Documentation:** https://www.remotion.dev/

---

### 2. **Editly** ⭐⭐⭐⭐ (Best for JSON Templates)
**Package:** `editly`

**Why it's great:**
- ✅ **Pure JSON configuration** - Define templates in JSON
- ✅ **Simple API** - Easy to use
- ✅ **FFmpeg-based** - High quality output
- ✅ **Transitions & effects** - Built-in animations
- ✅ **No React needed** - Works with any stack

**Template Format (JSON):**
```json
{
  "outPath": "output.mp4",
  "width": 1920,
  "height": 1080,
  "fps": 30,
  "clips": [
    {
      "type": "image",
      "path": "image1.jpg",
      "duration": 3,
      "resize": {
        "width": 960,
        "height": 540
      },
      "position": {
        "x": 0,
        "y": 0
      }
    },
    {
      "type": "video",
      "path": "video1.mp4",
      "duration": 5,
      "position": {
        "x": 960,
        "y": 0
      }
    }
  ],
  "transitions": [
    {
      "name": "fade",
      "duration": 0.5
    }
  ]
}
```

**Pros:**
- Pure JSON templates
- Simple to use
- Good documentation
- FFmpeg-based (reliable)

**Cons:**
- Server-side only (no browser preview)
- Less flexible than Remotion
- Requires FFmpeg installation

**Installation:**
```bash
npm install editly
```

**Documentation:** https://github.com/mifi/editly

---

### 3. **FFCreator** ⭐⭐⭐⭐ (Best for Complex Animations)
**Package:** `ffcreator`

**Why it's useful:**
- ✅ **JSON/JavaScript config** - Template definitions
- ✅ **Rich animations** - Many effects (like animate.css)
- ✅ **Fast rendering** - Optimized for performance
- ✅ **Scene-based** - Similar to your current structure

**Template Format:**
```javascript
const creator = new FFCreator({
  cacheDir: './cache',
  outputDir: './output',
  width: 960,
  height: 540,
  fps: 30,
});

const scene = new FFScene();
scene.setDuration(5);

// Add image
const image = new FFImage({
  path: 'image1.jpg',
  x: 480,
  y: 270,
  width: 400,
  height: 300,
});
scene.addChild(image);

// Add video
const video = new FFVideo({
  path: 'video1.mp4',
  x: 100,
  y: 100,
  width: 300,
  height: 200,
});
scene.addChild(video);

creator.addChild(scene);
```

**Pros:**
- Rich animation library
- Scene-based (fits your architecture)
- Good performance
- Active development

**Cons:**
- More complex API
- Requires FFmpeg
- Less documentation

**Installation:**
```bash
npm install ffcreator
```

**Documentation:** https://github.com/tnfe/FFCreator

---

### 4. **Shotstack SDK** ⭐⭐⭐ (Cloud-based API)
**Package:** `shotstack-sdk`

**Why consider it:**
- ✅ **JSON templates** - Define in JSON
- ✅ **Cloud rendering** - No local processing
- ✅ **REST API** - Easy integration
- ✅ **Professional quality** - Enterprise-grade

**Template Format (JSON):**
```json
{
  "timeline": {
    "soundtrack": {
      "src": "https://example.com/audio.mp3"
    },
    "tracks": [
      {
        "clips": [
          {
            "asset": {
              "type": "image",
              "src": "https://example.com/image.jpg"
            },
            "start": 0,
            "length": 3,
            "position": {
              "x": 0,
              "y": 0,
              "width": 960,
              "height": 540
            }
          }
        ]
      }
    ]
  },
  "output": {
    "format": "mp4",
    "resolution": "hd"
  }
}
```

**Pros:**
- Cloud-based (no local processing)
- Professional quality
- Scalable
- Good API

**Cons:**
- **Paid service** (not free)
- Requires internet
- Less control
- API rate limits

**Installation:**
```bash
npm install shotstack-sdk
```

**Documentation:** https://shotstack.io/

---

### 5. **Creatomate** ⭐⭐⭐ (Cloud-based with Preview)
**Package:** `@creatomate/creatomate` or `creatomate-preview`

**Why consider it:**
- ✅ **JSON templates** - Template definitions
- ✅ **Browser preview** - Preview SDK available
- ✅ **Cloud rendering** - No local processing
- ✅ **Template marketplace** - Pre-built templates

**Template Format:**
```json
{
  "elements": [
    {
      "type": "image",
      "source": "https://example.com/image.jpg",
      "x": "0%",
      "y": "0%",
      "width": "50%",
      "height": "100%"
    },
    {
      "type": "video",
      "source": "https://example.com/video.mp4",
      "x": "50%",
      "y": "0%",
      "width": "50%",
      "height": "100%"
    }
  ]
}
```

**Pros:**
- Browser preview SDK
- Template marketplace
- Cloud rendering
- Good documentation

**Cons:**
- **Paid service** (not free)
- Requires internet
- Less flexible

**Installation:**
```bash
npm install @creatomate/creatomate
# or for preview
npm install creatomate-preview
```

**Documentation:** https://creatomate.com/

---

## 📊 Comparison Table

| Library | JSON/XML | Browser Preview | Free | React Support | Complexity | Best For |
|---------|----------|----------------|------|--------------|------------|----------|
| **Remotion** | ✅ (TS/JS) | ✅ | ✅ | ✅✅✅ | Medium | React projects |
| **Editly** | ✅✅ | ❌ | ✅ | ❌ | Low | Simple JSON templates |
| **FFCreator** | ✅ (JS) | ❌ | ✅ | ❌ | Medium | Complex animations |
| **Shotstack** | ✅✅ | ❌ | ❌ | ❌ | Low | Cloud rendering |
| **Creatomate** | ✅✅ | ✅ | ❌ | ⚠️ | Low | Template marketplace |

---

## 🎯 Recommendation for Your Project

### **Option 1: Remotion (Recommended)**
**Best if:** You want browser preview + React integration

**Why:**
- Perfect for Next.js/React
- Browser preview (like your current setup)
- TypeScript support
- Can define templates as React components
- Active community

**Integration:**
```typescript
// lib/templates/remotion-templates.ts
import { Composition } from 'remotion';

export const SplitScreenTemplate = {
  id: 'split-screen',
  component: SplitScreenComposition,
  slots: [
    { id: 'left', type: 'image', x: 0, y: 0, width: 480, height: 540 },
    { id: 'right', type: 'video', x: 480, y: 0, width: 480, height: 540 }
  ]
};
```

### **Option 2: Editly (Alternative)**
**Best if:** You want simple JSON templates + server-side rendering

**Why:**
- Pure JSON (easy to store in database)
- Simple API
- No React dependency
- Good for backend processing

**Integration:**
```typescript
// lib/templates/editly-templates.ts
export const splitScreenTemplate = {
  width: 960,
  height: 540,
  clips: [
    {
      type: 'image',
      path: '{{leftImage}}', // Placeholder
      position: { x: 0, y: 0, width: 480, height: 540 }
    },
    {
      type: 'video',
      path: '{{rightVideo}}', // Placeholder
      position: { x: 480, y: 0, width: 480, height: 540 }
    }
  ]
};
```

---

## 🔄 Hybrid Approach (Recommended)

### Use Both:
1. **Remotion for Preview/Editing**
   - Browser-based preview
   - Real-time editing
   - Template visualization

2. **Editly/FFCreator for Final Render**
   - Server-side rendering
   - High-quality output
   - Convert Remotion template to JSON

**Flow:**
```
1. User selects template (Remotion component)
2. Preview in browser (Remotion)
3. User edits/approves
4. Convert to JSON template
5. Render final video (Editly/FFCreator)
```

---

## 📝 Template Storage Options

### Option 1: Store as JSON (Editly/Shotstack style)
```json
{
  "id": "split-screen",
  "name": "Split Screen",
  "slots": [
    {
      "id": "left",
      "type": "image",
      "position": { "x": 0, "y": 0, "width": 480, "height": 540 }
    }
  ]
}
```

### Option 2: Store as React Component (Remotion style)
```typescript
// templates/split-screen.tsx
export const SplitScreenTemplate = ({ leftImage, rightVideo }) => {
  return (
    <AbsoluteFill>
      <Img src={leftImage} style={{ left: 0, width: 480 }} />
      <Video src={rightVideo} style={{ left: 480, width: 480 }} />
    </AbsoluteFill>
  );
};
```

### Option 3: Store in Database (MongoDB)
```javascript
// Template document
{
  _id: ObjectId,
  name: "Split Screen",
  slots: [...],
  remotionComponent: "...", // Code as string
  editlyConfig: {...} // JSON config
}
```

---

## 🚀 Implementation Strategy

### Phase 1: Template Library Integration
1. **Choose library** (Remotion recommended)
2. **Create template definitions**
3. **Store templates** (JSON or code)
4. **Map media to template slots**

### Phase 2: Template Selection UI
1. **Add template picker** in Generate Script Modal
2. **Show template previews**
3. **Allow template selection**

### Phase 3: Media Mapping
1. **Fetch media** (existing)
2. **Map to template slots**
3. **Apply template layout**
4. **Render preview**

---

## 💡 Additional Libraries to Consider

### For Template Management:
- **Handlebars** - Template engine (can use for video templates)
- **Mustache** - Logic-less templates
- **EJS** - Embedded JavaScript templates

### For Video Processing:
- **fluent-ffmpeg** - FFmpeg wrapper (if building custom)
- **node-ffmpeg** - Another FFmpeg wrapper

### For Animation:
- **framer-motion** - (You already have this!)
- **react-spring** - Animation library
- **gsap** - Professional animations

---

## 🎯 Final Recommendation

**For your Next.js + React project:**

1. **Use Remotion** for:
   - Template definitions (React components)
   - Browser preview
   - Template visualization

2. **Store templates as:**
   - React components (for Remotion)
   - JSON config (for backup/export)

3. **Template format:**
   ```typescript
   interface Template {
     id: string;
     name: string;
     remotionComponent: React.ComponentType<TemplateProps>;
     slots: TemplateSlot[];
     editlyConfig?: EditlyConfig; // For server-side rendering
   }
   ```

4. **Integration:**
   - Templates in `lib/templates/`
   - Remotion for preview
   - Optionally use Editly for final render

---

## 📚 Resources

- **Remotion Docs:** https://www.remotion.dev/docs/
- **Editly GitHub:** https://github.com/mifi/editly
- **FFCreator GitHub:** https://github.com/tnfe/FFCreator
- **Shotstack Docs:** https://shotstack.io/docs/
- **Creatomate Docs:** https://creatomate.com/docs

---

**Next Steps:**
1. Try Remotion (best fit for your stack)
2. Create 2-3 template examples
3. Integrate with your template selection UI
4. Map media to template slots

Would you like me to show you how to integrate Remotion or Editly with your current setup? 🚀

