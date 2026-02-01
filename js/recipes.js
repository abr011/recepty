// Recipe CRUD operations
import { db, storage, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, ref, uploadBytes, getDownloadURL } from './firebase-config.js';

const COLLECTION_NAME = 'recipes';

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
    createdAt: new Date('2026-01-15')
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
    createdAt: new Date('2026-01-10')
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
    createdAt: new Date('2026-01-20')
  },
  {
    id: 'demo4',
    name: 'Jáhlový krém',
    sourceType: 'instagram',
    sourceUrl: 'https://www.instagram.com/reel/DTdnjPqDOgI/',
    sourceImage: null,
    ingredients: [
      { name: 'jáhly', key: true },
      { name: 'kolagen', key: false },
      { name: 'kakao (nepražené, plnotučné)', key: false },
      { name: 'žloutky', key: true },
      { name: 'sůl', key: false },
      { name: 'řecký jogurt z a2 mléka', key: false }
    ],
    origin: 'ceske',
    tags: ['snidane', 'zdrave'],
    exclusions: ['lepek'],
    instructions: '1. Uvařit jáhly\n2. Přidat kolagen a kakao\n3. Vmíchat žloutky\n4. Osolit\n5. Podávat s řeckým jogurtem',
    notes: 'Žloutky do každé kaše! Inspirace od @sweet_melange',
    createdAt: new Date('2026-01-30')
  }
];

// Check if Firebase is configured
function isFirebaseConfigured() {
  try {
    return db && db._databaseId && db._databaseId.projectId !== 'YOUR_PROJECT_ID';
  } catch {
    return false;
  }
}

// Get all recipes
export async function getRecipes(filters = {}) {
  if (!isFirebaseConfigured()) {
    console.log('Using demo data (Firebase not configured)');
    return filterDemoRecipes(demoRecipes, filters);
  }

  try {
    let q = collection(db, COLLECTION_NAME);

    // Apply filters
    if (filters.origin) {
      q = query(q, where('origin', '==', filters.origin));
    }

    // Note: Complex filtering (search, exclusions) done client-side
    const snapshot = await getDocs(q);
    let recipes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return filterRecipes(recipes, filters);
  } catch (error) {
    console.error('Error getting recipes:', error);
    return [];
  }
}

// Filter recipes (works for both Firebase and demo data)
function filterRecipes(recipes, filters) {
  let filtered = [...recipes];

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(recipe => {
      const nameMatch = recipe.name.toLowerCase().includes(searchLower);
      const ingredientMatch = recipe.ingredients.some(ing =>
        ing.name.toLowerCase().includes(searchLower)
      );
      return nameMatch || ingredientMatch;
    });
  }

  // Origin filter
  if (filters.origin) {
    filtered = filtered.filter(recipe => recipe.origin === filters.origin);
  }

  // Exclusion filter (show recipes that don't contain specified items)
  if (filters.exclusions && filters.exclusions.length > 0) {
    filtered = filtered.filter(recipe => {
      // Recipe must have ALL selected exclusions marked
      return filters.exclusions.every(ex =>
        recipe.exclusions && recipe.exclusions.includes(ex)
      );
    });
  }

  return filtered;
}

function filterDemoRecipes(recipes, filters) {
  return filterRecipes(recipes, filters);
}

// Get single recipe
export async function getRecipe(id) {
  if (!isFirebaseConfigured()) {
    return demoRecipes.find(r => r.id === id) || null;
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
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
      createdAt: new Date()
    };
    demoRecipes.unshift(newRecipe);
    return newRecipe;
  }

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...recipeData,
      createdAt: new Date()
    });
    return { id: docRef.id, ...recipeData };
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
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, recipeData);
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
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
}

// Upload image to storage
export async function uploadImage(file, recipeId) {
  if (!isFirebaseConfigured()) {
    // Return a placeholder URL for demo mode
    return URL.createObjectURL(file);
  }

  try {
    const fileRef = ref(storage, `recipes/${recipeId}/${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// OCR - Extract text from handwritten recipe photo
export async function extractRecipeFromPhoto(imageFile) {
  // This would call the Vercel API endpoint which uses Claude for OCR
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await fetch('/api/ocr', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('OCR extraction failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error extracting recipe from photo:', error);
    // Return placeholder for demo
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
    const response = await fetch('/api/instagram', {
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
