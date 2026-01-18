'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LowMinimumMustHaves } from '@/components/low-minimum-must-haves';
import { BrandStories } from '@/components/brand-stories';
import { PackagingAlliance } from '@/components/packaging-alliance';
import { PackagingPartner } from '@/components/packaging-partner';
import { PackagingForBrands } from '@/components/packaging-for-brands';
import { SignupBanner } from '@/components/signup-banner';

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

const HeroPanel = ({ title, links, imageSrc, imageHint, imageAlt, href }: { title: string; links: string[]; imageSrc: string; imageHint: string; imageAlt: string; href: string; }) => {
  return (
    <div className="relative group w-full h-[70vh] bg-cover bg-center flex items-end text-white">
      <Image src={imageSrc} alt={imageAlt} layout="fill" objectFit="cover" className="-z-10" data-ai-hint={imageHint}/>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
      <div className="relative z-10 p-8 md:p-12 w-full">
        <h2 className="font-headline text-4xl md:text-5xl font-bold">{title}</h2>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          {links.map((link) => (
            <Link key={link} href="#" className="text-sm font-semibold hover:underline">
              {link}
            </Link>
          ))}
        </div>
        <Link href={href} className="absolute bottom-8 right-8 md:bottom-12 md:right-12 flex items-center gap-2 text-sm font-semibold hover:underline">
          Shop now <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};


function TwoPanelHero() {
    const takeoutBagImage = PlaceHolderImages.find(p => p.id === 'hero-takeout-bag');
    const paperBowlsImage = PlaceHolderImages.find(p => p.id === 'hero-paper-bowls');

    if (!takeoutBagImage || !paperBowlsImage) {
        return null; // Or a loading/error state
    }

    return (
        <section className="grid grid-cols-1 md:grid-cols-2">
            <HeroPanel 
                title="Takeout Bags"
                links={["Takeout Bags", "SOS Bags", "Bakery Bags"]}
                imageSrc={takeoutBagImage.imageUrl}
                imageHint={takeoutBagImage.imageHint}
                imageAlt={takeoutBagImage.description}
                href="#"
            />
            <HeroPanel 
                title="Paper Bowls"
                links={["Round Bowls", "Rectangle Bowls", "Soup Bowls"]}
                imageSrc={paperBowlsImage.imageUrl}
                imageHint={paperBowlsImage.imageHint}
                imageAlt={paperBowlsImage.description}
                href="#"
            />
        </section>
    )
}


export default function HomePage() {
  return (
    <>
      <TwoPanelHero />
      
      <LowMinimumMustHaves />

      <section>
        <div className="container pt-12 md:pt-20">
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

      <PackagingPartner />

      <BrandStories />

      <PackagingForBrands />

      <SignupBanner />
    </>
  );
}
