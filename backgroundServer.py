from flask import Flask, redirect
from flask import render_template
from flask import render_template_string
from flask import request
from flask import jsonify
import json
from datetime import datetime
import connectToDB as dbHand
import PartialsHandler as partHand
import htmlmin
import os
import EncDecHandler as crypto

app = Flask(__name__)
#app = Flask(__name__, instance_relative_config=True)
#app.config.from_pyfile('.env', silent=True)

@app.before_request
def before_request():
  #if request.url.startswith('http://'):
  if not request.is_secure:
    url = request.url.replace('http://', 'https://', 1)
    code = 301
    return redirect(url, code=code)


@app.route('/signup')
def signup():
  return render_template("signup.html")

@app.route('/login')
def login():
  return render_template("login.html")

@app.route('/', methods=['GET'])
@app.route('/dash', methods=['GET', 'POST'])
def bigDash():
  # return render_template("bigDash.html")
  return render_template("newDash.html")

@app.route("/doSignup", methods=['POST'])
def saveProfile():
  profile = request.get_json()
  is_created = dbHand.createNewUser(profile["profileData"]["name"], profile["profileData"]["specialty"], profile["profileData"]["zip"], profile["profileData"]["email"], profile["profileData"]["uName"], profile["profileData"]["pwd"])
  response = {'isCreated':is_created}
  return jsonify(response)

@app.route("/doLogin", methods=['POST'])
def doLogin():
  loginData = request.get_json()
  loginObj = dbHand.login(loginData["loginData"]["uName"], loginData["loginData"]["pwd"])
  cookie = json.dumps(loginObj['userObj'])
  cookie = crypto.spotEnc(cookie)
  response = {"isUser":loginObj['status'], 'userObj':cookie}
  return jsonify(response)

@app.route("/dash/newPatient", methods=['POST'])
def newPatientPartial():
  userData = request.get_json()
  pageString = partHand.GetPartialText('newPatient.html')

  #existingPatients = partHand.GetAllPatients(userData['user_id'])
  #pageString = pageString + "\n" + existingPatients

  minified = htmlmin.minify(pageString, remove_empty_space=True)
  return render_template_string(minified)

@app.route("/dash/mainDash", methods=['GET','POST'])
def mainDashPartial():
  userData = request.get_json()
  pageString = partHand.GetPartialText('mainDash.html')

  #existingPatients = partHand.GetAllPatients(userData['user_id'])
  #pageString = pageString + "\n" + existingPatients

  minified = htmlmin.minify(pageString, remove_empty_space=True)
  return render_template_string(minified)

@app.route("/dash/search", methods=['GET','POST'])
def searchPartial():
  pageString = partHand.GetPartialText("search.html")
  minified = htmlmin.minify(pageString, remove_empty_space=True)
  return render_template_string(minified)

@app.route('/search/allTerms', methods=['POST'])
def search_allTerms():
  userData = request.get_json()
  userData = crypto.spotDec(userData['user_id'])
  userData = json.loads(userData)
  
  colNames = ["label", "category", "value"]
  allData = dbHand.getJSON("DBFiles/QueryFiles/getSearchSuggestions.sql", colNames, userData)
  if allData == False:
    return jsonify({'result':'Invalid User'})
  else:
    return jsonify(allData)

@app.route("/dashboard/search/<int:id>/<string:category>")
def dashboard_search(id, category):
  colNames = ["ClinicDate", "IsDirect", "WasScreened", "ScreenDate", "IsSurgical", "AppScore", "ComplexityScore"]
  colNames += ["ValueScore", "Location", "Name", "Diagnosis", "Referring_Doc", "Practice", "Insurance", "IsMedicaid"]

  allPatientData = dbHand.customSearchQuery(category, id, colNames)
  return jsonify(allPatientData)

@app.route("/dashboard/patients", methods=['POST'])
def getPatients():
  userData = request.get_json()
  userData = crypto.spotDec(userData['user_id'])
  userData = json.loads(userData)

  colNames = ["Id", "Name", "ClinicDate", "IsDirect", "WasScreened", "ScreenDate", "IsSurgical", "AppScore", "ComplexityScore"]
  colNames += ["ValueScore", "Location", "Diagnosis", "Referring_Doc", "Practice", "Insurance", "IsMedicaid"]
  allPatients_json = dbHand.getJSON("DBFiles/QueryFiles/mainSelect.sql", colNames, userData)
  
  if allPatients_json == False:
    return jsonify({'result':'Invalid User'})
  else:
    return jsonify(allPatients_json)


@app.route("/logout", methods=['POST'])
def logout():
  userData = request.get_json()
  userData = crypto.spotDec(userData['user_id'])
  userData = json.loads(userData)

  result = dbHand.updateToken(userData)
  return jsonify({'result': result})

@app.route("/dash/createPatient", methods=['POST'])
def createNewPatient():
  newPatient = request.get_json()
  print(newPatient)
  ptntID = dbHand.createPatient(newPatient)
  #response = partHand.getOnePatientData(ptntID)
  if ptntID == False:
    #return render_template_string('Invalid User')
    return jsonify({"result": "Invalid User"})
  else:
    response = partHand.getOnePatientData(ptntID)
    #minified = htmlmin.minify(response, remove_empty_space=True)
    #return render_template_string(minified)
    return jsonify(response)
  #return jsonify(response)

@app.route("/dash/editPatient", methods=['POST'])
def editPatient():
  editablePatient = request.get_json();
  ptntID = dbHand.editPatient(editablePatient)

  if ptntID == False:
    #return render_template_string('Invalid User')
    return jsonify({"result": "Invalid User"})
  else:
    response = partHand.getOnePatientData(ptntID)
    return jsonify(response)


if __name__ == '__main__':
  context = os.environ.get('APP_CD_CONTEXT', default='development')
  if context == 'development':
    app.run(ssl_context='adhoc')
  #elif context == 'sandbox':
  else:
    app.run()
  # else:
  #   app.run(ssl_context='adhoc')