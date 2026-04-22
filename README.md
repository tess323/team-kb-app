# Rebrand User Experience

Internal knowledge base app for the Code.org rebrand project. Ask questions about rebrand materials, explore teacher personas, and browse auto-generated FAQs — all powered by Claude AI.

## Features

- **Chat** — multi-turn conversation interface backed by Claude, with the full Google Docs/Slides/Sheets knowledge base injected as context
- **Personas** — filterable gallery of 6 teacher personas with bento-grid detail pages
- **FAQ** — auto-generated from conversation history, grouped by theme using Claude
- **Knowledge base** — pulls from Google Docs, Google Slides, and Google Sheets via OAuth

## Stack

- [Next.js 15](https://nextjs.org) App Router
- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-typescript) with streaming
- Google APIs (Docs, Slides, Sheets) via `googleapis`
- SQLite via `@libsql/client` for conversation logging
- Tailwind CSS with a custom design system

## Environment variables

Create a `.env.local` file at the project root:

```
ANTHROPIC_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
KB_DOC_IDS=docId1,docId2,...
KB_SHEET_RANGES=spreadsheetId:TabName,spreadsheetId:AnotherTab
```

**Google APIs that must be enabled** in your Google Cloud project:
- Google Docs API
- Google Slides API
- Google Sheets API

## Running locally

```bash
node node_modules/.bin/next dev
```

## Deployment

Deployed on Vercel. Push to `main` triggers an automatic deploy. Set all environment variables in the Vercel project dashboard under Settings → Environment Variables.
