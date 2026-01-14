import { products } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function HomePage() {
  const coffeeBagsImage = PlaceHolderImages.find(p => p.id === 'hero-coffee-bags');
  const coffeeCupsImage = PlaceHolderImages.find(p => p.id === 'hero-coffee-cups');

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-2 md:gap-px bg-white">
        <div className="relative h-[49vh] bg-secondary/50 flex items-end p-8 md:p-12">
           {coffeeBagsImage && <Image
              src={coffeeBagsImage.imageUrl}
              alt={coffeeBagsImage.description}
              fill
              className="object-cover"
              data-ai-hint={coffeeBagsImage.imageHint}
            />}
            <div className="relative z-10 text-white w-full">
              <h1 className="font-headline text-3xl md:text-2xl font-bold">Coffee Bags</h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <Link href="#" className="text-sm hover:underline">Low MOQ Bags</Link>
                  <Link href="#" className="text-sm hover:underline">Premium Bags</Link>
                  <Link href="#" className="text-sm hover:underline">Pouches</Link>
              </div>
              <Link href="#" className="mt-6 inline-flex items-center text-sm font-semibold hover:underline">
                Shop now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
         <div className="relative h-[49vh] bg-secondary/50 flex items-end p-8 md:p-12">
           {coffeeCupsImage && <Image
              src={coffeeCupsImage.imageUrl}
              alt={coffeeCupsImage.description}
              fill
              className="object-cover"
              data-ai-hint={coffeeCupsImage.imageHint}
            />}
             <div className="relative z-10 text-white w-full">
              <h1 className="font-headline text-3xl md:text-2xl font-bold">Cups</h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <Link href="#" className="text-sm hover:underline">Hot Cups</Link>
                  <Link href="#" className="text-sm hover:underline">Clear Cups</Link>
                  <Link href="#" className="text-sm hover:underline">Ice Cream Cups</Link>
                   <Link href="#" className="text-sm hover:underline">Sleeves</Link>
              </div>
              <Link href="#" className="mt-6 inline-flex items-center text-sm font-semibold hover:underline">
                Shop now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
      </section>
    </>
  );
}
