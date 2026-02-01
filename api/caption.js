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
    // Parse body - handle both pre-parsed and raw body
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }
    const { caption } = body;

    if (!caption) {
      return res.status(400).json({ error: 'Caption is required' });
    }

    // Use Gemini 2.5 Flash Lite (lighter model, may have separate quota)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const prompt = `Extract recipe information from this Instagram post caption and return ONLY a valid JSON object:

Caption: "${caption}"

JSON structure:
{"name":"string","ingredients":[{"name":"string","key":boolean}],"origin":"string or null","instructions":"string","exclusions":[],"notes":"string"}

Rules:
- name: Recipe name in Czech
- ingredients: List with name and key (true for 1-2 main ingredients)
- origin: One of: ceske, italske, thajske, indicke, mexicke, cinske, japonske, americke, or null
- instructions: Cooking steps if mentioned
- exclusions: Only include "lepek", "laktoza", "maso", "orechy" if dish clearly doesn't contain these
- notes: Any tips from the caption

Return ONLY the JSON, no markdown, no explanation.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonText = response.text().trim();

    // Clean up markdown code blocks if present
    jsonText = jsonText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');

    // Find JSON object in response
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in Gemini response:', jsonText.substring(0, 200));
      return res.status(500).json({ error: 'Extraction failed', details: 'No JSON in response' });
    }

    try {
      const extracted = JSON.parse(jsonMatch[0]);
      return res.status(200).json(extracted);
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message, jsonMatch[0].substring(0, 200));
      return res.status(500).json({ error: 'Extraction failed', details: 'Invalid JSON format' });
    }

  } catch (error) {
    console.error('Caption extraction error:', error);
    return res.status(500).json({ error: 'Extraction failed', details: error.message });
  }
};
