import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockAnomalies } from '@/lib/data';
import { FileWarning, CheckCircle, ShieldAlert, BarChart } from 'lucide-react';

export async function SummaryCards() {
  // In a real app, this data would be fetched from an API
  const totalAnomalies = mockAnomalies.length;
  const pendingReview = mockAnomalies.filter(
    (a) => a.status === 'Pending Review'
  ).length;
  const confirmed = mockAnomalies.filter((a) => a.status === 'Confirmed').length;
  const reviewRate =
    totalAnomalies > 0
      ? ((totalAnomalies - pendingReview) / totalAnomalies) * 100
      : 0;
  const avgRiskScore =
    totalAnomalies > 0
      ? mockAnomalies.reduce((sum, a) => sum + a.riskScore, 0) / totalAnomalies
      : 0;

  const summaryData = [
    {
      title: 'Total Anomalies',
      value: totalAnomalies.toLocaleString(),
      icon: ShieldAlert,
      change: '+5.2% this month',
      changeType: 'increase',
    },
    {
      title: 'Pending Review',
      value: pendingReview.toLocaleString(),
      icon: FileWarning,
      change: '-10% this month',
      changeType: 'decrease',
    },
    {
      title: 'Review Rate',
      value: `${reviewRate.toFixed(1)}%`,
      icon: CheckCircle,
      change: '+2.1%',
      changeType: 'increase',
    },
    {
      title: 'Avg. Risk Score',
      value: avgRiskScore.toFixed(0),
      icon: BarChart,
      change: '+1.5 pts',
      changeType: 'increase',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {summaryData.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">{item.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
