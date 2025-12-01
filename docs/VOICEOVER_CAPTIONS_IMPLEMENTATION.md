# VoiceOver & Captions Implementation Guide

## API Comparison: OpenAI TTS vs Google Cloud TTS

### OpenAI TTS (Recommended for Your Use Case) ✅

**Pros:**

- ✅ **Already using OpenAI** - Single API key, unified billing
- ✅ **Simple integration** - RESTful API, easy to use
- ✅ **Good quality** - Natural-sounding voices (tts-1, tts-1-hd)
- ✅ **Fast** - Low latency
- ✅ **Cost-effective** - $15 per 1M characters (~$0.015 per 1K characters)
- ✅ **Multiple voices** - 6 voices (alloy, echo, fable, onyx, nova, shimmer)
- ✅ **SSML support** - For pronunciation control

**Cons:**

- ❌ Limited voice options (6 voices)
- ❌ Less customization compared to Google
- ❌ No custom voice training

**Pricing:**

- `tts-1`: $15 per 1M characters
- `tts-1-hd`: $30 per 1M characters (higher quality)

### Google Cloud Text-to-Speech

**Pros:**

- ✅ **More voices** - 220+ voices across 40+ languages
- ✅ **Very high quality** - WaveNet neural voices
- ✅ **Advanced features** - Custom voice training, SSML
- ✅ **Better for multilingual** - Extensive language support

**Cons:**

- ❌ **Separate API key** - Additional setup
- ❌ **More complex** - Requires Google Cloud account setup
- ❌ **Slightly more expensive** - $16 per 1M characters (Standard), $160 per 1M (WaveNet)
- ❌ **More setup overhead** - Service account, authentication

**Pricing:**

- Standard voices: $16 per 1M characters
- WaveNet voices: $160 per 1M characters
- Neural2 voices: $160 per 1M characters

## Recommendation: **OpenAI TTS** 🎯

**Why OpenAI TTS is better for your project:**

1. You're already using OpenAI for script generation
2. Simpler integration (same API key)
3. Good enough quality for most use cases
4. Lower cost for standard quality
5. Faster implementation
6. Easier to maintain (one API provider)

**When to use Google Cloud TTS:**

- Need 220+ voice options
- Require custom voice training
- Need multilingual support (40+ languages)
- Budget allows for premium quality

## Implementation Architecture

### 1. Data Structure Updates

Add to `lib/types.ts`:

```typescript
export interface Scene {
  // ... existing fields
  voiceover?: {
    audioUrl: string;
    duration: number;
    voice: string; // OpenAI voice ID
  };
  captions?: Caption[];
}

export interface Caption {
  id: string;
  text: string;
  startTime: number; // seconds
  endTime: number; // seconds
  x: number;
  y: number;
  style?: {
    fontSize?: number;
    fontFamily?: string;
    fill?: string;
    backgroundColor?: string;
    padding?: number;
  };
}
```

### 2. API Route: `/app/api/openai/text-to-speech/route.ts`

Create a new API route for TTS:

- Accepts: `text`, `voice`, `model` (tts-1 or tts-1-hd)
- Returns: Audio file (MP3) as blob or base64
- Stores temporarily or uploads to storage

### 3. Caption Generation

Two approaches:

- **Option A**: Generate captions from script text (word-by-word timing)
- **Option B**: Simple approach - One caption per scene (matches scene duration)

### 4. Integration Flow

When `createNewProject` is called:

1. For each scene:
   - Generate audio using OpenAI TTS API
   - Create audio element on canvas (hidden or visible)
   - Generate caption text element
   - Position caption at bottom center
   - Sync timing with scene duration

## Implementation Steps

### Step 1: Create TTS API Route

- File: `app/api/openai/text-to-speech/route.ts`
- Function: Convert script text to audio
- Return: Audio blob URL or base64

### Step 2: Update Script Generation

- Modify `createNewProject` in `store/editorStore.ts`
- After fetching images, generate voiceover for each scene
- Create audio and caption elements

### Step 3: Caption Styling

- Default: Bottom center, semi-transparent background
- Customizable: Font, size, color, position
- Animation: Fade in/out with voiceover

### Step 4: Playback Integration

- In PFV modal: Play voiceover when scene starts
- Sync captions with audio playback
- Show/hide captions based on timing

## Cost Estimation

**Example:** 5 scenes, 50 words per scene (250 words total)

- OpenAI TTS: ~1,250 characters = **$0.019** (very cheap!)
- Google Cloud (Standard): ~1,250 characters = **$0.020**
- Google Cloud (WaveNet): ~1,250 characters = **$0.20**

For 100 videos/month: OpenAI = ~$2, Google WaveNet = ~$20

## Next Steps

1. ✅ Create OpenAI TTS API route
2. ✅ Update types to include voiceover/captions
3. ✅ Modify `createNewProject` to generate audio
4. ✅ Add caption elements to canvas
5. ✅ Integrate playback in PFV modal
6. ✅ Add caption controls (show/hide, style)
