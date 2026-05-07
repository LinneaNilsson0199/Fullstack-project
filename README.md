# TinyGuard
TinyGuard is a fullstack web application for monitoring uploaded text files and supporting safer communication for families.
This release includes the core functionality of the application, including user registration, login, file scanning, database relations, and cloud deployment.

---

## Live Demo

Frontend:  
https://tinyguard-frontend.onrender.com

Backend:  
https://tinyguard-backend.onrender.com

---

## Status
This is the **Initial Release (v1.0.0)**.

Core functionality is implemented and working.  
Some planned features, such as statistics and role-specific interfaces, are still under development.

---

## Features
- Create user accounts
- Login with email and password
- Upload and scan text files
- Detect flagged words in uploaded files
- PostgreSQL database with roles and relations
- Parent-child user connections
- Cloud deployment with Render

---

## Tech stack
- Frontend: HTML, CSS, JavaScript  
- Backend: Node.js, Express  
- Database: PostgreSQL  
- Cloud Hosting: Render

---

## Deployment
TinyGuard is deployed using Render services:

- Frontend hosted as a Render Static Site
- Backend hosted as a Render Web Service
- PostgreSQL hosted using Render PostgreSQL

The backend connects to the database using environment variables and a PostgreSQL connection string.

---

## Setup
1. Clone the repository
```bash
git clone https://github.com/LinneaNilsson0199/Fullstack-project.git
cd Fullstack-project

2. Install backend dependencies
cd backend
npm install

3. Configure Render environment variables
Create a `.env` file inside the `backend` folder.

Add the following:
DATABASE_URL=your_render_postgresql_url

---

Notes
The deployed version is hosted on Render
File scanning currently supports .txt files
Authentication can be improved further with sessions or JWT tokens
Statistics and role-based interfaces are planned for future updates