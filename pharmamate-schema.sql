CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);



CREATE TABLE medication_history (
  id SERIAL PRIMARY KEY,
  username VARCHAR(25) REFERENCES users ON DELETE CASCADE,
  drug_name TEXT  NOT NULL CHECK (drug_name = lower(drug_name)),
  status TEXT NOT NULL,
  start_date DATE NOT NULL,
  stop_date DATE,
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive')),
  CONSTRAINT valid_dates CHECK (
    (status = 'active' AND stop_date IS NULL) OR
    (status = 'inactive' AND stop_date IS NOT NULL)
  )
);

CREATE TABLE health_journals (
    username VARCHAR(25) REFERENCES users ON DELETE CASCADE,
    journal TEXT,
    PRIMARY KEY (username)
)
