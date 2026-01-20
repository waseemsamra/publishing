'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';
import { products as staticProducts } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Database, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SeedProductsPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ added: number; skipped: number; total: number; errors: number } | null>(null);
  const db = useFirestore();
  const { toast } = useToast();

  const handleSeed = async () => {
    if (!db) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore is not initialized.' });
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const batch = writeBatch(db);
      const productsCollection = collection(db, 'products');
      let addedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      const existingProductsSnapshot = await getDocs(productsCollection);
      const existingIds = new Set(existingProductsSnapshot.docs.map(d => d.id));

      for (const product of staticProducts) {
        if (existingIds.has(product.id)) {
          skippedCount++;
        } else {
          const productRef = doc(productsCollection, product.id);
          const { createdAt, updatedAt, ...productData } = product;
          batch.set(productRef, productData);
          addedCount++;
        }
      }

      await batch.commit();
      
      setResults({ added: addedCount, skipped: skippedCount, total: staticProducts.length, errors: errorCount });
      toast({ title: 'Success', description: 'Database has been seeded with products.' });

    } catch (e: any) {
      console.error("Seeding error: ", e);
      toast({ variant: 'destructive', title: 'Seeding Failed', description: e.message });
      setResults({ added: 0, skipped: staticProducts.length, total: staticProducts.length, errors: 1 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Seed Database</h1>
      <Card>
        <CardHeader>
          <CardTitle>Seed Products</CardTitle>
          <CardDescription>
            Populate your Firestore database with the product data from the initial project setup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important!</AlertTitle>
            <AlertDescription>
              This is a one-time operation. It will add products from the static data file (`src/lib/data.ts`) to your `products` collection in Firestore. It will skip any products that already exist to prevent duplicates.
            </AlertDescription>
          </Alert>

          <Button onClick={handleSeed} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            Seed Products ({staticProducts.length} items)
          </Button>

          {results && (
            <Alert variant={results.errors > 0 ? "destructive" : "default"}>
              <AlertTitle>Seeding Complete</AlertTitle>
              <AlertDescription>
                <p>Total products in static file: {results.total}</p>
                <p className="text-green-600">Products added: {results.added}</p>
                <p className="text-yellow-600">Products skipped (already exist): {results.skipped}</p>
                {results.errors > 0 && <p className="text-red-600">Errors: {results.errors}</p>}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        Once you have seeded the database, you can manage all products from the <a href="/admin/products" className="underline font-semibold">Products</a> page. You can also delete this seeding page if you no longer need it.
      </p>
    </div>
  );
}
