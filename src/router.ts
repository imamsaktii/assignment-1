import { Pipeline } from "@anvia/core/pipeline";
import { z } from "zod";
import { askAI, askAIJson } from "./shared";

const inputSchema = z.object({
  userPrompt: z.string()
})

const Complexity = z.object({
  level: z.enum(["hard", "easy"])
})

const MODELS = {
  hard: "deepseek",
  easy: "openai",
} as const;

const routingPipeline = new Pipeline({
  id: "routing-pipeline",
  inputSchema
}).step({
  id: "classify",
  run: async ({ input }) => {

    const result = await askAIJson(
      "openai",
      `User prompt: ${input.userPrompt}`,
      Complexity,
      "Classify as 'hard' if the prompt involves programming, SQL, debugging, system architecture, or math/logic problem solving. Classify as 'easy' ONLY for general definitions, simple translation, or basic text formatting."
    );

    return {
      output: result.output,
      input: input.userPrompt
    }
  }
}).step({
  id: "routing",
  run: async ({ input }) => {
    const classification = Complexity.parse(input.output);
    const selectedModel = MODELS[classification.level];

    const response = await askAI(selectedModel, input.input);

    return {
      level: classification.level,
      model: selectedModel,
      response,
    };
  }
}).step({
  id: "response",
  run: ({ input }) => {
    console.log(
      `[Routing] Level: ${input.level} -> Model: ${input.model}\n[Answer]: ${input.response.output}\n`
    );
  }
})


const userPrompts = [
  "Ubah ke array JSON tanpa penjelasan: apple, banana, orange",

  "Bagaimana cara mencegah race condition saat dua webhook payment masuk bersamaan di PostgreSQL? Jawab dalam 2 poin singkat saja.",
]

userPrompts.forEach(async (up) => {
  await routingPipeline.run({ input: { userPrompt: up } })
})