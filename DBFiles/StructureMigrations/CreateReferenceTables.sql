CREATE TABLE IF NOT EXISTS addresses(
  type varchar(20), 
  npi_id varchar(12) NOT NULL,
  firstLine varchar(100),
  secondLine varchar(100),
  city varchar(100),
  state varchar(100),
  zip varchar(20),
  country varchar(100),
  telephone varchar(20),
  fax varchar(20),
  zip1 varchar(5),
  zip2 varchar(5),
  lat numeric, 
  long numeric
);

CREATE TABLE IF NOT EXISTS main(
  npi_id varchar(12) NOT NULL,
  type varchar(2), 
  last_update_str varchar(20), 
  deactCode varchar(50),
  deactDate varchar(20),
  reactDate varchar(50),
  gender varchar(3),
  isSole varchar(3),
  isOrgSubpart varchar(3),
  orgName varchar(100),
  otherOrgName varchar(100),
  otherOrgType varchar(3)
);

CREATE TABLE IF NOT EXISTS names(
  type varchar(20),
  npi_id varchar(12) NOT NULL, 
  lastName varchar(100),
  firstName varchar(100),
  middleName varchar(100),
  prefix varchar(50),
  suffix varchar(50),
  credential varchar(20),
  other_name_type varchar(3),
  title varchar(50),
  telephone varchar(20)
);

CREATE TABLE IF NOT EXISTS other_ids(
  npi_id varchar(12) NOT NULL, 
  other_id varchar(100),
  id_type varchar(3),
  state varchar(5),
  issuer varchar(100)
);

CREATE TABLE IF NOT EXISTS taxonomyGroups(
  npi_id varchar(12) NOT NULL, 
  group_name varchar(100)
);

CREATE TABLE IF NOT EXISTS taxonomies(
  npi_id varchar(12) NOT NULL, 
  code varchar(20), 
  license_number varchar(50),
  license_number2 varchar(50),
  is_primary varchar(20)
);

CREATE TABLE IF NOT EXISTS taxonomiesRef(
  id varchar(20) NOT NULL primary key,
  name varchar(100), 
  referenceLink varchar(200)
);

CREATE TABLE IF NOT EXISTS zipCodes(
  id serial primary key, 
  zip varchar(5) NOT NULL, 
  city varchar(50), 
  state varchar(4),
  loc_type varchar(25), 
  lat varchar(25), 
  long varchar(25),
  world_region varchar(50), 
  country varchar(5),
  location varchar(100),
  pop varchar(11)
);