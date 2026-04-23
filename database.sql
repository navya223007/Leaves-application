CREATE DATABASE career_portal;
USE career_portal;
CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  mobile VARCHAR(15),
  message TEXT,
  resume VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
drop table jobs;

CREATE TABLE jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  jobrole VARCHAR(255),
  joblocation VARCHAR(255),
  jobtype VARCHAR(100),
  jobdescription TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
ALTER TABLE jobs ADD UNIQUE (jobrole, joblocation);

CREATE DATABASE IF NOT EXISTS career_portal;
USE career_portal;
CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  jobrole VARCHAR(255),
  joblocation VARCHAR(255),
  jobtype VARCHAR(100),
  jobdescription TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_job (jobrole, joblocation)
);
SHOW TABLES;