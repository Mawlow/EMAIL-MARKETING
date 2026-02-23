# FH CRM

Multi-tenant CRM with email marketing and SMS alerts. Laravel 12 (PHP 8.4) backend and React (Vite) frontend.

## Features

- **Roles**: Admin (platform monitor) and Company (full campaign management)
- **Multi-tenancy**: Data isolated by `company_id` on campaigns, contacts, sender accounts, logs
- **Campaigns**: Subject, rich HTML body, optional attachments, prebuilt templates; bodies >512KB stored as files
- **Recipients**: Marketing contacts, all companies, verified companies, or companies with active jobs
- **Contacts**: Manual add or CSV import with auto-detection of email column
- **SMTP senders**: Multiple per company, encrypted passwords (Laravel Crypt), enable/disable and rotation
- **Queues**: Database driver, one job per recipient, configurable delay between emails
- **Tracking**: Per-email logs (pending/sent/failed), campaign analytics, paginated filterable UI
- **Unsubscribe** links and suppression lists
- **Optional**: SMS notification to company after campaign completion
- **Admin**: Manage companies, approve/verify/disable, view all campaigns and analytics (no sending, no SMTP access)

## Requirements

- PHP 8.4+
- Composer
- Node 18+
- SQLite (or MySQL/PostgreSQL)

## Backend (Laravel)

```bash
cd backend
cp .env.example .env
php artisan key:generate
# Configure DB in .env (default SQLite)
php artisan migrate
php artisan db:seed   # Creates admin@example.com / company@example.com with password "password"
php artisan serve --port=8000
```

API base: `http://localhost:8000/api`

### Env (optional)

- `CAMPAIGN_DELAY_BETWEEN_EMAILS` – seconds between each email (default 2)
- `CAMPAIGN_MAX_SEND_RETRIES` – retries for failed sends (default 3)
- `CAMPAIGN_SMS_ON_COMPLETION` – set true to send SMS on completion
- `SMS_DRIVER`, `SMS_URL`, `SMS_API_KEY` – for SMS provider

## Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Set `VITE_API_URL=http://localhost:8000/api` if not using the Vite proxy (see `vite.config.js` proxy to port 8000).

## Default logins (after seed)

- **Admin**: `admin@example.com` / `password`
- **Company**: `company@example.com` / `password`

## Project structure

- `backend/` – Laravel 12
  - `app/Http/Controllers/Api/` – Auth, Admin, Company controllers
  - `app/Services/` – CampaignRecipientService, CampaignSendService, SenderAccountRotationService, CampaignBodyService
  - `app/Jobs/` – SendCampaignEmailJob, SendCampaignCompletionSmsJob
  - `app/Mail/` – CampaignMailable
  - `config/email_campaign.php` – campaign and attachment config
- `frontend/` – React + Vite
  - `src/api/client.js` – API client (auth, admin, company)
  - `src/context/AuthContext.jsx` – auth state
  - `src/pages/` – Login, Register, Admin (Companies, Campaigns, Analytics), Company (Campaigns, Contacts, Senders, Suppression, Analytics)

## Unsubscribe

GET `/unsubscribe?email=...&company=<company_id>` adds the email to the company's suppression list and shows a confirmation page.

## Production

- Use MySQL/PostgreSQL and Redis for queue/cache if needed
- Run queue workers (e.g. Supervisor)
- Set `APP_DEBUG=false`, strong `APP_KEY`
- Configure CORS and Sanctum stateful domains if frontend is on another domain
