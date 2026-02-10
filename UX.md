# Recepty - UX Patterns

Project-specific UI patterns for the Recepty app. For general design system, see `~/.claude/skills/ux-design/`.

---

## AI Recipe Extraction

The core UX pattern: user provides minimal input (URL/screenshot), AI extracts recipe data, user reviews and confirms.

### Loading State

```html
<div class="ai-loading">
  <div class="spinner"></div>
  <span>Analyzuji recept...</span>
</div>
```

### Suggestion Header

```html
<div class="ai-suggestion-header">
  <span class="ai-badge">AI návrh</span>
  <span class="ai-note">upravte podle potřeby</span>
</div>
```

### Ingredient Chips

Checkbox-based chips for AI-extracted ingredients. Pre-checked = high confidence, unchecked = uncertain.

```html
<div class="ai-chips">
  <label class="ai-chip">
    <input type="checkbox" checked>
    <span>krevety (hlavní)</span>
  </label>
  <label class="ai-chip">
    <input type="checkbox" checked>
    <span>rýžové nudle</span>
  </label>
  <label class="ai-chip uncertain">
    <input type="checkbox">
    <span>sójová omáčka</span>
  </label>
</div>
```

```css
.ai-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: var(--spacing-sm);
}

.ai-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #e8f4fd;
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background var(--transition);
}

.ai-chip:hover {
  background: #d4ebfc;
}

.ai-chip input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #1a73e8;
}

.ai-chip.uncertain {
  background: #f5f5f5;
  border: 1px dashed #ccc;
}

.ai-chip.uncertain span {
  color: var(--color-muted);
}
```

### Prefilled Recipe Name

```html
<div class="form-group ai-prefilled">
  <label for="name">Název receptu</label>
  <input type="text" id="name" value="Pad Thai s krevetami">
  <span class="ai-indicator">AI</span>
</div>
```

---

## Czech Text Examples

### Error Messages

```html
<!-- Email validation -->
<span class="form-error">Zkontrolujte prosím @ a koncovku (např. jmeno@domena.cz)</span>

<!-- Generic error -->
<div class="alert alert-error">
  <strong>Něco se pokazilo.</strong> Zkuste to prosím znovu za chvíli.
</div>

<!-- Success -->
<div class="alert alert-success">
  Recept byl úspěšně uložen.
</div>
```

### Form Labels

```html
<label class="form-label">Název receptu</label>
<label class="form-label">Ingredience</label>
<label class="form-label">Postup</label>
<label class="form-label">Doba přípravy</label>
<label class="form-label">Počet porcí</label>
```

### Buttons

```html
<button class="btn btn-primary">Uložit recept</button>
<button class="btn btn-secondary">Zrušit</button>
<button class="btn btn-primary loading">
  <span class="spinner spinner-sm"></span>
  Ukládám...
</button>
```

### Navigation

```html
<nav class="header-nav">
  <a href="#" class="nav-link active">Moje recepty</a>
  <a href="#" class="nav-link">Přidat recept</a>
  <a href="#" class="nav-link">Oblíbené</a>
</nav>
```

---

## Recipe Card

```html
<a href="#" class="card recipe-card">
  <div class="recipe-image" style="background-image: url('recipe.jpg')"></div>
  <h3 class="card-title">Pad Thai s krevetami</h3>
  <p class="card-meta">30 min · 4 porce</p>
</a>
```

```css
.recipe-card {
  overflow: hidden;
}

.recipe-image {
  height: 160px;
  background-size: cover;
  background-position: center;
  margin: calc(-1 * var(--spacing-md));
  margin-bottom: var(--spacing-sm);
}

.recipe-card .card-title {
  margin-top: var(--spacing-sm);
}
</style>
```

---

## Step Labels (Czech)

```html
<div class="steps">
  <div class="step active">
    <span class="step-number">1</span>
    <span class="step-label">Vložit recept</span>
  </div>
  <div class="step-connector"></div>
  <div class="step">
    <span class="step-number">2</span>
    <span class="step-label">Upravit detaily</span>
  </div>
  <div class="step-connector"></div>
  <div class="step">
    <span class="step-number">3</span>
    <span class="step-label">Uložit</span>
  </div>
</div>
```
