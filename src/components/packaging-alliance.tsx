
'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from './ui/button';
import Link from 'next/link';

export function PackagingAlliance() {
  const allianceImage = PlaceHolderImages.find(p => p.id === 'alliance-background');

  return (
    <section className="bg-[#464E33] text-white">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 items-center">
          <div className="relative aspect-[4/3] -my-12 lg:-my-24 lg:-ml-24">
            {allianceImage && (
              <Image
                src={allianceImage.imageUrl}
                alt={allianceImage.description}
                fill
                className="object-cover"
                data-ai-hint={allianceImage.imageHint}
              />
            )}
          </div>
          <div className="py-12 lg:py-24 lg:pl-16">
            <p className="font-semibold uppercase tracking-wider">noissue packaging alliance</p>
            <h2 className="font-headline text-4xl md:text-5xl font-bold mt-4">Making change together.</h2>
            <p className="mt-6 max-w-md text-lg text-white/80">
              Sport your support and join a global network of brands focused on making smarter, more sustainable choices.
            </p>
            <Button
              asChild
              className="mt-8 bg-[#B4D939] text-black hover:bg-[#B4D939]/90 rounded-full font-bold px-6 py-3"
            >
              <Link href="#">Download badge</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

    