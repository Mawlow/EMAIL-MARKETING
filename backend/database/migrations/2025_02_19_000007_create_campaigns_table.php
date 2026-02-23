<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('subject');
            $table->longText('body')->nullable()->comment('HTML body; null if body_file used');
            $table->string('body_file')->nullable()->comment('Path to file when body > 512KB');
            $table->string('template_key')->nullable()->comment('Prebuilt template identifier');
            $table->string('recipient_type', 48)->default('marketing_contacts');
            // marketing_contacts | all_companies | verified_companies | companies_with_active_jobs
            $table->string('status', 24)->default('draft'); // draft | scheduled | sending | completed | cancelled
            $table->unsignedInteger('total_recipients')->default(0);
            $table->unsignedInteger('sent_count')->default(0);
            $table->unsignedInteger('failed_count')->default(0);
            $table->unsignedInteger('pending_count')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaigns');
    }
};
