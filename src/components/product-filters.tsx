'use client';

import { useMemo, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { Size, Colour, PrintOption, WallType, Thickness, MaterialType, FinishType, Adhesive, Handle, Shape, Category } from '@/lib/types';

type OptionCollection = 'categories' | 'sizes' | 'colours' | 'printOptions' | 'wallTypes' | 'thicknesses' | 'materialTypes' | 'finishTypes' | 'adhesives' | 'handles' | 'shapes';
type OptionType = Category | Size | Colour | PrintOption | WallType | Thickness | MaterialType | FinishType | Adhesive | Handle | Shape;

const filterOptions: { collectionName: OptionCollection; title: string; formFieldName: string }[] = [
    { collectionName: 'categories', title: 'Categories', formFieldName: 'categoryIds' },
    { collectionName: 'sizes', title: 'Sizes', formFieldName: 'sizeIds' },
    { collectionName: 'colours', title: 'Colours', formFieldName: 'colourIds' },
    { collectionName: 'printOptions', title: 'Print Options', formFieldName: 'printOptionIds' },
    { collectionName: 'wallTypes', title: 'Wall Types', formFieldName: 'wallTypeIds' },
    { collectionName: 'thicknesses', title: 'Thicknesses', formFieldName: 'thicknessIds' },
    { collectionName: 'materialTypes', title: 'Material Types', formFieldName: 'materialTypeIds' },
    { collectionName: 'finishTypes', title: 'Finish Types', formFieldName: 'finishTypeIds' },
    { collectionName: 'adhesives', title: 'Adhesives', formFieldName: 'adhesiveIds' },
    { collectionName: 'handles', title: 'Handles', formFieldName: 'handleIds' },
    { collectionName: 'shapes', title: 'Shapes', formFieldName: 'shapeIds' },
];

function FilterSection({
    title,
    collectionName,
    selectedValues,
    onFilterChange
}: {
    title: string;
    collectionName: OptionCollection;
    selectedValues: string[];
    onFilterChange: (value: string) => void;
}) {
    const optionsQuery = useMemo(() => {
        const q = query(collection(db, collectionName));
        (q as any).__memo = true;
        return q;
    }, [collectionName]);

    const { data: options, isLoading } = useCollection<OptionType>(optionsQuery);

    return (
        <AccordionItem value={collectionName}>
            <AccordionTrigger className="font-semibold">{title}</AccordionTrigger>
            <AccordionContent>
                {isLoading ? <Loader2 className="animate-spin" /> : (
                    <div className="space-y-2">
                        {options?.map((option) => (
                            <div key={option.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`${collectionName}-${option.id}`}
                                    checked={selectedValues.includes(option.id)}
                                    onCheckedChange={() => onFilterChange(option.id)}
                                />
                                <Label htmlFor={`${collectionName}-${option.id}`} className="font-normal cursor-pointer">
                                    {option.name}
                                </Label>
                            </div>
                        ))}
                    </div>
                )}
            </AccordionContent>
        </AccordionItem>
    );
}

export function ProductFilters({ 
    onFiltersChange,
    initialFilters = {}
}: { 
    onFiltersChange: (filters: Record<string, string[]>) => void;
    initialFilters?: Record<string, string[]>;
}) {
    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(initialFilters);

    useEffect(() => {
        setActiveFilters(initialFilters);
    }, [initialFilters]);

    useEffect(() => {
        onFiltersChange(activeFilters);
    }, [activeFilters, onFiltersChange]);

    const handleFilterChange = (filterGroup: string, value: string) => {
        setActiveFilters(prev => {
            const groupValues = prev[filterGroup] || [];
            const newGroupValues = groupValues.includes(value)
                ? groupValues.filter(v => v !== value)
                : [...groupValues, value];
            
            const newFilters = { ...prev, [filterGroup]: newGroupValues };
            
            if (newGroupValues.length === 0) {
                delete newFilters[filterGroup];
            }
            
            return newFilters;
        });
    };

    const clearFilters = () => {
        setActiveFilters({});
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-headline text-lg font-bold">Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters} disabled={Object.keys(activeFilters).length === 0}>Clear All</Button>
            </div>
            <Accordion type="multiple" className="w-full" defaultValue={Object.keys(initialFilters)}>
                {filterOptions.map(option => (
                    <FilterSection
                        key={option.collectionName}
                        title={option.title}
                        collectionName={option.collectionName}
                        selectedValues={activeFilters[option.formFieldName] || []}
                        onFilterChange={(value) => handleFilterChange(option.formFieldName, value)}
                    />
                ))}
            </Accordion>
        </div>
    );
}
