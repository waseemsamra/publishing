'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { MoreHorizontal, Edit, Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const emptyProduct: Partial<Product> = {
    name: '',
    price: 0,
    description: '',
    materials: [],
    certifications: [],
    sustainabilityImpact: '',
    image: { id: '', imageUrl: '', description: '', imageHint: '' }
};

export default function AdminProductsPage() {
    const { toast } = useToast();
    const [dialogState, setDialogState] = useState<{ open: boolean; product?: Partial<Product> }>({ open: false });
    const [formState, setFormState] = useState<Partial<Product>>(emptyProduct);
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    const productsQuery = useMemo(() => {
        const q = query(collection(db, 'products'));
        (q as any).__memo = true;
        return q;
    }, []);

    const { data: products, isLoading, error } = useCollection<Product>(productsQuery);

    useEffect(() => {
        if (dialogState.open && dialogState.product) {
            setFormState(dialogState.product);
        } else {
            setFormState(emptyProduct);
        }
    }, [dialogState.open, dialogState.product]);
    
    const handleFormChange = (field: keyof Product, value: any) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };
    
    const handleImageChange = (field: keyof Product['image'], value: string) => {
        setFormState(prev => ({ ...prev, image: { ...prev.image!, [field]: value } }));
    };

    const handleSaveProduct = async () => {
        if (!formState.name?.trim()) {
            toast({ variant: 'destructive', title: 'Validation Error', description: 'Name is required.' });
            return;
        }

        const dataToSave = {
            ...formState,
            price: Number(formState.price) || 0,
            materials: Array.isArray(formState.materials) ? formState.materials : (formState.materials as string || '').split(',').map(s => s.trim()).filter(Boolean),
            certifications: Array.isArray(formState.certifications) ? formState.certifications : (formState.certifications as string || '').split(',').map(s => s.trim()).filter(Boolean),
            image: {
                id: formState.id || formState.name!,
                imageUrl: formState.image?.imageUrl || '',
                description: formState.name!,
                imageHint: formState.name?.toLowerCase().split(' ').slice(0,2).join(' ') || ''
            }
        };

        try {
            if (formState.id) {
                await updateDoc(doc(db, 'products', formState.id), dataToSave);
                toast({ title: 'Success', description: 'Product updated.' });
            } else {
                await addDoc(collection(db, 'products'), {
                    ...dataToSave,
                    createdAt: serverTimestamp(),
                });
                toast({ title: 'Success', description: 'New product added.' });
            }
            setDialogState({ open: false });
        } catch (e: any) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: e.message });
        }
    };
    
    const handleDeleteSelected = async () => {
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

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setDialogState({ open: false });
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
                    <Button onClick={() => setDialogState({ open: true, product: emptyProduct })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Product
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
                                        aria-label="Select all"
                                        disabled={!products || products.length === 0}
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
                            {products?.map((product) => (
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
                                            src={product.image.imageUrl || 'https://placehold.co/64x64'}
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
                                                <DropdownMenuItem onSelect={() => setDialogState({ open: true, product })}>
                                                    <Edit className="mr-2 h-4 w-4" /><span>Edit</span>
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

            <Dialog open={dialogState.open} onOpenChange={handleOpenChange}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{formState.id ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                        <DialogDescription>{formState.id ? `Update the details for ${formState.name}.` : 'Enter the details for the new product.'}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" value={formState.name} onChange={(e) => handleFormChange('name', e.target.value)} /></div>
                        <div className="space-y-2"><Label htmlFor="price">Price</Label><Input id="price" type="number" value={formState.price} onChange={(e) => handleFormChange('price', e.target.value)} /></div>
                        <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={formState.description} onChange={(e) => handleFormChange('description', e.target.value)} /></div>
                        <div className="space-y-2"><Label htmlFor="imageUrl">Image URL</Label><Input id="imageUrl" value={formState.image?.imageUrl} onChange={(e) => handleImageChange('imageUrl', e.target.value)} /></div>
                        <div className="space-y-2"><Label htmlFor="materials">Materials (comma-separated)</Label><Textarea id="materials" value={(formState.materials as any)?.join(', ')} onChange={(e) => handleFormChange('materials', e.target.value.split(',').map(s => s.trim()))} /></div>
                        <div className="space-y-2"><Label htmlFor="certifications">Certifications (comma-separated)</Label><Textarea id="certifications" value={(formState.certifications as any)?.join(', ')} onChange={(e) => handleFormChange('certifications', e.target.value.split(',').map(s => s.trim()))} /></div>
                        <div className="space-y-2"><Label htmlFor="sustainabilityImpact">Sustainability Impact</Label><Textarea id="sustainabilityImpact" value={formState.sustainabilityImpact} onChange={(e) => handleFormChange('sustainabilityImpact', e.target.value)} /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
                        <Button onClick={handleSaveProduct}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
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