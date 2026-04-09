/**
 * Model-agnostic story generation layer.
 *
 * Swap the provider by changing AI_PROVIDER in .env.
 * Each provider adapter normalizes the response to a common format.
 *
 * Supported: "anthropic" | "openai" | "google"
 */

const PROVIDER = process.env.AI_PROVIDER || "anthropic";

// --- Provider adapters ---

async function callAnthropic(systemPrompt, userPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

async function callOpenAI(systemPrompt, userPrompt) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

async function callGoogle(systemPrompt, userPrompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GOOGLE_MODEL || "gemini-2.0-flash"}:generateContent?key=${process.env.GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.candidates[0].content.parts.map((p) => p.text).join("\n");
}

// --- Public API ---

const providers = {
  anthropic: callAnthropic,
  openai: callOpenAI,
  google: callGoogle,
};

/**
 * Generate text from a system prompt + user prompt.
 * Returns the raw text response from whichever provider is configured.
 */
export async function generate(systemPrompt, userPrompt) {
  const adapter = providers[PROVIDER];
  if (!adapter) {
    throw new Error(
      `Unknown AI_PROVIDER "${PROVIDER}". Use: anthropic, openai, or google`
    );
  }
  return adapter(systemPrompt, userPrompt);
}
