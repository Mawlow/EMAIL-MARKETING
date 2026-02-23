<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Campaign body size threshold (bytes)
    |--------------------------------------------------------------------------
    | When campaign body exceeds this size, it is stored as a file.
    */
    'body_file_threshold' => env('CAMPAIGN_BODY_FILE_THRESHOLD', 512 * 1024), // 512KB

    /*
    |--------------------------------------------------------------------------
    | Delay between emails (seconds)
    |--------------------------------------------------------------------------
    */
    'delay_between_emails' => (int) env('CAMPAIGN_DELAY_BETWEEN_EMAILS', 2),

    /*
    |--------------------------------------------------------------------------
    | Max retries for failed emails
    |--------------------------------------------------------------------------
    */
    'max_send_retries' => (int) env('CAMPAIGN_MAX_SEND_RETRIES', 3),

    /*
    |--------------------------------------------------------------------------
    | Attachments disk and directory
    |--------------------------------------------------------------------------
    */
    'attachments_disk' => env('CAMPAIGN_ATTACHMENTS_DISK', 'local'),
    'attachments_directory' => 'campaign_attachments',

    /*
    |--------------------------------------------------------------------------
    | Body files directory (for large bodies)
    |--------------------------------------------------------------------------
    */
    'body_files_directory' => 'campaign_bodies',

    /*
    |--------------------------------------------------------------------------
    | Send SMS on campaign completion
    |--------------------------------------------------------------------------
    */
    'sms_on_completion' => (bool) env('CAMPAIGN_SMS_ON_COMPLETION', false),

    /*
    |--------------------------------------------------------------------------
    | Unsubscribe URL path (relative to app URL)
    |--------------------------------------------------------------------------
    */
    'unsubscribe_path' => 'unsubscribe',

    /*
    |--------------------------------------------------------------------------
    | Use default mail driver in local (for testing without SMTP)
    |--------------------------------------------------------------------------
    | When true and APP_ENV=local, campaign emails are sent via the default
    | mail driver (e.g. "log") instead of the sender's SMTP. Emails appear
    | in storage/logs/laravel.log and the campaign completes successfully.
    */
    'use_default_mailer_in_local' => env('CAMPAIGN_USE_DEFAULT_MAILER_IN_LOCAL', true),

];
