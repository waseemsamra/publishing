'use client';

import ProtectedRoute from '@/components/providers/ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
        <AdminLayout>
            {children}
        </AdminLayout>
    </ProtectedRoute>
  );
}
