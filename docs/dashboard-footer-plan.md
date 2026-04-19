# Dashboard Footer Plan

## Objective
Create one consistent footer system for all dashboard pages (Student, Faculty, Admin, HOD, Director, and mentor-flow dashboards) so users always have quick access to support, policy links, and platform context.

## Design Principles
- Keep the footer unobtrusive: secondary information only, no primary workflow actions.
- Use one shared component with role-aware quick links.
- Preserve readability in both light and dark themes.
- Keep mobile layout stacked and touch-friendly.

## Shared Footer Structure
The footer should have three zones:

1. Brand and context
- Sanghathi + CMRIT text lockup
- Short helper line: "Mentoring and student success platform"

2. Quick links
- Common links for every role:
  - Campus Buddy
  - Threads
  - Settings
  - Help / Support
- Role-specific shortcuts:
  - Student: Mentor Details, Attendance
  - Faculty: My Mentees, Mentor-Mentee Conversation
  - Admin: Add User, Assign Mentors, Upload History
  - HOD: Department Mentors, Reports
  - Director: View Mentors, View Users

3. Utility row
- Current year and copyright
- Build/version tag (optional)
- "Last updated" timestamp (optional)

## Visual Specification
- Container width: match dashboard content width.
- Vertical padding: 16px mobile, 20px desktop.
- Border: 1px top border using theme divider.
- Background:
  - Light mode: soft neutral with 85-90 percent opacity.
  - Dark mode: slightly elevated panel with 60-70 percent opacity.
- Typography:
  - Title: body2 semibold.
  - Links/meta: caption/body2.

## Behavior and Responsiveness
- Desktop (>= md): 3-column layout (brand, links, utility).
- Tablet (sm-md): 2 rows (brand+utility first row, links second row).
- Mobile (< sm): fully stacked sections with 8-12px spacing.
- Footer should remain at the bottom when content is short using a flex column layout in dashboard shell.

## Accessibility
- Minimum 4.5:1 text contrast.
- Keyboard focus ring on each link.
- ARIA label for footer landmark and grouped link sections.
- Link targets should be descriptive (no "click here").

## Integration Plan
1. Create shared component:
- `src/components/dashboard/DashboardFooter.jsx`

2. Place once in dashboard shell:
- `src/layouts/DashboardLayout.jsx`
- Structure: content wrapper as flex column, outlet area with `flexGrow: 1`, footer at bottom.

3. Feed role context:
- Read role from `AuthContext` user object.
- Map role to quick-link set from a single config object.

4. Rollout and QA:
- Verify all role dashboards and mentor-flow dashboards.
- Validate mobile, tablet, desktop layouts.
- Confirm visual consistency in light and dark themes.

## Phase-Wise Delivery
- Phase 1: Static shared footer with common links.
- Phase 2: Role-aware quick links and version label.
- Phase 3: Optional dynamic status line (environment, last deploy date).

## Acceptance Criteria
- Footer appears on every route rendered under dashboard layout.
- No overlap with content on short or long pages.
- Links are functional and role-appropriate.
- Footer remains visually consistent across themes.
