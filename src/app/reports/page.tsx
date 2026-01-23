import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          Reports
        </h1>
        <p className="text-muted-foreground">
          Generate and view audit reports.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>This section is under development.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Automated executive summaries, risk heatmaps, trend analyses, and editable, exportable reports will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
