import { AnomalyListClient } from '@/components/review/anomaly-list-client';

export default function ReviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          Audit Review Queue
        </h1>
        <p className="text-muted-foreground">
          Triage, investigate, and resolve flagged anomalies.
        </p>
      </div>
      <AnomalyListClient />
    </div>
  );
}
