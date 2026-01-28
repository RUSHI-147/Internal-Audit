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
import {
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';

const chartConfig = {} satisfies ChartConfig;

export function RiskHeatmap() {
  const data = mockRiskHeatmapData;

  const domain = [0, Math.max(...data.map((item) => item.value))];
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
        <ChartContainer config={chartConfig}>
            <ScatterChart
              margin={{
                top: 20,
                right: 20,
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
      </CardContent>
    </Card>
  );
}
