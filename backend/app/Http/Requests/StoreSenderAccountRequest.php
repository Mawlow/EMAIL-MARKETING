<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSenderAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isCompany() && $this->user()?->company_id;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'from_email' => ['required', 'email'],
            'from_name' => ['nullable', 'string', 'max:255'],
            'password' => ['required', 'string'],
            'host' => ['required', 'string', 'max:255'],
            'port' => ['required', 'integer', 'min:1', 'max:65535'],
            'encryption' => ['nullable', 'string', 'in:tls,ssl,null'],
            'username' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ];
    }
}
