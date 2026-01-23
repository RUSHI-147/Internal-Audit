import { AnomalyListClient } from '@/components/review/anomaly-list-client';
import { mockAnomalies } from '@/lib/data';

export default function ReviewPage() {
  // In a real app, you might fetch initial data on the server
  // and pass it to a client component for interactive filtering/sorting.
  const anomalies = mockAnomalies;

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
      <AnomalyListClient anomalies={anomalies} />
    </div>
  );
}
