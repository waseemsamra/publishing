'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, doc, deleteDoc, query } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { MoreHorizontal, Edit, Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context';

export default function AdminProductsPage() {
    const { toast } = useToast();
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { loading: authLoading } = useAuth();
    
    const productsQuery = useMemo(() => {
        if (authLoading || !db) return null;
        const q = query(collection(db, 'products'));
        (q as any).__memo = true;
        return q;
    }, [authLoading]);

    const { data: products, isLoading: isLoadingData, error } = useCollection<Product>(productsQuery);
    const isLoading = authLoading || isLoadingData;

    const handleDeleteSelected = async () => {
        if (!db) {
            toast({ variant: 'destructive', title: 'Error', description: 'Database not connected.' });
            return;
        }
        try {
            const deletePromises = selectedProductIds.map(id => deleteDoc(doc(db, 'products', id)));
            await Promise.all(deletePromises);
            toast({
                title: `${selectedProductIds.length} product(s) deleted.`,
                description: 'The selected products have been removed from the database.',
            });
            setSelectedProductIds([]);
        } catch(e: any) {
             toast({
                variant: 'destructive',
                title: 'Error Deleting Products',
                description: e.message || 'There was a problem deleting the products.',
            });
        } finally {
            setShowDeleteConfirm(false);
        }
    };
    
    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setSelectedProductIds(products?.map(p => p.id) || []);
        } else {
            setSelectedProductIds([]);
        }
    };

    const handleSelectProduct = (productId: string, checked: boolean) => {
        if (checked) {
            setSelectedProductIds((prev) => [...prev, productId]);
        } else {
            setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
        }
    };

    const allSelected = (products?.length ?? 0) > 0 && selectedProductIds.length === products?.length;
    const someSelected = selectedProductIds.length > 0 && selectedProductIds.length < (products?.length ?? 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <div>
                    <h1 className="font-headline text-3xl font-bold">Products</h1>
                    <p className="text-muted-foreground">Manage your store's products.</p>
                </div>
                {selectedProductIds.length > 0 ? (
                    <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete ({selectedProductIds.length})
                    </Button>
                ) : (
                    <Button asChild>
                        <Link href="/admin/products/new">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                        </Link>
                    </Button>
                )}
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Products</CardTitle>
                    <CardDescription>A list of all products in your store.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                     <Checkbox
                                        onCheckedChange={handleSelectAll}
                                        checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                                        disabled={isLoading || !products || products.length === 0}
                                    />
                                </TableHead>
                                <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>}
                            {!isLoading && error && <TableRow><TableCell colSpan={6} className="h-24 text-center text-red-500">{error.message}</TableCell></TableRow>}
                            {!isLoading && products?.length === 0 && <TableRow><TableCell colSpan={6} className="h-24 text-center">No products found. Add one to get started.</TableCell></TableRow>}
                            {!isLoading && products?.map((product) => (
                                <TableRow key={product.id} data-state={selectedProductIds.includes(product.id) && 'selected'}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedProductIds.includes(product.id)}
                                            onCheckedChange={(checked) => handleSelectProduct(product.id, !!checked)}
                                            aria-label={`Select product ${product.name}`}
                                        />
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        <Image
                                            alt={product.name}
                                            className="aspect-square rounded-md object-cover"
                                            height="64"
                                            src={product.images?.[0]?.imageUrl || 'https://placehold.co/64x64'}
                                            width="64"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>${product.price.toFixed(2)}</TableCell>
                                    <TableCell>{product.createdAt ? format(product.createdAt.toDate(), 'MMM d, yyyy') : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/products/${product.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" /><span>Edit</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => { setSelectedProductIds([product.id]); setShowDeleteConfirm(true); }} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                                    <Trash2 className="mr-2 h-4 w-4" /><span>Delete</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the selected products from the database.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
