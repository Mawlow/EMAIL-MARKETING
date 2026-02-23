<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sender_accounts', function (Blueprint $table) {
            $table->dropColumn([
                'from_email',
                'from_name',
                'host',
                'port',
                'encryption',
                'password_encrypted',
                'username',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('sender_accounts', function (Blueprint $table) {
            $table->string('from_email')->after('name');
            $table->string('from_name')->nullable()->after('from_email');
            $table->string('host')->after('from_name');
            $table->unsignedSmallInteger('port')->default(587)->after('host');
            $table->string('encryption')->default('tls')->after('port');
            $table->text('password_encrypted')->nullable()->after('encryption');
            $table->string('username')->nullable()->after('password_encrypted');
        });
    }
};
