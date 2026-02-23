<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class TemplateController extends Controller
{
    public function index(): JsonResponse
    {
        $templates = [
            ['key' => 'professional', 'name' => 'Professional', 'description' => 'Clean layout with header and CTA'],
            ['key' => 'newsletter', 'name' => 'Newsletter', 'description' => 'Multi-section newsletter layout'],
            ['key' => 'promotional', 'name' => 'Promotional', 'description' => 'Promo block with emphasis'],
        ];
        return response()->json($templates);
    }
}
