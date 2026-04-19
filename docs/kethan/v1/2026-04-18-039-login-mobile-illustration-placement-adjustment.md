# Login Mobile Illustration Placement Adjustment

Date: 2026-04-18
Task: Reposition mobile login illustration between heading and Email input

## What was wrong
- Mobile illustration was rendered too high in the layout (above logos and heading).
- Desired UX was to show the illustration after the “Sign in to Sanghathi” heading and before the Email field.

## What was fixed
- Moved the mobile-only illustration block from the top of the form container to directly below the heading.
- Kept desktop behavior unchanged (illustration block remains hidden on md+).
- Reduced mobile image height slightly for better balance with form controls.

## Files changed
- src/pages/Login.jsx

## Verification / tests
- Ran VS Code Problems check for updated file.
- Result: No errors found in src/pages/Login.jsx.

## Next steps
- Visually confirm on 360x800 and 412x915 that title, image, and first input remain comfortably scannable.

## Further improvements
- Add tiny top/bottom spacing variants for very short-height screens.
- Add a visual regression snapshot to lock this intended element order.
