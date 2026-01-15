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
    // If we are on an auth page, do nothing.
    if (isAuthPage) {
      return;
    }

    // If auth is still loading, wait.
    if (authLoading) {
      return;
    }

    // If there is no user, redirect to login.
    if (!user) {
      router.push('/admin/login');
      return;
    }

    // If user exists, but their document is still loading, wait.
    if (userDocLoading) {
      return;
    }

    // Now we have the user and their document (or know it doesn't exist).
    if (userData) {
      const roles = (userData as any).roles || [];
      if (roles.includes('admin')) {
        setIsAdmin(true); // User is an admin, allow access.
      } else {
        setIsAdmin(false); // User is not an admin.
        router.push('/'); // Redirect non-admins to the homepage.
      }
    } else {
      // User is logged in, but has no user document in Firestore.
      setIsAdmin(false);
      router.push('/'); // Redirect to homepage.
    }
  }, [user, authLoading, userData, userDocLoading, router, isAuthPage, pathname]);


  if (isAuthPage) {
    return <>{children}</>;
  }
  
  // Display a loading screen while we verify auth and admin status.
  // This covers initial auth check and user document fetch.
  const isLoading = authLoading || userDocLoading || isAdmin === null;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Verifying access...
      </div>
    );
  }
  
  // If verification is complete but user is not an admin, don't render anything
  // as the redirect will be in progress.
  if (!isAdmin) {
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
