'use client';

import { useState, useMemo, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase/provider';
import { collection, query, orderBy } from 'firebase/firestore';
import type { QuantityTier } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

type Tier = { qty: number; pricePerUnit: number; save: number; total: number; };

export function QuantityPricingTable({ onQuantityChange }: { onQuantityChange: (tier: Tier) => void }) {
  const db = useFirestore();
  const [selectedQty, setSelectedQty] = useState<string | undefined>(undefined);
  
  const tiersQuery = useMemo(() => {
    if (!db) return null;
    const q = query(collection(db, 'quantityTiers'), orderBy('quantity', 'asc'));
    (q as any).__memo = true;
    return q;
  }, [db]);

  const { data: quantityTiers, isLoading } = useCollection<QuantityTier>(tiersQuery);
  
  useEffect(() => {
    if (quantityTiers && quantityTiers.length > 0 && !selectedQty) {
        const defaultTier = quantityTiers[0];
        setSelectedQty(defaultTier.quantity.toString());
        onQuantityChange({
            qty: defaultTier.quantity,
            pricePerUnit: defaultTier.pricePerUnit,
            save: defaultTier.save,
            total: defaultTier.quantity * defaultTier.pricePerUnit,
        });
    }
  }, [quantityTiers, selectedQty, onQuantityChange]);

  const handleValueChange = (value: string) => {
    setSelectedQty(value);
    const selectedTier = quantityTiers?.find(t => t.quantity.toString() === value);
    if (selectedTier) {
      onQuantityChange({
        qty: selectedTier.quantity,
        pricePerUnit: selectedTier.pricePerUnit,
        save: selectedTier.save,
        total: selectedTier.quantity * selectedTier.pricePerUnit
      });
    }
  };
  
  if (isLoading) {
      return (
          <div className="mt-8 space-y-2">
             <Skeleton className="h-6 w-24 mb-2" />
             <Skeleton className="h-16 w-full" />
             <Skeleton className="h-16 w-full" />
             <Skeleton className="h-16 w-full" />
          </div>
      )
  }

  if (!quantityTiers || quantityTiers.length === 0) {
      return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold mb-2">Quantity</h3>
      <RadioGroup value={selectedQty} onValueChange={handleValueChange} className="space-y-2">
        {quantityTiers.map(tier => (
          <Label
            key={tier.quantity}
            htmlFor={`qty-${tier.quantity}`}
            className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition-colors ${selectedQty === tier.quantity.toString() ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'}`}
          >
            <div className="flex items-center gap-4">
              <RadioGroupItem value={tier.quantity.toString()} id={`qty-${tier.quantity}`} />
              <span className="font-medium">{tier.quantity.toLocaleString()}</span>
              {tier.save > 0 && <Badge variant="secondary" className="bg-purple-100 text-purple-700">-{tier.save}%</Badge>}
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">DH{(tier.quantity * tier.pricePerUnit).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">DH{tier.pricePerUnit.toFixed(3)} / Unit</p>
            </div>
          </Label>
        ))}
      </RadioGroup>
       <div className="mt-2 text-sm text-muted-foreground">
        Need more? <a href="#" className="underline text-primary">Click here</a>
      </div>
    </div>
  );
}

    