<?php

namespace App\Services;

use App\Models\Campaign;
use App\Models\Company;
use App\Models\Contact;
use App\Models\ContactGroup;
use Illuminate\Support\Collection;

class CampaignRecipientService
{
    /**
     * Resolve recipient emails for a campaign based on recipient_type.
     *
     * @return array<string>
     */
    public function getRecipientEmails(Campaign $campaign): array
    {
        $company = $campaign->company;
        $emails = match ($campaign->recipient_type) {
            Campaign::RECIPIENT_MARKETING => $this->getMarketingContacts($company),
            Campaign::RECIPIENT_CONTACT_GROUPS => $this->getContactsInGroups($company, $campaign->contact_group_ids ?? []),
            Campaign::RECIPIENT_ALL_COMPANIES => $this->getAllCompanyEmails(),
            Campaign::RECIPIENT_VERIFIED => $this->getVerifiedCompanyEmails(),
            Campaign::RECIPIENT_ACTIVE_JOBS => $this->getCompaniesWithActiveJobsEmails(),
            default => $this->getMarketingContacts($company),
        };

        $suppression = $company->suppressionLists()->pluck('email')->map(fn ($e) => strtolower($e))->flip();
        return array_values(array_filter($emails, fn ($email) => ! $suppression->has(strtolower($email))));
    }

    /**
     * @return array<string>
     */
    protected function getMarketingContacts(Company $company): array
    {
        return $company->contacts()->where('is_marketing', true)->pluck('email')->unique()->values()->all();
    }

    /**
     * @param  array<int>  $groupIds
     * @return array<string>
     */
    protected function getContactsInGroups(Company $company, array $groupIds): array
    {
        if (empty($groupIds)) {
            return $this->getMarketingContacts($company);
        }
        $validGroupIds = ContactGroup::where('company_id', $company->id)->whereIn('id', $groupIds)->pluck('id')->all();
        if (empty($validGroupIds)) {
            return [];
        }
        return Contact::where('company_id', $company->id)
            ->whereHas('groups', fn ($q) => $q->whereIn('contact_groups.id', $validGroupIds))
            ->pluck('email')
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @return array<string>
     */
    protected function getAllCompanyEmails(): array
    {
        return Company::where('is_active', true)
            ->whereNotNull('email')
            ->pluck('email')
            ->unique()
            ->filter()
            ->values()
            ->all();
    }

    /**
     * @return array<string>
     */
    protected function getVerifiedCompanyEmails(): array
    {
        return Company::where('is_active', true)
            ->where('is_verified', true)
            ->whereNotNull('email')
            ->pluck('email')
            ->unique()
            ->filter()
            ->values()
            ->all();
    }

    /**
     * @return array<string>
     */
    protected function getCompaniesWithActiveJobsEmails(): array
    {
        return Company::where('is_active', true)
            ->whereNotNull('email')
            ->whereHas('companyJobs', fn ($q) => $q->where('is_active', true))
            ->pluck('email')
            ->unique()
            ->filter()
            ->values()
            ->all();
    }
}
