<?php

namespace App\Jobs;

use App\Models\Campaign;
use App\Services\CampaignSendService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class DispatchCampaignJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 600;

    public function __construct(public int $campaignId) {}

    public function handle(CampaignSendService $sendService): void
    {
        $campaign = Campaign::find($this->campaignId);
        if (!$campaign || $campaign->status !== Campaign::STATUS_SENDING) {
            return;
        }

        $sendService->executeDispatching($campaign);
    }
}
