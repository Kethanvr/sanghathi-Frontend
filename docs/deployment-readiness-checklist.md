# Deployment Readiness Checklist

Date: 2026-04-19
Scope: sanghathi-Frontend + sanghathi-Backend

## Overall Status

- Frontend: Ready with warnings
- Backend: Partially ready (missing deployment automation and a few required env keys not present in local sample)
- Final verdict: Do not mark as fully production-ready until blocking items below are completed.

## 1. Build and Test Smoke Check

| Area | Command | Result | Notes |
|---|---|---|---|
| Frontend | npm run build | Pass | Build succeeds; large chunk warnings present |
| Frontend | npm run test | Pass | 9 tests passed |
| Backend | npm run build | Pass | TypeScript build step succeeds |
| Backend | npm run test | Pass | 25 tests passed |

## 2. CI and CD Pipeline Status

### Frontend

- CI exists: .github/workflows/ci.yml
- PR automation exists: .github/workflows/pr-automation.yml
- CD exists: .github/workflows/deploy.yml
- Deploy trigger: manual (workflow_dispatch), not automatic on merge

### Backend

- CI exists: .github/workflows/ci.yml
- PR automation exists: .github/workflows/pr-automation.yml
- CD pipeline: not found in repository workflows

## 3. Frontend Environment Variable Audit

Source-derived keys (src + vite.config.js):

- VITE_API_URL
- VITE_SOCKET_URL
- VITE_PYTHON_API
- VITE_GA_MEASUREMENT_ID
- VITE_CLOUDINARY_CLOUD_NAME
- VITE_SITE_URL
- BASE_URL
- PORT
- MODE and DEV (Vite built-ins)

Local env keys found in .env.local:

- BASE_URL
- VITE_API_URL
- VITE_CLOUDINARY_CLOUD_NAME
- VITE_GA_MEASUREMENT_ID
- VITE_PYTHON_API
- VITE_SOCKET_URL

Frontend env observations:

- VITE_SITE_URL is not set in .env.local; app has fallback default.
- deploy.yml passes the required VITE_* variables for build.
- deploy.yml includes GOOGLE_GEMINI_API_KEY, but frontend source does not use it.

## 4. Backend Environment Variable Audit

Source-derived keys (src + scripts):

- APP_NAME
- BACKEND_HOST
- CLIENT_HOST
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- CLOUDINARY_CLOUD_NAME
- DATABASE_PASSWORD
- DATABASE_URL
- GOOGLE_GEMINI_API_KEY
- JWT_COOKIE_EXPIRES_IN
- JWT_EXPIRES_IN
- JWT_SECRET
- MAIL_FROM
- MAIL_PASS
- MAIL_USER
- MONGODB_URI
- MONGODB_URI2
- MONGO_URI
- NODE_ENV
- OPENAI_API_KEY
- OPENAI_CHAT_MODEL
- PASSWORD_SALT
- PORT
- PYTHON_API
- RAG_COLLECTION_NAME
- RAG_DB_NAME
- RESEND_API_KEY
- RESEND_FROM_EMAIL
- RESEND_REPLY_TO
- RESET_PASSWORD_PATH

Local env keys found in .env.local:

- APP_NAME
- BASE_URL
- CLIENT_HOST
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- DATABASE_PASSWORD
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_GEMINI_API_KEY
- JWT_COOKIE_EXPIRES_IN
- JWT_EXPIRES_IN
- JWT_SECRET
- MONGODB_URI
- NODE_ENV
- OPENAI_API_KEY
- PASSWORD_SALT
- PORT
- PYTHON_API
- RESEND_API_KEY
- RESEND_FROM_EMAIL
- RESEND_REPLY_TO
- RESET_PASSWORD_PATH
- USERNAME
- VITE_GOOGLE_GEMINI_API_KEY

Backend env observations:

- Missing in local env but referenced by source: BACKEND_HOST, CLOUDINARY_CLOUD_NAME.
- MAIL_USER, MAIL_PASS, MAIL_FROM are referenced in src/routes/Student/sendEmail.js but notifications are skipped if missing.
- MONGO_URI and DATABASE_URL are fallbacks and optional when MONGODB_URI is set.
- MONGODB_URI2, OPENAI_CHAT_MODEL, RAG_DB_NAME, RAG_COLLECTION_NAME are optional with code defaults/fallback behavior.
- CLIENT_HOST is required for forgot-password flow URL generation.
- RESEND_API_KEY and RESEND_FROM_EMAIL are required for production password reset emails.

## 5. Blocking Items Before Production Sign-off

1. Add backend production env key CLOUDINARY_CLOUD_NAME.
2. Add backend production env key BACKEND_HOST.
3. Confirm backend production env has CLIENT_HOST set to the real frontend domain (non-localhost).
4. Ensure backend production env has JWT_SECRET, JWT_EXPIRES_IN, JWT_COOKIE_EXPIRES_IN, PASSWORD_SALT, MONGODB_URI, OPENAI_API_KEY, RESEND_API_KEY, RESEND_FROM_EMAIL.
5. Add a backend CD workflow (or documented deploy automation) for consistent production rollout.

## 6. Strongly Recommended Improvements

1. Add .env.example files in both repositories with required keys only.
2. Add backend health endpoint (for example /healthz) and wire platform health checks.
3. Restrict and standardize CORS/socket allowed origins to final production domains including www/non-www policy.
4. Remove unused secret injection from frontend deploy workflow (GOOGLE_GEMINI_API_KEY) unless intentionally needed.
5. Add backend CI test step (currently backend CI only installs, audits, and builds).
6. Consider automatic frontend deploy on merge to main (if desired release model is continuous delivery).

## 7. Reference Files

- .github/workflows/ci.yml (frontend)
- .github/workflows/deploy.yml (frontend)
- .github/workflows/pr-automation.yml (frontend)
- .github/workflows/ci.yml (backend)
- .github/workflows/pr-automation.yml (backend)
- .env.local (frontend)
- .env.local (backend)
- src/config.js (frontend)
- vite.config.js (frontend)
- src/server.js (backend)
- src/config.js (backend)
- src/utils/db.js (backend)
- src/utils/email.js (backend)
- src/controllers/authController.js (backend)
- src/config/cloudinary.js (backend)
- src/swagger.js (backend)
