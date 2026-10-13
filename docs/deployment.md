# Deployment Configuration

The application starts in production-safe mode by default (`DEBUG=false`). Production startup requires an externally supplied `SECRET_KEY`, explicit `ALLOWED_HOSTS`, and PostgreSQL connection settings. No secret should be stored in the repository.

## Backend Environment

Configure these variables in the deployment platform's secret/environment manager:

- `SECRET_KEY`: generate a fresh key with `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` and store it as a secret.
- `DEBUG`: set to `false` in production. For local development, set `DEBUG=true`; SQLite and local CORS origins are then enabled by default.
- `ALLOWED_HOSTS`: comma-separated hostnames, without schemes, such as `school.example.com,api.example.com`.
- `DB_ENGINE`: production backend, normally `django.db.backends.postgresql`.
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`: PostgreSQL connection values; keep `DB_PASSWORD` in the secret manager.
- `DB_PORT`: defaults to `5432`.
- `DB_SSLMODE`: defaults to `require` in production.
- `DB_CONN_MAX_AGE`: persistent connection lifetime in seconds; defaults to `60`.
- `CORS_ALLOWED_ORIGINS`: comma-separated frontend origins including scheme, for example `https://school.example.com`.
- `CSRF_TRUSTED_ORIGINS`: comma-separated trusted origins including scheme. Defaults to `CORS_ALLOWED_ORIGINS`.
- `TIME_ZONE`: Django timezone used for date-sensitive rules; defaults to `UTC`.
- `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, `SECURE_HSTS_SECONDS`: security defaults are enabled for production. Override only to match a reviewed HTTPS/reverse-proxy setup.
- `TRUST_X_FORWARDED_PROTO`: set to `true` only when a trusted reverse proxy overwrites `X-Forwarded-Proto`.

Set the production frontend origin explicitly. Keep `CORS_ALLOW_CREDENTIALS=false` unless a reviewed cross-origin cookie-authentication requirement exists; the API currently uses bearer tokens.

## Account Provisioning

Use `python manage.py createsuperuser` for a platform `super_admin`. Create
school-scoped users through the authenticated school administration workflow,
which hashes passwords and creates the required role profile. If a database
repair is unavoidable, call `set_password()` from Django's shell; never write
the raw password to the `password` column. A valid password hash alone is not
enough for student, teacher, or parent accounts: those roles also require
their corresponding profile and an active school.

For a Vite build served from the same origin as the API proxy, the frontend defaults to `/api`. For a separate API host, build with `VITE_API_BASE_URL=https://api.example.com/api`. The frontend also accepts the backend origin without the `/api` suffix and adds it automatically.

## Release Steps

Install backend dependencies from `backend/requirements.txt`, run database migrations against the production database, then run `python manage.py check --deploy`. Serve `backend/staticfiles` through the chosen web/static server after `python manage.py collectstatic --noinput`. Terminate TLS at the application server or a correctly configured trusted proxy, and provision database backups and monitoring before enabling live users.

The settings module rejects production startup when required secret, host, or database configuration is missing. The committed SQLite database is development data and must not be used as a production database.