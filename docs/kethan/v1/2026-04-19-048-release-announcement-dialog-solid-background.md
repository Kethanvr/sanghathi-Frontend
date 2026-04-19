# Release Announcement Dialog Solid Background

Date: 2026-04-19
Owner: GitHub Copilot

## What Was Wrong
- The release announcement popup on dashboard used semi-transparent gradient colors.
- Underlying dashboard cards/text were visible through the popup, making it look faded.

## What Was Fixed
- Replaced translucent gradient background with a fully solid dialog surface.
- Disabled dialog paper background overlay image so no extra tint/alpha effect appears.
- Kept spacing, content, and button behavior unchanged.

## Files Changed
- src/components/updates/ReleaseAnnouncementDialog.jsx

## Verification / Tests
- Checked file diagnostics: no errors reported after the edit.
- Verified style logic now uses `backgroundColor: theme.palette.background.paper` and `backgroundImage: "none"`.

## Next Steps
- Refresh the dashboard and open the release popup once in both light and dark modes.
- Confirm no transparency is visible behind popup content.

## Further Improvements
- Add a reusable `SolidDialog` style utility to keep all future dialogs visually consistent.
- Add a small visual regression screenshot test for critical modal surfaces.
