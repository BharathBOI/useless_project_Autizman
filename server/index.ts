import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SERIAL_SYSTEM_PROMPT } from './prompts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY || '';
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

let genAI: GoogleGenerativeAI | null = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
  console.log(`[SERIALOS SERVER] Gemini initialized with model: ${modelName}`);
} else {
  console.warn('[SERIALOS SERVER] No GEMINI_API_KEY found. Local fallback classifier will be used.');
}

// Health & Status check
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!apiKey,
    model: modelName,
  });
});

// Scene Interpretation Endpoint
app.post('/api/interpret-scene', async (req, res) => {
  const { events, charactersPresent, activeExpressions } = req.body;

  if (!events || events.length === 0) {
    return res.status(400).json({ error: 'No events provided in request body' });
  }

  // If no API key configured, notify client to use local fallback
  if (!genAI || !apiKey) {
    return res.json({
      useFallback: true,
      reason: 'GEMINI_API_KEY not configured on server',
    });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.85,
      },
      systemInstruction: SERIAL_SYSTEM_PROMPT,
    });

    const userPrompt = `
CURRENT SERIAL OBSERVATIONS:
- Visible Characters Count: ${charactersPresent}
- Active Expressions: ${JSON.stringify(activeExpressions || {})}
- Recent Semantic Events in Time Window:
${events
  .map(
    (e: any, idx: number) =>
      `${idx + 1}. [${e.type}] ${e.description || JSON.stringify(e)}`
  )
  .join('\n')}

Interpret these observations as an exaggerated Indian/Malayalam television serial dramatic moment.
Remember the special cases: if sadness/frowning occurs, or someone enters and another person turns sad, treat it with devastating melodrama.
Return JSON ONLY.
`;

    const result = await model.generateContent(userPrompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    return res.json({
      ...parsed,
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('[SERIALOS SERVER] Gemini generation error:', error?.message || error);
    // Return gracefully so client instantly falls back without breaking UX
    return res.json({
      useFallback: true,
      reason: error?.message || 'Gemini API call failed',
    });
  }
});

app.listen(PORT, () => {
  console.log(`🎬 SERIALOS Backend Server running on http://localhost:${PORT}`);
});
