<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sender_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('from_email');
            $table->string('from_name')->nullable();
            $table->string('host');
            $table->unsignedSmallInteger('port')->default(587);
            $table->string('encryption')->default('tls'); // tls, ssl, null
            $table->text('password_encrypted')->comment('Laravel Crypt encrypted password');
            $table->string('username')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('send_count')->default(0)->comment('For rotation ordering');
            $table->timestamps();

            $table->index(['company_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sender_accounts');
    }
};
