import { createServer } from "http";
import { google } from "googleapis";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

const env = Object.fromEntries(
  readFileSync(envPath, "utf-8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()])
);

const CLIENT_ID = env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:4242/callback";

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = [
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/spreadsheets.readonly",
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
  prompt: "consent",
});

console.log("\nOpen this URL in your browser:\n");
console.log(authUrl);
console.log("\nWaiting for callback on http://localhost:4242/callback ...\n");

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost:4242");
  const code = url.searchParams.get("code");
  if (!code) { res.end("No code"); return; }

  const { tokens } = await oauth2Client.getToken(code);
  res.end("Done! Check your terminal for the new refresh token.");
  server.close();

  console.log("\n✅ New refresh token:\n");
  console.log(tokens.refresh_token);
  console.log("\nReplace GOOGLE_REFRESH_TOKEN in .env.local with the value above.\n");
});

server.listen(4242);
