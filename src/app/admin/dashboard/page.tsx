import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Package, Users, ShoppingCart } from "lucide-react";

const stats = [
    { title: "Total Revenue", value: "$45,231.89", change: "+20.1% from last month", icon: DollarSign },
    { title: "Total Orders", value: "1,204", change: "+180.1% from last month", icon: ShoppingCart },
    { title: "Active Users", value: "573", change: "+19% from last month", icon: Users },
    { title: "Products", value: "8", change: "Total products in store", icon: Package },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
            <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                </CardContent>
            </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
            <CardDescription>An overview of recent events in your store.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Coming soon: A feed of recent orders, new user sign-ups, and more.</p>
        </CardContent>
      </Card>
    </div>
  );
}
