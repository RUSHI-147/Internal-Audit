'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, LogOut } from 'lucide-react';
import { mockCurrentUser } from '@/lib/data';
import { mockReportLogs } from '@/lib/report-logs';
import { useAudit } from '@/contexts/AuditContext';

export default function SettingsPage() {
  const { resetAudit } = useAudit();
  const user = mockCurrentUser;
  const reportLogs = mockReportLogs.sort(
    (a, b) => new Date(b.auditDate).getTime() - new Date(a.auditDate).getTime()
  );

  const handleLogout = () => {
    // In a real app with Firebase auth:
    // import { getAuth } from "firebase/auth";
    // const auth = getAuth();
    // signOut(auth).then(() => {
    //   resetAudit();
    //   window.location.href = '/login';
    // });
    resetAudit();
    // For this mock, we'll just log and simulate redirect
    console.log('User logged out');
    alert('You have been logged out.');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account and view report history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Auditor Account Details</CardTitle>
              <CardDescription>
                Your professional information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role:</span>
                <span className="font-medium">{user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Organization:</span>
                <span className="font-medium">{user.organization}</span>
              </div>
              {user.licenseId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">License ID:</span>
                  <span className="font-medium">{user.licenseId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Joined:</span>
                <span className="font-medium">
                  {new Date(user.accountCreated).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Audit Report History</CardTitle>
              <CardDescription>
                Access previously generated audit reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report ID</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportLogs.map((log) => (
                    <TableRow key={log.reportId}>
                      <TableCell className="font-medium">
                        {log.reportId}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{log.companyName}</div>
                        <div className="text-xs text-muted-foreground">
                          {log.companyType}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(log.auditDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          minimumFractionDigits: 0,
                        }).format(log.cost)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.status === 'Completed'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          disabled={log.status === 'Draft'}
                        >
                          <a href={log.pdfUrl} target="_blank">
                            <Download className="mr-2 h-3 w-3" />
                            Download
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
