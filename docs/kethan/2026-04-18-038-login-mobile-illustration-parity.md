# Login Mobile Illustration Parity

Date: 2026-04-18
Task: Add desktop login illustration to mobile login screen

## What was wrong
- The desktop login page showed the branded illustration, but mobile only displayed the form.
- This created visual inconsistency and reduced brand continuity between desktop and phone layouts.

## What was fixed
- Added a mobile-only illustration section above the login form.
- Reused the same desktop illustration asset to keep visual parity.
- Applied responsive height using clamp and rounded corners so the image remains balanced on smaller screens.
- Kept desktop behavior unchanged by rendering the new block only on xs/sm and hiding it on md+.

## Files changed
- src/pages/Login.jsx

## Verification / tests
- Ran VS Code Problems check on the edited file.
- Result: No errors found in src/pages/Login.jsx.

## Next steps
- Validate rendering on 320px and 360px widths to ensure the image does not push key fields below the fold too aggressively.
- If desired, reduce image height slightly in landscape mode for low-height devices.

## Further improvements
- Add an optional subtle overlay gradient on the mobile image to improve contrast and blend with page background.
- Add a visual regression snapshot for login mobile view to prevent future parity drift.
