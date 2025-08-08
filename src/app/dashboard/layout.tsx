'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/dashboard', label: 'All Players' },
  { href: '/dashboard/goalkeepers', label: 'Goalkeepers' },
  { href: '/dashboard/defenders', label: 'Defenders' },
  { href: '/dashboard/midfielders', label: 'Midfielders' },
  { href: '/dashboard/forwards', label: 'Forwards' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '280px',
        } as React.CSSProperties
      }
    >
      <Sidebar>
        <SidebarHeader>
          <div className='px-2 py-2 text-base font-semibold'>Draft Tool</div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Players</SidebarGroupLabel>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} className='block'>
                    <SidebarMenuButton isActive={pathname === item.href}>
                      {item.label}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator />
          <div className='flex items-center justify-between px-2'>
            <SidebarTrigger />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className='flex h-full w-full flex-col'>
          <header className='bg-background sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b px-4'>
            <SidebarTrigger className='-ml-1' />
            <div className='text-muted-foreground text-sm'>
              {navItems.find((item) => item.href === pathname)?.label ||
                'Dashboard'}
            </div>
          </header>
          <div className='flex flex-1 flex-col overflow-hidden'>
            <div className='relative isolate flex min-h-0 flex-1 flex-col overflow-auto'>
              <div className='@container/main flex flex-1 flex-col gap-2'>
                <div className='flex flex-col gap-4 p-10'>{children}</div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
