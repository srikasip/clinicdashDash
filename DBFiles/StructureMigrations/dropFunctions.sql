DROP FUNCTION getToken();
DROP FUNCTION make_uid();
DROP FUNCTION getUniqueValue(n bigint);
DROP FUNCTION pseudo_encrypt(VALUE bigint);
DROP FUNCTION insertdiagnoses(val varchar(100));
DROP FUNCTION insertorGetdiagnoses(val varchar(100));
DROP FUNCTION insertinsurances(val varchar(100));
DROP FUNCTION insertorGetinsurances(val varchar(100));
DROP FUNCTION insertpractices(val varchar(100));
DROP FUNCTION insertorGetpractices(val varchar(100));
DROP FUNCTION insertrefdocs(val varchar(100));
DROP FUNCTION insertorGetrefdocs(val varchar(100));
DROP FUNCTION getPatientFromID(_patient_id integer);
DROP FUNCTION getDocPatients(_userID integer);
DROP FUNCTION createPatient(_userID integer, _name varchar(100), _refDoc varchar(100), _visitDate date, _diagnosis varchar(100), _insurance varchar(100), _appScore numeric, _complScore numeric, _isSurgical boolean);
DROP FUNCTION checkUserName(username varchar(100));
DROP FUNCTION createNewUser(username varchar(100), email varchar(100), password varchar(100), spec varchar(100), nam varchar(100), zippy varchar(10));
DROP FUNCTION updateToken(sendentity text, password varchar(100));
DROP FUNCTION updateIdentity(sendentity text, password varchar(100));
DROP FUNCTION updateIdentity(sendentity text);
DROP FUNCTION login(username text, password text);
DROP FUNCTION updatetoken(sendentity text);
DROP FUNCTION login(username varchar(50), password varchar(50));
DROP FUNCTION createnewuser(username varchar(50), email varchar(50));
DROP FUNCTION getUID(ident text, tok text);
DROP FUNCTION updateToken(sendentity text, tok text);
DROP FUNCTION updateIdentity(sendentity text, tok text);