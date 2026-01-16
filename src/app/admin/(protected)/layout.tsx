'use client';

import ProtectedRoute from '@/components/providers/ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const isGrantAdminPage = (children as any)?.type?.name === 'GrantAdminPage';

  if (isGrantAdminPage) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return (
    <ProtectedRoute requiredRole="admin">
        <AdminLayout>
            {children}
        </AdminLayout>
    </ProtectedRoute>
  );
}

  