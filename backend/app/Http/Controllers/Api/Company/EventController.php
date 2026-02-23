<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Models\CompanyEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $query = CompanyEvent::where('company_id', $companyId)->orderBy('start_at');

        if ($request->filled('start') && $request->filled('end')) {
            $query->where('end_at', '>=', $request->start)
                ->where('start_at', '<=', $request->end);
        }

        $events = $query->get();
        return response()->json($events->toArray());
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date', 'after_or_equal:start_at'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed.', 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['company_id'] = $request->user()->company_id;
        $event = CompanyEvent::create($data);
        return response()->json($event, 201);
    }

    public function show(Request $request, CompanyEvent $event): JsonResponse
    {
        if ($event->company_id !== $request->user()->company_id) {
            abort(404);
        }
        return response()->json($event);
    }

    public function update(Request $request, CompanyEvent $event): JsonResponse
    {
        if ($event->company_id !== $request->user()->company_id) {
            abort(404);
        }
        $validator = Validator::make($request->all(), [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'start_at' => ['sometimes', 'date'],
            'end_at' => ['sometimes', 'date', 'after_or_equal:start_at'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed.', 'errors' => $validator->errors()], 422);
        }
        $event->update($validator->validated());
        return response()->json($event);
    }

    public function destroy(Request $request, CompanyEvent $event): JsonResponse
    {
        if ($event->company_id !== $request->user()->company_id) {
            abort(404);
        }
        $event->delete();
        return response()->json(null, 204);
    }
}
