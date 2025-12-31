<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

Route::get('/', function () {
    return view('welcome');
});
Route::get('/force-migrate', function () {
    try {
        Artisan::call('migrate', ['--force' => true]);
        return "<h1>✅ Database Migration Successful!</h1><pre>" . Artisan::output() . "</pre>";
    } catch (\Exception $e) {
        return "<h1>❌ Error</h1><p>" . $e->getMessage() . "</p>";
    }
});
