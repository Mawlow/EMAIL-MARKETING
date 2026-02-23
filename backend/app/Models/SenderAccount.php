<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Crypt;

class SenderAccount extends Model
{
    protected $table = 'sender_accounts';

    protected $fillable = [
        'company_id',
        'name',
        'from_email',
        'from_name',
        'host',
        'port',
        'encryption',
        'username',
        'is_active',
        'send_count',
    ];

    protected $hidden = [
        'password_encrypted',
    ];

    protected function casts(): array
    {
        return [
            'port' => 'integer',
            'is_active' => 'boolean',
            'send_count' => 'integer',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function campaignEmailLogs(): HasMany
    {
        return $this->hasMany(CampaignEmailLog::class, 'sender_account_id');
    }

    public function setPasswordAttribute(?string $value): void
    {
        if ($value !== null && $value !== '') {
            $this->attributes['password_encrypted'] = Crypt::encryptString($value);
        }
    }

    public function getDecryptedPassword(): string
    {
        if (empty($this->password_encrypted)) {
            return '';
        }
        return Crypt::decryptString($this->password_encrypted);
    }

    public function getFromEmail(): string
    {
        return $this->from_email ?? config('mail.from.address', 'noreply@localhost');
    }

    public function getFromName(): string
    {
        return $this->from_name ?: $this->name ?: config('mail.from.name', config('app.name'));
    }
}
