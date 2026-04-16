<?php

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('authenticated users can view the product page', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('products.index'));

    $response->assertOk();
});

test('a product can be created with an image', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $image = UploadedFile::fake()->image('product.jpg');

    $response = $this
        ->actingAs($user)
        ->from(route('products.index'))
        ->post(route('products.store'), [
            'name' => 'Gaming Mouse',
            'description' => 'Wireless gaming mouse with RGB.',
            'price' => 349000,
            'stock' => 12,
            'image' => $image,
        ]);

    $response->assertRedirect(route('products.index'));

    $product = Product::query()->firstOrFail();

    expect($product->name)->toBe('Gaming Mouse');
    Storage::disk('public')->assertExists($product->image);
});

test('a product can be updated and its image replaced', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    Storage::disk('public')->put('products/old-image.jpg', 'old');

    $product = Product::factory()->create([
        'name' => 'Old Name',
        'image' => 'products/old-image.jpg',
    ]);

    $newImage = UploadedFile::fake()->image('new-image.jpg');

    $response = $this
        ->actingAs($user)
        ->from(route('products.index'))
        ->post(route('products.update', $product), [
            '_method' => 'put',
            'name' => 'New Name',
            'description' => $product->description,
            'price' => $product->price,
            'stock' => $product->stock,
            'image' => $newImage,
        ]);

    $response->assertRedirect(route('products.index'));

    $product->refresh();

    expect($product->name)->toBe('New Name');
    expect($product->image)->not->toBe('products/old-image.jpg');
    Storage::disk('public')->assertMissing('products/old-image.jpg');
    Storage::disk('public')->assertExists($product->image);
});

test('a product can be deleted along with its image', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    Storage::disk('public')->put('products/remove-me.jpg', 'remove');

    $product = Product::factory()->create([
        'image' => 'products/remove-me.jpg',
    ]);

    $response = $this
        ->actingAs($user)
        ->from(route('products.index'))
        ->delete(route('products.destroy', $product));

    $response->assertRedirect(route('products.index'));

    expect($product->fresh())->toBeNull();
    Storage::disk('public')->assertMissing('products/remove-me.jpg');
});

test('products can be filtered by stock status', function () {
    $user = User::factory()->create();

    Product::factory()->create([
        'name' => 'In Stock Product',
        'stock' => 10,
    ]);

    Product::factory()->create([
        'name' => 'Out of Stock Product',
        'stock' => 0,
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('products.index', ['stock_status' => 'out_of_stock']));

    $response
        ->assertOk()
        ->assertSee('Out of Stock Product')
        ->assertDontSee('In Stock Product');
});
