// API endpoint for listing and creating recipes
// GET /api/recipes - list all recipes with optional filters
// POST /api/recipes - create new recipe

const admin = require('firebase-admin');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();
const COLLECTION = 'recipes';

module.exports = async (req, res) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      return await listRecipes(req, res);
    } else if (req.method === 'POST') {
      return await createRecipe(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

async function listRecipes(req, res) {
  const { search, origin, exclusions } = req.query;

  let query = db.collection(COLLECTION).orderBy('createdAt', 'desc');

  // Apply origin filter at query level
  if (origin) {
    query = query.where('origin', '==', origin);
  }

  const snapshot = await query.get();
  let recipes = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
  }));

  // Apply search filter (client-side, Firestore doesn't support full-text search)
  if (search) {
    const searchLower = search.toLowerCase();
    recipes = recipes.filter(recipe => {
      const nameMatch = recipe.name?.toLowerCase().includes(searchLower);
      const ingredientMatch = recipe.ingredients?.some(ing =>
        ing.name?.toLowerCase().includes(searchLower)
      );
      return nameMatch || ingredientMatch;
    });
  }

  // Apply exclusions filter
  if (exclusions) {
    const exclusionList = exclusions.split(',');
    recipes = recipes.filter(recipe => {
      return exclusionList.every(ex =>
        recipe.exclusions && recipe.exclusions.includes(ex)
      );
    });
  }

  return res.status(200).json(recipes);
}

async function createRecipe(req, res) {
  const recipeData = req.body;

  if (!recipeData.name) {
    return res.status(400).json({ error: 'Recipe name is required' });
  }

  const docRef = await db.collection(COLLECTION).add({
    ...recipeData,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return res.status(201).json({
    id: docRef.id,
    ...recipeData
  });
}
