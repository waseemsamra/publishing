import Image from 'next/image';
import { notFound } from 'next/navigation';
import { products } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddToCartForm } from '@/components/add-to-cart-form';
import { CheckCircle, Leaf } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div>
          <Card className="overflow-hidden">
            <div className="aspect-square relative">
              <Image
                src={product.image.imageUrl}
                alt={product.image.description}
                fill
                className="object-cover"
                data-ai-hint={product.image.imageHint}
              />
            </div>
          </Card>
        </div>
        <div>
          <h1 className="font-headline text-4xl font-bold text-primary">{product.name}</h1>
          <p className="text-2xl font-semibold mt-2 mb-4">${product.price.toFixed(2)}</p>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          
          <AddToCartForm product={product} />

          <div className="mt-8 space-y-6">
            <div>
              <h3 className="font-headline text-lg font-semibold mb-2 flex items-center"><Leaf className="mr-2 h-5 w-5 text-green-600" />Sustainability Impact</h3>
              <p className="text-sm text-muted-foreground">{product.sustainabilityImpact}</p>
            </div>
            
            <div>
              <h3 className="font-headline text-lg font-semibold mb-2">Materials</h3>
              <div className="flex flex-wrap gap-2">
                {product.materials.map((material) => (
                  <Badge key={material} variant="secondary">{material}</Badge>
                ))}
              </div>
            </div>

            {product.certifications.length > 0 && (
              <div>
                <h3 className="font-headline text-lg font-semibold mb-2 flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-blue-600" />Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {product.certifications.map((cert) => (
                    <Badge key={cert} variant="outline">{cert}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}
