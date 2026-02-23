<?php

namespace App\Jobs;

use App\Models\Campaign;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendCampaignCompletionSmsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Campaign $campaign
    ) {}

    public function handle(): void
    {
        $company = $this->campaign->company;
        $phone = $company->sms_phone;
        if (! $phone) {
            return;
        }

        $message = sprintf(
            'Campaign "%s" completed. Sent: %d, Failed: %d, Total: %d.',
            $this->campaign->name,
            $this->campaign->sent_count,
            $this->campaign->failed_count,
            $this->campaign->total_recipients
        );

        $driver = config('services.sms.driver', 'log');
        if ($driver === 'log') {
            Log::info('SMS (campaign completion)', ['to' => $phone, 'message' => $message]);
            return;
        }

        $url = config('services.sms.url');
        $apiKey = config('services.sms.api_key');
        if ($url && $apiKey) {
            try {
                Http::withHeaders(['Authorization' => 'Bearer ' . $apiKey])
                    ->post($url, ['to' => $phone, 'message' => $message]);
            } catch (\Throwable $e) {
                Log::warning('SMS send failed: ' . $e->getMessage());
            }
        }
    }
}
