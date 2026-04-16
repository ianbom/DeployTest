<?php

namespace App\Http\Requests\Products;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexProductRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'stock_status' => ['nullable', Rule::in(['all', 'in_stock', 'out_of_stock'])],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'min:0', 'gte:min_price'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * Get the validated filters with defaults.
     *
     * @return array{
     *     search: string,
     *     stock_status: string,
     *     min_price: string,
     *     max_price: string
     * }
     */
    public function filters(): array
    {
        $validated = $this->validated();

        return [
            'search' => (string) ($validated['search'] ?? ''),
            'stock_status' => (string) ($validated['stock_status'] ?? 'all'),
            'min_price' => (string) ($validated['min_price'] ?? ''),
            'max_price' => (string) ($validated['max_price'] ?? ''),
        ];
    }
}
