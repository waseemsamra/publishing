'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole = 'admin',
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading && isClient) {
      const loginPath = requiredRole === 'admin' ? '/admin/login' : '/login';
      if (!user) {
        // Redirect to appropriate login page if not authenticated
        router.push(loginPath);
      } else if (user.role !== requiredRole) {
        // Redirect to unauthorized if wrong role
        router.push('/unauthorized');
      }
    }
  }, [user, loading, router, requiredRole, isClient]);

  // Show loading state
  if (loading || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user doesn't exist or wrong role, don't render children
  // (they'll be redirected by useEffect)
  if (!user || user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
