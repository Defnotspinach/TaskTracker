# TaskTracker

TaskTracker is a React + Vite task management app with authentication, protected routes, task and category screens, and an Axios-based API client. The frontend now talks to a real Express + MySQL backend through JWT-protected endpoints.
## Signin/SignUp
<img width="1919" height="913" alt="image" src="https://github.com/user-attachments/assets/5f590969-840c-4c2c-be6d-525f61648267" />
<img width="1918" height="905" alt="image" src="https://github.com/user-attachments/assets/faecfbbd-f482-4da2-92c1-d55d96f38307" />

## DASHBOARD
<img width="1913" height="910" alt="image" src="https://github.com/user-attachments/assets/6ee38f70-07a9-4561-bb15-749ea43423f3" />

## TASK
<img width="1900" height="905" alt="image" src="https://github.com/user-attachments/assets/45ccf451-7f8b-42c3-bd97-3873a0b9fa69" />

## TASK ADD
<img width="1906" height="883" alt="image" src="https://github.com/user-attachments/assets/3795c8b3-824e-416c-a2bd-35497053c3ac" />

## TASK CLICKED
<img width="1898" height="894" alt="image" src="https://github.com/user-attachments/assets/3d2d2616-b5f3-4246-bdfe-b634a0dd7861" />

## CATEGORIES
<img width="1905" height="908" alt="image" src="https://github.com/user-attachments/assets/7068c80d-68db-4a43-beda-661746435c65" />

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

## Railway Deployment

This project uses Sequelize migrations instead of `sequelize.sync()`, and the Express server serves the built React app from `dist/`.

Set these environment variables in Railway:

- `DATABASE_URL` for a single MySQL connection string, or `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, and `MYSQLDATABASE`
- `JWT_SECRET`
- `VITE_API_URL` only if you split the frontend and backend onto different domains; for a single Railway service it can be left unset

Important: these database variables must be attached to the app service, not only the MySQL service.

Use these commands in Railway:

- Build command: `npm run build`
- Start command: `npm start`

The start script runs `scripts/railway-start.mjs`, which checks for the production database variables, runs `sequelize-cli db:migrate`, and then launches the server. When `dist/` exists, the server serves the React app at the same Railway URL as the API.

If Railway is still using an old start command in the dashboard, update it to `npm start` and redeploy.

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
- The client uses `http://localhost:3000` only in development; in production it uses the same origin unless `VITE_API_URL` is set.

## Project Overview

The app focuses on:

- User registration and login with JWT authentication.
- Protected routes for authenticated users.
- Task browsing, creation, editing, and deletion.
- Category management.
- A responsive UI built with Tailwind CSS.
