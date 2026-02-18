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
  riskScore: z.number().optional().catch(0),
  confidenceScore: z.number().optional().catch(0),
  reasonCodes: z.string().optional().catch('N/A'),
  explanation: z.string().optional().catch('No explanation provided.'),
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
- DO NOT include any conversational text.
- CRITICAL: Escape all newlines in strings as '\\n'. DO NOT use actual newlines within string values.
- Ensure riskScore and confidenceScore are numbers (0-100).
- reasonCodes should be a comma-separated string of flags.

Anomaly Description: {{{anomalyDescription}}}
Risk Parameters: {{{riskParametersJson}}}
Confidence Interval: {{{confidenceInterval}}}

Return ONLY the JSON object.`,
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
    
    const result = output || {
      riskScore: 0,
      confidenceScore: 0,
      reasonCodes: "N/A",
      explanation: "No explanation provided."
    };
    
    console.log("🔥 Risk Flow Final Output:", result);
    
    return {
      riskScore: result.riskScore ?? 0,
      confidenceScore: result.confidenceScore ?? 0,
      reasonCodes: result.reasonCodes ?? "N/A",
      explanation: result.explanation ?? "No explanation provided."
    };
  }
);
