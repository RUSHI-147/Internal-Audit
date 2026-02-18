'use server';

/**
 * @fileOverview This file defines a Genkit flow for intelligent anomaly detection in audit data.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentAnomalyDetectionInputSchema = z.object({
  journalEntries: z.array(z.any()),
  vendors: z.array(z.any()),
  payments: z.array(z.any()),
  users: z.array(z.any()),
  approvals: z.array(z.any()),
  documents: z.array(z.any()),
  rules: z.array(z.any()),
});
export type IntelligentAnomalyDetectionInput = z.infer<typeof IntelligentAnomalyDetectionInputSchema>;

const AnomalyResultSchema = z.object({
  id: z.string(),
  type: z.string(),
  score: z.number(),
  reason: z.string(),
  explanation: z.string(),
  supportingEvidence: z.array(z.string()),
});

const IntelligentAnomalyDetectionOutputSchema = z.object({
  anomalies: z.array(AnomalyResultSchema),
});
export type IntelligentAnomalyDetectionOutput = z.infer<typeof IntelligentAnomalyDetectionOutputSchema>;

const promptInputSchema = z.object({
  journalEntriesJson: z.string(),
  vendorsJson: z.string(),
  paymentsJson: z.string(),
  usersJson: z.string(),
  approvalsJson: z.string(),
  documentsJson: z.string(),
  rulesJson: z.string(),
});

const anomalyDetectionPrompt = ai.definePrompt({
  name: 'anomalyDetectionPrompt',
  model: 'mistral-7b-instruct-v0.3',
  input: { schema: promptInputSchema },
  output: { schema: IntelligentAnomalyDetectionOutputSchema },
  prompt: `You are an AI Internal Audit Copilot responsible for detecting anomalies in financial data.
  Your goal is to identify potential issues such as duplicate payments, threshold breaches, and unusual patterns.

  Analyze the following data:

  Journal Entries: {{{journalEntriesJson}}}
  Vendors: {{{vendorsJson}}}
  Payments: {{{paymentsJson}}}
  Users: {{{usersJson}}}
  Approvals: {{{approvalsJson}}}
  Documents: {{{documentsJson}}}
  Rules: {{{rulesJson}}}
  `,
});

export const intelligentAnomalyDetection = ai.defineFlow(
  {
    name: 'intelligentAnomalyDetectionFlow',
    inputSchema: IntelligentAnomalyDetectionInputSchema,
    outputSchema: IntelligentAnomalyDetectionOutputSchema,
  },
  async input => {
    const { output } = await anomalyDetectionPrompt({
      journalEntriesJson: JSON.stringify(input.journalEntries),
      vendorsJson: JSON.stringify(input.vendors),
      paymentsJson: JSON.stringify(input.payments),
      usersJson: JSON.stringify(input.users),
      approvalsJson: JSON.stringify(input.approvals),
      documentsJson: JSON.stringify(input.documents),
      rulesJson: JSON.stringify(input.rules),
    });
    return output!;
  }
);
