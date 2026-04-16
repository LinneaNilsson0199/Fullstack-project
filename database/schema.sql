-- ============== --
-- Drop tables
-- ============== --

-- Drop child tables first because they depend on users.
DROP TABLE IF EXISTS scan_results CASCADE;
DROP TABLE IF EXISTS parent_child CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;


-- ============== --
-- Create tables
-- ============== --

-- Roles table --
-- Stores the allowed user roles in the system.
create table roles (
id SERIAL primary key,
role_name VARCHAR(50) unique not null
);


-- Users table --
-- Stores all users.
-- Each user must have:
-- - a full name
-- - an email
-- - a password hash
-- - a valid role_id that references roles(id)
create table users (
id SERIAL primary key,
full_name VARCHAR(100) not null ,
email VARCHAR(100) unique not null,
password_hash VARCHAR(255) not null,
role_id INT not null references roles(id),
created_at timestamp default CURRENT_TIMESTAMP,
-- Prevent empty or whitespace-only full names
CONSTRAINT users_full_name_not_empty 
CHECK (TRIM(full_name) <> ''),
-- Prevent empty or whitespace-only emails
CONSTRAINT users_email_not_empty 
CHECK (TRIM(email) <> ''),
-- Prevent empty or whitespace-only password hashes
CONSTRAINT users_password_not_empty 
CHECK (TRIM(password_hash) <> '')
);


-- Parent_Child connection table --
-- Connects parent users to child users.
-- A user cannot be connected to themselves.
-- If a referenced user is deleted, related rows are deleted automatically.
create table parent_child (
id SERIAL primary key,
parent_user_id INT not null references users(id) ON DELETE CASCADE,
child_user_id INT not null references users(id) ON DELETE CASCADE,
-- Prevent duplicate parent-child pairs
CONSTRAINT parent_child_parent_user_id_child_user_id_key UNIQUE (parent_user_id, child_user_id),
-- Prevent the same user from being both parent and child in the same row
CONSTRAINT parent_child_not_same CHECK (parent_user_id <> child_user_id)
);


-- Scan result table --
-- Stores scan results connected to a child user.
-- If the child user is deleted, related scan results are deleted automatically.
create table scan_results (
id SERIAL primary key,
child_user_id INT not null references users(id) ON DELETE CASCADE,
file_name VARCHAR(255) not null,
detected_text TEXT,
match_count INT default 0,
severity VARCHAR(20) default 'low',
scanned_at TIMESTAMP default CURRENT_TIMESTAMP,
created_at TIMESTAMP default CURRENT_TIMESTAMP,
-- Only allow known severity values
CONSTRAINT scan_results_severity_check
CHECK (severity IN ('low', 'medium', 'high'))
);


-- ============== --
-- Insert default data
-- ============== --

-- Add roles to roles table --
insert into roles (role_name)
values ('admin'), ('parent'), ('child');


-- ============== --
-- Test
-- ============== --

-- Insert test users --
-- Example parent user
INSERT INTO users (full_name, email, password_hash, role_id)
VALUES (
    'Anna Andersson',
    'anna@test.com',
    'hashed',
    (SELECT id FROM roles WHERE role_name = 'parent')
);


-- Example child user
INSERT INTO users (full_name, email, password_hash, role_id)
VALUES (
    'Leo Andersson',
    'leo@test.com',
    'hashed',
    (SELECT id FROM roles WHERE role_name = 'child')
);


-- Insert test parent-child relation --
-- Uses subqueries instead of hardcoded IDs to make the script safer.
INSERT INTO parent_child (parent_user_id, child_user_id)
VALUES (
    (SELECT id FROM users WHERE email = 'anna@test.com'),
    (SELECT id FROM users WHERE email = 'leo@test.com')
);


-- Insert test scan result --
INSERT INTO scan_results (child_user_id, file_name, detected_text, match_count, severity)
VALUES (
    (SELECT id FROM users WHERE email = 'leo@test.com'),
    'chat.txt',
    'bad word example',
    2,
    'high'
);


-- JOIN TEST (Shows full relation data) --
-- Shows parent name, child name, and scan result in one query
SELECT 
    p.full_name AS parent_name,
    c.full_name AS child_name,
    s.file_name,
    s.detected_text,
    s.match_count,
    s.severity,
    s.scanned_at
FROM parent_child pc
JOIN users p ON pc.parent_user_id = p.id
JOIN users c ON pc.child_user_id = c.id
JOIN scan_results s ON s.child_user_id = c.id;


-- CONSTRAINT TESTS (These should FAIL) --

-- Test: Cannot insert user without role_id --
-- Should give error
INSERT INTO users (full_name, email, password_hash)
VALUES ('No Role User', 'norole@test.com', 'hashed');


-- Test: Cannot insert empty full_name --
-- Should give error
INSERT INTO users (full_name, email, password_hash, role_id)
VALUES ('', 'empty@test.com', 'hashed', 1);


-- Test: Cannot insert empty email --
-- Should give error
INSERT INTO users (full_name, email, password_hash, role_id)
VALUES ('Test User', '', 'hashed', 1);


-- Test: Cannot insert empty password --
-- Should give error
INSERT INTO users (full_name, email, password_hash, role_id)
VALUES ('Test User', 'test@test.com', '', 1);


-- Test: Cannot use invalid severity --
-- Should give error
INSERT INTO scan_results (child_user_id, file_name, detected_text, match_count, severity)
VALUES (1, 'bad.txt', 'test', 1, 'extreme');


-- Test: Parent cannot be same as child --
-- Should give error
INSERT INTO parent_child (parent_user_id, child_user_id)
VALUES (1, 1);


-- CASCADE DELETE TEST --
-- Delete a user and verify related data is removed automatically

-- Delete child user (Leo)
DELETE FROM users
WHERE email = 'leo@test.com';


-- Check that related data is also removed
SELECT * FROM parent_child;
SELECT * FROM scan_results;


-- ============== --
-- Commands
-- ============== --
-- These queries can be used to verify that everything works correctly.

-- View all roles
SELECT * FROM roles;


-- View all users
SELECT * FROM users;


-- View parent-child relationships
SELECT * FROM parent_child;


-- View scan results
SELECT * FROM scan_results;