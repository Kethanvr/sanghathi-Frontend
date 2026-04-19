# ER Diagram README

This document gives a quick ER view of Sanghathi and points to the full database model files.

## Primary ER Sources

- docs/database/er/current-schema.mmd
- docs/database/er/current-schema.dbml
- docs/database/er/proposed-schema.mmd
- docs/database/er/proposed-schema.dbml

## High-Level ER (Application View)

```mermaid
erDiagram
    ROLE ||--o{ USER : assigns
    USER ||--o{ STUDENT_PROFILE : owns
    USER ||--o{ FACULTY_PROFILE : owns

    USER ||--o{ MENTORSHIP : mentors_or_mentees
    MENTORSHIP ||--o{ MEETING : schedules

    USER ||--o{ CONVERSATION : participates
    CONVERSATION ||--o{ THREAD : contains
    THREAD ||--o{ MESSAGE : stores

    USER ||--o{ NOTIFICATION : receives

    USER ||--o{ TYL_SCORE : has
    USER ||--o{ ATTENDANCE : has
    USER ||--o{ CAREER_RECORD : has
    USER ||--o{ PLACEMENT_RECORD : has
```

## ER Image Placeholders

Upload images in docs/assets/project-report-images and keep these names:

![Current ER Diagram](./assets/project-report-images/er-current.png)

![Proposed ER Diagram](./assets/project-report-images/er-proposed.png)

## How to Keep ER Updated

1. Update collection definitions in model files and database docs.
2. Sync docs/database/current-schema.md and docs/database/proposed-schema.md.
3. Regenerate Mermaid/DBML files when structure changes.
4. Replace er-current.png and er-proposed.png with latest exports.
