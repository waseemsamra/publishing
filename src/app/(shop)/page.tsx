
import { products } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LowMinimumMustHaves } from '@/components/low-minimum-must-haves';
import { BrandStories } from '@/components/brand-stories';
import { PackagingAlliance } from '@/components/packaging-alliance';

const TrendingNowCard = ({ imageId, title }: { imageId: string, title: string }) => {
  const image = PlaceHolderImages.find(p => p.id === imageId);
  if (!image) return null;

  return (
    <Link href="#" className="relative group block overflow-hidden aspect-[4/3]">
      <Image
        src={image.imageUrl}
        alt={image.description}
        fill
        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        data-ai-hint={image.imageHint}
      />
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="absolute inset-0 flex items-end p-6">
        <h3 className="text-white font-headline text-2xl font-bold">{title}</h3>
      </div>
    </Link>
  );
};

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
              <h1 className="font-headline text-4xl md:text-5xl font-bold">Tissue Paper</h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <Link href="#" className="text-sm hover:underline">1 & 2 Color</Link>
                  <Link href="#" className="text-sm hover:underline">Multi-Color</Link>
                  <Link href="#" className="text-sm hover:underline">Kraft</Link>
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
              <h1 className="font-headline text-4xl md:text-5xl font-bold">Food Paper</h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <Link href="#" className="text-sm hover:underline">Food Paper</Link>
                  <Link href="#" className="text-sm hover:underline">Deli Paper</Link>
                  <Link href="#" className="text-sm hover:underline">Greaseproof</Link>
              </div>
              <Link href="#" className="mt-6 inline-flex items-center text-sm font-semibold hover:underline">
                Shop now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
      </section>
      
      <LowMinimumMustHaves />

      <section className="pt-12 md:pt-20">
        <div className="container">
            <h2 className="font-headline text-4xl font-bold mb-8">Trending now</h2>
        </div>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            <TrendingNowCard imageId="trending-tapes" title="Tapes" />
            <TrendingNowCard imageId="trending-coffee-bags" title="Coffee Bags" />
            <TrendingNowCard imageId="trending-product-boxes" title="Product Boxes" />
            <TrendingNowCard imageId="trending-totes" title="Totes" />
        </div>
      </section>

      <PackagingAlliance />

      <BrandStories />
    </>
  );
}