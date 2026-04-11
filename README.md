# Sanghathi Frontend

Sanghathi is a React-based frontend for the mentoring and student support workflow used by educators, mentors, and students.

## Technology Stack

- React
- Vite
- Material UI
- Emotion
- React Router DOM
- React Hook Form
- Yup
- Socket.IO client
- Notistack
- Framer Motion
- FullCalendar
- Google Generative AI
- Vitest
- Testing Library

## Features

1. **Authentication and routing**: JWT-based sign-in, sign-up, forgot-password, and protected navigation for role-specific users.
2. **Role-based dashboards**: Admin, faculty, student, HOD, director, placement, feedback, complaint, and career-review views.
3. **Student data management**: Profile, admission, academic, attendance, guardian, contact, and semester-wise record forms.
4. **Mentor and mentee workflows**: Mentor allocation, mentee lists, profile lookups, and mentorship-linked data views.
5. **Chat and meetings**: Real-time messaging, mentor-mentee conversations, and meeting calendar flows.
6. **Scorecards and reports**: IAT, TYL, external marks, attendance, MOOC, mini-project, and reporting screens.
7. **Notifications and UI feedback**: Snackbars, alerts, theme state, and other app-wide feedback patterns.
8. **AI assistant**: A chatbot experience backed by the Gemini integration used in the app.

## Prerequisites

- Node.js 20 or higher
- npm

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Sanghathi/sanghathi-Frontend.git
cd sanghathi-Frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root directory with the following variables:

```bash
VITE_API_URL=<your_backend_base_url>/api
VITE_SOCKET_URL=<your_socket_url>
BASE_URL=<your_backend_base_url>
VITE_PYTHON_API=<your_python_service_url>
VITE_CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
VITE_GA_MEASUREMENT_ID=<your_ga_measurement_id>
```

`VITE_API_URL` is used for frontend API requests.
`VITE_SOCKET_URL` is used for socket connections.
`BASE_URL` is used by Vite tooling and configuration.
`VITE_PYTHON_API` is used by the reporting flow.
`VITE_CLOUDINARY_CLOUD_NAME` is used by Cloudinary image handling.
`VITE_GA_MEASUREMENT_ID` is used by Google Analytics.

### 4. Start the development server

```bash
npm run dev
```

Vite starts on port `3000` by default unless `PORT` is set in the environment.

### 5. Open the application

Open your browser and navigate to `http://localhost:3000`.

## Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm test
```

`npm run dev` starts the Vite development server.
`npm run build` creates a production build.
`npm run preview` serves the production build locally.
`npm test` runs the Vitest test suite with coverage.

## Production Build

To create a production build, run:

```bash
npm run build
```

To preview the production build locally, run:

```bash
npm run preview
```

## Deployment

This frontend is configured for static deployment on Netlify and similar Vite-friendly hosts.

To deploy with the Netlify CLI, run:

```bash
netlify deploy --prod
```

If Netlify CLI is not installed, run:

```bash
npm install -g netlify-cli
```

## Contributing

Contributions are welcome. Please read our [contributing guidelines](contribute.md) to get started.

## License

This project is licensed under the [MIT License](LICENSE).
