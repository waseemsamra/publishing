'use client';

import { useState, useMemo, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { PrintOption } from '@/lib/types';
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

export default function PrintOptionsPage() {
    const { toast } = useToast();
    const [dialogState, setDialogState] = useState<{open: boolean; printOption?: Partial<PrintOption>}>({ open: false, printOption: undefined });
    
    // Form state is now in the main component
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const printOptionsQuery = useMemo(() => {
        if (!db) return null;
        const q = query(collection(db, 'printOptions'));
        (q as any).__memo = true;
        return q;
    }, []);

    const { data: printOptions, isLoading, error } = useCollection<PrintOption>(printOptionsQuery);
    
    // Update form state when dialog opens for editing
    useEffect(() => {
        if (dialogState.open && dialogState.printOption) {
            setName(dialogState.printOption.name || '');
            setDescription(dialogState.printOption.description || '');
        }
    }, [dialogState.open, dialogState.printOption]);

    const handleSavePrintOption = async () => {
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
            if (dialogState.printOption?.id) {
                // Update
                await updateDoc(doc(db, 'printOptions', dialogState.printOption.id), data);
                toast({ title: 'Success', description: 'Print Option updated.' });
            } else {
                // Add
                await addDoc(collection(db, 'printOptions'), {
                    ...data,
                    createdAt: serverTimestamp(),
                });
                toast({ title: 'Success', description: 'New Print Option added.' });
            }
            setDialogState({ open: false, printOption: undefined });
        } catch (e: any) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: e.message });
        }
    };

    const handleDeletePrintOption = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'printOptions', id));
            toast({ title: 'Success', description: 'Print Option deleted.' });
        } catch (e: any) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: e.message });
        }
    };
    
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setDialogState({ open: false, printOption: undefined });
        } else {
            setDialogState(prev => ({ ...prev, open }));
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Print Options</h1>
                    <p className="text-muted-foreground">Manage product print options for your store.</p>
                </div>
                <Button onClick={() => setDialogState({ open: true, printOption: {} })}>
                    <PlusCircle className="mr-2 h-4 w-4" />Add Print Option
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Print Options</CardTitle>
                    <CardDescription>A list of all available product print options.</CardDescription>
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
                            {!isLoading && printOptions?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">No print options found. Add one to get started.</TableCell>
                                </TableRow>
                            )}
                            {printOptions?.map((printOption) => (
                                <TableRow key={printOption.id}>
                                    <TableCell className="font-medium">{printOption.name}</TableCell>
                                    <TableCell>{printOption.description}</TableCell>
                                    <TableCell>{printOption.createdAt ? format(printOption.createdAt.toDate(), 'MMM d, yyyy') : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => setDialogState({ open: true, printOption })}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    <span>Edit</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeletePrintOption(printOption.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
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
                        <DialogTitle>{dialogState.printOption?.id ? 'Edit Print Option' : 'Add New Print Option'}</DialogTitle>
                        <DialogDescription>
                            {dialogState.printOption?.id ? `Update the details for ${dialogState.printOption.name}.` : 'Enter the details for the new print option.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Embossed" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., A raised design on the material." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
                        <Button onClick={handleSavePrintOption}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
