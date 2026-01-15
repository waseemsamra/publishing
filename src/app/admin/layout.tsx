
'use client';

import ProtectedRoute from '@/components/providers/ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';

export default function RootAdminLayout({ children }: { children: React.ReactNode }) {
  const isAuthPage = false; // Simplified for this example
  
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute requiredRole="admin">
        <AdminLayout>
            {children}
        </AdminLayout>
    </ProtectedRoute>
  );
}
