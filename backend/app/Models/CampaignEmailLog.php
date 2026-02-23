<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignEmailLog extends Model
{
    protected $table = 'campaign_email_logs';

    protected $fillable = [
        'campaign_id',
        'sender_account_id',
        'recipient_email',
        'status',
        'error_message',
        'retry_count',
        'sent_at',
        'opened_at',
    ];

    protected function casts(): array
    {
        return [
            'retry_count' => 'integer',
            'sent_at' => 'datetime',
            'opened_at' => 'datetime',
        ];
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function senderAccount(): BelongsTo
    {
        return $this->belongsTo(SenderAccount::class);
    }

    public const STATUS_PENDING = 'pending';
    public const STATUS_SENT = 'sent';
    public const STATUS_FAILED = 'failed';
}
