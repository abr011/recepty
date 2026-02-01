// API endpoint for OCR extraction from handwritten recipe photos
// POST /api/ocr - extract recipe text from uploaded image

const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

module.exports = async (req, res) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get image from request body (base64 encoded)
    const { image, mimeType = 'image/jpeg' } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Remove data URL prefix if present
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

    // Call Claude API with vision
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: base64Image
              }
            },
            {
              type: 'text',
              text: `Analyze this handwritten recipe image and extract the recipe information.

Return a JSON object with the following structure:
{
  "name": "Recipe name",
  "ingredients": [
    {"name": "ingredient name", "key": true/false}
  ],
  "instructions": "Step by step instructions",
  "notes": "Any additional notes"
}

Guidelines:
- Mark 1-2 main ingredients as "key": true (the primary protein or main component)
- If you can't read something clearly, make your best guess and add a note
- Format instructions as numbered steps
- Extract any tips or notes mentioned

Return ONLY the JSON object, no other text.`
            }
          ]
        }
      ]
    });

    // Parse the response
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Try to parse as JSON
    let extracted;
    try {
      // Handle potential markdown code blocks
      let jsonText = content.text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      extracted = JSON.parse(jsonText);
    } catch (parseError) {
      // If parsing fails, return raw text as instructions
      extracted = {
        name: '',
        ingredients: [],
        instructions: content.text,
        notes: 'Automaticka extrakce selhala - prosim upravte rucne'
      };
    }

    return res.status(200).json(extracted);
  } catch (error) {
    console.error('OCR Error:', error);
    return res.status(500).json({
      error: 'OCR extraction failed',
      details: error.message
    });
  }
};
