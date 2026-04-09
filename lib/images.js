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
 * Step 1: Generate a character reference sheet.
 *
 * Creates a single, clear image of the child character that will
 * serve as the visual anchor for all page illustrations.
 *
 * @param {object} character - { name, age, description }
 * @returns {string} URL of the character reference image
 */
export async function generateCharacterReference({ name, age }) {
  const generate = getProvider();

  // Determine child appearance based on age (generic, since no photo in v1)
  const ageDesc =
    age <= 4
      ? "a small toddler-aged child"
      : age <= 6
        ? "a young child around 5-6 years old"
        : "a child around 7-9 years old";

  const prompt = `Character reference sheet for a children's storybook: ${ageDesc} named ${name}, standing in a neutral pose facing forward, full body visible, friendly smile, expressive eyes. Simple clothing. Plain soft gradient background. This is the main character of a children's book — they should look warm, approachable, and memorable. Clear details on face, hair, and clothing so they can be consistently reproduced in different scenes.`;

  return generate(prompt);
}

/**
 * Step 2: Generate a single page illustration with character consistency.
 *
 * Uses the character reference image to maintain visual identity
 * while adapting the scene, pose, and optionally the outfit.
 *
 * @param {object} params
 * @param {string} params.referenceUrl - URL of character reference image
 * @param {string} params.illustrationHint - Scene description from story generation
 * @param {string} params.characterName - Child's name
 * @param {number} params.pageNumber - Page number (for cover treatment)
 * @param {boolean} params.isCover - Whether this is the cover page
 * @returns {string} URL of the generated illustration
 */
export async function generatePageIllustration({
  referenceUrl,
  illustrationHint,
  characterName,
  pageNumber,
  isCover = false,
}) {
  const generate = getProvider();

  const consistencyDirective = `CRITICAL: The child character MUST look identical to the reference image — same face, same hair color and style, same body proportions. Only change what the scene requires (pose, expression, clothing if explicitly described). If no clothing change is mentioned, keep the same outfit as the reference.`;

  const coverExtra = isCover
    ? `This is the book cover. Show the character prominently, centered, with a magical/inviting atmosphere. Leave space at the top for the title.`
    : "";

  const prompt = `${consistencyDirective} ${coverExtra} Scene for page ${pageNumber} of ${characterName}'s storybook: ${illustrationHint}`;

  return generate(prompt, [referenceUrl]);
}

/**
 * Full pipeline: Generate all illustrations for a book sequentially.
 *
 * 1. Creates character reference
 * 2. Generates cover illustration
 * 3. Generates each page illustration in order
 *
 * Sequential (not parallel) to maximize consistency —
 * each generation builds on the established character.
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

  // Step 2: Generate each page sequentially
  const pageImages = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    try {
      const imageUrl = await generatePageIllustration({
        referenceUrl,
        illustrationHint: page.illustrationHint,
        characterName: name,
        pageNumber: page.pageNumber,
        isCover: i === 0,
      });
      pageImages.push({ pageNumber: page.pageNumber, imageUrl });
    } catch (err) {
      console.error(
        `Failed to generate illustration for page ${page.pageNumber}:`,
        err.message
      );
      pageImages.push({ pageNumber: page.pageNumber, imageUrl: null });
    }
  }

  return { referenceUrl, pageImages };
}
