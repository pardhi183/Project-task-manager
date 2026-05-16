Team Task Manager

Team Task Manager is a full-stack web application built to manage daily work inside a team. The main idea behind this project is simple: an admin should be able to create users, organize them into projects, assign tasks, track attendance, and keep everyone updated from one place. At the same time, normal users and employees should only see the work that belongs to them and should be able to update their own progress without getting access to admin-only controls.

This project is built as a MERN stack application. The frontend is made with React and Vite, the backend is built with Node.js and Express, and MongoDB is used as the database with Mongoose models. Authentication is handled with JWT tokens, and passwords are stored securely using bcrypt hashing.


Project Purpose

I created this project as a practical team management system. In many small teams, tasks, attendance, user approval, and communication are handled in different places. This application brings those parts together in one dashboard so the workflow becomes easier to manage.

The project covers real use cases such as:

- Creating accounts for Admin, User, and Employee roles
- Keeping new accounts pending until an admin approves them
- Logging in with email, mobile number, or employee ID
- Creating projects for a specific role
- Assigning tasks to one or more people
- Tracking task status and due dates
- Showing dashboard counts for pending, completed, and overdue work
- Managing employee and user profiles
- Marking punch in and punch out attendance
- Sending notifications from admin to the team
- Resetting password using registered mobile number and OTP
- Deploying the complete app with backend and frontend together


Tech Stack Used

Frontend:
- React
- Vite
- React Router
- Lucide React icons
- CSS for responsive layout and styling

Backend:
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcrypt password hashing
- express-validator for request validation
- Helmet and CORS for basic production security

Deployment:
- Railway-compatible setup
- Root build and start scripts
- Express serves the frontend build in production


Main Features

1. Authentication System

The application has a complete login and signup flow. During signup, the user enters name, email, mobile number, password, and role. If the selected role is Employee, an employee ID is also required.

The login page allows the user to choose the role they are signing in as. A user can log in using email, mobile number, or employee ID depending on the role. Passwords are not stored in plain text. They are hashed using bcrypt before saving into MongoDB.

JWT tokens are used after login, so protected pages and API routes can only be accessed by authenticated users.


2. Admin Approval Flow

When a new account is created, it does not immediately get full access. The account stays in pending approval status. The admin can see pending approvals from the right-side notification panel and approve the user. After approval, the user can log in normally.

This makes the app more realistic because in an actual company or team, every new account should not automatically get access without confirmation.


3. Role-Based Access Control

The app supports Admin, User, Employee, and Member-style access. Admin has the highest control. Admin can create projects, manage users, update profiles, assign tasks, send notifications, approve accounts, and view attendance records.

Users and employees have limited access. They can see only their assigned projects and tasks. They can update task status for their own work, but they cannot create or delete projects like an admin.

This role separation is handled both in the frontend and backend, so restricted actions are protected properly.


4. Dashboard

After login, the user lands on the dashboard. The dashboard shows the current date and live time, a greeting with the logged-in user's name, attendance controls, task summary cards, and assigned tasks.

The dashboard includes:

- Total assigned tasks
- Pending tasks
- Completed tasks
- Overdue tasks
- Punch in and punch out buttons
- Punch in and punch out timing
- My tasks section
- Attendance summary

For admin users, the dashboard also shows admin login alerts and attendance records for the team.


5. Attendance Management

The project includes a simple attendance system. Users can punch in when they start work and punch out when they finish. The dashboard shows today's punch in and punch out time.

Admin can see attendance data for team members, including present days and today's punch timing. This gives the project a company-style workflow, not just a basic task board.


6. Admin Login Alert System

The application tracks wrong password attempts for admin accounts. If someone tries to log in as admin with a wrong password, the system records the attempt. After repeated failed attempts, the login can be blocked and the alert is shown to the admin.

This feature was added to make the admin account more protected and to show that security was considered beyond only simple login/signup.


7. Projects Management

The Projects page is used to create and manage workspace projects. Admin can create a project by entering a project name, description, selecting the target role, and choosing team members.

Projects can be created for Users, Employees, or Admins. This helps keep assignment clean because the member picker changes based on the role selected.

Each project card shows the project name, description, target audience, number of members, and an open button. Admin can also delete a project when it is no longer needed.


8. Project Details and Task Management

Inside each project, admin can update project details, manage project members, and create tasks. A task includes title, description, due date, status, and assignees.

The task statuses are:

- Todo
- In Progress
- Done

Tasks can be filtered by status and assignee. This makes it easier to find specific work when a project has many tasks.

Users can update the status of tasks assigned to them. Admin can create, update, and delete tasks.


9. Profile Page

Every logged-in user has a profile page. It shows the user's name, role or designation, productivity percentage, profile picture, and how long the person has been serving in the company.

For admin, profile picture upload is also available. The profile section makes the app feel more like an internal team platform instead of only a plain CRUD application.


10. Manage Employees and Manage Users

Admin has separate sections for managing employees and users. From these pages, admin can select a profile, update name, designation, productivity percentage, and upload a profile picture.

The profile preview updates with the selected data. This helps an admin maintain employee and user information from the application itself.


11. Notifications

The right-side notification panel is available inside the main app layout. Admin can create and send notifications with a title and message. These notifications appear in the notification section for users.

Users can click notifications to mark them as read. The notification area also shows a welcome section for new members after their first punch in.


12. Weather Widget

The app includes a small weather card in the sidebar. It uses the browser location when available and falls back to a default location if permission is not given.

This is a small feature, but it improves the dashboard experience and makes the app feel more complete.


13. Forgot Password with OTP

The forgot password flow works through registered mobile number and OTP verification. The user enters the mobile number, verifies the OTP, and then creates a new password.

The OTP has an expiry time, and the backend prevents too many wrong attempts. The system also does not allow the new password to be the same as the old password.


14. Backend Structure

The backend is organized in a clean way:

- models contain MongoDB schemas
- controllers contain business logic
- routes define API endpoints
- middleware handles authentication, validation, database checks, and errors
- validators check incoming request data
- utils contain helper logic like JWT token creation and OTP/SMS handling

Main backend modules:

- User model
- Project model
- Task model
- Attendance model
- Notification model
- Admin login alert model


15. API and Security

Protected API routes require a JWT token. Admin-only actions are checked on the backend before allowing the request.

Important security points:

- Passwords are hashed using bcrypt
- JWT is used for authenticated requests
- Role-based authorization protects admin routes
- Helmet is used for security headers
- CORS is configured for allowed frontend URLs
- Request validation is handled before saving data
- Password reset OTP is hashed before storing


Local Setup

1. Install root dependencies:

npm install

2. Install frontend and backend dependencies:

npm run install:all

3. Create backend environment file:

Copy backend/.env.example to backend/.env

4. Add required backend variables:

NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

5. Run the project locally:

npm run dev

Frontend runs on:
http://localhost:5173

Backend API runs on:
http://localhost:5000/api


Production and Deployment

The project is prepared for Railway deployment. The root package.json contains build and start scripts. During production, the React frontend is built into frontend/dist, and the Express backend serves that built frontend along with the API.

Build command:
npm run build

Start command:
npm start

Railway environment variables needed:

NODE_ENV=production
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=your_live_application_url


Why This Project Is Useful

This project is useful because it is not only a simple task list. It includes multiple parts that are common in real workplace tools: user approval, role-based access, project assignment, task tracking, attendance, notifications, profile management, password reset, and deployment setup.

The main focus was to build something practical, where each role has a clear purpose. Admin controls the team workflow, while users and employees can focus on their assigned work. The application also keeps the interface straightforward so that a person can understand the flow without needing training.


Future Improvements

Some improvements that can be added later are:

- Email notifications
- Calendar view for tasks
- File attachments inside tasks
- Comments under each task
- More detailed attendance reports
- Team performance analytics
- Dark mode
- Export task and attendance reports


Conclusion

Team Task Manager is a complete MERN stack project made for managing team work in a structured way. It includes authentication, role-based permissions, project management, task assignment, attendance tracking, notifications, profile management, password reset, and production deployment support.

Overall, the project shows how a full-stack application can connect frontend screens, backend APIs, database models, authentication, authorization, and deployment into one working product.
