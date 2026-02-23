<?php

namespace App\Jobs;

use App\Mail\CampaignMailable;
use App\Models\Campaign;
use App\Models\CampaignEmailLog;
use App\Models\SenderAccount;
use App\Services\SenderAccountRotationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendCampaignEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public int $campaignId,
        public string $recipientEmail
    ) {}

    public function handle(SenderAccountRotationService $rotation): void
    {
        $campaign = Campaign::with(['company', 'attachments'])->find($this->campaignId);
        if (! $campaign || $campaign->status === Campaign::STATUS_CANCELLED) {
            return;
        }

        $log = CampaignEmailLog::where('campaign_id', $this->campaignId)
            ->where('recipient_email', $this->recipientEmail)
            ->first();

        if (! $log || $log->status === CampaignEmailLog::STATUS_SENT) {
            return;
        }

        $sender = null;
        if ($campaign->sender_account_id) {
            $sender = SenderAccount::where('id', $campaign->sender_account_id)
                ->where('company_id', $campaign->company_id)
                ->where('is_active', true)
                ->whereNotNull('host')
                ->whereNotNull('password_encrypted')
                ->first();
        }
        if (! $sender) {
            $sender = $rotation->getNextSender($campaign->company_id);
        }
        $useDefaultMailer = app()->environment('local') && config('email_campaign.use_default_mailer_in_local', true);

        if (! $sender && ! $useDefaultMailer) {
            $log->update([
                'status' => CampaignEmailLog::STATUS_FAILED,
                'error_message' => 'No active SMTP sender account.',
            ]);
            $this->incrementFailed($campaign);
            $this->checkCompletion($campaign);
            return;
        }

        $fromEmail = $sender?->getFromEmail() ?? config('mail.from.address', 'noreply@localhost');
        $fromName = $sender?->getFromName() ?? config('mail.from.name', config('app.name'));

        try {
            $mailable = new CampaignMailable($campaign, $this->recipientEmail, $fromEmail, $fromName, $log->id);
            if ($useDefaultMailer) {
                Mail::mailer(config('mail.default'))->to($this->recipientEmail)->send($mailable);
            } else {
                $mailerKey = $this->registerMailer($sender);
                Mail::mailer($mailerKey)->to($this->recipientEmail)->send($mailable);
            }

            $log->update([
                'status' => CampaignEmailLog::STATUS_SENT,
                'sender_account_id' => $sender?->id,
                'sent_at' => now(),
            ]);
            $this->incrementSent($campaign);
        } catch (\Throwable $e) {
            $retryCount = $log->retry_count + 1;
            $maxRetries = config('email_campaign.max_send_retries', 3);
            $log->update([
                'status' => $retryCount >= $maxRetries ? CampaignEmailLog::STATUS_FAILED : CampaignEmailLog::STATUS_PENDING,
                'error_message' => $this->normalizeSmtpErrorMessage($e->getMessage()),
                'retry_count' => $retryCount,
                'sender_account_id' => $sender?->id,
            ]);
            if ($retryCount >= $maxRetries) {
                $this->incrementFailed($campaign);
            } else {
                self::dispatch($this->campaignId, $this->recipientEmail)->delay(now()->addMinutes(5));
            }
            $this->checkCompletion($campaign);
            return;
        }

        $this->checkCompletion($campaign);
    }

    protected function registerMailer(SenderAccount $sender): string
    {
        $key = 'campaign_sender_' . $sender->id . '_' . uniqid();
        $mailers = config('mail.mailers', []);
        $mailers[$key] = [
            'transport' => 'smtp',
            'host' => $sender->host,
            'port' => (int) $sender->port,
            'encryption' => $sender->encryption === 'null' || $sender->encryption === '' ? null : $sender->encryption,
            'username' => $sender->username ?: $sender->from_email,
            'password' => $sender->getDecryptedPassword(),
            'timeout' => null,
        ];
        config(['mail.mailers' => $mailers]);
        return $key;
    }

    protected function incrementSent(Campaign $campaign): void
    {
        $campaign->decrement('pending_count');
        $campaign->increment('sent_count');
    }

    protected function incrementFailed(Campaign $campaign): void
    {
        $campaign->decrement('pending_count');
        $campaign->increment('failed_count');
    }

    protected function checkCompletion(Campaign $campaign): void
    {
        $campaign->refresh();
        if ($campaign->pending_count <= 0) {
            $campaign->update([
                'status' => Campaign::STATUS_COMPLETED,
                'completed_at' => now(),
            ]);
            if (config('email_campaign.sms_on_completion') && $campaign->company->sms_phone) {
                dispatch(new \App\Jobs\SendCampaignCompletionSmsJob($campaign));
            }
        }
    }

    protected function normalizeSmtpErrorMessage(string $message): string
    {
        if (stripos($message, 'Daily user sending limit exceeded') !== false
            || stripos($message, '550-5.4.5') !== false && stripos($message, 'sending limit') !== false) {
            return 'Gmail daily sending limit exceeded. Use a test SMTP (e.g. Mailtrap) or try again tomorrow.';
        }
        if (stripos($message, 'Username and Password not accepted') !== false
            || stripos($message, '535-5.7.8') !== false
            || stripos($message, 'Authentication failed') !== false) {
            return 'SMTP authentication failed. Check sender username and app password.';
        }
        if (stripos($message, 'Connection refused') !== false || stripos($message, 'Connection timed out') !== false) {
            return 'Could not connect to SMTP server. Check host, port, and firewall.';
        }
        if (stripos($message, 'Expected response code "354"') !== false) {
            return 'SMTP server rejected the message. Check recipient and sender limits (e.g. Gmail daily limit).';
        }
        return $message;
    }
}
