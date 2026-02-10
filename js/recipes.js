// Recipe CRUD operations (Realtime Database)
import { db, storage, ref, get, set, push, update, remove, child, storageRef, uploadBytes, getDownloadURL } from './firebase-config.js';

// API base URL - Vercel serverless functions for extraction
const API_BASE = 'https://recepty-abr011s-projects.vercel.app';

const DB_PATH = 'recipes';

// Demo data for local development (when Firebase not configured)
const demoRecipes = [
  {
    id: 'demo1',
    name: 'Kureci pad thai',
    sourceType: 'instagram',
    sourceUrl: 'https://instagram.com/p/example1',
    sourceImage: null,
    ingredients: [
      { name: 'kureci prsa', key: true },
      { name: 'ryzove nudle', key: false },
      { name: 'vejce', key: false },
      { name: 'arasidy', key: false }
    ],
    origin: 'thajske',
    tags: ['hlavni jidlo', 'rychle'],
    exclusions: ['laktoza'],
    instructions: '1. Nakrajej kure na kousky\n2. Opec na pánvi\n3. Přidej nudle a vejce\n4. Dochut rybí omáčkou',
    notes: 'Místo kuřete lze použít tofu',
    createdAt: new Date('2026-01-15').toISOString()
  },
  {
    id: 'demo2',
    name: 'Svickova na smetane',
    sourceType: 'handwritten',
    sourceUrl: null,
    sourceImage: null,
    ingredients: [
      { name: 'hovezi svickova', key: true },
      { name: 'smetana', key: false },
      { name: 'mrkev', key: false },
      { name: 'brusinky', key: false }
    ],
    origin: 'ceske',
    tags: ['hlavni jidlo', 'slavnostni'],
    exclusions: [],
    instructions: '1. Maso naložit do zeleniny\n2. Péct 3 hodiny\n3. Připravit omáčku ze smetany',
    notes: 'Babicin recept',
    createdAt: new Date('2026-01-10').toISOString()
  },
  {
    id: 'demo3',
    name: 'Spaghetti carbonara',
    sourceType: 'manual',
    sourceUrl: null,
    sourceImage: null,
    ingredients: [
      { name: 'spaghetti', key: true },
      { name: 'slanina', key: true },
      { name: 'vejce', key: false },
      { name: 'parmezan', key: false }
    ],
    origin: 'italske',
    tags: ['hlavni jidlo', 'rychle'],
    exclusions: [],
    instructions: '1. Uvařit těstoviny\n2. Opéct slaninu\n3. Smíchat s vejcem a sýrem',
    notes: 'Nikdy nepřidávat smetanu!',
    createdAt: new Date('2026-01-20').toISOString()
  }
];

// Check if Firebase is configured
function isFirebaseConfigured() {
  try {
    return db !== null && db !== undefined;
  } catch {
    return false;
  }
}

// Get all recipes (unfiltered)
export async function getAllRecipes() {
  if (!isFirebaseConfigured()) {
    return [...demoRecipes];
  }

  try {
    const dbRef = ref(db, DB_PATH);
    const snapshot = await get(dbRef);

    if (!snapshot.exists()) {
      return [];
    }

    const data = snapshot.val();
    return Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
  } catch (error) {
    console.error('Error getting recipes:', error);
    return [];
  }
}

// Get filtered recipes
export async function getRecipes(filters = {}) {
  if (!isFirebaseConfigured()) {
    console.log('Using demo data (Firebase not configured)');
    return filterRecipes(demoRecipes, filters);
  }

  try {
    const dbRef = ref(db, DB_PATH);
    const snapshot = await get(dbRef);

    if (!snapshot.exists()) {
      return [];
    }

    // Convert object to array with IDs
    const data = snapshot.val();
    let recipes = Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));

    return filterRecipes(recipes, filters);
  } catch (error) {
    console.error('Error getting recipes:', error);
    return [];
  }
}

// Filter recipes (client-side filtering)
function filterRecipes(recipes, filters) {
  let filtered = [...recipes];

  // Include filter (must have ALL selected main ingredients)
  if (filters.ingredients && filters.ingredients.length > 0) {
    filtered = filtered.filter(recipe => {
      return filters.ingredients.every(filterIng => {
        const filterLower = filterIng.toLowerCase();
        return recipe.ingredients && recipe.ingredients.some(ing =>
          ing.key && ing.name.toLowerCase() === filterLower
        );
      });
    });
  }

  // Herbs exclusion filter (hide recipes that contain selected herbs)
  if (filters.herbs && filters.herbs.length > 0) {
    filtered = filtered.filter(recipe => {
      // Keep recipe only if it doesn't have any of the excluded herbs
      return !filters.herbs.some(excludedHerb => {
        const herbLower = excludedHerb.toLowerCase();
        return recipe.herbs && recipe.herbs.some(h => h.toLowerCase() === herbLower);
      });
    });
  }

  // Sort by createdAt descending (newest first)
  filtered.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
    return dateB - dateA;
  });

  return filtered;
}

// Get single recipe
export async function getRecipe(id) {
  if (!isFirebaseConfigured()) {
    return demoRecipes.find(r => r.id === id) || null;
  }

  try {
    const dbRef = ref(db, `${DB_PATH}/${id}`);
    const snapshot = await get(dbRef);

    if (snapshot.exists()) {
      return { id, ...snapshot.val() };
    }
    return null;
  } catch (error) {
    console.error('Error getting recipe:', error);
    return null;
  }
}

// Add new recipe
export async function addRecipe(recipeData) {
  if (!isFirebaseConfigured()) {
    const newRecipe = {
      ...recipeData,
      id: 'demo' + Date.now(),
      createdAt: new Date().toISOString()
    };
    demoRecipes.unshift(newRecipe);
    return newRecipe;
  }

  try {
    const dbRef = ref(db, DB_PATH);
    const newRef = push(dbRef);
    const newRecipe = {
      ...recipeData,
      createdAt: new Date().toISOString()
    };
    await set(newRef, newRecipe);
    return { id: newRef.key, ...newRecipe };
  } catch (error) {
    console.error('Error adding recipe:', error);
    throw error;
  }
}

// Update recipe
export async function updateRecipe(id, recipeData) {
  if (!isFirebaseConfigured()) {
    const index = demoRecipes.findIndex(r => r.id === id);
    if (index !== -1) {
      demoRecipes[index] = { ...demoRecipes[index], ...recipeData };
      return demoRecipes[index];
    }
    return null;
  }

  try {
    const dbRef = ref(db, `${DB_PATH}/${id}`);
    await update(dbRef, recipeData);
    return { id, ...recipeData };
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
}

// Delete recipe
export async function deleteRecipe(id) {
  if (!isFirebaseConfigured()) {
    const index = demoRecipes.findIndex(r => r.id === id);
    if (index !== -1) {
      demoRecipes.splice(index, 1);
      return true;
    }
    return false;
  }

  try {
    const dbRef = ref(db, `${DB_PATH}/${id}`);
    await remove(dbRef);
    return true;
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
}

// Upload image to storage
export async function uploadImage(file, recipeId) {
  if (!isFirebaseConfigured()) {
    return URL.createObjectURL(file);
  }

  try {
    const fileRef = storageRef(storage, `recipes/${recipeId}/${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// OCR - Extract text from handwritten recipe photo
export async function extractRecipeFromPhoto(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await fetch(`${API_BASE}/api/ocr`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('OCR extraction failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error extracting recipe from photo:', error);
    return {
      name: '',
      ingredients: [],
      instructions: 'Text extrahovaný z fotky bude zde...',
      notes: ''
    };
  }
}

// Extract recipe from Instagram URL
export async function extractRecipeFromInstagram(url) {
  try {
    const response = await fetch(`${API_BASE}/api/instagram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Instagram extraction failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error extracting recipe from Instagram:', error);
    throw error;
  }
}

// Extract recipe from caption text (fallback when URL extraction fails)
export async function extractRecipeFromCaption(caption) {
  try {
    const response = await fetch(`${API_BASE}/api/caption`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ caption })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Caption extraction failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error extracting recipe from caption:', error);
    throw error;
  }
}
