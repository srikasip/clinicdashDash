CREATE SEQUENCE identities_idx_seq;

CREATE TABLE IF NOT EXISTS identities(
  idx serial,
  uid text primary key DEFAULT getUniqueValue(pseudo_encrypt(nextval('identities_idx_seq'))),
  identity text UNIQUE not null DEFAULT make_uid(),
  token text not null DEFAULT getToken(),
  created_at timestamp NOT NULL DEFAULT now(),
  uname varchar(50) UNIQUE NOT NULL,
  pwd varchar(50) NOT NULL,
  old_identity text, 
  old_token text
);
ALTER SEQUENCE identities_idx_seq OWNED BY identities.idx;

CREATE TABLE if NOT EXISTS notifs(
  uid text primary key, 
  email_id varchar(100) not null, 
  contact_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE if NOT EXISTS usernames(
  id serial primary key,
  name varchar(100) UNIQUE not null
);

CREATE TABLE IF NOT EXISTS users(
  uid varchar(50) primary key,
  specialty varchar(100) NOT NULL,
  email_id varchar(100) NOT NULL,
  name varchar(100) NOT NULL,
  zip varchar(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS patients(
  id serial primary key,
  user_id text NOT NULL references identities(uid),
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
