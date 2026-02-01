# Recepty - Personal Recipe Collection

## UX Design
Use the UX design skill at `~/.claude/skills/ux-design/` for all styling:
- Components: `~/.claude/skills/ux-design/components.md`
- Examples: `~/.claude/skills/ux-design/examples.md`

## Tech Stack
- Frontend: Vanilla HTML/CSS/JS (no build step)
- Backend: Vercel serverless functions
- Storage: Firebase Firestore
- Images: Firebase Storage
- Auth: Firebase Auth (passwordless/email link)
- OCR: Claude API for handwritten recipe extraction

## Data Model
```yaml
recipes:
  - id: string
    name: string
    source_type: "instagram" | "handwritten" | "manual"
    source_url: string (optional)
    source_image: string (optional)
    ingredients: [{name: string, key: boolean}]
    origin: string
    tags: string[]
    exclusions: string[]
    instructions: string
    notes: string
    created_at: timestamp
```

## Project-Specific Rules
- Czech language UI
- Personal/family use - simple auth
- Recipe cards show: name, origin tag, key ingredients, source type
- Filter by: ingredient, origin, exclusions (what's NOT in food)
