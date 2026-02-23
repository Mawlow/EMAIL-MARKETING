<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Services\CampaignBodyService;
use App\Services\CampaignSendService;
use App\Http\Requests\StoreCampaignRequest;
use App\Http\Requests\UpdateCampaignRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CampaignController extends Controller
{
    public function __construct(
        protected CampaignBodyService $bodyService,
        protected CampaignSendService $sendService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $query = Campaign::where('company_id', $companyId);
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        $campaigns = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 15));
        return response()->json($campaigns);
    }

    public function store(StoreCampaignRequest $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $data = $request->validated();
        $body = $data['body'] ?? null;
        $attachments = $request->file('attachments', []);
        unset($data['body'], $data['attachments']);

        $campaign = Campaign::create(array_merge($data, [
            'company_id' => $companyId,
            'status' => Campaign::STATUS_DRAFT,
        ]));

        $this->bodyService->storeBody($campaign, $body);
        if (! empty($attachments)) {
            $this->bodyService->storeAttachments($campaign, is_array($attachments) ? $attachments : [$attachments]);
        }

        $campaign->load('attachments');
        return response()->json($campaign, 201);
    }

    public function show(Request $request, Campaign $campaign): JsonResponse
    {
        if ($campaign->company_id !== $request->user()->company_id) {
            abort(404);
        }
        $campaign->load('attachments');
        return response()->json($campaign);
    }

    public function update(UpdateCampaignRequest $request, Campaign $campaign): JsonResponse
    {
        if ($campaign->company_id !== $request->user()->company_id) {
            abort(404);
        }
        if ($campaign->status === Campaign::STATUS_SENDING) {
            return response()->json(['message' => 'Campaign cannot be edited while sending.'], 422);
        }

        $data = $request->validated();
        $body = $data['body'] ?? null;
        $attachments = $request->file('attachments', []);
        unset($data['body'], $data['attachments']);

        $campaign->update($data);
        if (array_key_exists('body', $request->all())) {
            $this->bodyService->storeBody($campaign, $body);
        }
        if (! empty($attachments)) {
            $this->bodyService->storeAttachments($campaign, is_array($attachments) ? $attachments : [$attachments]);
        }

        $campaign->load('attachments');
        return response()->json($campaign);
    }

    public function destroy(Request $request, Campaign $campaign): JsonResponse
    {
        if ($campaign->company_id !== $request->user()->company_id) {
            abort(404);
        }
        if ($campaign->status === Campaign::STATUS_SENDING) {
            return response()->json(['message' => 'Cannot delete campaign while sending.'], 422);
        }

        $campaign->emailLogs()->delete();
        foreach ($campaign->attachments as $att) {
            Storage::disk($att->disk)->delete($att->path);
        }
        $campaign->attachments()->delete();
        if ($campaign->body_file) {
            $dir = config('email_campaign.body_files_directory', 'campaign_bodies');
            Storage::disk(config('email_campaign.attachments_disk', 'local'))->delete($dir . '/' . $campaign->body_file);
        }
        $campaign->delete();
        return response()->json(null, 204);
    }

    public function send(Request $request, Campaign $campaign): JsonResponse
    {
        if ($campaign->company_id !== $request->user()->company_id) {
            abort(404);
        }
        if ($campaign->status !== Campaign::STATUS_DRAFT) {
            return response()->json(['message' => 'Only draft campaigns can be sent.'], 422);
        }
        if ($request->user()->company->senderAccounts()->where('is_active', true)->count() === 0 && ! (app()->environment('local') && config('email_campaign.use_default_mailer_in_local'))) {
            return response()->json(['message' => 'Add at least one active sender.'], 422);
        }

        $this->sendService->dispatchCampaign($campaign);
        return response()->json($campaign->fresh());
    }

    public function resend(Request $request, Campaign $campaign): JsonResponse
    {
        if ($campaign->company_id !== $request->user()->company_id) {
            abort(404);
        }
        if (! in_array($campaign->status, [Campaign::STATUS_COMPLETED, Campaign::STATUS_CANCELLED], true)) {
            return response()->json(['message' => 'Only completed or cancelled campaigns can be resent.'], 422);
        }
        if ($request->user()->company->senderAccounts()->where('is_active', true)->count() === 0 && ! (app()->environment('local') && config('email_campaign.use_default_mailer_in_local'))) {
            return response()->json(['message' => 'Add at least one active sender.'], 422);
        }

        $companyId = $request->user()->company_id;
        $body = $campaign->getBodyContent();
        $newCampaign = Campaign::create([
            'company_id' => $companyId,
            'name' => 'Resend: ' . $campaign->name,
            'subject' => $campaign->subject,
            'recipient_type' => $campaign->recipient_type,
            'contact_group_ids' => $campaign->contact_group_ids,
            'template_key' => $campaign->template_key ?? '',
            'sender_account_id' => $campaign->sender_account_id,
            'status' => Campaign::STATUS_DRAFT,
        ]);
        $this->bodyService->storeBody($newCampaign, $body);
        $this->sendService->dispatchCampaign($newCampaign);
        return response()->json($newCampaign->fresh(), 201);
    }
}
