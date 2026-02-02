'use client';

import {
  AiPoweredRiskScoringOutput,
  ExplanationAndEvidencePackOutput,
} from '@/ai/flows/explainable-ai-engine';
import { getRiskScore, getExplanation } from '@/app/actions';
import { Anomaly, AnomalyStatus } from '@/lib/types';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Skeleton } from '../ui/skeleton';
import {
  FileText,
  Fingerprint,
  Lightbulb,
  ShieldAlert,
  ClipboardCheck,
  ClipboardX,
  FileCode,
  Box,
  Notebook,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { useAudit } from '@/contexts/AuditContext';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function AnomalyDetailView({ anomaly: initialAnomaly }: { anomaly: Anomaly }) {
  const { findings, updateFindingStatus } = useAudit();
  const { toast } = useToast();

  // Ensure we have the latest version of the anomaly from the context
  const anomaly = useMemo(
    () => findings.find((f) => f.id === initialAnomaly.id) || initialAnomaly,
    [findings, initialAnomaly]
  );

  const [riskScore, setRiskScore] =
    useState<AiPoweredRiskScoringOutput | null>(null);
  const [explanation, setExplanation] =
    useState<ExplanationAndEvidencePackOutput | null>(null);
  const [isLoadingRisk, setIsLoadingRisk] = useState(false);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

  const [decision, setDecision] = useState<AnomalyStatus | ''>('');
  const [justification, setJustification] = useState('');

  const hasDecisionBeenMade =
    anomaly.status === 'Confirmed' ||
    anomaly.status === 'Dismissed' ||
    anomaly.status === 'Needs More Info';

  useEffect(() => {
    const fetchAiData = async () => {
      setIsLoadingRisk(true);
      setIsLoadingExplanation(true);
      try {
        const [riskResult, explanationResult] = await Promise.all([
          getRiskScore({
            anomalyDescription: anomaly.description,
            riskParameters: anomaly.details.violatedPatterns.join(', '),
            confidenceInterval: '95%',
          }),
          getExplanation({
            issueDescription: anomaly.description,
            violatedPatterns: anomaly.details.violatedPatterns.join(', '),
            supportingEvidence: anomaly.details.supportingEvidence.join(', '),
            transformationLogs: anomaly.details.transformationLogs.join(', '),
            sourceDocuments: anomaly.details.sourceDocuments.join(', '),
          }),
        ]);
        setRiskScore(riskResult);
        setExplanation(explanationResult);
      } catch (error) {
        console.error('Failed to fetch AI insights:', error);
      } finally {
        setIsLoadingRisk(false);
        setIsLoadingExplanation(false);
      }
    };
    fetchAiData();
  }, [anomaly]);

  const handleSaveDecision = () => {
    if (!decision || !justification) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select a decision and provide a justification.',
      });
      return;
    }
    updateFindingStatus(anomaly.id, decision, justification);
    toast({
      title: 'Decision Saved',
      description: `Anomaly ${anomaly.id} has been marked as ${decision}.`,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Explanation</CardTitle>
            <CardDescription>
              Why this anomaly was flagged by AuditAI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingExplanation ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : explanation ? (
              <p className="text-sm">{explanation.explanation}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No explanation available.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auto-Assembled Evidence Pack</CardTitle>
            <CardDescription>
              Supporting information for this anomaly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {isLoadingExplanation ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : explanation ? (
              <>
                <div className="flex items-center gap-3">
                  <Box className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Supporting Transactions</h4>
                    <p className="text-muted-foreground">
                      {explanation.evidencePack.supportingTransactions}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Source Documents</h4>
                    <p className="text-muted-foreground">
                      {explanation.evidencePack.sourceDocuments}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileCode className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Transformation Logs</h4>
                    <p className="text-muted-foreground">
                      {explanation.evidencePack.transformationLogs}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Immutable Hash</h4>
                    <p className="font-mono text-xs text-muted-foreground">
                      {explanation.evidencePack.hashSignedBundle}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">
                No evidence pack available.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auditor Decision</CardTitle>
            <CardDescription>
              Review the evidence and make a final determination. A justification
              is mandatory for compliance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {hasDecisionBeenMade ? (
              <Alert variant={anomaly.status === 'Confirmed' ? 'destructive' : 'default'}>
                <Info className="h-4 w-4" />
                <AlertTitle>Decision Recorded: {anomaly.status}</AlertTitle>
                <AlertDescription>
                  <p className="font-semibold mt-2">Auditor Comment:</p>
                  <p>{anomaly.auditorComment}</p>
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <RadioGroup
                  value={decision}
                  onValueChange={(val: AnomalyStatus) => setDecision(val)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="Confirmed" id="d-confirmed" />
                    <Label htmlFor="d-confirmed" className="font-normal">
                      Confirm Finding
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="Dismissed" id="d-dismissed" />
                    <Label htmlFor="d-dismissed" className="font-normal">
                      Dismiss Finding (False Positive)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem
                      value="Needs More Info"
                      id="d-more-info"
                    />
                    <Label htmlFor="d-more-info" className="font-normal">
                      Keep Open / Needs More Info
                    </Label>
                  </div>
                </RadioGroup>

                <Textarea
                  placeholder="Auditor Justification (REQUIRED)"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                />
                <Button
                  onClick={handleSaveDecision}
                  disabled={!decision || !justification}
                >
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Save Decision
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              AI-Powered Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {isLoadingRisk ? (
              <Skeleton className="h-32 w-32 rounded-full mx-auto" />
            ) : riskScore ? (
              <div
                className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-8"
                style={{
                  borderColor: `hsl(var(--primary), ${
                    riskScore.riskScore / 100
                  })`,
                }}
              >
                <span className="text-4xl font-bold">
                  {Math.round(riskScore.riskScore)}
                </span>
              </div>
            ) : (
              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-8 border-muted">
                <span className="text-4xl font-bold">?</span>
              </div>
            )}
            {isLoadingRisk ? (
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-24 mx-auto" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
            ) : riskScore ? (
              <div className="mt-4">
                <p className="font-semibold">{riskScore.reasonCodes}</p>
                <p className="text-sm text-muted-foreground">
                  Confidence: {Math.round(riskScore.confidenceScore)}%
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Could not calculate risk score.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Anomaly Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">
                {anomaly.details.amount?.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vendor:</span>
              <span className="font-medium">{anomaly.details.vendor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">{anomaly.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge>{anomaly.status}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
