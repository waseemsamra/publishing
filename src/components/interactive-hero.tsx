'use client';

import { useState } from 'react';
import Image from 'next/image';
import { heroGridItems } from '@/lib/data';
import type { HeroGridItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function InteractiveHero() {
  const initialItem = heroGridItems.find(item => item.id === 'food') || heroGridItems[0];
  const [activeItem, setActiveItem] = useState<HeroGridItem>(initialItem);

  return (
    <section className="bg-background">
        <div className="container py-12">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border overflow-hidden rounded-xl border">
                {/* Left Display Panel */}
                <div className="relative isolate flex flex-col items-center justify-center p-8 text-white min-h-[400px] lg:min-h-0">
                <Image
                    src={activeItem.displayImageUrl}
                    alt={activeItem.displayText}
                    fill
                    className="object-cover -z-10 transition-transform duration-500 ease-in-out"
                    key={activeItem.id}
                    data-ai-hint={activeItem.imageHint}
                />
                <div className="absolute inset-0 bg-primary/80 -z-10"></div>
                <div className="text-center relative">
                    <p className="text-primary-foreground/80">{activeItem.displaySubtitle}</p>
                    <h2 className="font-headline text-5xl font-bold text-primary-foreground mt-2">{activeItem.displayText}</h2>
                </div>
                </div>

                {/* Right Grid Panel */}
                <div className="grid grid-cols-3 grid-rows-4 bg-border">
                {heroGridItems.map((item) => (
                    <Link
                    href="#"
                    key={item.id}
                    onMouseEnter={() => setActiveItem(item)}
                    className={cn(
                        "relative isolate flex items-center justify-center p-4 text-center text-white aspect-square transition-all duration-200 group",
                        "focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                    )}
                    >
                    <Image
                        src={item.backgroundImageUrl}
                        alt={item.title}
                        fill
                        className="object-cover -z-10 group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint={item.imageHint}
                      />
                    <div className={cn(
                        "absolute inset-0 bg-green-800/70 group-hover:bg-green-800/50 transition-colors -z-10",
                        activeItem.id === item.id && "bg-green-800/30"
                    )}></div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    </Link>
                ))}
                </div>
            </div>
        </div>
    </section>
  );
}
