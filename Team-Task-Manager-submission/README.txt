Team Task Manager

A production-ready MERN stack web application for managing team projects and tasks.

Tech stack:
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB Atlas using Mongoose
- Authentication: JWT login/signup with bcrypt password hashing
- Authorization: Admin and Member roles
- Deployment: Railway-compatible build/start configuration

Main features:
- User signup and login
- Admin and Member role-based access control
- Admin project creation, editing, deletion, and team member management
- Task creation, assignment, filtering, deletion, and status updates
- Dashboard showing assigned tasks, pending tasks, completed tasks, and overdue tasks
- Responsive clean UI

Local setup:
1. Install dependencies:
   npm install
   npm run install:all

2. Configure backend environment:
   Copy backend/.env.example to backend/.env and set:
   NODE_ENV=development
   PORT=5000
   MONGO_URI=<your MongoDB connection string>
   DB_NAME=team_task_manager
   JWT_SECRET=<your JWT secret>
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173

3. Run locally:
   npm run dev

Production setup:
1. Build:
   npm run build

2. Start:
   npm start

Railway deployment:
1. Push the project to GitHub.
2. Create a Railway project from the GitHub repository.
3. Add environment variables:
   NODE_ENV=production
   MONGO_URI=<your MongoDB Atlas URI>
   DB_NAME=team_task_manager
   JWT_SECRET=<long secure secret>
   JWT_EXPIRES_IN=7d
   CLIENT_URL=<your Railway app URL>
4. Railway will use:
   Build command: npm run build
   Start command: npm start

Example demo login:
Email: admin@teamtask.local
Password: Admin12345!

Important:
Rotate any database passwords or JWT secrets before public deployment.
