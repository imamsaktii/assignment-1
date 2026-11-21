import z from "zod"

const schema = z.object({
  OPENAI_BASE_URL: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
})

const safeParsed = schema.safeParse(Bun.env)

if (!safeParsed.success) {
  console.log(z.treeifyError(safeParsed.error))
  process.exit(1)
}

export const env = Object.freeze(safeParsed.data)