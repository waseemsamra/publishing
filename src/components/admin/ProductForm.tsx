'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { doc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { Product, Category, Size, Colour, PrintOption, WallType, Thickness, MaterialType, FinishType, Adhesive, Handle, Shape } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Trash2, PlusCircle, UploadCloud } from 'lucide-react';
import Image from 'next/image';

const s3BaseUrl = 'https://printinweb.s3.us-east-1.amazonaws.com';

const imageSchema = z.object({
  id: z.string(),
  imageUrl: z.string().min(1, "Image URL is required"),
  imageHint: z.string().optional(),
  description: z.string().optional(),
});

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
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
  images: z.array(imageSchema).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const optionCollections = [
  { name: 'categories', field: 'categoryIds' },
  { name: 'sizes', field: 'sizeIds' },
  { name: 'colours', field: 'colourIds' },
  { name: 'printOptions', field: 'printOptionIds' },
  { name: 'wallTypes', field: 'wallTypeIds' },
  { name: 'thicknesses', field: 'thicknessIds' },
  { name: 'materialTypes', field: 'materialTypeIds' },
  { name: 'finishTypes', field: 'finishTypeIds' },
  { name: 'adhesives', field: 'adhesiveIds' },
  { name: 'handles', field: 'handleIds' },
  { name: 'shapes', field: 'shapeIds' },
] as const;

type OptionType = Category | Size | Colour | PrintOption | WallType | Thickness | MaterialType | FinishType | Adhesive | Handle | Shape;

export function ProductForm({ product }: { product?: Product }) {
  const { toast } = useToast();
  const router = useRouter();
  const db = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          ...product,
          price: product.price || 0,
          images: product.images?.map(img => ({...img, imageUrl: img.imageUrl.replace(s3BaseUrl, '')})) || [],
        }
      : {
          name: '',
          description: '',
          price: 0,
          images: [],
          categoryIds: [],
          materials: [],
          certifications: [],
        },
  });
  
  const { fields: imagesField, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: 'images',
  });

  const collections = useMemo(() => {
    if (!db) return {};
    return optionCollections.reduce((acc, { name }) => {
      acc[name] = collection(db, name);
      return acc;
    }, {} as Record<(typeof optionCollections)[number]['name'], ReturnType<typeof collection>>);
  }, [db]);
  
  const categoriesQuery = useMemo(() => collections.categories ? query(collections.categories) : null, [collections.categories]);
  const sizesQuery = useMemo(() => collections.sizes ? query(collections.sizes) : null, [collections.sizes]);
  const coloursQuery = useMemo(() => collections.colours ? query(collections.colours) : null, [collections.colours]);
  const printOptionsQuery = useMemo(() => collections.printOptions ? query(collections.printOptions) : null, [collections.printOptions]);
  const wallTypesQuery = useMemo(() => collections.wallTypes ? query(collections.wallTypes) : null, [collections.wallTypes]);
  const thicknessesQuery = useMemo(() => collections.thicknesses ? query(collections.thicknesses) : null, [collections.thicknesses]);
  const materialTypesQuery = useMemo(() => collections.materialTypes ? query(collections.materialTypes) : null, [collections.materialTypes]);
  const finishTypesQuery = useMemo(() => collections.finishTypes ? query(collections.finishTypes) : null, [collections.finishTypes]);
  const adhesivesQuery = useMemo(() => collections.adhesives ? query(collections.adhesives) : null, [collections.adhesives]);
  const handlesQuery = useMemo(() => collections.handles ? query(collections.handles) : null, [collections.handles]);
  const shapesQuery = useMemo(() => collections.shapes ? query(collections.shapes) : null, [collections.shapes]);

  const { data: categories } = useCollection<Category>(categoriesQuery);
  const { data: sizes } = useCollection<Size>(sizesQuery);
  const { data: colours } = useCollection<Colour>(coloursQuery);
  const { data: printOptions } = useCollection<PrintOption>(printOptionsQuery);
  const { data: wallTypes } = useCollection<WallType>(wallTypesQuery);
  const { data: thicknesses } = useCollection<Thickness>(thicknessesQuery);
  const { data: materialTypes } = useCollection<MaterialType>(materialTypesQuery);
  const { data: finishTypes } = useCollection<FinishType>(finishTypesQuery);
  const { data: adhesives } = useCollection<Adhesive>(adhesivesQuery);
  const { data: handles } = useCollection<Handle>(handlesQuery);
  const { data: shapes } = useCollection<Shape>(shapesQuery);

  const optionData = {
    categories: categories || [],
    sizes: sizes || [],
    colours: colours || [],
    printOptions: printOptions || [],
    wallTypes: wallTypes || [],
    thicknesses: thicknesses || [],
    materialTypes: materialTypes || [],
    finishTypes: finishTypes || [],
    adhesives: adhesives || [],
    handles: handles || [],
    shapes: shapes || [],
  };

  const handleImageChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newImageFiles = [...imageFiles];
      newImageFiles[index] = file;
      setImageFiles(newImageFiles);

      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue(`images.${index}.imageUrl`, reader.result as string, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    if (!db) {
        toast({ variant: 'destructive', title: 'Error', description: 'Database not available.' });
        return;
    }
    setIsSubmitting(true);
    try {
        const uploadedImageUrls = await Promise.all(
            imagesField.map(async (image, index) => {
                const file = imageFiles[index];
                if (file) {
                    const formData = new FormData();
                    formData.append('file', file);
                    const response = await fetch('/image', { method: 'POST', body: formData });
                    if (!response.ok) throw new Error('Image upload failed');
                    const result = await response.json();
                    return result.url.replace(s3BaseUrl, '');
                }
                return image.imageUrl;
            })
        );
        
        const dataToSave = {
            ...data,
            images: data.images?.map((img, index) => ({...img, imageUrl: uploadedImageUrls[index] })),
            updatedAt: serverTimestamp(),
        };

      if (product?.id) {
        await updateDoc(doc(db, 'products', product.id), dataToSave);
        toast({ title: 'Success', description: 'Product updated.' });
      } else {
        await addDoc(collection(db, 'products'), { ...dataToSave, createdAt: serverTimestamp() });
        toast({ title: 'Success', description: 'New product added.' });
      }
      router.push('/admin/products');
      router.refresh();
    } catch (e: any) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="font-headline text-3xl font-bold">{product ? 'Edit Product' : 'Create New Product'}</h1>
            <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {product ? 'Save Changes' : 'Create Product'}
            </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Set the name, description, and price for your product.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="price" render={({ field }) => (
                            <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Images</CardTitle>
                        <CardDescription>Add or manage product images.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                        {imagesField.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-4 p-3 border rounded-lg">
                                <div className="w-20 h-20 relative bg-muted rounded-md overflow-hidden">
                                <Image 
                                    src={field.imageUrl?.startsWith('data:') ? field.imageUrl : field.imageUrl ? `${s3BaseUrl}${field.imageUrl}`: 'https://placehold.co/80x80'} 
                                    alt={field.description || `Image ${index + 1}`} 
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                                </div>
                                <div className="flex-1 space-y-2">
                                <Input type="file" accept="image/*" onChange={(e) => handleImageChange(index, e)} />
                                <Input {...form.register(`images.${index}.imageHint`)} placeholder="AI Image Hint (e.g. coffee cup)" />
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeImage(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => appendImage({ id: crypto.randomUUID(), imageUrl: '', imageHint: '', description: '' })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Image
                        </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Organization</CardTitle>
                        <CardDescription>Categorize your product.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="categoryIds"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Categories</FormLabel>
                                <div className="space-y-2 max-h-60 overflow-y-auto border p-2 rounded-md">
                                    {optionData.categories.map((item) => (
                                    <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(item.id)}
                                            onCheckedChange={(checked) => {
                                            return checked
                                                ? field.onChange([...(field.value || []), item.id])
                                                : field.onChange(field.value?.filter((value) => value !== item.id));
                                            }}
                                        />
                                        </FormControl>
                                        <FormLabel className="font-normal">{item.name}</FormLabel>
                                    </FormItem>
                                    ))}
                                </div>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Product Attributes</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {optionCollections.filter(c => c.name !== 'categories').map(({ name, field }) => (
                            optionData[name] && optionData[name].length > 0 && (
                                <FormField key={name} control={form.control} name={field} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')}</FormLabel>
                                        <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                                            {optionData[name].map((item: OptionType) => (
                                                <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => (
                                                            checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter(v => v !== item.id))
                                                        )}/>
                                                    </FormControl>
                                                    <FormLabel className="font-normal">{item.name}</FormLabel>
                                                </FormItem>
                                            ))}
                                        </div>
                                    </FormItem>
                                )}/>
                            )
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
      </form>
    </Form>
  );
}
