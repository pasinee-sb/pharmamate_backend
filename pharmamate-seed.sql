-- Insert a user with is_admin set to TRUE

-- both test users have the password "password"
INSERT INTO users (username, password, is_admin)
VALUES ('admin_user','$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',TRUE);

-- Insert a user with is_admin set to FALSE
INSERT INTO users (username, password, is_admin)
VALUES ('regular_user','$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',FALSE);


-- Inserting sample data into medication_status_history
INSERT INTO medication_history (username, drug_name, status, start_date, stop_date)
VALUES
  ('admin_user', 'aspirin', 'active', '2023-01-01', NULL),
  ('admin_user', 'ibuprofen', 'active', '2023-02-15', NULL),
  ('regular_user', 'acetaminophen', 'inactive', '2023-03-10', '2023-04-05'),
  ('regular_user', 'lisinopril', 'active', '2023-03-20', NULL),
  ('regular_user', 'atorvastatin', 'active', '2023-02-28', NULL),
  ('regular_user', 'metformin', 'inactive', '2023-03-05', '2023-03-25');

INSERT INTO health_journals (username, journal)
VALUES ('admin_user', 'I feel fine today'),('regular_user', 'I feel sick today')
