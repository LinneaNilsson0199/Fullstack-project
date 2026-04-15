
--Roles table
create table roles (
id SERIAL primary key,
role_name VARCHAR(50) unique not null
);


--Users table
create table users (
id SERIAL primary key,
full_name VARCHAR(100) not null ,
email VARCHAR(100) unique not null,
password_hash VARCHAR(255) not null,
role_id INT references roles(id),
created_at timestamp default CURRENT_TIMESTAMP
);


--Add roles to roles table
insert into roles (role_name)
values ('admin'), ('parent'), ('child');


--Parent_Child connection table
create table parent_child (
id SERIAL primary key,
parent_user_id INT not null references users(id),
child_user_id INT not null references users(id),
unique (parent_user_id, child_user_id)
);


--Scan result table
create table scan_results (
id SERIAL primary key,
child_user_id INT not null references users(id),
file_name VARCHAR(255) not null,
detected_text TEXT,
match_count INT default 0,
severity VARCHAR(20) default 'new',
scanned_at TIMESTAMP default CURRENT_TIMESTAMP,
created_at TIMESTAMP default CURRENT_TIMESTAMP
);


--Add test user
--parent
INSERT INTO users (full_name, email, password_hash, role_id)
VALUES (
  'Anna Andersson',
  'anna@test.com',
  'hashed',
  (SELECT id FROM roles WHERE role_name = 'parent')
);

--child
INSERT INTO users (full_name, email, password_hash, role_id)
VALUES (
  'Leo Andersson',
  'leo@test.com',
  'hashed',
  (SELECT id FROM roles WHERE role_name = 'child')
);


--Insert relation into parent_child table
INSERT INTO parent_child (parent_user_id, child_user_id)
VALUES (1, 2);



--Add test data to scan_result table
INSERT INTO scan_results (child_user_id, file_name, detected_text, match_count, severity)
VALUES (
  (SELECT id FROM users WHERE email = 'leo@test.com'),
  'chat.txt',
  'bad word example',
  2,
  'high'
);


--TEST 
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

ALTER TABLE scan_results
ADD CONSTRAINT scan_results_severity_check
CHECK (severity IN ('low', 'medium', 'high'));

select * from scan_results;

INSERT INTO scan_results (child_user_id, file_name, detected_text, match_count, severity)
VALUES (
  2,
  'test.txt',
  'test',
  1,
  'low'
);

