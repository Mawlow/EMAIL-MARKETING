<?php

namespace App\Http\Controllers;

use App\Models\CampaignEmailLog;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackOpenController extends Controller
{
    /**
     * Serve a 1x1 transparent GIF and log the email open.
     * Called when the tracking pixel in the campaign email is loaded by the recipient's client.
     */
    public function __invoke(Request $request)
    {
        $logId = $request->query('log');
        if ($logId) {
            $log = CampaignEmailLog::find($logId);
            if ($log && $log->status === CampaignEmailLog::STATUS_SENT && $log->opened_at === null) {
                $log->update(['opened_at' => now()]);
            }
        }

        $gif = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
        return new Response($gif, 200, [
            'Content-Type' => 'image/gif',
            'Content-Length' => (string) strlen($gif),
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
        ]);
    }
}
