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
  arrayUnion,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

export default function GrantAdminPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGrantAdmin = async () => {
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email is required',
        description: 'Please enter the email of the user to grant admin rights.',
      });
      return;
    }
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'User not found',
          description: `No user with email ${email} was found.`,
        });
        setLoading(false);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userRef = doc(db, 'users', userDoc.id);

      await updateDoc(userRef, {
        roles: arrayUnion('admin'),
      });

      toast({
        title: 'Success!',
        description: `Admin role granted to ${email}. Please log out and log back in to see the changes.`,
      });
      setEmail('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error granting admin role',
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
          <CardTitle>Grant Admin Privileges</CardTitle>
          <CardDescription>
            Enter the email of an existing user to add the 'admin' role to their
            account.
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
                Granting...
              </>
            ) : (
              'Grant Admin'
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
