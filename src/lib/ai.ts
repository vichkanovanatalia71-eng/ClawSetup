import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface AIRequestParams {
  stepTitle: string;
  stepContent: string;
  stepGoal: string | null;
  stepPrerequisites: string | null;
  stepExpectedResult: string | null;
  stepCommonErrors: string | null;
  scenarioName: string;
  userMessage: string;
  imageBase64?: string;
  imageMimeType?: string;
  quickAction?: string;
  conversationHistory?: { role: "user" | "assistant"; content: string }[];
}

const SYSTEM_PROMPT = `You are an expert technical support assistant for the OpenClaw setup guide.
Your role is to help users complete a specific step in the installation/configuration process.

RULES:
1. You ONLY help with the current step. Do NOT reveal content from other steps.
2. If the user asks for "the full instruction" or "all steps at once" — politely decline and explain you can only help with the current step.
3. If you detect API keys, tokens, passwords, or secrets in the user's message or screenshot — immediately warn them to remove/mask those values. NEVER repeat secrets in your response.
4. Provide specific, actionable diagnostics and fixes.
5. Format responses with clear steps, code blocks, and expected outcomes.
6. If you see a screenshot, analyze it carefully for error messages, incorrect configurations, or missing elements.
7. Always consider the user's scenario context (local vs remote, OS, etc.).
8. Respond in the same language the user writes in. If the instruction is in Ukrainian, respond in Ukrainian.`;

function buildQuickActionPrompt(action: string): string {
  switch (action) {
    case "explain_simpler":
      return "Please explain this step in simpler terms, as if I have zero technical background. Use analogies if needed.";
    case "check_missed":
      return "Review this step and tell me what common things people miss or forget. Create a mini-checklist.";
    case "alternative":
      return "Is there an alternative way to accomplish this step? Show me a different approach if one exists.";
    case "generate_command":
      return "Generate the exact commands I need to run for this step, ready to copy-paste. Include any variable substitutions I need to make.";
    case "whats_next":
      return "What should I do after completing this step? What should I verify before moving on?";
    case "check_output":
      return "I ran the commands from this step. What should the correct output look like? Help me verify my results.";
    case "explain_error":
      return "I'm getting an error on this step. What are the most common causes and how do I fix them?";
    case "security_tip":
      return "What are the security best practices I should follow for this step?";
    default:
      return action;
  }
}

function buildContext(params: AIRequestParams): string {
  const contextParts = [
    `## Current Step: ${params.stepTitle}`,
    `## Scenario: ${params.scenarioName}`,
    params.stepGoal ? `## Goal: ${params.stepGoal}` : "",
    params.stepPrerequisites ? `## Prerequisites: ${params.stepPrerequisites}` : "",
    `## Step Content:\n${params.stepContent}`,
    params.stepExpectedResult ? `## Expected Result: ${params.stepExpectedResult}` : "",
    params.stepCommonErrors ? `## Common Errors:\n${params.stepCommonErrors}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return `${SYSTEM_PROMPT}\n\n---\n\nCONTEXT OF THE CURRENT STEP:\n\n${contextParts}`;
}

export async function getAIResponse(params: AIRequestParams): Promise<string> {
  const {
    userMessage,
    imageBase64,
    imageMimeType,
    quickAction,
    conversationHistory,
  } = params;

  const finalMessage = quickAction
    ? buildQuickActionPrompt(quickAction)
    : userMessage;

  const content: Anthropic.Messages.ContentBlockParam[] = [];

  if (imageBase64 && imageMimeType) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: imageMimeType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
        data: imageBase64,
      },
    });
  }

  content.push({ type: "text", text: finalMessage });

  const messages: Anthropic.Messages.MessageParam[] = [];
  if (conversationHistory && conversationHistory.length > 0) {
    const recent = conversationHistory.slice(-10);
    for (const msg of recent) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }
  messages.push({ role: "user", content });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: buildContext(params),
    messages,
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock ? textBlock.text : "No response generated.";
}

export async function getAIResponseStream(params: AIRequestParams): Promise<ReadableStream> {
  const {
    userMessage,
    imageBase64,
    imageMimeType,
    quickAction,
    conversationHistory,
  } = params;

  const finalMessage = quickAction
    ? buildQuickActionPrompt(quickAction)
    : userMessage;

  const content: Anthropic.Messages.ContentBlockParam[] = [];

  if (imageBase64 && imageMimeType) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: imageMimeType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
        data: imageBase64,
      },
    });
  }

  content.push({ type: "text", text: finalMessage });

  const messages: Anthropic.Messages.MessageParam[] = [];
  if (conversationHistory && conversationHistory.length > 0) {
    const recent = conversationHistory.slice(-10);
    for (const msg of recent) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }
  messages.push({ role: "user", content });

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: buildContext(params),
    messages,
  });

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta") {
            const delta = event.delta;
            if ("text" in delta) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: delta.text })}\n\n`));
            }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`));
        controller.close();
      }
    },
  });
}
