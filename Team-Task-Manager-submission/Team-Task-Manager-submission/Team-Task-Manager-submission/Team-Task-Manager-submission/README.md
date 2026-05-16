# Team Task Manager

A production-ready MERN task manager with JWT authentication, role-based access control, project management, task assignment, filtering, and a responsive React UI.

## Stack

- Frontend: React, Vite, React Router, modern hooks
- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- Auth: JWT and bcrypt password hashing
- Validation: express-validator
- Deployment: Railway-compatible root build/start scripts

## Folder Structure

```text
team-task-manager/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      utils/
      validators/
      app.js
      server.js
    .env.example
    package.json
  frontend/
    src/
      api/
      components/
      pages/
      state/
      App.jsx
      main.jsx
      styles.css
    .env.example
    index.html
    package.json
    vite.config.js
  package.json
  railway.json
  README.md
```

## Local Setup

1. Install dependencies:

```bash
npm install
npm run install:all
```

2. Create backend environment file:

```bash
cp backend/.env.example backend/.env
```

3. Set `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/team_task_manager
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

4. Optional frontend environment file:

```bash
cp frontend/.env.example frontend/.env
```

5. Run the app:

```bash
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:5000/api`

## Roles

- `Admin`: create/update/delete projects, manage project members, create/delete tasks, assign tasks, update all task fields.
- `Member`: view only assigned projects/tasks and update status for their assigned tasks.

During signup you can choose `Admin` or `Member`. In a stricter production environment, you would usually lock admin creation behind an invite or seed process.

## Environment Variables

Backend:

| Variable | Description |
| --- | --- |
| `NODE_ENV` | `development` or `production` |
| `PORT` | Express server port |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random signing secret |
| `JWT_EXPIRES_IN` | JWT lifetime, such as `7d` |
| `CLIENT_URL` | Allowed frontend origin for CORS |

Frontend:

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | API base URL for local dev, defaults to `/api` in production |

## Railway Deployment

1. Push this repository to GitHub.
2. Create a new Railway project from the GitHub repo.
3. Add a MongoDB service in Railway or use MongoDB Atlas.
4. Configure variables on the Railway web service:

```env
NODE_ENV=production
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=<your-railway-app-url>
```

5. Railway will use `railway.json`:

```text
Build: npm run build
Start: npm start
```

The backend serves the built React app from `frontend/dist` in production.

## API Endpoints

All protected endpoints require:

```http
Authorization: Bearer <jwt>
```

### Auth

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | Public | Create user |
| `POST` | `/api/auth/login` | Public | Login and receive JWT |
| `GET` | `/api/auth/me` | Authenticated | Current user |

Signup body:

```json
{
  "name": "Asha Rao",
  "email": "asha@example.com",
  "password": "password123",
  "role": "Admin"
}
```

### Users

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/users` | Authenticated | List users for assignment |
| `PATCH` | `/api/users/:userId/role` | Admin | Change role |
| `DELETE` | `/api/users/:userId` | Admin | Delete user |

### Projects

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/projects` | Authenticated | Admin sees all; members see assigned |
| `POST` | `/api/projects` | Admin | Create project |
| `GET` | `/api/projects/:projectId` | Assigned/Admin | Project detail |
| `PUT` | `/api/projects/:projectId` | Admin | Update project |
| `DELETE` | `/api/projects/:projectId` | Admin | Delete project and tasks |

Project body:

```json
{
  "name": "Website Relaunch",
  "description": "Ship new marketing site.",
  "teamMembers": ["665f1f0d4f7a8b2b8a1f9999"]
}
```

### Tasks

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/tasks/mine` | Authenticated | Dashboard tasks and counts |
| `GET` | `/api/projects/:projectId/tasks` | Assigned/Admin | Project tasks, supports filters |
| `POST` | `/api/projects/:projectId/tasks` | Admin | Create task |
| `PUT` | `/api/tasks/:taskId` | Admin or assignee | Admin updates all fields; assignee status only |
| `PATCH` | `/api/tasks/:taskId/status` | Admin or assignee | Update status |
| `DELETE` | `/api/tasks/:taskId` | Admin | Delete task |

Task body:

```json
{
  "title": "Draft launch checklist",
  "description": "Prepare owner-by-owner release checklist.",
  "assignedUser": "665f1f0d4f7a8b2b8a1f9999",
  "status": "Todo",
  "dueDate": "2026-06-01"
}
```

Task filters:

```http
GET /api/projects/:projectId/tasks?status=Todo&assignedUser=<userId>
```

## Production Notes

- Passwords are salted and hashed with bcrypt before storage.
- JWTs are required for protected routes.
- Mongoose references connect users, projects, and tasks through ObjectIds.
- Express validation returns `422` with field-level errors.
- Admin-only actions are guarded by `authorize('Admin')`.
- The React production build is served by Express when `NODE_ENV=production`.
