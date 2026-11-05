<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('restaurants', fn (Blueprint $table) => $table->unsignedInteger('version')->default(1));
        Schema::table('restaurant_contents', fn (Blueprint $table) => $table->unsignedInteger('version')->default(1));
        Schema::table('users', fn (Blueprint $table) => $table->unsignedInteger('version')->default(1));
    }

    public function down(): void
    {
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn('version'));
        Schema::table('restaurant_contents', fn (Blueprint $table) => $table->dropColumn('version'));
        Schema::table('restaurants', fn (Blueprint $table) => $table->dropColumn('version'));
    }
};
