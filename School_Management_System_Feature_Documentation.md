# School Management System — Feature Documentation

**Product:** H-School (unified school management platform)
**Stack:** Django 6 + Django REST Framework + SimpleJWT + django-filter (backend) · React 19 + Vite + React Router + Tailwind CSS 4 + Recharts (frontend)
**Database:** SQLite (development) / PostgreSQL (production)
**Document status:** Reflects the current implementation, including the functionality/completeness pass described in the change log at the end.

---

## 1. Overview

H-School is a role-aware school administration platform. It centralizes student records, academics, attendance, examinations, and finance into one system where each authenticated user sees only the data and actions their role permits. Access is enforced on the server (Django REST permissions + per-role querysets), not only in the UI.

---

## 2. User Roles

| Role key | Display | Scope |
|---|---|---|
| `super_admin` | Platform Admin | All schools (cross-tenant) |
| `school_admin` / `admin` | School Administrator | One school, full control |
| `principal` | Principal | One school, read/report oriented |
| `accountant` | Accountant | Invoices, payments, fee structures |
| `receptionist` | Receptionist | Student/guardian intake |
| `teacher` | Teacher | Own courses, attendance, results |
| `student` | Student | Own records only |
| `parent` | Guardian | Own children's records only |

> Note: all non-`super_admin` users must belong to a school (enforced at the model level).

---

## 3. Modules & Feature Status

Legend: **Implemented** — backed by real API + working UI · **Partial** — works but has known gaps · **Not implemented** — no backend module (UI may exist as a shell).

### 3.1 Authentication — Implemented
- JWT login (`/api/auth/login/`), token validation, and `/api/auth/me/`.
- Roles and school scoping carried in the token/user object.
- Login screen has a credentials tab and a faculty SSO tab. SSO is **not configured** in this deployment; the UI states this honestly instead of faking a login.
- Public self-registration is **not supported**: account creation is staff-provisioned (`/api/auth/register/` requires an authenticated administrator). The public register route/links were removed to avoid presenting a non-functional flow. Accounts are created by an administrator/receptionist.

### 3.2 Dashboard — Implemented (role-aware)
- Endpoint `/api/dashboard/` returns different payloads per role (super admin, admin/principal/receptionist, accountant, teacher, student, parent).
- UI keeps its original layout and components; every figure is now sourced from the API or shown as an honest empty state (`—` / "No data available"). The previously hardcoded admin numbers and invented trend charts were removed.
- Metric cards, a records-summary panel, and a present/absent/late attendance breakdown render from real data. When the API returns no trend series, the chart area shows an empty state rather than fabricated values.

### 3.3 Students — Implemented / Partial
- Full CRUD via `/api/students/` (role-scoped querysets; students see only themselves, teachers see their enrolled students, parents see their children).
- Actions: `promote` and `deactivate` (administrator only), with an academic-history record.
- Student list, search/filter, and "Export Analytics (PDF)" generate a real PDF.
- Partial: the admissions "pipeline"/applicant-scoring section is presentational.

### 3.4 Teachers — Implemented
- CRUD via `/api/teachers/`, scoped to the school.

### 3.5 Courses & Enrollments — Implemented
- Courses `/api/courses/`; enrollments `/api/courses/enrollments/`.
- Attendance and results rely on active enrollments (`CourseEnrollment`).

### 3.6 Attendance — Implemented
- `/api/attendance/` records are unique per (student, course, date).
- Statuses are limited to `present`, `absent`, `late` (the previous `excused` option was invalid and has been removed).
- The page is now fully data-driven:
  - Managers (admin/school_admin/teacher) get a course-ledger view and a marking sheet whose roster is derived from real enrollments for the selected course.
  - Students/guardians get a read-only personal attendance table.
- Saving performs an upsert (PATCH when a record exists, POST otherwise), surfaces per-entry failures, and refreshes from the server.
- "Export CSV" produces the real ledger; the previously hardcoded sessions, rates, and "SMS protocol" copy were removed.
- Server rule: teachers may only enter/edit attendance for **today** and only for courses they are assigned to.

### 3.7 Exams & Results — Implemented
- `/api/results/` with marks/grade; results are only exposed to students/guardians once published (`Result.objects.published()`).
- Publish/unpublish actions now call the real endpoints (`/api/results/{id}/publish/` and `/unpublish/`); unpublish requires a reason.

### 3.8 Finance — Implemented
- Invoices `/api/invoices/`, payments `/api/invoices/payments/`, fee structures `/api/invoices/fees/`, summary `/api/invoices/summary/`, audit `/api/invoices/audit/`.
- Invoice records expose `paid_amount` and `balance_due`.
- Accountants can record payments; the summary figures (total, collected, unpaid) come from the API.
- "Receipt" downloads a real PDF; paid invoices show a receipt action, non-accountants see a read-only state.

### 3.9 Academic Periods — Implemented / Partial
- Academic years and terms via the accounts academic endpoints.
- "Download Master Term PDF" produces a real PDF.
- Partial: the visual timeline is presentational.

### 3.10 Guardians — Implemented
- Guardian records via `/api/auth/guardians/` and the guardian portal view.

### 3.11 Platform Admin — Implemented
- Super-admin school and user administration via `/api/auth/schools/` and `/api/auth/users/`.

### 3.12 Mentorship — Not implemented (UI shell only)
- There is **no backend module** for mentorship. The page currently shows sample content.
- Its "Download Report (PDF)" and "Download Matrix" actions now generate real PDFs from the on-page data, but the underlying data has no API source.
- **Action item (deferred by request):** design and implement mentorship models/endpoints in a later pass; the page should then be wire up to real data.

### 3.13 Public Landing Page — Implemented
- The only page intentionally redesigned in this pass.
- Neutral, accurate copy (no invented claims such as a "#1 Globally Ranked" badge, which was removed).
- Working anchor navigation and functional dropdowns in the public header, plus a mobile menu; all header items resolve to on-page sections or the login page.
- All CTAs route to `/login`.

---

## 4. API Reference (prefixes)

| Prefix | App | Notes |
|---|---|---|
| `/api/auth/` | accounts | login, me, users, schools, guardians, academic-years, terms |
| `/api/students/` | students | student registry, promote, deactivate |
| `/api/teachers/` | teachers | teacher registry |
| `/api/courses/` | courses | courses, `enrollments/` |
| `/api/attendance/` | attendance | per (student, course, date) |
| `/api/invoices/` | finance | invoices, `payments/`, `fees/`, `summary/`, `audit/` |
| `/api/results/` | results | marks/grade, `publish/`, `unpublish/` |
| `/api/dashboard/` | dashboard | role-aware summary payload |

List endpoints return arrays (DRF pagination is not enabled); the frontend handles `data.results || data`.

---

## 5. Downloads & Exports

A shared, dependency-free client utility now backs all download actions (`frontend/src/utils/pdfGenerator.js` and `frontend/src/utils/exportUtils.js`).

| Action | Page | Output |
|---|---|---|
| Bulk Export CSV | Attendance | CSV of attendance ledger |
| Export Analytics (PDF) | Students | PDF summary |
| Download Master Term PDF | Academic Periods | PDF of years/terms |
| Download Report (PDF) | Mentorship | PDF from on-page data |
| Download Matrix | Mentorship | PDF from on-page data |
| Receipt | Finance | PDF payment receipt |
| Publish / Unpublish | Results | Real API state change |

---

## 6. Role-Based Access (frontend guard)

`frontend/src/utils/roleAccess.js` maps routes to allowed roles; `RequireAuth` enforces the token and role before rendering, using the reactive router location and a guarded JSON parse. Server-side permissions remain the source of truth.

---

## 7. Security Notes

- All privileged endpoints enforce authentication and role/school scoping server-side.
- Results are filtered to published records for student/guardian access.
- Attendance edits by teachers are restricted to today and to their own courses.
- User provisioning is staff-only; there is no public registration path.
- Result publish/unpublish actions are now guarded by explicit permission classes (`CanPublishResults`, `CanUnpublishResults`) instead of in-body role checks.
- A backend test suite (`backend/accounts/tests.py`) verifies authentication requirements, student/parent isolation, cross-school isolation, teacher course scoping, and result publishing rules.

---

## 8. Known Limitations / Deferred Work

1. **Mentorship backend** — module not implemented; deferred by request. Page is a shell.
2. **Dashboard trend charts** — the API does not expose time-series data, so trend charts are replaced with real breakdowns/empty states instead of fabricated data.
3. **Admissions pipeline / academic timeline sections** — presentational. A few in-page action buttons in the Admissions pipeline, Mentorship, and Academic Periods sections are UI placeholders (they show informational messages) because there is no backing API for those specific actions.
4. **Notifications (email/SMS), Celery/Redis, payment gateways** — described in `docs/project.md` as target architecture; not part of the current implementation.
5. **Password reset / SSO** — not configured; the UI states this rather than simulating it.

---

## 9. Build & Run

Backend:
```
cd backend
$env:DEBUG="true"; $env:SECRET_KEY="local-test-secret"
python manage.py migrate
python manage.py runserver
```

Frontend:
```
cd frontend
npm install
npm run dev      # development
npm run build    # production bundle
npm run lint
```

Environment: `frontend/.env.example` documents `VITE_API_BASE_URL=/api`.

Tests:
```
cd backend
$env:DEBUG="true"; $env:SECRET_KEY="local-test-secret"
python manage.py test accounts
```

---

## 10. Change Log (this pass)

- Wired all previously non-functional download/export actions to real generators (Attendance, Students, Academic Periods, Mentorship, Finance).
- Converted `index.css` to Tailwind v4 syntax and removed the CDN; the build now emits a self-contained stylesheet.
- Rebuilt the public landing page and public header/nav (working anchors, dropdowns, mobile menu); removed fabricated institutional claims.
- Removed the fabricated "Oakridge Academy" institution name throughout the UI in favour of the platform brand / the user's real school name.
- Hardened the route guard (reactive location, safe JSON parse).
- Removed the non-functional public registration route and links.
- Made the Dashboard fully data-driven and role-aware while preserving its layout.
- Rewrote Attendance to be data-driven (real courses/enrollments, correct statuses, upsert save, honest metrics) while preserving its layout.
- Fixed Finance (payment POST, duty-gated receipt, summary fields) and Results (real publish/unpublish).
- Removed hardcoded login credentials from the SSO tab.
- Added a backend RBAC/IDOR test suite (13 tests, all passing) and refactored result publish/unpublish onto explicit permission classes.
