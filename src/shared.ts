import { generateCompletion, type ZodSchema } from "@anvia/core";
import { getModel } from "./models";

export function askAI(model: "openai" | "deepseek", prompt: string) {
  return generateCompletion({
    model: getModel(model),
    instructions: "You are a helpful assitant",
    prompt
  })
}

export function askAIJson(model: "openai" | "deepseek", prompt: string, outputSchema: ZodSchema, instruction?: string) {
  return generateCompletion({
    model: getModel(model),
    instructions: instruction || "You are a helpful assitant",
    prompt,
    outputSchema
  })
}