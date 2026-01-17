'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import AdminLayout from '@/components/layout/AdminLayout';
import { useRouter } from 'next/navigation';

function GrantAdminContent() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleGrantAdmin = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Authenticated',
        description: 'You must be logged in to perform this action.',
      });
      return;
    }

    if (!db) {
      toast({
        variant: 'destructive',
        title: 'Database Error',
        description: 'Firebase is not configured. Please check your setup.',
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const nameParts = user.displayName?.split(' ') || [''];
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      // Use setDoc with merge to either create or update the document.
      await setDoc(userRef, {
        id: user.uid,
        email: user.email,
        firstName: firstName,
        lastName: lastName,
        roles: ['admin', 'customer'],
        status: 'active'
      }, { merge: true });

      toast({
        title: 'Success!',
        description: 'Admin role granted. Please log out and log back in for the changes to take effect.',
      });

      // Log the user out so they can log back in with new roles.
      await logout();
      router.push('/admin/login');

    } catch (error: any) {
      console.error('Error granting admin role:', error);
      toast({
        variant: 'destructive',
        title: 'Error processing request',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Become Admin</h1>
      <Card>
        <CardHeader>
          <CardTitle>Grant Yourself Admin Privileges</CardTitle>
          <CardDescription>
            Click the button below to add the 'admin' role to your current user account. This is a one-time action to bootstrap the first administrator.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            You are currently logged in as: <span className="font-semibold">{user?.email}</span>
          </p>
          <Button onClick={handleGrantAdmin} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Make Me Admin'
            )}
          </Button>
           <p className="text-sm text-muted-foreground pt-4">
              After clicking the button, you will be automatically logged out. Please log back in to access the admin dashboard.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function GrantAdminPage() {
    return (
        <AdminLayout>
            <GrantAdminContent />
        </AdminLayout>
    )
}
