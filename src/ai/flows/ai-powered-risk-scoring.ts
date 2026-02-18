'use server';
/**
 * @fileOverview An AI-powered risk scoring flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPoweredRiskScoringInputSchema = z.object({
  anomalyDescription: z.string().describe('Description of the anomaly.'),
  riskParameters: z.any().describe('Configurable risk parameters.'),
  confidenceInterval: z.string().describe('Confidence interval.'),
});
export type AiPoweredRiskScoringInput = z.infer<typeof AiPoweredRiskScoringInputSchema>;

const AiPoweredRiskScoringOutputSchema = z.object({
  riskScore: z.number(),
  confidenceScore: z.number(),
  reasonCodes: z.string(),
  explanation: z.string(),
});
export type AiPoweredRiskScoringOutput = z.infer<typeof AiPoweredRiskScoringOutputSchema>;

const prompt = ai.definePrompt({
  name: 'aiPoweredRiskScoringPrompt',
  model: 'mistral-7b-instruct-v0.3',
  input: {
    schema: z.object({
      anomalyDescription: z.string(),
      riskParametersJson: z.string(),
      confidenceInterval: z.string(),
    }),
  },
  output: {schema: AiPoweredRiskScoringOutputSchema},
  prompt: `You are a STRICT JSON risk scoring engine.

IMPORTANT RULES:
- Output ONLY valid JSON.
- Do NOT include markdown.
- Do NOT include backticks.
- Do NOT include explanations outside JSON.
- Do NOT include comments.
- Ensure riskScore is a number between 0 and 100.
- Ensure confidenceScore is a number between 0 and 100.
- All fields must exist.

Return JSON EXACTLY in this format:

{
  "riskScore": number,
  "confidenceScore": number,
  "reasonCodes": "string",
  "explanation": "string"
}

Anomaly Description: {{{anomalyDescription}}}
Risk Parameters: {{{riskParametersJson}}}
Confidence Interval: {{{confidenceInterval}}}

Return JSON only.
`,
});

export const aiPoweredRiskScoring = ai.defineFlow(
  {
    name: 'aiPoweredRiskScoring',
    inputSchema: AiPoweredRiskScoringInputSchema,
    outputSchema: AiPoweredRiskScoringOutputSchema,
  },
  async (input) => {
    const { output } = await prompt({
      anomalyDescription: input.anomalyDescription,
      riskParametersJson: JSON.stringify(input.riskParameters),
      confidenceInterval: input.confidenceInterval,
    });
    const result = output || {};
    console.log("🔥 Risk Flow Final Output:", result);
    
    return {
      riskScore: result.riskScore ?? 0,
      confidenceScore: result.confidenceScore ?? 0,
      reasonCodes: result.reasonCodes ?? "N/A",
      explanation: result.explanation ?? "No explanation provided."
    };
  }
);
