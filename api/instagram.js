// API endpoint for extracting recipe data from Instagram URL
// POST /api/instagram - extract recipe from Instagram post URL
// Uses Gemini for image/video analysis + Claude for text extraction

const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

module.exports = async (req, res) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Try to get data via Instagram oEmbed API
    const oEmbedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`;

    let caption = '';
    let authorName = '';
    let thumbnailUrl = '';

    try {
      const oEmbedResponse = await fetch(oEmbedUrl);
      if (oEmbedResponse.ok) {
        const oEmbedData = await oEmbedResponse.json();
        caption = oEmbedData.title || '';
        authorName = oEmbedData.author_name || '';
        thumbnailUrl = oEmbedData.thumbnail_url || '';
      }
    } catch (oEmbedError) {
      console.log('oEmbed failed, continuing with URL only');
    }

    let extractedFromImage = null;
    let extractedFromText = null;

    // Try Gemini for image analysis if we have a thumbnail
    if (thumbnailUrl && process.env.GOOGLE_AI_API_KEY) {
      try {
        // Fetch the image
        const imageResponse = await fetch(thumbnailUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const imageBase64 = Buffer.from(imageBuffer).toString('base64');
        const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `Analyze this food/recipe image and extract recipe information.

Return a JSON object with this structure:
{
  "name": "Recipe name in Czech",
  "ingredients": [
    {"name": "ingredient name", "key": true/false}
  ],
  "origin": "cuisine type in Czech (ceske, italske, thajske, indicke, mexicke, cinske, japonske, americke)" or null,
  "instructions": "Estimated cooking steps based on the dish",
  "exclusions": ["lepek", "laktoza", "maso", "orechy"] (only include if dish clearly doesn't contain these),
  "notes": "Any observations about the dish"
}

Guidelines:
- Name the dish in Czech
- Mark 1-2 main visible ingredients as "key": true
- Estimate common ingredients for this type of dish
- Guess the cuisine origin from visual style
- Keep instructions brief, 3-5 steps max

Return ONLY the JSON object, no other text.`;

        const result = await model.generateContent([
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: imageBase64
            }
          }
        ]);

        const geminiResponse = result.response.text();
        let jsonText = geminiResponse.trim();
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }

        extractedFromImage = JSON.parse(jsonText);
      } catch (geminiError) {
        console.log('Gemini image analysis failed:', geminiError.message);
      }
    }

    // Use Claude for caption text analysis if we have caption
    if (caption && process.env.ANTHROPIC_API_KEY) {
      try {
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [
            {
              role: 'user',
              content: `Extract recipe information from this Instagram post caption:

"${caption}"

Author: ${authorName}

Return a JSON object with this structure:
{
  "name": "Recipe name in Czech",
  "ingredients": [
    {"name": "ingredient name", "key": true/false}
  ],
  "origin": "cuisine type in Czech (ceske, italske, thajske, indicke, mexicke, cinske, japonske, americke)" or null,
  "instructions": "Cooking instructions if mentioned",
  "exclusions": [],
  "notes": "Any tips or notes from the caption"
}

Guidelines:
- Translate recipe name to Czech if needed
- Mark 1-2 main ingredients as "key": true
- If origin/cuisine is mentioned or obvious from the dish, include it
- Only include ingredients that are explicitly mentioned
- Leave instructions empty if not mentioned in the caption

Return ONLY the JSON object, no other text.`
            }
          ]
        });

        const content = response.content[0];
        if (content.type === 'text') {
          let jsonText = content.text.trim();
          if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
          } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
          }

          extractedFromText = JSON.parse(jsonText);
        }
      } catch (claudeError) {
        console.log('Claude text analysis failed:', claudeError.message);
      }
    }

    // Merge results - prefer text data but supplement with image data
    const merged = mergeExtractions(extractedFromText, extractedFromImage);

    if (merged && merged.name) {
      return res.status(200).json({
        name: merged.name,
        ingredients: merged.ingredients || [],
        origin: merged.origin || null,
        instructions: merged.instructions || '',
        exclusions: merged.exclusions || [],
        notes: merged.notes || '',
        imageUrl: thumbnailUrl || null
      });
    }

    // If nothing worked, return empty
    return res.status(200).json({
      name: '',
      ingredients: [],
      origin: null,
      instructions: '',
      exclusions: [],
      notes: '',
      imageUrl: thumbnailUrl || null
    });

  } catch (error) {
    console.error('Instagram extraction error:', error);
    return res.status(500).json({
      error: 'Extraction failed',
      details: error.message
    });
  }
};

// Merge extractions from text and image analysis
function mergeExtractions(fromText, fromImage) {
  if (!fromText && !fromImage) return null;
  if (!fromText) return fromImage;
  if (!fromImage) return fromText;

  // Prefer text-extracted name if available, otherwise use image
  const name = fromText.name || fromImage.name;

  // Merge ingredients - combine unique ingredients
  const ingredientMap = new Map();

  // Add text ingredients first (higher priority)
  (fromText.ingredients || []).forEach(ing => {
    ingredientMap.set(ing.name.toLowerCase(), ing);
  });

  // Add image ingredients if not already present
  (fromImage.ingredients || []).forEach(ing => {
    const key = ing.name.toLowerCase();
    if (!ingredientMap.has(key)) {
      ingredientMap.set(key, ing);
    }
  });

  const ingredients = Array.from(ingredientMap.values());

  // Prefer text for instructions if available
  const instructions = fromText.instructions || fromImage.instructions || '';

  // Prefer text origin if available
  const origin = fromText.origin || fromImage.origin || null;

  // Merge exclusions
  const exclusions = [...new Set([
    ...(fromText.exclusions || []),
    ...(fromImage.exclusions || [])
  ])];

  // Combine notes
  const notes = [fromText.notes, fromImage.notes].filter(Boolean).join('\n');

  return { name, ingredients, instructions, origin, exclusions, notes };
}
