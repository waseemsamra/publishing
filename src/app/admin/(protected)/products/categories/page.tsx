'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase/provider';
import type { Category } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, Edit, Trash2, PlusCircle, Loader2, UploadCloud, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/auth-context';

const s3BaseUrl = 'https://printinweb.s3.us-east-1.amazonaws.com';

export default function CategoriesPage() {
    const { toast } = useToast();
    const db = useFirestore();
    const [dialogState, setDialogState] = useState<{open: boolean; category?: Partial<Category>}>({ open: false, category: undefined });
    
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [parentId, setParentId] = useState<string | undefined>(undefined);
    const [imageUrl, setImageUrl] = useState('');
    const [imageHint, setImageHint] = useState('');
    const [order, setOrder] = useState(0);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { loading: authLoading } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    const categoriesQuery = useMemo(() => {
        if (!db) return null;
        const q = query(collection(db, 'categories'));
        (q as any).__memo = true;
        return q;
    }, [db]);

    const { data: categories, isLoading: isLoadingData, error } = useCollection<Category>(categoriesQuery);
    const isLoading = authLoading || isLoadingData;

    const filteredCategories = useMemo(() => {
        if (!categories) return [];
        const sorted = [...categories].sort((a, b) => {
            const orderA = a.order ?? Infinity;
            const orderB = b.order ?? Infinity;
            return orderA - orderB;
        });

        if (!searchTerm) return sorted;

        return sorted.filter(category =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm]);

    const categoryMap = useMemo(() => {
      if (!categories) return new Map();
      return new Map(categories.map(c => [c.id, c.name]));
    }, [categories]);

    const previewUrl = useMemo(() => {
        if (imageFile) {
            return URL.createObjectURL(imageFile);
        }
        if (imageUrl) {
            return imageUrl.startsWith('http') ? imageUrl : `${s3BaseUrl}${imageUrl}`;
        }
        return null;
    }, [imageFile, imageUrl]);
    
    useEffect(() => {
        if (dialogState.open && dialogState.category) {
            setName(dialogState.category.name || '');
            setDescription(dialogState.category.description || '');
            setParentId(dialogState.category.parentId);
            setImageUrl(dialogState.category.imageUrl?.replace(s3BaseUrl, '') || '');
            setImageHint(dialogState.category.imageHint || '');
            setOrder(dialogState.category.order ?? (categories?.length || 0));
            setImageFile(null);
        }
    }, [dialogState.open, dialogState.category, categories]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
        }
    };

    const handleSaveCategory = async () => {
        if (!db) {
            toast({ variant: 'destructive', title: 'Error', description: 'Database not connected.' });
            return;
        }
        if (!name.trim()) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Name is required.',
            });
            return;
        }
        
        let finalImageUrl = imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `${s3BaseUrl}${imageUrl}`) : '';

        try {
            setIsUploading(true);
            if (imageFile) {
                const formData = new FormData();
                formData.append("file", imageFile);
                const response = await fetch('/image', { method: 'POST', body: formData });
                if (!response.ok) {
                    throw new Error(`Image upload failed: ${response.statusText}`);
                }
                const result = await response.json();
                finalImageUrl = result.url;
            }

            if (dialogState.category?.id) { // UPDATE
                if (dialogState.category.id === parentId) {
                    toast({
                        variant: 'destructive',
                        title: 'Validation Error',
                        description: 'A category cannot be its own parent.',
                    });
                    setIsUploading(false);
                    return;
                }
                
                await updateDoc(doc(db, 'categories', dialogState.category.id), {
                  name,
                  description,
                  parentId: parentId || null,
                  imageUrl: finalImageUrl,
                  imageHint,
                  order,
                  updatedAt: serverTimestamp(),
                });

                toast({ title: 'Success', description: 'Category updated.' });
    
            } else { // CREATE
                const dataToCreate: any = {
                    name,
                    description,
                    imageUrl: finalImageUrl,
                    imageHint,
                    order,
                    createdAt: serverTimestamp(),
                };
                if (parentId) {
                    dataToCreate.parentId = parentId;
                }

                await addDoc(collection(db, 'categories'), dataToCreate);
                toast({ title: 'Success', description: 'New category added.' });
            }
            setDialogState({ open: false, category: undefined });
        } catch (e: any) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: e.message });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!db) {
            toast({ variant: 'destructive', title: 'Error', description: 'Database not connected.' });
            return;
        }
        const isParent = categories?.some(c => c.parentId === id);
        if (isParent) {
            toast({
                variant: 'destructive',
                title: 'Deletion Blocked',
                description: 'Cannot delete a category that has sub-categories. Please re-parent or delete sub-categories first.',
            });
            return;
        }
        try {
            await deleteDoc(doc(db, 'categories', id));
            toast({ title: 'Success', description: 'Category deleted.' });
        } catch (e: any) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: e.message });
        }
    };
    
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setDialogState({ open: false, category: undefined });
            setName('');
            setDescription('');
            setParentId(undefined);
            setImageUrl('');
            setImageHint('');
            setOrder(0);
            setImageFile(null);
        } else {
            setDialogState(prev => ({ ...prev, open }));
        }
    }

    const parentCategories = useMemo(() => categories?.filter(c => !c.parentId), [categories]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Categories</h1>
                    <p className="text-muted-foreground">Manage product categories and sub-categories.</p>
                </div>
                <Button onClick={() => setDialogState({ open: true, category: { order: categories?.length || 0 } })}>
                    <PlusCircle className="mr-2 h-4 w-4" />Add Category
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>All Categories</CardTitle>
                            <CardDescription>A list of all available categories.</CardDescription>
                        </div>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search categories..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Parent Category</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell>
                                </TableRow>
                            )}
                            {!isLoading && error && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-red-500">{error.message}</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && filteredCategories?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">No categories found.</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && filteredCategories?.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="hidden sm:table-cell">
                                        {category.imageUrl ? (
                                            <Image
                                                alt={category.name}
                                                className="aspect-square rounded-md object-cover"
                                                height="64"
                                                src={category.imageUrl}
                                                width="64"
                                                unoptimized
                                            />
                                        ) : (
                                          <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                                        )}
                                    </TableCell>
                                    <TableCell>{category.order ?? 0}</TableCell>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell>{category.description}</TableCell>
                                    <TableCell>{category.parentId ? categoryMap.get(category.parentId) || 'N/A' : 'Top Level'}</TableCell>
                                    <TableCell>{category.createdAt ? format(category.createdAt.toDate(), 'MMM d, yyyy') : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => setDialogState({ open: true, category })}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    <span>Edit</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteCategory(category.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Delete</span>
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
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>{dialogState.category?.id ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                        <DialogDescription>
                            {dialogState.category?.id ? `Update the details for ${dialogState.category.name}.` : 'Enter the details for the new category.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Clothing" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="order">Display Order</Label>
                            <Input id="order" type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., All kinds of apparel." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="parent">Parent Category</Label>
                             <Select value={parentId} onValueChange={(value) => setParentId(value === 'none' ? undefined : value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a parent category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None (Top Level)</SelectItem>
                                    {parentCategories?.filter(c => c.id !== dialogState.category?.id).map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label>Category Image</Label>
                            <div className="mt-2 flex items-center gap-6">
                                {previewUrl ? <Image src={previewUrl} alt="Category preview" width={80} height={80} className="rounded-lg object-contain h-20 w-20 bg-muted border p-1" unoptimized />
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
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="imageUrl">Image Path</Label>
                            <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="e.g., /categories/apparel.jpg" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="imageHint">AI Image Hint</Label>
                            <Input id="imageHint" value={imageHint} onChange={(e) => setImageHint(e.target.value)} placeholder="e.g., summer shirts" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
                        <Button onClick={handleSaveCategory} disabled={isUploading}>
                            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
