# Custom Folders Diagnosis

## Summary of Investigation

I investigated the custom folder sync and message loading issue. Here's what I found:

### ✅ What's Working:

1. **Custom folders ARE synced** to database
   - Found 44 custom folders in `folder_mappings` table
   - Folders like "Banner Buzz" (814 messages), "Chris Scottsdale" (228 messages), etc.

2. **Nylas API returns ALL folders**
   - `/api/folders` endpoint returns all 50 folders (including custom)
   - Tested directly with Nylas SDK - confirmed

3. **Sidebar shows custom folders**
   - Code at `components/layout/app-sidebar.tsx` lines 362-405
   - Displays folders with unread counts
   - Creates links: `/app/inbox?folder={folderId}&accountId={accountId}`

4. **Inbox page handles folder parameter**
   - Code at `app/(app)/app/inbox/page.tsx` lines 44-51
   - Reads `folder` from URL query params
   - Passes to messages API

5. **Messages API accepts folder parameter**
   - Code at `app/api/messages/route.ts` lines 62-106
   - Uses `resolveFolderFilter()` to handle folder IDs
   - Passes to Nylas API via `in` parameter

### 🔍 Potential Issues:

**Issue #1: Folder ID Format Mismatch**
- Sidebar passes `folder.id` from Nylas API response
- This should be the Nylas folder ID (long base64 string)
- `resolveFolderFilter()` handles long IDs (>20 chars) correctly
- **Should work**, but needs verification

**Issue #2: Messages API Defaults to Inbox**
- Line 63: `const folderFilter = folderId || 'inbox'`
- If no folder param, defaults to inbox only
- Users must click on custom folders to see messages

**Issue #3: UI/UX Confusion**
- Users might not realize they need to click individual folders
- No "All Mail" view that shows messages from all folders
- Custom folders might not be visually distinct from system folders

## 🧪 Test Plan

To verify custom folders are working:

1. **Check browser console** when clicking a custom folder:
   ```
   - Look for: "Filtering messages by folder/filter: {folderId}"
   - Look for: "Resolved to Nylas folder IDs: [...]"
   - Look for: "Fetching messages from: /api/messages?..."
   ```

2. **Check Network tab**:
   - Click custom folder
   - Check if API call includes `?folder={longFolderId}`
   - Check response - should have messages array

3. **Check if folders show in sidebar**:
   - Look for "Folders (N)" section
   - Should show all custom folders with counts

## 💡 Recommendations

### Quick Fix Options:

**Option A: Verify It's Already Working**
- Custom folders might already work
- User may need to click on individual folders to see messages
- Check if folders are visible in sidebar

**Option B: Add "All Folders" View**
- Create endpoint to load messages from ALL folders
- Add UI toggle to switch between inbox-only and all-mail view

**Option C: Improve Folder Display**
- Make custom folders more prominent
- Add folder icons/colors
- Show message counts on hover

## 📝 Next Steps

1. Ask user to click on a custom folder and check if messages load
2. If not working, check browser console for errors
3. If working, improve UX to make it more obvious

## 🔧 Code Locations

- **Sidebar folder display**: `components/layout/app-sidebar.tsx:362-405`
- **Folders API**: `app/api/folders/route.ts:52-72`
- **Messages API folder handling**: `app/api/messages/route.ts:62-106`
- **Folder resolution logic**: `lib/nylas/folder-utils.ts:226-238`
- **Inbox page folder param**: `app/(app)/app/inbox/page.tsx:44-51`
