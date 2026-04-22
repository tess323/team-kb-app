const fs = require("fs");
const path = require("path");

const envContent = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
envContent.split("\n").forEach((line) => {
  const eq = line.indexOf("=");
  if (eq === -1) return;
  process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
});

const Anthropic = require("@anthropic-ai/sdk");
const client = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });

const personasPath = path.join(__dirname, "../src/data/personas.ts");
const source = fs.readFileSync(personasPath, "utf8");

async function main() {
  const prompt = `You are editing a TypeScript file for a Code.org rebrand project.

I will give you the full contents of src/data/personas.ts. Your task: rewrite ONLY the "feelLike" field for each of the 6 personas.

The new "feelLike" should describe what a SUCCESSFUL rebrand should feel like to that specific person — not how they currently feel about the change, but what the ideal outcome looks and feels like from their perspective if everything goes right. Ground it in their specific context, role, history, and anxieties. 2–3 sentences. Third person.

Return the complete file with only the feelLike values changed. No markdown fences, no explanation, no preamble. Start directly with the first line of the TypeScript file.

${source}`;

  console.log("Calling Claude...");
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });

  const updated = message.content[0].text;
  fs.writeFileSync(personasPath, updated, "utf8");
  console.log("Done — src/data/personas.ts updated.");
}

main().catch((err) => { console.error(err); process.exit(1); });
