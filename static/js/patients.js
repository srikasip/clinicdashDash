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
  today = new Date();
  if(d.ClinicDate.toDateString() == today.toDateString()){
    wordGroup = "Today"
  }
  else if(d.ClinicDate > today){
    wordGroup = "Future"
  }
  return wordGroup;
}

function LoadPatientsByDate(){
  var patientGrid = dc.dataGrid('.patientsHolder');
  today = new Date();
  patientGrid
    .dimension(idDim)
    .group(function(d){return getDateDecimal(d.ClinicDate);})
    .sortBy(function(a){return (-1*getDateDecimal(a.ClinicDate));})
    .order(function(a,b){return b - a;})
    .html(function(patientData){
      return MakePatientCard(patientData);
    })
    .size(patientCross.size())
    .htmlGroup(function(d){
      return "<h2>"+getDate(getDateFromDecimal(d.key))+"</h2>"
    });
  patientGrid.render();
  setEditControls();
}

function LoadAllPatients(groupingFunc){
  groupingFunc = groupingFunc || SchedGroup;

  var patientGrid = dc.dataGrid('.patientsHolder');
  today = new Date();
  patientGrid
    .dimension(idDim)
    .group(groupingFunc)
    .sortBy(function(a){return (-1*getDateDecimal(a.ClinicDate));})
    .order(function(a,b){return a - b;})
    .html(function(patientData){
      return MakePatientCard(patientData);
    })
    .size(patientCross.size())
    .htmlGroup(function(d){
      // console.log(d);
      title = d.key;
      return "<h2 class='"+d.key+"'>"+title+"</h2>";
    });

  patientGrid.render();
  setGridGroupClasses('.patientsHolder');
  setEditControls();
}

function setGridGroupClasses(graphParent){
  $("h2.Complete, h2.Past").parents('.dc-grid-top').addClass('rightBoxDGrid');
  $("h2.Incomplete").parents('.dc-grid-top').addClass('leftBoxDGrid');
  $item = $("<div class='leftBoxDGrid'></div>");
  $item.append($('h2.Today').parents('.dc-grid-top'));
  $item.append($('h2.Future').parents('.dc-grid-top'));

  $(graphParent).prepend($item);


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
  stringy += '<div class="patientRow collapsed" data-pid='+d.Id+'>';
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
    stringy += ' avatar_surg" data-status="surgical"';}
  else if(d.IsSurgical == false){
    stringy += ' avatar_nonsurg" data-status="not_surgical"';}
  else{
    stringy += ' avatar_unknown" data-status="unknown"';}
  stringy += '"></span>';
  stringy += '<div class="uneditablePatient">';
  stringy += '<div class="item namesBlock">';
  stringy += '<span class="p_name">'+d.Name+'</span>';
  stringy += '<span class="p_refDoc">By: '+d.Referring_Doc+'</span>';
  stringy += '</div>';
  stringy += '<span class="item p_diag">'+d.Diagnosis+'</span>';
  stringy += '<span class="item p_date">'+getDate(d.ClinicDate)+'</span>';
  stringy += '</div>';
  stringy += '<div class="editablePatient">';
  stringy += '<div class="stringy">';
  stringy += '<div class="edit_line">';
  stringy += '<label for="name">Name: </label>';
  stringy += '<input class="edit_input edit_txt_name" name="name" type="text" value="'+d.Name+'"/>';
  stringy += '</div>';
  stringy += '<div class="edit_line">';
  stringy += '<label for="refDoc">Referrer: </label>';
  stringy += '<input class="edit_input edit_txt_refDoc" name="refDoc" type="text" value="'+d.Referring_Doc+'"/>';
  stringy += '</div>';
  stringy += '<div class="edit_line">';
  stringy += '<label for="diagnosis">Diagnosis: </label>';
  stringy += '<input class="edit_input edit_txt_diagnosis" name="diagnosis" type="text" value="'+d.Diagnosis+'"/>';
  stringy += '</div>';
  stringy += '<div class="edit_line">';
  stringy += '<label for="insurance">Insurance: </label>';
  stringy += '<input class="edit_input edit_txt_insurance" name="insurance" type="text" value="'+d.Insurance+'"/>';
  stringy += '</div>';
  stringy += '</div>';
  stringy += '<div class="nonstringy">';
  stringy += '<div class="edit_line">';
  stringy += '<label for="visitDate">Visit Date: </label>';
  stringy += '<input class="edit_input edit_txt_visitDate" name="visitDate" type="date" value="'+getInputFormattedDate(d.ClinicDate)+'"/>';
  stringy += '</div>';
  stringy += '<div class="edit_line edit_control">';
  stringy += '<span for="approp">Appropriateness:</span>';
  stringy += '<input class="edit_input edit_txt_app" name="approp" type="range" min="1" max="5" value='+d.AppScore+'/>';
  stringy += '</div>';
  stringy += '<div class="edit_line edit_control">';
  stringy += '<span for="compl">Complexity:</span>';
  stringy += '<input class="edit_input edit_txt_complex" name="compl" type="range" min="1" max="5" value='+d.ComplexityScore+'/>';
  stringy += '</div>';
  stringy += '<div class="edit_line submitter_line">';
  stringy += '<span id="newPtntValidator">** Please fill in all fields.</span>';
  stringy += '<button class="submitter">Save Patient</button>';
  stringy += '</div>';
  stringy += '</div>';
  stringy += '<div class="isSurgicalPicker">';
  if (d.IsSurgical == false){
    stringy += '<span data-group="isSurgical" class="radioItem first" id="not_surgical">';
    stringy += '<span class="item p_avatar avatar_nonsurg"></span>Not Surgical';
    stringy += '</span>';

    stringy += '<span data-group="isSurgical" class="radioItem first" id="surgical">';
    stringy += '<span class="item p_avatar avatar_surg"></span>Surgical';
    stringy += '</span>';

    stringy += '<span data-group="isSurgical" class="radioItem second" id="surgical">';
    stringy += '<span class="item p_avatar avatar_unknown"></span>Unknown';
    stringy += '</span>';
  }
  else if(d.IsSurgical == true){
    stringy += '<span data-group="isSurgical" class="radioItem first" id="surgical">';
    stringy += '<span class="item p_avatar avatar_surg"></span>Surgical';
    stringy += '</span>';

    stringy += '<span data-group="isSurgical" class="radioItem first" id="not_surgical">';
    stringy += '<span class="item p_avatar avatar_nonsurg"></span>Not Surgical';
    stringy += '</span>';

    stringy += '<span data-group="isSurgical" class="radioItem second" id="surgical">';
    stringy += '<span class="item p_avatar avatar_unknown"></span>Unknown';
    stringy += '</span>';
  }
  else{
    stringy += '<span data-group="isSurgical" class="radioItem first" id="surgical">';
    stringy += '<span class="item p_avatar avatar_unknown"></span>Unknown';
    stringy += '</span>';

    stringy += '<span data-group="isSurgical" class="radioItem first" id="surgical">';
    stringy += '<span class="item p_avatar avatar_surg"></span>Surgical';
    stringy += '</span>';

    stringy += '<span data-group="isSurgical" class="radioItem second" id="not_surgical">';
    stringy += '<span class="item p_avatar avatar_nonsurg"></span>Not Surgical';
    stringy += '</span>';
  }
  stringy += '</div>';
  stringy += '</div>';
  stringy += '</div>';

  return stringy;
  //return "";
}

function getInputFormattedDate(sentDate){
  var formatDate = d3.timeFormat("%Y-%m-%d");
  return formatDate(sentDate);
}

function isCompleteRecord(data){
  backKeys = ["Name", "ClinicDate", "Referring_Doc", "IsSurgical", "Diagnosis", "Insurance", "AppScore", "ComplexityScore"];
  outputs = [];
  backKeys.forEach(function(key){
    if((data[key] == null)||(data[key] == "null")){
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


function setEditControls(){
  $(".patientRow").click(function(){
    if($(this).hasClass("collapsed")){
      $(this).removeClass("collapsed");
      $(this).addClass("expanded");
    }
    // else{
    //   $(this).removeClass("expanded");
    //   $(this).addClass("collapsed");
    // }
  });
  $(".p_avatar").click(function(){
    $block = $(this).parent();
    if($block.hasClass('expanded')){
      $block.find('.isSurgicalPicker').css('display', 'block');
    }
  });

  $(".isSurgicalPicker .radioItem").click(function(){
    $avatar = $(this).find('.p_avatar');
    $blockAvatar = $(this).parents('.patientRow').children('.p_avatar');
    
    if($avatar.hasClass('avatar_surg')){
      thisClass = 'avatar_surg';
      otherClass = 'avatar_nonsurg';
      anotherClass = 'avatar_unknown';
      dataAttr = 'surgical';
    }
    else if($avatar.hasClass('avatar_nonsurg')){
      thisClass = 'avatar_nonsurg';
      otherClass = 'avatar_surg';
      anotherClass = 'avatar_unknown';
      dataAttr = 'not_surgical';
    }
    else{
      thisClass = 'avatar_unknown';
      otherClass = 'avatar_surg';
      anotherClass = 'avatar_nonsurg';

      dataAttr = 'unknown';
    }
    console.log(thisClass);
    if($blockAvatar.hasClass(thisClass)){done = true;}
    else{
      $blockAvatar.removeClass(otherClass); 
      $blockAvatar.removeClass(anotherClass); 
      $blockAvatar.addClass(thisClass); 

      $blockAvatar.attr('data-status', dataAttr);
      done = true;
    }
    $('.isSurgicalPicker').css('display', 'none');

  });

  $(".edit_line .submitter").click(function(){
    //Get to the parent and get an id
    $patient = $(this).parents('.patientRow');

    ptntData = {};
    ptntData["userID"] = sessionStorage.uid;
    ptntData["ptntID"] = parseInt($patient.attr('data-pid'));

    editKeys = ["name", "refDoc", "visitDate", "diagnosis", "insurance", "app", "complex"];

    editKeys.forEach(function(item, i){
      if(["name", "refDoc", "diagnosis", "insurance"].indexOf(item)>=0){
        ptntData[item] = $patient.find(".edit_input.edit_txt_" + item).val().trim();
        if (typeof ptntData[item] == 'undefined'){
          ptntData[item] = '';
        }
      }
      else{
        ptntData[item] = $patient.find(".edit_input.edit_txt_" + item).val();
      }
    });

    isSurgical = $patient.children(".p_avatar").attr('data-status');
    console.log(isSurgical);
    ptntData["IsSurgical"] = null;

    if(isSurgical == 'surgical'){
      ptntData["IsSurgical"] = true;
    }
    else if(isSurgical == 'not_surgical'){
      ptntData["IsSurgical"] = false;
    }

    if([ptntData["name"], ptntData["refDoc"], ptntData["visitDate"]].indexOf('')>=0){
      $patient.find("#newPtntValidator").css("display","block");
    }
    else{
      $patient.find("#newPtntValidator").css("display","none");
      $.ajax({
      url: "/dash/editPatient",
      data: JSON.stringify(ptntData),
      contentType: "application/json",
      type: "POST"
    })
      .done(function(data){
        console.log(data);
        if(data["result"] == "Invalid User"){
          Logout();
        }
        else if(data != 0){

          $patient.removeClass('expanded').addClass('collapsed');
          idDim.filter(ptntData["ptntID"]);
          patientCross.remove();
          idDim.filterAll();

          data = AddPtntToCrossFilter(data);
          dc.redrawAll();
          setGridGroupClasses('.patientsHolder');
          setEditControls();
        }
        else{
          $("#newPtntValidator").css("display","block");
        }
        
      })
      .fail(function(data){
        console.log("Error: ");
        console.log(data);
      })
      .always(function(data, status){
        console.log(status);
      });
    }

  });

}