<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'company_id' => null,
            ]
        );

        $company = Company::firstOrCreate(
            ['email' => 'company@example.com'],
            [
                'name' => 'Demo Company',
                'is_approved' => true,
                'is_verified' => true,
                'is_active' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'company@example.com'],
            [
                'name' => 'Company User',
                'password' => Hash::make('password'),
                'role' => 'company',
                'company_id' => $company->id,
            ]
        );
    }
}
