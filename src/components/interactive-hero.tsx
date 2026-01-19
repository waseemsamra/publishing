'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase/provider';
import { collection, query } from 'firebase/firestore';
import type { Category } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const fallbackColors = [
    'bg-sky-700', 'bg-emerald-700', 'bg-amber-700', 'bg-rose-700',
    'bg-indigo-700', 'bg-teal-700', 'bg-lime-700', 'bg-fuchsia-700',
    'bg-cyan-700', 'bg-orange-700', 'bg-pink-700', 'bg-violet-700'
];


export function InteractiveHero() {
  const db = useFirestore();
  
  const categoriesQuery = useMemo(() => {
    if (!db) return null;
    const q = query(collection(db, 'categories'));
    (q as any).__memo = true;
    return q;
  }, [db]);

  const { data: allCategories, isLoading } = useCollection<Category>(categoriesQuery);

  const [featuredItem, setFeaturedItem] = useState<Category | null>(null);
  const [gridItems, setGridItems] = useState<Category[]>([]);
  const [activeHoverItem, setActiveHoverItem] = useState<Category | null>(null);

  useEffect(() => {
    if (allCategories) {
        const topLevelCategories = allCategories.filter(cat => !cat.parentId);
        
        const foodPackagingCategory = topLevelCategories.find(
          cat => cat.name.toLowerCase() === 'food packaging'
        );

        const initialFeatured = foodPackagingCategory || topLevelCategories[0] || null;
        
        if (initialFeatured) {
            setFeaturedItem(initialFeatured);
            setGridItems(topLevelCategories.filter(cat => cat.id !== initialFeatured.id).slice(0, 12));
        } else {
            // Handle case where there are no categories
            setFeaturedItem(null);
            setGridItems([]);
        }
    }
  }, [allCategories]);

  const handleItemHover = (item: Category) => {
    setActiveHoverItem(item);
  };
  
  const handleMouseLeave = () => {
    setActiveHoverItem(null);
  };

  const displayItem = activeHoverItem || featuredItem;

  if (isLoading) {
      return (
          <section className="bg-muted h-[480px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
          </section>
      )
  }
  
  if (!gridItems || !displayItem) {
    return (
        <section className="bg-muted h-[480px] flex flex-col items-center justify-center text-center p-4">
            <h3 className="font-headline text-2xl font-bold">No Categories Found</h3>
            <p className="text-muted-foreground mt-2">Add some top-level categories in the admin panel to see them here.</p>
        </section>
    );
  }

  return (
    <section>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border overflow-hidden">
            {/* Left Display Panel */}
            <div className="relative isolate flex flex-col items-center justify-center p-8 text-white min-h-[400px] lg:min-h-0">
                {displayItem?.imageUrl ? (
                    <Image
                        src={displayItem.imageUrl}
                        alt={displayItem.name}
                        fill
                        className="object-cover -z-10 transition-all duration-500 ease-in-out"
                        key={displayItem.id}
                        data-ai-hint={displayItem.imageHint}
                        unoptimized
                    />
                ) : (
                     <div className={cn("absolute inset-0 -z-10", fallbackColors[allCategories?.findIndex(c => c.id === displayItem?.id) % fallbackColors.length ?? 0])}></div>
                )}

                <div className="absolute inset-0 bg-black/30 -z-10"></div>

                <div className="text-center relative">
                    <p className="text-white/80">HanaPac Customized Packaging</p>
                    <h2 className="font-headline text-5xl font-bold text-white mt-2">{displayItem?.name} Packaging</h2>
                </div>
            </div>

            {/* Right Grid Panel */}
            <div className="grid grid-cols-3 grid-rows-4 bg-border" onMouseLeave={handleMouseLeave}>
                {gridItems.map((item, index) => (
                    <Link
                    href={`/products?category=${item.id}`}
                    key={item.id}
                    onMouseEnter={() => handleItemHover(item)}
                    className={cn(
                        "relative isolate flex items-center justify-center p-4 text-center text-white aspect-[4/3] transition-all duration-200 group",
                        "focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset",
                         activeHoverItem?.id === item.id && "ring-2 ring-primary ring-inset"
                    )}
                    >
                    {item.imageUrl ? (
                        <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover -z-10 group-hover:scale-105 transition-transform duration-300"
                            data-ai-hint={item.imageHint}
                            unoptimized
                        />
                    ) : (
                        <div className={cn("absolute inset-0 -z-10", fallbackColors[index % fallbackColors.length])}></div>
                    )}
                    <div className={cn(
                        "absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors -z-10",
                    )}></div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    </Link>
                ))}
            </div>
        </div>
    </section>
  );
}