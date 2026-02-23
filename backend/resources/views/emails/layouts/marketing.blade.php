<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject ?? 'Email' }}</title>
    <style>
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f4f4f5; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #fff; padding: 24px; text-align: center; }
        .content { padding: 32px; color: #374151; line-height: 1.6; }
        .footer { padding: 24px; text-align: center; font-size: 12px; color: #9ca3af; }
        .footer a { color: #6b7280; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <h1 style="margin:0; font-size: 24px;">{{ $headerTitle ?? 'Newsletter' }}</h1>
        </div>
        <div class="content">
            {{ $slot ?? '' }}
        </div>
        <div class="footer">
            <p>You received this email because you are subscribed. <a href="{{ $unsubscribeUrl ?? '#' }}">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
