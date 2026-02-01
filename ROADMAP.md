# Recepty - Project Roadmap

## Vision
Personal recipe collection with AI-powered import. Minimize user effort, maximize AI assistance.

## Completed Features
- [x] Recipe list with demo data
- [x] Search by name/ingredient
- [x] Filter by origin (cuisine type)
- [x] Filter by exclusions (lepek, laktoza, maso, orechy)
- [x] Add/edit recipe modal
- [x] Manual recipe entry
- [x] Vercel API endpoints
- [x] Handwritten recipe OCR (photo upload → AI extraction)

## Planned Features
- [ ] AI-assisted Instagram import (user pastes screenshot → AI extracts everything)
- [ ] Firebase integration (production data storage)
- [ ] Recipe detail view with full instructions
- [ ] Recipe sharing / export

## UX Principle
"User does minimum, AI does maximum"
- User uploads screenshot → AI extracts & suggests everything → User reviews & saves
- Pre-fill with high confidence, show uncertain items as unchecked
- Progressive disclosure based on AI analysis
