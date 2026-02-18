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
  prompt: `You are a STRICT JSON risk scoring engine for an internal audit system.

RULES:
- Output ONLY valid JSON.
- Ensure riskScore and confidenceScore are numbers (0-100).
- reasonCodes should be a comma-separated string of flags.
- All fields must be present.

Anomaly Description: {{{anomalyDescription}}}
Risk Parameters: {{{riskParametersJson}}}
Confidence Interval: {{{confidenceInterval}}}

Return JSON only.`,
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
      riskParametersJson: JSON.stringify(input.riskParameters || {}),
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
