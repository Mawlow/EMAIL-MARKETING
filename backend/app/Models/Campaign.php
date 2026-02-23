<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use App\Models\SenderAccount;

class Campaign extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'subject',
        'body',
        'body_file',
        'template_key',
        'sender_account_id',
        'recipient_type',
        'contact_group_ids',
        'status',
        'total_recipients',
        'sent_count',
        'failed_count',
        'pending_count',
        'started_at',
        'completed_at',
        'scheduled_at',
    ];

    protected function casts(): array
    {
        return [
            'contact_group_ids' => 'array',
            'total_recipients' => 'integer',
            'sent_count' => 'integer',
            'failed_count' => 'integer',
            'pending_count' => 'integer',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'scheduled_at' => 'datetime',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function senderAccount(): BelongsTo
    {
        return $this->belongsTo(SenderAccount::class, 'sender_account_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(CampaignAttachment::class);
    }

    public function emailLogs(): HasMany
    {
        return $this->hasMany(CampaignEmailLog::class, 'campaign_id');
    }

    public function getBodyContent(): string
    {
        if ($this->body_file) {
            $disk = config('email_campaign.attachments_disk', 'local');
            $path = config('email_campaign.body_files_directory', 'campaign_bodies') . '/' . $this->body_file;
            return Storage::disk($disk)->get($path) ?: '';
        }
        return (string) $this->body;
    }

    public const STATUS_DRAFT = 'draft';
    public const STATUS_SCHEDULED = 'scheduled';
    public const STATUS_SENDING = 'sending';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    public const RECIPIENT_MARKETING = 'marketing_contacts';
    public const RECIPIENT_CONTACT_GROUPS = 'contact_groups';
    public const RECIPIENT_ALL_COMPANIES = 'all_companies';
    public const RECIPIENT_VERIFIED = 'verified_companies';
    public const RECIPIENT_ACTIVE_JOBS = 'companies_with_active_jobs';
}
