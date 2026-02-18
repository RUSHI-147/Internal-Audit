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
  explanation: z.string().catch('No explanation generated.').describe('A human-readable explanation.'),
  evidencePack: z.object({
    supportingTransactions: z.string().optional().catch(''),
    sourceDocuments: z.string().optional().catch(''),
    transformationLogs: z.string().optional().catch(''),
    analystNotes: z.string().optional().catch(''),
    hashSignedBundle: z.string().optional().catch(''),
  }).catch({
    supportingTransactions: '',
    sourceDocuments: '',
    transformationLogs: '',
    analystNotes: '',
    hashSignedBundle: ''
  }),
});
export type ExplanationAndEvidencePackOutput = z.infer<typeof ExplanationAndEvidencePackOutputSchema>;

const prompt = ai.definePrompt({
  name: 'explanationAndEvidencePackPrompt',
  model: 'mistral-7b-instruct-v0.3',
  input: {schema: ExplanationAndEvidencePackInputSchema},
  output: {schema: ExplanationAndEvidencePackOutputSchema},
  prompt: `You are a STRICT JSON generator for an internal audit system.

RULES:
- Output ONLY valid JSON.
- DO NOT include any conversational text before or after the JSON.
- CRITICAL: Escape all newlines in strings as '\\n'. DO NOT use actual newlines within string values.
- If info is missing, use an empty string. DO NOT omit any fields.

Issue Description: {{{issueDescription}}}
Violated Patterns: {{{violatedPatterns}}}
Supporting Evidence: {{{supportingEvidence}}}

Generate a JSON object exactly in this format:
{
  "explanation": "Detailed explanation string",
  "evidencePack": {
    "supportingTransactions": "Specific transaction IDs or data",
    "sourceDocuments": "Names of files or docs",
    "transformationLogs": "Summary of data movements",
    "analystNotes": "Any specific audit notes",
    "hashSignedBundle": "MD5-SUM-PLACEHOLDER"
  }
}`,
});

export const explainableAiEngine = ai.defineFlow(
  {
    name: 'explainableAiEngine',
    inputSchema: ExplanationAndEvidencePackInputSchema,
    outputSchema: ExplanationAndEvidencePackOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    const result = output || {
      explanation: "No explanation generated.",
      evidencePack: {
        supportingTransactions: "",
        sourceDocuments: "",
        transformationLogs: "",
        analystNotes: "",
        hashSignedBundle: ""
      }
    };
    
    console.log("🔥 Explanation Flow Final Output:", result);
    
    return {
      explanation: result.explanation || "No explanation generated.",
      evidencePack: {
        supportingTransactions: result.evidencePack?.supportingTransactions || "",
        sourceDocuments: result.evidencePack?.sourceDocuments || "",
        transformationLogs: result.evidencePack?.transformationLogs || "",
        analystNotes: result.evidencePack?.analystNotes || "",
        hashSignedBundle: result.evidencePack?.hashSignedBundle || ""
      }
    };
  }
);
