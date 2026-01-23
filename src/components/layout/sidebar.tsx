'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  DatabaseZap,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { mockCurrentUser } from '@/lib/data';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ingestion', label: 'Data Ingestion', icon: DatabaseZap },
  { href: '/review', label: 'Audit Review', icon: ShieldCheck },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="h-screen border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-3 p-2">
          <Logo />
          <h1 className="text-xl font-headline font-bold text-primary">
            AuditAI
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} className="w-full">
                <SidebarMenuButton
                  isActive={
                    item.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(item.href)
                  }
                  className="w-full justify-start"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-base">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={mockCurrentUser.avatarUrl} />
              <AvatarFallback>
                {mockCurrentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{mockCurrentUser.name}</p>
              <p className="text-xs text-muted-foreground">
                {mockCurrentUser.email}
              </p>
            </div>
          </div>
          <SidebarMenuButton variant="ghost" size="icon" className="h-8 w-8">
            <LogOut className="h-5 w-5" />
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
