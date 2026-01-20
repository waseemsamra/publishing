'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, setDoc, getDoc } from 'firebase/firestore';
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
import { MoreHorizontal, Edit, Trash2, PlusCircle, Loader2, UploadCloud, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/auth-context';

const s3BaseUrl = 'https://printinweb.s3.us-east-1.amazonaws.com';

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -

export default function CategoriesPage() {
    const { toast } = useToast();
    const db = useFirestore();
    const [dialogState, setDialogState] = useState<{open: boolean; category?: Partial<Category>}>({ open: false, category: undefined });
    
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [parentId, setParentId] = useState<string | undefined>(undefined);
    const [imageUrl, setImageUrl] = useState('');
    const [imageHint, setImageHint] = useState('');
    const [order, setOrder] = useState(0);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { loading: authLoading } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>({ key: 'order', direction: 'ascending' });

    const categoriesQuery = useMemo(() => {
        if (!db) return null;
        const q = query(collection(db, 'categories'));
        (q as any).__memo = true;
        return q;
    }, [db, refreshKey]);

    const { data: categories, isLoading: isLoadingData, error } = useCollection<Category>(categoriesQuery);
    const isLoading = authLoading || isLoadingData;

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) {
          return null;
        }
        if (sortConfig.direction === 'ascending') {
          return <ArrowUp className="h-4 w-4" />;
        }
        return <ArrowDown className="h-4 w-4" />;
    };

    const categoryMap = useMemo(() => {
      if (!categories) return new Map();
      return new Map(categories.map(c => [c.id, c.name]));
    }, [categories]);

    const isParentSortActive = sortConfig?.key === 'parentCategory';

    const filteredCategories = useMemo(() => {
        if (!categories) return [];

        const categoryNodeMap = new Map(categories.map(c => [c.id, { ...c, children: [] as Category[], depth: 0 }]));
        const topLevelCategories: (Category & { children: Category[]; depth: number })[] = [];

        categories.forEach(c => {
            const node = categoryNodeMap.get(c.id)!;
            if (c.parentId && categoryNodeMap.has(c.parentId)) {
                categoryNodeMap.get(c.parentId)!.children.push(node);
            } else {
                topLevelCategories.push(node);
            }
        });

        const setDepthAndSort = (cats: (Category & { children: Category[]; depth: number })[], depth: number) => {
            cats.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
            for (const category of cats) {
                category.depth = depth;
                if (category.children && category.children.length > 0) {
                    setDepthAndSort(category.children, depth + 1);
                }
            }
        };
        
        if (!isParentSortActive) {
            setDepthAndSort(topLevelCategories, 0);
        } else {
             topLevelCategories.forEach(node => {
                const setDepth = (n: any, depth: number) => {
                    n.depth = depth;
                    n.children.forEach((child: any) => setDepth(child, depth + 1));
                }
                setDepth(node, 0);
            });
        }

        const flattened: (Category & { depth: number })[] = [];
        const flatten = (cats: (Category & { children: Category[]; depth: number })[]) => {
            for (const category of cats) {
                flattened.push(category);
                if (category.children && category.children.length > 0) {
                    flatten(category.children);
                }
            }
        };

        flatten(topLevelCategories);
        
        if (sortConfig) {
             flattened.sort((a, b) => {
                if (sortConfig.key === 'order') {
                    const orderA = a.order ?? Infinity;
                    const orderB = b.order ?? Infinity;
                    if (orderA < orderB) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (orderA > orderB) return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                if (sortConfig.key === 'parentCategory') {
                    const parentA = a.parentId ? categoryMap.get(a.parentId) || '' : '';
                    const parentB = b.parentId ? categoryMap.get(b.parentId) || '' : '';
                    if (parentA < parentB) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (parentA > parentB) return sortConfig.direction === 'ascending' ? 1 : -1;
                    return (a.order ?? Infinity) - (b.order ?? Infinity);
                }
                return 0;
            });
        }
        
        if (!searchTerm) return flattened;

        return flattened.filter(category =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm, sortConfig, categoryMap, isParentSortActive]);

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
            setSlug(dialogState.category.slug || '');
            setDescription(dialogState.category.description || '');
            setParentId(dialogState.category.parentId);
            setImageUrl(dialogState.category.imageUrl?.replace(s3BaseUrl, '') || '');
            setImageHint(dialogState.category.imageHint || '');
            setOrder(dialogState.category.order ?? (categories?.length || 0));
            setImageFile(null);
        }
    }, [dialogState.open, dialogState.category, categories]);

    useEffect(() => {
      if (dialogState.open && !dialogState.category?.id) {
        setSlug(slugify(name));
      }
    }, [name, dialogState.open, dialogState.category?.id]);

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
        if (!name.trim() || !slug.trim()) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Name and Slug are required.',
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
                  slug,
                  updatedAt: serverTimestamp(),
                });

                toast({ title: 'Success', description: 'Category updated.' });
    
            } else { // CREATE
                const docRef = doc(db, 'categories', slug);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: 'A category with this slug already exists. Please choose a unique slug.',
                    });
                    setIsUploading(false);
                    return;
                }

                const dataToCreate: any = {
                    name,
                    description,
                    imageUrl: finalImageUrl,
                    imageHint,
                    order,
                    slug,
                    createdAt: serverTimestamp(),
                };
                if (parentId) {
                    dataToCreate.parentId = parentId;
                }

                await setDoc(docRef, dataToCreate);
                toast({ title: 'Success', description: 'New category added.' });
            }
            setDialogState({ open: false, category: undefined });
            setRefreshKey(k => k + 1);
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
            setRefreshKey(k => k + 1);
        } catch (e: any) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: e.message });
        }
    };
    
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setDialogState({ open: false, category: undefined });
            setName('');
            setSlug('');
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
    
    const renderSortableHeader = (key: string, label: string) => (
        <TableHead>
            <Button variant="ghost" onClick={() => requestSort(key)} className="px-0 hover:bg-transparent -ml-4">
                {label}
                <span className="w-4 ml-2">{getSortIcon(key)}</span>
            </Button>
        </TableHead>
    );

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
                                {renderSortableHeader('order', 'Order')}
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                {renderSortableHeader('parentCategory', 'Parent Category')}
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
                                    <TableCell 
                                        className="font-medium" 
                                        style={{ paddingLeft: `${!isParentSortActive && (category as any).depth > 0 && !searchTerm ? 1 + (category as any).depth * 1.5 : 1}rem` }}
                                    >
                                       { !isParentSortActive && (category as any).depth > 0 && !searchTerm ? '↳ ' : ''}{category.name}
                                    </TableCell>
                                    <TableCell>{category.description}</TableCell>
                                    <TableCell>{category.parentId ? categoryMap.get(category.parentId) || 'N/A' : '—'}</TableCell>
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
                            <Label htmlFor="slug">Slug</Label>
                            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g., clothing" disabled={!!dialogState.category?.id} />
                            {dialogState.category?.id && <p className="text-xs text-muted-foreground">Slug cannot be changed for existing categories.</p>}
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
                                    {categories?.filter(c => c.id !== dialogState.category?.id && !c.parentId).map(c => (
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
                        <Button variant="outline" type="button" onClick={() => handleOpenChange(false)}>Cancel</Button>
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
