// function NewPatientViewer(){
//   $("#newptntAdderIcon").click(function(){
//       $('#firstElementBuilder').removeClass('addForm').addClass('inputForm');
//   });
// }

function StatusGroup(d){
  if(isCompleteRecord(d)){
    status = "Complete";
  }
  else{
    status = "Incomplete";
  }

  return status;
}

function DateGroup(d){
  return d.ClinicDate;
}

function SchedGroup(d){
  wordGroup = "Past";
  if(d.ClinicDate == today){
    wordGroup = "Today"
  }
  else if(d.ClinicDate > today){
    wordGroup = "Future"
  }
  return wordGroup;
}

function LoadPatientsByDate(){
  var patientGrid = dc.dataGrid('.mainBox');
  today = new Date();
  patientGrid
    .dimension(idDim)
    .group(function(d){return getDateDecimal(d.ClinicDate);})
    .sortBy(function(a){return getDateDecimal(a.ClinicDate);})
    .order(function(a,b){return b - a;})
    .html(function(patientData){
      return MakePatientCard(patientData);
    })
    .size(patientCross.size())
    .htmlGroup(function(d){
      return "<h2>"+getDate(getDateFromDecimal(d.key))+"</h2>"
    });

  patientGrid.render();
}
function LoadAllPatients(groupingFunc){
  groupingFunc = groupingFunc || SchedGroup;

  var patientGrid = dc.dataGrid('.mainBox');
  today = new Date();
  patientGrid
    .dimension(idDim)
    .group(groupingFunc)
    // .sortBy(function(a){return a.ClinicDate;})
    .order(function(a,b){return setDate(b) - setDate(a);})
    .html(function(patientData){
      return MakePatientCard(patientData);
    })
    .size(patientCross.size())
    .htmlGroup(function(d){
      // console.log(d);
      if(d.key instanceof Date){
        title = getDate(d.key);
      }
      else{
        title = d.key;
      }
      return "<h2>"+title+"</h2>";
    });

  patientGrid.render();
}
function setDate(sentDate){
  var formatDate = d3.timeParse("%a %b %d, %Y");
  return formatDate(sentDate);
}
function getDate(sentDate){
  var formatDate = d3.timeFormat("%a %b %d, %Y");
  // date = new Date(2014, 4, 1); // Thu May 01 2014 00:00:00 GMT-0700 (PDT)

  return formatDate(sentDate);
}
function getDateFromDecimal(d){
  year = parseInt(d);
  month = parseInt((d-year)*100);
  day = parseInt((((d-year)*100) - month)*100);

  if(month < 9){monthStr = "0" + String(month + 1);}
  else{monthStr = String(month + 1);}
  if(day < 9){dayStr = "0" + String(day + 1);}
  else{dayStr = String(day + 1);}

  dateString = String(year) + ", " + monthStr + " " + dayStr;
  var formatDate = d3.timeParse("%Y, %m %d");
  return formatDate(dateString);
}
function getDateDecimal(d){
  year = d.getFullYear();
  month = d.getMonth();
  day = d.getDate();

  dateNum = year + (month/100.0) + (day/10000.0);
  return dateNum
}
function MakePatientCard(d){
  var surg = "?";
  if(d.IsSurgical == true){surg = "Surgical";}
  else if(d.IsSurgical == false){surg = "Not Surgical";}
  stringy = '';
  stringy += '<div class="patientRow collapsed">';
  stringy += '<span class="item p_indicator ';
  if(isCompleteRecord(d)){
    stringy += 'ind_complete';
  }
  else{
    stringy += 'ind_incomplete';
  }

  stringy += '"></span>';
  stringy += '<span class="item p_avatar';
  if(d.IsSurgical == true){
    stringy += " avatar_surg";}
  else if(d.IsSurgical == false){
    stringy += " avatar_nonsurg";}
  else{
    stringy += " .avatar_unknown";}
  stringy += '"></span>';
  stringy += '<div class="item namesBlock">';
  stringy += '<span class="p_name">'+d.Name+'</span>';
  stringy += '<span class="p_refDoc">By: '+d.Referring_Doc+'</span>';
  stringy += '</div>';
  stringy += '<span class="item p_diag">'+d.Diagnosis+'</span>';
  stringy += '<span class="item p_date">'+getDate(d.ClinicDate)+'</span>';
  stringy += '</div>';

  return stringy;
  //return "";
}

function isCompleteRecord(data){
  keys = ["Name", "ClinicDate", "Referring_Doc", "IsSurgical", "Diagnosis", "Insurance", "AppScore", "ComplexityScore"];
  outputs = [];
  keys.forEach(function(key){
    if(data[key] == null){
      outputs.push(false);}
    else{
      outputs.push(true);}
  });
  if(outputs.indexOf(false)>=0){
    return false;
  }
  else{
    return true;
  }
}

function EditCard(){
  $(".editCard").on('click', function(){
    //Convert this card to an editable
  });
}