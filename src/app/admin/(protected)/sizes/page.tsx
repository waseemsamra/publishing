'use client';

import { useState, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Size } from '@/lib/types';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, Edit, Trash2, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';


function SizeFormDialog({ size, onSave, children }: { size?: Size, onSave: (data: Omit<Size, 'id' | 'createdAt'>) => void, children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState(size?.name || '');
    const [shortName, setShortName] = useState(size?.shortName || '');
    const { toast } = useToast();

    const handleSubmit = () => {
        if (!name.trim() || !shortName.trim()) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Both Name and Short Name are required.',
            });
            return;
        }
        onSave({ name, shortName });
        setIsOpen(false);
    };

    const handleOpenChange = (open: boolean) => {
        if (open) {
            setName(size?.name || '');
            setShortName(size?.shortName || '');
        }
        setIsOpen(open);
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{size ? 'Edit Size' : 'Add New Size'}</DialogTitle>
                    <DialogDescription>
                        {size ? `Update the details for ${size.name}.` : 'Enter the details for the new size.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Medium" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="shortName">Short Name</Label>
                        <Input id="shortName" value={shortName} onChange={(e) => setShortName(e.target.value)} placeholder="e.g., M" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save</Button>
                </DialogFooter>
            </DialogContent>
        );
}


export default function SizesPage() {
    const { toast } = useToast();
    
    const sizesQuery = useMemo(() => {
        const q = query(collection(db, 'sizes'));
        (q as any).__memo = true;
        return q;
    }, []);

    const { data: sizes, isLoading, error } = useCollection<Size>(sizesQuery);

    const handleAddSize = async (data: Omit<Size, 'id' | 'createdAt'>) => {
        try {
            await addDoc(collection(db, 'sizes'), {
                ...data,
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Success', description: 'New size added.' });
        } catch (e: any) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: e.message });
        }
    };

    const handleUpdateSize = async (id: string, data: Omit<Size, 'id' | 'createdAt'>) => {
        try {
            await updateDoc(doc(db, 'sizes', id), data);
            toast({ title: 'Success', description: 'Size updated.' });
        } catch (e: any) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: e.message });
        }
    };

    const handleDeleteSize = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'sizes', id));
            toast({ title: 'Success', description: 'Size deleted.' });
        } catch (e: any) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: e.message });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Sizes</h1>
                    <p className="text-muted-foreground">Manage product sizes for your store.</p>
                </div>
                <SizeFormDialog onSave={handleAddSize}>
                    <Button><PlusCircle className="mr-2 h-4 w-4" />Add Size</Button>
                </SizeFormDialog>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Sizes</CardTitle>
                    <CardDescription>A list of all available product sizes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Short Name</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && error && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-red-500">{error.message}</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && sizes?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">No sizes found. Add one to get started.</TableCell>
                                </TableRow>
                            )}
                            {sizes?.map((size) => (
                                <TableRow key={size.id}>
                                    <TableCell className="font-medium">{size.name}</TableCell>
                                    <TableCell>{size.shortName}</TableCell>
                                    <TableCell>{size.createdAt ? format(size.createdAt.toDate(), 'MMM d, yyyy') : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <SizeFormDialog size={size} onSave={(data) => handleUpdateSize(size.id, data)}>
                                                     <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-left">
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        <span>Edit</span>
                                                    </button>
                                                </SizeFormDialog>
                                                <DropdownMenuItem onClick={() => handleDeleteSize(size.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
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
        </div>
    );
}

    