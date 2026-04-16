import { Head, Link, router, useForm } from '@inertiajs/react';
import { PackagePlus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Product = {
    id: number;
    name: string;
    description: string;
    price: string;
    price_formatted: string;
    stock: number;
    in_stock: boolean;
    image: string;
    image_url: string;
};

type ProductLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type ProductMeta = {
    from: number | null;
    to: number | null;
    total: number;
};

type ProductPagination = {
    data: Product[];
    links: ProductLink[];
    meta: ProductMeta;
};

type ProductFilters = {
    search: string;
    stock_status: string;
    min_price: string;
    max_price: string;
};

type ProductFormData = {
    name: string;
    description: string;
    price: string;
    stock: string;
    image: File | null;
};

type UpdateProductFormData = ProductFormData & {
    _method?: 'put';
};

export default function ProductsIndex({
    products,
    filters,
}: {
    products: ProductPagination;
    filters: ProductFilters;
}) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(
        null,
    );

    const filterForm = useForm<ProductFilters>({
        search: filters.search,
        stock_status: filters.stock_status || 'all',
        min_price: filters.min_price,
        max_price: filters.max_price,
    });

    const createForm = useForm<ProductFormData>({
        name: '',
        description: '',
        price: '',
        stock: '',
        image: null,
    });

    const editForm = useForm<UpdateProductFormData>({
        name: '',
        description: '',
        price: '',
        stock: '',
        image: null,
    });

    const deleteForm = useForm({});

    const submitFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        filterForm.get('/products', {
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        const defaults = {
            search: '',
            stock_status: 'all',
            min_price: '',
            max_price: '',
        };

        filterForm.setData(defaults);

        router.get('/products', defaults, {
            preserveScroll: true,
            replace: true,
        });
    };

    const submitCreate = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        createForm.post('/products', {
            forceFormData: true,
            preserveScroll: true,
            errorBag: 'createProduct',
            onSuccess: () => {
                setCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        editForm.setData({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: String(product.stock),
            image: null,
        });
        editForm.clearErrors();
        setEditOpen(true);
    };

    const submitEdit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!editingProduct) {
            return;
        }

        editForm.transform((data) => ({
            ...data,
            _method: 'put',
        }));

        editForm.post(`/products/${editingProduct.id}`, {
            forceFormData: true,
            preserveScroll: true,
            errorBag: 'updateProduct',
            onSuccess: () => {
                setEditOpen(false);
                setEditingProduct(null);
                editForm.reset();
            },
        });
    };

    const openDeleteModal = (product: Product) => {
        setDeletingProduct(product);
        setDeleteOpen(true);
    };

    const submitDelete = () => {
        if (!deletingProduct) {
            return;
        }

        deleteForm.delete(`/products/${deletingProduct.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteOpen(false);
                setDeletingProduct(null);
            },
        });
    };

    return (
        <>
            <Head title="Products" />

            <div className="space-y-6 px-4 py-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <Heading
                        title="Products"
                        description="Manage your product catalog with create, edit, delete, and filters."
                    />
                    <Button onClick={() => setCreateOpen(true)}>
                        <PackagePlus className="size-4" />
                        Create Product
                    </Button>
                </div>

                <form
                    onSubmit={submitFilters}
                    className="grid gap-3 rounded-xl border p-4 md:grid-cols-5"
                >
                    <Input
                        placeholder="Search name or description"
                        value={filterForm.data.search}
                        onChange={(event) =>
                            filterForm.setData('search', event.target.value)
                        }
                        className="md:col-span-2"
                    />
                    <Select
                        value={filterForm.data.stock_status}
                        onValueChange={(value) =>
                            filterForm.setData('stock_status', value)
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Stock status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All stock</SelectItem>
                            <SelectItem value="in_stock">In stock</SelectItem>
                            <SelectItem value="out_of_stock">
                                Out of stock
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Min price"
                        value={filterForm.data.min_price}
                        onChange={(event) =>
                            filterForm.setData('min_price', event.target.value)
                        }
                    />
                    <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Max price"
                        value={filterForm.data.max_price}
                        onChange={(event) =>
                            filterForm.setData('max_price', event.target.value)
                        }
                    />
                    <div className="flex gap-2 md:col-span-5">
                        <Button type="submit" disabled={filterForm.processing}>
                            Filter
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetFilters}
                            disabled={filterForm.processing}
                        >
                            Reset
                        </Button>
                    </div>
                </form>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {products.data.map((product) => (
                        <Card key={product.id} className="overflow-hidden py-0">
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-48 w-full object-cover"
                            />
                            <CardHeader>
                                <div className="flex items-center justify-between gap-2">
                                    <CardTitle>{product.name}</CardTitle>
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
                                </div>
                                <CardDescription>
                                    {product.price_formatted}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                {product.description}
                            </CardContent>
                            <CardFooter className="mt-auto gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditModal(product)}
                                >
                                    <Pencil className="size-4" />
                                    Edit
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => openDeleteModal(product)}
                                >
                                    <Trash2 className="size-4" />
                                    Delete
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {products.data.length === 0 && (
                    <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                        No products found.
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                        Showing {products.meta.from ?? 0} -{' '}
                        {products.meta.to ?? 0} of {products.meta.total}{' '}
                        products
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {products.links.map((link, index) => (
                            <Button
                                key={`${link.label}-${index}`}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                asChild={link.url !== null}
                                disabled={link.url === null}
                            >
                                {link.url ? (
                                    <Link
                                        href={link.url}
                                        preserveScroll
                                        preserveState
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ) : (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                )}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <Dialog
                open={createOpen}
                onOpenChange={(open) => {
                    setCreateOpen(open);

                    if (!open) {
                        createForm.reset();
                        createForm.clearErrors();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Product</DialogTitle>
                        <DialogDescription>
                            Add a new product to your catalog.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="create-name">Name</Label>
                            <Input
                                id="create-name"
                                value={createForm.data.name}
                                onChange={(event) =>
                                    createForm.setData(
                                        'name',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={createForm.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-description">
                                Description
                            </Label>
                            <textarea
                                id="create-description"
                                rows={4}
                                value={createForm.data.description}
                                onChange={(event) =>
                                    createForm.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                                className="rounded-md border border-input px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive"
                            />
                            <InputError
                                message={createForm.errors.description}
                            />
                        </div>
                        <div className="grid gap-2 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="create-price">Price</Label>
                                <Input
                                    id="create-price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={createForm.data.price}
                                    onChange={(event) =>
                                        createForm.setData(
                                            'price',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={createForm.errors.price} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="create-stock">Stock</Label>
                                <Input
                                    id="create-stock"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={createForm.data.stock}
                                    onChange={(event) =>
                                        createForm.setData(
                                            'stock',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={createForm.errors.stock} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-image">Image</Label>
                            <Input
                                id="create-image"
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                    createForm.setData(
                                        'image',
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                            />
                            <InputError message={createForm.errors.image} />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCreateOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                            >
                                Save Product
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={editOpen}
                onOpenChange={(open) => {
                    setEditOpen(open);

                    if (!open) {
                        setEditingProduct(null);
                        editForm.reset();
                        editForm.clearErrors();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                        <DialogDescription>
                            Update product information.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={editForm.data.name}
                                onChange={(event) =>
                                    editForm.setData('name', event.target.value)
                                }
                            />
                            <InputError message={editForm.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">
                                Description
                            </Label>
                            <textarea
                                id="edit-description"
                                rows={4}
                                value={editForm.data.description}
                                onChange={(event) =>
                                    editForm.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                                className="rounded-md border border-input px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive"
                            />
                            <InputError message={editForm.errors.description} />
                        </div>
                        <div className="grid gap-2 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-price">Price</Label>
                                <Input
                                    id="edit-price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editForm.data.price}
                                    onChange={(event) =>
                                        editForm.setData(
                                            'price',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={editForm.errors.price} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-stock">Stock</Label>
                                <Input
                                    id="edit-stock"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={editForm.data.stock}
                                    onChange={(event) =>
                                        editForm.setData(
                                            'stock',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={editForm.errors.stock} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-image">
                                Image (leave empty to keep current image)
                            </Label>
                            <Input
                                id="edit-image"
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                    editForm.setData(
                                        'image',
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                            />
                            <InputError message={editForm.errors.image} />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                            >
                                Update Product
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={deleteOpen}
                onOpenChange={(open) => {
                    setDeleteOpen(open);

                    if (!open) {
                        setDeletingProduct(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{' '}
                            <span className="font-semibold">
                                {deletingProduct?.name}
                            </span>
                            ? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={submitDelete}
                            disabled={deleteForm.processing}
                        >
                            Delete Product
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ProductsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Products',
            href: '/products',
        },
    ],
};
