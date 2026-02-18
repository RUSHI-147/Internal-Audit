'use server';

import {
  aiPoweredRiskScoring,
  AiPoweredRiskScoringInput,
} from '@/ai/flows/ai-powered-risk-scoring';
import {
  explainableAiEngine,
  ExplanationAndEvidencePackInput,
} from '@/ai/flows/explainable-ai-engine';

export async function getRiskScore(input: AiPoweredRiskScoringInput) {
  try {
    const result = await aiPoweredRiskScoring(input);
    return result;
  } catch (error) {
    console.error('Error in getRiskScore:', error);
    return null;
  }
}

export async function getExplanation(input: ExplanationAndEvidencePackInput) {
  try {
    const result = await explainableAiEngine(input);
    return result;
  } catch (error) {
    console.error('Error in getExplanation:', error);
    return null;
  }
}
