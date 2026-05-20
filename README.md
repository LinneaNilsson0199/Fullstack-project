# TinyGuard

TinyGuard is a fullstack web application designed to help families monitor uploaded text files and support safer online communication for children.

The system scans uploaded files for harmful or inappropriate words using the Aho-Corasick algorithm and stores scan results in a PostgreSQL database. Parents and administrators can view scan history, statistics, and manage users through role-based functionality.

---

## Live Demo

Frontend:  
https://tinyguard-frontend.onrender.com

Backend:  
https://tinyguard-backend.onrender.com

---

## Status

This is the current project version developed for the DA219B Fullstack Project course.

The application includes:
- authentication and role handling
- protected routes
- file scanning
- statistics and charts
- relational database functionality
- responsive design
- cloud deployment

---

## Features

### Authentication & User Handling
- Create user accounts
- Login with email and password
- Role-based accounts:
  - Admin
  - Parent
  - Child
- Protected pages for logged-in users
- Different content depending on user role

### File Scanning
- Upload and scan ".txt" files
- Detect flagged or harmful words
- Store scan results in the database
- Count detected matches
- Save scan history

### Parent & Child System
- Parent-child user connections
- Parents can monitor child scan results
- Relational PostgreSQL database structure

### Statistics & Dashboard
- Statistics dashboard with charts
- Visual overview of scan activity
- Scan history and detected matches

### Admin Functionality
- Admin dashboard
- Manage users and relational data
- CRUD operations for system management

### Responsive Design
- Works on desktop, tablet, and mobile devices

---

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript
- Chart.js

### Backend
- Node.js
- Express

### Database
- PostgreSQL

### Cloud Hosting
- Render

---

## Project Structure

```text
Fullstack-project/
│
├── Frontend/
│   ├── about.html
│   ├── index.html
│   ├── profile.html
│   │
│   ├── assets/
│   │
│   ├── css/
│   │   ├── about_page_style.css
│   │   ├── fileupload_style.css
│   │   ├── layout_style.css
│   │   └── login_signup_style.css
│   │
│   └── scripts/
│       ├── login_signup_script.js
│       ├── parent_child_connect.js
│       ├── script.js
│       └── statistics_chart.js
│
├── backend/
│   ├── authenticate.js
│   ├── db.js
│   ├── login.js
│   ├── package.json
│   ├── register.js
│   ├── search.js
│   ├── server.js
│   └── words.txt
│
├── database/
│   └── schema.sql
│
└── README.md
```

---

## Deployment

TinyGuard is deployed using Render services:

- Frontend hosted as a Render Static Site
- Backend hosted as a Render Web Service
- PostgreSQL hosted using Render PostgreSQL

The backend connects to the database using environment variables and a PostgreSQL connection string.

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/LinneaNilsson0199/Fullstack-project.git
cd Fullstack-project
```

---

### 2. Install backend dependencies

```bash
cd backend
npm install
```

---

### 3. Configure environment variables

Create a ".env" file inside the "backend" folder.

Add:

```env
DATABASE_URL=your_render_postgresql_url
JWT_SECRET=your_secret_key
```

---

### 4. Set up the database

Run the SQL code from:

```text
database/schema.sql
```

This creates the required database tables and roles.

---

### 5. Start the backend

```bash
npm start
```

---

## Database

TinyGuard uses a PostgreSQL relational database hosted on Render.

The database includes tables for:
- users
- roles
- parent-child relations
- scan results


---

## Security

- Passwords are securely hashed using bcrypt
- JWT authentication is used for protected routes
- Protected routes prevent unauthorized access
- Role-based access control is implemented
- Environment variables are stored in ".env"

---

## Future Improvements

Possible future improvements include:
- Real-time notifications
- Support for additional file types
- Expanded statistics system

---

## Team

### Team Name
TinyGuard Developers

### Team Members & Focus Areas

- Jessie – Database
- Linnea – Backend
- Gabriella – Frontend