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
    const [pricePerUnit, setPricePerUnit] = useState(0);
    const [save, setSave] = useState(0);
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
            setPricePerUnit(dialogState.packSize?.pricePerUnit || 0);
            setSave(dialogState.packSize?.save || 0);
        }
    }, [dialogState.open, dialogState.packSize]);

    const handleSavePackSize = async () => {
        if (!db) {
            toast({ variant: 'destructive', title: 'Error', description: 'Database not connected.' });
            return;
        }
        if (quantity <= 0 || pricePerUnit < 0 || save < 0) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Please enter valid, positive numbers for all fields.',
            });
            return;
        }

        const data = { quantity, pricePerUnit, save };

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
                    <h1 className="font-headline text-3xl font-bold">Pack Sizes & Pricing Tiers</h1>
                    <p className="text-muted-foreground">Manage quantity-based pricing for products.</p>
                </div>
                <Button onClick={() => setDialogState({ open: true, packSize: {} })}>
                    <PlusCircle className="mr-2 h-4 w-4" />Add Tier
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Pricing Tiers</CardTitle>
                    <CardDescription>A list of all available pricing tiers, sorted by quantity.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Price Per Unit</TableHead>
                                <TableHead>Save (%)</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell>
                                </TableRow>
                            )}
                            {!isLoading && error && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-red-500">{error.message}</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && packSizes?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">No pricing tiers found. Add one to get started.</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && packSizes?.map((packSize) => (
                                <TableRow key={packSize.id}>
                                    <TableCell className="font-medium">{packSize.quantity.toLocaleString()}</TableCell>
                                    <TableCell>DH{packSize.pricePerUnit.toFixed(3)}</TableCell>
                                    <TableCell>{packSize.save}%</TableCell>
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
                        <DialogTitle>{dialogState.packSize?.id ? 'Edit Tier' : 'Add New Tier'}</DialogTitle>
                        <DialogDescription>Enter the details for the pricing tier.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} placeholder="e.g., 1000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pricePerUnit">Price Per Unit</Label>
                            <Input id="pricePerUnit" type="number" step="0.001" value={pricePerUnit} onChange={(e) => setPricePerUnit(Number(e.target.value))} placeholder="e.g., 0.130" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="save">Save Percentage</Label>
                            <Input id="save" type="number" value={save} onChange={(e) => setSave(Number(e.target.value))} placeholder="e.g., 13" />
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
