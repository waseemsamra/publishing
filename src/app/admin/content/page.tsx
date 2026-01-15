
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function AdminContentPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Content Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
          <CardDescription>Manage your store's content.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content management features will go here. You can manage blog posts, pages, and other content.</p>
        </CardContent>
      </Card>
    </div>
  );
}
