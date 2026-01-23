'use server';

/**
 * @fileOverview This file defines a Genkit flow for intelligent anomaly detection in audit data.
 *
 * It includes the `intelligentAnomalyDetection` function, which takes data as input and returns
 * anomaly scores and explanations using a combination of rule-based logic, statistical methods,
 * and potentially machine learning models.
 *
 * @interface IntelligentAnomalyDetectionInput - Defines the input schema for the flow.
 * @interface IntelligentAnomalyDetectionOutput - Defines the output schema for the flow.
 * @function intelligentAnomalyDetection - The main function to trigger the anomaly detection flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const IntelligentAnomalyDetectionInputSchema = z.object({
  journalEntries: z.array(
    z.object({
      id: z.string(),
      date: z.string(),
      amount: z.number(),
      vendor: z.string(),
      description: z.string(),
    })
  ).describe('An array of journal entries to analyze for anomalies.'),
  vendors: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ).describe('An array of vendors.'),
  payments: z.array(
    z.object({
      id: z.string(),
      date: z.string(),
      amount: z.number(),
      vendor: z.string(),
    })
  ).describe('An array of payments.'),
  users: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ).describe('An array of users.'),
  approvals: z.array(
    z.object({
      id: z.string(),
      date: z.string(),
      user: z.string(),
    })
  ).describe('An array of approvals.'),
  documents: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      content: z.string(),
    })
  ).describe('An array of documents.'),
  rules: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      logic: z.string(),
    })
  ).describe('An array of rules to apply to the data.'),
});
export type IntelligentAnomalyDetectionInput = z.infer<typeof IntelligentAnomalyDetectionInputSchema>;

const AnomalyResultSchema = z.object({
  id: z.string().describe('The ID of the record that has the anomaly.'),
  type: z.string().describe('The type of anomaly detected (e.g., duplicate payment, threshold breach).'),
  score: z.number().describe('The anomaly score (0-100).'),
  reason: z.string().describe('The reason for the anomaly.'),
  explanation: z.string().describe('A human-readable explanation of the anomaly.'),
  supportingEvidence: z.array(z.string()).describe('List of supporting evidence (IDs of related records).'),
});

const IntelligentAnomalyDetectionOutputSchema = z.object({
  anomalies: z.array(AnomalyResultSchema).describe('An array of detected anomalies with scores and explanations.'),
});
export type IntelligentAnomalyDetectionOutput = z.infer<typeof IntelligentAnomalyDetectionOutputSchema>;

const anomalyDetectionPrompt = ai.definePrompt({
  name: 'anomalyDetectionPrompt',
  input: { schema: IntelligentAnomalyDetectionInputSchema },
  output: { schema: IntelligentAnomalyDetectionOutputSchema },
  prompt: `You are an AI Internal Audit Copilot responsible for detecting anomalies in financial data.
  You will receive various data sets including journal entries, vendors, payments, users, approvals and documents.
  You will also receive an array of rules that you need to apply to the data to detect anomalies.

  Your goal is to identify potential issues such as duplicate payments, threshold breaches, vendor concentration risks, and unusual patterns.
  For each identified anomaly, you must provide a score (0-100), a reason, and a human-readable explanation.
  You must also provide a list of supporting evidence.

  Here is the data you will be analyzing:

  Journal Entries: {{{JSON.stringify journalEntries}}}
  Vendors: {{{JSON.stringify vendors}}}
  Payments: {{{JSON.stringify payments}}}
  Users: {{{JSON.stringify users}}}
  Approvals: {{{JSON.stringify approvals}}}
  Documents: {{{JSON.stringify documents}}}
  Rules: {{{JSON.stringify rules}}}
  `,
});

export async function intelligentAnomalyDetection(input: IntelligentAnomalyDetectionInput): Promise<IntelligentAnomalyDetectionOutput> {
  return intelligentAnomalyDetectionFlow(input);
}

const intelligentAnomalyDetectionFlow = ai.defineFlow(
  {
    name: 'intelligentAnomalyDetectionFlow',
    inputSchema: IntelligentAnomalyDetectionInputSchema,
    outputSchema: IntelligentAnomalyDetectionOutputSchema,
  },
  async input => {
    const { output } = await anomalyDetectionPrompt(input);
    return output!;
  }
);
