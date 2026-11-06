<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('restaurant_contents', function (Blueprint $table) {
            $table->boolean('is_available')->default(true);
            $table->boolean('is_featured')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('restaurant_contents', fn (Blueprint $table) => $table->dropColumn(['is_available', 'is_featured']));
    }
};
