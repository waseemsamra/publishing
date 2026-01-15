import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Manage your store's settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Settings content will go here. You can manage store information, payment gateways, and shipping options.</p>
        </CardContent>
      </Card>
    </div>
  );
}
