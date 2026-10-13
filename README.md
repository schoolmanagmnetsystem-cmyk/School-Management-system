# School Management System

A full-stack school management application built with Django REST Framework and a React/Vite frontend. It provides role-based administration for accounts, students, teachers, courses, attendance, results, invoices, and fees.

## Features

- Django backend with REST APIs and JWT authentication
- React single-page application with role-aware navigation
- School, academic period, course, enrollment, attendance, and result management
- Student and teacher profiles
- Fee structures, invoices, and invoice status workflows
- Dashboard analytics and charts
- Django admin access
- Environment-based database and security configuration
- Database migrations with descriptive, ordered migration names

## Technology Stack

### Backend

- Django 6.0.3
- Django REST Framework
- Django Simple JWT
- Django Filter
- Django CORS Headers
- PostgreSQL in production
- SQLite for local development

### Frontend

- React 19
- Vite 8
- React Router
- Axios
- Framer Motion
- Lucide Icons
- Recharts
- Tailwind CSS 4
- ESLint

## Project Structure

```text
backend/                 Django API and database configuration
  accounts/              User, school, role, and academic-period APIs
  attendance/           Attendance records
  courses/               Courses and enrollments
  finance/               Fees, invoices, and payment-related records
  results/               Results and publication state
  students/              Student profiles and academic history
  teachers/              Teacher profiles
  dashboard/             Dashboard endpoints
  core/                  Settings, URLs, and shared configuration
frontend/               React/Vite application
  src/app/               Application routing and state
  src/pages/              User-facing pages
  src/components/        Reusable UI components
  src/utils/              Shared frontend utilities
docs/                   Architecture and deployment documentation
```

## Prerequisites

- Python 3.14 or newer
- Node.js 20 or newer
- npm
- PostgreSQL optional for production; SQLite is supported for local development

## Local Setup

### 1. Backend

From the repository root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

For local development, configure the environment:

```powershell
$env:DEBUG = "true"
$env:SECRET_KEY = "local-development-secret"
$env:ALLOWED_HOSTS = "localhost,127.0.0.1"
$env:CORS_ALLOWED_ORIGINS = "http://localhost:5173"
$env:CSRF_TRUSTED_ORIGINS = "http://localhost:5173"
```

Apply the database migrations and create a development superuser:

```powershell
python manage.py migrate
python manage.py createsuperuser
```

`createsuperuser` creates a `super_admin` account. For school-scoped accounts,
use the authenticated administrative workflow in the application or API so the
school and role-specific profile are created together.

Never insert a plaintext password into the database. If an account must be
repaired through Django's shell, use Django's password hasher:

```powershell
python manage.py shell
```

```python
from accounts.models import CustomUser
user = CustomUser.objects.get(username='existing-username')
user.set_password('new-password')
user.is_active = True
user.save(update_fields=['password', 'is_active'])
```

Direct database inserts must provide a unique username and email, a supported
role, an active school for non-`super_admin` users, and the required
`Student`, `Teacher`, or `Guardian` profile for student, teacher, or parent
accounts. The login endpoint intentionally rejects incomplete account setup.

Start the backend API:

```powershell
python manage.py runserver
```

The API is available at `http://127.0.0.1:8000`.

### 2. Frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The Vite development server is available at `http://localhost:5173` and proxies API requests to the Django server.

## Environment Variables

| Variable | Required | Purpose |
|---|---:|---|
| `DEBUG` | Local only | Enables development settings and SQLite |
| `SECRET_KEY` | Yes | Django secret key |
| `ALLOWED_HOSTS` | Yes | Comma-separated allowed hosts |
| `CORS_ALLOWED_ORIGINS` | Yes | Comma-separated frontend origins |
| `CSRF_TRUSTED_ORIGINS` | Yes | Comma-separated trusted origins |
| `DB_ENGINE` | Production | Database backend |
| `DB_NAME` | Production | PostgreSQL database name |
| `DB_USER` | Production | PostgreSQL user |
| `DB_PASSWORD` | Production | PostgreSQL password |
| `DB_HOST` | Production | PostgreSQL host |
| `DB_PORT` | No | PostgreSQL port; defaults to `5432` |
| `DB_SSLMODE` | No | PostgreSQL SSL mode; defaults to `require` |
| `VITE_API_BASE_URL` | No | Frontend API base URL |

Do not commit environment secrets. The settings reject production startup when required security and database values are missing.

## Backend Commands

```powershell
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py migrate
python manage.py migrate backend_name migration_name
python manage.py createsuperuser
python manage.py collectstatic --noinput
```

Migration filenames retain a numeric ordering prefix, for example `0002_add_school_to_student.py`. The suffix describes the operation, while the prefix preserves Django migration ordering.

## Frontend Commands

```powershell
npm run dev       # Start the development server
npm run build     # Create a production build
npm run lint      # Run ESLint
npm run preview   # Preview the production build
```

## Testing

Run the backend test suite with Django's built-in test runner:

```powershell
python manage.py test
```

Run the frontend checks with:

```powershell
npm run lint
npm run build
```

## Migration Safety

- Keep migration filenames ordered by their numeric prefix.
- Use descriptive suffixes such as `add_school_to_student` or `require_student_school`.
- Update migration dependencies when a migration file is renamed.
- Never edit an applied migration's operations without a new migration.
- Run `python manage.py makemigrations --check --dry-run` before merging schema changes.

## Documentation

- [Project architecture](docs/project.md)
- [Deployment configuration](docs/deployment.md)

## License

This project is maintained as an open-source school management system. Add the project's license details here when a license file is introduced.
