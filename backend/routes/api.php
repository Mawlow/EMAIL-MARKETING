<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/login', [App\Http\Controllers\Api\AuthController::class, 'login']);
Route::post('/register', [App\Http\Controllers\Api\AuthController::class, 'register']);
Route::post('/forgot-password', [App\Http\Controllers\Api\AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [App\Http\Controllers\Api\AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [App\Http\Controllers\Api\AuthController::class, 'logout']);
    Route::get('/user', [App\Http\Controllers\Api\AuthController::class, 'user']);

    // Admin-only routes
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::apiResource('companies', App\Http\Controllers\Api\Admin\CompanyController::class);
        Route::post('companies/{company}/approve', [App\Http\Controllers\Api\Admin\CompanyController::class, 'approve'])->name('companies.approve');
        Route::post('companies/{company}/verify', [App\Http\Controllers\Api\Admin\CompanyController::class, 'verify'])->name('companies.verify');
        Route::post('companies/{company}/disable', [App\Http\Controllers\Api\Admin\CompanyController::class, 'disable'])->name('companies.disable');
        Route::get('campaigns', [App\Http\Controllers\Api\Admin\CampaignController::class, 'index'])->name('campaigns.index');
        Route::get('campaigns/{campaign}', [App\Http\Controllers\Api\Admin\CampaignController::class, 'show'])->name('campaigns.show');
        Route::get('campaigns/{campaign}/logs', [App\Http\Controllers\Api\Admin\CampaignLogController::class, 'index'])->name('campaigns.logs');
        Route::get('analytics', [App\Http\Controllers\Api\Admin\AnalyticsController::class, 'index'])->name('analytics.index');
    });

    // Company user routes (company scope enforced in controllers)
    Route::middleware('role:company')->prefix('company')->name('company.')->group(function () {
        Route::apiResource('campaigns', App\Http\Controllers\Api\Company\CampaignController::class);
        Route::post('campaigns/{campaign}/send', [App\Http\Controllers\Api\Company\CampaignController::class, 'send'])->name('campaigns.send');
        Route::post('campaigns/{campaign}/resend', [App\Http\Controllers\Api\Company\CampaignController::class, 'resend'])->name('campaigns.resend');
        Route::get('campaigns/{campaign}/logs', [App\Http\Controllers\Api\Company\CampaignLogController::class, 'index'])->name('campaigns.logs');
        Route::apiResource('contacts', App\Http\Controllers\Api\Company\ContactController::class);
        Route::post('contacts/import', [App\Http\Controllers\Api\Company\ContactController::class, 'import'])->name('contacts.import');
        Route::apiResource('contact-groups', App\Http\Controllers\Api\Company\ContactGroupController::class)->parameters(['contact-groups' => 'contactGroup']);
        Route::apiResource('sender-accounts', App\Http\Controllers\Api\Company\SenderAccountController::class)->parameters(['sender-accounts' => 'senderAccount']);
        Route::get('suppression-list', [App\Http\Controllers\Api\Company\SuppressionListController::class, 'index'])->name('suppression-list.index');
        Route::post('suppression-list', [App\Http\Controllers\Api\Company\SuppressionListController::class, 'store'])->name('suppression-list.store');
        Route::delete('suppression-list/{email}', [App\Http\Controllers\Api\Company\SuppressionListController::class, 'destroy'])->name('suppression-list.destroy')->where('email', '.*');
        Route::get('analytics', [App\Http\Controllers\Api\Company\AnalyticsController::class, 'index'])->name('analytics.index');
        Route::get('templates', [App\Http\Controllers\Api\Company\TemplateController::class, 'index'])->name('templates.index');
        Route::apiResource('events', App\Http\Controllers\Api\Company\EventController::class)->parameters(['events' => 'event']);
    });
});
