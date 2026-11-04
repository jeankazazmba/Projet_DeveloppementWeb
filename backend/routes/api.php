<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RestaurantCatalogController;
use App\Http\Controllers\Api\SessionController;
use App\Http\Controllers\Api\StaffRestaurantController;
use App\Http\Controllers\Api\PlatformRestaurantController;
use App\Http\Controllers\Api\PlatformUserController;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'application' => 'Mon Miam Miam',
        'service' => 'backend',
    ]);
});

Route::get('/restaurants', [RestaurantCatalogController::class, 'index']);
Route::get('/restaurants/{restaurant}', [RestaurantCatalogController::class, 'show']);
Route::get('/restaurants/{restaurant}/content', [RestaurantCatalogController::class, 'content']);
Route::post('/login', [SessionController::class, 'login'])->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [SessionController::class, 'logout']);
    Route::get('/staff/restaurants', [StaffRestaurantController::class, 'restaurants']);
    Route::get('/staff/restaurants/{restaurant}/content', [StaffRestaurantController::class, 'content']);
    Route::post('/staff/restaurants/{restaurant}/content', [StaffRestaurantController::class, 'store']);
    Route::patch('/staff/restaurants/{restaurant}/content/{content}', [StaffRestaurantController::class, 'update']);
    Route::delete('/staff/restaurants/{restaurant}/content/{content}', [StaffRestaurantController::class, 'destroy']);
    Route::post('/platform/restaurants', [PlatformRestaurantController::class, 'store']);
    Route::patch('/platform/restaurants/{restaurant}', [PlatformRestaurantController::class, 'update']);
    Route::post('/platform/users', [PlatformUserController::class, 'store']);
    Route::put('/platform/restaurants/{restaurant}/members/{user}', [PlatformUserController::class, 'assign']);
});
