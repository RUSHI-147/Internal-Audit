'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from '@/components/ui/chart';
import { mockRiskHeatmapData } from '@/lib/data';
import { useAudit } from '@/contexts/AuditContext';
import { useMemo } from 'react';
import { RiskHeatmapData, Anomaly } from '@/lib/types';
import { Scatter, ScatterChart, XAxis, YAxis, ZAxis } from 'recharts';

const chartConfig = {} satisfies ChartConfig;

const generateHeatmapData = (anomalies: Anomaly[]): RiskHeatmapData => {
  if (!anomalies || anomalies.length === 0) {
    return [];
  }

  const riskLevels = {
    High: 80,
    Medium: 60,
    Low: 0,
  };

  const getRiskLevel = (score: number) => {
    if (score > riskLevels.High) return 'High';
    if (score > riskLevels.Medium) return 'Medium';
    return 'Low';
  };

  const processMap: Record<string, string> = {
    'Duplicate Payment': 'Procure to Pay',
    'Weekend Posting': 'Record to Report',
    'Threshold Breach': 'Procure to Pay',
    'Vendor Concentration': 'Procure to Pay',
    'Round Number': 'Treasury',
  };

  const data: { [key: string]: number } = {};

  anomalies.forEach((anomaly) => {
    const process = processMap[anomaly.type] || 'Other';
    const risk = getRiskLevel(anomaly.riskScore);
    const key = `${process}|${risk}`;
    data[key] = (data[key] || 0) + 1;
  });

  return Object.entries(data).map(([key, value]) => {
    const [process, risk] = key.split('|');
    return { process, risk, value };
  });
};

export function RiskHeatmap() {
  const { findings, auditStatus } = useAudit();
  const data = useMemo(() => generateHeatmapData(findings), [findings]);

  const domain = [0, Math.max(...data.map((item) => item.value)) || 1];
  const range = [100, 500];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Heatmap</CardTitle>
        <CardDescription>
          Anomaly concentration by business process and risk level
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[350px] w-full p-0">
        {auditStatus !== 'COMPLETED' ? (
          <div className="flex h-full items-center justify-center text-center text-muted-foreground">
            <p>Run an audit to see the risk heatmap.</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <ScatterChart
              margin={{
                top: 20,
                right: 40,
                bottom: 20,
                left: 20,
              }}
            >
              <XAxis
                dataKey="risk"
                type="category"
                name="Risk Level"
                tickLine={false}
                axisLine={false}
                allowDuplicatedCategory={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                dataKey="process"
                type="category"
                name="Business Process"
                tickLine={false}
                axisLine={false}
                allowDuplicatedCategory={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                width={100}
              />
              <ZAxis
                type="number"
                dataKey="value"
                domain={domain}
                range={range}
              />
              <ChartTooltip
                cursor={false}
                content={({ payload }) => {
                  if (payload && payload.length > 0) {
                    const item = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2.5 shadow-lg">
                        <div className="font-bold">{item.process}</div>
                        <div className="text-sm">
                          <span className="font-medium">{item.risk} Risk: </span>
                          {item.value} anomalies
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                name="Anomalies"
                data={data}
                fill="hsl(var(--primary))"
                shape="circle"
                opacity={0.8}
              />
            </ScatterChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
