'use client';

import ProtectedRoute from '@/components/providers/ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';
import UserManagement from '@/components/admin/UserManagement';

export default function UsersPage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <UserManagement />
      </AdminLayout>
    </ProtectedRoute>
  );
}
