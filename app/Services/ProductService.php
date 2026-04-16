<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class ProductService
{
    public function paginate(array $filters, int $perPage = 12): LengthAwarePaginator
    {
        return Product::query()
            ->when(
                ($search = trim((string) ($filters['search'] ?? ''))) !== '',
                function (Builder $query) use ($search): void {
                    $query->where(function (Builder $builder) use ($search): void {
                        $builder
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('description', 'like', "%{$search}%");
                    });
                }
            )
            ->when(
                ($filters['stock_status'] ?? 'all') === 'in_stock',
                fn (Builder $query): Builder => $query->where('stock', '>', 0)
            )
            ->when(
                ($filters['stock_status'] ?? 'all') === 'out_of_stock',
                fn (Builder $query): Builder => $query->where('stock', '<=', 0)
            )
            ->when(
                ($filters['min_price'] ?? '') !== '',
                fn (Builder $query): Builder => $query->where('price', '>=', $filters['min_price'])
            )
            ->when(
                ($filters['max_price'] ?? '') !== '',
                fn (Builder $query): Builder => $query->where('price', '<=', $filters['max_price'])
            )
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $attributes, UploadedFile $image): Product
    {
        $attributes['image'] = $this->storeImage($image);

        return Product::create($attributes);
    }

    public function update(Product $product, array $attributes, ?UploadedFile $image = null): Product
    {
        if ($image !== null) {
            $this->deleteImage($product->image);
            $attributes['image'] = $this->storeImage($image);
        }

        $product->update($attributes);

        return $product->refresh();
    }

    public function delete(Product $product): void
    {
        $this->deleteImage($product->image);
        $product->delete();
    }

    private function storeImage(UploadedFile $image): string
    {
        return $image->store('products', 'public');
    }

    private function deleteImage(?string $imagePath): void
    {
        if ($imagePath === null || $imagePath === '') {
            return;
        }

        if (Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);
        }
    }
}
