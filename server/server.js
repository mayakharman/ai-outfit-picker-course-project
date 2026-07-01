require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();

// CORS_ORIGIN can be a comma-separated list of allowed origins (e.g. the
// deployed Vercel URL). Left unset, every origin is allowed — fine for
// local dev, but set it in production once the frontend URL is known.
const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim());
app.use(cors(allowedOrigins ? { origin: allowedOrigins } : {}));
app.use(express.json({ limit: '15mb' }));

const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from env
const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-4-8';
const PORT = process.env.PORT || 4000;

function parseDataUrl(dataUrl) {
  const match = /^data:(image\/\w+);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error('Invalid image data URL');
  return { mediaType: match[1], base64: match[2] };
}

// Reports which providers are configured WITHOUT ever printing the key
// values — only whether each env var is present. Use this to confirm
// configuration instead of guessing or logging secrets.
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    port: PORT,
    providers: {
      anthropic: {
        configured: Boolean(process.env.ANTHROPIC_API_KEY),
        usedFor: ['detect-clothing', 'explain-outfit', 'select-outfit'],
      },
      photoroom: {
        configured: Boolean(process.env.PHOTOROOM_API_KEY),
        usedFor: ['process-clothing'],
      },
      openai: {
        configured: Boolean(process.env.OPENAI_API_KEY),
        usedFor: ['generate-outfit-image'],
      },
    },
  });
});

const DETECTION_SYSTEM_PROMPT = `את/ה מערכת לזיהוי בגדים בלבד בתוך תמונה, לצורך בניית ארון דיגיטלי.

זהה/י רק פריטי לבוש מהקטגוריות הבאות: top (חולצה), bottom (מכנסיים), skirt (חצאית), dress (שמלה), outerwear (ג'קט/מעיל), shoes (נעליים).

חשוב מאוד - אסור בהחלט להחזיר אקססוריז: תיקים, תכשיטים, כובעים, חגורות, משקפי שמש, שעונים, צעיפים, כפפות, עניבות וכל אקססורי אחר. אם מופיע אקססורי בתמונה - יש להתעלם ממנו לחלוטין ולא להכניס אותו לרשימה.

לכל פריט לבוש שזוהה, החזר/י אובייקט עם:
- type: שם הפריט בעברית (למשל "חולצה", "מכנסי ג'ינס", "ג'קט עור")
- category: אחת מהקטגוריות: top, bottom, skirt, dress, outerwear, shoes
- color: הצבע העיקרי, אחת מהאפשרויות: שחור, לבן, אפור, בז', חום, כחול, תכלת, אדום, ירוק, צהוב, כתום, סגול, ורוד
- style: הסגנון, אחת מהאפשרויות: קז'ואל, אלגנטי, ספורטיבי, רחוב, קלאסי
- season: העונה המתאימה, אחת מהאפשרויות: קיץ, חורף, אביב/סתיו, כל השנה
- confidence: מספר בין 0 ל-1 המבטא עד כמה את/ה בטוח/ה בזיהוי הפריט

אם איכות הזיהוי נמוכה, תן/י confidence נמוך (מתחת ל-0.65) במקום להמציא מידע.`;

const CLOTHING_SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          category: { type: 'string', enum: ['top', 'bottom', 'skirt', 'dress', 'outerwear', 'shoes'] },
          color: { type: 'string' },
          style: { type: 'string' },
          season: { type: 'string' },
          confidence: { type: 'number' },
        },
        required: ['type', 'category', 'color', 'style', 'season', 'confidence'],
        additionalProperties: false,
      },
    },
  },
  required: ['items'],
  additionalProperties: false,
};

// Shared by /api/detect-clothing and /api/process-clothing so both routes
// run the exact same Claude Vision logic — no duplicated prompt/schema.
async function detectClothingWithClaude(imageDataUrl, logPrefix = 'detect-clothing') {
  const { mediaType, base64 } = parseDataUrl(imageDataUrl);
  console.log(`[${logPrefix}] image received: ${mediaType}, ${Math.round(base64.length / 1024)}KB (base64)`);

  console.log(`[${logPrefix}] detection started (model=${MODEL})`);
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: DETECTION_SYSTEM_PROMPT,
    output_config: { format: { type: 'json_schema', schema: CLOTHING_SCHEMA } },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: 'זהה את פריטי הלבוש בתמונה הזו לפי ההנחיות שלך.' },
        ],
      },
    ],
  });
  console.log(`[${logPrefix}] provider response: stop_reason=${response.stop_reason}`);

  const textBlock = response.content.find((block) => block.type === 'text');
  const parsed = JSON.parse(textBlock.text);
  console.log(`[${logPrefix}] detected ${parsed.items.length} item(s)`);
  return parsed.items;
}

app.post('/api/detect-clothing', async (req, res) => {
  console.log('[detect-clothing] request received');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[detect-clothing] ANTHROPIC_API_KEY is not set — cannot call Claude vision');
    return res.status(501).json({ error: 'anthropic_not_configured' });
  }

  try {
    if (!req.body.image) {
      console.error('[detect-clothing] no image in request body');
      return res.status(400).json({ error: 'missing_image' });
    }

    const items = await detectClothingWithClaude(req.body.image);
    res.json({ items });
  } catch (err) {
    // Log only curated fields — never the raw error object, which could
    // carry request/response internals — and never any API key.
    console.error(`[detect-clothing] failed: status=${err.status || 'n/a'} message=${err.message}`);
    res.status(500).json({ error: 'detection_failed' });
  }
});

// --- Photoroom: background removal + white-square product photo ---
// Takes the original garment photo and returns a brand-new image with the
// background removed and the garment centered on a pure white square — it
// never crops pixels locally, Photoroom does the isolation server-side.
// The key is read only from process.env and never logged or sent to the client.
const PHOTOROOM_API_URL = 'https://image-api.photoroom.com/v2/edit';

async function removeBackgroundWithPhotoroom(imageDataUrl) {
  if (!process.env.PHOTOROOM_API_KEY) {
    const err = new Error('PHOTOROOM_API_KEY not configured');
    err.notConfigured = true;
    throw err;
  }

  const { mediaType, base64 } = parseDataUrl(imageDataUrl);
  const buffer = Buffer.from(base64, 'base64');
  console.log(`[process-clothing] sending image to Photoroom: ${mediaType}, ${Math.round(buffer.length / 1024)}KB`);

  // node-fetch v2 (required at the top of this file as `fetch`) doesn't
  // understand the native FormData/Blob spec, so this call deliberately
  // uses Node's built-in global fetch instead, which does.
  const form = new globalThis.FormData();
  form.append('imageFile', new globalThis.Blob([buffer], { type: mediaType }), 'garment.png');
  // flatLay.mode=ai.auto: lets Photoroom lay the garment out flat/natural
  // (not just cut it out) — this is the clothing-specific mode, on top of
  // the plain background removal we already had.
  form.append('flatLay.mode', 'ai.auto');
  form.append('background.color', 'FFFFFF');
  form.append('padding', '0.1');
  form.append('outputSize', '1000x1000');
  form.append('export.format', 'png');

  const response = await globalThis.fetch(PHOTOROOM_API_URL, {
    method: 'POST',
    headers: { 'x-api-key': process.env.PHOTOROOM_API_KEY },
    body: form,
  });

  console.log(`[process-clothing] Photoroom response status: ${response.status}`);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Photoroom request failed (${response.status}): ${body}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const outBuffer = Buffer.from(arrayBuffer);
  return `data:image/png;base64,${outBuffer.toString('base64')}`;
}

app.post('/api/process-clothing', async (req, res) => {
  console.log('[process-clothing] request received');

  if (!req.body.image) {
    console.error('[process-clothing] no image in request body');
    return res.status(400).json({ error: 'missing_image' });
  }

  let processedImage;
  try {
    processedImage = await removeBackgroundWithPhotoroom(req.body.image);
    console.log('[process-clothing] Photoroom processing succeeded');
  } catch (err) {
    console.error(`[process-clothing] Photoroom step failed: status=${err.status || 'n/a'} message=${err.message}`);
    return res.status(err.notConfigured ? 501 : 500).json({ error: err.notConfigured ? 'photoroom_not_configured' : 'background_removal_failed' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[process-clothing] ANTHROPIC_API_KEY not set — returning processed image without clothing details');
    return res.json({ image: processedImage, items: [] });
  }

  try {
    const items = await detectClothingWithClaude(processedImage, 'process-clothing');
    res.json({ image: processedImage, items });
  } catch (err) {
    console.error(`[process-clothing] Claude detection step failed: status=${err.status || 'n/a'} message=${err.message}`);
    // Background removal already succeeded — still return the clean image,
    // just without clothing details, rather than failing the whole request.
    res.json({ image: processedImage, items: [], detectionError: 'detection_failed' });
  }
});

app.post('/api/explain-outfit', async (req, res) => {
  try {
    const { items, context } = req.body;
    const itemsSummary = items.map((item) => `${item.type} (${item.color}, ${item.style})`).join(', ');

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 300,
      system:
        'את/ה סטייליסט/ית אופנה ידידותי/ת. תני/תן הסבר קצר וחם בעברית (2-3 משפטים) למה הלוק הזה מתאים למזג האוויר, לאירוע ולסגנון שנבחרו, ותסיימי/ם בטיפ סטיילינג קצר אחד. אל תחזרי/חזור על רשימת הפריטים מילה במילה.',
      messages: [
        {
          role: 'user',
          content: `הפריטים שנבחרו: ${itemsSummary}. מזג אוויר: ${context.weather}, אירוע: ${context.event}, סגנון מועדף: ${context.style}.`,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    res.json({ explanation: textBlock.text });
  } catch (err) {
    console.error('explain-outfit failed:', err);
    res.status(500).json({ error: 'explanation_failed' });
  }
});

// --- AI outfit selection: Claude picks the actual items + styling copy ---
// Unlike /api/explain-outfit (which only writes text about an already-
// chosen outfit), this asks Claude to do the choosing itself, from the
// user's real wardrobe, and return a rich structured result in one call.
const OUTFIT_SELECTION_SCHEMA = {
  type: 'object',
  properties: {
    outfitTitle: { type: 'string' },
    occasion: { type: 'string' },
    styleDescription: { type: 'string' },
    selectedItemIds: { type: 'array', items: { type: 'string' } },
    whyItWorks: { type: 'string' },
    colorExplanation: { type: 'string' },
    stylingTips: { type: 'array', items: { type: 'string' } },
    alternativeIdea: { type: 'string' },
    accessories: {
      type: 'object',
      properties: {
        earrings: { type: 'string' },
        necklace: { type: 'string' },
        braceletOrWatch: { type: 'string' },
        bag: { type: 'string' },
        optionalAccessory: { type: 'string' },
        reason: { type: 'string' },
      },
      required: ['earrings', 'necklace', 'braceletOrWatch', 'bag', 'optionalAccessory', 'reason'],
      additionalProperties: false,
    },
  },
  required: [
    'outfitTitle',
    'occasion',
    'styleDescription',
    'selectedItemIds',
    'whyItWorks',
    'colorExplanation',
    'stylingTips',
    'alternativeIdea',
    'accessories',
  ],
  additionalProperties: false,
};

const OUTFIT_SELECTION_SYSTEM_PROMPT = `את/ה סטייליסט/ית אופנה מקצועי/ת שבוחר/ת לוק שלם מתוך הארון הדיגיטלי האמיתי של המשתמשת — לא ממציא/ה פריטים.

חוקים:
- בחרי פריטים אך ורק מתוך הרשימה שתינתן לך, לפי ה-id המדויק שלהם. אל תמציאי id שלא קיים.
- לוק שלם כולל: top+bottom (או skirt) או dress אחד, בנוסף shoes, ובמידת הצורך outerwear (למשל אם קר/גשום).
- אל תבחרי שני פריטים מאותה קטגוריה (לא שני "top"), חוץ ממקרה שבו ה-dress מחליף top+bottom.
- כל הטקסטים (outfitTitle, occasion, styleDescription, whyItWorks, colorExplanation, stylingTips, alternativeIdea, accessories.*) צריכים להיות בעברית, קצרים, אלגנטיים ומקצועיים — בלי קלישאות.
- accessories הן הצעות סטיילינג בלבד (לא מוצרים אמיתיים לקנייה) — למשל "עגילי חישוק זהב קטנים", "שרשרת זהב דקה", "שעון מיניימליסטי", "תיק שחור מבני", "חגורה דקה".
- אם אין בארון מספיק פריטים להשלים לוק שלם, בחרי את הקומבינציה הטובה ביותר האפשרית מתוך מה שיש.

החזירי JSON מלא לפי הסכמה שניתנה, בלי טקסט נוסף מסביב.`;

function buildOutfitSelectionUserMessage(items, context) {
  const wardrobeList = items
    .map((i) => `- id: ${i.id} | סוג: ${i.type} | קטגוריה: ${i.category} | צבע: ${i.color} | סגנון: ${i.style} | עונה: ${i.season}`)
    .join('\n');
  return (
    `הארון הדיגיטלי הזמין:\n${wardrobeList}\n\n` +
    `ההקשר שהמשתמשת בחרה: מזג אוויר: ${context.weather}, סוג אירוע: ${context.event}, סגנון מועדף: ${context.style}, ` +
    `צבעים מועדפים: ${context.preferredColors?.length ? context.preferredColors.join(', ') : 'אין העדפה מיוחדת'}.\n\n` +
    'בחרי את הלוק הטוב ביותר מהארון הזה והחזירי JSON לפי הסכמה.'
  );
}

app.post('/api/select-outfit', async (req, res) => {
  console.log('[select-outfit] request received');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[select-outfit] ANTHROPIC_API_KEY is not set — cannot call Claude');
    return res.status(501).json({ error: 'anthropic_not_configured' });
  }

  try {
    const { items, context } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      console.error('[select-outfit] no wardrobe items provided');
      return res.status(400).json({ error: 'missing_items' });
    }
    console.log(`[select-outfit] wardrobe size: ${items.length}, context: weather=${context?.weather} event=${context?.event}`);

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: OUTFIT_SELECTION_SYSTEM_PROMPT,
      output_config: { format: { type: 'json_schema', schema: OUTFIT_SELECTION_SCHEMA } },
      messages: [{ role: 'user', content: buildOutfitSelectionUserMessage(items, context) }],
    });
    console.log(`[select-outfit] provider response: stop_reason=${response.stop_reason}`);

    const textBlock = response.content.find((block) => block.type === 'text');
    const parsed = JSON.parse(textBlock.text);

    // Safety net: only keep IDs that actually exist in the wardrobe sent —
    // Claude must never invent items.
    const validIds = new Set(items.map((i) => i.id));
    const selectedItemIds = parsed.selectedItemIds.filter((id) => validIds.has(id));
    console.log(`[select-outfit] selected ${selectedItemIds.length}/${parsed.selectedItemIds.length} valid item(s)`);

    res.json({ ...parsed, selectedItemIds });
  } catch (err) {
    console.error(`[select-outfit] failed: status=${err.status || 'n/a'} message=${err.message}`);
    res.status(500).json({ error: 'selection_failed' });
  }
});

// --- Combined outfit flat-lay: text-to-image (no single input photo to edit) ---
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';

function buildOutfitPrompt(items, context) {
  const itemsDesc = items.map((i) => `${i.color} ${i.type}`).join(', ');
  return (
    `Professional fashion flat-lay product photography of a complete styled outfit consisting of: ${itemsDesc}. ` +
    `Items arranged neatly together as a cohesive look suitable for a ${context?.event || 'casual'} occasion. ` +
    'Clean light beige studio background, soft even lighting, no person, no face, no hands, no body, no mannequin head. ' +
    'High quality fashion catalog flat-lay photo, square aspect ratio.'
  );
}

async function generateImage(prompt) {
  if (!process.env.OPENAI_API_KEY) {
    const err = new Error('OPENAI_API_KEY not configured');
    err.notConfigured = true;
    throw err;
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: IMAGE_MODEL, prompt, size: '1024x1024', n: 1 }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Image generation failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error('Image generation returned no image data');
  return `data:image/png;base64,${b64}`;
}

app.post('/api/generate-outfit-image', async (req, res) => {
  try {
    const { items, context } = req.body;
    const image = await generateImage(buildOutfitPrompt(items, context));
    res.json({ image });
  } catch (err) {
    console.error('generate-outfit-image failed:', err);
    res.status(err.notConfigured ? 501 : 500).json({ error: 'image_generation_unavailable' });
  }
});

app.listen(PORT, () => {
  console.log(`AI Outfit Picker backend running on http://localhost:${PORT}`);
});
