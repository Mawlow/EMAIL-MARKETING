<?php

namespace App\Services;

use App\Models\Campaign;
use App\Models\CampaignAttachment;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class CampaignBodyService
{
    public function storeBody(Campaign $campaign, ?string $body): void
    {
        $threshold = config('email_campaign.body_file_threshold', 512 * 1024);
        $disk = config('email_campaign.attachments_disk', 'local');
        $dir = config('email_campaign.body_files_directory', 'campaign_bodies');

        if ($body === null || $body === '') {
            $campaign->update(['body' => null, 'body_file' => null]);
            return;
        }

        if (strlen($body) > $threshold) {
            $path = $dir . '/' . $campaign->id . '_' . uniqid() . '.html';
            Storage::disk($disk)->put($path, $body);
            $campaign->update(['body' => null, 'body_file' => basename($path)]);
        } else {
            if ($campaign->body_file) {
                Storage::disk($disk)->delete($dir . '/' . $campaign->body_file);
            }
            $campaign->update(['body' => $body, 'body_file' => null]);
        }
    }

    public function storeAttachments(Campaign $campaign, array $files): void
    {
        $disk = config('email_campaign.attachments_disk', 'local');
        $dir = config('email_campaign.attachments_directory', 'campaign_attachments') . '/' . $campaign->id;

        foreach ($files as $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }
            $path = $file->store($dir, $disk);
            CampaignAttachment::create([
                'campaign_id' => $campaign->id,
                'disk' => $disk,
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
            ]);
        }
    }
}
