// Main application logic
import { getAllRecipes, getRecipes, getRecipe, addRecipe, updateRecipe, deleteRecipe, extractRecipeFromInstagram, extractRecipeFromCaption, extractRecipeFromPhoto, uploadImage } from './recipes.js';

// DOM Elements - List
const recipeList = document.getElementById('recipeList');
const includePills = document.getElementById('includePills');
const excludePills = document.getElementById('excludePills');
const addRecipeBtn = document.getElementById('addRecipeBtn');

// DOM Elements - Add Modal
const addModal = document.getElementById('addModal');
const addForm = document.getElementById('addForm');
const instagramUrl = document.getElementById('instagramUrl');
const captionFallback = document.getElementById('captionFallback');
const instagramCaption = document.getElementById('instagramCaption');
const recipePhoto = document.getElementById('recipePhoto');
const dropZone = document.getElementById('dropZone');
const dropZoneText = document.getElementById('dropZoneText');
const dropZonePreview = document.getElementById('dropZonePreview');
const previewImg = document.getElementById('previewImg');
const removePhotoBtn = document.getElementById('removePhoto');
const addStatus = document.getElementById('addStatus');
const addStatusText = document.getElementById('addStatusText');
const closeAddModal = document.getElementById('closeAddModal');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const submitAddBtn = document.getElementById('submitAddBtn');

// DOM Elements - Detail Modal
const detailModal = document.getElementById('detailModal');
const closeDetailModal = document.getElementById('closeDetailModal');
const detailPhoto = document.getElementById('detailPhoto');
const detailName = document.getElementById('detailName');
const detailOrigin = document.getElementById('detailOrigin');
const detailTime = document.getElementById('detailTime');
const detailSource = document.getElementById('detailSource');
const detailIngredients = document.getElementById('detailIngredients');
const detailHerbs = document.getElementById('detailHerbs');
const detailHerbsSection = document.getElementById('detailHerbsSection');
const detailInstructions = document.getElementById('detailInstructions');
const detailInstructionsSection = document.getElementById('detailInstructionsSection');
const detailNotes = document.getElementById('detailNotes');
const detailNotesSection = document.getElementById('detailNotesSection');
const editFromDetailBtn = document.getElementById('editFromDetailBtn');
const deleteFromDetailBtn = document.getElementById('deleteFromDetailBtn');

// DOM Elements - Edit Modal
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const editRecipeId = document.getElementById('editRecipeId');
const editRecipeName = document.getElementById('editRecipeName');
const editIngredientsList = document.getElementById('editIngredientsList');
const editAddIngredient = document.getElementById('editAddIngredient');
const editRecipeOrigin = document.getElementById('editRecipeOrigin');
const editCookTime = document.getElementById('editCookTime');
const editHerbs = document.getElementById('editHerbs');
const editRecipeInstructions = document.getElementById('editRecipeInstructions');
const editRecipeNotes = document.getElementById('editRecipeNotes');
const closeEditModal = document.getElementById('closeEditModal');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// DOM Elements - Toast
const toastContainer = document.getElementById('toastContainer');

// State
let currentFilters = {
  ingredients: [],  // Include these main ingredients
  herbs: []         // Exclude recipes with these herbs
};

let currentDetailRecipeId = null;
let allMainIngredients = [];
let allHerbs = [];

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

// === TOAST SYSTEM ===
function showToast(message, options = {}) {
  const { undo, duration = 5000 } = options;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.position = 'relative';
  toast.style.overflow = 'hidden';

  const text = document.createElement('span');
  text.textContent = message;
  toast.appendChild(text);

  if (undo) {
    const undoBtn = document.createElement('button');
    undoBtn.className = 'toast-undo';
    undoBtn.textContent = 'Vrátit zpět';
    undoBtn.addEventListener('click', () => {
      clearTimeout(timer);
      dismissToast(toast);
      undo();
    });
    toast.appendChild(undoBtn);
  }

  // Timer bar
  const bar = document.createElement('div');
  bar.className = 'toast-bar';
  bar.style.animationDuration = duration + 'ms';
  toast.appendChild(bar);

  toastContainer.appendChild(toast);

  const timer = setTimeout(() => {
    dismissToast(toast);
  }, duration);

  return toast;
}

function dismissToast(toast) {
  toast.classList.add('toast-out');
  toast.addEventListener('animationend', () => {
    toast.remove();
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadRecipes();
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  // Add recipe button -> open add modal
  addRecipeBtn.addEventListener('click', () => openAddModal());

  // Add modal events
  closeAddModal.addEventListener('click', () => closeAddModalHandler());
  cancelAddBtn.addEventListener('click', () => closeAddModalHandler());
  addModal.addEventListener('click', (e) => {
    if (e.target === addModal) closeAddModalHandler();
  });
  addForm.addEventListener('submit', handleAddSubmit);

  // Detail modal events
  closeDetailModal.addEventListener('click', () => closeDetailModalHandler());
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) closeDetailModalHandler();
  });
  editFromDetailBtn.addEventListener('click', () => {
    const recipeId = currentDetailRecipeId;
    closeDetailModalHandler();
    openEditModal(recipeId);
  });
  deleteFromDetailBtn.addEventListener('click', handleDeleteFromDetail);

  // Edit modal events
  closeEditModal.addEventListener('click', () => closeEditModalHandler());
  cancelEditBtn.addEventListener('click', () => closeEditModalHandler());
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModalHandler();
  });
  editForm.addEventListener('submit', handleEditSubmit);
  editAddIngredient.addEventListener('click', () => addIngredientRow(editIngredientsList));

  // Drop zone: drag and drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setPhotoFile(file);
    }
  });

  // Drop zone: file input change
  recipePhoto.addEventListener('change', () => {
    if (recipePhoto.files[0]) {
      setPhotoFile(recipePhoto.files[0]);
    }
  });

  // Remove photo button
  removePhotoBtn.addEventListener('click', () => {
    clearPhotoFile();
  });

  // Origin pills click handlers
  editRecipeOrigin.querySelectorAll('.origin-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      // Toggle: clicking active pill deselects it
      if (pill.classList.contains('active')) {
        pill.classList.remove('active');
      } else {
        editRecipeOrigin.querySelectorAll('.origin-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      }
    });
  });

  // Keyboard: Escape closes modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (editModal.classList.contains('active')) {
        closeEditModalHandler();
      } else if (addModal.classList.contains('active')) {
        closeAddModalHandler();
      } else if (detailModal.classList.contains('active')) {
        closeDetailModalHandler();
      }
    }
  });
}

// Load and render recipes
async function loadRecipes() {
  recipeList.innerHTML = '<div class="loading-state">Načítám recepty...</div>';

  try {
    const [allRecipes, recipes] = await Promise.all([
      getAllRecipes(),
      getRecipes(currentFilters)
    ]);
    renderRecipes(recipes, allRecipes);
  } catch (error) {
    recipeList.innerHTML = '<div class="empty-state"><h3>Chyba při načítání</h3><p>Zkuste to prosím znovu</p></div>';
  }
}

// Render recipe cards
function renderRecipes(recipes, allRecipes) {
  // Collect pills from ALL recipes (unfiltered) so they don't disappear
  collectMainIngredients(allRecipes);
  collectHerbs(allRecipes);
  renderIncludePills();
  renderExcludePills();

  const hasActiveFilters = currentFilters.ingredients.length > 0 || currentFilters.herbs.length > 0;

  if (recipes.length === 0) {
    if (hasActiveFilters) {
      recipeList.innerHTML = `
        <div class="empty-state">
          <h3>Žádné recepty pro tyto filtry</h3>
          <p>Zkuste změnit nebo zrušit filtry</p>
          <button class="btn btn-secondary" id="clearFiltersBtn">Zrušit filtry</button>
        </div>
      `;
      document.getElementById('clearFiltersBtn').addEventListener('click', () => {
        currentFilters.ingredients = [];
        currentFilters.herbs = [];
        loadRecipes();
      });
    } else {
      recipeList.innerHTML = `
        <div class="empty-state">
          <h3>Žádné recepty</h3>
          <p>Přidejte svůj první recept pomocí tlačítka "+ Přidat"</p>
        </div>
      `;
    }
    return;
  }

  recipeList.innerHTML = recipes.map(recipe => {
    const mainIngredients = (recipe.ingredients || []).filter(ing => ing.key);
    const otherIngredients = (recipe.ingredients || []).filter(ing => !ing.key).slice(0, 3);
    const photoUrl = recipe.sourceImage || recipe.imageUrl;

    return `
      <div class="recipe-card${isRecipeNew(recipe.id) ? ' is-new' : ''}" data-id="${recipe.id}">
        ${isRecipeNew(recipe.id) ? '<span class="new-badge">NEW</span>' : ''}
        <div class="recipe-card-photo${photoUrl ? '' : ' no-photo'}" style="${photoUrl ? `background-image: url('${escapeHtml(photoUrl)}')` : ''}">
          ${!photoUrl ? '🍽' : ''}
        </div>
        <div class="recipe-card-body">
          <div class="recipe-card-header">
            <h3>${escapeHtml(recipe.name)}</h3>
            ${recipe.origin ? `<span class="origin-tag">${escapeHtml(recipe.origin)}</span>` : ''}
          </div>
          <div class="recipe-card-pills">
            ${mainIngredients.map(ing => `<span class="recipe-card-pill main">${escapeHtml(ing.name)}</span>`).join('')}
            ${otherIngredients.map(ing => `<span class="recipe-card-pill secondary">${escapeHtml(ing.name)}</span>`).join('')}
          </div>
          <div class="recipe-card-meta">
            ${recipe.cookTime ? `<span class="recipe-card-time">⏱ ${recipe.cookTime} min</span>` : ''}
            ${recipe.sourceUrl ? `<span class="recipe-source"><a href="${escapeHtml(recipe.sourceUrl)}" target="_blank" onclick="event.stopPropagation()">Instagram</a></span>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Validate card photos - fallback if image fails to load
  recipeList.querySelectorAll('.recipe-card-photo:not(.no-photo)').forEach(photoDiv => {
    const bg = photoDiv.style.backgroundImage;
    if (bg) {
      const url = bg.slice(5, -2); // extract from url('...')
      const img = new Image();
      img.onerror = () => {
        photoDiv.style.backgroundImage = '';
        photoDiv.classList.add('no-photo');
        photoDiv.textContent = '\u{1F37D}';
      };
      img.src = url;
    }
  });

  // Add click handlers to cards -> open detail modal and mark as seen
  recipeList.querySelectorAll('.recipe-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      markRecipeSeen(id);
      card.classList.remove('is-new');
      const badge = card.querySelector('.new-badge');
      if (badge) badge.remove();
      openDetailModal(id);
    });
  });
}

// Collect main ingredients from all recipes
function collectMainIngredients(recipes) {
  const ingredientCounts = {};

  recipes.forEach(recipe => {
    (recipe.ingredients || []).forEach(ing => {
      if (ing.key) {
        const name = ing.name.toLowerCase();
        ingredientCounts[name] = (ingredientCounts[name] || 0) + 1;
      }
    });
  });

  // Sort by count and take top ingredients
  allMainIngredients = Object.entries(ingredientCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name]) => name);
}

// Render include pills (main ingredients)
function renderIncludePills() {
  if (allMainIngredients.length === 0) {
    includePills.innerHTML = '<span style="color: var(--color-text-muted); font-size: 0.875em;">Žádné hlavní ingredience</span>';
    return;
  }

  includePills.innerHTML = allMainIngredients.map(ing => `
    <button class="filter-pill${currentFilters.ingredients.includes(ing) ? ' active' : ''}" data-ingredient="${escapeHtml(ing)}">
      ${escapeHtml(ing)}
    </button>
  `).join('');

  // Add click handlers
  includePills.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const ing = pill.dataset.ingredient;
      pill.classList.toggle('active');

      if (pill.classList.contains('active')) {
        if (!currentFilters.ingredients.includes(ing)) {
          currentFilters.ingredients.push(ing);
        }
      } else {
        currentFilters.ingredients = currentFilters.ingredients.filter(i => i !== ing);
      }
      loadRecipes();
    });
  });
}

// Collect all herbs from recipes
function collectHerbs(recipes) {
  const herbCounts = {};

  recipes.forEach(recipe => {
    (recipe.herbs || []).forEach(herb => {
      const name = herb.toLowerCase();
      herbCounts[name] = (herbCounts[name] || 0) + 1;
    });
  });

  // Sort by count
  allHerbs = Object.entries(herbCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
}

// Render exclude pills (herbs)
function renderExcludePills() {
  if (allHerbs.length === 0) {
    excludePills.innerHTML = '<span style="color: var(--color-text-muted); font-size: 0.875em;">Žádná koření</span>';
    return;
  }

  excludePills.innerHTML = allHerbs.map(herb => `
    <button class="filter-pill${currentFilters.herbs.includes(herb) ? ' active' : ''}" data-herb="${escapeHtml(herb)}" data-exclude>
      ${escapeHtml(herb)}
    </button>
  `).join('');

  // Add click handlers
  excludePills.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const herb = pill.dataset.herb;
      pill.classList.toggle('active');

      if (pill.classList.contains('active')) {
        if (!currentFilters.herbs.includes(herb)) {
          currentFilters.herbs.push(herb);
        }
      } else {
        currentFilters.herbs = currentFilters.herbs.filter(h => h !== herb);
      }
      loadRecipes();
    });
  });
}

// Get source label for recipe card
function getSourceLabel(recipe) {
  if (recipe.sourceUrl) {
    return `<a href="${escapeHtml(recipe.sourceUrl)}" target="_blank" onclick="event.stopPropagation()">Instagram</a>`;
  }
  return 'Ruční zadání';
}

// === DETAIL MODAL ===
async function openDetailModal(recipeId) {
  const recipe = await getRecipe(recipeId);
  if (!recipe) return;

  currentDetailRecipeId = recipe.id;
  const photoUrl = recipe.sourceImage || recipe.imageUrl;

  // Set photo (validate that image actually loads)
  detailPhoto.style.backgroundImage = '';
  detailPhoto.classList.add('no-photo');
  if (photoUrl) {
    const img = new Image();
    img.onload = () => {
      detailPhoto.style.backgroundImage = `url('${photoUrl}')`;
      detailPhoto.classList.remove('no-photo');
    };
    img.src = photoUrl;
  }

  // Set basic info
  detailName.textContent = recipe.name;
  detailOrigin.textContent = recipe.origin ? recipe.origin.toUpperCase() : '';
  detailOrigin.style.display = recipe.origin ? '' : 'none';

  // Set time
  if (recipe.cookTime) {
    detailTime.innerHTML = `⏱ ${recipe.cookTime} min`;
    detailTime.style.display = '';
  } else {
    detailTime.style.display = 'none';
  }

  // Set source link
  if (recipe.sourceUrl) {
    detailSource.href = recipe.sourceUrl;
    detailSource.style.display = '';
  } else {
    detailSource.style.display = 'none';
  }

  // Render ingredient pills
  const mainIngredients = (recipe.ingredients || []).filter(ing => ing.key);
  const otherIngredients = (recipe.ingredients || []).filter(ing => !ing.key);

  detailIngredients.innerHTML = [
    ...mainIngredients.map(ing => `
      <span class="ingredient-pill main">
        ${escapeHtml(ing.name)}${ing.amount ? `<span class="amount">${escapeHtml(ing.amount)}</span>` : ''}
      </span>
    `),
    ...otherIngredients.map(ing => `
      <span class="ingredient-pill secondary">
        ${escapeHtml(ing.name)}${ing.amount ? `<span class="amount">${escapeHtml(ing.amount)}</span>` : ''}
      </span>
    `)
  ].join('');

  // Render herbs
  if (recipe.herbs && recipe.herbs.length > 0) {
    detailHerbs.innerHTML = recipe.herbs.map(herb => `
      <span class="herb-pill">${escapeHtml(herb)}</span>
    `).join('');
    detailHerbsSection.style.display = '';
  } else {
    detailHerbsSection.style.display = 'none';
  }

  // Set instructions
  if (recipe.instructions) {
    detailInstructions.textContent = recipe.instructions;
    detailInstructionsSection.style.display = '';
  } else {
    detailInstructionsSection.style.display = 'none';
  }

  // Set notes
  if (recipe.notes) {
    detailNotes.textContent = recipe.notes;
    detailNotesSection.style.display = '';
  } else {
    detailNotesSection.style.display = 'none';
  }

  detailModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDetailModalHandler() {
  detailModal.classList.remove('active');
  document.body.style.overflow = '';
  currentDetailRecipeId = null;
}

// Forgiving delete: hide immediately, show undo toast, delete after timeout
async function handleDeleteFromDetail() {
  if (!currentDetailRecipeId) return;

  const recipeId = currentDetailRecipeId;
  const recipeName = detailName.textContent;

  // Close modal and hide card immediately
  closeDetailModalHandler();
  const card = recipeList.querySelector(`.recipe-card[data-id="${recipeId}"]`);
  if (card) card.style.display = 'none';

  let deleted = false;

  // Schedule actual delete after toast timeout
  const deleteTimer = setTimeout(async () => {
    deleted = true;
    try {
      await deleteRecipe(recipeId);
      loadRecipes();
    } catch (error) {
      showToast('Chyba při mazání receptu');
      if (card) card.style.display = '';
    }
  }, 5000);

  // Show toast with undo
  showToast(`"${recipeName}" smazán.`, {
    undo: () => {
      clearTimeout(deleteTimer);
      if (!deleted) {
        // Restore card
        if (card) card.style.display = '';
      } else {
        // Already deleted, reload
        loadRecipes();
      }
    }
  });
}

// === PHOTO FILE HANDLING ===
let selectedPhotoFile = null;

function setPhotoFile(file) {
  selectedPhotoFile = file;
  previewImg.src = URL.createObjectURL(file);
  dropZone.style.display = 'none';
  dropZonePreview.style.display = 'flex';
}

function clearPhotoFile() {
  selectedPhotoFile = null;
  recipePhoto.value = '';
  previewImg.src = '';
  dropZone.style.display = '';
  dropZonePreview.style.display = 'none';
}

// === ADD MODAL ===
function openAddModal() {
  addForm.reset();
  addStatus.style.display = 'none';
  captionFallback.style.display = 'none';
  submitAddBtn.disabled = false;
  submitAddBtn.textContent = 'Přidat';
  clearPhotoFile();
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

  const hasPhoto = selectedPhotoFile || recipePhoto.files[0];
  const hasUrl = instagramUrl.value.trim();

  if (hasPhoto) {
    await handleAddFromPhoto();
  } else if (hasUrl) {
    await handleAddFromInstagram();
  } else {
    showToast('Zadejte Instagram URL nebo vyberte fotku.');
  }
}

async function handleAddFromInstagram() {
  const url = instagramUrl.value.trim();
  const caption = instagramCaption.value.trim();

  if (!url) return;

  // Show loading state
  addStatus.style.display = 'flex';
  addStatusText.textContent = 'Extrahuji recept z Instagramu...';
  submitAddBtn.disabled = true;

  let extracted = null;

  try {
    if (caption) {
      extracted = await extractRecipeFromCaption(caption);
    } else {
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
    addStatusText.textContent = 'Ukládám recept...';

    const recipeData = {
      name: extracted?.name || 'Nový recept z Instagramu',
      sourceType: 'instagram',
      sourceUrl: url,
      sourceImage: extracted?.imageUrl || null,
      ingredients: extracted?.ingredients || [],
      herbs: extracted?.herbs || [],
      origin: extracted?.origin || '',
      cookTime: extracted?.cookTime || null,
      instructions: extracted?.instructions || '',
      notes: extracted?.notes || ''
    };

    await addRecipe(recipeData);
    closeAddModalHandler();
    await loadRecipes();
    showToast(`"${recipeData.name}" přidán.`);
  } catch (error) {
    console.error('Error saving recipe:', error);
    addStatusText.textContent = 'Chyba: ' + (error.message || 'Nepodařilo se uložit recept');
    submitAddBtn.disabled = false;
  }
}

async function handleAddFromPhoto() {
  const file = selectedPhotoFile || recipePhoto.files[0];
  if (!file) {
    showToast('Vyberte prosím fotku receptu.');
    return;
  }

  addStatus.style.display = 'flex';
  addStatusText.textContent = 'Analyzuji recept z fotky...';
  submitAddBtn.disabled = true;

  try {
    const extracted = await extractRecipeFromPhoto(file);

    addStatusText.textContent = 'Ukládám recept...';

    const recipeData = {
      name: extracted?.name || 'Recept z fotky',
      sourceType: 'handwritten',
      sourceUrl: null,
      sourceImage: null,
      ingredients: extracted?.ingredients || [],
      herbs: extracted?.herbs || [],
      origin: extracted?.origin || '',
      cookTime: extracted?.cookTime || null,
      instructions: extracted?.instructions || '',
      notes: extracted?.notes || ''
    };

    const saved = await addRecipe(recipeData);

    // Upload photo and attach to recipe
    try {
      const imageUrl = await uploadImage(file, saved.id);
      await updateRecipe(saved.id, { sourceImage: imageUrl });
    } catch (imgError) {
      console.log('Image upload skipped:', imgError.message);
    }

    closeAddModalHandler();
    await loadRecipes();
    showToast(`"${recipeData.name}" přidán.`);
  } catch (error) {
    console.error('Error adding recipe from photo:', error);
    addStatusText.textContent = 'Chyba: ' + (error.message || 'Nepodařilo se extrahovat recept');
    submitAddBtn.disabled = false;
  }
}

// === EDIT MODAL ===
async function openEditModal(recipeId) {
  const recipe = await getRecipe(recipeId);
  if (!recipe) return;

  editRecipeId.value = recipe.id;
  editRecipeName.value = recipe.name;

  // Set origin pill
  editRecipeOrigin.querySelectorAll('.origin-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.value === (recipe.origin || ''));
  });

  editCookTime.value = recipe.cookTime || '';
  editHerbs.value = (recipe.herbs || []).join(', ');
  editRecipeInstructions.value = recipe.instructions || '';
  editRecipeNotes.value = recipe.notes || '';

  // Populate ingredients
  editIngredientsList.innerHTML = '';
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    recipe.ingredients.forEach(ing => addIngredientRow(editIngredientsList, ing.name, ing.key));
  } else {
    addIngredientRow(editIngredientsList);
  }

  editModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeEditModalHandler() {
  editModal.classList.remove('active');
  document.body.style.overflow = '';
  // Clear any validation errors
  editRecipeName.classList.remove('error');
  const existingError = editRecipeName.parentElement.querySelector('.form-error');
  if (existingError) existingError.remove();
}

async function handleEditSubmit(e) {
  e.preventDefault();

  // Get active origin pill value
  const activePill = editRecipeOrigin.querySelector('.origin-pill.active');
  const originValue = activePill ? activePill.dataset.value : '';

  const recipeData = {
    name: editRecipeName.value.trim(),
    ingredients: getIngredientsFromList(editIngredientsList),
    herbs: editHerbs.value.split(',').map(h => h.trim().toLowerCase()).filter(h => h),
    origin: originValue,
    cookTime: editCookTime.value ? parseInt(editCookTime.value, 10) : null,
    instructions: editRecipeInstructions.value.trim(),
    notes: editRecipeNotes.value.trim()
  };

  if (!recipeData.name) {
    // Inline validation instead of alert
    editRecipeName.classList.add('error');
    const existingError = editRecipeName.parentElement.querySelector('.form-error');
    if (!existingError) {
      const errorMsg = document.createElement('span');
      errorMsg.className = 'form-error';
      errorMsg.textContent = 'Zadejte prosím název receptu';
      editRecipeName.parentElement.appendChild(errorMsg);
    }
    editRecipeName.focus();
    return;
  }

  // Clear validation error if present
  editRecipeName.classList.remove('error');
  const existingError = editRecipeName.parentElement.querySelector('.form-error');
  if (existingError) existingError.remove();

  try {
    await updateRecipe(editRecipeId.value, recipeData);
    closeEditModalHandler();
    loadRecipes();
    showToast('Recept uložen.');
  } catch (error) {
    showToast('Chyba při ukládání receptu. Zkuste to prosím znovu.');
  }
}

// === HELPERS ===
function addIngredientRow(container, name = '', isKey = false) {
  const row = document.createElement('div');
  row.className = 'ingredient-row';
  row.innerHTML = `
    <input type="text" placeholder="Ingredience" value="${escapeHtml(name)}">
    <label>
      <input type="checkbox" ${isKey ? 'checked' : ''}> Hlavní
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
