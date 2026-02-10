# Recepty App - Project Plan

## Vision
Personal recipe collection with AI-powered import. **"User does minimum, AI does maximum."**

---

## Current State (What We Have)

### Tech Stack
- **Frontend**: Vanilla HTML/CSS/JS, ES6 modules
- **Backend**: Vercel serverless functions
- **Database**: Firebase Realtime Database (with demo fallback)
- **AI - OCR**: Claude Sonnet 4 for handwritten recipe extraction
- **AI - Instagram**: Google Gemini 2.5 Flash Lite for caption parsing
- **Storage**: Firebase Storage (for images)

### Project Structure
```
recepty/
├── index.html              # Single page app
├── css/styles.css          # UX-compliant styling
├── js/
│   ├── app.js              # UI logic
│   ├── recipes.js          # CRUD + AI extraction
│   └── firebase-config.js  # Firebase setup
├── api/
│   ├── recipes.js          # GET/POST recipes
│   ├── recipes/[id].js     # GET/PUT/DELETE single
│   ├── ocr.js              # Handwritten photo → recipe (Claude)
│   ├── instagram.js        # Instagram URL → recipe metadata
│   └── caption.js          # Caption text → recipe (Gemini)
├── ROADMAP.md              # Feature tracking
├── PLAN.md                 # This file
└── CLAUDE.md               # Project rules
```

### Data Model
```javascript
Recipe {
  id, name, sourceType, sourceUrl, sourceImage,
  ingredients: [{name, key, amount}],
  herbs: string[],
  origin, cookTime,
  instructions, notes,
  createdAt, updatedAt
}
```

---

## Feature Status

### Completed
| Feature | Status | Notes |
|---------|--------|-------|
| Recipe list display | Done | Cards with name, origin, ingredients, cooking time |
| Filter by ingredients | Done | Include filter (top 15 by frequency) |
| Filter by herbs | Done | Exclude filter (herbs/spices to avoid) |
| Filter by origin | Done | 8 cuisines |
| Add/Edit modal | Done | Full form with all fields |
| Recipe detail modal | Done | Click card → full recipe view |
| Manual recipe entry | Done | All fields editable |
| Demo data | Done | 3 recipes for testing |
| Vercel API structure | Done | All endpoints defined |
| OCR API endpoint | Done | Claude Vision extracts handwritten recipes |
| Instagram API endpoint | Done | oEmbed + Gemini extraction |
| NEW badge | Done | localStorage tracks seen recipes |
| Responsive design | Done | Mobile-first |
| UX styling | Done | Following guidelines |

### Not Started
| Feature | Priority | Complexity |
|---------|----------|------------|
| Search by name | High | Low |
| Sorting options | High | Low |
| Favorites | Medium | Low |
| Loading states | Medium | Low |
| Recipe scaling | Medium | Medium |
| Firebase production setup | Medium | Low |
| Image upload & display | Medium | Medium |
| User authentication | Low | Medium |
| Recipe sharing/export | Low | Low |

---

## Planned Phases

### Phase 1: Core Completion (Done)
**Goal**: Make the app fully functional with demo data

- [x] Recipe CRUD operations
- [x] Search and filtering
- [x] Add/edit modal
- [x] Recipe detail modal
- [x] OCR endpoint for handwritten recipes
- [x] Instagram URL extraction endpoint

### Phase 2: UX Polish (Current)
**Goal**: Better feedback and usability

- [ ] Loading states during AI processing
- [ ] Search by recipe name
- [ ] Sorting options
- [ ] Favorites/bookmarks
- [ ] Better error messages

### Phase 3: Production Ready
**Goal**: Connect to real database, deploy

- [ ] Configure Firebase credentials
- [ ] Configure API keys (Anthropic, Google)
- [ ] Test OCR with real photos
- [ ] Test Instagram extraction with real URLs
- [ ] Deploy to Vercel
- [ ] Verify production endpoints

### Phase 4: Enhanced Features
**Goal**: Practical cooking features

- [ ] Recipe scaling (adjust portions)
- [ ] Cooking mode (step-by-step)
- [ ] Shopping list generation
- [ ] Image compression

### Phase 5: Sharing & Export
**Goal**: Share recipes with others

- [ ] Export recipe as text/PDF
- [ ] Share link generation
- [ ] Print-friendly view

---

## Key Files Reference

| Purpose | File |
|---------|------|
| Main UI | `index.html` |
| App logic | `js/app.js` |
| Data operations | `js/recipes.js` |
| Firebase config | `js/firebase-config.js` |
| Styling | `css/styles.css` |
| Recipe API | `api/recipes.js`, `api/recipes/[id].js` |
| OCR API | `api/ocr.js` |
| Instagram API | `api/instagram.js` |
| Caption API | `api/caption.js` |

---

## Configuration Needed

### For Development (Demo Mode)
- None - works with in-memory demo data

### For Production
```
# Vercel Environment Variables
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...
```

```javascript
// js/firebase-config.js - Update these values
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

---

## Verification Steps

### Local Development
1. `cd recepty && python3 -m http.server 8082`
2. Open http://localhost:8082
3. Verify recipe list shows 3 demo recipes
4. Test filter: select ingredient → list updates
5. Test herbs filter: exclude herb → recipes with it hidden
6. Test add: click "+ Pridat" → fill form → save
7. Test detail: click recipe card → see full recipe
8. Test edit: in detail modal → modify → save

### Instagram Flow Test
1. Click "+ Pridat"
2. Select "Instagram link"
3. Enter any Instagram food post URL
4. Wait for AI extraction
5. Review extracted data, adjust if needed
6. Save → verify recipe appears in list

### OCR Flow Test
1. Click "+ Pridat"
2. Select "Fotka receptu"
3. Upload photo of handwritten recipe
4. Wait for "Extrahuji text z fotky..."
5. Verify form fields are populated
6. Save recipe

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| No build step | Simplicity, direct deployment |
| Demo data fallback | Works without Firebase setup |
| Client-side filtering | Responsive UX, fewer API calls |
| Vercel serverless | Free tier, auto-scaling |
| Claude for OCR | Best vision understanding for handwritten text |
| Gemini for Instagram | Lighter model, quick caption parsing |
| Modal-based UI | Clean workflow, focused interactions |
| localStorage for seen | Simple, no auth needed for NEW badge |
