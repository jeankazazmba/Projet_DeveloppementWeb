<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RestaurantCatalogController;
use App\Http\Controllers\Api\SessionController;
use App\Http\Controllers\Api\StaffRestaurantController;
use App\Http\Controllers\Api\PlatformRestaurantController;
use App\Http\Controllers\Api\PlatformUserController;
use App\Http\Controllers\Api\PlatformInsightsController;
use App\Http\Controllers\Api\PlatformInvitationController;
use App\Http\Controllers\Api\PlatformProfileController;
use App\Http\Controllers\Api\AuthProfileController;
use App\Http\Controllers\Api\RestaurantTeamController;
use App\Http\Middleware\EnsureActiveAccount;
use App\Http\Controllers\Api\RestaurantMenuController;
use App\Http\Controllers\Api\RestaurantSlotController;
use App\Http\Controllers\Api\StudentCartController;
use App\Http\Controllers\Api\StudentAddressController;
use App\Http\Controllers\Api\StudentOrderController;
use App\Http\Controllers\Api\StaffOrderController;

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
Route::get('/restaurants/{restaurant}/menu', [RestaurantCatalogController::class, 'menu']);
Route::get('/restaurants/{restaurant}/service-slots', [RestaurantSlotController::class, 'publicIndex']);
Route::post('/login', [SessionController::class, 'login'])->middleware('throttle:5,1');
Route::post('/auth/register', [AuthProfileController::class, 'register'])->middleware('throttle:5,1');
Route::post('/auth/login', [SessionController::class, 'login'])->middleware('throttle:5,1');
Route::post('/auth/password/forgot', [AuthProfileController::class, 'forgot'])->middleware('throttle:5,1');
Route::post('/auth/password/reset', [AuthProfileController::class, 'reset'])->middleware('throttle:5,1');
Route::post('/platform/register', [PlatformInvitationController::class, 'register'])->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [SessionController::class, 'logout']);
    Route::post('/auth/logout', [SessionController::class, 'logout']);
});

Route::middleware(['auth:sanctum', EnsureActiveAccount::class])->group(function () {
    Route::get('/me/cart', [StudentCartController::class, 'show']);
    Route::put('/me/cart', [StudentCartController::class, 'save']);
    Route::delete('/me/cart', [StudentCartController::class, 'clear']);
    Route::get('/me/delivery-addresses', [StudentAddressController::class, 'index']);
    Route::post('/me/delivery-addresses', [StudentAddressController::class, 'store']);
    Route::patch('/me/delivery-addresses/{address}', [StudentAddressController::class, 'update']);
    Route::delete('/me/delivery-addresses/{address}', [StudentAddressController::class, 'destroy']);
    Route::post('/restaurants/{restaurant}/quotes', [StudentOrderController::class, 'quote']);
    Route::post('/restaurants/{restaurant}/orders', [StudentOrderController::class, 'store']);
    Route::get('/me/orders', [StudentOrderController::class, 'index']);
    Route::get('/me/orders/{order}', [StudentOrderController::class, 'show']);
    Route::get('/staff/restaurants/{restaurant}/orders', [StaffOrderController::class, 'index']);
    Route::patch('/staff/orders/{order}/status', [StaffOrderController::class, 'status']);
    Route::get('/staff/restaurants/{restaurant}/categories', [RestaurantMenuController::class, 'categories']);
    Route::post('/staff/restaurants/{restaurant}/categories', [RestaurantMenuController::class, 'categoryStore']);
    Route::patch('/staff/restaurants/{restaurant}/categories/{category}', [RestaurantMenuController::class, 'categoryUpdate']);
    Route::delete('/staff/restaurants/{restaurant}/categories/{category}', [RestaurantMenuController::class, 'categoryDelete']);
    Route::post('/staff/restaurants/{restaurant}/content/{content}/options', [RestaurantMenuController::class, 'optionStore']);
    Route::patch('/staff/restaurants/{restaurant}/content/{content}/options/{option}', [RestaurantMenuController::class, 'optionUpdate']);
    Route::delete('/staff/restaurants/{restaurant}/content/{content}/options/{option}', [RestaurantMenuController::class, 'optionDelete']);
    Route::get('/staff/restaurants/{restaurant}/allergens', [RestaurantMenuController::class, 'allergens']);
    Route::post('/staff/restaurants/{restaurant}/allergens', [RestaurantMenuController::class, 'allergenStore']);
    Route::patch('/staff/restaurants/{restaurant}/allergens/{allergen}', [RestaurantMenuController::class, 'allergenUpdate']);
    Route::delete('/staff/restaurants/{restaurant}/allergens/{allergen}', [RestaurantMenuController::class, 'allergenDelete']);
    Route::put('/staff/restaurants/{restaurant}/content/{content}/allergens', [RestaurantMenuController::class, 'setAllergens']);
    Route::get('/staff/restaurants/{restaurant}/service-slots', [RestaurantSlotController::class, 'index']);
    Route::patch('/staff/restaurants/{restaurant}/delivery-fee', [RestaurantSlotController::class, 'fee']);
    Route::post('/staff/restaurants/{restaurant}/service-slots', [RestaurantSlotController::class, 'store']);
    Route::patch('/staff/restaurants/{restaurant}/service-slots/{slot}', [RestaurantSlotController::class, 'update']);
    Route::delete('/staff/restaurants/{restaurant}/service-slots/{slot}', [RestaurantSlotController::class, 'destroy']);
    Route::get('/me', [AuthProfileController::class, 'me']);
    Route::patch('/me', [AuthProfileController::class, 'update']);
    Route::post('/auth/email/verification/request', [AuthProfileController::class, 'requestVerification'])->middleware('throttle:5,1');
    Route::post('/auth/email/verify', [AuthProfileController::class, 'verifyEmail'])->middleware('throttle:5,1');
    Route::get('/staff/restaurants/{restaurant}/members', [RestaurantTeamController::class, 'index']);
    Route::post('/staff/restaurants/{restaurant}/members', [RestaurantTeamController::class, 'store']);
    Route::put('/staff/restaurants/{restaurant}/members/{user}', [RestaurantTeamController::class, 'assign']);
    Route::patch('/staff/restaurants/{restaurant}/members/{user}/status', [RestaurantTeamController::class, 'status']);
    Route::get('/staff/restaurants', [StaffRestaurantController::class, 'restaurants']);
    Route::get('/staff/restaurants/{restaurant}/content', [StaffRestaurantController::class, 'content']);
    Route::post('/staff/restaurants/{restaurant}/content', [StaffRestaurantController::class, 'store']);
    Route::patch('/staff/restaurants/{restaurant}/content/{content}', [StaffRestaurantController::class, 'update']);
    Route::delete('/staff/restaurants/{restaurant}/content/{content}', [StaffRestaurantController::class, 'destroy']);
    Route::patch('/staff/restaurants/{restaurant}/content/{content}/service', [StaffRestaurantController::class, 'service']);
    Route::post('/platform/restaurants', [PlatformRestaurantController::class, 'store']);
    Route::get('/platform/restaurants', [PlatformRestaurantController::class, 'index']);
    Route::patch('/platform/restaurants/{restaurant}', [PlatformRestaurantController::class, 'update']);
    Route::get('/platform/users', [PlatformUserController::class, 'index']);
    Route::post('/platform/users', [PlatformUserController::class, 'store']);
    Route::patch('/platform/users/{user}', [PlatformUserController::class, 'update']);
    Route::put('/platform/restaurants/{restaurant}/members/{user}', [PlatformUserController::class, 'assign']);
    Route::delete('/platform/restaurants/{restaurant}/members/{user}', [PlatformUserController::class, 'revoke']);
    Route::get('/platform/insights', [PlatformInsightsController::class, 'index']);
    Route::get('/platform/audit', [PlatformInsightsController::class, 'audit']);
    Route::get('/platform/invitations', [PlatformInvitationController::class, 'index']);
    Route::post('/platform/invitations', [PlatformInvitationController::class, 'store'])->middleware('throttle:5,1');
    Route::delete('/platform/invitations/{invitation}', [PlatformInvitationController::class, 'destroy']);
    Route::get('/platform/me', [PlatformProfileController::class, 'show']);
    Route::put('/platform/me/password', [PlatformProfileController::class, 'password'])->middleware('throttle:5,1');
});
