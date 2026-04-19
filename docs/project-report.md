# Sanghathi Master Project Report

Date: 2026-04-19
Prepared for: Project Documentation and Operations Handoff
Prepared by: Sanghathi Engineering Documentation (workspace-generated)

## 1. Executive Overview

Sanghathi is an AI-powered mentoring platform designed to unify academic mentoring workflows for students, faculty, HOD, directors, and administrators. It centralizes student lifecycle records, mentoring sessions, communication, score tracking, reporting, and AI-assisted guidance into one role-based web application.

This report consolidates project identity, repositories, deployment footprint, architecture, database model references, contributors, current status, and operational tooling in a single document.

## 2. Project Identity

- Project Name: Sanghathi - AI-Powered Mentoring Tool
- Product Type: Full-stack web platform (frontend + backend + managed cloud services)
- Primary Domain: https://sanghathi.com
- Official Repositories:
- Frontend: https://github.com/Sanghathi/sanghathi-Frontend
- Backend: https://github.com/Sanghathi/sanghathi-Backend
- License: MIT (both repos)

## 3. Repository and Source Control Landscape

### 3.1 Frontend Repository

- Repository: Sanghathi/sanghathi-Frontend
- Framework: React + Vite
- Package Manager: Bun (configured)
- Build Output: dist
- SPA Rewrite Strategy: enabled for direct route navigation

### 3.2 Backend Repository

- Repository: Sanghathi/sanghathi-Backend
- Framework: Node.js + Express
- Runtime Packaging: Bun-compatible + Node production start
- Real-time Layer: Socket.IO
- API Prefix: /api/*

### 3.3 Fork and Collaboration Context

- Community forks exist for contribution and experimentation.
- Contributor view screenshots show active multi-contributor history across both frontend and backend repositories.

## 4. Deployment and Infrastructure Footprint

## 4.1 Frontend Deployment

- Platform: Netlify
- Evidence: netlify.toml is configured with Bun build and dist publish directory.
- Build Command: bun run build
- Publish Directory: dist
- SPA Redirect: /* -> /index.html (status 200)
- Security Headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, CSP placeholder flow

## 4.2 Backend Deployment

- Container Profile: Dockerfile based on oven/bun:1.3.10-slim
- Runtime Command: bun run start
- Exposed Port in container: 3000
- Service Runtime Code Port: process.env.PORT or 3000 in backend server startup
- CORS Includes: localhost environments and https://sanghathi.com
- Fly.io presence is shown in screenshots for backend machine orchestration and scaling controls.

## 4.3 Edge, DNS, and Traffic Layer

- Cloudflare is actively used for domain analytics, caching, and traffic/security controls.
- Core Web Vitals and web analytics data are visible in Cloudflare dashboard screenshots.

## 4.4 Database Infrastructure

- Database Platform: MongoDB Atlas
- Primary App Database (documented): cmrit
- Atlas project/cluster presence is visible in screenshots.
- Atlas tooling shown: collections, query insights, vector search, monitoring.

## 4.5 Email and Communication Infrastructure

- Transactional Email Provider: Resend
- Domain verification visible in screenshots: send.sanghathi.com (verified)
- Backend integrates Resend for password reset and mail workflows.

## 4.6 Search and SEO Tooling

- Google Search Console property for sanghathi.com is configured.
- Indexing/performance data is in early collection state in screenshots.
- Frontend includes SEO artifacts:
- robots.txt
- sitemap.xml
- page-level metadata enhancements

## 5. Technology Stack

### 5.1 Frontend Stack

- React
- Vite
- Material UI (MUI)
- Emotion
- React Router DOM
- React Hook Form + Yup
- Notistack
- Framer Motion
- FullCalendar
- Socket.IO Client
- Google Generative AI SDK usage in app context
- React Helmet Async (SEO metadata support)
- Vitest + Testing Library

### 5.2 Backend Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Socket.IO
- Swagger (OpenAPI docs)
- Helmet, rate limiting, mongo-sanitize, xss-clean
- Resend (email)
- Cloudinary (media)
- Winston logging stack
- Joi/Zod validation usage in parts of system

### 5.3 DevOps and Runtime Tooling

- Bun package/runtime tooling
- Docker image pipeline for backend
- Netlify deployment for frontend
- Fly.io operational interface for backend machines
- Atlas backup and operational scripts in project scripts

## 6. Functional Architecture

## 6.1 Core Product Domains

1. Authentication and Role-Based Access
- Login, signup, forgot/reset password, protected routing per role

2. Student Lifecycle Data
- Admissions, academics, attendance, profile, guardian/contact context

3. Mentorship Operations
- Mentor-mentee mapping, mentee dashboards, mentor details, conversations

4. Career and Placement Tracking
- Career counseling, clubs, activities, MOOC, mini-projects, placement, internships, projects

5. Communication and Collaboration
- Threads, private conversations, group conversations, offline mentorship logs

6. Academic Performance
- IAT, external marks, PO attainment, TYL score modules

7. Notifications and Meetings
- Alerting flows, meeting support, dashboard-level updates

8. AI-Assisted Features
- Campus Buddy and AI integration surfaces

## 6.2 Role-Centric Navigation

Primary dashboards and role routes are documented in the project root dashboard inventory:
- Student
- Faculty
- Admin
- HOD
- Director
- Mentee dashboard variants

## 7. Backend API Surface (High-Level)

From backend route registration, major API groups include:

- /api/users
- /api/messages
- /api/meetings
- /api/mentors
- /api/mentorship
- /api/notifications
- /api/campus-buddy
- /api/private-conversations
- /api/conversations
- /api/threads
- /api/students and student subdomains
- /api/student-profiles
- /api/faculty
- /api/career-counselling
- /api/proffessional-body
- /api/mooc-data
- /api/project
- /api/activity-data
- /api/hobbies-data
- /api/placement and /api/placement/project
- /api/po-attainment
- /api/tyl-scores
- /api/forms
- /api/admin

This indicates a broad domain-first API segmentation aligned to frontend modules.

## 8. Database Architecture and ER Model

Database documentation is already maintained in dedicated blueprint docs and ER sources.

### 8.1 Current-State Database Documentation

- Blueprint entry: docs/database/README.md
- Current schema narrative: docs/database/current-schema.md
- Current ER (Mermaid): docs/database/er/current-schema.mmd
- Current ER (DBML): docs/database/er/current-schema.dbml

### 8.2 Proposed-State Database Documentation

- Proposed schema narrative: docs/database/proposed-schema.md
- Change matrix: docs/database/change-matrix.md
- Migration plan: docs/database/migration-plan.md
- Draft/version architecture: docs/database/draft-sync-versioning-plan.md
- Proposed ER (Mermaid): docs/database/er/proposed-schema.mmd
- Proposed ER (DBML): docs/database/er/proposed-schema.dbml

### 8.3 Current Data Model Observations

- Identity and role core in users + roles
- Multiple user-linked collections in student/career/placement domains
- Mentorship and communication models with conversation/thread/message entities
- Migration direction defined toward more consolidated, access-pattern-aligned models
- Form draft and versioning architecture added for resilience and recovery workflows

## 9. Contributors and Team Attribution

Contributors referenced in frontend/backend documentation and repository contributor context:

- shovan-mondal
- monu564100
- SUJAY-HK
- Kulsum06
- Sai-Emani25
- vsuryacharan
- advitha24
- Kethan VR

Note:
- Frontend README and backend README both explicitly list contributor groups.
- GitHub contributor graph screenshots show active contribution distribution.

## 10. Environment and Service Matrix

| Area | Platform/Service | Notes |
|---|---|---|
| Frontend hosting | Netlify | Bun build configured |
| Backend runtime | Bun + Node server flow | Dockerized backend runtime |
| Backend operations panel | Fly.io | Machines/scaling visible in screenshots |
| Database | MongoDB Atlas | Project/cluster active |
| DNS/Edge analytics | Cloudflare | Web analytics and core vitals shown |
| Transactional email | Resend | Domain send.sanghathi.com verified |
| Search indexing insights | Google Search Console | Property configured for sanghathi.com |
| Media storage | Cloudinary | Env + integration present |
| Realtime comms | Socket.IO | Backend + frontend integration present |
| AI capabilities | Gemini/Google Generative AI | Campus Buddy and AI flows |

## 11. Current Status Snapshot

### 11.1 Verified from Repository Configuration

- Frontend build/deploy pipeline is configured for Netlify.
- Backend containerization is configured via Dockerfile.
- Backend service starts app + socket server and includes production middleware/security stack.
- Database blueprint and ER documentation are available and organized.
- SEO support artifacts are present in frontend public assets.

### 11.2 Verified from Provided Dashboard Screenshots

- Backend Fly.io app appears deployed with running machines.
- Netlify project panel shows production deploy presence.
- Cloudflare analytics dashboard is active for sanghathi.com.
- Resend domain is verified.
- Google Search Console property is present and collecting initial data.
- MongoDB Atlas project/cluster dashboard is active.

### 11.3 Needs Confirmation (Operationally)

- Exact backend production public URL mapping and health endpoint consistency.
- Final production environment variable parity across all platforms.
- Alerting/SLO and incident response setup maturity.
- Search console indexing coverage after sitemap submission propagation.

## 12. Deployment Flow (Practical View)

1. Frontend source builds through Bun/Vite and deploys on Netlify.
2. Backend source builds in Bun-based Docker image and deploys to runtime infrastructure (Fly.io panel shown).
3. Domain traffic and edge analytics are managed through Cloudflare.
4. Backend persists and queries data through MongoDB Atlas cluster.
5. Email communications are delivered through Resend verified sending domain.
6. SEO and search indexing are tracked through Google Search Console.

## 13. Security and Reliability Controls (Observed)

- Helmet and HTTP hardening middleware
- Rate limiting for API routes
- Input sanitization against NoSQL injection and XSS
- Role-protected routes and JWT workflow
- Backup and recovery-oriented scripts documented and evolving
- Operational docs and phased hardening logs in docs/kethan

## 14. Risks and Improvement Opportunities

1. Data model fragmentation in legacy/current-state collections may increase operational complexity.
2. Some domain naming inconsistencies (historical spellings) can affect maintainability.
3. Route/module growth suggests need for ongoing API contract and schema governance.
4. Analytics/search tooling is active, but indexing and performance insights are still maturing.
5. Continued standardization of deployment observability and rollback drills is recommended.

## 15. Recommended Next Actions

1. Keep this report versioned and update monthly with deployment/status changes.
2. Add a release and environment matrix section tied to git tags and deployment IDs.
3. Add architecture diagrams (C4-style service/context) in docs/architecture.
4. Expand database section with collection-level query/index SLO notes.
5. Include formal incident response and backup restore runbook links.

## 16. Evidence and Reference Files

Project and module docs:
- README-LOGINS-DASHBOARDS.md
- sanghathi-Frontend/README.md
- sanghathi-Backend/README.md

Deployment and runtime configs:
- sanghathi-Frontend/netlify.toml
- sanghathi-Backend/Dockerfile
- sanghathi-Backend/src/server.js
- sanghathi-Backend/src/index.js

Database and ER docs:
- sanghathi-Frontend/docs/database/README.md
- sanghathi-Frontend/docs/database/current-schema.md
- sanghathi-Frontend/docs/database/proposed-schema.md
- sanghathi-Frontend/docs/database/change-matrix.md
- sanghathi-Frontend/docs/database/migration-plan.md
- sanghathi-Frontend/docs/database/draft-sync-versioning-plan.md
- sanghathi-Frontend/docs/database/er/current-schema.mmd
- sanghathi-Frontend/docs/database/er/current-schema.dbml
- sanghathi-Frontend/docs/database/er/proposed-schema.mmd
- sanghathi-Frontend/docs/database/er/proposed-schema.dbml

---

Document note:
This report is generated from repository evidence and provided operational screenshots. It is intended as a detailed project dossier for technical review, handoff, and institutional documentation.
