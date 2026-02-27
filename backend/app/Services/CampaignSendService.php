<?php

namespace App\Services;

use App\Jobs\DispatchCampaignJob;
use App\Jobs\SendCampaignEmailJob;
use App\Models\Campaign;
use App\Models\CampaignEmailLog;
use Illuminate\Support\Facades\DB;

class CampaignSendService
{
    public function __construct(
        protected CampaignRecipientService $recipientService,
    ) {}

    /**
     * Start the dispatching process.
     * Updates status immediately and handles the heavy work in a background job.
     */
    public function dispatchCampaign(Campaign $campaign): void
    {
        $campaign->update(['status' => Campaign::STATUS_SENDING]);
        DispatchCampaignJob::dispatch($campaign->id);
    }

    /**
     * The actual logic to process recipients and queue emails.
     * Runs in the background to avoid timeouts.
     */
    public function executeDispatching(Campaign $campaign): void
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
            'total_recipients' => count($emails),
            'pending_count' => count($emails),
            'sent_count' => 0,
            'failed_count' => 0,
            'started_at' => now(),
        ]);

        $emailChunks = array_chunk($emails, 100);
        $delay = 0;
        foreach ($emailChunks as $chunk) {
            $logs = [];
            foreach ($chunk as $email) {
                $logs[] = [
                    'campaign_id' => $campaign->id,
                    'recipient_email' => $email,
                    'status' => CampaignEmailLog::STATUS_PENDING,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            CampaignEmailLog::insert($logs);
            
            foreach ($chunk as $email) {
                SendCampaignEmailJob::dispatch($campaign->id, $email)->delay(now()->addSeconds($delay));
                $delay += $delaySeconds;
            }
        }
    }
}
