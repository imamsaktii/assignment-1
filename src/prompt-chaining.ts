import { Pipeline } from "@anvia/core/pipeline";
import { z } from "zod";
import { askAI } from "./shared";

const IncidentInput = z.object({
  serviceName: z.string(),
  rawLog: z.string(),
});

const incidentChain = new Pipeline({
  id: "incident-triage-chain",
  inputSchema: IncidentInput,
})
  .step({
    id: "extract",
    run: async ({ input }) => {
      const res = await askAI(
        "openai",
        `Service: ${input.serviceName}\nLog:\n${input.rawLog}\n\nExtract timestamp, error code/exception, and suspected root cause in 3 short bullet points.`
      );
      return res.output;
    },
  })
  .step({
    id: "mitigate",
    run: async ({ input }) => {
      const res = await askAI(
        "openai",
        `Based on these incident details:\n${input}\n\nSuggest 2 immediate L1 monitoring checks or mitigation steps in 2 short bullet points.`
      );
      return res.output;
    },
  })
  .step({
    id: "format",
    run: async ({ input }) => {
      const res = await askAI(
        "openai",
        `Format the following triage analysis into a clean, concise Slack incident report in Indonesian:\n\n${input}`
      );

      return res.output;
    },
  });

const sampleIncident = {
  serviceName: "payment-settlement-service",
  rawLog: `2026-11-21T14:32:10.412+07:00 ERROR [http-nio-8080-exec-42] c.i.p.s.SettlementProcessor - Failed to process batch settlement ID: STL-20261121-8891
java.sql.SQLTransientConnectionException: HikariPool-1 - Connection is not available, request timed out after 30000ms.
	at com.zaxxer.hikari.pool.HikariPool.createTimeoutException(HikariPool.java:696)
	at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:197)
Caused by: org.postgresql.util.PSQLException: FATAL: sorry, too many clients already (max_connections = 100)`,
};

const result = await incidentChain.run({ input: sampleIncident });
console.log(result.output)