<?php

namespace App\Mail;

use App\Models\Campaign;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class CampaignMailable extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Campaign $campaign,
        public string $recipientEmail,
        public ?string $fromEmail = null,
        public ?string $fromName = null,
        public ?int $emailLogId = null
    ) {}

    public function envelope(): Envelope
    {
        $from = $this->fromEmail
            ? new \Illuminate\Mail\Mailables\Address($this->fromEmail, $this->fromName ?? '')
            : null;
        return new Envelope(
            subject: $this->campaign->subject,
            from: $from,
        );
    }

    public function content(): Content
    {
        $html = $this->campaign->getBodyContent();
        $unsubscribeUrl = url(config('email_campaign.unsubscribe_path', 'unsubscribe') . '?email=' . urlencode($this->recipientEmail) . '&company=' . $this->campaign->company_id);
        $html = str_replace('{{unsubscribe_url}}', $unsubscribeUrl, $html);
        $html = str_replace('{{email}}', e($this->recipientEmail), $html);

        if ($this->emailLogId) {
            $trackingUrl = URL::temporarySignedRoute(
                'track.open',
                now()->addYears(5),
                ['log' => $this->emailLogId]
            );
            $pixel = '<img src="' . e($trackingUrl) . '" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />';
            if (stripos($html, '</body>') !== false) {
                $html = str_ireplace('</body>', $pixel . '</body>', $html);
            } else {
                $html = $html . $pixel;
            }
        }

        return new Content(
            htmlString: $html
        );
    }

    public function attachments(): array
    {
        $attachments = [];
        foreach ($this->campaign->attachments as $att) {
            $path = \Illuminate\Support\Facades\Storage::disk($att->disk)->path($att->path);
            if (file_exists($path)) {
                $attachments[] = \Illuminate\Mail\Mailables\Attachment::fromPath($path)->as($att->original_name);
            }
        }
        return $attachments;
    }
}
