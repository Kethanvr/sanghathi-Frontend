# Sangathi 2.0 - What's New

Last updated: 2026-04-19
Audience: All users (Students, Faculty, Mentors, Admin, HOD, Director)

Sangathi 2.0 is here with a major upgrade focused on better usability, faster workflows, stronger reliability, and cleaner role-based experiences.

## Launch Message Copy

Sangathi 2.0 is here.

We have rolled out a smoother dashboard experience, stronger mentoring workflows, better mobile usability, faster data screens, richer profile and avatar support, improved chat and thread interactions, safer account recovery, and a more reliable admin data pipeline.

## Major Updates Rolled Out

1. Unified dashboard experience across roles
- Added a shared dashboard hero card for Student, Faculty, Admin, HOD, and Director dashboards.
- Improved profile greeting, identity visibility, and avatar fallback consistency.

2. Better mentor and mentee visibility
- Mentor and mentee lists now use improved avatar/photo rendering.
- Mentor details are more resilient, including fallback profile handling.
- Faculty profile information and mentor details UI were improved for clarity and contact actions.

3. Stronger conversation and thread UX
- Improved mentor-mentee conversation and thread dialog behavior.
- Added better participant enrichment (including role context) and avatar consistency.
- Improved message readability and contextual interaction quality.

4. Faster APIs and reduced overfetching
- Added pagination and filtering to multiple endpoints.
- Improved response structures to include useful pagination details.
- Added model/query optimizations and index coverage improvements.

5. Admin upload history and restore workflow
- Added upload session tracking for admin data operations.
- Added upload history visibility with filtering and restore support.
- Added source attribution for local script ingestion in upload history.

6. Local IAT ingest and rollback support
- Added local IAT ingestion scripts with dry-run/apply options.
- Added rollback flow to safely undo local ingest operations.
- Improved operational reliability for data correction workflows.

7. Mobile responsiveness hardening
- Improved responsive layouts across admin data, forms, profile screens, scorecard, and login pages.
- Added mobile illustration parity and better spacing/typography behavior.
- Improved consistent mobile shell behavior for key academic screens.

8. Shared API client and loader consistency
- Migrated critical frontend areas to shared API client patterns.
- Expanded loading-state consistency for better user feedback.

9. Form draft persistence and progress restore
- Expanded route/user-scoped draft persistence for form workflows.
- Added safer draft handling (including sensitive field stripping and dedupe checks).
- Improved restore behavior after refresh for data-entry heavy pages.

10. Security and access control hardening
- Expanded route protection and role-based access checks.
- Added integration tests for protected and role-restricted routes.
- Improved request validation and middleware coverage.

11. Password reset and email workflow upgrade
- Implemented improved forgot/reset password flow.
- Added branded password reset email templates and better sender/reply configuration support.
- Improved email input normalization and validation behavior.

12. Navigation and role flow fixes
- Normalized HOD/Director navigation behavior to avoid unauthorized route jumps.
- Improved back navigation consistency in mentor and dashboard flows.

13. Semester-specific product enhancement
- Added Technical Work tab support for 6th semester career review workflows.

14. About Developers and SEO improvements
- Added About Developers and Developer Profile experiences.
- Improved footer structure and role-based link visibility.
- Added SEO upgrades (structured metadata, sitemap, robots).

15. Deployment and runtime consistency improvements
- Standardized Bun-oriented build/runtime paths across frontend and backend operations.
- Improved deployment readiness documentation and environment template handling.

## Role-Wise Impact Summary

1. Students
- Cleaner dashboard, improved mobile experience, better profile and mentoring interactions, and more stable conversation flows.

2. Faculty and Mentors
- Better mentee visibility, richer profile context, improved conversation UX, and more consistent route/navigation behavior.

3. Admins
- Better bulk-data operational control with upload history, restore options, and improved responsive forms.

4. HOD and Director
- Improved dashboard consistency, role-safe navigation normalization, and cleaner mentor/mentee flow behavior.

5. All users
- Better security, improved account recovery, faster screens from pagination/indexing, and stronger stability.

## What to Show in the In-App What's New Page

1. Hero title
- Sangathi 2.0 is here

2. Hero subtitle
- Faster workflows, cleaner dashboards, better mentoring UX, and stronger reliability for every role.

3. Suggested update cards
- Unified Dashboards: A cleaner dashboard experience across all roles.
- Smarter Mentoring: Better mentor and mentee visibility with stronger profile context.
- Faster Data Flows: Pagination and performance improvements across core modules.
- Admin Upload Control: Upload history, source tracking, and restore workflows.
- Better Mobile UX: Major responsive hardening across login, forms, and profile pages.
- Safer Accounts: Improved password reset and security hardening.

4. Suggested CTA labels
- Explore New Features
- View Full Update Notes
- Go to Dashboard

## Internal Note for Product/Docs

This file is the base source for Sangathi 2.0 release communication and can be reused for:
- In-app What's New modal/page
- Website changelog section
- Release announcement posts
- Onboarding highlights for new users
