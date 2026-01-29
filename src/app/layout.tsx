import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/sidebar';
import AppHeader from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { AuditProvider } from '@/contexts/AuditContext';

export const metadata: Metadata = {
  title: 'AuditAI: The AI Internal Audit Copilot',
  description:
    'Reduce audit time by 40-60% while increasing audit defensibility, explainability, and regulatory readiness.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn('font-body antialiased', 'min-h-screen bg-background')}
      >
        <AuditProvider>
          <SidebarProvider>
            <div className="flex">
              <AppSidebar />
              <main className="flex-1 min-w-0">
                <AppHeader />
                <div className="p-4 md:p-8">{children}</div>
              </main>
            </div>
          </SidebarProvider>
        </AuditProvider>
        <Toaster />
      </body>
    </html>
  );
}
