<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('email');
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('phone')->nullable();
            $table->json('custom_attributes')->nullable();
            $table->boolean('is_marketing')->default(true);
            $table->timestamps();

            $table->unique(['company_id', 'email']);
            $table->index(['company_id', 'is_marketing']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};
