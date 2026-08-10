import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import {
  GEMINI_FLASH_MODEL,
  createLovableAiGatewayProvider,
} from "./ai-gateway.server";

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});

const GenerateInput = z.object({
  prompt: z.string().min(1),
  system: z.string().optional(),
  history: z.array(ChatMessageSchema).max(24).optional(),
});

/** One-shot text generation with Gemini 3 Flash through the Lovable AI Gateway. */
export const generateWithGeminiFlash = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => GenerateInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(apiKey);
    const history = data.history ?? [];

    const result = await generateText({
      model: gateway(GEMINI_FLASH_MODEL),
      system: data.system,
      messages: [
        ...history.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user" as const, content: data.prompt },
      ],
      temperature: 0.55,
    });

    return { text: result.text };
  });
