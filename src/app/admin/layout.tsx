'use client';

import ProtectedRoute from '@/components/providers/ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // This layout protects all routes under /admin
  return (
    <ProtectedRoute requiredRole="admin">
        <AdminLayout>
            {children}
        </AdminLayout>
    </ProtectedRoute>
  );
}
