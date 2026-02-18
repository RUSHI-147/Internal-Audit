'use server';

/**
 * @fileOverview An AI-powered risk scoring flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPoweredRiskScoringInputSchema = z.object({
  anomalyDescription: z.string().describe('Description of the anomaly detected.'),
  riskParameters: z.string().describe('Configurable risk parameters.'),
  confidenceInterval: z.string().describe('Confidence interval for the anomaly detection.'),
});
export type AiPoweredRiskScoringInput = z.infer<typeof AiPoweredRiskScoringInputSchema>;

const AiPoweredRiskScoringOutputSchema = z.object({
  riskScore: z.number().describe('The risk score assigned to the anomaly (0-100).'),
  confidenceScore: z.number().describe('The confidence score of the risk assessment.'),
  reasonCodes: z.string().describe('Reason codes explaining the risk score assignment.'),
  explanation: z.string().describe('Human-readable explanation of the risk scoring.'),
});
export type AiPoweredRiskScoringOutput = z.infer<typeof AiPoweredRiskScoringOutputSchema>;

export async function aiPoweredRiskScoring(input: AiPoweredRiskScoringInput): Promise<AiPoweredRiskScoringOutput> {
  return aiPoweredRiskScoringFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredRiskScoringPrompt',
  model: 'mistral-7b-instruct-v0.2',
  input: {schema: AiPoweredRiskScoringInputSchema},
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
Risk Parameters: {{{riskParameters}}}
Confidence Interval: {{{confidenceInterval}}}

Return JSON only.
`,
});

const aiPoweredRiskScoringFlow = ai.defineFlow(
  {
    name: 'aiPoweredRiskScoringFlow',
    inputSchema: AiPoweredRiskScoringInputSchema,
    outputSchema: AiPoweredRiskScoringOutputSchema,
  },
  async (input) => {
    const response = await prompt(input);
  
    if (!response?.text) {
      throw new Error("Risk scoring flow returned empty response");
    }
  
    try {
      const result = JSON.parse(response.text);
      return {
        riskScore: Number(result.riskScore) || 0,
        confidenceScore: Number(result.confidenceScore) || 0,
        reasonCodes: result.reasonCodes || "No reason codes provided.",
        explanation: result.explanation || "No explanation provided.",
      };
    } catch (e) {
      console.error("Failed to parse Risk Score AI JSON:", response.text);
      throw new Error("AI returned invalid risk score JSON.");
    }
  }  
);
