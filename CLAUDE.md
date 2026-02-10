# Recepty - Personal Recipe Collection

## UX Design
Use the UX design skill at `~/.claude/skills/ux-design/` for all styling:
- Components: `~/.claude/skills/ux-design/components.md`
- Examples: `~/.claude/skills/ux-design/examples.md`
- **Project-specific**: `./UX.md` (Czech text, AI recipe extraction patterns)

## Tech Stack
- Frontend: Vanilla HTML/CSS/JS (no build step)
- Backend: Vercel serverless functions
- Storage: Firebase Realtime Database
- Images: Firebase Storage
- Auth: Firebase Auth (passwordless/email link)
- OCR: Claude API (Sonnet 4) for handwritten recipe extraction
- Instagram parsing: Google Gemini 2.5 Flash Lite

## Data Model
```yaml
recipes:
  - id: string
    name: string
    sourceType: "instagram" | "handwritten" | "manual"
    sourceUrl: string (optional)
    sourceImage: string (optional)
    ingredients: [{name: string, key: boolean, amount: string}]
    herbs: string[]
    origin: string
    cookTime: number (minutes)
    instructions: string
    notes: string
    createdAt: timestamp
    updatedAt: timestamp
```

## Project-Specific Rules
- Czech language UI
- Personal/family use - simple auth
- Recipe cards show: name, origin tag, key ingredients, cooking time
- Filter by: included ingredients, excluded herbs/spices
- NEW badge for unseen recipes (localStorage tracking)

---

## Add Recipe from Instagram

Automatically extract and save recipes from Instagram URLs with zero manual effort.

### When to Use
When user provides an Instagram URL (reel, post, or story) containing a recipe.

### Workflow

#### Step 1: Navigate to Instagram
```
Use mcp__chrome-devtools__navigate_page to open the Instagram URL
Wait for page to load
```

#### Step 2: Extract Caption
```
Use mcp__chrome-devtools__take_snapshot to get page content
Look for caption text in the snapshot - typically in elements containing recipe text
The caption usually appears after the author name
```

#### Step 3: Parse Recipe Data
Call the Gemini API to extract structured recipe data from the caption:
- Recipe name (in Czech)
- Ingredients list with key ingredients marked
- Origin/cuisine type
- Cooking instructions
- Notes/tips

Use the `/api/caption` endpoint:
```bash
curl -X POST https://recepty-abr011s-projects.vercel.app/api/caption \
  -H "Content-Type: application/json" \
  -d '{"caption": "extracted caption text here"}'
```

#### Step 4: Save to Firebase
Save the recipe using the web UI:
1. Navigate to https://recepty-abr011s-projects.vercel.app
2. Click "+ Pridat" button
3. Enter the Instagram URL
4. If caption fallback appears, paste the extracted caption
5. Submit to save

Or save directly via the app's Firebase database if direct API access is available.

### Example
```
User: Add recipe from https://www.instagram.com/reel/ABC123/

Claude:
1. Opens Instagram URL in Chrome
2. Takes snapshot, finds caption: "Pad thai s kurecim..."
3. Calls API to parse: {name: "Pad thai", ingredients: [...]}
4. Saves to Firebase
5. Reports: "Added 'Pad thai s kurecim' with 5 ingredients"
```

### Step 5: Extract Recipe from Video End
Many Instagram recipe videos show the full ingredient list at the end. To capture this:

```javascript
// Find video and seek to end
const video = document.querySelector('video');
video.currentTime = video.duration - 2; // 2 seconds before end
video.pause();
```

1. Close any login popups first (click X button)
2. Use evaluate_script to seek video to last 2-3 seconds
3. Take screenshot to capture the recipe card
4. Read the screenshot to extract ingredients with quantities
5. Update the recipe in Firebase with full details

### Fallback: Screenshot OCR
If caption text not found in snapshot:
1. Use mcp__chrome-devtools__take_screenshot to capture the page
2. Use Gemini Vision to OCR the caption from the image
3. Continue with Step 3

### Firebase Direct Save
Save directly to Firebase Realtime Database:
```bash
curl -X POST "https://recepty-5c6ce-default-rtdb.europe-west1.firebasedatabase.app/recipes.json" \
  -H "Content-Type: application/json" \
  -d '{"name": "...", "ingredients": [...], "instructions": "...", "createdAt": "..."}'
```

### Output
Report to user:
- Recipe name
- Number of ingredients extracted
- Origin/cuisine if detected
- Link to view in app
