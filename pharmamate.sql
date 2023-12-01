\echo 'Delete and recreate pharmamate db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS pharmamate;
CREATE DATABASE pharmamate;
\connect pharmamate

\i pharmamate-schema.sql
\i pharmamate-seed.sql

\echo 'Delete and recreate pharmamate_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS pharmamate_test;
CREATE DATABASE pharmamate_test;
\connect pharmamate_test
\i pharmamate-schema.sql