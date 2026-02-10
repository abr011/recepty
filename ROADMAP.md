# Recepty - Project Roadmap

## Vision
Personal recipe collection with AI-powered import. Minimize user effort, maximize AI assistance.

## Completed Features
- [x] Recipe list with cards (name, origin, key ingredients, cooking time)
- [x] Filter by included ingredients (top 15 by frequency)
- [x] Filter by excluded herbs/spices
- [x] Filter by origin (cuisine type)
- [x] Add/edit recipe modal
- [x] Manual recipe entry
- [x] Recipe detail modal with full instructions
- [x] Vercel API endpoints
- [x] Handwritten recipe OCR (photo upload → Claude extracts recipe)
- [x] Instagram import (URL → Gemini extracts recipe from caption)
- [x] NEW badge for unseen recipes
- [x] Demo data fallback (works without Firebase)
- [x] CSS design tokens (Pajamas-inspired variables for colors, spacing, typography, radius)
- [x] Primary color: orange → Pajamas indigo (#6366f1)
- [x] Toast notification system (success/error/undo) with 5s auto-dismiss + progress bar
- [x] Forgiving delete: undo toast instead of confirm() dialog (5s to undo before actual delete)
- [x] Keyboard navigation: Escape closes modals
- [x] ARIA attributes on modals (role="dialog", aria-modal, aria-label)
- [x] Visible focus-visible states on buttons, pills, cards, close buttons
- [x] Origin select → selectable pills in edit form (< 8 options, no dropdown)
- [x] Empty state with "Zrusit filtry" button when filters yield no results
- [x] Inline validation (friendly Czech messages instead of alert())
- [x] Mobile touch targets: 44px min on pills and close buttons
- [x] Removed separating borders (whitespace-only separation per UX skill)
- [x] Toast confirmations on add/edit/delete actions (replaces all alert() calls)

## Planned Features
- [ ] Search by recipe name (currently only ingredient filter)
- [ ] Sorting options (alphabetical, by cooking time, by origin)
- [ ] Favorites/bookmarks
- [ ] Recipe scaling (adjust portions)
- [ ] Loading states during AI processing
- [ ] Image compression before upload
- [ ] Cooking mode (step-by-step, large text)
- [ ] Shopping list generation
- [ ] Recipe sharing / export
- [ ] Print-friendly view

### UX Design Improvements (from UX skill audit)
- [x] Forgiving delete: replace "Smazat" with undo toast instead of confirm() dialog
- [x] Toast notification system (success/error/undo) with 5s auto-dismiss
- [ ] Archive page for deleted recipes (restore or permanent delete)
- [x] Keyboard navigation: Escape to close modals, Tab through interactive elements
- [x] ARIA attributes on modals, forms, toasts (aria-live, aria-invalid, aria-describedby)
- [x] Friendly Czech validation messages (helpful tone, not error tone)
- [ ] Input width hints: cook time → input-xs, recipe name → input-md, instructions → full-width
- [x] Visible focus states on all interactive elements (buttons, pills, inputs)
- [x] Origin select → selectable pills (< 8 options, no dropdown needed)
- [x] Empty state when no recipes match filters (helpful message + clear filters action)
- [x] Mobile touch targets: ensure all buttons/pills are min 44x44px
- [ ] Loading skeleton cards while recipes load from Firebase
- [ ] AI suggestion badges ("AI návrh") on auto-filled fields during import
- [ ] Confidence indicators on AI-extracted ingredients (checked vs uncertain/dashed)

## UX Principle
"User does minimum, AI does maximum"
- User uploads photo or pastes link → AI extracts everything → User reviews & saves
- Pre-fill with high confidence, show uncertain items for review
- Progressive disclosure based on AI analysis
