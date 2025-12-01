# How to Use TTS Providers (OpenAI & ElevenLabs)

## 🎯 Quick Guide

### Where to Select TTS Provider

**Location:** Generate Script Modal → Step 1

When you click "Generate Script" from the AI modal, you'll see:

1. **Aspect Ratio** selection (16:9, 9:16, 1:1)
2. **Voice Provider** selection (NEW!) ← **Here's where you choose!**
3. **Script Prompt** textarea

### Visual Guide

```
┌─────────────────────────────────────┐
│  Generate Script Modal              │
├─────────────────────────────────────┤
│                                     │
│  Aspect Ratio:                      │
│  [16:9] [9:16] [1:1]                │
│                                     │
│  Voice Provider:                    │
│  ┌─────────────┐ ┌─────────────┐   │
│  │ 🤖 OpenAI   │ │ 🔊 ElevenLabs│   │
│  │ Cost-effective│ │ Premium quality│ │
│  └─────────────┘ └─────────────┘   │
│                                     │
│  Script Prompt:                     │
│  [Text area...]                     │
│                                     │
│  [Cancel] [Generate]                 │
└─────────────────────────────────────┘
```

## 📋 Step-by-Step Instructions

### Step 1: Open Generate Script Modal
1. Click the **"AI"** button in the Scenes Panel (left sidebar)
2. Click **"Generate Script"** card in the AI Modal

### Step 2: Select Voice Provider
In Step 1 of the modal, you'll see two cards:

**OpenAI Card:**
- Icon: Sparkles (✨)
- Description: "Cost-effective, good quality"
- Color: Purple/Pink gradient

**ElevenLabs Card:**
- Icon: Volume (🔊)
- Description: "Premium quality, natural voices"
- Color: Blue/Cyan gradient

**Click on the card** to select your preferred provider.

### Step 3: Fill in Details
1. Select **Aspect Ratio** (16:9, 9:16, or 1:1)
2. Select **Voice Provider** (OpenAI or ElevenLabs)
3. Enter your **Script Prompt**
4. Click **"Generate"**

### Step 4: Confirm Scenes
- Review generated scenes in Step 2
- Click **"Add to Editor"**
- Voiceover and captions will be generated using your selected provider!

## 🔧 Setup Requirements

### For OpenAI (Default - No Setup Needed)
- ✅ Already configured if you have `OPENAI_API_KEY` in `.env`
- ✅ Uses the same API key as script generation

### For ElevenLabs (Requires Setup)
1. **Sign up** at [elevenlabs.io](https://elevenlabs.io)
2. **Get API Key:**
   - Go to Profile → API Keys
   - Copy your API key
3. **Add to `.env`:**
   ```env
   ELEVENLABS_API_KEY=your_api_key_here
   ```
4. **Restart dev server**

## 💡 Visual Indicators

### Selected Provider
- ✅ **Checkmark icon** appears on selected card
- ✅ **Border** changes to brand color (purple)
- ✅ **Background** gets gradient overlay

### ElevenLabs Warning
If you select ElevenLabs, you'll see a blue info box:
```
💡 Make sure ELEVENLABS_API_KEY is set in your .env file
```

## 🎤 What Happens After Selection

When you click "Add to Editor":

1. ✅ Scripts are generated (existing)
2. ✅ Images are fetched (existing)
3. ✅ **Voiceover audio is generated** using selected provider
4. ✅ **Caption text is added** to canvas
5. ✅ **Audio element is added** to canvas

## 🔄 Changing Provider

You can change the provider **before** clicking "Generate":
- Just click the other provider card
- Selection updates immediately
- No need to restart or reload

## 📊 Provider Comparison in UI

The cards show:
- **Provider name** (OpenAI / ElevenLabs)
- **Description** (Cost-effective vs Premium)
- **Icon** (Visual identifier)
- **Selected state** (Checkmark + highlighted border)

## ⚠️ Troubleshooting

### "Failed to generate speech" Error

**For ElevenLabs:**
- Check if `ELEVENLABS_API_KEY` is in `.env`
- Verify API key is valid
- Check your ElevenLabs account credits
- Restart dev server after adding key

**For OpenAI:**
- Check if `OPENAI_API_KEY` is in `.env`
- Verify API key is valid
- Check OpenAI account balance

### Provider Not Showing
- Make sure you're in **Step 1** of the Generate Script modal
- The Voice Provider section appears **between** Aspect Ratio and Script Prompt

## 🎯 Default Behavior

- **Default Provider:** OpenAI
- **Resets to OpenAI** when modal closes
- **Remembers selection** during the same session

## 📝 Code Reference

The selection is stored in:
```typescript
const [selectedTTSProvider, setSelectedTTSProvider] = useState<"openai" | "elevenlabs">("openai");
```

And passed to:
```typescript
await createNewProject(scenes, aspectRatio, selectedTTSProvider);
```

