<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isCompany() && $this->user()?->company_id;
    }

    public function rules(): array
    {
        $threshold = config('email_campaign.body_file_threshold', 512 * 1024);
        return [
            'name' => ['required', 'string', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
            'template_key' => ['nullable', 'string', 'max:64'],
            'sender_account_id' => ['nullable', 'integer', Rule::exists('sender_accounts', 'id')->where('company_id', fn () => $this->user()->company_id)],
            'recipient_type' => ['required', 'in:marketing_contacts,contact_groups,all_companies,verified_companies,companies_with_active_jobs'],
            'contact_group_ids' => ['nullable', 'array'],
            'contact_group_ids.*' => ['integer', Rule::exists('contact_groups', 'id')->where('company_id', fn () => $this->user()->company_id)],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240'], // 10MB per file
        ];
    }
}
