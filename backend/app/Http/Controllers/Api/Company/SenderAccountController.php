<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSenderAccountRequest;
use App\Http\Requests\UpdateSenderAccountRequest;
use App\Models\SenderAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SenderAccountController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $accounts = SenderAccount::where('company_id', $request->user()->company_id)
            ->orderBy('name')
            ->get();
        $accounts->each->makeHidden(['password_encrypted']);
        return response()->json($accounts);
    }

    public function store(StoreSenderAccountRequest $request): JsonResponse
    {
        $data = $request->validated();
        $password = $data['password'] ?? null;
        unset($data['password']);
        $data['company_id'] = $request->user()->company_id;
        $data['is_active'] = $data['is_active'] ?? true;
        $data['encryption'] = $data['encryption'] ?? null;
        $account = new SenderAccount($data);
        if ($password !== null) {
            $account->password = $password;
        }
        $account->save();
        $account->makeHidden(['password_encrypted']);
        return response()->json($account, 201);
    }

    public function show(Request $request, SenderAccount $senderAccount): JsonResponse
    {
        if ($senderAccount->company_id !== $request->user()->company_id) {
            abort(404);
        }
        $senderAccount->makeHidden(['password_encrypted']);
        return response()->json($senderAccount);
    }

    public function update(UpdateSenderAccountRequest $request, SenderAccount $senderAccount): JsonResponse
    {
        if ($senderAccount->company_id !== $request->user()->company_id) {
            abort(404);
        }
        $data = $request->validated();
        $password = $data['password'] ?? null;
        unset($data['password']);
        $senderAccount->fill($data);
        if ($password !== null && $password !== '') {
            $senderAccount->password = $password;
        }
        $senderAccount->save();
        $senderAccount->makeHidden(['password_encrypted']);
        return response()->json($senderAccount);
    }

    public function destroy(Request $request, SenderAccount $senderAccount): JsonResponse
    {
        if ($senderAccount->company_id !== $request->user()->company_id) {
            abort(404);
        }
        $senderAccount->delete();
        return response()->json(null, 204);
    }
}
