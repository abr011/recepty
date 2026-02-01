// Main application logic
import { getRecipes, getRecipe, addRecipe, updateRecipe, deleteRecipe, extractRecipeFromInstagram, extractRecipeFromCaption } from './recipes.js';

// DOM Elements - List
const recipeList = document.getElementById('recipeList');
const searchInput = document.getElementById('searchInput');
const originFilter = document.getElementById('originFilter');
const exclusionChips = document.getElementById('exclusionChips');
const addRecipeBtn = document.getElementById('addRecipeBtn');

// DOM Elements - Add Modal
const addModal = document.getElementById('addModal');
const addForm = document.getElementById('addForm');
const instagramUrl = document.getElementById('instagramUrl');
const captionFallback = document.getElementById('captionFallback');
const instagramCaption = document.getElementById('instagramCaption');
const addStatus = document.getElementById('addStatus');
const addStatusText = document.getElementById('addStatusText');
const closeAddModal = document.getElementById('closeAddModal');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const submitAddBtn = document.getElementById('submitAddBtn');

// DOM Elements - Edit Modal
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const editRecipeId = document.getElementById('editRecipeId');
const editRecipeName = document.getElementById('editRecipeName');
const editIngredientsList = document.getElementById('editIngredientsList');
const editAddIngredient = document.getElementById('editAddIngredient');
const editRecipeOrigin = document.getElementById('editRecipeOrigin');
const editRecipeInstructions = document.getElementById('editRecipeInstructions');
const editRecipeNotes = document.getElementById('editRecipeNotes');
const closeEditModal = document.getElementById('closeEditModal');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// State
let currentFilters = {
  search: '',
  origin: '',
  exclusions: []
};

// Seen recipes tracking (localStorage)
const SEEN_RECIPES_KEY = 'recepty_seen';

function getSeenRecipes() {
  try {
    return JSON.parse(localStorage.getItem(SEEN_RECIPES_KEY) || '[]');
  } catch {
    return [];
  }
}

function markRecipeSeen(id) {
  const seen = getSeenRecipes();
  if (!seen.includes(id)) {
    seen.push(id);
    localStorage.setItem(SEEN_RECIPES_KEY, JSON.stringify(seen));
  }
}

function isRecipeNew(id) {
  return !getSeenRecipes().includes(id);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadRecipes();
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  // Search input with debounce
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentFilters.search = e.target.value;
      loadRecipes();
    }, 300);
  });

  // Origin filter
  originFilter.addEventListener('change', (e) => {
    currentFilters.origin = e.target.value;
    loadRecipes();
  });

  // Exclusion chips
  exclusionChips.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      currentFilters.exclusions = Array.from(
        exclusionChips.querySelectorAll('input:checked')
      ).map(cb => cb.value);
      loadRecipes();
    });
  });

  // Add recipe button -> open add modal
  addRecipeBtn.addEventListener('click', () => openAddModal());

  // Add modal events
  closeAddModal.addEventListener('click', () => closeAddModalHandler());
  cancelAddBtn.addEventListener('click', () => closeAddModalHandler());
  addModal.addEventListener('click', (e) => {
    if (e.target === addModal) closeAddModalHandler();
  });
  addForm.addEventListener('submit', handleAddSubmit);

  // Edit modal events
  closeEditModal.addEventListener('click', () => closeEditModalHandler());
  cancelEditBtn.addEventListener('click', () => closeEditModalHandler());
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModalHandler();
  });
  editForm.addEventListener('submit', handleEditSubmit);
  editAddIngredient.addEventListener('click', () => addIngredientRow(editIngredientsList));
}

// Load and render recipes
async function loadRecipes() {
  recipeList.innerHTML = '<div class="loading-state">Nacitam recepty...</div>';

  try {
    const recipes = await getRecipes(currentFilters);
    renderRecipes(recipes);
  } catch (error) {
    recipeList.innerHTML = '<div class="empty-state"><h3>Chyba pri nacitani</h3><p>Zkuste to prosim znovu</p></div>';
  }
}

// Render recipe cards
function renderRecipes(recipes) {
  if (recipes.length === 0) {
    recipeList.innerHTML = `
      <div class="empty-state">
        <h3>Zadne recepty</h3>
        <p>Pridejte svuj prvni recept pomoci tlacitka "+ Pridat"</p>
      </div>
    `;
    return;
  }

  recipeList.innerHTML = recipes.map(recipe => `
    <div class="recipe-card${isRecipeNew(recipe.id) ? ' is-new' : ''}" data-id="${recipe.id}">
      ${isRecipeNew(recipe.id) ? '<span class="new-badge">NEW</span>' : ''}
      <div class="recipe-card-header">
        <h3>${escapeHtml(recipe.name)}</h3>
        ${recipe.origin ? `<span class="origin-tag">${escapeHtml(recipe.origin)}</span>` : ''}
      </div>
      <p class="recipe-ingredients">
        ${(recipe.ingredients || []).map(ing => ing.key ? `<strong>${escapeHtml(ing.name)}</strong>` : escapeHtml(ing.name)).join(', ') || 'Zadne ingredience'}
      </p>
      <p class="recipe-source">
        ${getSourceLabel(recipe)}
      </p>
    </div>
  `).join('');

  // Add click handlers to cards -> open edit modal and mark as seen
  recipeList.querySelectorAll('.recipe-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      markRecipeSeen(id);
      card.classList.remove('is-new');
      const badge = card.querySelector('.new-badge');
      if (badge) badge.remove();
      openEditModal(id);
    });
  });
}

// Get source label for recipe card
function getSourceLabel(recipe) {
  if (recipe.sourceUrl) {
    return `<a href="${escapeHtml(recipe.sourceUrl)}" target="_blank" onclick="event.stopPropagation()">Instagram</a>`;
  }
  return 'Rucni zadani';
}

// === ADD MODAL ===
function openAddModal() {
  addForm.reset();
  addStatus.style.display = 'none';
  captionFallback.style.display = 'none';
  submitAddBtn.disabled = false;
  submitAddBtn.textContent = 'Pridat';
  addModal.classList.add('active');
  document.body.style.overflow = 'hidden';
  instagramUrl.focus();
}

function closeAddModalHandler() {
  addModal.classList.remove('active');
  document.body.style.overflow = '';
  captionFallback.style.display = 'none';
}

async function handleAddSubmit(e) {
  e.preventDefault();

  const url = instagramUrl.value.trim();
  const caption = instagramCaption.value.trim();

  if (!url) return;

  // Show loading state
  addStatus.style.display = 'flex';
  addStatusText.textContent = 'Extrahuji recept z Instagramu...';
  submitAddBtn.disabled = true;

  let extracted = null;

  try {
    // If user provided caption, use that for extraction
    if (caption) {
      extracted = await extractRecipeFromCaption(caption);
    } else {
      // Try API extraction from URL
      extracted = await extractRecipeFromInstagram(url);
    }
  } catch (error) {
    console.log('Extraction failed:', error.message);
  }

  // If extraction returned empty and no caption provided, show fallback
  if (!extracted?.name && !caption) {
    addStatus.style.display = 'none';
    captionFallback.style.display = 'block';
    submitAddBtn.disabled = false;
    submitAddBtn.textContent = 'Extrahovat';
    instagramCaption.focus();
    return;
  }

  try {
    addStatusText.textContent = 'Ukladam recept...';

    // Save recipe - with extracted data if available, or just URL
    const recipeData = {
      name: extracted?.name || 'Novy recept z Instagramu',
      sourceType: 'instagram',
      sourceUrl: url,
      sourceImage: extracted?.imageUrl || null,
      ingredients: extracted?.ingredients || [],
      origin: extracted?.origin || '',
      tags: [],
      exclusions: extracted?.exclusions || [],
      instructions: extracted?.instructions || '',
      notes: extracted?.notes || ''
    };

    const saved = await addRecipe(recipeData);

    closeAddModalHandler();
    await loadRecipes();
  } catch (error) {
    console.error('Error saving recipe:', error);
    addStatusText.textContent = 'Chyba: ' + (error.message || 'Nepodarilo se ulozit recept');
    submitAddBtn.disabled = false;
  }
}

// === EDIT MODAL ===
async function openEditModal(recipeId) {
  const recipe = await getRecipe(recipeId);
  if (!recipe) return;

  editRecipeId.value = recipe.id;
  editRecipeName.value = recipe.name;
  editRecipeOrigin.value = recipe.origin || '';
  editRecipeInstructions.value = recipe.instructions || '';
  editRecipeNotes.value = recipe.notes || '';

  // Populate ingredients
  editIngredientsList.innerHTML = '';
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    recipe.ingredients.forEach(ing => addIngredientRow(editIngredientsList, ing.name, ing.key));
  } else {
    addIngredientRow(editIngredientsList);
  }

  // Set exclusions
  document.querySelectorAll('input[name="editExclusions"]').forEach(cb => {
    cb.checked = recipe.exclusions && recipe.exclusions.includes(cb.value);
  });

  editModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeEditModalHandler() {
  editModal.classList.remove('active');
  document.body.style.overflow = '';
}

async function handleEditSubmit(e) {
  e.preventDefault();

  const recipeData = {
    name: editRecipeName.value.trim(),
    ingredients: getIngredientsFromList(editIngredientsList),
    origin: editRecipeOrigin.value,
    exclusions: Array.from(document.querySelectorAll('input[name="editExclusions"]:checked')).map(cb => cb.value),
    instructions: editRecipeInstructions.value.trim(),
    notes: editRecipeNotes.value.trim()
  };

  if (!recipeData.name) {
    alert('Zadejte prosim nazev receptu');
    return;
  }

  try {
    await updateRecipe(editRecipeId.value, recipeData);
    closeEditModalHandler();
    loadRecipes();
  } catch (error) {
    alert('Chyba pri ukladani receptu. Zkuste to prosim znovu.');
  }
}

// === HELPERS ===
function addIngredientRow(container, name = '', isKey = false) {
  const row = document.createElement('div');
  row.className = 'ingredient-row';
  row.innerHTML = `
    <input type="text" placeholder="Ingredience" value="${escapeHtml(name)}">
    <label>
      <input type="checkbox" ${isKey ? 'checked' : ''}> Hlavni
    </label>
    <button type="button" class="remove-ingredient">&times;</button>
  `;

  row.querySelector('.remove-ingredient').addEventListener('click', () => {
    row.remove();
  });

  container.appendChild(row);
}

function getIngredientsFromList(container) {
  const rows = container.querySelectorAll('.ingredient-row');
  const ingredients = [];

  rows.forEach(row => {
    const name = row.querySelector('input[type="text"]').value.trim();
    const isKey = row.querySelector('input[type="checkbox"]').checked;

    if (name) {
      ingredients.push({ name, key: isKey });
    }
  });

  return ingredients;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
