'use server';

/**
 * @fileOverview An AI-powered risk scoring flow that assigns risk scores to flagged anomalies based on configurable risk parameters and confidence intervals.
 *
 * - aiPoweredRiskScoring - A function that handles the risk scoring process.
 * - AiPoweredRiskScoringInput - The input type for the aiPoweredRiskScoring function.
 * - AiPoweredRiskScoringOutput - The return type for the aiPoweredRiskScoring function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPoweredRiskScoringInputSchema = z.object({
  anomalyDescription: z.string().describe('Description of the anomaly detected.'),
  riskParameters: z.string().describe('Configurable risk parameters (e.g., threshold breaches, vendor concentration).'),
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
  model: 'huggingface-llama3',
  input: {schema: AiPoweredRiskScoringInputSchema},
  //output: {schema: AiPoweredRiskScoringOutputSchema},
  prompt: `You are a STRICT JSON risk scoring engine.

IMPORTANT RULES:
- Return STRICT JSON only.
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
  
    const result = JSON.parse(response.text);
  
    console.log("Final Risk Flow Output:", result);
  
    return {
      riskScore: result.riskScore ?? 0,
      confidenceScore: result.confidenceScore ?? 0,
      reasonCodes: result.reasonCodes ?? "",
      explanation: result.explanation ?? "",
    };
  }  
);
