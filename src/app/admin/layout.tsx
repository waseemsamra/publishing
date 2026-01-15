
'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import ProtectedRoute from '@/components/protected-route';
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
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/content', label: 'Content', icon: FileText },
  { href: '/admin/calendar', label: 'Calendar', icon: Calendar },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="h-full py-6">
      <div className="px-4 py-2">
        <h2 className="text-lg font-semibold">Navigation</h2>
      </div>
      <nav className="space-y-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors
                ${isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
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
  
  const isAuthPage =
    pathname === '/admin/login' || pathname === '/admin/signup';

  if (isAuthPage) {
    return <>{children}</>;
  }


  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getInitials = (name?: string | null) => {
    return name
      ? name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'U';
  };

  return (
    <ProtectedRoute requiredRole="admin">
        <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-background">
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
            {/* Mobile menu button */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                <SidebarContent pathname={pathname} />
                </SheetContent>
            </Sheet>

            {/* Logo */}
            <div className="hidden md:flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">AdminHub</span>
                <Badge variant="secondary" className="ml-2">
                Beta
                </Badge>
            </div>

            {/* Search */}
            <div className="flex flex-1 max-w-md mx-4">
                <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-9 w-full"
                />
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />
                </Button>

                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photoURL || ''} />
                        <AvatarFallback>
                        {getInitials(user?.displayName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-medium">{user?.displayName}</span>
                        <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
            </div>
        </header>

        <div className="flex">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 border-r bg-background">
            <SidebarContent pathname={pathname} />
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-6">
            {children}
            </main>
        </div>
        </div>
    </ProtectedRoute>
  );
}
