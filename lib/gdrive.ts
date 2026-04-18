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

export async function fetchKnowledgeBase(): Promise<string> {
  const rawIds = process.env.KB_DOC_IDS ?? "";
  const ids = rawIds.split(",").map((id) => id.trim()).filter(Boolean);

  if (ids.length === 0) return "";

  const auth = getAuth();
  const docsApi = google.docs({ version: "v1", auth });
  const slidesApi = google.slides({ version: "v1", auth });

  const pages = await Promise.all(
    ids.map(async (id) => {
      try {
        const res = await docsApi.documents.get({ documentId: id });
        return extractDocText(res.data);
      } catch {
        const res = await slidesApi.presentations.get({ presentationId: id });
        return extractSlidesText(res.data);
      }
    })
  );

  return pages.join("\n\n---\n\n");
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
