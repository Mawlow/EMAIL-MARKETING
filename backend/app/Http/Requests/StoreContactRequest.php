<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isCompany() && $this->user()?->company_id;
    }

    public function rules(): array
    {
        $companyId = $this->user()?->company_id;
        return [
            'email' => ['required', 'email'],
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'is_marketing' => ['boolean'],
            'contact_group_ids' => ['nullable', 'array'],
            'contact_group_ids.*' => ['integer', Rule::exists('contact_groups', 'id')->where('company_id', $companyId)],
        ];
    }
}
