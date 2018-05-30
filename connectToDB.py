import psycopg2
import json
from operator import itemgetter

# database = "ClinicDashDB"
# user = "srikasip"
# host = "localhost"
# port =''
# password = ''

# database = "dbdn35j2qc2vng"
# user = "nvjdukzppiswle"
# host = "ec2-54-235-206-118.compute-1.amazonaws.com"
# port ='5432'
# password = '95279c5af9434c8427dd077c2e6b1150b36bc1ecb18182a380983cc2e34d6616'

database = "clinicdashDBSB"
user = "srikasip"
host = "clinicdashdb-sandbox.c2kutneknah5.us-east-2.rds.amazonaws.com"
port ='5432'
password = 'V1nayaka'


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
  
  command = command.replace("||user_id||", str(user_id))
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

def getOnePatient(ptnt_id):
  statement = 'SELECT getPatientFromID('+str(ptnt_id)+')'
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
    if key not in ['userID', 'appScore', 'complScore', 'isSurgical']:
      statement += "'"+newPtntDict[key]+ "', "
    else:
      statement += str(newPtntDict[key])+ ", "
  statement = statement[:-2]
  statement = statement + ");"
  print(statement)
  ptntID = connectToDB(statement)
  return ptntID

def login(username, password):
  statement = "SELECT login('"+username+"','"+password+"');"
  result = connectToDB(statement)

  return result

def createNewUser(name, specialty, azip, email, username, password):
  statement = "SELECT checkUserName('"+username+"','"+email+"');"
  result = connectToDB(statement)

  if result == True:
    statement = "SELECT loadLoginInfo('"+username+"', '"
    statement += password+"', '"+ name+"', '" +specialty +"', '" 
    statement += azip + "', '" + email +"');"

    result = connectToDB(statement)
  else:
    result = 0

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

def connectToDB(command):
  conn = psycopg2.connect("dbname='"+database+"' user='"+user+"' host='"+host+"' password='"+password+"' port="+port)
  cur = conn.cursor()
  cur.execute(command)
  allData = cur.fetchall()[0][0]

  conn.commit()
  cur.close()
  conn.close()
  return allData