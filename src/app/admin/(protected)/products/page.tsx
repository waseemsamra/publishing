'use client';

import { useState } from 'react';
import { products } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';

export default function AdminProductsPage() {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedProductIds(products.map((p) => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProductIds((prev) => [...prev, productId]);
    } else {
      setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const allSelected =
    selectedProductIds.length > 0 &&
    selectedProductIds.length === products.length;
  const someSelected =
    selectedProductIds.length > 0 &&
    selectedProductIds.length < products.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-headline text-3xl font-bold">Products</h1>
        <Button>Add Product</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>Manage your store's products.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    onCheckedChange={handleSelectAll}
                    checked={
                      allSelected ? true : someSelected ? 'indeterminate' : false
                    }
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  Image
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow
                  key={product.id}
                  data-state={
                    selectedProductIds.includes(product.id) && 'selected'
                  }
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedProductIds.includes(product.id)}
                      onCheckedChange={(checked) =>
                        handleSelectProduct(product.id, !!checked)
                      }
                      aria-label={`Select product ${product.name}`}
                    />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={product.name}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={product.image.imageUrl}
                      width="64"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
