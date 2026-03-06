<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Company;
use App\Models\Contact;
use App\Models\CompanyEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $query = $request->get('q');
        $user = $request->user();
        $results = [
            'autocomplete' => [],
            'live' => [
                'campaigns' => [],
                'contacts' => [],
                'companies' => [],
                'events' => [],
            ]
        ];

        if (empty($query) || strlen($query) < 2) {
            return response()->json($results);
        }

        if ($user->role === 'admin') {
            // Admin results
            $companies = Company::where('name', 'like', "%{$query}%")
                ->limit(5)
                ->get(['id', 'name', 'logo_url']);
            
            $results['live']['companies'] = $companies;
            
            foreach ($companies as $company) {
                $results['autocomplete'][] = $company->name;
            }
        } else {
            // Company results
            $companyId = $user->company_id;

            $campaigns = Campaign::where('company_id', $companyId)
                ->where('name', 'like', "%{$query}%")
                ->limit(5)
                ->get(['id', 'name', 'subject', 'status']);

            $contacts = Contact::where('company_id', $companyId)
                ->where(function($q) use ($query) {
                    $q->where('email', 'like', "%{$query}%")
                      ->orWhere('first_name', 'like', "%{$query}%")
                      ->orWhere('last_name', 'like', "%{$query}%");
                })
                ->limit(5)
                ->get(['id', 'email', 'first_name', 'last_name']);

            $events = CompanyEvent::where('company_id', $companyId)
                ->where('title', 'like', "%{$query}%")
                ->limit(5)
                ->get(['id', 'title', 'start_at']);

            $results['live']['campaigns'] = $campaigns;
            $results['live']['contacts'] = $contacts;
            $results['live']['events'] = $events;

            foreach ($campaigns as $campaign) {
                $results['autocomplete'][] = $campaign->name;
            }
            foreach ($contacts as $contact) {
                $name = trim("{$contact->first_name} {$contact->last_name}");
                if ($name) $results['autocomplete'][] = $name;
                $results['autocomplete'][] = $contact->email;
            }
            foreach ($events as $event) {
                $results['autocomplete'][] = $event->title;
            }
        }

        // Clean and unique autocomplete suggestions
        $results['autocomplete'] = array_values(array_unique(array_filter($results['autocomplete'])));
        
        return response()->json($results);
    }
}