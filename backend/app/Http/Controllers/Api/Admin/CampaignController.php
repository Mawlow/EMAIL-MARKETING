<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Campaign::with('company:id,name,email');
        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        $campaigns = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 15));
        return response()->json($campaigns);
    }

    public function show(Campaign $campaign): JsonResponse
    {
        $campaign->load('company');
        $campaign->loadCount('emailLogs');
        return response()->json($campaign);
    }
}
