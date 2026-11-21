import { OpenAIClient } from "@anvia/openai"
import { env } from "../env"

const client = new OpenAIClient({
  apiKey: env.OPENAI_API_KEY,
  baseUrl: env.OPENAI_BASE_URL,
})

export function getDeepSeekModel(modelId?: string) {
  return client.completionModel({
    modelId: modelId ?? "deepseek-v4-flash-0731",
    api: "chat"
  })
}