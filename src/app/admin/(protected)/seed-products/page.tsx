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
import type { Category } from '@/lib/types';

// Define the categories to seed
const categoriesToSeed: (Omit<Category, 'id'> & { id: string })[] = [
  { id: 'eco-friendly-food-packaging', name: 'Eco Friendly Food Packaging', description: 'Sustainable packaging solutions for food service.', order: 1, imageUrl: 'https://images.unsplash.com/photo-1627992258833-255d61483040?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxmb29kJTIwcGFja2FnaW5nfGVufDB8fHx8MTc3MDA2NTM0Mnww&ixlib=rb-4.1.0&q=80&w=1080', imageHint: 'food packaging' },
  { id: 'paper-products', name: 'Paper Products', description: 'Compostable and recyclable paper-based packaging.', parentId: 'eco-friendly-food-packaging', order: 1, imageUrl: 'https://images.unsplash.com/photo-1627992258833-255d61483040?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxmb29kJTIwcGFja2FnaW5nfGVufDB8fHx8MTc3MDA2NTM0Mnww&ixlib=rb-4.1.0&q=80&w=1080', imageHint: 'paper packaging' },
  { id: 'aluminium-products', name: 'Aluminium Products', description: 'Durable and recyclable aluminium containers and platters.', parentId: 'eco-friendly-food-packaging', order: 2, imageUrl: 'https://images.unsplash.com/photo-1573247373996-cea1f3e6adf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxhbHVtaW5pdW0lMjBwbGF0dGVyfGVufDB8fHx8MTc2ODk0OTg3NHww&ixlib=rb-4.1.0&q=80&w=1080', imageHint: 'aluminium platter' },
  { id: 'plastic-products', name: 'Plastic Products', description: 'Reusable and microwave-safe plastic food containers.', parentId: 'eco-friendly-food-packaging', order: 3, imageUrl: 'https://images.unsplash.com/photo-1607515456374-ac1874945417?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxwbGFzdGljJTIwZm9vJTIwY29udGFpbmVyfGVufDB8fHx8MTc3MDA2NTg5MXww&ixlib=rb-4.1.0&q=80&w=1080', imageHint: 'plastic container' },
];

export default function SeedProductsPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ addedProducts: number; updatedProducts: number; totalProducts: number; addedCategories: number; totalCategories: number; errors: number } | null>(null);
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
      
      // Seed Categories
      const categoriesCollection = collection(db, 'categories');
      let addedCategoriesCount = 0;
      for (const category of categoriesToSeed) {
        const categoryRef = doc(categoriesCollection, category.id);
        const { id, ...categoryData } = category;
        batch.set(categoryRef, categoryData);
        addedCategoriesCount++;
      }

      // Seed Products
      const productsCollection = collection(db, 'products');
      let addedProductsCount = 0;
      let updatedProductsCount = 0;
      let errorCount = 0;

      const existingProductsSnapshot = await getDocs(productsCollection);
      const existingIds = new Set(existingProductsSnapshot.docs.map(d => d.id));

      for (const product of staticProducts) {
        const productRef = doc(productsCollection, product.id);
        const { createdAt, updatedAt, ...productData } = product;
        batch.set(productRef, productData);
        
        if (existingIds.has(product.id)) {
            updatedProductsCount++;
        } else {
            addedProductsCount++;
        }
      }

      await batch.commit();
      
      setResults({ 
        addedProducts: addedProductsCount, 
        updatedProducts: updatedProductsCount, 
        totalProducts: staticProducts.length, 
        addedCategories: addedCategoriesCount,
        totalCategories: categoriesToSeed.length,
        errors: errorCount 
      });

      toast({ title: 'Success', description: 'Database has been seeded with categories and products.' });

    } catch (e: any) {
      console.error("Seeding error: ", e);
      toast({ variant: 'destructive', title: 'Seeding Failed', description: e.message });
      setResults({ addedProducts: 0, updatedProducts: 0, totalProducts: staticProducts.length, addedCategories: 0, totalCategories: categoriesToSeed.length, errors: 1 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Seed Database</h1>
      <Card>
        <CardHeader>
          <CardTitle>Seed Products & Categories</CardTitle>
          <CardDescription>
            Populate your Firestore database with products and categories from the initial project setup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important!</AlertTitle>
            <AlertDescription>
              This operation will add or overwrite products and categories from the static data file (`src/lib/data.ts`) to ensure all data is up-to-date.
            </AlertDescription>
          </Alert>

          <Button onClick={handleSeed} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            Seed Data
          </Button>

          {results && (
            <Alert variant={results.errors > 0 ? "destructive" : "default"}>
              <AlertTitle>Seeding Complete</AlertTitle>
              <AlertDescription>
                <p className="font-semibold">Categories:</p>
                <ul className="list-disc pl-5">
                  <li>Total categories in static file: {results.totalCategories}</li>
                  <li className="text-green-600">Categories added/updated: {results.addedCategories}</li>
                </ul>
                <p className="font-semibold mt-2">Products:</p>
                 <ul className="list-disc pl-5">
                    <li>Total products in static file: {results.totalProducts}</li>
                    <li className="text-green-600">Products added: {results.addedProducts}</li>
                    <li className="text-blue-600">Products updated: {results.updatedProducts}</li>
                </ul>
                {results.errors > 0 && <p className="text-red-600 mt-2">Errors: {results.errors}</p>}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        Once you have seeded the database, you can manage all products from the <a href="/admin/products" className="underline font-semibold">Products</a> page and categories from the <a href="/admin/products/categories" className="underline font-semibold">Categories</a> page. You can delete this seeding page if you no longer need it.
      </p>
    </div>
  );
}
