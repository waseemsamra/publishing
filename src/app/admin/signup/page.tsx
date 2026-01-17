'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase/provider';

export default function AdminSignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const { signup } = useAuth();
  const db = useFirestore();

  const handleSignUp = async () => {
    if (!db) {
      toast({
        variant: 'destructive',
        title: 'Database Error',
        description: 'Firebase is not configured. Please check your setup.',
      });
      return;
    }
    try {
      const userCredential = await signup(email, password);
      const user = userCredential.user;

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userData = {
          id: user.uid,
          email: user.email,
          firstName: name.split(' ')[0] || '',
          lastName: name.split(' ').slice(1).join(' ') || '',
          roles: ['admin', 'customer'],
          status: 'active',
          createdAt: new Date(),
        };
        await setDoc(userDocRef, userData, { merge: true });
      }

      toast({
        title: 'Account Created',
        description:
          "You've successfully signed up. You can now sign in with admin privileges.",
      });
      router.push('/admin/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description:
          error.message || 'There was a problem with your sign-up request.',
      });
      console.error('Failed to sign up:', error);
    }
  };

  return (
    <div className="container flex h-screen items-center justify-center py-24">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">
            Create an Admin Account
          </CardTitle>
          <CardDescription>
            Fill in the details below to create your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleSignUp} className="w-full">
            Sign up
          </Button>
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/admin/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
