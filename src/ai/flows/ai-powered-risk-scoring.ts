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
  output: {schema: AiPoweredRiskScoringOutputSchema},
  prompt: `You are an AI-powered risk scoring engine for internal audits. Your task is to assign a risk score (0-100) to a flagged anomaly based on the provided description, configurable risk parameters, and confidence interval.

Anomaly Description: {{{anomalyDescription}}}
Risk Parameters: {{{riskParameters}}}
Confidence Interval: {{{confidenceInterval}}}

Your output MUST be a single JSON object that conforms to the following structure. Do not add any text before or after the JSON object.

{
  "riskScore": <A number between 0 and 100>,
  "confidenceScore": <A number between 0 and 100 for the confidence of the risk assessment>,
  "reasonCodes": "<A concise string of reason codes explaining the risk assignment>",
  "explanation": "<A human-readable explanation of the risk scoring, understandable by an audit manager>"
}`,
});

const aiPoweredRiskScoringFlow = ai.defineFlow(
  {
    name: 'aiPoweredRiskScoringFlow',
    inputSchema: AiPoweredRiskScoringInputSchema,
    outputSchema: AiPoweredRiskScoringOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
