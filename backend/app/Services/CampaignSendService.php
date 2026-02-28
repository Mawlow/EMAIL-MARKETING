<?php

namespace App\Services;

use App\Jobs\SendCampaignEmailJob;
use App\Models\Campaign;
use App\Models\CampaignEmailLog;
use Illuminate\Support\Facades\DB;

class CampaignSendService
{
    public function __construct(
        protected CampaignRecipientService $recipientService,
    ) {}

    public function dispatchCampaign(Campaign $campaign): void
    {
        $emails = $this->recipientService->getRecipientEmails($campaign);
        $emails = array_unique($emails);

        if (empty($emails)) {
            $campaign->update([
                'status' => Campaign::STATUS_COMPLETED,
                'completed_at' => now(),
                'total_recipients' => 0,
            ]);
            return;
        }

        $delaySeconds = config('email_campaign.delay_between_emails', 2);
        $campaign->update([
            'status' => Campaign::STATUS_SENDING,
            'total_recipients' => count($emails),
            'pending_count' => count($emails),
            'sent_count' => 0,
            'failed_count' => 0,
            'started_at' => now(),
        ]);

        DB::transaction(function () use ($campaign, $emails, $delaySeconds) {
            $delay = 0;
            foreach ($emails as $email) {
                CampaignEmailLog::create([
                    'campaign_id' => $campaign->id,
                    'recipient_email' => $email,
                    'status' => CampaignEmailLog::STATUS_PENDING,
                ]);
                SendCampaignEmailJob::dispatch($campaign->id, $email)->delay(now()->addSeconds($delay));
                $delay += $delaySeconds;
            }
        });
    }
}
