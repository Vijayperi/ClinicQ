-- Runs once, the first time the database container starts with an empty volume.
-- The main "clinicq" database is created by POSTGRES_DB in docker-compose.yml.
CREATE DATABASE clinicq_test OWNER clinicq;
CREATE DATABASE clinicq_e2e OWNER clinicq;
