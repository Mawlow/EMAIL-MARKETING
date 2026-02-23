<?php

namespace App\Services;

use App\Models\SenderAccount;

class SenderAccountRotationService
{
    /**
     * Get next active sender account for the company (round-robin by send_count).
     */
    public function getNextSender(int $companyId): ?SenderAccount
    {
        $sender = SenderAccount::where('company_id', $companyId)
            ->where('is_active', true)
            ->whereNotNull('host')
            ->whereNotNull('password_encrypted')
            ->orderBy('send_count')
            ->first();

        if ($sender) {
            $sender->increment('send_count');
        }

        return $sender;
    }
}
