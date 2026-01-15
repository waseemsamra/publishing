'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Home, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You do not have the necessary permissions to view this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            {user ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Logged in as: <span className="font-medium">{user.email}</span>
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm capitalize">Role: {user.role}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You need <span className="font-medium text-primary">admin</span> role to access this page.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Please log in with an admin account to continue.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button onClick={() => router.push('/')} className="w-full">
            <Home className="mr-2 h-4 w-4" />
            Return to Homepage
          </Button>
          {user ? (
            <Button 
              variant="outline" 
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Switch Account
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Go to Login
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
