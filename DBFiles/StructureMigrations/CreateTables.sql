CREATE TABLE IF NOT EXISTS logins(
  id serial primary key,
  uname varchar(45) NOT NULL,
  pwd varchar(45) NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users(
  id integer NOT NULL primary key,
  name varchar(100) NOT NULL,
  specialty varchar(100) NOT NULL,
  zip varchar(10) NOT NULL,
  email varchar(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS patients(
  id serial primary key,
  user_id integer NOT NULL references users(id),
  name varchar(100) NOT NULL,
  clinicdate date NOT NULL,
  refdoc_id integer NOT NULL,
  isdirect boolean,
  wasscreened boolean,
  screendate date,
  diagnosis_id integer,
  issurgical boolean,
  appscore integer,
  complscore integer,
  valuescore integer,
  location varchar(50),
  insurance_id integer,
  annotations text
);

CREATE TABLE IF NOT EXISTS diagnoses(
  id serial primary key,
  name varchar(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS insurances(
  id serial primary key,
  name varchar(100) NOT NULL,
  is_medicaid boolean
);


CREATE TABLE IF NOT EXISTS practices(
  id serial primary key,
  name varchar(200) NOT NULL
);
CREATE TABLE IF NOT EXISTS refDocs(
  id serial primary key, 
  name varchar(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS practicesDocsPivot(
  id serial primary key, 
  refdoc_id integer,
  practice_id integer
);
