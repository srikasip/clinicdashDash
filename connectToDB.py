import psycopg2
import json
from operator import itemgetter
import os
import EncDecHandler as crypto


database = "ClinicDashDB"
user = "srikasip"
host = "localhost"
port =''
password = ''

# database = os.environ.get("APP_DB", default=None)
# user = os.environ.get("APP_USER", default=None)
# host = os.environ.get("APP_HOST", default=None)
# port = os.environ.get("APP_PORT", default=None)
# password = os.environ.get("APP_PASSWORD", default=None)

# database = "d9235nt8nqau3c"
# user = "rmlvurcgayrkme"
# host = "ec2-54-235-206-118.compute-1.amazonaws.com"
# port ='5432'
# password = '776249df2f5830ca2b09d7879d96020b6fa503a42ecc60ecefabf7235ab2ed9b'


def customSearchQuery(cat, val, colNames):
  filename = "DBFiles/QueryFiles/customMainSelect.sql"
  whereDict = {
    'Practices':{'tableName':'pr', 'searchCol':'id'},
    'Referrers':{'tableName':'d', 'searchCol':'id'},
    'Insurances':{'tableName':'ins', 'searchCol':'id'},
    'Diagnoses':{'tableName':'diag', 'searchCol':'id'},
    'Patients':{'tableName':'p', 'searchCol':'id'}
  }

  with open(filename, "rU") as sqlFile:
    command = sqlFile.read()
  
  whereClause = whereDict[cat]['tableName'] + "." + whereDict[cat]['searchCol'] + " = " + str(val)
  command = command.replace('--||WHERECLAUSE||--',whereClause)
  returnedData = getDBTable(command)

  allData = []
  for row in returnedData:
    counter = 0
    rowData = {}
    for colName in colNames:
      rowData[colName] = row[counter]
      counter += 1
    allData.append(rowData)

  return allData

def getJSON(filename, colNames, user_id):
  with open(filename, "rU") as sqlFile:
    command = sqlFile.read()
  
  command = command.replace("||user_id||", user_id)
  #print(command)
  #print(user_id)
  returnedData = getDBTable(command)

  allData = []
  for row in returnedData:
    counter = 0
    rowData = {}
    for colName in colNames:
      if colName == 'Name':
        rowData[colName] = crypto.spotDec(row[counter])
      else:
        rowData[colName] = row[counter]
      counter += 1

    allData.append(rowData)

  return allData

def getOnePatient(ptnt_id):
  statement = 'SELECT getPatientFromID('+str(ptnt_id)+');'
  allPtnts = connectToDB(statement)
  return allPtnts

def getAllPatients(userID):
  statement = 'SELECT getDocPatients(' + str(userID) + ");"
  allPtnts = connectToDB(statement)
  return allPtnts

def createPatient(newPtntDict):
  keys = ["userID", "name", "refDoc", "visitDate", "diagnosis", "insurance", "appScore", "complScore", "isSurgical"]
  statement = "SELECT createPatient("
  for key in keys:
    if key not in ['appScore', 'complScore', 'isSurgical']:
      if key == 'name':
        newPtntDict[key] = crypto.spotEnc(newPtntDict[key])
      elif key == 'userID':
        newPtntDict[key] = json.loads(crypto.spotDec(newPtntDict[key]))['uid']
        
      statement += "'"+newPtntDict[key]+ "', "
    else:
      statement += str(newPtntDict[key])+ ", "
  statement = statement[:-2]
  statement = statement + ");"
  # print(statement)
  ptntID = connectToDB(statement)
  return ptntID

def login(username, password):
  newPass = crypto.spotEnc(password)
  statement = "SELECT login('"+username+"','"+newPass+"');"
  result = connectToDB(statement) #getRecordDB(statement, ['uid', 'identity', 'token'])
  if result:
    userObj = {"uid":result['uid'], 'identity':result['identity'], 'token':result['token']}
    status = True
  else:
    userObj = {"uid":None, 'identity':None, 'token':None}
    status = False

  return {'userObj':userObj, 'status':status}

def createNewUser(name, specialty, azip, email, username, password):
  #statement = "SELECT checkUserName('"+username+"','"+email+"');"
  #result = connectToDB(statement)
  newPass = crypto.spotEnc(password)
  statement = "SELECT createNewUser('"+username+"', '"+email+"', '"+newPass+"', '"+specialty+"', '"+name+"', '"+azip+"');"
  userData = connectToDB(statement)
  
  if userData['uid'] and userData['uid'] != '':
    result = True
  else:
    result = False

  return result


def getDBTable(command):
  conn = psycopg2.connect("dbname='"+database+"' user='"+user+"' host='"+host+"' password='"+password+"' port="+port)
  cur = conn.cursor()
  cur.execute(command)
  allData = cur.fetchall()

  conn.commit()
  cur.close()
  conn.close()
  return allData

def getRecordDB(command, rowNames):
  conn = psycopg2.connect("dbname='"+database+"' user='"+user+"' host='"+host+"' password='"+password+"' port="+port)
  cur = conn.cursor()
  cur.execute(command)
  allData = cur.fetchall()[0][0]

  

  conn.commit()
  cur.close()
  conn.close()
  return recordItem


def connectToDB(command):
  conn = psycopg2.connect("dbname='"+database+"' user='"+user+"' host='"+host+"' password='"+password+"' port="+port)
  cur = conn.cursor()
  cur.execute(command)
  allData = cur.fetchall()[0][0]

  conn.commit()
  cur.close()
  conn.close()
  return allData