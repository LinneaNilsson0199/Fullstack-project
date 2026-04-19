# TinyGuard (Prototype)

TinyGuard is a fullstack web application prototype for monitoring uploaded text files and supporting safer communication for families.

This version includes basic user registration, login, a database structure, and a simple file upload interface.

---

## Status

This is an early prototype (**v0.1.0**).  
Some features are incomplete, including authentication and file processing.

---

## Features

- Create user accounts
- Login with email and password
- PostgreSQL database with roles and relations
- Parent-child user connections
- Basic file upload interface (not fully implemented yet)

---

## Tech stack

- Frontend: HTML, CSS, JavaScript  
- Backend: Node.js, Express  
- Database: PostgreSQL  

---

## Setup

### 1. Clone the repository
```bash
git clone <repo-url>
cd Fullstack-project
2. Set up the database

Run the SQL file:

database/schema.sql

This will:

create tables
add constraints
insert test data
3. Configure environment variables

Create a .env file in the backend folder:

DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
PORT=4000
4. Install dependencies
cd backend
npm install
5. Start the server
node server.js

Server runs on:

http://localhost:4000
Notes
File upload is not fully connected to the backend yet
Authentication (sessions/tokens) will be added later
This release is intended for testing and development only