/**
 * Story generation prompts.
 *
 * The system prompt enforces tone, safety, structure.
 * The user prompt is built dynamically from onboarding data.
 * Output is JSON — parsed by the API route.
 */

const PAGE_COUNTS = {
  "2-4": { pages: 10, sentencesPerPage: "1-2", vocab: "simple, repetitive, rhythmic" },
  "5-6": { pages: 13, sentencesPerPage: "2-3", vocab: "slightly more complex, playful" },
  "7-9": { pages: 17, sentencesPerPage: "3-4", vocab: "rich but accessible, real plot structure" },
};

function getAgeGroup(age) {
  if (age <= 4) return "2-4";
  if (age <= 6) return "5-6";
  return "7-9";
}

const THEME_DESCRIPTIONS = {
  courage: "a story about being brave, facing fears, and finding inner strength",
  kindness: "a story about helping others, empathy, and making friends",
  newsibling: "a story about welcoming a new baby brother or sister into the family",
  firstday: "a story about starting something new (school, a class, moving) and discovering it's okay",
  adventure: "a story about exploring the unknown, discovering something magical",
};

export function buildSystemPrompt() {
  return `You are a world-class children's book author. You write warm, imaginative, emotionally resonant stories for young children.

RULES — follow every one:
- The named child is ALWAYS the protagonist and hero of the story.
- The story must have a clear beginning, middle, and satisfying end.
- The tone is warm, gentle, and empowering. The child always succeeds through their own qualities (kindness, bravery, curiosity — never violence or meanness).
- NEVER include anything scary, violent, sad, dark, inappropriate, or potentially upsetting for a young child.
- NEVER reference real brands, IP, movies, TV shows, or copyrighted characters.
- NEVER include moralistic lecturing. The lesson should be felt through the story, not stated.
- Each page should paint a vivid scene that could be illustrated.
- Include sensory details — what the child sees, hears, feels, smells.
- Use the child's name naturally throughout (not on every single sentence, but frequently enough that it feels personal).

OUTPUT FORMAT — respond with ONLY valid JSON, no markdown, no preamble:
{
  "title": "The story title",
  "pages": [
    {
      "pageNumber": 1,
      "text": "The page text.",
      "illustrationHint": "Brief description of what an illustrator should draw for this page"
    }
  ]
}`;
}

export function buildUserPrompt({ name, age, theme, customStory }) {
  const group = getAgeGroup(age);
  const spec = PAGE_COUNTS[group];

  const themeDesc = customStory?.trim()
    ? `a story based on the parent's description: "${customStory.trim()}"`
    : THEME_DESCRIPTIONS[theme] || "a fun, magical adventure";

  return `Write a personalized children's storybook with these parameters:

CHILD: ${name}, age ${age}
THEME: ${themeDesc}
PAGES: Exactly ${spec.pages} pages
SENTENCES PER PAGE: ${spec.sentencesPerPage}
VOCABULARY LEVEL: ${spec.vocab}

The child (${name}) is the hero. Make it personal, vivid, and emotionally satisfying.
Remember: output ONLY the JSON object, nothing else.`;
}

export { PAGE_COUNTS, getAgeGroup };
