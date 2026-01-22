'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart,
  Calendar,
  LayoutPanelLeft,
  FolderCog,
  LogOut,
  Home
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const mainNav = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/content', label: 'Content', icon: LayoutPanelLeft },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart },
  { href: '/admin/calendar', label: 'Calendar', icon: Calendar },
];

const settingsNav = [
    { href: '/admin/products/categories', label: 'Categories', icon: FolderCog },
    { href: '/admin/settings', label: 'Store Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
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
          <Logo />
        </SidebarHeader>
        <SidebarMenu>
            <SidebarGroup>
                <SidebarMenu>
                    {mainNav.map((item) => (
                        <SidebarMenuItem key={item.label}>
                            <Link href={item.href} legacyBehavior passHref>
                                <SidebarMenuButton
                                    isActive={pathname.startsWith(item.href)}
                                    tooltip={item.label}
                                >
                                    <item.icon />
                                    <span>{item.label}</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
                <SidebarGroupLabel>Settings</SidebarGroupLabel>
                 <SidebarMenu>
                    {settingsNav.map((item) => (
                        <SidebarMenuItem key={item.label}>
                            <Link href={item.href} legacyBehavior passHref>
                                <SidebarMenuButton
                                    isActive={pathname.startsWith(item.href)}
                                    tooltip={item.label}
                                >
                                    <item.icon />
                                    <span>{item.label}</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>
       <SidebarFooter>
        <SidebarSeparator />
         <SidebarMenu>
            <SidebarMenuItem>
                 <Link href="/" legacyBehavior passHref>
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
         <div className="flex items-center gap-3 p-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
              <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden group-data-[collapsible=icon]:hidden">
                <p className="font-medium text-sm truncate">{user?.displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
         </div>
      </SidebarFooter>
    </Sidebar>
  );
}
