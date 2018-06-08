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

def getJSON(filename, colNames, userdata):
  uid = getUID(userdata)
  if uid:
    with open(filename, "rU") as sqlFile:
      command = sqlFile.read()
    
    command = command.replace("||user_id||", uid)
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
  else:
    return False

def getOnePatient(ptnt_id):
  statement = 'SELECT getPatientFromID('+str(ptnt_id)+');'
  allPtnts = connectToDB(statement)
  return allPtnts

def getAllPatients(userID):
  uid = getUID(userID)
  if uid: 
    statement = "SELECT getDocPatients('" + uid + "');"
    allPtnts = connectToDB(statement)
    return allPtnts
  else:
    return False

def createPatient(newPtntDict):
  userData = json.loads(crypto.spotDec(newPtntDict['userID']))
  uid = getUID(userData)
  if uid:
    keys = ["userID", "name", "refDoc", "visitDate", "diagnosis", "insurance", "appScore", "complScore", "isSurgical"]
    statement = "SELECT createPatient("
    for key in keys:
      if key not in ['appScore', 'complScore', 'isSurgical']:
        if key == 'name':
          newPtntDict[key] = crypto.spotEnc(newPtntDict[key])
        elif key == 'userID':
          newPtntDict[key] = uid
          
        statement += "'"+newPtntDict[key]+ "', "
      else:
        statement += str(newPtntDict[key])+ ", "
    statement = statement[:-2]
    statement = statement + ");"
    # print(statement)
    ptntID = connectToDB(statement)
    return ptntID
  else:
    return False

def login(username, password):
  newPass = crypto.spotEnc(password)
  statement = "SELECT login('"+username+"','"+newPass+"');"
  result = connectToDB(statement) #getRecordDB(statement, ['uid', 'identity', 'token'])
  if result:
    userObj = {'identity':result['identity'], 'token':result['token']}
    status = True
  else:
    userObj = {'identity':None, 'token':None}
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

def getUID(userData):
  print(userData)
  statement = "Select getUID('"+userData['identity']+"', '"+userData['token']+"');"
  uid = connectToDB(statement);
  return uid;


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