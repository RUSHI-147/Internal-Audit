'use server';
/**
 * @fileOverview AI Explanations and Evidence Pack Generation.
 *
 * - generateExplanationAndEvidencePack - A function that generates explanations and evidence packs for flagged audit issues.
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
  explanation: z.string().describe('A human-readable explanation of why the issue was flagged.'),
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
  model: 'mistral-7b-instruct-v0.2',
  input: {schema: ExplanationAndEvidencePackInputSchema},
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

const generateExplanationAndEvidencePackFlow = ai.defineFlow(
  {
    name: 'generateExplanationAndEvidencePackFlow',
    inputSchema: ExplanationAndEvidencePackInputSchema,
    outputSchema: ExplanationAndEvidencePackOutputSchema,
  },
  async (input) => {
    const response = await prompt(input);
  
    if (!response?.text) {
      throw new Error("Explanation flow returned empty response");
    }
  
    try {
      const result = JSON.parse(response.text);
      return {
        explanation: result.explanation || "No explanation provided by AI.",
        evidencePack: {
          supportingTransactions: result.evidencePack?.supportingTransactions || "No supporting transactions found.",
          sourceDocuments: result.evidencePack?.sourceDocuments || "No source documents identified.",
          transformationLogs: result.evidencePack?.transformationLogs || "No transformation logs available.",
          analystNotes: result.evidencePack?.analystNotes || "",
          hashSignedBundle: result.evidencePack?.hashSignedBundle || "Pending signing...",
        },
      };
    } catch (e) {
      console.error("Failed to parse AI explanation JSON:", response.text);
      throw new Error("AI returned invalid JSON structure.");
    }
  }  
);
