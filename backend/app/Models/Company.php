<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'email',
        'phone',
        'sms_phone',
        'is_verified',
        'is_approved',
        'is_active',
        'settings',
    ];

    protected function casts(): array
    {
        return [
            'is_verified' => 'boolean',
            'is_approved' => 'boolean',
            'is_active' => 'boolean',
            'settings' => 'array',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function campaigns(): HasMany
    {
        return $this->hasMany(Campaign::class);
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class);
    }

    public function senderAccounts(): HasMany
    {
        return $this->hasMany(SenderAccount::class, 'company_id');
    }

    public function suppressionLists(): HasMany
    {
        return $this->hasMany(SuppressionList::class, 'company_id');
    }

    public function companyJobs(): HasMany
    {
        return $this->hasMany(CompanyJob::class, 'company_id');
    }
}
