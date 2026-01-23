'use server';

import {
  aiPoweredRiskScoring,
  AiPoweredRiskScoringInput,
} from '@/ai/flows/ai-powered-risk-scoring';
import {
  generateExplanationAndEvidencePack,
  ExplanationAndEvidencePackInput,
} from '@/ai/flows/explainable-ai-engine';

export async function getRiskScore(input: AiPoweredRiskScoringInput) {
  try {
    const result = await aiPoweredRiskScoring(input);
    return result;
  } catch (error) {
    console.error('Error in getRiskScore:', error);
    // In a real app, you'd have more robust error handling and logging.
    // For now, we return a structured error or null.
    return null;
  }
}

export async function getExplanation(input: ExplanationAndEvidencePackInput) {
  try {
    // Adding a slight delay to simulate network latency for a better loading experience demo
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Add a hash to the evidence pack to simulate immutability
    const result = await generateExplanationAndEvidencePack(input);
    if(result?.evidencePack) {
      result.evidencePack.hashSignedBundle = "sha256-" + crypto.randomUUID().replace(/-/g, '');
    }
    return result;

  } catch (error) {
    console.error('Error in getExplanation:', error);
    return null;
  }
}
