import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function askWithContext(
  question: string,
  context: string
): Promise<string> {
  const systemPrompt = context
    ? `You are a helpful assistant with access to the team knowledge base. Use the following documents to answer questions accurately.\n\n<knowledge_base>\n${context}\n</knowledge_base>`
    : "You are a helpful assistant.";

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: question }],
  });

  const block = message.content[0];
  if (block.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }
  return block.text;
}
