import { Pipeline } from "@anvia/core/pipeline";
import { z } from "zod";
import { askAI } from "./shared";
import { getModel } from "./models";

const IncidentTicketSchema = z.object({
  service: z.string().describe("Affected service or application name"),
  status: z.enum(["DOWN", "DEGRADED"]),
  severity: z.enum(["P1", "P2", "P3"]).describe("Incident severity level"),
  incidentTime: z.string().describe("Time when the alert or issue started"),
  escalateTo: z.enum(["L2-APP", "L2-INFRA", "L2-DB"]),
  ticketSummary: z.string().describe("Concise 1-sentence summary for ITSM ticket"),
});

const Input = z.object({
  emailBody: z.string(),
});

const iocTriagePipeline = new Pipeline({
  id: "ioc-l1-triage",
  inputSchema: Input,
})
  .step({
    id: "triage",
    run: async ({ input }) => {
      const res = await askAI(
        "openai",
        `Clean up this alert email for IOC L1 triage, remove email signatures/footers, and decide the L2 escalation group (L2-APP, L2-INFRA, or L2-DB):\n\n${input.emailBody}`
      );
      return { triagedNote: res.output };
    },
  })
  .step({
    id: "assess-severity",
    run: async ({ input }) => {
      const res = await askAI(
        "openai",
        `Based on the triaged alert note below, determine the incident severity (P1 = critical prod outage, P2 = degraded prod service, P3 = minor/non-prod) and write a brief L1 initial check note:\n\n${input.triagedNote}`
      );
      return {
        assessedNote: `${input.triagedNote}\n\nL1 Severity & Check:\n${res.output}`,
      };
    },
  })
  .extract({
    id: "build-ticket",
    model: getModel("openai"),
    outputSchema: IncidentTicketSchema,
    instructions: "Extract the ITSM ticket fields. Put NONE if missing.",
    text: ({ input }) => input.assessedNote,
  });

const rawEmail = `
Subject: [Datadog] Triggered: payment-service-prod healthcheck failed
From: alert@datadoghq.com
To: ioc-l1@company.co.id

Alert triggered at 22:15 WIB.
Service payment-service-prod returned HTTP 503 on /actuator/health for 3 consecutive checks.
Log snippet: HikariPool-1 - Connection is not available, request timed out after 30000ms.
`;

const result = await iocTriagePipeline.run({ input: { emailBody: rawEmail } });
console.log(result.output);