'use client';

import { Anomaly, AnomalyStatus, EvidencePack } from '@/lib/types';
import React, { useEffect, useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card';
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
import { explainableAiEngine } from '@/ai/flows/explainable-ai-engine';
import { aiPoweredRiskScoring } from '@/ai/flows/ai-powered-risk-scoring';

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

  // Local state for AI data
  const [explanation, setExplanation] = useState<string | null>(null);
  const [evidencePack, setEvidencePack] = useState<EvidencePack | null>(null);
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [reasonCodes, setReasonCodes] = useState<string | null>(null);

  const [decision, setDecision] = useState<AnomalyStatus | ''>('');
  const [justification, setJustification] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync local state from context on mount/id change
  useEffect(() => {
    if (anomaly.aiExplanation) {
      setExplanation(anomaly.aiExplanation.explanation);
      setEvidencePack(anomaly.aiExplanation.evidencePack);
    } else {
      setExplanation(null);
      setEvidencePack(null);
    }
    
    if (anomaly.aiRiskScore) {
      setRiskScore(anomaly.aiRiskScore.riskScore);
      setConfidenceScore(anomaly.aiRiskScore.confidenceScore);
      setReasonCodes(anomaly.aiRiskScore.reasonCodes);
    } else {
      setRiskScore(null);
      setConfidenceScore(null);
      setReasonCodes(null);
    }

    if (anomaly.status !== 'AI Flagged' && anomaly.auditorComment) {
      setDecision(anomaly.status);
      setJustification(anomaly.auditorComment);
    } else {
      setDecision('');
      setJustification('');
    }
  }, [anomaly.id, anomaly.status, anomaly.auditorComment, anomaly.aiExplanation, anomaly.aiRiskScore]);

  const fetchInProgress = useRef<string | null>(null);

  useEffect(() => {
    // If we already have AI data or a fetch is in flight for this ID, do nothing
    if ((explanation !== null && riskScore !== null) || fetchInProgress.current === anomaly.id) {
      return;
    }

    const fetchAiData = async () => {
      console.log("🚀 fetchAiData CALLED for anomaly:", anomaly.id);
      fetchInProgress.current = anomaly.id;
      setIsAiLoading(true);
      
      try {
        const [explanationData, riskData] = await Promise.all([
          explainableAiEngine({
            issueDescription: anomaly.description,
            violatedPatterns: anomaly.details.violatedPatterns?.join(', ') || "",
            supportingEvidence: anomaly.details.supportingEvidence?.join(', ') || "",
            transformationLogs: "",
            sourceDocuments: "",
            analystNotes: ""
          }),
          aiPoweredRiskScoring({
            anomalyDescription: anomaly.description,
            riskParameters: {},
            confidenceInterval: "medium"
          })
        ]);

        // Update local state
        setExplanation(explanationData.explanation);
        setEvidencePack(explanationData.evidencePack);
        setRiskScore(riskData.riskScore);
        setConfidenceScore(riskData.confidenceScore);
        setReasonCodes(riskData.reasonCodes);

        // Persist to context
        updateFindingAiData(anomaly.id, {
          riskScore: riskData,
          explanation: explanationData,
        });

      } catch (error) {
        console.error('Failed to fetch AI insights:', error);
      } finally {
        setIsAiLoading(false);
      }
    };
    
    fetchAiData();
  }, [anomaly.id]);

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

  // Determine which score to display (AI score preferred, then base anomaly score)
  const displayScore = riskScore !== null ? riskScore : anomaly.riskScore;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Explanation</CardTitle>
          </CardHeader>
          <CardContent>
            {isAiLoading && explanation === null ? (
              <div className="space-y-4"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-full" /></div>
            ) : explanation !== null ? (
              <p className="text-sm">{explanation}</p>
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
            {isAiLoading && evidencePack === null ? (
              <div className="space-y-4"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
            ) : evidencePack !== null ? (
              <>
                <div className="flex items-center gap-3">
                  <Box className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Supporting Transactions</h4>
                    <p className="text-muted-foreground">{evidencePack.supportingTransactions}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Source Documents</h4>
                    <p className="text-muted-foreground">{evidencePack.sourceDocuments}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileCode className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Transformation Logs</h4>
                    <p className="text-muted-foreground">{evidencePack.transformationLogs}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Immutable Hash</h4>
                    <p className="font-mono text-xs text-muted-foreground">{evidencePack.hashSignedBundle}</p>
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
            {isAiLoading && riskScore === null ? (
              <Skeleton className="h-32 w-32 rounded-full mx-auto" />
            ) : (
              <div 
                className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-8 border-primary transition-all duration-500" 
                style={{ 
                  borderColor: `hsl(var(--primary) / ${displayScore / 100})` 
                }}
              >
                <span className="text-4xl font-bold">{Math.round(displayScore)}</span>
              </div>
            )}
            {riskScore !== null && (
              <div className="mt-4">
                <p className="font-semibold">{reasonCodes}</p>
                <p className="text-sm text-muted-foreground">Confidence: {Math.round(confidenceScore || 0)}%</p>
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