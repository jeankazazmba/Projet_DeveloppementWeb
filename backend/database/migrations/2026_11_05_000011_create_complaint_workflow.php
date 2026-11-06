<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedInteger('version')->default(1);
            $table->index(['user_id', 'created_at']);
        });
        Schema::create('complaint_messages', function (Blueprint $table) {
            $table->id();
            $table->string('complaint_id', 80);
            $table->foreign('complaint_id')->references('id')->on('complaints')->cascadeOnDelete();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('kind', 30);
            $table->string('visibility', 20);
            $table->text('body');
            $table->timestamp('created_at')->useCurrent();
            $table->index(['complaint_id', 'created_at']);
        });
        Schema::create('complaint_attachments', function (Blueprint $table) {
            $table->id();
            $table->string('complaint_id', 80);
            $table->foreign('complaint_id')->references('id')->on('complaints')->cascadeOnDelete();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('path');
            $table->string('original_name');
            $table->string('mime_type', 100);
            $table->unsignedInteger('size_bytes');
            $table->string('visibility', 20);
            $table->timestamp('created_at')->useCurrent();
            $table->index(['complaint_id', 'created_at']);
        });
        Schema::create('complaint_events', function (Blueprint $table) {
            $table->id();
            $table->string('complaint_id', 80);
            $table->foreign('complaint_id')->references('id')->on('complaints')->cascadeOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('from_status', 40)->nullable();
            $table->string('to_status', 40);
            $table->text('reason')->nullable();
            $table->unsignedInteger('complaint_version');
            $table->timestamp('created_at')->useCurrent();
            $table->index(['complaint_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaint_events');
        Schema::dropIfExists('complaint_attachments');
        Schema::dropIfExists('complaint_messages');
        Schema::table('complaints', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'created_at']);
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn('version');
        });
    }
};
