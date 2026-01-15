import { SiteFooter } from "@/components/site-footer";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
