import { OpenAIClient } from "@anvia/openai"
import { env } from "../env"

const client = new OpenAIClient({
  apiKey: env.OPENAI_API_KEY,
  baseUrl: env.OPENAI_BASE_URL,
})

export function getOpenAiModel(modelId?: string) {
  return client.completionModel({
    modelId: modelId ?? "gpt-6-luna",
    api: "chat"
  })
}