# TaskTracker

TaskTracker is a React + Vite task management app with authentication, protected routes, task and category screens, and an Axios-based API client. The frontend now talks to a real Express + MySQL backend through JWT-protected endpoints.

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
- Express
- MySQL2
- JSON Web Tokens
- bcryptjs

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

Create a `.env` file in the project root and set the API base URL when your backend is not running on the default address:

```env
VITE_API_URL=http://localhost:3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootadmin
DB_NAME=task_tracker
JWT_SECRET=tasktracker-dev-secret
```

The backend reads the database and JWT settings from the same `.env` file.

3. Start the app:

```bash
npm run dev
```

This starts both the API server and the Vite client. Open the client URL shown in the terminal.

## Available Scripts

- `npm run dev` - Start the API server and the Vite client together.
- `npm run client` - Start only the Vite development server.
- `npm run server` - Start only the API server.
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

- The backend auto-creates the database and tables if they do not exist, which is convenient for local development but may be too permissive for a locked-down production setup.
- The UI still uses a task status vocabulary of `todo`, `in-progress`, `hold`, `testing`, and `done`, so the backend stores those values to keep the current screens working.
- The task model includes `priority` because the existing UI depends on it, even though the earlier database sketch did not include that field.
- The client defaults to `http://localhost:3000` if `VITE_API_URL` is not set, which is convenient for local development but should be overridden for deployment.

## Project Overview

The app focuses on:

- User registration and login with JWT authentication.
- Protected routes for authenticated users.
- Task browsing, creation, editing, and deletion.
- Category management.
- A responsive UI built with Tailwind CSS.
