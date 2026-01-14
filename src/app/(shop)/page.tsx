import { products } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-2 md:gap-px bg-white">
        <div className="relative h-[60vh] md:h-[49vh] bg-secondary/50 flex items-end p-8 md:p-12">
           <Image
              src="https://images.unsplash.com/photo-1594589278946-0b5c1f3a5a7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxjb2ZmZWUlMjBiYWdzfGVufDB8fHx8MTc2ODc1NjUwMHww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Coffee bags"
              fill
              className="object-cover"
              data-ai-hint="coffee bags"
            />
            <div className="relative z-10 text-white w-full">
              <h1 className="font-headline text-5xl md:text-4xl font-bold">Coffee Bags</h1>
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
         <div className="relative h-[60vh] md:h-[49vh] bg-secondary/50 flex items-end p-8 md:p-12">
           <Image
              src="https://images.unsplash.com/photo-1579781403233-10d24f1e319b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxjb2ZmZWUlMjBjdXBzfGVufDB8fHx8MTc2ODc1NjUwMHww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Coffee cups"
              fill
              className="object-cover"
              data-ai-hint="coffee cups"
            />
             <div className="relative z-10 text-white w-full">
              <h1 className="font-headline text-5xl md:text-4xl font-bold">Cups</h1>
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
