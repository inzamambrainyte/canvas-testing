# ElevenLabs Integration Guide

## ✅ Implementation Complete

I've added **ElevenLabs support** alongside OpenAI TTS. You can now choose which provider to use!

## 🎯 Quick Comparison

| Feature | OpenAI TTS | ElevenLabs |
|---------|-----------|------------|
| **Quality** | ⭐⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent |
| **Cost (Low Volume)** | $0.02/video | $5-22/month (flat) |
| **Cost (High Volume)** | $0.02/video | More expensive |
| **Voice Options** | 6 voices | 100+ voices |
| **Emotional Expression** | Limited | ⭐⭐⭐⭐⭐ Excellent |
| **Voice Cloning** | ❌ No | ✅ Yes |

## 📋 What's Been Added

### 1. ElevenLabs API Route
- **File**: `app/api/elevenlabs/text-to-speech/route.ts`
- Converts text to speech using ElevenLabs API
- Returns MP3 audio as base64
- Supports voice customization

### 2. Updated Store
- **File**: `store/editorStore.ts`
- Added `ttsProvider` parameter to `createNewProject`
- Automatically uses selected provider
- Defaults to OpenAI if not specified

### 3. Updated Types
- **File**: `lib/types.ts`
- `Voiceover` interface now includes `provider` field
- Supports both "openai" and "elevenlabs"

## 🚀 How to Use

### Option 1: Use OpenAI (Default)
```typescript
// No changes needed - uses OpenAI by default
await createNewProject(scenes, aspectRatio);
```

### Option 2: Use ElevenLabs
```typescript
// Pass "elevenlabs" as third parameter
await createNewProject(scenes, aspectRatio, "elevenlabs");
```

### Option 3: Make it Configurable in UI
Add a toggle in `GenerateScriptModal` to let users choose:
```typescript
const [ttsProvider, setTtsProvider] = useState<"openai" | "elevenlabs">("openai");

await createNewProject(scenes, aspectRatio, ttsProvider);
```

## 🔑 Setup Required

### For ElevenLabs:

1. **Get API Key:**
   - Sign up at [elevenlabs.io](https://elevenlabs.io)
   - Go to Profile → API Keys
   - Copy your API key

2. **Add to `.env`:**
   ```env
   ELEVENLABS_API_KEY=your_api_key_here
   ```

3. **Restart your dev server**

## 🎤 ElevenLabs Voice Options

**Popular Voices (Voice IDs):**
- `21m00Tcm4TlvDq8ikWAM` - **Rachel** (Professional female) - Default
- `pNInz6obpgDQGcFmaJgB` - **Adam** (Deep male)
- `EXAVITQu4vr4xnSDxMaL` - **Bella** (Soft female)
- `ErXwobaYiN019PkySvjV` - **Antoni** (Warm male)
- `MF3mGyEYCl7XYWbV9V6O` - **Elli** (Young female)
- `TxGEqnHWrfWFTfGW9XjX` - **Josh** (Calm male)

**Get More Voices:**
- Visit ElevenLabs voice library
- Copy voice ID
- Use in API call

## 💰 Cost Analysis

### ElevenLabs Pricing:
- **Free**: 10,000 credits/month (~10 minutes)
- **Starter ($5/month)**: 30,000 credits (~30 minutes)
- **Creator ($22/month)**: 100,000 credits (~100 minutes)
- **Pro ($99/month)**: 500,000 credits (~500 minutes)

### Cost Per Video (5 scenes, 250 words):
- **OpenAI**: $0.019 (pay per use)
- **ElevenLabs (Starter)**: $0.21* per video if over limit
- **ElevenLabs (Creator)**: $0.28* per video if over limit

*If within monthly limit, cost is $0 (flat rate)

## 🎯 Recommendation

**Use ElevenLabs if:**
- ✅ You need **premium quality** (client work, professional content)
- ✅ You have **low-medium volume** (< 100 videos/month)
- ✅ You want **emotional expression** in voice
- ✅ You need **voice cloning** features
- ✅ Budget allows $22-99/month

**Use OpenAI if:**
- ✅ You need **cost-effective** solution
- ✅ You have **high volume** (100+ videos/month)
- ✅ **Good quality** is sufficient
- ✅ You want **pay-per-use** pricing

## 🔧 Customization

### Change Default Voice (ElevenLabs):
Edit `store/editorStore.ts`:
```typescript
voice_id: "pNInz6obpgDQGcFmaJgB", // Change to any voice ID
```

### Change Voice Settings:
```typescript
stability: 0.5, // 0.0 to 1.0 (higher = more stable)
similarity_boost: 0.75, // 0.0 to 1.0 (higher = more similar to original)
```

## 📝 Next Steps

1. ✅ Add `ELEVENLABS_API_KEY` to `.env`
2. ✅ Test with a small script
3. ✅ Add UI toggle to choose provider (optional)
4. ✅ Compare quality between providers
5. ✅ Choose based on your needs

The implementation is **ready to use**! Just add your ElevenLabs API key and you can switch between providers.

