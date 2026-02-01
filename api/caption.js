// API endpoint for extracting recipe data from caption text
// POST /api/caption - extract recipe from Instagram caption text
// Using Gemini 2.5 Flash Lite model

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { caption } = req.body;

    if (!caption) {
      return res.status(400).json({ error: 'Caption is required' });
    }

    // Use Gemini to extract recipe from caption
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const prompt = `Extract recipe information from this Instagram post caption:

"${caption}"

Return a JSON object with this structure:
{
  "name": "Recipe name in Czech",
  "ingredients": [
    {"name": "ingredient name", "key": true/false}
  ],
  "origin": "cuisine type in Czech (ceske, italske, thajske, indicke, mexicke, cinske, japonske, americke)" or null,
  "instructions": "Cooking instructions if mentioned",
  "exclusions": ["lepek", "laktoza", "maso", "orechy"] (only include if dish clearly doesn't contain these),
  "notes": "Any tips or notes from the caption"
}

Guidelines:
- Translate recipe name to Czech if needed
- Mark 1-2 main ingredients as "key": true
- If origin/cuisine is mentioned or obvious from the dish, include it
- Extract all ingredients mentioned
- Include cooking steps if described
- Keep the original author's tips in notes

Return ONLY the JSON object, no other text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonText = response.text().trim();

    // Clean up markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const extracted = JSON.parse(jsonText);
    return res.status(200).json(extracted);

  } catch (error) {
    console.error('Caption extraction error:', error);
    return res.status(500).json({
      error: 'Extraction failed',
      details: error.message
    });
  }
};
