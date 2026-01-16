'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  Bell,
  Search,
  User,
  Shield,
  Calendar,
  FileText,
  BarChart3,
  Package,
  ShoppingCart,
  UserCog,
  Ruler,
  Palette,
  Printer,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/content', label: 'Content', icon: FileText },
  { href: '/admin/calendar', label: 'Calendar', icon: Calendar },
  { href: '/admin/grant-admin', label: 'Grant Admin', icon: UserCog, isPublic: true }, // Allow public access
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

function SidebarContent({ pathname, onLinkClick, isAdmin }: { pathname: string, onLinkClick: () => void, isAdmin: boolean }) {
  const visibleNavItems = navItems.filter(item => isAdmin || item.isPublic);

  return (
    <div className="flex h-full flex-col">
       <div className="p-4 border-b">
         <Link href="/admin/dashboard" className="flex items-center gap-2" onClick={onLinkClick}>
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">AdminHub</span>
            <Badge variant="secondary" className="ml-2">
              Beta
            </Badge>
          </Link>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isSettingsActive = pathname.startsWith('/admin/settings') || pathname.startsWith('/admin/sizes') || pathname.startsWith('/admin/colours') || pathname.startsWith('/admin/print-options') || pathname.startsWith('/admin/wall-types') || pathname.startsWith('/admin/thickness') || pathname.startsWith('/admin/material-types') || pathname.startsWith('/admin/finish-types') || pathname.startsWith('/admin/adhesives') || pathname.startsWith('/admin/handles') || pathname.startsWith('/admin/shapes');
          const isActive = pathname.startsWith(item.href) && (item.href !== '/admin/settings' || pathname === '/admin/settings');
          
          let effectiveIsActive = isActive;
          if (item.href === '/admin/settings') {
            effectiveIsActive = isSettingsActive;
          }


          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors
                ${effectiveIsActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }
              `}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };
  
  const closeSidebar = () => setSidebarOpen(false);

  const isAdmin = user?.role === 'admin';

  return (
        <div className="min-h-screen bg-muted/40">
        {/* Desktop Sidebar */}
        <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col md:border-r bg-background">
          <SidebarContent pathname={pathname} onLinkClick={closeSidebar} isAdmin={isAdmin} />
        </aside>

        <div className="md:pl-64 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                {/* Mobile menu button */}
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                      <SidebarContent pathname={pathname} onLinkClick={closeSidebar} isAdmin={isAdmin} />
                    </SheetContent>
                </Sheet>
                
                <div className="relative flex-1 md:grow-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                    />
                </div>

                <div className="ml-auto flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="relative rounded-full">
                        <Bell className="h-5 w-5" />
                        <span className="sr-only">Toggle notifications</span>
                    </Button>

                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'}/>
                            <AvatarFallback>
                            {getInitials(user?.displayName)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>{user?.displayName || 'My Account'}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                        <Link href="/admin/profile">
                            <User className="mr-2 h-4 w-4" />
                            Profile
                        </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                        <Link href="/admin/settings">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-6 grid gap-6">
                {children}
            </main>
        </div>
    </div>
  );
}
