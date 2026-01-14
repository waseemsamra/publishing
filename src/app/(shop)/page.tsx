import { products } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <>
      <section className="bg-secondary/50">
        <div className="container grid md:grid-cols-2 gap-8 items-center py-20 md:py-32">
          <div className="text-center md:text-left">
            <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tight text-primary">
              The new standard in custom packaging
            </h1>
            <p className="mt-6 max-w-xl mx-auto md:mx-0 text-lg text-muted-foreground">
              Your one-stop shop for sustainable packaging, printing, and supplies.
            </p>
            <div className="mt-8 flex justify-center md:justify-start gap-4">
              <Button asChild size="lg">
                <Link href="#">Browse products</Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <Image
              src="https://images.unsplash.com/photo-1620293379421-5026a70423c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxwYWNrYWdpbmd8ZW58MHx8fHwxNzY4MzU5OTc5fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Custom packaging supplies"
              width={600}
              height={400}
              className="rounded-lg shadow-xl"
              data-ai-hint="packaging supplies"
            />
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl font-bold">Featured Products</h2>
          <p className="text-muted-foreground mt-2">Hand-picked items to help you live more sustainably.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}
