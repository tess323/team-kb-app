import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@libsql/client";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── env ───────────────────────────────────────────────────────────────────────
const env = {};
readFileSync(resolve(__dirname, "../.env.local"), "utf-8")
  .split("\n")
  .forEach((line) => {
    const idx = line.indexOf("=");
    if (idx > 0) env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  });

// ── db ────────────────────────────────────────────────────────────────────────
const db = createClient({ url: "file:/tmp/conversations.db" });

async function ensureColumns() {
  const cols = [
    "name TEXT", "role TEXT", "grade_band TEXT", "relationship TEXT",
    "motivation TEXT", "current_course TEXT", "goals TEXT", "pain_points TEXT",
    "ai_relationship TEXT", "rebrand_risk TEXT", "needs TEXT", "quote TEXT",
    "background TEXT", "excited_about TEXT", "nervous_about TEXT",
    "success_looks_like TEXT", "failure_looks_like TEXT", "aim_feeling TEXT",
    "comms_in_control TEXT", "comms_out_of_control TEXT", "content TEXT",
  ];
  for (const col of cols) {
    try { await db.execute(`ALTER TABLE personas ADD COLUMN ${col}`); } catch { /* exists */ }
  }
}

// ── google ────────────────────────────────────────────────────────────────────
function getAuth() {
  const auth = new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);
  auth.setCredentials({ refresh_token: env.GOOGLE_REFRESH_TOKEN });
  return auth;
}

async function fetchDocText(docId) {
  const auth = getAuth();
  try {
    const res = await google.docs({ version: "v1", auth }).documents.get({ documentId: docId });
    const parts = [];
    for (const el of res.data.body?.content ?? []) {
      if (!el.paragraph) continue;
      for (const pe of el.paragraph.elements ?? []) {
        if (pe.textRun?.content) parts.push(pe.textRun.content);
      }
    }
    return parts.join("");
  } catch {
    const res = await google.slides({ version: "v1", auth }).presentations.get({ presentationId: docId });
    const parts = [];
    for (const slide of res.data.slides ?? []) {
      for (const el of slide.pageElements ?? []) {
        for (const run of el.shape?.text?.textElements ?? []) {
          if (run.textRun?.content) parts.push(run.textRun.content);
        }
      }
      parts.push("\n");
    }
    return parts.join("");
  }
}

async function fetchKB() {
  const ids = (env.KB_DOC_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const docs = await Promise.all(ids.map((id) => fetchDocText(id).catch(() => "")));
  return docs.filter(Boolean).join("\n\n---\n\n");
}

// ── main ──────────────────────────────────────────────────────────────────────
const PERSONA_DOC_ID = "1HQfhb6_YWrhGtgMnTRAWOpvTDovJfZlfIfqMe2HMY0k";

const PROMPT = `You are updating a set of personas. Using the Google Doc as the primary source, extract each persona and map them to the fields below. For any fields that are sparse or missing in the Google Doc, infer thoughtfully from the knowledge base context. Keep field names exactly as shown.

For each persona extract:
- name
- role
- grade_band (e.g. K-5, 6-8, 9-12, District, School, Regional Partner, Facilitator)
- relationship (e.g. Legacy, Active, Prospective, Peripheral, Informal/Active, Active Partner, Active Facilitator, None)
- motivation (e.g. Early Adopter, Voluntold, Institutional, Cautious, Mission-driven, Deep Early Adopter, Neutral, Self-directed)
- current_course
- goals (as an array of strings, each a bullet point)
- pain_points (as an array of strings, each a bullet point)
- ai_relationship
- rebrand_risk
- needs (as an array of strings, each a bullet point)
- quote
- background (general overview of who this person is)
- excited_about (what they will be excited about with the rebrand)
- nervous_about (what they will be nervous about with the rebrand)
- success_looks_like (what success looks like for this persona)
- failure_looks_like (what failure looks like for this persona)
- aim_feeling (how we aim for them to feel throughout this process)
- comms_in_control (array of communication channels within our control)
- comms_out_of_control (array of communication channels outside of our control)

Return a JSON array of persona objects with these exact field names. Return only the JSON array, no other text.`;

async function main() {
  await ensureColumns();

  console.log("Fetching persona Google Doc...");
  const personaDoc = await fetchDocText(PERSONA_DOC_ID);
  console.log(`  fetched ${personaDoc.length} chars`);

  console.log("Fetching knowledge base...");
  const kb = await fetchKB();
  console.log(`  fetched ${kb.length} chars`);

  console.log("Calling Claude API...");
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 16000,
    messages: [
      {
        role: "user",
        content: `${PROMPT}\n\n<persona_doc>\n${personaDoc}\n</persona_doc>\n\n<knowledge_base>\n${kb}\n</knowledge_base>`,
      },
    ],
  });

  const text = message.content[0].text;
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error("No JSON array found in Claude response. Raw response:");
    console.error(text.slice(0, 500));
    process.exit(1);
  }

  let personas;
  try {
    personas = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("Failed to parse JSON:", e.message);
    console.error(jsonMatch[0].slice(0, 500));
    process.exit(1);
  }

  console.log(`\nProcessing ${personas.length} personas...\n`);

  for (const p of personas) {
    if (!p.name) { console.log("  skipping entry with no name"); continue; }

    const serial = (v) => (Array.isArray(v) ? JSON.stringify(v) : v ? JSON.stringify([v]) : null);

    const existing = await db.execute({
      sql: "SELECT persona_id FROM personas WHERE name = ?",
      args: [p.name],
    });

    const args = [
      p.role ?? null, p.grade_band ?? null, p.relationship ?? null,
      p.motivation ?? null, p.current_course ?? null,
      serial(p.goals), serial(p.pain_points),
      p.ai_relationship ?? null, p.rebrand_risk ?? null,
      serial(p.needs), p.quote ?? null, p.background ?? null,
      p.excited_about ?? null, p.nervous_about ?? null,
      p.success_looks_like ?? null, p.failure_looks_like ?? null,
      p.aim_feeling ?? null,
      serial(p.comms_in_control), serial(p.comms_out_of_control),
      p.content ?? null,
    ];

    if (existing.rows.length > 0) {
      await db.execute({
        sql: `UPDATE personas SET
          role=?, grade_band=?, relationship=?, motivation=?, current_course=?,
          goals=?, pain_points=?, ai_relationship=?, rebrand_risk=?, needs=?,
          quote=?, background=?, excited_about=?, nervous_about=?, success_looks_like=?,
          failure_looks_like=?, aim_feeling=?, comms_in_control=?, comms_out_of_control=?,
          content=?
          WHERE name=?`,
        args: [...args, p.name],
      });
      console.log(`  ✓ updated: ${p.name}`);
    } else {
      await db.execute({
        sql: `INSERT INTO personas (name, role, grade_band, relationship, motivation, current_course,
          goals, pain_points, ai_relationship, rebrand_risk, needs, quote, background, excited_about,
          nervous_about, success_looks_like, failure_looks_like, aim_feeling,
          comms_in_control, comms_out_of_control, content)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [p.name, ...args],
      });
      console.log(`  ✓ inserted: ${p.name}`);
    }
  }

  console.log("\nDone!");
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
