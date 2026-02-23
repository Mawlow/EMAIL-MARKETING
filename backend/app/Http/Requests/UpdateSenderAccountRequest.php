<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSenderAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isCompany() && $this->user()?->company_id;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'from_email' => ['sometimes', 'email'],
            'from_name' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string'],
            'host' => ['sometimes', 'string', 'max:255'],
            'port' => ['sometimes', 'integer', 'min:1', 'max:65535'],
            'encryption' => ['nullable', 'string', 'in:tls,ssl,null'],
            'username' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ];
    }
}
