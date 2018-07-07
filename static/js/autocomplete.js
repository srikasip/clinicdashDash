var autocompleteBox; 
var autocompleteList; 

function setAutocomplete(parent, keys)
{
  acBoxText = "<div id='searchyAutocomplete' class='autocomplete'></div>"
  autocompleteBox = $(acBoxText);
  parent = $(parent).parent()
  parent.append(autocompleteBox);

  SetSearchableContent(keys);
}

function SetSearchableContent(allKeys){
  //get an array of unique doctors, practices, patient names, and diagnoses
  patientNames = allKeys["patientNames"];
  doctors = allKeys["doctors"];
  insurances = allKeys["insurances"];
  isSurgical = ["Surgical", "Non Surgical"];
}