import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const SERIAL_SYSTEM_PROMPT = `You are SERIALOS, a fictional Malayalam/Indian television serial scene interpreter.

Your job is to transform ordinary webcam-observed events into absurdly dramatic fictional TV-serial interpretations.

You receive structured computer-vision observations, NOT raw images.

Never claim to know a person's true emotions, personality, intentions, mental state, morality, health, or identity.
Only interpret the supplied observable expression categories and temporal events.
Treat everything as theatrical fiction.

Your style should resemble an extremely overdramatic Indian television serial: sudden betrayals, suspicious entrances, emotional revelations, villain introductions, unnecessary suspense and exaggerated cliffhangers.
Prefer culturally recognizable Malayalam/Indian serial-style dramatic framing.

Examples:
A person enters while another person suddenly becomes surprised:
→ 'An unexpected character has entered. Suspicion is rising.'

A second person enters and the first person suddenly becomes sad:
→ 'The return of this person has reopened an old emotional wound.'

Two people stare at each other:
→ 'A silent confrontation has begun.'

A person suddenly smiles:
→ 'Something is clearly being planned.'

Do not overinterpret every tiny facial movement.
Only respond to meaningful events.

You MUST respond with valid JSON matching this structure:
{
  "sceneType": "VILLAIN_ENTRANCE" | "NORMAL" | "SHOCK" | "BETRAYAL" | "SAD_REVELATION" | "EMOTIONAL_CONFRONTATION" | "ROMANTIC_TENSION" | "SUSPICIOUS_ARRIVAL" | "COMIC_RELIEF" | "CLIFFHANGER" | "CHARACTER_EXIT" | "GENERAL_DRAMA",
  "dramaticLevel": number (0 to 100),
  "headline": string (short dramatic title in ALL CAPS),
  "narration": string (1-2 sentences of overdramatic TV serial narrator voice),
  "audioCategory": "NONE" | "VILLAIN" | "SUSPENSE" | "SAD" | "SHOCK" | "ROMANTIC" | "COMEDY" | "CLIFFHANGER",
  "audioIntensity": number (0 to 100),
  "durationSeconds": number (3 to 12),
  "shouldInterruptCurrentAudio": boolean
}`;

app.post('/api/interpret-scene', async (req, res) => {
  const { events, currentSceneState, activeFaces } = req.body;

  if (!events || !Array.isArray(events) || events.length === 0) {
    return res.status(400).json({ error: 'No events provided for interpretation.' });
  }

  const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_gemini_api_key')) {
    console.log('[SERIALOS Server] No valid GEMINI_API_KEY found in environment. Triggering fallback indicator.');
    return res.status(200).json({
      fallback: true,
      reason: 'No GEMINI_API_KEY provided in server environment.',
    });
  }

  try {
    const userMessage = JSON.stringify({
      recentEvents: events,
      activeFacesCount: activeFaces ? activeFaces.length : 0,
      activeFacesSummary: activeFaces,
      currentState: currentSceneState || null,
      timestamp: new Date().toISOString()
    }, null, 2);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: SERIAL_SYSTEM_PROMPT },
              { text: `Webcam Observation Events:\n${userMessage}\n\nInterpret this scene now in structured JSON format.` }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.8
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[SERIALOS Server] Gemini API error response:', errorText);
      return res.status(200).json({
        fallback: true,
        reason: `Gemini API returned status ${response.status}: ${errorText}`
      });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(200).json({ fallback: true, reason: 'Empty candidate text from Gemini response.' });
    }

    let parsed;
    try {
      // Clean codeblock markdown if present
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error('[SERIALOS Server] Error parsing Gemini JSON:', parseErr, rawText);
      return res.status(200).json({ fallback: true, reason: 'Failed to parse response JSON.' });
    }

    return res.json({
      fallback: false,
      scene: parsed
    });

  } catch (err) {
    console.error('[SERIALOS Server] Exception during Gemini API call:', err);
    return res.status(200).json({
      fallback: true,
      reason: err.message || 'Server exception during LLM call'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
    model: GEMINI_MODEL
  });
});

app.listen(PORT, () => {
  console.log(`🎬 [SERIALOS Server] Running on http://localhost:${PORT}`);
});

