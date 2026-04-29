// Edge-compatible Google API helpers using native fetch (no googleapis/Node.js HTTP).

async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
    }).toString(),
  });
  const data = await res.json() as { access_token?: string; error?: string };
  if (!data.access_token) throw new Error(`OAuth failed: ${data.error ?? "no token"}`);
  return data.access_token;
}

// ── Doc text extraction ───────────────────────────────────────────────────────

type DocParagraphElement = { textRun?: { content?: string } };
type DocElement = { paragraph?: { elements?: DocParagraphElement[] } };
type GoogleDoc = { body?: { content?: DocElement[] } };

function extractDocText(doc: GoogleDoc): string {
  const parts: string[] = [];
  for (const el of doc.body?.content ?? []) {
    for (const pe of el.paragraph?.elements ?? []) {
      const text = pe.textRun?.content;
      if (text) parts.push(text);
    }
  }
  return parts.join("");
}

type SlideShape = { text?: { textElements?: Array<{ textRun?: { content?: string } }> } };
type SlideElement = { shape?: SlideShape };
type GooglePresentation = { slides?: Array<{ pageElements?: SlideElement[] }> };

function extractSlidesText(pres: GooglePresentation): string {
  const parts: string[] = [];
  for (const slide of pres.slides ?? []) {
    for (const el of slide.pageElements ?? []) {
      for (const run of el.shape?.text?.textElements ?? []) {
        const text = run.textRun?.content;
        if (text) parts.push(text);
      }
    }
    parts.push("\n");
  }
  return parts.join("");
}

// ── Fetchers ──────────────────────────────────────────────────────────────────

async function fetchDoc(id: string, token: string): Promise<string> {
  // Try Google Docs first, fall back to Slides
  const docRes = await fetch(`https://docs.googleapis.com/v1/documents/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (docRes.ok) {
    return extractDocText(await docRes.json() as GoogleDoc);
  }
  const slidesRes = await fetch(`https://slides.googleapis.com/v1/presentations/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (slidesRes.ok) {
    return extractSlidesText(await slidesRes.json() as GooglePresentation);
  }
  return "";
}

async function fetchSheet(spreadsheetId: string, tabName: string, token: string): Promise<string> {
  const range = encodeURIComponent(tabName);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) return "";
  const data = await res.json() as { values?: string[][] };
  const rows = data.values;
  if (!rows?.length) return "";
  const [headers, ...body] = rows;
  const divider = `| ${headers.map(() => "---").join(" | ")} |`;
  const dataRows = body.map((row) => {
    const cells = headers.map((_, i) => (row[i] ?? "").replace(/\n/g, " "));
    return `| ${cells.join(" | ")} |`;
  });
  return `--- Sheet: ${tabName} ---\n| ${headers.join(" | ")} |\n${divider}\n${dataRows.join("\n")}`;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchKnowledgeBaseEdge(): Promise<string> {
  const token = await getAccessToken();

  const ids = (process.env.KB_DOC_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const ranges = (process.env.KB_SHEET_RANGES ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  const [docResults, sheetResults] = await Promise.all([
    Promise.allSettled(ids.map((id) => fetchDoc(id, token))),
    Promise.allSettled(
      ranges.map((r) => {
        const colon = r.indexOf(":");
        if (colon === -1) return Promise.resolve("");
        return fetchSheet(r.slice(0, colon).trim(), r.slice(colon + 1).trim(), token);
      })
    ),
  ]);

  return [
    ...docResults.map((r) => (r.status === "fulfilled" ? r.value : "")),
    ...sheetResults.map((r) => (r.status === "fulfilled" ? r.value : "")),
  ]
    .filter(Boolean)
    .join("\n\n---\n\n");
}
