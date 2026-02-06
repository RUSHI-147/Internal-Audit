'use client';

import { getRiskScore, getExplanation } from '@/app/actions';
import { Anomaly, AnomalyStatus } from '@/lib/types';
import React, { useEffect, useState } from 'react';
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
  FileCode,
  Box,
  Notebook,
  Info,
  BookCheck,
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { useAudit } from '@/contexts/AuditContext';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function AnomalyDetailView({
  anomaly,
  onDecisionSaved,
}: {
  anomaly: Anomaly;
  onDecisionSaved: () => void;
}) {
  const { updateFindingStatus, updateFindingAiData } = useAudit();
  const { toast } = useToast();

  const [decision, setDecision] = useState<AnomalyStatus | ''>('');
  const [justification, setJustification] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Effect to initialize or reset form state only when a new anomaly is selected.
  // This prevents the radio button from resetting while typing in the textarea.
  useEffect(() => {
    if (anomaly.status !== 'AI Flagged' && anomaly.auditorComment) {
      setDecision(anomaly.status);
      setJustification(anomaly.auditorComment);
    } else {
      setDecision('');
      setJustification('');
    }
  }, [anomaly.id, anomaly.status, anomaly.auditorComment]);


  // Effect to fetch AI-generated data if it's missing for the current anomaly.
  useEffect(() => {
    // If AI data already exists in the global context for this anomaly, don't refetch.
    if (anomaly.aiExplanation && anomaly.aiRiskScore) {
      return;
    }

    const fetchAiData = async () => {
      setIsAiLoading(true);
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
        // Persist the fetched AI data into the global context to prevent data loss.
        updateFindingAiData(anomaly.id, {
          riskScore: riskResult,
          explanation: explanationResult,
        });
      } catch (error) {
        console.error('Failed to fetch AI insights:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to load AI insights',
          description: 'There was an error fetching data from the AI engine.'
        })
      } finally {
        setIsAiLoading(false);
      }
    };
    fetchAiData();
  }, [anomaly.id, anomaly.aiExplanation, anomaly.aiRiskScore, anomaly.description, anomaly.details, toast, updateFindingAiData]);


  const hasDecisionBeenMade =
    anomaly.status === 'Confirmed' ||
    anomaly.status === 'Dismissed' ||
    anomaly.status === 'Needs More Info';

  // Decision-aware validation logic
  const justificationRequired = ['Confirmed', 'Dismissed'].includes(decision as string);
  const isJustificationMissing = justificationRequired && justification.trim().length === 0;
  const isSaveDisabled = !decision || isJustificationMissing || isAiLoading;

  const handleSaveDecision = () => {
    if (isSaveDisabled) return; // Guard clause

    updateFindingStatus(anomaly.id, decision as AnomalyStatus, justification);
    toast({
      title: 'Decision Saved',
      description: `Anomaly ${anomaly.id} has been marked as ${decision}.`,
    });
    onDecisionSaved();
  };
  
  const isRiskLoading = isAiLoading && !anomaly.aiRiskScore;
  const isExplanationLoading = isAiLoading && !anomaly.aiExplanation;

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
            {isExplanationLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : anomaly.aiExplanation ? (
              <p className="text-sm">{anomaly.aiExplanation.explanation}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No explanation available. Run audit to generate.
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
            {isExplanationLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : anomaly.aiExplanation ? (
              <>
                <div className="flex items-center gap-3">
                  <Box className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Supporting Transactions</h4>
                    <p className="text-muted-foreground">
                      {anomaly.aiExplanation.evidencePack.supportingTransactions}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Source Documents</h4>
                    <p className="text-muted-foreground">
                      {anomaly.aiExplanation.evidencePack.sourceDocuments}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileCode className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Transformation Logs</h4>
                    <p className="text-muted-foreground">
                      {anomaly.aiExplanation.evidencePack.transformationLogs}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Immutable Hash</h4>
                    <p className="font-mono text-xs text-muted-foreground">
                      {anomaly.aiExplanation.evidencePack.hashSignedBundle}
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
            <CardTitle className="flex items-center gap-2">
              <BookCheck className="h-5 w-5 text-primary" />
              Compliance Reference
            </CardTitle>
            <CardDescription>
              Applicable regulation, law, or internal policy reference.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-sm font-medium">{anomaly.details.complianceReference}</p>
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
              <Alert
                variant={
                  anomaly.status === 'Confirmed' ? 'destructive' : 'default'
                }
              >
                <Info className="h-4 w-4" />
                <AlertTitle>Decision Recorded: {anomaly.status}</AlertTitle>
                <AlertDescription>
                  <p className="font-semibold mt-4">Auditor Comment:</p>
                  <p className="italic">"{anomaly.auditorComment}"</p>
                  <p className="text-xs text-muted-foreground mt-4">
                    By {anomaly.decidedBy} on{' '}
                    {anomaly.decidedAt && new Date(anomaly.decidedAt).toLocaleString()}
                  </p>
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

                <div className="space-y-2">
                  <Textarea
                    placeholder="Auditor Justification (REQUIRED for Confirmed/Dismissed)"
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                  />
                  {isJustificationMissing && (
                    <p className="text-sm text-destructive">
                      Justification is required for this decision.
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleSaveDecision}
                  disabled={isSaveDisabled}
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
            {isRiskLoading ? (
              <Skeleton className="h-32 w-32 rounded-full mx-auto" />
            ) : anomaly.aiRiskScore ? (
              <div
                className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-8"
                style={{
                  borderColor: `hsl(var(--primary), ${
                    anomaly.aiRiskScore.riskScore / 100
                  })`,
                }}
              >
                <span className="text-4xl font-bold">
                  {Math.round(anomaly.aiRiskScore.riskScore)}
                </span>
              </div>
            ) : (
              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-8 border-muted">
                <span className="text-4xl font-bold">?</span>
              </div>
            )}
            {isRiskLoading ? (
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-24 mx-auto" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
            ) : anomaly.aiRiskScore ? (
              <div className="mt-4">
                <p className="font-semibold">{anomaly.aiRiskScore.reasonCodes}</p>
                <p className="text-sm text-muted-foreground">
                  Confidence: {Math.round(anomaly.aiRiskScore.confidenceScore)}%
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
