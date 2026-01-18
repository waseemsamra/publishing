'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function AdminHeroSlidesPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Hero Slides</h1>
      <Card>
        <CardHeader>
          <CardTitle>Manage Hero Slides</CardTitle>
          <CardDescription>Add, edit, or remove slides from your homepage hero section.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Hero slide management features will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
