<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Contact extends Model
{
    protected $fillable = [
        'company_id',
        'email',
        'first_name',
        'last_name',
        'phone',
        'custom_attributes',
        'is_marketing',
    ];

    protected function casts(): array
    {
        return [
            'custom_attributes' => 'array',
            'is_marketing' => 'boolean',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(ContactGroup::class, 'contact_contact_group')->withTimestamps();
    }
}
