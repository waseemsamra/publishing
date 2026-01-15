'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import AdminLayout from '@/components/layout/AdminLayout';

function GrantAdminContent() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleGrantAdmin = async () => {
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email is required',
        description: 'Please enter the email of the user to grant admin rights.',
      });
      return;
    }
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Authenticated',
        description: 'You must be logged in to perform this action.',
      });
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // User document does not exist, so create it.
        // This is the fix for the "User not found" issue.
        const newUserId = user.uid; // Use the currently logged-in user's UID
        const userDocRef = doc(db, 'users', newUserId);
        const nameParts = user.displayName?.split(' ') || [''];
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        await setDoc(userDocRef, {
          id: newUserId,
          email: email,
          firstName: firstName,
          lastName: lastName,
          roles: ['admin', 'customer'],
          status: 'active',
          createdAt: new Date(),
        });
        
        toast({
          title: 'Admin User Created!',
          description: `New admin user created for ${email}. Please log out and log back in.`,
        });

      } else {
        // User exists, update their roles.
        const userDoc = querySnapshot.docs[0];
        const userRef = doc(db, 'users', userDoc.id);

        await updateDoc(userRef, {
          roles: arrayUnion('admin'),
        });

        toast({
          title: 'Success!',
          description: `Admin role granted to ${email}. Please log out and log back in to see the changes.`,
        });
      }
      setEmail('');
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
      <h1 className="font-headline text-3xl font-bold">Grant Admin Role</h1>
      <Card>
        <CardHeader>
          <CardTitle>Create or Grant Admin Privileges</CardTitle>
          <CardDescription>
            Enter a user's email. If the user doesn't exist in the database, a new profile will be created with admin rights. If they do exist, the 'admin' role will be added.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">User Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button onClick={handleGrantAdmin} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Create or Grant Admin'
            )}
          </Button>
           <p className="text-sm text-muted-foreground pt-4">
              After granting the role, the user must sign out and sign back in for the changes to take effect.
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
