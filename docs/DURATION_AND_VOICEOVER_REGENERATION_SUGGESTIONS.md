# Duration Mismatch & Voiceover Regeneration Suggestions

## Problem Analysis

### Issue 1: Script Duration vs Voiceover Duration Mismatch

**Current Situation:**
1. **Script Generation** (OpenAI):
   - Returns `duration` field (3-10 seconds) - **estimated** by AI
   - This is a suggestion, not based on actual audio length

2. **Voiceover Generation**:
   - **OpenAI TTS**: Calculates duration as `(wordCount / 150) * 60` seconds
   - **ElevenLabs TTS**: Calculates duration as `characterCount / 1000` seconds
   - These are **estimates**, not actual audio file duration

3. **Scene Duration**:
   - Currently uses `scene.duration` from script generation
   - But `voiceover.duration` might be different
   - PFV modal uses `scene.duration` for timing, causing sync issues

**Root Cause:**
- Script duration is an AI estimate (not based on actual speech)
- Voiceover duration is calculated from text (word/character count)
- These two calculations don't match
- Actual audio file duration might differ from both estimates

### Issue 2: Regenerating Voiceover After Script Changes

**Current Situation:**
- `updateSceneScript()` only updates the script text
- No way to regenerate voiceover when script changes
- User has to regenerate entire project to get new voiceover

---

## 💡 **Suggested Solutions**

### Solution 1: Use Actual Audio Duration (Recommended)

**Approach:** Get the actual duration from the audio file after generation, then update scene duration.

#### Implementation Steps:

1. **Get Actual Audio Duration**:
   ```typescript
   // After TTS generation, load audio and get actual duration
   const getAudioDuration = (audioUrl: string): Promise<number> => {
     return new Promise((resolve) => {
       const audio = new Audio(audioUrl);
       audio.addEventListener('loadedmetadata', () => {
         resolve(audio.duration);
       });
       audio.load();
     });
   };
   ```

2. **Update Scene Duration**:
   - After voiceover generation, get actual audio duration
   - Update `scene.duration` to match `voiceover.duration`
   - This ensures scene duration = actual voiceover duration

3. **Backend Enhancement**:
   - Modify TTS services to return actual audio duration
   - Or calculate it server-side after generating audio

**Pros:**
- ✅ Most accurate
- ✅ Scene duration matches actual playback time
- ✅ PFV modal will sync correctly

**Cons:**
- ⚠️ Requires loading audio file (small overhead)
- ⚠️ Need to handle async duration calculation

---

### Solution 2: Calculate Duration from Script Text (Alternative)

**Approach:** Calculate scene duration from script text using same formula as voiceover.

#### Implementation Steps:

1. **Create Duration Calculator**:
   ```typescript
   const calculateDurationFromText = (
     text: string, 
     provider: "openai" | "elevenlabs"
   ): number => {
     if (provider === "openai") {
       const wordCount = text.split(/\s+/).length;
       return (wordCount / 150) * 60; // ~150 words per minute
     } else {
       // ElevenLabs
       return text.length / 1000; // ~1000 chars per second
     }
   };
   ```

2. **Update Script Generation**:
   - After generating script, calculate duration from script text
   - Use calculated duration instead of AI estimate
   - Or: Calculate duration when generating voiceover and update scene

3. **Update Scene Duration**:
   - When voiceover is generated, calculate duration from script
   - Update `scene.duration` to match calculated duration

**Pros:**
- ✅ No need to load audio file
- ✅ Fast calculation
- ✅ Consistent with voiceover duration calculation

**Cons:**
- ⚠️ Still an estimate (not actual audio duration)
- ⚠️ May differ from actual audio file duration

---

### Solution 3: Hybrid Approach (Best of Both)

**Approach:** Use calculated duration initially, then update with actual duration when available.

#### Implementation Steps:

1. **Initial Duration**: Calculate from script text (fast)
2. **After Voiceover**: Get actual audio duration (accurate)
3. **Update Scene**: Update `scene.duration` with actual duration

**Pros:**
- ✅ Fast initial calculation
- ✅ Accurate final duration
- ✅ Best user experience

**Cons:**
- ⚠️ Slightly more complex implementation

---

## 🔄 **Voiceover Regeneration Solution**

### Suggested Implementation:

#### 1. Add `regenerateVoiceover` Function to Store

```typescript
// In editorStore.ts
regenerateVoiceover: async (
  sceneId: string,
  ttsProvider?: "openai" | "elevenlabs"
) => Promise<void>;
```

#### 2. Implementation Logic:

```typescript
regenerateVoiceover: async (sceneId, ttsProvider = "openai") => {
  const scene = get().scenes.find(s => s.id === sceneId);
  if (!scene || !scene.script) return;

  try {
    // 1. Generate new voiceover
    const ttsResult = await apiClient.generateTTS({
      text: scene.script,
      provider: ttsProvider,
      // ... voice settings
    });

    // 2. Get actual audio duration
    const actualDuration = await getAudioDuration(ttsResult.audioUrl);

    // 3. Update voiceover in scene
    // 4. Update voiceover audio element
    // 5. Update scene duration to match voiceover
    // 6. Update captions if needed

    set((state) => ({
      scenes: state.scenes.map(s =>
        s.id === sceneId
          ? {
              ...s,
              voiceover: {
                audioUrl: ttsResult.audioUrl,
                duration: actualDuration,
                voice: ttsResult.voice,
                model: ttsResult.model,
                provider: ttsProvider,
              },
              duration: actualDuration, // Update scene duration
              // Update voiceover audio element
              elements: s.elements.map(el =>
                el.type === "audio" && el.label === "Voiceover"
                  ? { ...el, assetUrl: ttsResult.audioUrl }
                  : el
              ),
              // Update captions
              captions: [{
                id: `caption-${sceneId}-0`,
                text: scene.script,
                startTime: 0,
                endTime: actualDuration,
              }],
            }
          : s
      ),
    }));
  } catch (error) {
    console.error("Error regenerating voiceover:", error);
    throw error;
  }
}
```

#### 3. UI Integration:

**Option A: Auto-Regenerate Button**
- Add "Regenerate Voiceover" button in SceneItem when script is edited
- Show loading state during regeneration
- Update UI after completion

**Option B: Auto-Regenerate on Script Change**
- Automatically regenerate when script changes (with debounce)
- Show notification/toast when complete
- Allow user to cancel if needed

**Option C: Manual Regenerate Button**
- Add button in SceneItem or toolbar
- User clicks to regenerate
- Show confirmation if voiceover already exists

**Recommendation:** **Option C (Manual)** - Gives user control, prevents unnecessary API calls

---

## 📋 **Recommended Implementation Plan**

### Phase 1: Fix Duration Mismatch

1. **Add Audio Duration Helper**:
   ```typescript
   // lib/utils/audio.ts
   export const getAudioDuration = (audioUrl: string): Promise<number> => {
     return new Promise((resolve, reject) => {
       const audio = new Audio(audioUrl);
       audio.addEventListener('loadedmetadata', () => {
         resolve(audio.duration);
       });
       audio.addEventListener('error', reject);
       audio.src = audioUrl;
     });
   };
   ```

2. **Update TTS Services** (Backend):
   - After generating audio, calculate actual duration
   - Return actual duration in response
   - Or: Frontend calculates after receiving audio

3. **Update `createNewProject`**:
   - After voiceover generation, get actual duration
   - Update `scene.duration` = `voiceover.duration`
   - Ensure scene duration matches actual audio

4. **Update PFV Modal**:
   - Use `voiceover.duration` if available, fallback to `scene.duration`
   - This ensures accurate timing

### Phase 2: Add Voiceover Regeneration

1. **Add Store Function**:
   - `regenerateVoiceover(sceneId, ttsProvider?)`
   - Handles regeneration logic
   - Updates scene, elements, captions

2. **Add UI Component**:
   - "Regenerate Voiceover" button in SceneItem
   - Show when script exists and voiceover exists
   - Loading state during regeneration

3. **Update SceneItem**:
   - Add regenerate button
   - Handle click event
   - Show success/error feedback

4. **Optional: Add to Toolbar**:
   - Add regenerate button to canvas toolbar
   - Only show when scene has script

---

## 🎯 **Specific Code Changes Needed**

### 1. Update `store/editorStore.ts`

```typescript
// Add helper function
const getAudioDuration = (audioUrl: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio(audioUrl);
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
    });
    audio.addEventListener('error', reject);
    audio.src = audioUrl;
  });
};

// Add to EditorStore type
regenerateVoiceover: (
  sceneId: string,
  ttsProvider?: "openai" | "elevenlabs"
) => Promise<void>;

// Update createNewProject to use actual duration
// After voiceover generation:
const actualDuration = await getAudioDuration(ttsResult.audioUrl);
sceneVoiceover = {
  ...sceneVoiceover,
  duration: actualDuration,
};
// Update scene duration
scene.duration = actualDuration;
```

### 2. Update `components/editor/SceneItem.tsx`

```typescript
// Add regenerate button
{scene.script && scene.voiceover && (
  <button
    onClick={async () => {
      try {
        await regenerateVoiceover(scene.id);
        // Show success message
      } catch (error) {
        // Show error message
      }
    }}
    className="..."
  >
    Regenerate Voiceover
  </button>
)}
```

### 3. Update Backend TTS Services (Optional)

```typescript
// In openai.service.ts and elevenlabs.service.ts
// After generating audio, calculate actual duration
// Return in response
```

---

## 🔍 **Edge Cases to Handle**

1. **Script Too Long/Short**:
   - If calculated duration < 3 seconds: Set minimum to 3
   - If calculated duration > 30 seconds: Warn user or split

2. **Audio Loading Failure**:
   - Fallback to calculated duration
   - Show warning to user

3. **Regeneration During Playback**:
   - Stop current playback
   - Regenerate
   - Resume if needed

4. **Multiple Scenes**:
   - Regenerate one scene at a time
   - Show progress for batch operations

5. **Network Errors**:
   - Retry mechanism
   - Show error message
   - Allow manual retry

---

## ✅ **Recommended Approach**

### For Duration Mismatch:
1. **Use Solution 3 (Hybrid)**:
   - Calculate initial duration from text (fast)
   - Get actual audio duration after generation (accurate)
   - Update scene duration to match actual

### For Voiceover Regeneration:
1. **Manual Regenerate Button**:
   - Add button in SceneItem
   - User clicks to regenerate
   - Show loading/success/error states
   - Update scene duration automatically

2. **Optional: Auto-Detect Changes**:
   - Detect when script changes
   - Show notification: "Script changed. Regenerate voiceover?"
   - User can click to regenerate

---

## 📊 **Benefits**

1. **Accurate Timing**:
   - Scene duration matches actual voiceover
   - PFV modal syncs correctly
   - No timing mismatches

2. **User Control**:
   - User can regenerate voiceover when needed
   - No need to regenerate entire project
   - Faster iteration

3. **Better UX**:
   - Clear feedback during regeneration
   - Accurate duration display
   - Smooth playback experience

---

## 🚀 **Implementation Priority**

1. **High Priority**: Fix duration mismatch (Solution 3)
2. **High Priority**: Add regenerate voiceover function
3. **Medium Priority**: Add UI for regeneration
4. **Low Priority**: Auto-detect script changes

---

This approach will solve both issues and provide a better user experience!


