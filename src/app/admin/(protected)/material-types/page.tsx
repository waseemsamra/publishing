'use client';

import { useState, useMemo, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { MaterialType } from '@/lib/types';
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
import { Label } from '@/components/ui/label';
import { MoreHorizontal, Edit, Trash2, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';

export default function MaterialTypesPage() {
    const { toast } = useToast();
    const [dialogState, setDialogState] = useState<{open: boolean; materialType?: Partial<MaterialType>}>({ open: false, materialType: undefined });
    
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const materialTypesQuery = useMemo(() => {
        const q = query(collection(db, 'materialTypes'));
        (q as any).__memo = true;
        return q;
    }, []);

    const { data: materialTypes, isLoading, error } = useCollection<MaterialType>(materialTypesQuery);
    
    useEffect(() => {
        if (dialogState.open && dialogState.materialType) {
            setName(dialogState.materialType.name || '');
            setDescription(dialogState.materialType.description || '');
        }
    }, [dialogState.open, dialogState.materialType]);

    const handleSaveMaterialType = async () => {
        if (!name.trim()) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Name is required.',
            });
            return;
        }

        const data = { name, description };

        try {
            if (dialogState.materialType?.id) {
                await updateDoc(doc(db, 'materialTypes', dialogState.materialType.id), data);
                toast({ title: 'Success', description: 'Material Type updated.' });
            } else {
                await addDoc(collection(db, 'materialTypes'), {
                    ...data,
                    createdAt: serverTimestamp(),
                });
                toast({ title: 'Success', description: 'New Material Type added.' });
            }
            setDialogState({ open: false, materialType: undefined });
        } catch (e: any) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: e.message });
        }
    };

    const handleDeleteMaterialType = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'materialTypes', id));
            toast({ title: 'Success', description: 'Material Type deleted.' });
        } catch (e: any) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: e.message });
        }
    };
    
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setDialogState({ open: false, materialType: undefined });
        } else {
            setDialogState(prev => ({ ...prev, open }));
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Material Types</h1>
                    <p className="text-muted-foreground">Manage material types for your store.</p>
                </div>
                <Button onClick={() => setDialogState({ open: true, materialType: {} })}>
                    <PlusCircle className="mr-2 h-4 w-4" />Add Material Type
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Material Types</CardTitle>
                    <CardDescription>A list of all available material types.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
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
                            {!isLoading && materialTypes?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">No material types found. Add one to get started.</TableCell>
                                </TableRow>
                            )}
                            {materialTypes?.map((materialType) => (
                                <TableRow key={materialType.id}>
                                    <TableCell className="font-medium">{materialType.name}</TableCell>
                                    <TableCell>{materialType.description}</TableCell>
                                    <TableCell>{materialType.createdAt ? format(materialType.createdAt.toDate(), 'MMM d, yyyy') : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => setDialogState({ open: true, materialType })}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    <span>Edit</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteMaterialType(materialType.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{dialogState.materialType?.id ? 'Edit Material Type' : 'Add New Material Type'}</DialogTitle>
                        <DialogDescription>
                            {dialogState.materialType?.id ? `Update the details for ${dialogState.materialType.name}.` : 'Enter the details for the new material type.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Standard White" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., An uncoated, matte white material." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
                        <Button onClick={handleSaveMaterialType}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
