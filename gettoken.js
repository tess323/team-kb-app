const { google } = require('googleapis');
const fs = require('fs');
const http = require('http');

const creds = JSON.parse(fs.readFileSync('./credentials/gdrive-credentials.json'));
const { client_id, client_secret } = creds.installed || creds.web;

const auth = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3000/callback');

const url = auth.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/documents.readonly'
  ]
});

const server = http.createServer(async (req, res) => {
  const code = new URL(req.url, 'http://localhost:3000').searchParams.get('code');
  if (!code) return;
  const { tokens } = await auth.getToken(code);
  console.log('GOOGLE_CLIENT_ID=' + client_id);
  console.log('GOOGLE_CLIENT_SECRET=' + client_secret);
  console.log('GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token);
  res.end('Done! Close this tab.');
  server.close();
});

server.listen(3000, () => console.log('Open this URL in your browser:\n' + url));