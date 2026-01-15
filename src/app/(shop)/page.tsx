import { products } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LowMinimumMustHaves } from '@/components/low-minimum-must-haves';
import { PackagingPartner } from '@/components/packaging-partner';

const HBSurgerLogo = () => (
  <svg
    className="w-auto h-5 text-gray-500"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 190 32"
    fill="currentColor"
  >
    <path d="M21.57 23.37h5.18v-5.46h-5.18v5.46Zm-6.55-5.46v5.46h5.18v1.37H1.37v-1.37h5.18v-5.46H1.37v-1.37h18.83v1.37h-5.18Zm6.55-1.48v-5.22h5.18v5.22h-5.18Zm-6.55-5.22v5.22h5.18v1.37H1.37v-1.37h5.18v-5.22H1.37V9.82h18.83v1.37h-5.18Z"></path>
    <path d="M28.12 9.82v18.55h1.37V9.82h-1.37Z"></path>
    <path d="M49.62 25.1v1.9h-1.33l-3.37-3.96h-.06v3.96h-1.37V9.82h1.37v13.6l4.6-5.38h1.49l-4.91 5.71 5.11 7.9h-1.54l-4-6.27-1.07 1.25Z"></path>
    <path d="M57.62 10.3v1.34h3.33v15.36h1.37V11.64h3.34v-1.34h-8.04Z"></path>
    <path d="M66.42 9.82v18.55h1.37V9.82h-1.37Z"></path>
    <path d="M85.75 19.19v7.81h-1.37v-7.94l-5.48-8.01h1.56l4.6 6.78 4.59-6.78h1.56l-5.46 8.14Z"></path>
    <path d="M93.38 23.37h5.18v-5.46h-5.18v5.46Zm-6.55-5.46v5.46h5.18v1.37h-13.6v-1.37h5.18v-5.46h-5.18v-1.37h13.6v1.37h-5.18Z"></path>
    <path d="M100.91 9.82v18.55h1.37V9.82h-1.37Z"></path>
    <path d="M115.35 18.06v10.31h-1.37v-10.4l-5.32-8.24h1.59l4.4 6.95 4.4-6.95h1.59l-5.32 8.33.03-.05Z"></path>
    <path d="M129.5 28.37h1.37v-9.35l5.36-9.2h-1.6l-4.43 7.66-4.43-7.66h-1.6l5.36 9.2v9.35Z"></path>
    <path d="M149.71 19.39h-5.46v4.61h-1.37V9.82h6.73c2.47 0 4.25.92 4.25 2.94 0 1.29-.83 2.15-1.92 2.53l2.25 3.08h-1.59l-2-2.8h-1.9v4.82Zm-5.46-5.91v4.54h5.46c1.7 0 2.89-.66 2.89-2.27s-1.19-2.27-2.89-2.27h-5.46Z"></path>
    <path d="M157.97 23.37h5.18v-5.46h-5.18v5.46Zm-6.55-5.46v5.46h5.18v1.37h-13.6v-1.37h5.18v-5.46h-5.18v-1.37h13.6v1.37h-5.18Z"></path>
    <path d="M165.49 9.82v18.55h1.37V9.82h-1.37Z"></path>
    <path d="M184.28 17.92V9.82h-1.37v8.23l-5.78-8.23h-1.5l5.48 7.78-5.78 8.87h1.57l5-7.79 5.01 7.79h1.57l-5.79-8.91 5.6-7.74h-1.5l-4.82 6.66Z"></path>
  </svg>
);

const LolasLogo = () => (
  <svg
    className="w-auto h-8 text-gray-500"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 133 32"
    fill="currentColor"
  >
    <path d="M14.36 15.31V0H0v15.31C0 24.33 7.61 32 16.71 32h10.43V18.1H16.71c-1.7 0-2.35-.6-2.35-2.79M118.64 0h14.36v32h-14.36V0Z"></path>
    <path d="M49.29 0C39.33 0 32 8.34 32 17.57c0 9.57 6.81 14.43 17.29 14.43 9.86 0 17.43-4.86 17.43-14.43C66.71 8.34 59.21 0 49.29 0m.14 28.57c-2.36 0-3.43-3-3.43-11 0-8.21 1.07-11 3.43-11s3.43 2.79 3.43 11c0 8-1.07 11-3.43 11"></path>
    <path d="M96.14 0C86.18 0 78.86 8.34 78.86 17.57c0 9.57 6.81 14.43 17.28 14.43 9.86 0 17.43-4.86 17.43-14.43C113.57 8.34 106.07 0 96.14 0m.14 28.57c-2.36 0-3.43-3-3.43-11 0-8.21 1.07-11 3.43-11s3.43 2.79 3.43 11c0 8-1.07 11-3.43 11"></path>
    <path d="M85.43 23.5a5.5 5.5 0 0 1-5.14 4.08h-2.14a.48.48 0 0 1-.5-.5V5.14a.48.48 0 0 1 .5-.5h2.14a5.5 5.5 0 0 1 5.14 4.07.5.5 0 0 1-.36.65l-1.07.29a.5.5 0 0 0-.36.64v8.14a.5.5 0 0 0 .36.64l1.07.29a.5.5 0 0 1 .36.64M72.29 32h14.36V0H72.29v32Z"></path>
  </svg>
);

const NomaLogo = () => (
  <svg
    className="w-auto h-5 text-gray-500"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 21"
    fill="currentColor"
  >
    <path d="M0 .9h7.3v13.4L13.5.9h8.2L14 13.1v.2l8.1 6.8h-8.2L8 14.5V21H.1V.9h-.1zM38.8.9h7.3v13.4L52.3.9H60L52.5 13.1v.2L60.6 21H52L45 14.5V21h-7.3V.9h1.1zM69.9 21V.9h20.3V5H77v2.2h12.1v4.1H77v5.7h13.2v4.1H69.9v-.1zM100.3 21V.9h20.3V5h-13v2.2h12.1v4.1H87.3v5.7h13.2v4.1h-20.2v-.1z"></path>
    <path d="M26.4 1.1c5.8 0 10.5 4.7 10.5 10.5s-4.7 10.5-10.5 10.5S15.9 17.3 15.9 11.6s4.7-10.5 10.5-10.5zm0 16.8c3.5 0 6.3-2.8 6.3-6.3s-2.8-6.3-6.3-6.3-6.3 2.8-6.3 6.3 2.8 6.3 6.3 6.3zM69.6 1.1c5.8 0 10.5 4.7 10.5 10.5s-4.7 10.5-10.5 10.5-10.5-4.7-10.5-10.5S63.8 1.1 69.6 1.1zm0 16.8c3.5 0 6.3-2.8 6.3-6.3s-2.8-6.3-6.3-6.3-6.3 2.8-6.3 6.3 2.8 6.3 6.3 6.3zM32.5 13.9a3.1 3.1 0 0 0-3-3.2h-1.9v6.4h1.9c1.6 0 3-1.4 3-3.2z"></path>
  </svg>
);

const PattyAndBunLogo = () => (
  <svg
    className="w-auto h-8 text-gray-500"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 42"
    fill="currentColor"
  >
    <path d="M0 42V0h9.3c5 0 8.6 1.2 10.9 3.5 2.3 2.3 3.4 5.3 3.4 9s-1.1 6.7-3.4 9c-2.3 2.3-5.9 3.5-10.9 3.5H4v17H0zm4-31.1h5c3.5 0 6.1-.8 7.9-2.3 1.8-1.5 2.7-3.6 2.7-6.2 0-2.7-.9-4.8-2.7-6.3C14.9.6 12.3 0 9 0H4v10.9z"></path>
    <path d="M26.2 42V0h4v42h-4zM34.3 42V0h4v20.1l11.4-11.4h5.2l-11 11 12.2 12.3h-5.3L38.3 23.8v18.2h-4zM60.6 42V0h4v42h-4zM73.5 42V0h4v20.1l11.4-11.4h5.2l-11 11 12.2 12.3h-5.3L77.5 23.8v18.2h-4z"></path>
    <path d="M106.8 40.5c-4.1 1.9-8.4 2.9-12.9 2.9-6.4 0-11.7-1.7-15.8-5.1-4.1-3.4-6.2-7.8-6.2-13.2 0-5.4 2-9.8 6-13.1s9-5 14.8-5c4.6 0 9 .9 13.1 2.8l-1.8 3.5c-3.6-1.6-7.3-2.4-11.2-2.4-4.5 0-8.2 1.3-11.1 3.9-2.9 2.6-4.4 6-4.4 10.3 0 4.4 1.5 8 4.6 10.7 3.1 2.7 7 4 11.5 4 4.3 0 8.3-.9 11.9-2.8l1.7 3.6z"></path>
    <path d="M117.8 42V0h13.2c5.8 0 10.2 1.6 13.2 4.9s4.5 7.6 4.5 13c0 5.4-1.5 9.7-4.5 13s-7.4 4.9-13.2 4.9h-13.2zm4-38v34.1h8.7c4.6 0 8.2-1.3 10.8-3.8s3.9-6 3.9-10.4c0-4.5-1.3-8-3.9-10.4-2.6-2.4-6.2-3.6-10.8-3.6h-8.7z"></path>
    <path d="M151.2 42V0h4v18.3h9.4V0h4v42h-4V22.2h-9.4v19.8h-4zM172.9 42V0h4v20.1l11.4-11.4h5.2l-11 11 12.2 12.3h-5.3l-6.5-10.1v18.2h-4z"></path>
  </svg>
);

const TrendingNowCard = ({ imageId, title }: { imageId: string, title: string }) => {
  const image = PlaceHolderImages.find(p => p.id === imageId);
  if (!image) return null;

  return (
    <Link href="#" className="relative group block overflow-hidden">
      <Image
        src={image.imageUrl}
        alt={image.description}
        width={600}
        height={400}
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

      <section className="py-12 md:py-20">
        <div className="container">
          <h2 className="font-headline text-4xl font-bold mb-8">Trending now</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            <TrendingNowCard imageId="trending-tapes" title="Tapes" />
            <TrendingNowCard imageId="trending-coffee-bags" title="Coffee Bags" />
            <TrendingNowCard imageId="trending-product-boxes" title="Product Boxes" />
            <TrendingNowCard imageId="trending-totes" title="Totes" />
          </div>
        </div>
      </section>
      
      <PackagingPartner />

      <section className="bg-background">
        <div className="container py-12">
          <div className="flex justify-around items-center gap-8">
             <HBSurgerLogo />
             <LolasLogo />
             <NomaLogo />
             <PattyAndBunLogo />
          </div>
        </div>
      </section>
    </>
  );
}
