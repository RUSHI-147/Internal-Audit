import { AnomalyDetailView } from '@/components/review/anomaly-detail-view';
import { mockAnomalies } from '@/lib/data';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AnomalyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const anomaly = mockAnomalies.find((a) => a.id === params.id);

  if (!anomaly) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
         <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/review">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Review Queue
          </Link>
        </Button>
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          Anomaly: {anomaly.id}
        </h1>
        <p className="text-lg text-muted-foreground">{anomaly.type}</p>
      </div>
      <AnomalyDetailView anomaly={anomaly} />
    </div>
  );
}
