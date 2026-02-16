'use server';
/**
 * @fileOverview AI Explanations and Evidence Pack Generation.
 *
 * - generateExplanationAndEvidencePack - A function that generates explanations and evidence packs for flagged audit issues.
 * - ExplanationAndEvidencePackInput - The input type for the generateExplanationAndEvidencePack function.
 * - ExplanationAndEvidencePackOutput - The return type for the generateExplanationAndEvidencePack function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplanationAndEvidencePackInputSchema = z.object({
  issueDescription: z.string().describe('A description of the flagged audit issue.'),
  violatedPatterns: z.string().describe('The specific patterns or rules violated.'),
  supportingEvidence: z.string().describe('The evidence supporting the flagged issue, such as transaction details and document snippets.'),
  transformationLogs: z.string().describe('Logs from the data transformation process, providing context to the issue'),
  sourceDocuments: z.string().describe('Source documents related to the issue.'),
  analystNotes: z.string().optional().describe('Optional notes from the analyst reviewing the issue.'),
});
export type ExplanationAndEvidencePackInput = z.infer<typeof ExplanationAndEvidencePackInputSchema>;

const ExplanationAndEvidencePackOutputSchema = z.object({
  explanation: z.string().describe('A human-readable explanation of why the issue was flagged, the patterns violated, and the supporting evidence.'),
  evidencePack: z.object({
    supportingTransactions: z.string().describe('Supporting transactions related to the issue.'),
    sourceDocuments: z.string().describe('Source documents related to the issue.'),
    transformationLogs: z.string().describe('Transformation logs for the issue.'),
    analystNotes: z.string().optional().describe('Analyst notes on the issue, if available.'),
    hashSignedBundle: z.string().describe('Immutable hash-signed bundle of the evidence pack.'),
  }).describe('An auto-assembled evidence pack containing supporting information.'),
});
export type ExplanationAndEvidencePackOutput = z.infer<typeof ExplanationAndEvidencePackOutputSchema>;

export async function generateExplanationAndEvidencePack(input: ExplanationAndEvidencePackInput): Promise<ExplanationAndEvidencePackOutput> {
  return generateExplanationAndEvidencePackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explanationAndEvidencePackPrompt',
  model: 'huggingface-llama3',
  input: {schema: ExplanationAndEvidencePackInputSchema},
  output: {schema: ExplanationAndEvidencePackOutputSchema},
  prompt: `You are an AI assistant designed to generate human-readable explanations and evidence packs for flagged audit issues.

  Based on the issue description, violated patterns, supporting evidence, transformation logs, source documents, and analyst notes (if available), create a comprehensive explanation and evidence pack.

  Issue Description: {{{issueDescription}}}
  Violated Patterns: {{{violatedPatterns}}}
  Supporting Evidence: {{{supportingEvidence}}}
  Transformation Logs: {{{transformationLogs}}}
  Source Documents: {{{sourceDocuments}}}
  Analyst Notes: {{{analystNotes}}}

  Your output MUST be a single JSON object that conforms to the following structure. Do not add any text before or after the JSON object.

  {
    "explanation": "A human-readable explanation of why the issue was flagged, the patterns violated, and the supporting evidence.",
    "evidencePack": {
      "supportingTransactions": "A summary of supporting transactions related to the issue.",
      "sourceDocuments": "A summary of source documents related to the issue.",
      "transformationLogs": "A summary of transformation logs for the issue.",
      "analystNotes": "A summary of analyst notes on the issue, if available.",
      "hashSignedBundle": "A placeholder string for the hash, like 'to-be-generated-by-server'."
    }
  }
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
});

const generateExplanationAndEvidencePackFlow = ai.defineFlow(
  {
    name: 'generateExplanationAndEvidencePackFlow',
    inputSchema: ExplanationAndEvidencePackInputSchema,
    outputSchema: ExplanationAndEvidencePackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
