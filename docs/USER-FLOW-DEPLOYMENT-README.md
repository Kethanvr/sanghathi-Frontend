# User Flow and Deployment README

This document explains how users move through the app and how Sanghathi is deployed in production.

## 1. User Flow (Role-Based)

```mermaid
flowchart TD
    A[Open sanghathi.com] --> B[Login]
    B --> C{Role Check}

    C -->|Student| D[Student Dashboard]
    C -->|Faculty| E[Faculty Dashboard]
    C -->|HOD| F[HOD Dashboard]
    C -->|Director| G[Director Dashboard]
    C -->|Admin| H[Admin Dashboard]

    D --> I[Profile and Academic Records]
    D --> J[Mentor Interaction]
    D --> K[Career and Placement Modules]

    E --> L[Mentee List]
    E --> M[Offline Conversation]
    E --> N[Mentor-Mentee Tracking]

    F --> O[Department Oversight]
    G --> P[Institution Analytics]
    H --> Q[User and System Administration]

    J --> R[Thread and Message Flow]
    M --> R
    R --> S[Notification and Follow-up]
```

## 2. Deployment Flow

```mermaid
flowchart LR
    Dev[Developer Push] --> GitHub[GitHub Repositories]

    GitHub --> FE_Build[Frontend Build: Bun + Vite]
    FE_Build --> Netlify[Netlify Hosting]

    GitHub --> BE_Build[Backend Build: Docker + Bun]
    BE_Build --> Fly[Fly.io Runtime]

    Netlify --> Cloudflare[Cloudflare DNS and Edge]
    Fly --> Cloudflare

    Fly --> Atlas[MongoDB Atlas]
    Fly --> Resend[Resend Email]

    Cloudflare --> Users[End Users]
    Netlify --> GSC[Google Search Console]
```

## 3. Deployment Components

- Frontend: Netlify
- Backend: Fly.io runtime with Dockerized Bun-based service
- Database: MongoDB Atlas
- Email: Resend
- Edge and DNS: Cloudflare
- Search and SEO monitoring: Google Search Console

## 4. Image Placeholders

Upload to docs/assets/project-report-images:

![User Flow Diagram](./assets/project-report-images/user-flow.png)

![Deployment Flow Diagram](./assets/project-report-images/deployment-flow.png)

![Frontend Netlify Dashboard](./assets/project-report-images/frontend-netlify-dashboard.png)

![Backend Fly Dashboard](./assets/project-report-images/backend-fly-dashboard.png)

![Cloudflare Analytics](./assets/project-report-images/cloudflare-analytics.png)

![MongoDB Atlas Dashboard](./assets/project-report-images/mongodb-atlas-dashboard.png)

![Resend Domain Verified](./assets/project-report-images/resend-domain-verified.png)

![Google Search Console](./assets/project-report-images/google-search-console.png)
