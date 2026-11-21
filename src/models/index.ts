import { getDeepSeekModel } from "./deepseek"
import { getOpenAiModel } from "./openai"

export function getModel(provider: "openai" | "deepseek", modelId?: string,) {
  if (provider === "openai") {
    return getOpenAiModel(modelId)
  }

  return getDeepSeekModel(modelId)
}