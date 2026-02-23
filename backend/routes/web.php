<?php

use App\Http\Controllers\TrackOpenController;
use App\Http\Controllers\UnsubscribeController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/unsubscribe', UnsubscribeController::class)->name('unsubscribe');

Route::get('/track/open', TrackOpenController::class)->name('track.open')->middleware('signed');
