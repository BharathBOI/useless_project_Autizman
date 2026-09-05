import http from 'http';
import fs from 'fs';
import path from 'path';
import { EventEngine } from '../src/events/eventEngine';
import { FallbackSerialEngine } from '../src/llm/fallbackEngine';
import { ExpressionClassifier } from '../src/vision/expressionClassifier';

async function runTests() {
  console.log('====================================================');
  console.log('   SERIALOS (V1) - STEP 5 COMPREHENSIVE ACCEPTANCE  ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(title: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`[PASS] ${title}`);
      if (details) console.log(`       ${details}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title}`);
      if (details) console.error(`       ${details}`);
      failed++;
    }
  }

  // 1. Dependency Check
  console.log('--- 1. DEPENDENCY CHECK ---');
  const pkgPath = path.resolve(process.cwd(), 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  assert('package.json exists', !!pkg);
  assert(
    '@mediapipe/tasks-vision installed',
    !!(pkg.dependencies['@mediapipe/tasks-vision'] || pkg.devDependencies['@mediapipe/tasks-vision'])
  );
  assert(
    '@google/generative-ai installed',
    !!(pkg.dependencies['@google/generative-ai'] || pkg.devDependencies['@google/generative-ai'])
  );
  assert('lucide-react installed', !!pkg.dependencies['lucide-react']);
  assert('express installed', !!pkg.dependencies['express']);

  // 2. TypeScript & Build Check
  console.log('\n--- 2. BUILD ARTIFACTS CHECK ---');
  const distHtml = path.resolve(process.cwd(), 'dist/index.html');
  assert('Vite production build output exists (dist/index.html)', fs.existsSync(distHtml));

  // 3. Dev Server Health (Vite & Express)
  console.log('\n--- 3. DEVELOPMENT SERVERS CONNECTIVITY ---');
  const checkUrl = (port: number, pathname: string): Promise<{ ok: boolean; status: number; data: string }> => {
    return new Promise((resolve) => {
      const req = http.get({ hostname: 'localhost', port, path: pathname }, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ ok: res.statusCode === 200, status: res.statusCode || 0, data }));
      });
      req.on('error', (e) => resolve({ ok: false, status: 0, data: e.message }));
      req.setTimeout(2500, () => {
        req.destroy();
        resolve({ ok: false, status: 0, data: 'Timeout' });
      });
    });
  };

  const viteRes = await checkUrl(5173, '/');
  assert('Vite dev server responding on port 5173', viteRes.ok, `Status: ${viteRes.status}`);

  const backendStatus = await checkUrl(3001, '/api/status');
  assert('Express backend responding on port 3001 (/api/status)', backendStatus.ok, backendStatus.data);

  // 4. Runtime Error Free Static Assets Check
  console.log('\n--- 4. STATIC AUDIO SAMPLES CHECK ---');
  const audioDir = path.resolve(process.cwd(), 'public/audio_samples');
  assert('public/audio_samples directory exists', fs.existsSync(audioDir));

  const requiredTracks = [
    'shock_1.mp3',
    'shock_2.mp3',
    'shock_3.mp3',
    'villain_1.mp3',
    'villain_2.mp3',
    'villain_3.mp3',
    'sad_1.mp3',
    'sad_2.mp3',
    'sad_3.mp3',
    'suspense_1.mp3',
    'suspense_2.mp3',
    'cliffhanger_1.mp3',
    'entrance_sting.mp3',
    'exit_sting.mp3',
    'happy_1.mp3',
  ];

  let missingCount = 0;
  for (const track of requiredTracks) {
    const fileExists = fs.existsSync(path.join(audioDir, track));
    if (!fileExists) missingCount++;
  }
  assert('All 15 custom Malayalam serial MP3 audio tracks present', missingCount === 0);

  // 5. Camera & MediaPipe Flow
  console.log('\n--- 5. VISION & MODEL LOADING CHECK ---');
  const wasmDir = path.resolve(process.cwd(), 'node_modules/@mediapipe/tasks-vision/wasm');
  assert(
    'MediaPipe WebAssembly binary files installed locally in node_modules',
    fs.existsSync(wasmDir)
  );

  // 6. Facial Expression Classification & Anger Support
  console.log('\n--- 6. FACIAL EXPRESSION CLASSIFIER CHECK ---');
  const classifier = new ExpressionClassifier();

  // Test Neutral
  const neutralRes = classifier.classify({
    mouthSmileLeft: 0.01,
    mouthSmileRight: 0.01,
    browDownLeft: 0.01,
    browDownRight: 0.01,
  });
  assert(
    'Resting neutral face classified as "neutral"',
    neutralRes.dominantExpression === 'neutral',
    `Dominant: ${neutralRes.dominantExpression}`
  );

  // Test Anger
  const angerRes = classifier.classify({
    browDownLeft: 0.06,
    browDownRight: 0.06,
    eyeSquintLeft: 0.10,
    eyeSquintRight: 0.10,
    mouthPressLeft: 0.06,
    mouthPressRight: 0.06,
  });
  assert(
    'Eyebrow furrow & squint classified as "angry"',
    angerRes.dominantExpression === 'angry',
    `Dominant: ${angerRes.dominantExpression} (${Math.round(angerRes.confidence * 100)}% conf)`
  );

  // Test Sad
  const sadRes = classifier.classify({
    browInnerUp: 0.15,
    mouthFrownLeft: 0.10,
    mouthFrownRight: 0.10,
    mouthLowerDownLeft: 0.06,
  });
  assert(
    'Inner brow lift and mouth frown classified as "sad"',
    sadRes.dominantExpression === 'sad',
    `Dominant: ${sadRes.dominantExpression} (${Math.round(sadRes.confidence * 100)}% conf)`
  );

  // Test Shock / Surprise
  const shockRes = classifier.classify({
    eyeWideLeft: 0.20,
    eyeWideRight: 0.20,
    jawOpen: 0.25,
  });
  assert(
    'Wide eyes & open jaw classified as "surprised"',
    shockRes.dominantExpression === 'surprised',
    `Dominant: ${shockRes.dominantExpression} (${Math.round(shockRes.confidence * 100)}% conf)`
  );

  // 7. Event Engine & Multi-Person Interaction
  console.log('\n--- 7. EVENT ENGINE & MULTI-CHARACTER CORRELATION ---');
  const eventEngine = new EventEngine();

  // Simulate Face 1 enter
  const face1Landmarks = [
    Array.from({ length: 478 }, (_, i) => ({ x: 0.4 + (i % 10) * 0.01, y: 0.4 + (i % 10) * 0.01, z: 0 })),
  ];
  const face1Blendshapes = [
    {
      categories: [
        { categoryName: 'mouthSmileLeft', score: 0.01 },
        { categoryName: 'mouthSmileRight', score: 0.01 },
      ],
    },
  ];

  // Frame 1 at t=0
  eventEngine.processFrame(face1Landmarks, face1Blendshapes, 1000);
  // Frame 2 at t=600ms (exceeds 500ms enter confirmation)
  const enterFrame = eventEngine.processFrame(face1Landmarks, face1Blendshapes, 1600);

  const hasEnterEvent = enterFrame.emittedEvents.some((e) => e.type === 'PERSON_ENTERED');
  assert(
    'Person tracker emits PERSON_ENTERED after 500ms confirmation window',
    hasEnterEvent,
    `Emitted events: ${enterFrame.emittedEvents.map((e) => e.type).join(', ')}`
  );

  // 8. LLM Endpoint Verification
  console.log('\n--- 8. LLM ENDPOINT VERIFICATION ---');
  const postInterpret = (payload: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify(payload);
      const req = http.request(
        {
          hostname: 'localhost',
          port: 3001,
          path: '/api/interpret-scene',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, body: JSON.parse(data) });
            } catch (e) {
              resolve({ status: res.statusCode, body: data });
            }
          });
        }
      );
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  };

  const mockPayload = {
    events: [
      {
        type: 'EXPRESSION_CHANGED',
        description: 'Face 1: neutral ➔ angry',
        timestamp: Date.now(),
        details: { newExpression: 'angry', previousExpression: 'neutral' },
      },
    ],
    charactersPresent: 1,
    activeExpressions: { 'Face 1': 'angry' },
  };

  const llmRes = await postInterpret(mockPayload);
  assert(
    'POST /api/interpret-scene responds with HTTP 200',
    llmRes.status === 200,
    `Status: ${llmRes.status}`
  );
  assert(
    'LLM endpoint responds with JSON payload (either Gemini or Fallback mode)',
    llmRes.body && (llmRes.body.sceneType || llmRes.body.useFallback)
  );

  // 9. Fallback Mode Engine
  console.log('\n--- 9. LOCAL FALLBACK SERIAL ENGINE CHECK ---');
  const fallback = new FallbackSerialEngine();
  const fallbackScene = fallback.interpret(mockPayload);
  assert(
    'Local fallback engine generates complete serial drama scene without internet',
    !!fallbackScene.headline && !!fallbackScene.narration && !!fallbackScene.audioCategory,
    `Headline: "${fallbackScene.headline}" | BGM: ${fallbackScene.audioCategory}`
  );

  // 10. Downloadable Zip Check
  console.log('\n--- 10. PROJECT DOWNLOAD ZIP CHECK ---');
  const zipPath = path.resolve(process.cwd(), 'serialos_v1.zip');
  const publicZipPath = path.resolve(process.cwd(), 'public/serialos_v1.zip');
  assert('Root serialos_v1.zip archive exists', fs.existsSync(zipPath));
  assert('Public serialos_v1.zip in-app download asset exists', fs.existsSync(publicZipPath));

  console.log('\n====================================================');
  console.log(`   ACCEPTANCE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
