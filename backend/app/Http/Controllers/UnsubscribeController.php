<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\SuppressionList;
use Illuminate\Http\Request;

class UnsubscribeController extends Controller
{
    public function __invoke(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'company' => ['required', 'exists:companies,id'],
        ]);
        $company = Company::findOrFail($request->company);
        SuppressionList::firstOrCreate(
            ['company_id' => $company->id, 'email' => $request->email],
            ['reason' => 'Unsubscribed via link']
        );
        return response()->view('emails.unsubscribed', ['company' => $company]);
    }
}
