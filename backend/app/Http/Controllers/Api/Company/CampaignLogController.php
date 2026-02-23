<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CampaignLogController extends Controller
{
    public function index(Request $request, Campaign $campaign): JsonResponse
    {
        if ($campaign->company_id !== $request->user()->company_id) {
            abort(404);
        }
        $query = $campaign->emailLogs();
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        $logs = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 50));
        return response()->json($logs);
    }
}
