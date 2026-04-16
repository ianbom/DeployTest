import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Boxes, CircleDollarSign, PackageCheck, PackageSearch, PackageX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';
import { index as productsIndex } from '@/routes/products';

type DashboardStats = {
    total_products: number;
    in_stock_products: number;
    out_of_stock_products: number;
    inventory_value_formatted: string;
};

type DashboardProduct = {
    id: number;
    name: string;
    description: string;
    stock: number;
    in_stock: boolean;
    price_formatted: string;
    image_url: string;
};

export default function Dashboard({
    stats,
    latest_products,
}: {
    stats: DashboardStats;
    latest_products: DashboardProduct[];
}) {
    return (
        <>
            <Head title="Dashboard Produk" />

            <div className="space-y-6 px-4 py-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Dashboard Produk
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Ringkasan stok dan produk terbaru.
                        </p>
                    </div>

                    <Button asChild>
                        <Link href={productsIndex()}>
                            <PackageSearch className="size-4" />
                            Kelola Produk
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Produk
                            </CardTitle>
                            <Boxes className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">
                                {stats.total_products}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Produk In Stock
                            </CardTitle>
                            <PackageCheck className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">
                                {stats.in_stock_products}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Produk Out of Stock
                            </CardTitle>
                            <PackageX className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">
                                {stats.out_of_stock_products}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Nilai Inventori
                            </CardTitle>
                            <CircleDollarSign className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">
                                {stats.inventory_value_formatted}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-3">
                        <div className="space-y-1">
                            <CardTitle>Produk Terbaru</CardTitle>
                            <CardDescription>
                                Menampilkan 6 produk terbaru dari katalog.
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={productsIndex()}>
                                Lihat semua
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        {latest_products.length === 0 && (
                            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                Belum ada data produk.
                            </div>
                        )}

                        {latest_products.map((product) => (
                            <div
                                key={product.id}
                                className="flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-center md:justify-between"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="h-12 w-12 rounded-md object-cover"
                                    />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">
                                            {product.name}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {product.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={
                                            product.in_stock
                                                ? 'default'
                                                : 'destructive'
                                        }
                                    >
                                        {product.in_stock
                                            ? `Stock: ${product.stock}`
                                            : 'Out of stock'}
                                    </Badge>
                                    <span className="text-sm font-medium">
                                        {product.price_formatted}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
