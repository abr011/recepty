// API endpoint for single recipe operations
// GET /api/recipes/[id] - get single recipe
// PUT /api/recipes/[id] - update recipe
// DELETE /api/recipes/[id] - delete recipe

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

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Recipe ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getRecipe(id, res);
      case 'PUT':
        return await updateRecipe(id, req, res);
      case 'DELETE':
        return await deleteRecipe(id, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

async function getRecipe(id, res) {
  const doc = await db.collection(COLLECTION).doc(id).get();

  if (!doc.exists) {
    return res.status(404).json({ error: 'Recipe not found' });
  }

  return res.status(200).json({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
  });
}

async function updateRecipe(id, req, res) {
  const docRef = db.collection(COLLECTION).doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    return res.status(404).json({ error: 'Recipe not found' });
  }

  const updateData = req.body;
  delete updateData.id; // Don't update ID
  delete updateData.createdAt; // Don't update creation time

  await docRef.update({
    ...updateData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return res.status(200).json({
    id,
    ...updateData
  });
}

async function deleteRecipe(id, res) {
  const docRef = db.collection(COLLECTION).doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    return res.status(404).json({ error: 'Recipe not found' });
  }

  await docRef.delete();

  return res.status(200).json({ success: true });
}
