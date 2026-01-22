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
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Please enter both your email and password.',
      });
      return;
    }
    try {
      await login(email, password);
      // Redirect to admin dashboard on successful login
      router.push('/admin/dashboard'); 
    } catch (error: any) {
      let description =
        'There was a problem with your request. Please try again.';
      if (error.code === 'auth/invalid-credential') {
        description =
          'Invalid credentials. Please check your email and password.';
      } else if (error.message) {
        description = error.message;
      }

      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: description,
      });
      console.error('Failed to sign in:', error);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSignIn} className="w-full">
            Sign in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
