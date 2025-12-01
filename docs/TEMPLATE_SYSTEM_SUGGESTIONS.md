# Template System Suggestions
## Adding Template Support for Script Generation

## 🎯 Overview

Allow users to select a template when generating a script. The system will automatically place fetched images/videos into predefined template slots based on the script content.

---

## 📐 Template Structure

### Template Definition
```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string; // Preview image
  aspectRatio: "16:9" | "9:16" | "1:1";
  
  // Template layout slots
  slots: TemplateSlot[];
  
  // Default animations for elements
  defaultAnimations?: Animation[];
  
  // Category/Type
  category: "modern" | "minimal" | "dynamic" | "corporate" | "creative";
}

interface TemplateSlot {
  id: string;
  name: string; // e.g., "Background", "Hero Image", "Side Image 1"
  type: "image" | "video" | "mixed"; // Can accept both
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  zIndex: number; // Layer order
  required: boolean; // Must be filled
  priority: number; // 1 = highest priority (fill first)
  constraints?: {
    minAspectRatio?: number;
    maxAspectRatio?: number;
    preferredOrientation?: "landscape" | "portrait" | "square";
  };
  defaultAnimation?: Animation; // Slot-specific animation
}
```

---

## 🎨 Template Examples

### Template 1: "Split Screen"
```
┌─────────────────────────┐
│  [Image 1]  │  [Image 2]│  ← Two side-by-side images
│             │           │
│  [Text]     │  [Video]  │  ← Text on left, video on right
└─────────────────────────┘
```

**Slots:**
- Slot 1: Left Image (50% width, left side)
- Slot 2: Right Image (50% width, right side)
- Slot 3: Text Overlay (centered)
- Slot 4: Video (right side, smaller)

### Template 2: "Hero with Overlays"
```
┌─────────────────────────┐
│   [Background Image]    │  ← Full screen background
│                         │
│  [Small Image 1]        │  ← Top-left overlay
│              [Video]    │  ← Top-right video
│                         │
│        [Text]           │  ← Centered text
└─────────────────────────┘
```

**Slots:**
- Slot 1: Background (full screen, z-index: 0)
- Slot 2: Hero Image (top-left, z-index: 1)
- Slot 3: Video Clip (top-right, z-index: 1)
- Slot 4: Text Overlay (center, z-index: 2)

### Template 3: "Grid Layout"
```
┌─────────────────────────┐
│  [Img1] │ [Img2] │ [Img3]│  ← 3-column grid
│─────────┼─────────┼──────│
│  [Video]│ [Text] │ [Img4]│  ← Mixed content
└─────────────────────────┘
```

**Slots:**
- 6 slots in a 3x2 grid
- Each slot: 33% width, 50% height

### Template 4: "Minimal Centered"
```
┌─────────────────────────┐
│                         │
│                         │
│      [Single Image]     │  ← One large centered image
│                         │
│        [Text]           │  ← Text below
└─────────────────────────┘
```

**Slots:**
- Slot 1: Centered Image (60% width, centered)
- Slot 2: Text (below image)

---

## 🔄 Template Selection Flow

### Option 1: Pre-Selection (Before Script Generation)
```
1. User clicks "Generate Script"
2. Modal opens with:
   - Step 1: Select Template (NEW!)
   - Step 2: Enter Script Prompt
   - Step 3: Select Aspect Ratio
   - Step 4: Select Voice Provider
3. User selects template
4. User enters prompt
5. Script is generated
6. Images/videos are fetched
7. Media is placed into template slots
```

### Option 2: Post-Selection (After Script Generation)
```
1. User generates script (current flow)
2. In Step 2 (review scenes):
   - Show "Apply Template" button
   - User can select template per scene or for all scenes
3. Template is applied
4. Media is rearranged to fit template
```

### Option 3: Hybrid (Recommended)
```
1. User clicks "Generate Script"
2. Step 1: Template Selection (optional, can skip)
   - "No Template" option (current behavior)
   - Or select a template
3. Step 2: Script Prompt + Aspect Ratio + Voice
4. Step 3: Review Generated Scenes
   - If template selected: Show preview with template layout
   - If no template: Show current layout
   - Option to change template per scene
```

---

## 🗂️ Template Storage Options

### Option 1: Hardcoded Templates (Quick Start)
- Store templates in `lib/templates.ts` or `lib/templates.json`
- Predefined set of 5-10 templates
- Easy to implement
- Limited customization

### Option 2: Database Templates (Scalable)
- Store templates in MongoDB
- Admin can create/edit templates
- Users can save custom templates
- More flexible

### Option 3: Hybrid Approach (Recommended)
- Default templates in code
- User-created templates in database
- Best of both worlds

---

## 🎯 Media-to-Slot Mapping Strategy

### Strategy 1: Sequential Assignment
```
1. Fetch images/videos (as currently done)
2. Sort by priority/quality
3. Assign to slots in order:
   - Slot 1 (priority 1) → Best image
   - Slot 2 (priority 2) → Second best image
   - Slot 3 (priority 3) → Best video
   - etc.
```

### Strategy 2: Smart Matching
```
1. Analyze each slot's constraints:
   - Preferred orientation
   - Aspect ratio requirements
   - Size requirements
2. Match media to slots:
   - Landscape images → Landscape slots
   - Portrait images → Portrait slots
   - Videos → Video slots
   - Best fit based on dimensions
```

### Strategy 3: AI-Powered Matching (Advanced)
```
1. Use OpenAI to analyze:
   - Script content
   - Image/video content (from keywords)
   - Slot context (name, position)
2. Match semantically:
   - "Hero" slot → Most relevant image
   - "Background" → Best background image
   - "Supporting" → Secondary images
```

### Strategy 4: Keyword-Based Matching (Recommended)
```
1. Each slot has optional keywords/tags
2. Match fetched media keywords to slot keywords
3. Example:
   - Slot: "Hero Image" (keywords: ["main", "primary", "hero"])
   - Media: Image with keywords "nature, forest, trees"
   - If script mentions "forest" → Match to hero slot
```

---

## 📋 Template Categories

### 1. Layout-Based Templates
- **Split Screen**: Two equal sections
- **Grid**: Multiple equal sections
- **Centered**: Single focal point
- **Asymmetric**: Creative layouts

### 2. Content-Based Templates
- **Image-Heavy**: Multiple images, minimal text
- **Video-Focused**: Videos as primary content
- **Text-Overlay**: Text on top of media
- **Mixed Media**: Balanced images/videos/text

### 3. Style-Based Templates
- **Minimal**: Clean, simple layouts
- **Dynamic**: Animated, energetic
- **Corporate**: Professional, structured
- **Creative**: Artistic, unconventional

---

## 🎨 UI/UX Suggestions

### Template Selection UI

#### Option A: Grid View
```
┌─────────────────────────────────────┐
│  Select Template                    │
├─────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ Temp1│ │ Temp2│ │ Temp3│       │
│  │ [img]│ │ [img]│ │ [img]│       │
│  │ Name │ │ Name │ │ Name │       │
│  └──────┘ └──────┘ └──────┘       │
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ Temp4│ │ Temp5│ │ Temp6│       │
│  └──────┘ └──────┘ └──────┘       │
│                                     │
│  [No Template] [Custom Template]   │
└─────────────────────────────────────┘
```

#### Option B: Category Tabs
```
┌─────────────────────────────────────┐
│  [Layout] [Style] [Content]         │
├─────────────────────────────────────┤
│  Layout Templates:                  │
│  • Split Screen                     │
│  • Grid Layout                      │
│  • Centered                         │
└─────────────────────────────────────┘
```

#### Option C: Preview with Info
```
┌─────────────────────────────────────┐
│  Template Preview                   │
│  ┌─────────────────────────────┐   │
│  │   [Visual Preview]          │   │
│  └─────────────────────────────┘   │
│                                     │
│  Name: Split Screen                 │
│  Description: Two side-by-side...   │
│  Slots: 4 (2 images, 1 video, 1 txt)│
│                                     │
│  [← Prev] [Select] [Next →]        │
└─────────────────────────────────────┘
```

---

## 🔧 Implementation Considerations

### 1. Template Application Logic

**When to Apply:**
- During `createNewProject` function
- After fetching media but before adding to scene
- Map media to template slots
- Create elements with template positions

**Code Flow:**
```typescript
createNewProject(scenes, aspectRatio, ttsProvider, templateId?) {
  // 1. Generate script (existing)
  // 2. Fetch media (existing)
  // 3. If templateId:
  //    - Load template
  //    - Map media to slots
  //    - Create elements with template positions
  // 4. Else:
  //    - Use current logic (random positions)
}
```

### 2. Slot Filling Priority

**Priority Order:**
1. Required slots (must fill)
2. High priority slots (fill first)
3. Medium priority slots
4. Low priority slots (optional)

**Fallback:**
- If not enough media: Leave slots empty or use placeholders
- If too much media: Add to "extra" slots or ignore

### 3. Template Customization

**Per-Scene Template:**
- Each scene can have different template
- Useful for variety in video

**Global Template:**
- Same template for all scenes
- Consistent look

**Hybrid:**
- Default template for all scenes
- Option to override per scene

---

## 📊 Template Data Structure Example

### Example Template: "Split Screen Modern"
```json
{
  "id": "split-screen-modern",
  "name": "Split Screen Modern",
  "description": "Two side-by-side sections with modern design",
  "thumbnail": "/templates/split-screen.jpg",
  "aspectRatio": "16:9",
  "category": "layout",
  "slots": [
    {
      "id": "left-image",
      "name": "Left Image",
      "type": "image",
      "position": { "x": 0, "y": 0, "width": 480, "height": 540 },
      "zIndex": 1,
      "required": true,
      "priority": 1,
      "constraints": {
        "preferredOrientation": "portrait"
      },
      "defaultAnimation": {
        "type": "slide",
        "direction": "in",
        "duration": 1.0,
        "easing": "ease-out"
      }
    },
    {
      "id": "right-video",
      "name": "Right Video",
      "type": "video",
      "position": { "x": 480, "y": 0, "width": 480, "height": 540 },
      "zIndex": 1,
      "required": false,
      "priority": 2
    },
    {
      "id": "text-overlay",
      "name": "Text Overlay",
      "type": "text",
      "position": { "x": 0, "y": 400, "width": 960, "height": 140 },
      "zIndex": 10,
      "required": true,
      "priority": 3
    }
  ]
}
```

---

## 🎯 Recommended Approach

### Phase 1: Basic Templates (MVP)
1. **5-10 Hardcoded Templates**
   - Store in `lib/templates.ts`
   - Simple layouts (Split, Grid, Centered, etc.)
   - Basic slot mapping (sequential)

2. **Template Selection in Generate Script Modal**
   - Add template picker in Step 1
   - Optional (can skip for current behavior)
   - Visual preview cards

3. **Simple Media Mapping**
   - Sequential assignment to slots
   - Priority-based (required slots first)

### Phase 2: Enhanced Templates
1. **Template Categories**
   - Organize by layout/style
   - Filter/search templates

2. **Smart Matching**
   - Match media to slots by constraints
   - Better aspect ratio matching

3. **Per-Scene Templates**
   - Different template per scene
   - Mix and match

### Phase 3: Advanced Features
1. **User Templates**
   - Save custom templates
   - Share templates
   - Template marketplace

2. **AI-Powered Matching**
   - Semantic matching
   - Content-aware placement

3. **Template Editor**
   - Visual template builder
   - Drag-and-drop slot creation

---

## 💡 Additional Suggestions

### 1. Template Presets by Use Case
- **Social Media**: Optimized for Instagram, TikTok, YouTube
- **Presentation**: Professional, clean layouts
- **Storytelling**: Narrative-focused templates
- **Product Showcase**: Product-focused layouts

### 2. Dynamic Templates
- Templates that adapt based on:
  - Number of images/videos fetched
  - Script length
  - Scene duration

### 3. Template Preview
- Show template preview in modal
- Highlight slot positions
- Show example with placeholder media

### 4. Template Recommendations
- Suggest templates based on:
  - Script content (AI analysis)
  - Aspect ratio selected
  - Number of scenes

### 5. Template Variants
- Same template, different:
  - Animations
  - Colors
  - Spacing
  - Text positions

---

## 🚀 Quick Start Recommendation

**Start with:**
1. **3-5 Simple Templates** (hardcoded)
   - Split Screen
   - Centered
   - Grid (2x2)
   - Hero with Overlays
   - Minimal

2. **Template Selection in Modal**
   - Step 1: Template (optional)
   - Step 2: Script Prompt
   - Step 3: Aspect Ratio + Voice

3. **Sequential Media Mapping**
   - Fill slots in priority order
   - Simple but effective

4. **Visual Template Cards**
   - Thumbnail preview
   - Name + description
   - Slot count indicator

This gives you a working template system that can be enhanced later!

---

## ❓ Questions to Consider

1. **Template Storage**: Hardcoded vs Database?
2. **Template Scope**: Per-scene or global?
3. **Media Mapping**: Simple sequential or smart matching?
4. **Template Customization**: Allow users to edit templates?
5. **Template Marketplace**: Allow sharing templates?
6. **Fallback Behavior**: What if not enough media for template?

---

**Ready to implement?** Start with Phase 1 (Basic Templates) for a quick win! 🚀

