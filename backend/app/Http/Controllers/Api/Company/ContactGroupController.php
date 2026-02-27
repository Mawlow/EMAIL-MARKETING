<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Models\ContactGroup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use Illuminate\Validation\Rule;

class ContactGroupController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $groups = ContactGroup::where('company_id', $request->user()->company_id)
            ->orderBy('name')
            ->get();
        return response()->json($groups);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => [
                'required', 
                'string', 
                'max:255',
                Rule::unique('contact_groups')->where('company_id', $request->user()->company_id)
            ],
        ]);
        $data['company_id'] = $request->user()->company_id;
        $group = ContactGroup::create($data);
        return response()->json($group, 201);
    }

    public function update(Request $request, ContactGroup $contactGroup): JsonResponse
    {
        if ($contactGroup->company_id !== $request->user()->company_id) {
            abort(404);
        }
        $data = $request->validate([
            'name' => [
                'required', 
                'string', 
                'max:255',
                Rule::unique('contact_groups')
                    ->where('company_id', $request->user()->company_id)
                    ->ignore($contactGroup->id)
            ],
        ]);
        $contactGroup->update($data);
        return response()->json($contactGroup);
    }

    public function destroy(Request $request, ContactGroup $contactGroup): JsonResponse
    {
        if ($contactGroup->company_id !== $request->user()->company_id) {
            abort(404);
        }
        $contactGroup->delete();
        return response()->json(null, 204);
    }
}
