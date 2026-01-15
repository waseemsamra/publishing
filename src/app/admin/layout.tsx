'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  LayoutGrid,
  Package,
  Users,
  ShoppingCart,
  Settings,
  LogOut,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useFirebase, useUser } from '@/firebase';
import { useMemoFirebase } from '@/firebase/provider';

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isUserLoading: authLoading } = useUser();
  const { firestore } = useFirebase();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/signup';

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  
  const { data: userData, isLoading: userDocLoading } = useDoc(userDocRef);

  useEffect(() => {
    if (!authLoading && !user && !isAuthPage) {
      router.push('/admin/login');
      return;
    }

    if (user && !userDocLoading) {
      if (userData) {
        const roles = (userData as any).roles || [];
        if (roles.includes('admin')) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          router.push('/'); // Not an admin, redirect to homepage
        }
      } else if (!isAuthPage) {
        // User doc doesn't exist, but they are logged in. Not an admin.
        setIsAdmin(false);
        router.push('/');
      }
    }
  }, [user, authLoading, userData, userDocLoading, router, isAuthPage]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  const isLoading = authLoading || userDocLoading || isAdmin === null;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Verifying access...
      </div>
    );
  }
  
  if (!isAdmin) {
      // This part might not be strictly necessary due to the redirect, but it's a good safeguard.
      return null;
  }


  const handleLogout = async () => {
    await getAuth().signOut();
    router.push('/admin/login');
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <div className="p-2">
              <Logo />
            </div>
            <SidebarTrigger className="hidden md:flex" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
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
        </SidebarContent>
        <div className="p-4">
          <Button onClick={handleLogout} className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
          <SidebarTrigger />
          <Logo />
        </header>
        <main className="flex-1 p-4 sm:p-6 bg-secondary/40">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
