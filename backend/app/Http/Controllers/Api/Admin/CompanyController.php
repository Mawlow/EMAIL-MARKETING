<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Company::query()->withCount(['users', 'campaigns', 'contacts']);
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('email', 'like', '%' . $request->search . '%');
        }
        if ($request->has('is_active')) {
            $query->where('is_active', (bool) $request->is_active);
        }
        $companies = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 15));
        return response()->json($companies);
    }

    public function show(Company $company): JsonResponse
    {
        $company->loadCount(['users', 'campaigns', 'contacts']);
        return response()->json($company);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'sms_phone' => ['nullable', 'string', 'max:50'],
        ]);
        $company = Company::create($data);
        return response()->json($company, 201);
    }

    public function update(Request $request, Company $company): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['nullable', 'email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'sms_phone' => ['nullable', 'string', 'max:50'],
        ]);
        $company->update($data);
        return response()->json($company);
    }

    public function destroy(Company $company): JsonResponse
    {
        $company->delete();
        return response()->json(null, 204);
    }

    public function approve(Company $company): JsonResponse
    {
        $company->update(['is_approved' => true]);
        return response()->json($company);
    }

    public function verify(Company $company): JsonResponse
    {
        $company->update(['is_verified' => true]);
        return response()->json($company);
    }

    public function disable(Company $company): JsonResponse
    {
        $company->update(['is_active' => false]);
        return response()->json($company);
    }
}
