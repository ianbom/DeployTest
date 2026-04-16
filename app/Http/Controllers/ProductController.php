<?php

namespace App\Http\Controllers;

use App\Http\Requests\Products\IndexProductRequest;
use App\Http\Requests\Products\StoreProductRequest;
use App\Http\Requests\Products\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(IndexProductRequest $request, ProductService $productService): Response
    {
        $filters = $request->filters();
        $products = $productService->paginate($filters);
        $productData = ProductResource::collection($products)->response()->getData(true);

        return Inertia::render('products/index', [
            'products' => [
                'data' => $productData['data'],
                'links' => $productData['meta']['links'] ?? [],
                'meta' => [
                    'from' => $productData['meta']['from'] ?? null,
                    'to' => $productData['meta']['to'] ?? null,
                    'total' => $productData['meta']['total'] ?? 0,
                ],
            ],
            'filters' => $filters,
        ]);
    }

    public function store(StoreProductRequest $request, ProductService $productService): RedirectResponse
    {
        /** @var UploadedFile $image */
        $image = $request->file('image');

        $productService->create(
            $request->safe()->except('image'),
            $image
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Product created successfully.')]);

        return back();
    }

    public function update(
        UpdateProductRequest $request,
        Product $product,
        ProductService $productService
    ): RedirectResponse {
        $productService->update(
            $product,
            $request->safe()->except('image'),
            $request->file('image')
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Product updated successfully.')]);

        return back();
    }

    public function destroy(Product $product, ProductService $productService): RedirectResponse
    {
        $productService->delete($product);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Product deleted successfully.')]);

        return back();
    }
}
