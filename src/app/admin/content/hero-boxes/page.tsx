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
import { MoreHorizontal, Edit, Trash2, PlusCircle, Loader2, UploadCloud, Copy, ArrowUp, ArrowDown } from 'lucide-react';

const s3BaseUrl = 'https://printinweb.s3.us-east-1.amazonaws.com';

const boxSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  link: z.string().min(1, 'Link URL is required.'),
  imageUrl: z.string().min(1, 'Image path is required.'),
  imageHint: z.string().optional(),
  order: z.coerce.number().default(0),
  isFeatured: z.boolean().default(false),
  categoryId: z.string().optional(),
});

type BoxFormValues = z.infer<typeof boxSchema>;

export default function AdminHeroBoxesPage() {
    const { toast } = useToast();
    const db = useFirestore();
    const { loading: authLoading } = useAuth();

    const [dialogState, setDialogState] = useState<{ open: boolean; box?: Partial<HeroBox> }>({ open: false, box: undefined });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    
    const form = useForm<BoxFormValues>({
        resolver: zodResolver(boxSchema),
        defaultValues: { title: '', link: '', imageUrl: '', imageHint: '', order: 0, isFeatured: false, categoryId: 'none' }
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

    const filteredBoxes = useMemo(() => {
        if (!boxes) return [];
        if (filterCategory === 'all') return boxes;
        if (filterCategory === 'none') return boxes.filter(box => !box.categoryId);
        return boxes.filter(box => box.categoryId === filterCategory);
    }, [boxes, filterCategory]);
    
    const isLoading = authLoading || isLoadingData;
    
    const imageUrlPath = form.watch('imageUrl');

    useEffect(() => {
        if (imageFile) return;
        if (imageUrlPath) {
            const url = imageUrlPath.startsWith('http') ? imageUrlPath : `${s3BaseUrl}${imageUrlPath}`;
            setImagePreview(url);
        } else {
            setImagePreview(null);
        }
    }, [imageUrlPath, imageFile]);

    useEffect(() => {
        if (dialogState.open && dialogState.box) {
            form.reset({
                title: dialogState.box.title || '',
                link: dialogState.box.link || '',
                imageUrl: dialogState.box.imageUrl?.replace(s3BaseUrl, '') || '',
                imageHint: dialogState.box.imageHint || '',
                order: dialogState.box.order ?? 0,
                isFeatured: dialogState.box.isFeatured || false,
                categoryId: dialogState.box.categoryId || 'none',
            });
            setImagePreview(dialogState.box.imageUrl || null);
            setImageFile(null);
        } else {
            form.reset({ title: '', link: '', imageUrl: '', imageHint: '', order: 0, isFeatured: false, categoryId: 'none' });
            setImagePreview(null);
            setImageFile(null);
        }
    }, [dialogState, form]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSaveBox = async (data: BoxFormValues) => {
        if (!db) {
            toast({ variant: 'destructive', title: 'Error', description: 'Database not connected.' });
            return;
        }

        let finalImageUrl = data.imageUrl ? (data.imageUrl.startsWith('http') ? data.imageUrl : `${s3BaseUrl}${data.imageUrl}`) : '';
        const batch = writeBatch(db);

        try {
            if (imageFile) {
                setIsUploading(true);
                const formData = new FormData();
                formData.append("file", imageFile);
                const response = await fetch('/image', { method: 'POST', body: formData });
                if (!response.ok) throw new Error(`Image upload failed: ${response.statusText}`);
                const result = await response.json();
                finalImageUrl = result.url;
                setIsUploading(false);
            }

            const dataToSave = { ...data, categoryId: data.categoryId === 'none' ? null : data.categoryId, imageUrl: finalImageUrl, updatedAt: serverTimestamp() };
            
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
            setIsUploading(false);
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
        if (!db || !filteredBoxes) return;
        if ((direction === 'up' && currentIndex === 0) || (direction === 'down' && currentIndex === filteredBoxes.length - 1)) {
            return;
        }

        const itemToMove = filteredBoxes[currentIndex];
        const otherIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        const itemToSwapWith = filteredBoxes[otherIndex];

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

    const handleAddNewBox = () => {
        if (filterCategory === 'all') {
          toast({
            variant: 'destructive',
            title: 'Please select a category first',
            description: 'You need to select a specific category or "Homepage" from the filter before adding a new box.',
          });
          return;
        }
        const newBoxData = {
          order: filteredBoxes.length,
          categoryId: filterCategory,
        };
        setDialogState({ open: true, box: newBoxData });
    };
    
    const handleOpenChange = (open: boolean) => setDialogState(prev => ({ ...prev, open }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Hero Boxes</h1>
                <p className="text-muted-foreground">Manage boxes for your interactive hero section.</p>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>All Hero Boxes</CardTitle>
                            <CardDescription>A list of all hero boxes, ordered by display order.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-64">
                                <Select value={filterCategory} onValueChange={setFilterCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by category..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="none">Homepage (No Category)</SelectItem>
                                        {categories?.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleAddNewBox}>
                                <PlusCircle className="mr-2 h-4 w-4" />Add Box
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead>Link</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Featured</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? <TableRow><TableCell colSpan={7} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                            : error ? <TableRow><TableCell colSpan={7} className="text-center text-red-500">{error.message}</TableCell></TableRow>
                            : filteredBoxes?.length === 0 ? <TableRow><TableCell colSpan={7} className="h-24 text-center">No boxes found for this filter.</TableCell></TableRow>
                            : filteredBoxes?.map((box, index) => (
                                <TableRow key={box.id}>
                                    <TableCell className="hidden sm:table-cell">
                                        {box.imageUrl && <Image alt={box.title} className="aspect-square rounded-md object-cover" height="64" src={box.imageUrl} width="64" unoptimized />}
                                    </TableCell>
                                    <TableCell className="font-medium">{box.title}</TableCell>
                                    <TableCell>{box.order}</TableCell>
                                    <TableCell>{box.link}</TableCell>
                                    <TableCell>{box.categoryId ? categoryMap.get(box.categoryId) || 'N/A' : 'Homepage'}</TableCell>
                                    <TableCell>{box.isFeatured ? 'Yes' : 'No'}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => handleReorder(index, 'up')} disabled={index === 0}>
                                                    <ArrowUp className="mr-2 h-4 w-4" /><span>Move Up</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => handleReorder(index, 'down')} disabled={index === filteredBoxes.length - 1}>
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
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>{dialogState.box?.id ? 'Edit Hero Box' : 'Add New Hero Box'}</DialogTitle>
                        <DialogDescription>Fill in the details for your hero box.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSaveBox)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="link" render={({ field }) => (
                                <FormItem><FormLabel>Link URL</FormLabel><FormControl><Input {...field} placeholder="/categories/paper-products" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="order" render={({ field }) => (
                                <FormItem><FormLabel>Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Category (Optional)</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || 'none'}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Assign to a category" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        <SelectItem value="none">None (Homepage)</SelectItem>
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
                             <FormItem>
                                <FormLabel>Background Image</FormLabel>
                                <div className="mt-2 flex items-center gap-6">
                                    {imagePreview ? <Image src={imagePreview} alt="Image preview" width={80} height={80} className="rounded-lg object-contain h-20 w-20 bg-muted border p-1" unoptimized />
                                    : <div className="h-20 w-20 flex items-center justify-center rounded-lg bg-muted text-muted-foreground border"><UploadCloud className="h-8 w-8" /></div>}
                                    <div className='flex flex-col gap-2'>
                                        <Input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload')?.click()} disabled={isUploading}>
                                            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {imageFile ? 'Change Image' : 'Upload Image'}
                                        </Button>
                                        <p className="text-xs text-muted-foreground">Or provide a path below.</p>
                                    </div>
                                </div>
                            </FormItem>
                            <FormField control={form.control} name="imageUrl" render={({ field }) => (
                                <FormItem><FormLabel>Image Path</FormLabel><FormControl><Input {...field} placeholder="/hero/box1.jpg" /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="imageHint" render={({ field }) => (
                                <FormItem><FormLabel>AI Image Hint</FormLabel><FormControl><Input {...field} placeholder="e.g., coffee cups" /></FormControl><FormMessage /></FormItem>
                            )} />

                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => handleOpenChange(false)}>Cancel</Button>
                                <Button type="submit" disabled={form.formState.isSubmitting || isUploading}>
                                    {(form.formState.isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
