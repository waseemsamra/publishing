import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
}

export function ProductCard({ product, layout = 'grid' }: ProductCardProps) {
  const image = product.images?.[0];
  
  if (layout === 'list') {
      return (
        <Card className="flex flex-col md:flex-row overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl">
             <Link href={`/products/${product.id}`} className="block md:w-1/3">
                <div className="aspect-square relative h-full">
                    {image ? (
                        <Image
                        src={image.imageUrl}
                        alt={image.description || product.name}
                        fill
                        className="object-cover"
                        data-ai-hint={image.imageHint}
                        />
                    ) : (
                        <div className="bg-muted flex items-center justify-center h-full">
                            <span className="text-muted-foreground">No Image</span>
                        </div>
                    )}
                </div>
            </Link>
            <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                    <CardTitle className="font-headline text-xl mb-2 hover:text-primary transition-colors">
                        <Link href={`/products/${product.id}`}>{product.name}</Link>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>
                </div>
                 <div className="flex justify-between items-end mt-4">
                    <p className="text-xl font-semibold">£{product.price.toFixed(2)}</p>
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/products/${product.id}`}>View Details <ArrowRight className="ml-2 h-4 w-4"/></Link>
                    </Button>
                </div>
            </div>
        </Card>
      )
  }

  // Default grid layout
  return (
    <Card className="flex flex-col overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/products/${product.id}`} className="flex flex-col h-full">
        <CardHeader className="p-0">
          <div className="aspect-square relative">
            {image ? (
                <Image
                src={image.imageUrl}
                alt={image.description || product.name}
                fill
                className="object-cover"
                data-ai-hint={image.imageHint}
                />
            ) : (
                <div className="bg-muted flex items-center justify-center h-full">
                    <span className="text-muted-foreground">No Image</span>
                </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="font-headline text-lg mb-2">{product.name}</CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <p className="text-lg font-semibold">£{product.price.toFixed(2)}</p>
          <Button variant="outline" size="sm">View Details</Button>
        </CardFooter>
      </Link>
    </Card>
  );
}
