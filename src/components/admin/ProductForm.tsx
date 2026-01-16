'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, updateDoc, serverTimestamp, query } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useToast } from '@/hooks/use-toast';

import type { Product, Size, Colour, PrintOption, WallType, Thickness, MaterialType, FinishType, Adhesive, Handle, Shape } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Save, ArrowLeft } from 'lucide-react';

const productFormSchema = z.object({
  name: z.string().min(1, 'Product name is required.'),
  description: z.string().min(1, 'Description is required.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  images: z.array(z.object({
    id: z.string(),
    imageUrl: z.string().optional(),
    description: z.string().optional(),
    imageHint: z.string().optional(),
  })).optional(),
  sustainabilityImpact: z.string().optional(),
  materials: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
  sizeIds: z.array(z.string()).optional(),
  colourIds: z.array(z.string()).optional(),
  printOptionIds: z.array(z.string()).optional(),
  wallTypeIds: z.array(z.string()).optional(),
  thicknessIds: z.array(z.string()).optional(),
  materialTypeIds: z.array(z.string()).optional(),
  finishTypeIds: z.array(z.string()).optional(),
  adhesiveIds: z.array(z.string()).optional(),
  handleIds: z.array(z.string()).optional(),
  shapeIds: z.array(z.string()).optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

type OptionCollection = 'sizes' | 'colours' | 'printOptions' | 'wallTypes' | 'thicknesses' | 'materialTypes' | 'finishTypes' | 'adhesives' | 'handles' | 'shapes';
type OptionType = Size | Colour | PrintOption | WallType | Thickness | MaterialType | FinishType | Adhesive | Handle | Shape;

function OptionsSection({
  control,
  collectionName,
  title,
  formFieldName,
}: {
  control: any;
  collectionName: OptionCollection;
  title: string;
  formFieldName: keyof ProductFormValues;
}) {
  const optionsQuery = useMemo(() => {
    const q = query(collection(db, collectionName));
    (q as any).__memo = true;
    return q;
  }, [collectionName]);

  const { data: options, isLoading } = useCollection<OptionType>(optionsQuery);

  return (
    <AccordionItem value={collectionName}>
      <AccordionTrigger>{title}</AccordionTrigger>
      <AccordionContent>
        {isLoading ? <Loader2 className="animate-spin" /> : (
          <FormField
            control={control}
            name={formFieldName}
            render={({ field }) => (
              <FormItem>
                <div className="space-y-2">
                  {options?.map((option) => (
                    <FormField
                      key={option.id}
                      control={control}
                      name={formFieldName}
                      render={({ field }) => {
                        return (
                          <FormItem key={option.id} className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), option.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value: string) => value !== option.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{option.name}</FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

const s3BaseUrl = 'https://printinweb.s3.us-east-1.amazonaws.com';

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product ? {
        ...product,
        images: product.images?.map(img => ({
            ...img,
            imageUrl: img.imageUrl?.replace(s3BaseUrl, ''),
        }))
    } : {
        name: '',
        description: '',
        price: 0,
        images: [{ id: '1', imageUrl: '', description: '', imageHint: '' }],
        sustainabilityImpact: '',
        materials: [],
        certifications: [],
        categoryIds: [],
        sizeIds: [],
        colourIds: [],
        printOptionIds: [],
        wallTypeIds: [],
        thicknessIds: [],
        materialTypeIds: [],
        finishTypeIds: [],
        adhesiveIds: [],
        handleIds: [],
        shapeIds: [],
    },
  });
  
  const imageUrlPath = form.watch('images.0.imageUrl');
  const previewUrl = imageUrlPath ? (imageUrlPath.startsWith('http') ? imageUrlPath : `${s3BaseUrl}${imageUrlPath}`) : null;

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true);
    try {
        const dataToSave = {
            ...data,
            images: data.images?.map(img => ({
                ...img,
                imageUrl: img.imageUrl ? (img.imageUrl.startsWith('http') ? img.imageUrl : `${s3BaseUrl}${img.imageUrl}`) : ''
            })),
            updatedAt: serverTimestamp(),
        };

        if (product?.id) {
            await updateDoc(doc(db, 'products', product.id), dataToSave);
            toast({ title: "Success", description: "Product updated successfully." });
        } else {
            await addDoc(collection(db, 'products'), { ...dataToSave, createdAt: serverTimestamp() });
            toast({ title: "Success", description: "Product created successfully." });
        }
        router.push('/admin/products');
        router.refresh();
    } catch (error: any) {
        console.error("Failed to save product:", error);
        toast({ variant: 'destructive', title: "Error", description: error.message || "Failed to save product." });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold">{product ? 'Edit Product' : 'Create New Product'}</h1>
            <p className="text-muted-foreground">Fill in the details below to {product ? 'update the' : 'add a new'} product.</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {product ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader><CardTitle>Product Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Images</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <FormField control={form.control} name="images.0.imageUrl" render={({ field }) => (
                    <FormItem><FormLabel>Primary Image Path</FormLabel><FormControl><Input placeholder="/testcup.webp" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                
                 {previewUrl && (
                    <div className="mt-4">
                    <FormLabel>Image Preview</FormLabel>
                    <div className="mt-2 aspect-square w-48 relative rounded-md border overflow-hidden">
                        <Image
                            src={previewUrl}
                            alt="Product image preview"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                    </div>
                )}
                
                <FormField control={form.control} name="images.0.description" render={({ field }) => (
                    <FormItem><FormLabel>Image Description (for accessibility)</FormLabel><FormControl><Input placeholder="e.g., A stylish blue water bottle" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="images.0.imageHint" render={({ field }) => (
                    <FormItem><FormLabel>AI Image Hint (1-2 keywords)</FormLabel><FormControl><Input placeholder="e.g., water bottle" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>
             <Card>
              <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
              <CardContent>
                <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Sustainability</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <FormField control={form.control} name="sustainabilityImpact" render={({ field }) => (
                    <FormItem><FormLabel>Sustainability Impact</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="materials" render={({ field }) => (
                    <FormItem><FormLabel>Materials (comma-separated)</FormLabel><FormControl><Input {...field} onChange={e => field.onChange(e.target.value.split(',').map(s=>s.trim()))} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="certifications" render={({ field }) => (
                    <FormItem><FormLabel>Certifications (comma-separated)</FormLabel><FormControl><Input {...field} onChange={e => field.onChange(e.target.value.split(',').map(s=>s.trim()))} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader><CardTitle>Product Options</CardTitle><CardDescription>Select all relevant options.</CardDescription></CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  <OptionsSection control={form.control} collectionName="sizes" title="Sizes" formFieldName="sizeIds" />
                  <OptionsSection control={form.control} collectionName="colours" title="Colours" formFieldName="colourIds" />
                  <OptionsSection control={form.control} collectionName="printOptions" title="Print Options" formFieldName="printOptionIds" />
                  <OptionsSection control={form.control} collectionName="wallTypes" title="Wall Types" formFieldName="wallTypeIds" />
                  <OptionsSection control={form.control} collectionName="thicknesses" title="Thicknesses" formFieldName="thicknessIds" />
                  <OptionsSection control={form.control} collectionName="materialTypes" title="Material Types" formFieldName="materialTypeIds" />
                  <OptionsSection control={form.control} collectionName="finishTypes" title="Finish Types" formFieldName="finishTypeIds" />
                  <OptionsSection control={form.control} collectionName="adhesives" title="Adhesives" formFieldName="adhesiveIds" />
                  <OptionsSection control={form.control} collectionName="handles" title="Handles" formFieldName="handleIds" />
                  <OptionsSection control={form.control} collectionName="shapes" title="Shapes" formFieldName="shapeIds" />
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
