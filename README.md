# TaskTracker

TaskTracker is a React + Vite task management frontend with authentication, protected routes, task and category screens, and an Axios-based API client. The app is built to work against a JWT-protected backend API and currently falls back to `http://localhost:3000` when no API URL is provided.

## Tech Stack

- React 19
- Vite
- Axios
- React Router DOM
- Zustand
- React Hook Form
- Zod
- Lucide React
- Tailwind CSS

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables if needed:

Create a `.env` file in the project root and set the API base URL when your backend is not running on the default address:

```env
VITE_API_URL=http://localhost:3000
```

The app also includes a separate `.env` file for backend database settings, but those values are only used by server-side code.

3. Start the development server:

```bash
npm run dev
```

4. Open the app in your browser at the local Vite URL shown in the terminal.

## Available Scripts

- `npm run dev` - Start the Vite development server.
- `npm run build` - Create a production build.
- `npm run preview` - Preview the production build locally.
- `npm run lint` - Run ESLint.

## API Endpoints

The frontend API client in [src/lib/api.js](src/lib/api.js) uses these endpoints:

### Public

- `GET /api/health` - Health check.
- `POST /api/auth/register` - Create a new account.
- `POST /api/auth/login` - Sign in and receive a JWT.

### Protected

- `GET /api/auth/me` - Return the currently authenticated user.
- `GET /api/categories` - List the current user's categories.
- `POST /api/categories` - Create a category.
- `PUT /api/categories/:id` - Update a category.
- `DELETE /api/categories/:id` - Delete a category.
- `GET /api/tasks` - List the current user's tasks.
- `GET /api/tasks/:id` - Fetch a single task with its related category.
- `POST /api/tasks` - Create a task.
- `PUT /api/tasks/:id` - Update a task.
- `DELETE /api/tasks/:id` - Delete a task.

### Query Parameters

`GET /api/tasks` supports:

- `status`
- `category_id`
- `search`
- `page`
- `limit`

## Known Limitations / Trade-offs

- The repository currently contains a frontend only; the backend API implementation is not included here.
- Several stores still use in-memory mock data for local UI behavior, so persistence depends on connecting the app to a real backend.
- The client defaults to `http://localhost:3000` if `VITE_API_URL` is not set, which is convenient for local development but must be updated for deployment.
- Database environment variables such as `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` are backend-only settings and are not consumed by the frontend build.
- `updateCategory` and `deleteCategory` are exposed in the client, but they depend on backend support being present and stable.

## Project Overview

The app focuses on:

- User registration and login with JWT authentication.
- Protected routes for authenticated users.
- Task browsing, creation, editing, and deletion.
- Category management.
- A responsive UI built with Tailwind CSS.
