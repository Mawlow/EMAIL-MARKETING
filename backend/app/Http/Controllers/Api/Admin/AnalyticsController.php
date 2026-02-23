<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $dateFrom = $request->get('from', now()->subDays(30)->toDateString());
        $dateTo = $request->get('to', now()->toDateString());

        $campaigns = Campaign::whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59']);
        $totalCampaigns = (clone $campaigns)->count();
        $totalSent = (clone $campaigns)->sum('sent_count');
        $totalFailed = (clone $campaigns)->sum('failed_count');
        $completedCampaigns = (clone $campaigns)->where('status', Campaign::STATUS_COMPLETED)->count();

        return response()->json([
            'companies_count' => Company::count(),
            'total_campaigns' => $totalCampaigns,
            'total_emails_sent' => $totalSent,
            'total_emails_failed' => $totalFailed,
            'completed_campaigns' => $completedCampaigns,
            'period' => ['from' => $dateFrom, 'to' => $dateTo],
        ]);
    }
}
