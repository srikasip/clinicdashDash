CREATE OR REPLACE FUNCTION insertdiagnoses(val varchar(100))
  RETURNS integer as $$
  DECLARE _itemID_ integer;
  BEGIN
    INSERT INTO diagnoses (name) VALUES (val) RETURNING id INTO _itemID_;
    RETURN _itemID_;
  END $$ language 'plpgsql';

CREATE OR REPLACE FUNCTION insertorGetdiagnoses(val varchar(100))
  RETURNS integer as $$
  DECLARE _itemID_ integer;
  BEGIN
    SELECT min(id) INTO _itemID_ From diagnoses WHERE name = val;

    SELECT (CASE WHEN _itemID_ > 0 
    THEN 
      _itemID_
    ELSE
      insertdiagnoses(val)
    END) INTO _itemID_;

    RETURN _itemID_;
  END $$ language 'plpgsql';


CREATE OR REPLACE FUNCTION insertinsurances(val varchar(100))
  RETURNS integer as $$
  DECLARE _itemID_ integer;
  BEGIN
    INSERT INTO insurances (name) VALUES (val) RETURNING id INTO _itemID_;
    RETURN _itemID_;
  END $$ language 'plpgsql';

CREATE OR REPLACE FUNCTION insertorGetinsurances(val varchar(100))
  RETURNS integer as $$
  DECLARE _itemID_ integer;
  BEGIN
    SELECT min(id) INTO _itemID_ From insurances WHERE name = val;

    SELECT (CASE WHEN _itemID_ > 0 
    THEN 
      _itemID_
    ELSE
      insertinsurances(val)
    END) INTO _itemID_;

    RETURN _itemID_;
  END $$ language 'plpgsql';


CREATE OR REPLACE FUNCTION insertpractices(val varchar(100))
  RETURNS integer as $$
  DECLARE _itemID_ integer;
  BEGIN
    INSERT INTO practices (name) VALUES (val) RETURNING id INTO _itemID_;
    RETURN _itemID_;
  END $$ language 'plpgsql';

CREATE OR REPLACE FUNCTION insertorGetpractices(val varchar(100))
  RETURNS integer as $$
  DECLARE _itemID_ integer;
  BEGIN
    SELECT min(id) INTO _itemID_ From practices WHERE name = val;

    SELECT (CASE WHEN _itemID_ > 0 
    THEN 
      _itemID_
    ELSE
      insertpractices(val)
    END) INTO _itemID_;

    RETURN _itemID_;
  END $$ language 'plpgsql';


CREATE OR REPLACE FUNCTION insertrefdocs(val varchar(100))
  RETURNS integer as $$
  DECLARE _itemID_ integer;
  BEGIN
    INSERT INTO refdocs (name) VALUES (val) RETURNING id INTO _itemID_;
    RETURN _itemID_;
  END $$ language 'plpgsql';

CREATE OR REPLACE FUNCTION insertorGetrefdocs(val varchar(100))
  RETURNS integer as $$
  DECLARE _itemID_ integer;
  BEGIN
    SELECT min(id) INTO _itemID_ From refdocs WHERE name = val;

    SELECT (CASE WHEN _itemID_ > 0 
    THEN 
      _itemID_
    ELSE
      insertrefdocs(val)
    END) INTO _itemID_;

    RETURN _itemID_;
  END $$ language 'plpgsql';


CREATE OR REPLACE FUNCTION getPatientFromID(_patient_id integer)
RETURNS json as $$
DECLARE json_output json;
BEGIN
  SELECT array_to_json(array_agg(row_to_json(t)))
  FROM
    (
      SELECT p.id, p.name, to_char(p.clinicdate, 'Mon DD, YYYY') as visit_date, p.issurgical, p.appscore, p.complscore, 
        ref.name as docName, diag.name as diagnosis, ins.name as insurance
        FROM 
          patients as p
          Join refDocs as ref 
            On p.refdoc_id = ref.id
          Join diagnoses as diag
            On p.diagnosis_id = diag.id
          JOIN insurances as ins 
            ON p.insurance_id = ins.id
        WHERE
          p.id = _patient_id
        ORDER BY p.clinicdate desc
    ) t INTO json_output;

    RETURN json_output;
END $$ language 'plpgsql';

CREATE OR REPLACE FUNCTION getDocPatients(_userID integer)
RETURNS json as $$
DECLARE json_output json;
BEGIN
  SELECT array_to_json(array_agg(row_to_json(t)))
  FROM
    (
      SELECT p.id, p.name, to_char(p.clinicdate, 'Mon DD, YYYY') as visit_date, p.issurgical, p.appscore, p.complscore, 
        ref.name as docName, diag.name as diagnosis, ins.name as insurance
        FROM 
          patients as p
          Join refDocs as ref 
            On p.refdoc_id = ref.id
          Join diagnoses as diag
            On p.diagnosis_id = diag.id
          JOIN insurances as ins 
            ON p.insurance_id = ins.id
        WHERE
          p.user_id = _userID
        ORDER BY p.clinicdate desc
    ) t INTO json_output;

    RETURN json_output;
END $$ language 'plpgsql';

CREATE OR REPLACE FUNCTION createPatient(_userID integer, _name varchar(100), _refDoc varchar(100), _visitDate date, _diagnosis varchar(100), _insurance varchar(100), _appScore numeric, _complScore numeric, _isSurgical boolean)
  RETURNS integer as $$
  DECLARE _patient_id integer;
  DECLARE _refDoc_id integer;
  DECLARE _diagnosis_id integer;
  DECLARE _insurance_id integer;
  BEGIN
    Select insertorGetdiagnoses(lower(_diagnosis)) into _diagnosis_id;
    Select insertorGetrefdocs(_refDoc) into _refDoc_id;
    Select insertorGetinsurances(upper(_insurance)) into _insurance_id;

    INSERT INTO patients(user_id, name, clinicdate, refdoc_id, diagnosis_id, issurgical,appscore,complscore, insurance_id)
    VALUES (_userID, _name, _visitDate, _refDoc_id, _diagnosis_id, _isSurgical, _appScore, _complScore, _insurance_id)
    RETURNING id into _patient_id;

    RETURN _patient_id;

  END $$ language 'plpgsql';


CREATE OR REPLACE FUNCTION checkUserName(username varchar(45), useremail varchar(100))
  RETURNS boolean as $$
  DECLARE _isUnique_ boolean;

  BEGIN
  
    SELECT
    CASE WHEN NOT EXISTS (SELECT l.id FROM logins as l JOIN users as u
                            ON l.id = u.id
                          WHERE l.uname = username or u.email = useremail
                          ) 
      THEN TRUE ELSE FALSE
    END as isUnique INTO _isUnique_;

    RETURN _isUnique_;
  END $$ language 'plpgsql';


CREATE OR REPLACE FUNCTION loadLoginInfo(username varchar(45), password varchar(45), _name varchar(100), _specialty varchar(100), _zip varchar(10), _email varchar(100))
  RETURNS integer as $$
  DECLARE _user_id_ integer;

  BEGIN

  INSERT INTO logins (uName, pwd)
  VALUES (username, password)
  RETURNING id INTO _user_id_;

  INSERT INTO users (id, name, specialty, zip, email)
  VALUES (_user_id_, _name, _specialty, _zip, _email);

  RETURN _user_id_;

  END $$ language 'plpgsql';

CREATE OR REPLACE FUNCTION login(username varchar(45), password varchar(45))
  RETURNS integer as $$
  DECLARE _user_id_ integer;
  BEGIN
    SELECT
    CASE WHEN NOT EXISTS (SELECT l.id FROM logins as l 
                          WHERE l.uname = username and l.pwd = password)
      THEN 0
      ELSE (SELECT max(l.id) FROM logins as l WHERE l.uname = username and l.pwd = password)
    END INTO _user_id_;

    RETURN _user_id_;

  END $$ language 'plpgsql';