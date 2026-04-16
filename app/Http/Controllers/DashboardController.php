<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $totalProducts = Product::query()->count();
        $inStockProducts = Product::query()->where('stock', '>', 0)->count();
        $outOfStockProducts = Product::query()->where('stock', '<=', 0)->count();
        $inventoryValue = (float) Product::query()
            ->selectRaw('COALESCE(SUM(price * stock), 0) as total')
            ->value('total');

        $latestProducts = Product::query()
            ->latest()
            ->limit(6)
            ->get()
            ->map(function (Product $product): array {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'stock' => $product->stock,
                    'in_stock' => $product->stock > 0,
                    'price_formatted' => 'Rp '.number_format((float) $product->price, 2, ',', '.'),
                    'image_url' => asset('storage/'.$product->image),
                ];
            })
            ->values();

        return Inertia::render('dashboard', [
            'stats' => [
                'total_products' => $totalProducts,
                'in_stock_products' => $inStockProducts,
                'out_of_stock_products' => $outOfStockProducts,
                'inventory_value_formatted' => 'Rp '.number_format($inventoryValue, 2, ',', '.'),
            ],
            'latest_products' => $latestProducts,
        ]);
    }
}
