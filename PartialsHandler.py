import connectToDB as dbHand
import datetime

def getOnePatientData(ptntID):
  allPatients = dbHand.getOnePatient(ptntID)
  print(ptntID)
  print(allPatients)
  if allPatients and len(allPatients)>0:
    return allPatients[0]
  else:
    return 0;

def getOnePatient(ptntID):
  allPatients = dbHand.getOnePatient(ptntID)
  blocks = getPatientBlocks(allPatients)
  return blocks

def GetAllPatients(userID):
  allPatients = dbHand.getAllPatients(userID)
  blocks = getPatientBlocks(allPatients)
  return blocks


def getPatientBlocks(allPatients):
  htmlPart = ''
  partialCard = GetPartialText('patientCard.html')
  if allPatients and len(allPatients)>0:
    for patient in allPatients:
      newPatient = partialCard.replace('||Name||', patient["name"])
      newPatient = newPatient.replace('||DocName||', patient["docname"])
      newPatient = newPatient.replace('||Diagnosis||', patient["diagnosis"])
      newPatient = newPatient.replace('||DateString||', patient["visit_date"])
      newPatient = newPatient.replace('||AppScore||', str(patient["appscore"]))
      newPatient = newPatient.replace('||ComplexScore||', str(patient["complscore"]))
      newPatient = newPatient.replace('||Insurance||', patient["insurance"])

      if patient["issurgical"]:
        newPatient = newPatient.replace('||IsSurgical||', 'Surgical')
      else:
        newPatient = newPatient.replace('||IsSurgical||', 'Not Surgical')

      htmlPart += newPatient + "\n"

  return htmlPart  

def GetPartialText(url):
  url = "templates/dashPartials2/" + url
  
  with open(url, "r") as partFile:
    partialData = partFile.read()

  return partialData