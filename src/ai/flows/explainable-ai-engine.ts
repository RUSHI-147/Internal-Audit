'use server';
/**
 * @fileOverview AI Explanations and Evidence Pack Generation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplanationAndEvidencePackInputSchema = z.object({
  issueDescription: z.string().describe('A description of the flagged audit issue.'),
  violatedPatterns: z.string().describe('The specific patterns or rules violated.'),
  supportingEvidence: z.string().describe('The evidence supporting the flagged issue.'),
  transformationLogs: z.string().describe('Logs from the data transformation process.'),
  sourceDocuments: z.string().describe('Source documents related to the issue.'),
  analystNotes: z.string().optional().describe('Optional notes from the analyst.'),
});
export type ExplanationAndEvidencePackInput = z.infer<typeof ExplanationAndEvidencePackInputSchema>;

const ExplanationAndEvidencePackOutputSchema = z.object({
  explanation: z.string().describe('A human-readable explanation.'),
  evidencePack: z.object({
    supportingTransactions: z.string(),
    sourceDocuments: z.string(),
    transformationLogs: z.string(),
    analystNotes: z.string().optional(),
    hashSignedBundle: z.string(),
  }),
});
export type ExplanationAndEvidencePackOutput = z.infer<typeof ExplanationAndEvidencePackOutputSchema>;

const prompt = ai.definePrompt({
  name: 'explanationAndEvidencePackPrompt',
  model: 'mistral-7b-instruct-v0.3',
  input: {schema: ExplanationAndEvidencePackInputSchema},
  output: {schema: ExplanationAndEvidencePackOutputSchema},
  prompt: `You are a STRICT JSON generator for an internal audit system.

IMPORTANT RULES:
- Output ONLY valid JSON.
- Do NOT include markdown.
- Do NOT include backticks.
- Do NOT include explanations outside JSON.
- Do NOT include comments.
- Do NOT add any text before or after the JSON object.
- Ensure all fields are present.
- If information is missing, return empty strings.

Generate a JSON object EXACTLY in this format:

{
  "explanation": "string",
  "evidencePack": {
    "supportingTransactions": "string",
    "sourceDocuments": "string",
    "transformationLogs": "string",
    "analystNotes": "string",
    "hashSignedBundle": "to-be-generated-by-server"
  }
}

Now analyze the following:

Issue Description: {{{issueDescription}}}
Violated Patterns: {{{violatedPatterns}}}
Supporting Evidence: {{{supportingEvidence}}}
Transformation Logs: {{{transformationLogs}}}
Source Documents: {{{sourceDocuments}}}
Analyst Notes: {{{analystNotes}}}

Return JSON only.
`,
});

export const explainableAiEngine = ai.defineFlow(
  {
    name: 'explainableAiEngine',
    inputSchema: ExplanationAndEvidencePackInputSchema,
    outputSchema: ExplanationAndEvidencePackOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    const result = output || {};
    console.log("🔥 Explanation Flow Final Output:", result);
    
    return {
      explanation: result.explanation || "",
      evidencePack: result.evidencePack || {
        supportingTransactions: "",
        sourceDocuments: "",
        transformationLogs: "",
        analystNotes: "",
        hashSignedBundle: ""
      }
    };
  }
);
