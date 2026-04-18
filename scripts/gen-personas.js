const fs = require("fs");
const path = require("path");

// Load .env.local
const envContent = fs.readFileSync(
  path.join(__dirname, "../.env.local"),
  "utf8"
);
envContent.split("\n").forEach((line) => {
  const eq = line.indexOf("=");
  if (eq === -1) return;
  const key = line.slice(0, eq).trim();
  const val = line.slice(eq + 1).trim();
  if (key) process.env[key] = val;
});

async function fetchDoc(docId) {
  const { google } = require("googleapis");
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  const docs = google.docs({ version: "v1", auth });
  const res = await docs.documents.get({ documentId: docId });
  const parts = [];
  for (const element of res.data.body?.content ?? []) {
    if (!element.paragraph) continue;
    for (const pe of element.paragraph.elements ?? []) {
      const text = pe.textRun?.content;
      if (text) parts.push(text);
    }
  }
  return parts.join("");
}

async function callClaude(docText, instruction) {
  const Anthropic = require("@anthropic-ai/sdk");
  const client = new Anthropic.default({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    system: instruction,
    messages: [{ role: "user", content: docText }],
  });
  return message.content[0].text;
}

async function main() {
  const docId = "1Q-4mr14ecKDbbEzn3MyXuqs8rjLx7uttkiU6e6ODNzw";

  console.log("Fetching doc...");
  const docText = await fetchDoc(docId);
  console.log(`Fetched ${docText.length} chars`);

  const instruction = `You are generating hardcoded persona data for a React app about Code.org's rebrand project. Read the document carefully and generate exactly 6 teacher personas as a valid TypeScript array assigned to export const personas: Persona[]. The 6 personas must together cover: at least one of each grade band (K–5, 6–8, 9–12); at least one of each relationship status (Legacy, Active, Preparing, Prospective, Churned — one persona can cover the sixth slot with any status); a mix of Early adopter and Voluntold on the motivation spectrum. Each persona must feel like a specific real teacher with a coherent story and demographically diverse names. Do not generate thin or generic archetypes.
Use exactly this TypeScript type — do not modify it:
export type Persona = {
  id: number;
  name: string;
  role: string;
  initials: string;
  gradeBand: 'K–5' | '6–8' | '9–12';
  relationshipStatus: 'Legacy' | 'Active' | 'Preparing' | 'Prospective' | 'Churned';
  motivationSpectrum: 'Early adopter' | 'Voluntold' | 'Middle';
  motivationScore: number;
  background: string;
  excited: string;
  nervous: string;
  feelLike: string;
  successLooks: string;
  failureLooks: string;
  channelsWithinControl: string[];
  channelsOutsideControl: string[];
  journey: {
    preLaunch: { moments: string[] };
    launch: { moments: string[] };
    summer: { moments: string[] };
    backToSchool: { moments: string[] };
  };
}
Return only valid TypeScript — no markdown fences, no explanation, no preamble. Start with the type definition, then the exported array.`;

  console.log("Calling Claude...");
  const output = await callClaude(docText, instruction);

  const outDir = path.join(__dirname, "../src/data");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "personas.ts");
  fs.writeFileSync(outPath, output, "utf8");
  console.log("Written to src/data/personas.ts");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
