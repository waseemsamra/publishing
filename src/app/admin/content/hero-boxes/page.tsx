'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, writeBatch, where, getDocs } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase/provider';
import type { HeroBox, Category } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Edit, Trash2, PlusCircle, Loader2, ArrowUp, ArrowDown } from 'lucide-react';

const boxSchema = z.object({
  categoryId: z.string().min(1, 'Category is required.'),
  order: z.coerce.number().default(0),
  isFeatured: z.boolean().default(false),
});

type BoxFormValues = z.infer<typeof boxSchema>;

export default function AdminHeroBoxesPage() {
    const { toast } = useToast();
    const db = useFirestore();
    const { loading: authLoading } = useAuth();

    const [dialogState, setDialogState] = useState<{ open: boolean; box?: Partial<HeroBox> }>({ open: false, box: undefined });
    
    const form = useForm<BoxFormValues>({
        resolver: zodResolver(boxSchema),
        defaultValues: { order: 0, isFeatured: false, categoryId: '' }
    });

    const boxesQuery = useMemo(() => {
        if (!db) return null;
        const q = query(collection(db, 'heroBoxes'), orderBy('order', 'asc'));
        (q as any).__memo = true;
        return q;
    }, [db]);
    
    const categoriesQuery = useMemo(() => {
        if (!db) return null;
        const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
        (q as any).__memo = true;
        return q;
    }, [db]);

    const { data: boxes, isLoading: isLoadingData, error } = useCollection<HeroBox>(boxesQuery);
    const { data: categories } = useCollection<Category>(categoriesQuery);
    
    const categoryMap = useMemo(() => {
        if (!categories) return new Map();
        return new Map(categories.map(c => [c.id, c.name]));
    }, [categories]);
    
    const isLoading = authLoading || isLoadingData;

    useEffect(() => {
        if (dialogState.open && dialogState.box) {
            form.reset({
                order: dialogState.box.order ?? 0,
                isFeatured: dialogState.box.isFeatured || false,
                categoryId: dialogState.box.categoryId || '',
            });
        } else {
            form.reset({ order: boxes?.length || 0, isFeatured: false, categoryId: '' });
        }
    }, [dialogState, form, boxes]);

    const handleSaveBox = async (data: BoxFormValues) => {
        if (!db) {
            toast({ variant: 'destructive', title: 'Error', description: 'Database not connected.' });
            return;
        }

        const batch = writeBatch(db);

        try {
            const dataToSave = { ...data, updatedAt: serverTimestamp() };
            
            if (data.isFeatured) {
                const featuredQuery = query(collection(db, 'heroBoxes'), where('isFeatured', '==', true));
                const featuredSnapshot = await getDocs(featuredQuery);
                featuredSnapshot.forEach(doc => {
                    if (doc.id !== dialogState.box?.id) {
                        batch.update(doc.ref, { isFeatured: false });
                    }
                });
            }

            if (dialogState.box?.id) {
                const docRef = doc(db, 'heroBoxes', dialogState.box.id);
                batch.update(docRef, dataToSave);
                toast({ title: 'Success', description: 'Hero box updated.' });
            } else {
                const docRef = doc(collection(db, 'heroBoxes'));
                batch.set(docRef, { ...dataToSave, createdAt: serverTimestamp() });
                toast({ title: 'Success', description: 'New hero box added.' });
            }
            
            await batch.commit();
            setDialogState({ open: false, box: undefined });
        } catch (e: any) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: e.message });
        }
    };

    const handleDeleteBox = async (id: string) => {
        if (!db) return;
        try {
            await deleteDoc(doc(db, 'heroBoxes', id));
            toast({ title: 'Success', description: 'Hero box deleted.' });
        } catch (e: any) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: e.message });
        }
    };
    
    const handleReorder = async (currentIndex: number, direction: 'up' | 'down') => {
        if (!db || !boxes) return;
        if ((direction === 'up' && currentIndex === 0) || (direction === 'down' && currentIndex === boxes.length - 1)) {
            return;
        }

        const itemToMove = boxes[currentIndex];
        const otherIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        const itemToSwapWith = boxes[otherIndex];

        try {
            const batch = writeBatch(db);
            batch.update(doc(db, 'heroBoxes', itemToMove.id), { order: itemToSwapWith.order });
            batch.update(doc(db, 'heroBoxes', itemToSwapWith.id), { order: itemToMove.order });
            await batch.commit();
            toast({ title: 'Success', description: 'Box reordered.' });
        } catch (e: any) {
            console.error('Error reordering boxes:', e);
            toast({ variant: 'destructive', title: 'Reorder Error', description: e.message });
        }
    };
    
    const handleOpenChange = (open: boolean) => setDialogState(prev => ({ ...prev, open }));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Hero Boxes</h1>
                    <p className="text-muted-foreground">Manage categories appearing in your interactive hero section.</p>
                </div>
                <Button onClick={() => setDialogState({ open: true, box: {} })}>
                    <PlusCircle className="mr-2 h-4 w-4" />Add Box
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Hero Boxes</CardTitle>
                    <CardDescription>A list of all categories designated for the hero section, by display order.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Category</TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead>Featured</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                            : error ? <TableRow><TableCell colSpan={4} className="text-center text-red-500">{error.message}</TableCell></TableRow>
                            : boxes?.length === 0 ? <TableRow><TableCell colSpan={4} className="h-24 text-center">No hero boxes configured.</TableCell></TableRow>
                            : boxes?.map((box, index) => (
                                <TableRow key={box.id}>
                                    <TableCell className="font-medium">{categoryMap.get(box.categoryId) || box.categoryId}</TableCell>
                                    <TableCell>{box.order}</TableCell>
                                    <TableCell>{box.isFeatured ? 'Yes' : 'No'}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => handleReorder(index, 'up')} disabled={index === 0}>
                                                    <ArrowUp className="mr-2 h-4 w-4" /><span>Move Up</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => handleReorder(index, 'down')} disabled={index === (boxes?.length || 0) - 1}>
                                                    <ArrowDown className="mr-2 h-4 w-4" /><span>Move Down</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onSelect={() => setDialogState({ open: true, box })}><Edit className="mr-2 h-4 w-4" /><span>Edit</span></DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteBox(box.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50"><Trash2 className="mr-2 h-4 w-4" /><span>Delete</span></DropdownMenuItem>
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
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{dialogState.box?.id ? 'Edit Hero Box' : 'Add New Hero Box'}</DialogTitle>
                        <DialogDescription>Select a category to feature in the hero section.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSaveBox)} className="space-y-6 py-4">
                             <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} required>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {categories?.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                            </SelectItem>
                                        ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField control={form.control} name="order" render={({ field }) => (
                                <FormItem><FormLabel>Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="isFeatured" render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Featured Item</FormLabel>
                                        <FormMessage>Mark this as the main item on the left.</FormMessage>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )} />
                           
                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => handleOpenChange(false)}>Cancel</Button>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
