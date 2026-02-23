<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SuppressionListController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $items = \App\Models\SuppressionList::where('company_id', $companyId)
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 50));
        return response()->json($items);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);
        $companyId = $request->user()->company_id;
        $item = \App\Models\SuppressionList::firstOrCreate(
            ['company_id' => $companyId, 'email' => $request->email],
            ['reason' => $request->reason]
        );
        return response()->json($item, 201);
    }

    public function destroy(Request $request, string $email): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $deleted = \App\Models\SuppressionList::where('company_id', $companyId)
            ->where('email', $email)
            ->delete();
        if (! $deleted) {
            return response()->json(['message' => 'Not found.'], 404);
        }
        return response()->json(null, 204);
    }
}
