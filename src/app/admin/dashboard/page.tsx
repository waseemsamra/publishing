'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, Package, Users, ShoppingCart } from 'lucide-react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useMemoFirebase } from '@/firebase/provider';
import { useFirestore } from '@/firebase/firestore/use-auth';
import { collection } from 'firebase/firestore';

export default function DashboardPage() {
  const firestore = useFirestore();
  const productsQuery = useMemoFirebase(
    () => collection(firestore, 'products'),
    [firestore]
  );
  const ordersQuery = useMemoFirebase(
    () => collection(firestore, 'orders'),
    [firestore]
  );
  const usersQuery = useMemoFirebase(
    () => collection(firestore, 'users'),
    [firestore]
  );

  const { data: products } = useCollection(productsQuery);
  const { data: orders } = useCollection(ordersQuery);
  const { data: users } = useCollection(usersQuery);

  const totalRevenue =
    orders?.reduce((acc, order) => acc + order.totalAmount, 0) || 0;

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      change: '+20.1% from last month',
      icon: DollarSign,
    },
    {
      title: 'Total Orders',
      value: orders?.length || 0,
      change: '+180.1% from last month',
      icon: ShoppingCart,
    },
    {
      title: 'Active Users',
      value: users?.length || 0,
      change: '+19% from last month',
      icon: Users,
    },
    {
      title: 'Products',
      value: products?.length || 0,
      change: 'Total products in store',
      icon: Package,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
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
          <CardDescription>
            An overview of recent events in your store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Coming soon: A feed of recent orders, new user sign-ups, and more.</p>
        </CardContent>
      </Card>
    </div>
  );
}
