/**
 * Seeds timeline_data for Margaret "Maggie" Chen (persona_id = 1).
 * Run via: npm run seed:maggie-timeline
 * Note: the DB primary key column is persona_id, not id.
 */

import { createClient } from "@libsql/client";

const db = createClient({ url: "file:/tmp/conversations.db" });

const timelineData = {
  touchpoints: [
    {
      id: "mc-01",
      date: "Apr 20",
      phase: "pre-launch",
      channel: "email",
      variant: "neutral",
      title: "Student Voice nomination email",
      subtitle: "All-teachers list. Warm, student-focused. No rebrand signal.",
      chatPrompt:
        "Does the April 20 student voice nomination email resonate with a legacy early adopter like Maggie Chen, or does it miss her?",
      sourceDocLabel: "Rebrand launch overview",
    },
    {
      id: "mc-02",
      date: "May 12",
      phase: "pre-launch",
      channel: "social",
      variant: "neutral",
      title: "Data teaser post",
      subtitle: "3.9M graduates, 92% never taught AI foundations. No K–5 frame.",
      chatPrompt:
        "Would the May 12 data teaser social post resonate with Maggie Chen? What's missing for K–5 teachers?",
      sourceDocLabel: "Rebrand launch overview",
    },
    {
      id: "mc-03",
      date: "Late Apr – May 12",
      phase: "pre-launch",
      channel: "gap",
      variant: "gap",
      title: "No personal outreach",
      subtitle:
        "RP pre-brief exists. Top 10% teacher note planned. Is Maggie on that list?",
      chatPrompt:
        "What should a personal pre-announcement communication to legacy early adopters like Maggie Chen say, and when should it go out?",
      sourceDocLabel: "Teacher comms plan",
    },
    {
      id: "mc-04",
      date: "May 17 8:30am",
      phase: "launch",
      channel: "social",
      variant: "risk",
      title: "Display name flips to CodeAI",
      subtitle:
        "All channels update simultaneously. If she sees this before email — cold reveal with no legacy context.",
      chatPrompt:
        "What is the risk of Maggie Chen seeing the CodeAI social rename before receiving a personal communication? How do we mitigate it?",
      sourceDocLabel: "Rebrand launch overview",
    },
    {
      id: "mc-05",
      date: "May 17",
      phase: "launch",
      channel: "in-product",
      variant: "win",
      title: "Login banner goes live",
      subtitle:
        "1-sentence rebrand explainer + link. Best controlled message — reaches her in a trusted context.",
      chatPrompt:
        "What should the in-product rebrand banner say for a K-5 library media specialist like Maggie Chen?",
      sourceDocLabel: "Rebrand launch overview",
    },
    {
      id: "mc-06",
      date: "May 17–18",
      phase: "launch",
      channel: "email",
      variant: "risk",
      title: "General rebrand blast",
      subtitle:
        "Same email as a first-year teacher. Messaging doc has legacy copy — but no dedicated legacy send.",
      chatPrompt:
        "How should the May 17 teacher launch email be adapted for the legacy teacher segment with Maggie Chen in mind?",
      sourceDocLabel: "Teacher comms plan",
    },
    {
      id: "mc-07",
      date: "May 17",
      phase: "launch",
      channel: "gap",
      variant: "gap",
      title: "No legacy teacher segment email",
      subtitle:
        "Plan has Active, Preparing, Churned — not Legacy. Maggie falls through.",
      chatPrompt:
        "What would a dedicated legacy teacher segment email look like for the May 17 launch? What should it say that the general email doesn't?",
      sourceDocLabel: "Teacher comms plan",
    },
    {
      id: "mc-08",
      date: "May 18",
      phase: "day-two",
      channel: "social",
      variant: "win",
      title: "Name Change Video + What's not changing",
      subtitle:
        "Best social moment for Maggie. Needs explicit K–5 / CS Connections mention to fully land.",
      chatPrompt:
        "How should the May 18 'What's not changing' social post address Maggie Chen's anxiety about K–5 CS being deprioritized?",
      sourceDocLabel: "Rebrand launch overview",
    },
    {
      id: "mc-09",
      date: "May 19–21",
      phase: "post-launch",
      channel: "social",
      variant: "neutral",
      title: "Brand identity drumbeat posts",
      subtitle:
        "Enrollment numbers, graduation imagery, YouGov stat. All HS-coded framing.",
      chatPrompt:
        "Do the May 19–21 social posts reach or reassure Maggie Chen? What adjustment would make them relevant to K–5 teachers?",
      sourceDocLabel: "Rebrand launch overview",
    },
    {
      id: "mc-10",
      date: "May 21 + 26",
      phase: "post-launch",
      channel: "email",
      variant: "neutral",
      title: "Redeploy blasts",
      subtitle:
        "Non-openers and non-clickers. Identical content. No Maggie-specific version.",
      chatPrompt:
        "Should the redeploy blasts be adjusted for the legacy teacher segment? What would make Maggie more likely to open or click?",
      sourceDocLabel: "Rebrand launch overview",
    },
    {
      id: "mc-11",
      date: "May 22–31",
      phase: "post-launch",
      channel: "gap",
      variant: "miss",
      title: "No K–5 social content",
      subtitle:
        "Entire post-launch drumbeat is HS / graduation / AI fluency. Nothing for foundational CS.",
      chatPrompt:
        "Draft a social post for May 19–31 that reassures K–5 and library media specialist teachers that foundational CS is still core to CodeAI.",
      sourceDocLabel: "Teacher comms plan",
    },
    {
      id: "mc-12",
      date: "May 23",
      phase: "post-launch",
      channel: "social",
      variant: "win",
      title: "FAQ post — opportunity",
      subtitle:
        "Community Q&A planned. 'Is K–5 CS still part of the mission?' is a Maggie question. Is it in the FAQ?",
      chatPrompt:
        "What FAQ questions should be pre-seeded in the May 23 community post to address K–5 legacy teachers like Maggie Chen?",
      sourceDocLabel: "Rebrand launch overview",
    },
    {
      id: "mc-13",
      date: "May 28",
      phase: "post-launch",
      channel: "email",
      variant: "neutral",
      title: "Data + letter blend email",
      subtitle: "75% data / 25% name change. No K–5 angle.",
      chatPrompt:
        "What one line should be added to the May 28 email for K–5 teachers like Maggie Chen to feel included in the mission?",
      sourceDocLabel: "Rebrand launch overview",
    },
    {
      id: "mc-14",
      date: "June+",
      phase: "summer",
      channel: "gap",
      variant: "gap",
      title: "No re-invitation moment",
      subtitle:
        "Nothing in the plan designed to bring legacy teachers back into community. Maggie is not attending PD.",
      chatPrompt:
        "If Maggie Chen is not attending summer PD, what other mechanism could CodeAI use to re-invite her into the community?",
      sourceDocLabel: "Teacher comms plan",
    },
    {
      id: "mc-15",
      date: "June 1–15",
      phase: "summer",
      channel: "social",
      variant: "neutral",
      title: "Vanguard student voice videos",
      subtitle:
        "Emotional, shareable. Not K–5 specific but validates the mission emotionally.",
      chatPrompt:
        "Would the Vanguard student voice videos resonate with Maggie Chen? What framing would connect them to her K–5 context?",
      sourceDocLabel: "Rebrand launch overview",
    },
  ],
  emotionalArc: [
    { phase: "Pre-launch", state: "neutral", label: "Unaware, fine" },
    { phase: "Launch", state: "negative", label: "Surprised — sees social first" },
    { phase: "Day 2", state: "warning", label: "Cautious — continuity post helps" },
    { phase: "Post-launch", state: "warning", label: "Watching — nothing K–5 specific" },
    { phase: "Late May", state: "negative", label: "Fading — no signal she's included" },
    { phase: "Summer", state: "neutral", label: "Student videos may rekindle" },
  ],
  gaps: [
    "No legacy teacher segment in the comms plan — Maggie doesn't fit Active, Preparing, or Churned",
    "No personal pre-announcement before May 17 unless she is in the top 10% teacher note program",
    "No K–5 or CS Connections content in the May 19–31 social drumbeat",
    "No re-invitation mechanism for legacy teachers who will not attend summer PD",
    "May 23 FAQ post is an opportunity only if K–5 questions are pre-seeded",
  ],
  wins: [
    "In-product login banner on May 17 reaches her in a trusted context with a controlled message",
    "May 18 what's not changing social post addresses her continuity anxiety if it names K–5",
    "Existing messaging doc already has legacy teacher copy — it just needs a dedicated send",
    "May 23 FAQ post could directly answer her principal conversation if the right questions are included",
  ],
  lastSynced: "2026-04-29T00:00:00Z",
};

async function main() {
  const json = JSON.stringify(timelineData);

  console.log("Writing timeline_data for persona_id = 1 (Margaret 'Maggie' Chen)…");
  const update = await db.execute({
    sql: "UPDATE personas SET timeline_data = ? WHERE persona_id = ?",
    args: [json, 1],
  });

  if (update.rowsAffected === 0) {
    console.error(
      "No rows updated. Check that persona_id = 1 exists in the personas table."
    );
    process.exit(1);
  }
  console.log(`Updated ${update.rowsAffected} row(s).`);

  // Verify the write
  const check = await db.execute({
    sql: "SELECT persona_id, name, length(timeline_data) AS tlen FROM personas WHERE persona_id = ?",
    args: [1],
  });
  const row = check.rows[0];
  console.log(
    `Confirmed: persona_id=${row.persona_id}, name=${row.name}, timeline_data = ${row.tlen} chars`
  );

  // Spot-check by re-parsing
  const raw = await db.execute({
    sql: "SELECT timeline_data FROM personas WHERE persona_id = ?",
    args: [1],
  });
  const parsed = JSON.parse(raw.rows[0].timeline_data as string);
  console.log(`  touchpoints : ${parsed.touchpoints.length}`);
  console.log(`  emotionalArc: ${parsed.emotionalArc.length}`);
  console.log(`  gaps        : ${parsed.gaps.length}`);
  console.log(`  wins        : ${parsed.wins.length}`);
  console.log(`  lastSynced  : ${parsed.lastSynced}`);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
