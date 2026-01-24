'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart,
  Calendar,
  LogOut,
  Home,
  UserCheck,
  ChevronRight,
  FolderOpenDot,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isProductRouteActive = pathname.startsWith('/admin/products');
  const isCmsRouteActive = pathname.startsWith('/admin/content');

  const [isProductsOpen, setIsProductsOpen] = useState(isProductRouteActive);
  const [isCmsOpen, setIsCmsOpen] = useState(isCmsRouteActive);

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <span className="font-headline text-2xl font-bold">AdminHub</span>
            <Badge variant="outline">Beta</Badge>
          </div>
        </SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/admin/dashboard">
              <SidebarMenuButton isActive={pathname === '/admin/dashboard'} tooltip="Dashboard">
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/admin/orders">
              <SidebarMenuButton isActive={pathname === '/admin/orders'} tooltip="Orders">
                <ShoppingCart />
                <span>Orders</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          {/* Products Accordion */}
          <SidebarMenuItem asChild>
            <Collapsible open={isProductsOpen} onOpenChange={setIsProductsOpen}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  isActive={isProductRouteActive}
                  tooltip="Products"
                  className="justify-between w-full"
                >
                  <div className="flex items-center gap-2">
                    <Package />
                    <span>Products</span>
                  </div>
                  <ChevronRight className={cn('h-4 w-4 transition-transform', isProductsOpen && 'rotate-90')} />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <Link href="/admin/products">
                      <SidebarMenuSubButton isActive={pathname === '/admin/products'}>
                        All Products
                      </SidebarMenuSubButton>
                    </Link>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <Link href="/admin/products/categories">
                      <SidebarMenuSubButton isActive={pathname === '/admin/products/categories'}>
                        Categories
                      </SidebarMenuSubButton>
                    </Link>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link href="/admin/users">
              <SidebarMenuButton isActive={pathname === '/admin/users'} tooltip="Users">
                <Users />
                <span>Users</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/admin/analytics">
              <SidebarMenuButton isActive={pathname === '/admin/analytics'} tooltip="Analytics">
                <BarChart />
                <span>Analytics</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/admin/calendar">
              <SidebarMenuButton isActive={pathname === '/admin/calendar'} tooltip="Calendar">
                <Calendar />
                <span>Calendar</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/admin/grant-admin">
              <SidebarMenuButton isActive={pathname === '/admin/grant-admin'} tooltip="Grant Admin">
                <UserCheck />
                <span>Grant Admin</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          {/* CMS Accordion */}
          <SidebarMenuItem asChild>
            <Collapsible open={isCmsOpen} onOpenChange={setIsCmsOpen}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  isActive={isCmsRouteActive}
                  tooltip="CMS"
                  className="justify-between w-full"
                >
                  <div className="flex items-center gap-2">
                    <FolderOpenDot />
                    <span>CMS</span>
                  </div>
                  <ChevronRight className={cn('h-4 w-4 transition-transform', isCmsOpen && 'rotate-90')} />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <Link href="/admin/content/hero-slides">
                      <SidebarMenuSubButton isActive={pathname === '/admin/content/hero-slides'}>
                        Hero Slides
                      </SidebarMenuSubButton>
                    </Link>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <Link href="/admin/content/hero-boxes">
                      <SidebarMenuSubButton isActive={pathname === '/admin/content/hero-boxes'}>
                        Hero Boxes
                      </SidebarMenuSubButton>
                    </Link>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <Link href="/admin/content/trending-now">
                      <SidebarMenuSubButton isActive={pathname === '/admin/content/trending-now'}>
                        Trending Now
                      </SidebarMenuSubButton>
                    </Link>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link href="/admin/settings">
              <SidebarMenuButton isActive={pathname.startsWith('/admin/settings')} tooltip="Settings">
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/">
              <SidebarMenuButton tooltip="Back to Shop">
                <Home />
                <span>Back to Shop</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => logout()} tooltip="Logout">
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />
        <Link href="/admin/profile" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
            <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
          </Avatar>
          <div className="overflow-hidden group-data-[collapsible=icon]:hidden">
            <p className="font-medium text-sm truncate">{user?.displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
