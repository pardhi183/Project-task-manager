Team Task Manager

Team Task Manager is a full-stack web application built to manage daily work inside a team. The main idea behind this project is simple: an admin should be able to create users, organize them into projects, assign tasks, track attendance, and keep everyone updated from one place. At the same time, normal users and employees should only see the work that belongs to them and should be able to update their own progress without getting access to admin-only controls.

This project is built as a MERN stack application. The frontend is made with React and Vite, the backend is built with Node.js and Express, and MongoDB is used as the database with Mongoose models. Authentication is handled with JWT tokens, and passwords are stored securely using bcrypt hashing.

Main features included in the website:

- Login and signup
- Admin, User, and Employee roles
- New account approval by admin
- Login using email, mobile number, or employee ID
- JWT based protected routes
- Dashboard with date, time, task summary, and assigned tasks
- Punch in and punch out attendance
- Admin attendance view
- Admin login alert tracking for wrong password attempts
- Project creation and team member selection
- Task creation with assignees, due date, description, and status
- Task filtering by status and assignee
- Profile page with profile picture, designation, productivity, and serving time
- Admin pages to manage employees and users
- Right-side notification panel
- Admin notification sending
- Pending account approval panel
- Welcome new member section
- Weather widget
- Forgot password with registered mobile number and OTP
- Railway-ready deployment setup

Tech stack:

Frontend:
- React
- Vite
- React Router
- Lucide React icons
- CSS

Backend:
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- express-validator
- Helmet
- CORS

Project explanation:

I built Team Task Manager as a practical workplace-style project. The goal was not only to create a task list, but to build a system where different users have different responsibilities. Admin can manage the complete workflow, while users and employees can focus on their own assigned work.

The authentication system allows users to sign up with details like name, email, mobile number, password, and role. Employee accounts also use an employee ID. After signup, the account goes into pending approval, and admin approval is required before the user can log in. This makes the system closer to a real company application.

The dashboard gives a quick overview of daily work. It shows total assigned tasks, pending tasks, completed tasks, overdue tasks, punch in and punch out controls, and attendance data. Admin can also see attendance records and admin login alerts.

The project section is used for organizing work. Admin can create projects for Users, Employees, or Admins and select the correct team members. Inside each project, admin can create tasks, assign them to one or more people, set due dates, add descriptions, and track status. The available statuses are Todo, In Progress, and Done.

The profile section shows personal details like name, role, designation, productivity, profile picture, and serving time. Admin can manage employee and user profiles separately, including productivity percentage and profile images.

The notification panel allows admin to send updates to the team. It also shows pending account approvals and welcomes new members after their first punch in. The small weather widget adds a useful dashboard touch.

For password recovery, the app supports forgot password with mobile number and OTP. The OTP has expiry handling and wrong attempt limits, and the new password cannot be the same as the old password.

Backend structure:

- models: database schemas
- controllers: main business logic
- routes: API endpoint definitions
- middleware: authentication, role checks, validation, database checks, and error handling
- validators: request data validation
- utils: JWT and OTP/SMS helper logic

Local setup:

1. Install root dependencies:
npm install

2. Install frontend and backend dependencies:
npm run install:all

3. Create backend/.env from backend/.env.example

4. Add environment variables:
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

5. Start the project:
npm run dev

Frontend:
http://localhost:5173

Backend:
http://localhost:5000/api

Deployment:

The project is ready for Railway deployment. The root build command builds the frontend and prepares the backend. In production, the Express backend serves both the API and the built React frontend.

Build command:
npm run build

Start command:
npm start

Conclusion:

Team Task Manager is a complete MERN stack project with authentication, authorization, project management, task assignment, attendance tracking, notifications, profile management, forgot password flow, and deployment support. It is designed like a real internal team tool where admin controls the workflow and team members can manage their assigned work clearly.
