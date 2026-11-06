<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('dining_tables')) {
        Schema::create('dining_tables', function (Blueprint $table) {
            $table->id();
            $table->string('restaurant_id');
            $table->foreign('restaurant_id')->references('id')->on('restaurants')->cascadeOnDelete();
            $table->string('code', 40);
            $table->unsignedTinyInteger('capacity');
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('version')->default(1);
            $table->timestamps();
            $table->unique(['restaurant_id', 'code']);
        });
        }
        if (!Schema::hasTable('delivery_zones')) {
        Schema::create('delivery_zones', function (Blueprint $table) {
            $table->id();
            $table->string('restaurant_id');
            $table->foreign('restaurant_id')->references('id')->on('restaurants')->cascadeOnDelete();
            $table->string('district', 120);
            $table->unsignedInteger('fee_cdf');
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('version')->default(1);
            $table->timestamps();
            $table->unique(['restaurant_id', 'district']);
        });
        }
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'dining_table_id')) { $table->foreignId('dining_table_id')->nullable()->constrained('dining_tables')->nullOnDelete(); }
            if (!Schema::hasColumn('orders', 'party_size')) { $table->unsignedTinyInteger('party_size')->nullable(); }
            if (!Schema::hasColumn('orders', 'delivery_zone_id')) { $table->foreignId('delivery_zone_id')->nullable()->constrained('delivery_zones')->nullOnDelete(); }
            if (!Schema::hasColumn('orders', 'delivery_zone_snapshot')) { $table->json('delivery_zone_snapshot')->nullable(); }
            if (!Schema::hasColumn('orders', 'delivery_assignee_id')) { $table->foreignId('delivery_assignee_id')->nullable()->constrained('users')->nullOnDelete(); }
            if (!Schema::hasColumn('orders', 'delivery_assigned_at')) { $table->timestamp('delivery_assigned_at')->nullable(); }
        });
        if (!Schema::hasTable('table_reservations')) {
        Schema::create('table_reservations', function (Blueprint $table) {
            $table->id();
            $table->string('order_id', 80)->unique();
            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $table->foreignId('dining_table_id')->constrained('dining_tables')->cascadeOnDelete();
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->string('status', 20)->default('active');
            $table->timestamps();
            $table->index(['dining_table_id', 'status', 'starts_at', 'ends_at'], 'table_reservations_availability_idx');
        });
        }
        if (!Schema::hasIndex('table_reservations', 'table_reservations_availability_idx')) {
            Schema::table('table_reservations', fn (Blueprint $table) => $table->index(['dining_table_id', 'status', 'starts_at', 'ends_at'], 'table_reservations_availability_idx'));
        }
        if (!Schema::hasTable('delivery_positions')) {
        Schema::create('delivery_positions', function (Blueprint $table) {
            $table->id();
            $table->string('order_id', 80);
            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $table->foreignId('actor_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->timestamp('recorded_at');
            $table->index(['order_id', 'recorded_at']);
        });
        }
        Schema::table('order_events', function (Blueprint $table) {
            if (!Schema::hasColumn('order_events', 'action')) { $table->string('action', 40)->default('status_changed'); }
            if (!Schema::hasColumn('order_events', 'reason')) { $table->text('reason')->nullable(); }
            if (!Schema::hasColumn('order_events', 'order_version')) { $table->unsignedInteger('order_version')->default(1); }
        });

        // Les commandes de l'étape précédente gardent leur sens dans le nouveau cycle.
        foreach (['pending' => 'received', 'confirmed' => 'accepted'] as $from => $to) {
            DB::table('orders')->where('status', $from)->update(['status' => $to]);
            DB::table('order_events')->where('from_status', $from)->update(['from_status' => $to]);
            DB::table('order_events')->where('to_status', $from)->update(['to_status' => $to]);
        }
        DB::table('orders')->where('status', 'completed')->where('service', 'delivery')->update(['status' => 'delivered']);
        DB::table('orders')->where('status', 'completed')->where('service', '!=', 'delivery')->update(['status' => 'served']);
        foreach (DB::table('order_events')->where('to_status', 'completed')->get(['id', 'order_id']) as $event) {
            $service = DB::table('orders')->where('id', $event->order_id)->value('service');
            DB::table('order_events')->where('id', $event->id)->update(['to_status' => $service === 'delivery' ? 'delivered' : 'served']);
        }
        foreach (DB::table('order_events')->where('from_status', 'completed')->get(['id', 'order_id']) as $event) {
            $service = DB::table('orders')->where('id', $event->order_id)->value('service');
            DB::table('order_events')->where('id', $event->id)->update(['from_status' => $service === 'delivery' ? 'delivered' : 'served']);
        }
        $currentOrder = null; $version = 0;
        DB::table('order_events')->orderBy('order_id')->orderBy('id')->chunk(500, function ($events) use (&$currentOrder, &$version) {
            foreach ($events as $event) {
                if ($currentOrder !== $event->order_id) { $currentOrder = $event->order_id; $version = 0; }
                $version++;
                DB::table('order_events')->where('id', $event->id)->update([
                    'action' => $version === 1 ? 'created' : 'status_changed',
                    'order_version' => $version,
                ]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('order_events', fn (Blueprint $table) => $table->dropColumn(['action', 'reason', 'order_version']));
        Schema::dropIfExists('delivery_positions');
        Schema::dropIfExists('table_reservations');
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('dining_table_id');
            $table->dropConstrainedForeignId('delivery_zone_id');
            $table->dropConstrainedForeignId('delivery_assignee_id');
            $table->dropColumn(['party_size', 'delivery_zone_snapshot', 'delivery_assigned_at']);
        });
        Schema::dropIfExists('delivery_zones');
        Schema::dropIfExists('dining_tables');
    }
};
