<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SuppressionList extends Model
{
    protected $table = 'suppression_lists';

    protected $fillable = [
        'company_id',
        'email',
        'reason',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
