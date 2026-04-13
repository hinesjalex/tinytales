/**
 * Character-consistent illustration pipeline.
 *
 * Architecture:
 *   1. Generate a character reference sheet (front-facing, clear features)
 *   2. For each page sequentially, generate illustration with:
 *      - Character reference image as input
 *      - Scene description from illustrationHint
 *      - Explicit instructions on what stays the same vs. what changes
 *
 * This ensures the child character looks the same on every page,
 * even when outfit, pose, or setting changes.
 *
 * Supported providers: "nanobanana" (recommended) | "openai"
 */

const PROVIDER = process.env.IMAGE_PROVIDER || "nanobanana";

const STYLE_DIRECTIVE = `Children's storybook illustration, hand-painted watercolor style with soft textures, warm and gentle palette, soft diffused lighting. Suitable for ages 2-9. No text, words, or letters anywhere in the image.`;

// --- Nano Banana 2 via fal.ai ---

async function nanoBananaGenerate(prompt, referenceImageUrls = []) {
  const input = {
    prompt: `${STYLE_DIRECTIVE} ${prompt}`,
    num_images: 1,
    aspect_ratio: "3:4",
    output_format: "png",
    resolution: process.env.IMAGE_RESOLUTION || "1K",
    safety_tolerance: "4",
  };

  // Add reference images for character consistency
  if (referenceImageUrls.length > 0) {
    input.image_urls = referenceImageUrls;
  }

  // Submit task
  const submitRes = await fetch("https://queue.fal.run/fal-ai/nano-banana-2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${process.env.FAL_KEY}`,
    },
    body: JSON.stringify(input),
  });

  if (!submitRes.ok) {
    const err = await submitRes.text();
    throw new Error(`fal.ai submit error ${submitRes.status}: ${err}`);
  }

  const { request_id, status: initialStatus } = await submitRes.json();

  // If completed immediately
  if (initialStatus === "COMPLETED") {
    const resultRes = await fetch(
      `https://queue.fal.run/fal-ai/nano-banana-2/requests/${request_id}`,
      { headers: { Authorization: `Key ${process.env.FAL_KEY}` } }
    );
    const result = await resultRes.json();
    return result.images?.[0]?.url;
  }

  // Poll for completion
  const maxWait = 120000; // 2 minutes
  const pollInterval = 3000;
  const start = Date.now();

  while (Date.now() - start < maxWait) {
    await new Promise((r) => setTimeout(r, pollInterval));

    const statusRes = await fetch(
      `https://queue.fal.run/fal-ai/nano-banana-2/requests/${request_id}/status`,
      { headers: { Authorization: `Key ${process.env.FAL_KEY}` } }
    );
    const statusData = await statusRes.json();

    if (statusData.status === "COMPLETED") {
      const resultRes = await fetch(
        `https://queue.fal.run/fal-ai/nano-banana-2/requests/${request_id}`,
        { headers: { Authorization: `Key ${process.env.FAL_KEY}` } }
      );
      const result = await resultRes.json();
      return result.images?.[0]?.url;
    }

    if (statusData.status === "FAILED") {
      throw new Error("Nano Banana 2 generation failed");
    }
  }

  throw new Error("Nano Banana 2 generation timed out");
}

// --- OpenAI (GPT-Image / DALL-E 3) ---

async function openAIGenerate(prompt, referenceImageUrls = []) {
  // For OpenAI, we use the chat completions endpoint with image input
  // to maintain character consistency via conversation context
  const messages = [];

  // If we have reference images, include them as context
  if (referenceImageUrls.length > 0) {
    const imageContent = referenceImageUrls.map((url) => ({
      type: "image_url",
      image_url: { url },
    }));

    messages.push({
      role: "user",
      content: [
        ...imageContent,
        {
          type: "text",
          text: `This is the character reference. Maintain this exact character's appearance (face, hair, body proportions) in all subsequent images. Only change what is explicitly described.`,
        },
      ],
    });

    messages.push({
      role: "assistant",
      content:
        "I understand. I will maintain this character's exact appearance in all images, only changing what you explicitly describe.",
    });
  }

  messages.push({
    role: "user",
    content: `Generate this children's book illustration: ${STYLE_DIRECTIVE} ${prompt}`,
  });

  // Use images endpoint for generation
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
      prompt: `${STYLE_DIRECTIVE} Maintain exact character consistency with reference. ${prompt}`,
      n: 1,
      size: "1024x1536", // 3:4 portrait
      quality: "medium",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI Image API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.data[0]?.url || `data:image/png;base64,${data.data[0]?.b64_json}`;
}

// --- Provider router ---

const providers = {
  nanobanana: nanoBananaGenerate,
  openai: openAIGenerate,
};

function getProvider() {
  const adapter = providers[PROVIDER];
  if (!adapter) {
    throw new Error(
      `Unknown IMAGE_PROVIDER "${PROVIDER}". Use: nanobanana or openai`
    );
  }
  return adapter;
}

// --- Public API ---

/**
 * Step 1: Generate a multi-angle character turnaround sheet.
 *
 * Creates a SINGLE image showing the character from 3 angles:
 * front view, 3/4 view, and side profile. This gives the model
 * maximum visual information to maintain consistency across pages.
 *
 * @param {object} character - { name, age }
 * @returns {string} URL of the character turnaround sheet
 */
export async function generateCharacterReference({ name, age }) {
  const generate = getProvider();

  const ageDesc =
    age <= 4
      ? "a small toddler-aged child (about 3 years old)"
      : age <= 6
        ? "a young child (about 5-6 years old)"
        : "a child (about 8 years old)";

  const prompt = `Character turnaround reference sheet for a children's storybook.

Show the SAME character THREE TIMES on one sheet, side by side:
- LEFT: Front-facing view, standing neutral pose
- CENTER: Three-quarter (3/4) angle view, slight turn to the right
- RIGHT: Side profile view, facing right

The character is ${ageDesc} named ${name}.

CRITICAL DESIGN RULES:
- All three views must show the EXACT SAME character with identical features
- Simple, bold, distinctive design that is easy to reproduce
- Clear distinct hair color and style (keep it simple — no intricate braids or complex styles)
- Large expressive eyes with a clear eye color
- Simple clothing with 2-3 bold colors maximum (e.g. a red shirt and blue pants)
- No patterns or logos on clothing — solid colors only
- Full body visible in all three views, head to toe
- Plain white or light cream background, no scenery
- Hand-painted watercolor children's book illustration style
- Warm, gentle, friendly appearance

This sheet will be used as reference to draw this character consistently across 10+ pages of a storybook. Simplicity and clarity are more important than detail.`;

  return generate(prompt);
}

/**
 * Step 2: Generate a single page illustration with character consistency.
 *
 * Uses chain-anchoring: each page references BOTH the original character
 * sheet AND the previous page's output to prevent drift.
 *
 * @param {object} params
 * @param {string} params.referenceUrl - URL of original character reference
 * @param {string} params.previousPageUrl - URL of the previous page's illustration (for chain-anchoring)
 * @param {string} params.illustrationHint - Scene description from story generation
 * @param {string} params.characterName - Child's name
 * @param {number} params.pageNumber - Page number (for cover treatment)
 * @param {boolean} params.isCover - Whether this is the cover page
 * @returns {string} URL of the generated illustration
 */
export async function generatePageIllustration({
  referenceUrl,
  previousPageUrl,
  illustrationHint,
  characterName,
  pageNumber,
  isCover = false,
}) {
  const generate = getProvider();

  const consistencyDirective = `ABSOLUTE REQUIREMENT — CHARACTER CONSISTENCY:
The child character in this image MUST be visually identical to the character in the reference images. Preserve ALL of the following exactly:
- Same face shape, eye shape, eye color, nose, and mouth
- Same hair color, hair length, hair style, and hair texture
- Same skin tone
- Same body proportions and height
- Same clothing and accessories UNLESS the scene explicitly describes a change
Do NOT alter any facial features. Do NOT change the hair. The character must be immediately recognizable as the same person across every page.`;

  const coverExtra = isCover
    ? `This is the book cover. Show the character prominently, centered, with a magical/inviting atmosphere. Leave space at the top for the title.`
    : "";

  const prompt = `${consistencyDirective} ${coverExtra} Scene for page ${pageNumber} of ${characterName}'s storybook: ${illustrationHint}`;

  // Chain-anchor: send both original reference and previous page
  const references = [referenceUrl];
  if (previousPageUrl) {
    references.push(previousPageUrl);
  }

  return generate(prompt, references);
}

/**
 * Full pipeline: Generate all illustrations for a book sequentially
 * with chain-anchoring to prevent character drift.
 *
 * Each page references BOTH the original character sheet AND the
 * previous page's output. This prevents the gradual drift that
 * occurs when only referencing the original.
 *
 * @param {object} params
 * @param {string} params.name - Child's name
 * @param {number} params.age - Child's age
 * @param {Array} params.pages - Story pages with illustrationHint
 * @returns {object} { referenceUrl, pageImages: [{ pageNumber, imageUrl }] }
 */
export async function generateBookIllustrations({ name, age, pages }) {
  // Step 1: Character reference
  const referenceUrl = await generateCharacterReference({ name, age });

  // Step 2: Generate each page sequentially with chain-anchoring
  const pageImages = [];
  let previousPageUrl = null;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    try {
      const imageUrl = await generatePageIllustration({
        referenceUrl,
        previousPageUrl,
        illustrationHint: page.illustrationHint,
        characterName: name,
        pageNumber: page.pageNumber,
        isCover: i === 0,
      });
      pageImages.push({ pageNumber: page.pageNumber, imageUrl });

      // Chain-anchor: use this page's output as reference for the next
      if (imageUrl) {
        previousPageUrl = imageUrl;
      }
    } catch (err) {
      console.error(
        `Failed to generate illustration for page ${page.pageNumber}:`,
        err.message
      );
      pageImages.push({ pageNumber: page.pageNumber, imageUrl: null });
      // Don't update previousPageUrl on failure — keep the last good one
    }
  }

  return { referenceUrl, pageImages };
}
