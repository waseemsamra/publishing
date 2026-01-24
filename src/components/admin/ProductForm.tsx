'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { doc, addDoc, updateDoc, collection, serverTimestamp, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { Product, Category, Size, Colour, PrintOption, WallType, Thickness, MaterialType, FinishType, Adhesive, Handle, Shape, Lid, Vendor, PackSize, Unit } from '@/lib/types';
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

const packPriceSchema = z.object({
    packSizeId: z.string(),
    price: z.coerce.number().min(0, "Price must be non-negative."),
});

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  pricingUnitId: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be a positive number').optional(),
  salePrice: z.coerce.number().min(0, 'Sale price must be positive').optional(),
  packPrices: z.array(packPriceSchema).optional(),
  vendor: z.string().optional(),
  sku: z.string().optional(),
  stock: z.coerce.number().optional(),
  productType: z.string().optional(),
  materials: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  sustainabilityImpact: z.string().optional(),
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
  lidIds: z.array(z.string()).optional(),
  packSizeIds: z.array(z.string()).optional(),
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
  { name: 'lids', field: 'lidIds' },
  { name: 'packSizes', field: 'packSizeIds' },
  { name: 'units', field: 'pricingUnitId' },
] as const;

type OptionType = Category | Size | Colour | PrintOption | WallType | Thickness | MaterialType | FinishType | Adhesive | Handle | Shape | Lid | PackSize | Unit;

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
          salePrice: product.salePrice ?? undefined,
          vendor: product.vendor ?? '',
          sku: product.sku ?? '',
          stock: product.stock ?? undefined,
          productType: product.productType ?? '',
          sustainabilityImpact: product.sustainabilityImpact ?? '',
          categoryIds: product.categoryIds ?? [],
          packPrices: product.packPrices ?? [],
          images: product.images?.map(img => ({
            id: img.id,
            imageUrl: img.imageUrl.replace(s3BaseUrl, ''),
            imageHint: img.imageHint || '',
            description: img.description || ''
          })) || [],
        }
      : {
          name: '',
          description: '',
          price: 0,
          vendor: '',
          sku: '',
          productType: '',
          sustainabilityImpact: '',
          images: [],
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
          lidIds: [],
          packSizeIds: [],
          packPrices: [],
          materials: [],
          certifications: [],
        },
  });
  
  const { fields: imagesField, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: 'images',
  });

  const { fields: packPriceFields, append: appendPackPrice, remove: removePackPrice } = useFieldArray({
      control: form.control,
      name: "packPrices"
  });
  
  const collections = useMemo(() => {
    if (!db) return {};
    return optionCollections.reduce((acc, { name }) => {
      acc[name] = collection(db, name);
      return acc;
    }, {} as Record<(typeof optionCollections)[number]['name'], ReturnType<typeof collection>>);
  }, [db]);
  
  const categoriesQuery = useMemo(() => {
    if(!collections.categories) return null;
    const q = query(collections.categories);
    (q as any).__memo = true;
    return q;
  }, [collections.categories]);

  const sizesQuery = useMemo(() => {
    if(!collections.sizes) return null;
    const q = query(collections.sizes);
    (q as any).__memo = true;
    return q;
  }, [collections.sizes]);

  const coloursQuery = useMemo(() => {
    if(!collections.colours) return null;
    const q = query(collections.colours);
    (q as any).__memo = true;
    return q;
  }, [collections.colours]);

  const printOptionsQuery = useMemo(() => {
    if(!collections.printOptions) return null;
    const q = query(collections.printOptions);
    (q as any).__memo = true;
    return q;
  }, [collections.printOptions]);
  
  const wallTypesQuery = useMemo(() => {
    if(!collections.wallTypes) return null;
    const q = query(collections.wallTypes);
    (q as any).__memo = true;
    return q;
  }, [collections.wallTypes]);
  
  const thicknessesQuery = useMemo(() => {
    if(!collections.thicknesses) return null;
    const q = query(collections.thicknesses);
    (q as any).__memo = true;
    return q;
  }, [collections.thicknesses]);

  const materialTypesQuery = useMemo(() => {
    if(!collections.materialTypes) return null;
    const q = query(collections.materialTypes);
    (q as any).__memo = true;
    return q;
  }, [collections.materialTypes]);
  
  const finishTypesQuery = useMemo(() => {
    if(!collections.finishTypes) return null;
    const q = query(collections.finishTypes);
    (q as any).__memo = true;
    return q;
  }, [collections.finishTypes]);

  const adhesivesQuery = useMemo(() => {
    if(!collections.adhesives) return null;
    const q = query(collections.adhesives);
    (q as any).__memo = true;
    return q;
  }, [collections.adhesives]);

  const handlesQuery = useMemo(() => {
    if(!collections.handles) return null;
    const q = query(collections.handles);
    (q as any).__memo = true;
    return q;
  }, [collections.handles]);

  const shapesQuery = useMemo(() => {
    if(!collections.shapes) return null;
    const q = query(collections.shapes);
    (q as any).__memo = true;
    return q;
  }, [collections.shapes]);

  const lidsQuery = useMemo(() => {
    if(!collections.lids) return null;
    const q = query(collections.lids);
    (q as any).__memo = true;
    return q;
  }, [collections.lids]);

  const packSizesQuery = useMemo(() => {
    if(!collections.packSizes) return null;
    const q = query(collections.packSizes);
    (q as any).__memo = true;
    return q;
  }, [collections.packSizes]);

  const vendorsQuery = useMemo(() => {
    if (!db) return null;
    const q = query(collection(db, 'vendors'));
    (q as any).__memo = true;
    return q;
  }, [db]);
  
  const unitsQuery = useMemo(() => {
      if(!collections.units) return null;
      const q = query(collections.units);
      (q as any).__memo = true;
      return q;
  }, [collections.units]);

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
  const { data: lids } = useCollection<Lid>(lidsQuery);
  const { data: packSizes } = useCollection<PackSize>(packSizesQuery);
  const { data: vendors } = useCollection<Vendor>(vendorsQuery);
  const { data: units } = useCollection<Unit>(unitsQuery);

  const selectedCategoryIds = form.watch("categoryIds") || [];

  const productTypeOptions = useMemo(() => {
    if (!categories) {
      return [];
    }
    const selectedCategoryNames = categories
      .filter(category => selectedCategoryIds.includes(category.id))
      .map(c => c.name);

    return selectedCategoryNames;
  }, [categories, selectedCategoryIds]);
  
  const productType = form.watch('productType');
  const pricingUnitId = form.watch('pricingUnitId');
  const selectedPackSizeIds = form.watch('packSizeIds', []);

  const isPackPricing = useMemo(() => {
      if (!units || !pricingUnitId) return false;
      const selectedUnit = units.find(u => u.id === pricingUnitId);
      return selectedUnit?.name.toLowerCase() === 'pack';
  }, [units, pricingUnitId]);

  useEffect(() => {
    if (productType && !productTypeOptions.includes(productType)) {
        form.setValue('productType', '', { shouldDirty: true });
    }
  }, [productType, productTypeOptions, form]);

  useEffect(() => {
    if (!isPackPricing) {
        form.setValue('packPrices', []);
    } else {
        const currentPackPriceIds = packPriceFields.map(f => f.packSizeId);
        
        // Add new ones
        selectedPackSizeIds.forEach(id => {
            if (!currentPackPriceIds.includes(id)) {
                appendPackPrice({ packSizeId: id, price: 0 });
            }
        });

        // Remove old ones
        const packPriceIdsToRemove: number[] = [];
        packPriceFields.forEach((field, index) => {
            if (!selectedPackSizeIds.includes(field.packSizeId)) {
                packPriceIdsToRemove.push(index);
            }
        });
        // remove in reverse order to avoid index shifting issues
        for (let i = packPriceIdsToRemove.length - 1; i >= 0; i--) {
            removePackPrice(packPriceIdsToRemove[i]);
        }
    }
}, [isPackPricing, selectedPackSizeIds, packPriceFields, appendPackPrice, removePackPrice, form]);

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
    lids: lids || [],
    packSizes: packSizes || [],
    units: units || [],
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
            price: data.price ?? 0,
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
                        <CardDescription>Set the name, description, and pricing for your product.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>
                        )} />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          <FormField
                            control={form.control}
                            name="pricingUnitId"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Pricing Unit</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a pricing unit" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {optionData.units.map((unit) => (
                                        <SelectItem key={unit.id} value={unit.id}>
                                        {unit.name}
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                          />
                        </div>

                        {!isPackPricing ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField control={form.control} name="price" render={({ field }) => (
                                  <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <FormField control={form.control} name="salePrice" render={({ field }) => (
                                  <FormItem><FormLabel>Sale Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                              )} />
                           </div>
                        ) : (
                          <div className="space-y-4">
                            <FormField
                                key="packSizeIds"
                                control={form.control}
                                name="packSizeIds"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Available Pack Sizes</FormLabel>
                                    <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                                      {optionData.packSizes.map((item: PackSize) => (
                                        <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(item.id)}
                                              onCheckedChange={(checked) => {
                                                const newValue = checked
                                                  ? [...(field.value || []), item.id]
                                                  : (field.value || []).filter((v) => v !== item.id);
                                                field.onChange(newValue);
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="font-normal">{item.quantity}</FormLabel>
                                        </FormItem>
                                      ))}
                                    </div>
                                  </FormItem>
                                )}
                              />

                              {selectedPackSizeIds.length > 0 && (
                                  <Card className="bg-muted/50">
                                    <CardHeader><CardTitle className="text-base">Pack Prices</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                      {packPriceFields.map((field, index) => {
                                        const packSize = optionData.packSizes.find(p => p.id === field.packSizeId);
                                        if (!packSize) return null;
                                        return (
                                          <FormField
                                            control={form.control}
                                            key={field.id}
                                            name={`packPrices.${index}.price`}
                                            render={({ field: priceField }) => (
                                              <FormItem>
                                                <FormLabel className="font-normal">Price for {packSize.quantity} pack</FormLabel>
                                                <FormControl><Input type="number" step="0.01" {...priceField} /></FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                        )
                                      })}
                                    </CardContent>
                                  </Card>
                                )}
                          </div>
                        )}
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
                                <FormField
                                    control={form.control}
                                    name={`images.${index}.imageHint`}
                                    render={({ field: imageHintField }) => (
                                        <FormControl>
                                            <Input {...imageHintField} value={imageHintField.value ?? ''} placeholder="AI Image Hint (e.g. coffee cup)" />
                                        </FormControl>
                                    )}
                                />
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
                        <CardDescription>Categorize and identify your product.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="vendor"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Vendor</FormLabel>
                                <Select 
                                    onValueChange={(value) => field.onChange(value === 'none' ? '' : value)} 
                                    value={field.value || 'none'}
                                >
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a vendor" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {vendors?.map((vendor) => (
                                        <SelectItem key={vendor.id} value={vendor.name}>
                                        {vendor.name}
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField control={form.control} name="sku" render={({ field }) => (
                            <FormItem><FormLabel>SKU</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="stock" render={({ field }) => (
                            <FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
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
                        <FormField
                            control={form.control}
                            name="productType"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Product Type</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value || ''}
                                    disabled={productTypeOptions.length === 0}
                                >
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a primary product type" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {productTypeOptions.length > 0 ? (
                                        productTypeOptions.map((catName) => (
                                        <SelectItem key={catName} value={catName}>
                                            {catName}
                                        </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="none" disabled>
                                        Select categories first
                                        </SelectItem>
                                    )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Product Attributes</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {optionCollections.filter(c => c.name !== 'categories' && c.name !== 'units' && c.name !== 'packSizes').map(({ name, field }) => (
                            (optionData as any)[name] && (optionData as any)[name].length > 0 && (
                                <FormField key={name} control={form.control} name={field as any} render={({ field: formField }) => (
                                    <FormItem>
                                        <FormLabel>{name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')}</FormLabel>
                                        <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                                            {(optionData as any)[name].map((item: OptionType) => (
                                                <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox checked={formField.value?.includes(item.id)} onCheckedChange={(checked) => (
                                                            checked ? formField.onChange([...(formField.value || []), item.id]) : formField.onChange(formField.value?.filter(v => v !== item.id))
                                                        )}/>
                                                    </FormControl>
                                                    <FormLabel className="font-normal">{'quantity' in item ? item.quantity : item.name}</FormLabel>
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
