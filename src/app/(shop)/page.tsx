import { products } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <section className="bg-secondary/50">
        <div className="container py-20 md:py-32 text-center">
          <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tight text-primary">
            Sustainable Shopping, Simplified.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Discover high-quality, eco-friendly products that are better for you and the planet. Join us in making a positive impact, one purchase at a time.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="#">Explore Products</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/sustainability-report">Our Impact</Link>
            </Button>
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
