'use client';

import { useState, useMemo, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase/provider';
import type { PackSize } from '@/lib/types';
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
import { MoreHorizontal, Edit, Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context';

export default function PackSizesPage() {
    const { toast } = useToast();
    const db = useFirestore();
    const [dialogState, setDialogState] = useState<{open: boolean; packSize?: Partial<PackSize>}>({ open: false, packSize: undefined });
    
    const [quantity, setQuantity] = useState(0);
    const { loading: authLoading } = useAuth();

    const packSizesQuery = useMemo(() => {
        if (!db) return null;
        const q = query(collection(db, 'packSizes'), orderBy('quantity', 'asc'));
        (q as any).__memo = true;
        return q;
    }, [db]);

    const { data: packSizes, isLoading: isLoadingData, error } = useCollection<PackSize>(packSizesQuery);
    const isLoading = authLoading || isLoadingData;
    
    useEffect(() => {
        if (dialogState.open) {
            setQuantity(dialogState.packSize?.quantity || 0);
        }
    }, [dialogState.open, dialogState.packSize]);

    const handleSavePackSize = async () => {
        if (!db) {
            toast({ variant: 'destructive', title: 'Error', description: 'Database not connected.' });
            return;
        }
        if (quantity <= 0) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Please enter a valid, positive number for the quantity.',
            });
            return;
        }

        const data = { quantity };

        try {
            if (dialogState.packSize?.id) {
                await updateDoc(doc(db, 'packSizes', dialogState.packSize.id), data);
                toast({ title: 'Success', description: 'Pack size updated.' });
            } else {
                await addDoc(collection(db, 'packSizes'), {
                    ...data,
                    createdAt: serverTimestamp(),
                });
                toast({ title: 'Success', description: 'New pack size added.' });
            }
            setDialogState({ open: false, packSize: undefined });
        } catch (e: any) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: e.message });
        }
    };

    const handleDeletePackSize = async (id: string) => {
        if (!db) {
            toast({ variant: 'destructive', title: 'Error', description: 'Database not connected.' });
            return;
        }
        try {
            await deleteDoc(doc(db, 'packSizes', id));
            toast({ title: 'Success', description: 'Pack size deleted.' });
        } catch (e: any) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: e.message });
        }
    };
    
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setDialogState({ open: false, packSize: undefined });
        } else {
            setDialogState(prev => ({ ...prev, open }));
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Pack Sizes</h1>
                    <p className="text-muted-foreground">Manage predefined product packaging quantities.</p>
                </div>
                <Button onClick={() => setDialogState({ open: true, packSize: {} })}>
                    <PlusCircle className="mr-2 h-4 w-4" />Add Pack Size
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Pack Sizes</CardTitle>
                    <CardDescription>A list of all available pack sizes, sorted by quantity.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell>
                                </TableRow>
                            )}
                            {!isLoading && error && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-red-500">{error.message}</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && packSizes?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">No pack sizes found. Add one to get started.</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && packSizes?.map((packSize) => (
                                <TableRow key={packSize.id}>
                                    <TableCell className="font-medium">{packSize.quantity.toLocaleString()}</TableCell>
                                    <TableCell>{packSize.createdAt ? format(packSize.createdAt.toDate(), 'MMM d, yyyy') : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => setDialogState({ open: true, packSize })}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    <span>Edit</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeletePackSize(packSize.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
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
                        <DialogTitle>{dialogState.packSize?.id ? 'Edit Pack Size' : 'Add New Pack Size'}</DialogTitle>
                        <DialogDescription>Enter the packaging quantity.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} placeholder="e.g., 50" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
                        <Button onClick={handleSavePackSize}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

    