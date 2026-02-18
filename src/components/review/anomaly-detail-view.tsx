'use client';

import { getRiskScore, getExplanation } from '@/app/actions';
import { Anomaly, AnomalyStatus } from '@/lib/types';
import React, { useEffect, useState, useMemo } from 'react';
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
  ShieldAlert,
  ClipboardCheck,
  FileCode,
  Box,
  Info,
  BookCheck,
  Loader,
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { useAudit } from '@/contexts/AuditContext';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function AnomalyDetailView({
  anomaly: anomalyProp,
  onDecisionSaved,
}: {
  anomaly: Anomaly;
  onDecisionSaved: () => void;
}) {
  const { findings, updateFindingStatus, updateFindingAiData } = useAudit();
  const { toast } = useToast();

  const anomaly = findings.find((f) => f.id === anomalyProp.id) ?? anomalyProp;

  const [decision, setDecision] = useState<AnomalyStatus | ''>('');
  const [justification, setJustification] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (anomaly.status !== 'AI Flagged' && anomaly.auditorComment) {
      setDecision(anomaly.status);
      setJustification(anomaly.auditorComment);
    } else {
      setDecision('');
      setJustification('');
    }
  }, [anomaly.id, anomaly.status, anomaly.auditorComment]);

  const stableDetailsString = useMemo(() => JSON.stringify(anomaly.details), [anomaly.details]);

  useEffect(() => {
    // Only fetch if data is missing
    if (anomaly.aiExplanation && anomaly.aiRiskScore) return;

    const fetchAiData = async () => {
      setIsAiLoading(true);
      try {
        // Fetch missing data pieces independently
        const riskPromise = !anomaly.aiRiskScore ? getRiskScore({
          anomalyDescription: anomaly.description,
          riskParameters: anomaly.details.violatedPatterns.join(', '),
          confidenceInterval: '95%',
        }) : Promise.resolve(anomaly.aiRiskScore);

        const explanationPromise = !anomaly.aiExplanation ? getExplanation({
          issueDescription: anomaly.description,
          violatedPatterns: anomaly.details.violatedPatterns.join(', '),
          supportingEvidence: anomaly.details.supportingEvidence.join(', '),
          transformationLogs: anomaly.details.transformationLogs.join(', '),
          sourceDocuments: anomaly.details.sourceDocuments.join(', '),
        }) : Promise.resolve(anomaly.aiExplanation);

        const [riskResult, explanationResult] = await Promise.all([riskPromise, explanationPromise]);

        // Update context if we received any new data
        if (riskResult || explanationResult) {
          updateFindingAiData(anomaly.id, {
            riskScore: riskResult || anomaly.aiRiskScore || null,
            explanation: explanationResult || anomaly.aiExplanation || null,
          });
        }
      } catch (error) {
        console.error('Failed to fetch AI insights:', error);
      } finally {
        setIsAiLoading(false);
      }
    };
    
    fetchAiData();
  }, [anomaly.id, anomaly.description, stableDetailsString, anomaly.aiExplanation, anomaly.aiRiskScore, updateFindingAiData]);

  const hasDecisionBeenMade =
    anomaly.status === 'Confirmed' ||
    anomaly.status === 'Dismissed' ||
    anomaly.status === 'Needs More Info';
    
  const handleSaveDecision = () => {
    if (!decision) {
      toast({ variant: 'destructive', title: 'Decision Required', description: 'Please select a decision.' });
      return;
    }

    if ((decision === 'Confirmed' || decision === 'Dismissed') && justification.trim().length === 0) {
      toast({ variant: 'destructive', title: 'Justification Required', description: 'Justification is mandatory.' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      updateFindingStatus(anomaly.id, decision, justification);
      toast({ title: 'Decision Saved', description: `Anomaly ${anomaly.id} marked as ${decision}.` });
      onDecisionSaved();
      setIsSubmitting(false);
    }, 500);
  };

  const isRiskLoading = isAiLoading && !anomaly.aiRiskScore;
  const isExplanationLoading = isAiLoading && !anomaly.aiExplanation;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Explanation</CardTitle>
          </CardHeader>
          <CardContent>
            {isExplanationLoading ? (
              <div className="space-y-4"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-full" /></div>
            ) : anomaly.aiExplanation ? (
              <p className="text-sm">{anomaly.aiExplanation.explanation}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">AI explanation is being generated or unavailable.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auto-Assembled Evidence Pack</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {isExplanationLoading ? (
              <div className="space-y-4"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
            ) : anomaly.aiExplanation ? (
              <>
                <div className="flex items-center gap-3">
                  <Box className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Supporting Transactions</h4>
                    <p className="text-muted-foreground">{anomaly.aiExplanation.evidencePack.supportingTransactions}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Source Documents</h4>
                    <p className="text-muted-foreground">{anomaly.aiExplanation.evidencePack.sourceDocuments}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileCode className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Transformation Logs</h4>
                    <p className="text-muted-foreground">{anomaly.aiExplanation.evidencePack.transformationLogs}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Immutable Hash</h4>
                    <p className="font-mono text-xs text-muted-foreground">{anomaly.aiExplanation.evidencePack.hashSignedBundle}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground italic">Evidence pack not yet assembled.</p>
            )}
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookCheck className="h-5 w-5 text-primary" />
              Compliance Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-sm font-medium">{anomaly.details.complianceReference}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auditor Decision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {hasDecisionBeenMade ? (
              <Alert variant={anomaly.status === 'Confirmed' ? 'destructive' : 'default'}>
                <Info className="h-4 w-4" />
                <AlertTitle>Decision Recorded: {anomaly.status}</AlertTitle>
                <AlertDescription>
                  <p className="font-semibold mt-4">Auditor Justification:</p>
                  <p className="italic">"{anomaly.auditorComment}"</p>
                  <p className="text-xs text-muted-foreground mt-4">By {anomaly.decidedBy} on {anomaly.decidedAt && new Date(anomaly.decidedAt).toLocaleString()}</p>
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <RadioGroup value={decision} onValueChange={(val: AnomalyStatus) => setDecision(val)} className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="Confirmed" id="d-confirmed" />
                    <Label htmlFor="d-confirmed" className="font-normal">Confirm Finding</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="Dismissed" id="d-dismissed" />
                    <Label htmlFor="d-dismissed" className="font-normal">Dismiss Finding</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="Needs More Info" id="d-more-info" />
                    <Label htmlFor="d-more-info" className="font-normal">Needs More Info</Label>
                  </div>
                </RadioGroup>
                <Textarea placeholder="Auditor Justification (Mandatory for Confirmation/Dismissal)" value={justification} onChange={(e) => setJustification(e.target.value)} />
                <Button onClick={handleSaveDecision} disabled={isAiLoading || isSubmitting}>
                  {isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <ClipboardCheck className="mr-2 h-4 w-4" />}
                  {isSubmitting ? 'Saving...' : 'Save Decision'}
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
              AI Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {isRiskLoading ? (
              <Skeleton className="h-32 w-32 rounded-full mx-auto" />
            ) : anomaly.aiRiskScore ? (
              <div 
                className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-8 border-primary transition-all duration-500" 
                style={{ 
                  borderColor: `hsla(var(--primary), ${(anomaly.aiRiskScore.riskScore || 0) / 100})` 
                }}
              >
                <span className="text-4xl font-bold">{Math.round(anomaly.aiRiskScore.riskScore)}</span>
              </div>
            ) : (
              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-8 border-muted">
                <span className="text-4xl font-bold">?</span>
              </div>
            )}
            {anomaly.aiRiskScore && (
              <div className="mt-4">
                <p className="font-semibold">{anomaly.aiRiskScore.reasonCodes}</p>
                <p className="text-sm text-muted-foreground">Confidence: {Math.round(anomaly.aiRiskScore.confidenceScore)}%</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Anomaly Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Amount:</span><span className="font-medium">{anomaly.details.amount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Vendor:</span><span className="font-medium">{anomaly.details.vendor}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Date:</span><span className="font-medium">{anomaly.date}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
