import { google, docs_v1, slides_v1 } from "googleapis";

function getAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Missing Google OAuth credentials: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN"
    );
  }

  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });
  return auth;
}

async function fetchSheetContent(spreadsheetId: string, tabName: string): Promise<string> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: tabName,
  });

  const rows = res.data.values;
  if (!rows || rows.length === 0) return "";

  const [headers, ...body] = rows;
  const headerRow = `| ${headers.join(" | ")} |`;
  const divider   = `| ${headers.map(() => "---").join(" | ")} |`;
  const dataRows  = body.map((row) => {
    const cells = headers.map((_, i) => (row[i] ?? "").toString().replace(/\n/g, " "));
    return `| ${cells.join(" | ")} |`;
  });

  return `--- Sheet: ${tabName} ---\n${[headerRow, divider, ...dataRows].join("\n")}`;
}

export async function fetchKnowledgeBase(): Promise<string> {
  const rawIds = process.env.KB_DOC_IDS ?? "";
  const ids = rawIds.split(",").map((id) => id.trim()).filter(Boolean);

  const rawRanges = process.env.KB_SHEET_RANGES ?? "";
  const ranges = rawRanges.split(",").map((r) => r.trim()).filter(Boolean);

  const auth = getAuth();
  const docsApi = google.docs({ version: "v1", auth });
  const slidesApi = google.slides({ version: "v1", auth });

  const docSections = await Promise.all(
    ids.map(async (id) => {
      try {
        const res = await docsApi.documents.get({ documentId: id });
        return extractDocText(res.data);
      } catch {
        try {
          const res = await slidesApi.presentations.get({ presentationId: id });
          return extractSlidesText(res.data);
        } catch (err) {
          console.error(`[gdrive] failed to fetch doc/slide ${id}:`, err instanceof Error ? err.message : err);
          return "";
        }
      }
    })
  );

  const sheetSections = await Promise.all(
    ranges.map(async (range) => {
      const colonIdx = range.indexOf(":");
      if (colonIdx === -1) return "";
      const spreadsheetId = range.slice(0, colonIdx).trim();
      const tabName = range.slice(colonIdx + 1).trim();
      try {
        return await fetchSheetContent(spreadsheetId, tabName);
      } catch (err) {
        console.error(`[gdrive] failed to fetch sheet ${range}:`, err);
        return "";
      }
    })
  );

  return [...docSections, ...sheetSections].filter(Boolean).join("\n\n---\n\n");
}

function extractDocText(doc: docs_v1.Schema$Document): string {
  const parts: string[] = [];
  for (const element of doc.body?.content ?? []) {
    if (!element.paragraph) continue;
    for (const pe of element.paragraph.elements ?? []) {
      const text = pe.textRun?.content;
      if (text) parts.push(text);
    }
  }
  return parts.join("");
}

function extractSlidesText(presentation: slides_v1.Schema$Presentation): string {
  const parts: string[] = [];
  for (const slide of presentation.slides ?? []) {
    for (const element of slide.pageElements ?? []) {
      const text = element.shape?.text;
      if (!text) continue;
      for (const run of text.textElements ?? []) {
        const content = run.textRun?.content;
        if (content) parts.push(content);
      }
    }
    parts.push("\n");
  }
  return parts.join("");
}

export async function fetchPersonaDoc(docId: string): Promise<string> {
  const auth = getAuth();
  const docsApi = google.docs({ version: "v1", auth });
  const res = await docsApi.documents.get({ documentId: docId });
  return extractDocText(res.data);
}

export async function createPersonaDoc(
  title: string,
  content: string
): Promise<{ docId: string; docUrl: string }> {
  const auth = getAuth();
  const docsApi = google.docs({ version: "v1", auth });

  const created = await docsApi.documents.create({ requestBody: { title } });
  const docId = created.data.documentId!;

  await docsApi.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: content,
          },
        },
      ],
    },
  });

  return {
    docId,
    docUrl: `https://docs.google.com/document/d/${docId}/edit`,
  };
}
