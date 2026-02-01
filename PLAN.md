# Recepty App - Project Plan

## Vision
Personal recipe collection with AI-powered import. **"User does minimum, AI does maximum."**

---

## Current State (What We Have)

### Tech Stack
- **Frontend**: Vanilla HTML/CSS/JS, ES6 modules
- **Backend**: Vercel serverless functions
- **Database**: Firebase Firestore (with demo fallback)
- **AI**: Claude API (Sonnet 4) for OCR & extraction
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
│   ├── ocr.js              # Handwritten photo → recipe
│   └── instagram.js        # Instagram URL → recipe
├── ROADMAP.md              # Feature tracking
└── CLAUDE.md               # Project rules
```

### Data Model
```javascript
Recipe {
  id, name, sourceType, sourceUrl, sourceImage,
  ingredients: [{name, key}],
  origin, tags, exclusions,
  instructions, notes,
  createdAt, updatedAt
}
```

---

## Feature Status

### Completed
| Feature | Status | Notes |
|---------|--------|-------|
| Recipe list display | Done | Cards with name, origin, ingredients |
| Search (name/ingredient) | Done | Debounced 300ms |
| Filter by origin | Done | 8 cuisines |
| Filter by exclusions | Done | lepek, laktoza, maso, orechy |
| Add/Edit modal | Done | Full form with all fields |
| Manual recipe entry | Done | All fields editable |
| Demo data | Done | 3 recipes for testing |
| Vercel API structure | Done | All endpoints defined |
| OCR API endpoint | Done | Claude Vision ready |
| Instagram API endpoint | Done | oEmbed + Claude |
| Responsive design | Done | Mobile-first |
| UX styling | Done | Following guidelines |

### In Progress
| Feature | Status | Next Step |
|---------|--------|-----------|
| Instagram import | Partial | URL saved, extraction on save attempted |

### Not Started
| Feature | Priority | Complexity |
|---------|----------|------------|
| Firebase production setup | High | Low |
| Recipe detail view | Medium | Low |
| Image upload & display | Medium | Medium |
| User authentication | Low | Medium |
| Recipe sharing/export | Low | Low |

---

## Planned Phases

### Phase 1: Core Completion (Current)
**Goal**: Make the app fully functional with demo data

- [x] Recipe CRUD operations
- [x] Search and filtering
- [x] Add/edit modal
- [x] OCR endpoint for handwritten recipes
- [x] Instagram URL extraction endpoint
- [ ] **Test Instagram extraction flow end-to-end**
- [ ] **Fix any remaining bugs**

### Phase 2: Production Ready
**Goal**: Connect to real database, deploy

- [ ] Configure Firebase credentials
- [ ] Configure Anthropic API key
- [ ] Test OCR with real photos
- [ ] Test Instagram extraction with real URLs
- [ ] Deploy to Vercel
- [ ] Verify production endpoints

### Phase 3: Enhanced UX
**Goal**: Better recipe viewing and images

- [ ] Recipe detail view (click card → full recipe)
- [ ] Image upload during recipe creation
- [ ] Image display on recipe cards
- [ ] Better loading states

### Phase 4: Sharing & Export
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
4. Test search: type "kure" → should show Pad Thai
5. Test filter: select "Ceske" → should show Svickova
6. Test add: click "+ Pridat" → fill form → save
7. Test edit: click recipe card → modify → save

### Instagram Flow Test
1. Click "+ Pridat"
2. Select "Instagram link"
3. Enter any Instagram food post URL
4. Fill in recipe name manually (or leave empty to test AI extraction)
5. Save → verify recipe appears in list

### OCR Flow Test
1. Click "+ Pridat"
2. Select "Fotka receptu"
3. Upload photo of handwritten recipe
4. Wait for "Extrahuji text z fotky..."
5. Verify form fields are populated

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| No build step | Simplicity, direct deployment |
| Demo data fallback | Works without Firebase setup |
| Client-side filtering | Responsive UX, fewer API calls |
| Vercel serverless | Free tier, auto-scaling |
| Claude for AI | Best vision + language understanding |
| oEmbed for Instagram | Public API, no auth needed |
| Modal-based editing | Clean UI, focused workflow |

---

## Next Immediate Actions

1. **Test current implementation** - verify Instagram + OCR flows work
2. **Update ROADMAP.md** - mark Instagram import as complete if working
3. **Add error handling** - better user feedback on failures
4. **Document API endpoints** - for future reference
