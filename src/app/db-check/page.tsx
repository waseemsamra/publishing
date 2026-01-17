'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase/provider';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

type Status = 'connecting' | 'success' | 'error';

export default function DatabaseCheckPage() {
  const [status, setStatus] = useState<Status>('connecting');
  const [errorMessage, setErrorMessage] = useState('');
  const db = useFirestore();

  useEffect(() => {
    const checkConnection = async () => {
      if (!db) {
        setStatus('error');
        setErrorMessage('Firebase is not initialized on the client. Check browser console and Firebase config.');
        return;
      }

      try {
        // We try to get a document that doesn't exist.
        // The goal is not to read data, but to see if we can communicate with the service.
        // A "permission-denied" error is also a sign of a successful connection.
        const testDocRef = doc(db, 'test-connection', 'test-doc');
        await getDoc(testDocRef);
        
        // If we reach here, it means the request was sent and a response (even an error) was received.
        setStatus('success');

      } catch (error: any) {
        // If the error is permission-denied, the connection is good.
        if (error.code === 'permission-denied') {
            setStatus('success');
        } else {
            // Any other error (e.g., network, invalid config) is a connection failure.
            setStatus('error');
            setErrorMessage(error.message || 'An unknown error occurred.');
            console.error("Firestore connection check failed:", error);
        }
      }
    };

    // Delay the check slightly to ensure Firebase has had time to initialize
    const timer = setTimeout(checkConnection, 500);
    return () => clearTimeout(timer);

  }, [db]);

  const StatusDisplay = () => {
    switch (status) {
      case 'success':
        return (
          <div className="flex flex-col items-center text-center gap-4 text-green-600">
            <Wifi className="h-16 w-16" />
            <p className="text-xl font-semibold">Successfully connected to Firestore!</p>
            <p className="text-sm text-muted-foreground">The application can communicate with the database.</p>
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center text-center gap-4 text-destructive">
            <WifiOff className="h-16 w-16" />
            <p className="text-xl font-semibold">Failed to connect to Firestore.</p>
            <p className="text-sm text-muted-foreground break-all">{errorMessage}</p>
          </div>
        );
      case 'connecting':
      default:
        return (
          <div className="flex flex-col items-center text-center gap-4 text-muted-foreground">
            <Loader2 className="h-16 w-16 animate-spin" />
            <p className="text-xl font-semibold">Checking connection...</p>
            <p className="text-sm">Attempting to communicate with the Firestore database.</p>
          </div>
        );
    }
  };

  return (
    <div className="container py-24">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center font-headline text-3xl">Database Connection Status</CardTitle>
          <CardDescription className="text-center">This page checks if the application can communicate with the Firebase Firestore database.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 border-2 border-dashed rounded-lg">
            <StatusDisplay />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
