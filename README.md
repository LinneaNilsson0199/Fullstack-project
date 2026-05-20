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
├── frontend/
│   ├── html pages
│   ├── css files
│   ├── javascript files
│   └── assets
│
├── backend/
│   ├── routes
│   ├── controllers
│   ├── middleware
│   ├── database connection
│   └── scanning algorithm
│
├── database/
│   └── schema.sql
│
└── README.md