<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isCompany() && $this->user()?->company_id;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'subject' => ['sometimes', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
            'template_key' => ['nullable', 'string', 'max:64'],
            'sender_account_id' => ['nullable', 'integer', Rule::exists('sender_accounts', 'id')->where('company_id', $this->user()->company_id)],
            'recipient_type' => ['sometimes', 'in:marketing_contacts,contact_groups,all_companies,verified_companies,companies_with_active_jobs'],
            'contact_group_ids' => ['nullable', 'array'],
            'contact_group_ids.*' => ['integer', Rule::exists('contact_groups', 'id')->where('company_id', $this->user()->company_id)],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240'],
        ];
    }
}
