<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactRequest;
use App\Models\Contact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ContactController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $query = Contact::where('company_id', $companyId);
        if ($request->has('is_marketing')) {
            $query->where('is_marketing', (bool) $request->is_marketing);
        }
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('email', 'like', '%' . $request->search . '%')
                    ->orWhere('first_name', 'like', '%' . $request->search . '%')
                    ->orWhere('last_name', 'like', '%' . $request->search . '%');
            });
        }
        $contacts = $query->with('groups')->orderBy('created_at', 'desc')->paginate($request->get('per_page', 15));
        return response()->json($contacts);
    }

    public function store(StoreContactRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['company_id'] = $request->user()->company_id;
        $data['is_marketing'] = $data['is_marketing'] ?? true;
        $groupIds = $data['contact_group_ids'] ?? [];
        unset($data['contact_group_ids']);
        $contact = Contact::create($data);
        $contact->groups()->sync($groupIds);
        $contact->load('groups');
        return response()->json($contact, 201);
    }

    public function show(Request $request, Contact $contact): JsonResponse
    {
        if ($contact->company_id !== $request->user()->company_id) {
            abort(404);
        }
        $contact->load('groups');
        return response()->json($contact);
    }

    public function update(Request $request, Contact $contact): JsonResponse
    {
        if ($contact->company_id !== $request->user()->company_id) {
            abort(404);
        }
        $companyId = $request->user()->company_id;
        $data = $request->validate([
            'email' => [
                'sometimes', 
                'email', 
                Rule::unique('contacts', 'email')->where('company_id', $companyId)->ignore($contact->id)
            ],
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'is_marketing' => ['boolean'],
            'contact_group_ids' => ['nullable', 'array'],
            'contact_group_ids.*' => ['integer', Rule::exists('contact_groups', 'id')->where('company_id', $companyId)],
        ]);
        $groupIds = $data['contact_group_ids'] ?? null;
        unset($data['contact_group_ids']);
        $contact->update($data);
        if ($groupIds !== null) {
            $contact->groups()->sync($groupIds);
        }
        $contact->load('groups');
        return response()->json($contact);
    }

    public function destroy(Request $request, Contact $contact): JsonResponse
    {
        if ($contact->company_id !== $request->user()->company_id) {
            abort(404);
        }
        $contact->delete();
        return response()->json(null, 204);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate(['file' => ['required', 'file', 'mimes:csv,txt', 'max:5120']]);
        $companyId = $request->user()->company_id;
        $file = $request->file('file');
        $path = $file->getRealPath();
        $rows = array_map('str_getcsv', file($path));
        if (empty($rows)) {
            return response()->json(['message' => 'CSV is empty.', 'imported' => 0], 422);
        }
        $header = array_map('trim', $rows[0]);
        $emailColumn = $this->detectEmailColumn($header);
        if ($emailColumn === null) {
            return response()->json(['message' => 'No email column found. Use a column named "email" or "Email".', 'imported' => 0], 422);
        }
        $firstNameCol = $this->findColumn($header, ['first_name', 'first name', 'firstName']);
        $lastNameCol = $this->findColumn($header, ['last_name', 'last name', 'lastName']);
        $imported = 0;
        foreach (array_slice($rows, 1) as $row) {
            $row = array_pad($row, count($header), '');
            $email = trim($row[$emailColumn] ?? '');
            if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                continue;
            }
            Contact::updateOrCreate(
                ['company_id' => $companyId, 'email' => $email],
                [
                    'first_name' => $firstNameCol !== null ? trim($row[$firstNameCol] ?? '') : null,
                    'last_name' => $lastNameCol !== null ? trim($row[$lastNameCol] ?? '') : null,
                    'is_marketing' => true,
                ]
            );
            $imported++;
        }
        return response()->json(['message' => "Imported {$imported} contacts.", 'imported' => $imported]);
    }

    protected function detectEmailColumn(array $header): ?int
    {
        foreach ($header as $i => $col) {
            if (preg_match('/^e\-?mail$/i', trim($col))) {
                return $i;
            }
        }
        return null;
    }

    protected function findColumn(array $header, array $names): ?int
    {
        foreach ($header as $i => $col) {
            $col = strtolower(trim($col));
            foreach ($names as $n) {
                if ($col === strtolower($n)) {
                    return $i;
                }
            }
        }
        return null;
    }
}
