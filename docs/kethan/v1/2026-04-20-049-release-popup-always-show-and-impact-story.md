# Release Popup Always Show + Impact Story on Updates Page

Date: 2026-04-20
Owner: GitHub Copilot

## What Was Wrong
- Release announcement popup only appeared once per session (stored in sessionStorage).
- Updates page didn't showcase the powerful story behind Sanghathi 2.0 and the password reset fix that mattered most.

## What Was Fixed
- Modified DashboardLayout to always show the release popup on dashboard load (removed sessionStorage gate).
- Removed sessionStorage removal on dismiss so popup persists and reappears on navigation.
- Added prominent "The Fix That Mattered Most" section to Updates page featuring:
  - Headline: "Why 29,024 new lines came down to one broken feature"
  - Complete narrative arc about password reset (19,249 frontend + 9,775 backend lines)
  - Emphasis on the core student issue and solution
  - Supporting fixes and documentation efforts
  - Styled with warning border and gradient text for visual impact

## Files Changed
- src/layouts/DashboardLayout.jsx (removed sessionStorage logic)
- src/pages/Updates.jsx (added impactStory object and Paper component with story)

## Verification / Tests
- Checked file diagnostics: no errors in both edited files.
- Verified logic removes storage blocker and always sets isReleaseDialogOpen = true.
- Verified impactStory JSX renders with proper styling.

## Next Steps
- Test dashboard: open any protected route → release popup should appear every time.
- Test dismiss: click Dismiss → popup closes, but reappears on next nav/refresh.
- Visit `/updates` page: scroll to see the new impact story with gradient styling.

## Further Improvements
- Add an optional "Don't show for 24 hours" reminder mode if repeated popups feel intrusive.
- Track popup dismiss metrics to measure engagement with the updates page CTA.
