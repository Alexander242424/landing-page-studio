import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { z } from "zod";
import {
  GEMINI_FLASH_MODEL,
  createLovableAiGatewayProvider,
} from "./ai-gateway.server";

const GenerateInput = z.object({
  prompt: z.string().min(1),
  system: z.string().optional(),
});

/** One-shot text generation with Gemini 3 Flash through the Lovable AI Gateway. */
export const generateWithGeminiFlash = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => GenerateInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(apiKey);
    const result = streamText({
      model: gateway(GEMINI_FLASH_MODEL),
      ...(data.system ? { system: data.system } : {}),
      prompt: data.prompt,
    });

    return { text: await result.text };
  });
