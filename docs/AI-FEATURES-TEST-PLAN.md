# AI Features End-to-End Test Plan
**Date:** February 10, 2026
**Phase:** 5 of Systematic QA Audit
**Status:** Ready for Testing

---

## Executive Summary

This document outlines comprehensive testing procedures for the two AI-powered features in EaseMail:
1. **AI Remix** - Polishes existing email drafts with AI
2. **AI Dictate** - Converts voice to polished email text

Both features were fixed in Phase 2 to properly insert HTML-formatted text into the TiptapEditor.

---

## 🎯 Features Under Test

### 1. AI Remix
**Location:** Email Composer → AI Remix button
**Purpose:** Polish existing email drafts using AI
**API Endpoint:** `POST /api/ai/remix`
**OpenAI Model:** gpt-4-turbo-preview

**Flow:**
```
User writes draft → Clicks "AI Remix" → Selects tone → AI polishes text →
Inserts HTML into composer + suggests subject
```

**Key Components:**
- `components/features/email-composer.tsx` - Frontend integration
- `app/api/ai/remix/route.ts` - API endpoint
- `lib/openai/client.ts` - OpenAI integration

### 2. AI Dictate
**Location:** Email Composer → AI Dictate button
**Purpose:** Voice-to-text with AI polishing
**API Endpoints:**
- `POST /api/ai/dictate` - Main endpoint
- Uses `/api/ai/remix` internally for polishing
**OpenAI Models:** whisper-1 (transcription) + gpt-4-turbo-preview (polishing)

**Flow:**
```
User clicks "AI Dictate" → Grants mic permission → Records voice →
Stops recording → Whisper transcribes → AI polishes →
Inserts HTML into composer
```

**Key Components:**
- `components/features/voice-input.tsx` - Voice recording UI
- `components/features/email-composer.tsx` - Integration
- `app/api/ai/dictate/route.ts` - API endpoint
- `lib/openai/client.ts` - OpenAI integration

---

## 🔧 Technical Implementation

### HTML Conversion Pattern (CRITICAL FIX)
Both features convert plain text to HTML before inserting into TiptapEditor:

```typescript
const convertToHTML = (text: string) => {
  // If text already contains HTML tags, return as is
  if (text.includes('<p>') || text.includes('<br>') || text.includes('<div>')) {
    return text;
  }
  // Convert line breaks to paragraphs
  return text
    .split('\n\n')
    .filter(para => para.trim())
    .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
    .join('');
};
```

**Why This Matters:**
- TiptapEditor requires HTML format
- AI returns plain text with `\n` line breaks
- Without conversion, text appears empty in composer

### Rate Limiting
Both endpoints use `RateLimitPresets.AI`:
- Prevents abuse of expensive OpenAI API calls
- Returns 429 status with retry-after header
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Usage Tracking
Both features log usage to `usage_tracking` table:
```typescript
await supabase.from('usage_tracking').insert({
  user_id: user.id,
  feature: 'ai_remix' | 'ai_dictate',
  metadata: { inputLength, tone },
});
```

---

## ✅ Test Cases

### Test Suite 1: AI Remix - Happy Path

#### Test 1.1: Basic Remix with Professional Tone
**Preconditions:**
- User is logged in
- Email composer is open
- Email body contains at least 10 characters

**Steps:**
1. Open email composer
2. Type in body: "hey can you send me that report we discussed yesterday thanks"
3. Click "AI Remix" button (sparkle icon)
4. Verify remix modal opens with 4 tone options
5. Select "Professional" tone
6. Click "Remix with professional tone"
7. Wait for loading state ("Remixing...")
8. Verify loading spinner shows

**Expected Results:**
- ✅ Body is replaced with polished professional text
- ✅ Text appears formatted in TiptapEditor (not empty)
- ✅ Subject field shows suggested subject
- ✅ Toast notification: "✨ Email remixed successfully!"
- ✅ Modal closes automatically
- ✅ Text contains HTML tags (`<p>`, `<br>`)
- ✅ Example output: "Could you please send me the report we discussed yesterday? Thank you!"

**API Response Expected:**
```json
{
  "original": "hey can you send me that report...",
  "remixed": "Could you please send me the report we discussed yesterday? Thank you!",
  "suggestedSubject": "Report Request",
  "tone": "professional"
}
```

---

#### Test 1.2: Remix with Friendly Tone
**Steps:**
1. Type: "I need the quarterly report by tomorrow morning"
2. Click "AI Remix"
3. Select "Friendly" tone
4. Click "Remix with friendly tone"

**Expected Results:**
- ✅ Body uses warm, friendly language
- ✅ Still professional but more personable
- ✅ Example: "Hi! I was hoping to get the quarterly report by tomorrow morning. Thanks so much!"

---

#### Test 1.3: Remix with Brief Tone
**Steps:**
1. Type long email: "I wanted to reach out to you regarding the upcoming project that we have been working on together. I think it would be beneficial if we could schedule a meeting to discuss the next steps and ensure we are all aligned on the goals and objectives..."
2. Click "AI Remix"
3. Select "Brief" tone
4. Click "Remix with brief tone"

**Expected Results:**
- ✅ Output is significantly shorter
- ✅ Gets to the point quickly
- ✅ Example: "Let's schedule a meeting to discuss next steps for the project."

---

#### Test 1.4: Remix with Detailed Tone
**Steps:**
1. Type short email: "Meeting tomorrow at 2pm"
2. Click "AI Remix"
3. Select "Detailed" tone
4. Click "Remix with detailed tone"

**Expected Results:**
- ✅ Output is expanded with more context
- ✅ More comprehensive information
- ✅ Example: "I wanted to confirm that we have a meeting scheduled for tomorrow at 2:00 PM. Please let me know if this time still works for you, and if you need any materials prepared in advance."

---

### Test Suite 2: AI Remix - Edge Cases

#### Test 2.1: Empty Body
**Steps:**
1. Open composer with empty body
2. Click "AI Remix"

**Expected Results:**
- ✅ Toast error: "Please write at least 10 characters to remix"
- ✅ Modal does NOT open
- ✅ No API call made

---

#### Test 2.2: Body Less Than 10 Characters
**Steps:**
1. Type: "hi there"
2. Click "AI Remix"

**Expected Results:**
- ✅ Toast error: "Please write at least 10 characters to remix"
- ✅ Modal does NOT open

---

#### Test 2.3: Rate Limiting
**Steps:**
1. Perform AI Remix 20+ times rapidly
2. Observe 429 response

**Expected Results:**
- ✅ Toast error: "Rate limit exceeded. Too many AI requests. Please try again in X seconds."
- ✅ Response includes retry-after information
- ✅ User can retry after cooldown period

---

#### Test 2.4: Unauthenticated User
**Steps:**
1. Log out
2. Try to access `/api/ai/remix` directly

**Expected Results:**
- ✅ 401 Unauthorized response
- ✅ Error: "Unauthorized"

---

#### Test 2.5: OpenAI API Failure
**Simulation:** Temporarily set invalid OPENAI_API_KEY
**Expected Results:**
- ✅ 500 Internal Server Error
- ✅ Toast error: "Failed to remix email"
- ✅ Error logged to console
- ✅ Composer state unchanged

---

### Test Suite 3: AI Dictate - Happy Path

#### Test 3.1: Basic Voice Recording with Professional Tone
**Preconditions:**
- Microphone connected
- Browser has mic permission
- User is logged in

**Steps:**
1. Open email composer
2. Click "AI Dictate" button (microphone icon)
3. If first time, grant microphone permission
4. Observe tooltip: "Speak naturally and AI will write a perfect email"
5. Verify button changes to "Stop Recording" (red, pulsing)
6. Speak clearly: "I wanted to follow up on our conversation about the new marketing campaign. Can we schedule a call this week to discuss the timeline?"
7. Click "Stop Recording"
8. Observe "Processing..." state
9. Wait for API response

**Expected Results:**
- ✅ Permission modal appears (first time only)
- ✅ Recording starts successfully
- ✅ Toast: "🎤 Recording... Speak naturally!"
- ✅ Button shows pulsing red "Stop Recording"
- ✅ After stopping, shows "Processing..."
- ✅ Body populated with polished, HTML-formatted text
- ✅ Toast: "🎤 Voice message transcribed and polished!"
- ✅ Text appears in TiptapEditor (not empty)
- ✅ Microphone stream stops (no red recording indicator in browser)

**API Response Expected:**
```json
{
  "transcript": "I wanted to follow up on our conversation about the new marketing campaign. Can we schedule a call this week to discuss the timeline?",
  "polished": "I wanted to follow up on our conversation about the new marketing campaign. Could we schedule a call this week to discuss the timeline? Thank you!",
  "suggestedSubject": "Marketing Campaign Follow-up",
  "tone": "professional"
}
```

---

#### Test 3.2: Voice Recording with Friendly Tone
**Steps:**
1. Set tone dropdown to "Friendly" in composer
2. Click "AI Dictate"
3. Speak: "Need the budget numbers"
4. Stop recording

**Expected Results:**
- ✅ Output uses friendly, warm tone
- ✅ Example: "Hi! Could you send over the budget numbers when you get a chance? Thanks!"

---

### Test Suite 4: AI Dictate - Edge Cases

#### Test 4.1: Microphone Permission Denied
**Steps:**
1. Click "AI Dictate"
2. Deny microphone permission in browser prompt

**Expected Results:**
- ✅ Red error banner: "Microphone access denied"
- ✅ Instructions: "Please enable microphone in your browser settings"
- ✅ No recording starts
- ✅ No API call made

---

#### Test 4.2: Microphone Permission Requested State
**Steps:**
1. Click "AI Dictate" for first time
2. Observe permission request modal (don't click yet)

**Expected Results:**
- ✅ Blue banner: "Requesting microphone access..."
- ✅ Tooltip: "This is only needed once. Please allow when prompted."
- ✅ Loading spinner shown
- ✅ No recording yet

---

#### Test 4.3: No Audio File Sent
**Simulation:** API call without audio file
**Expected Results:**
- ✅ 400 Bad Request
- ✅ Error: "No audio file provided"

---

#### Test 4.4: Recording Less Than 1 Second
**Steps:**
1. Click "AI Dictate"
2. Immediately click "Stop Recording"

**Expected Results:**
- ✅ Still processes (may transcribe nothing)
- ✅ Graceful handling
- ✅ Either empty result or error toast

---

#### Test 4.5: Browser Doesn't Support MediaRecorder
**Simulation:** Test in very old browser
**Expected Results:**
- ✅ Feature degrades gracefully
- ✅ Button disabled or hidden
- ✅ Error message if clicked

---

### Test Suite 5: Integration Tests

#### Test 5.1: AI Remix Preserves Subject Change
**Steps:**
1. Type body and subject
2. AI Remix the body
3. Accept suggested subject

**Expected Results:**
- ✅ Body updated with remixed text
- ✅ Subject updated with suggestion
- ✅ Both fields properly formatted

---

#### Test 5.2: AI Dictate Replaces Existing Body
**Steps:**
1. Type some text in body
2. Use AI Dictate
3. Speak something different

**Expected Results:**
- ✅ Original body is REPLACED (not appended)
- ✅ New text from dictation appears
- ✅ Old text is gone

---

#### Test 5.3: Multiple Remixes in Sequence
**Steps:**
1. Type draft
2. AI Remix with Professional
3. AI Remix result with Friendly
4. AI Remix again with Brief

**Expected Results:**
- ✅ Each remix processes the current body text
- ✅ Multiple remixes work without errors
- ✅ Usage tracked for each operation

---

#### Test 5.4: Remix Then Dictate
**Steps:**
1. Type draft
2. AI Remix
3. Then use AI Dictate

**Expected Results:**
- ✅ Dictation REPLACES remixed text
- ✅ No conflicts between features

---

#### Test 5.5: Send Email After AI Features
**Steps:**
1. Use AI Dictate to create email body
2. Accept suggested subject
3. Add recipient
4. Click Send

**Expected Results:**
- ✅ Email sends successfully
- ✅ Recipient receives HTML-formatted email
- ✅ No formatting issues
- ✅ No empty body

---

### Test Suite 6: Usage Tracking

#### Test 6.1: AI Remix Usage Logged
**Steps:**
1. Perform AI Remix
2. Check database `usage_tracking` table

**Expected Query:**
```sql
SELECT * FROM usage_tracking
WHERE user_id = '<current_user_id>'
AND feature = 'ai_remix'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Results:**
- ✅ Row exists with correct user_id
- ✅ Feature = 'ai_remix'
- ✅ Metadata includes: { inputLength, tone }
- ✅ created_at is recent timestamp

---

#### Test 6.2: AI Dictate Usage Logged
**Steps:**
1. Perform AI Dictate
2. Check database

**Expected Results:**
- ✅ Row exists with feature = 'ai_dictate'
- ✅ Metadata includes: { transcriptLength, tone }

---

## 🔍 Manual Testing Checklist

### Environment Setup
- [ ] Running on localhost:3000
- [ ] User authenticated and logged in
- [ ] OPENAI_API_KEY environment variable set
- [ ] Internet connection active
- [ ] Microphone available (for dictate tests)
- [ ] Browser: Chrome/Firefox/Safari latest version

### AI Remix Tests
- [ ] Test 1.1: Professional tone remix works
- [ ] Test 1.2: Friendly tone remix works
- [ ] Test 1.3: Brief tone remix works
- [ ] Test 1.4: Detailed tone remix works
- [ ] Test 2.1: Empty body validation works
- [ ] Test 2.2: <10 chars validation works
- [ ] HTML conversion working (text visible in editor)
- [ ] Subject suggestion appears
- [ ] Modal closes after remix
- [ ] Loading states display correctly
- [ ] Error handling works

### AI Dictate Tests
- [ ] Test 3.1: Basic recording and transcription works
- [ ] Test 3.2: Friendly tone dictation works
- [ ] Test 4.1: Permission denied handling works
- [ ] Test 4.2: Permission requesting state shows
- [ ] Recording button states change correctly
- [ ] Microphone stream stops after recording
- [ ] HTML conversion working (text visible in editor)
- [ ] Processing state shows
- [ ] Toast notifications appear
- [ ] Error handling works

### Integration Tests
- [ ] Multiple remixes work
- [ ] Remix then dictate works
- [ ] Dictate then send email works
- [ ] Usage tracking for both features
- [ ] Rate limiting prevents abuse

---

## 🐛 Known Issues & Fixes

### Issue 1: AI Generated Text Not Appearing (FIXED ✅)
**Problem:** AI Remix and AI Dictate returned text, but composer stayed empty
**Root Cause:** TiptapEditor expects HTML, AI returned plain text
**Fix:** Added `convertToHTML()` helper in both features
**Files Changed:**
- `components/features/email-composer.tsx:508-520` (AI Remix)
- `components/features/email-composer.tsx:1036-1048` (AI Dictate integration)
- `app/api/ai/dictate/route.ts:50` (return polished.body instead of polished)

**Verification:**
```typescript
// AI Remix - email-composer.tsx:508
if (data.remixed) {
  const convertToHTML = (text: string) => {
    if (text.includes('<p>') || text.includes('<br>') || text.includes('<div>')) {
      return text;
    }
    return text
      .split('\n\n')
      .filter(para => para.trim())
      .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
      .join('');
  };
  const htmlBody = convertToHTML(data.remixed);
  setBody(htmlBody);
}

// AI Dictate - voice-input.tsx:78
if (data.polished) {
  onTranscript(data.polished); // Conversion happens in parent
  toast.success('🎤 Voice message transcribed and polished!');
}
```

---

## 📊 Success Criteria

### All Tests Must Pass:
- ✅ AI Remix works with all 4 tones
- ✅ AI Dictate records, transcribes, and polishes correctly
- ✅ HTML conversion makes text visible in TiptapEditor
- ✅ Subject suggestions appear
- ✅ Error handling prevents crashes
- ✅ Rate limiting protects API
- ✅ Usage tracking logs all operations
- ✅ Microphone permissions handled gracefully
- ✅ Integration with email sending works

### Performance Criteria:
- AI Remix response time: < 5 seconds
- AI Dictate transcription: < 10 seconds for 30s audio
- No memory leaks from audio recording
- Browser doesn't freeze during processing

### User Experience Criteria:
- Clear loading states throughout
- Helpful error messages
- Smooth transitions between states
- No unexpected behavior
- Features feel reliable and professional

---

## 🚀 Deployment Verification

### Production Checklist:
- [ ] OPENAI_API_KEY set in production environment
- [ ] Rate limiting configured appropriately
- [ ] Usage tracking working in production database
- [ ] No console errors in browser
- [ ] AI features appear in composer UI
- [ ] Test on production with real account
- [ ] Verify OpenAI API costs are acceptable
- [ ] Monitor error rates in production logs

---

## 📝 Test Results Log Template

```
Test Date: [DATE]
Tester: [NAME]
Environment: [localhost / production]
Browser: [Chrome / Firefox / Safari + version]

AI REMIX:
✅ / ❌ Professional tone
✅ / ❌ Friendly tone
✅ / ❌ Brief tone
✅ / ❌ Detailed tone
✅ / ❌ HTML conversion
✅ / ❌ Subject suggestion
✅ / ❌ Error handling
Notes: [Any issues or observations]

AI DICTATE:
✅ / ❌ Recording functionality
✅ / ❌ Transcription accuracy
✅ / ❌ AI polishing
✅ / ❌ HTML conversion
✅ / ❌ Mic permission handling
✅ / ❌ Error handling
Notes: [Any issues or observations]

OVERALL RESULT: PASS / FAIL
```

---

## 🔗 Related Documentation

- **Error Handling Audit:** `docs/ERROR-HANDLING-AUDIT-REPORT.md`
- **Session Summary:** `docs/SESSION-SUMMARY-QA-AUDIT.md`
- **Database Security:** `docs/DATABASE-SECURITY-AUDIT-FINDINGS.md`

---

**Generated:** February 10, 2026
**Phase:** 5 of 6 (AI Features E2E Testing)
**Next Phase:** Automated E2E Test Suite Creation

🤖 Generated with [Claude Code](https://claude.com/claude-code)
