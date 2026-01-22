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
  Home,
  UserCheck,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';


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

  const isProductRouteActive = pathname.startsWith('/admin/products');
  const isCmsRouteActive = pathname.startsWith('/admin/content');


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
                <Link href="/admin/dashboard" legacyBehavior passHref>
                    <SidebarMenuButton isActive={pathname === '/admin/dashboard'} tooltip="Dashboard">
                        <LayoutDashboard /><span>Dashboard</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/admin/orders" legacyBehavior passHref>
                    <SidebarMenuButton isActive={pathname === '/admin/orders'} tooltip="Orders">
                        <ShoppingCart /><span>Orders</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            
            <SidebarGroup>
                <SidebarGroupLabel>Products</SidebarGroupLabel>
                 <SidebarMenu>
                    <SidebarMenuItem>
                        <Link href="/admin/products" legacyBehavior passHref>
                            <SidebarMenuButton isActive={pathname === '/admin/products'} tooltip="All Products">
                                All Products
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <Link href="/admin/products/categories" legacyBehavior passHref>
                            <SidebarMenuButton isActive={pathname === '/admin/products/categories'} tooltip="Categories">
                                Categories
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                 </SidebarMenu>
            </SidebarGroup>

             <SidebarMenuItem>
                <Link href="/admin/users" legacyBehavior passHref>
                    <SidebarMenuButton isActive={pathname === '/admin/users'} tooltip="Users">
                        <Users /><span>Users</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/admin/analytics" legacyBehavior passHref>
                    <SidebarMenuButton isActive={pathname === '/admin/analytics'} tooltip="Analytics">
                        <BarChart /><span>Analytics</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <Link href="/admin/calendar" legacyBehavior passHref>
                    <SidebarMenuButton isActive={pathname === '/admin/calendar'} tooltip="Calendar">
                        <Calendar /><span>Calendar</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/admin/grant-admin" legacyBehavior passHref>
                    <SidebarMenuButton isActive={pathname === '/admin/grant-admin'} tooltip="Grant Admin">
                        <UserCheck /><span>Grant Admin</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>

            <SidebarGroup>
                <SidebarGroupLabel>CMS</SidebarGroupLabel>
                 <SidebarMenu>
                    <SidebarMenuItem>
                        <Link href="/admin/content/hero-slides" legacyBehavior passHref>
                            <SidebarMenuButton isActive={pathname === '/admin/content/hero-slides'} tooltip="Hero Slides">
                                Hero Slides
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <Link href="/admin/content/trending-now" legacyBehavior passHref>
                            <SidebarMenuButton isActive={pathname === '/admin/content/trending-now'} tooltip="Trending Now">
                                Trending Now
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                 </SidebarMenu>
            </SidebarGroup>

            <SidebarMenuItem>
                <Link href="/admin/settings" legacyBehavior passHref>
                    <SidebarMenuButton isActive={pathname.startsWith('/admin/settings')} tooltip="Settings">
                        <Settings /><span>Settings</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
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
