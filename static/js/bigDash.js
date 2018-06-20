var patientCross;
var idDim;
var dateDim; 
var diagDim; 
var docDim;
var pracDim;
var nameDim;
var insDim; 
var filterFunctions = {"Doc": [], "Diag": [], "Prac": [], "Date": [], "Name": [], "Ins": []};
var allAutocompletes;
var numPatientCountGroup;
var docGroup;
var pracGroup;
var logoutTimer;
var logoutAlertTimer;

$(document).ready(function(){
  if(sessionStorage.uid){
    getServerSearchData();
    LoadRequiredData();
    SetShelfEvents();
    SetRadioButtonClicks();
    NewPatientCreation();
    LoadAutoLogout();
  }
  else{
    Logout();
  }
});

function LoadAutoLogout(){
  $("#logoutBtn").click(Logout);
  $(window).on("load", function(){
    //Start the timer
    console.log("loaded");
    startLogoutTimer();
  });
  $(window).on("click keydown scroll", function(){
    window.clearTimeout(logoutTimer);
    startLogoutTimer();
  });
  $("#logoutUsing").click(function(){
    window.clearTimeout(logoutAlertTimer);
    window.clearTimeout(logoutTimer);
    $(".logoutAlert").css("display", "none");

    startLogoutTimer();
  });
  $("#logoutDone").click(function(){
    Logout();
  });
}

function startLogoutTimer(){
  //logoutTimer = window.setInterval(PrepAutoLogout, 3000);
  //For testing
  console.log("starting timer");
  logoutTimer = window.setInterval(PrepAutoLogout, 600000);
}

function PrepAutoLogout(){
  //Show an alert modal explaining that we are logging out soon
  timeoutCounter = 30;
  console.log("Prepping logout");
  $(".logoutAlert").css("display", "block");
  logoutAlertTimer = window.setInterval(function(){
                  timeoutCounter -= 1; 
                  if(timeoutCounter > 0){
                    $("#timerDispayNum").html(String(timeoutCounter));
                  }
                  else{
                    Logout();
                  }
                }, 1200);

}

function LoadRequiredData(){
  $.ajax({
    type:"POST",
    url: "/dashboard/patients",
    data:JSON.stringify({'user_id': sessionStorage.uid}),
    contentType: "application/json",
    dataType: "json",
    beforeSend: function(){
      $(".material-icons").css('display','none');
      $(".loaderImg").css('display','inline-block');

    }
    })
   .done(function(data){
      if(data['result'] && data['result']=='Invalid User'){
        Logout();
      }
      else{
        SetCrossFilter(data);
        SetShelfLinkClicks();
        $(".loaderImg").css('display','none');
        $(".material-icons").css('display','inline-block');
      }
   })
   .fail(function(data){
      $(".mainBox").html("There was an error");
      console.log("Error: ");
      console.log(data);
    })
   .always(function(data, status){
      console.log(status);
    });
}

function AddPtntToCrossFilter(sentData){
  var parseDate = d3.timeParse("%b %d, %Y");
  sentData.ClinicDate = parseDate(sentData.ClinicDate);

  patientCross.add([sentData]);
  return sentData;
}
function SetCrossFilter(sentData){
  patientCross = crossfilter(sentData);
  var parseDate = d3.timeParse("%a, %d %b %Y %I:%M:%S GMT");
  sentData.forEach(function(d){
    d.ClinicDate = parseDate(d.ClinicDate);
  });

  dateDim = patientCross.dimension(function(d){return d.ClinicDate;});
  diagDim = patientCross.dimension(function(d){return d.Diagnosis;});
  docDim = patientCross.dimension(function(d){return d.Referring_Doc;});
  pracDim = patientCross.dimension(function(d){return d.Practice;});
  idDim = patientCross.dimension(function(d){return d.Id;});
  insDim = patientCross.dimension(function(d){return d.Insurance;});
  nameDim = patientCross.dimension(function(d){return d.Name;});
  monthDim = patientCross.dimension(function(d){return [d.ClinicDate.getFullYear(), d.ClinicDate.getMonth()]});
  surgicalDim = patientCross.dimension(function(d){return d.IsSurgical;});

  //SetSearchAutocomplete(keys);
}

function getServerSearchData(){
  $.ajax({
    type:"POST",
    url: "/search/allTerms",
    data:JSON.stringify({'user_id': sessionStorage.uid}),
    contentType: "application/json",
    dataType: "json"
  })
 .done(function(data){
    if(data['result'] && data['result'] == 'Invalid User'){
      Logout();
    }
    else{
      allAutocompletes = data;
      setAutocompleteBox(data);
    }
 });
}

function setAutocompleteBox(sentData){
  
  $(function(){
    $.widget( "custom.catcomplete", $.ui.autocomplete, {
      _create: function() {
        this._super();
        this.widget().menu( "option", "items", "> :not(.ui-autocomplete-category)" );
      },
      _renderMenu: function( ul, items ) {
        var that = this,
          currentCategory = "";
        $.each( items, function( index, item ) {
          var li;
          if ( item.category != currentCategory ) {
            ul.append( "<li class='ui-autocomplete-category'>" + item.category + "</li>" );
            currentCategory = item.category;
          }
          li = that._renderItemData( ul, item );
          if ( item.category ) {
            li.attr( "aria-label", item.category + " : " + item.label );
          }
        });
      }
    });

    $( "#txt_SearchyBox" ).catcomplete({
      minLength:1,
      delay: 0,
      source: function(request, response){
        var results = $.ui.autocomplete.filter(sentData, request.term);
        response(results.slice(0, 30));
      },

      select:function(event, ui){
        $("#txt_SearchyBox").val(ui.item.label);
        event.preventDefault();
        searchBoxAddFilter(ui.item);
        $("#txt_SearchyBox").val('');
      },
      focus: function( event, ui ) {
        event.preventDefault();
        $("#txt_SearchyBox").val(ui.item.label);
      }
    });
  });
  $("#txt_SearchyBox").removeAttr("disabled");
}

function searchBoxAddFilter(sentItem){
  
  colName = "Doc";
  filterName = "Doc";
  if(sentItem['category'] == "Referrers"){
    colName = "Doc";
    filterName = "Doc";
  }
  else if((sentItem['category'] == "Diagnoses")||(sentItem['category'] == "DiagTags")){
    colName = "Diag";
    filterName = "Diagnosis";
  }
  else if(sentItem['category'] == "Patients"){
    colName = "Name";
    filterName = "Name";
  }
  else if(sentItem['category'] == "Practices"){
    colName = "Prac";
    filterName = "Practice";
  }
  else if(sentItem['category'] == "Insurances"){
    colName = 'Ins';
    filterName = 'Insurance';
  }

  filterItem = '<span class="filter"><span class="remover" data-obj="'+colName+'" data-val="'+sentItem['label']+'">x</span>';
  filterItem += filterName+': '+sentItem['label']+'</span>';

  $(".filterHolder").append($(filterItem));
  setRemoverClick();
  if(sentItem['category'] == "DiagTags"){
    var f = new Function('d', 'return(d.indexOf("'+sentItem['label']+'")>=0);');
  }
  else{
    var f = new Function('d', 'return(d == "'+sentItem['label']+'");');
  }
  filterFunctions[colName].push(f);
  updateFilters(colName);
}
function setRemoverClick(){
  $('.remover').click(function(){
    funcInd = filterFunctions[$(this).attr('data-obj')].indexOf((new Function('d', 'return(d == "'+$(this).attr('data-val')+'");')));
    filterFunctions[$(this).attr('data-obj')].splice(funcInd, 1);
    updateFilters($(this).attr('data-obj'));
    $(this).parent().remove();
  });
}
function updateFilters(dimName)
{
  var dim = docDim;
  if(dimName == 'Diag'){dim = diagDim;}
  else if(dimName == 'Name'){dim = nameDim;}
  else if(dimName == 'Prac'){dim = pracDim;}
  else if(dimName == 'Ins'){dim = insDim;}

  dim.filterAll();
  filterFunctions[dimName].forEach(function(filFunc){
    dim.filter(filFunc);
  });

  dc.renderAll();
}
function Logout(){
    $.ajax({
    type:"POST",
    url: "/logout",
    data:JSON.stringify({'user_id': sessionStorage.uid}),
    contentType: "application/json",
    dataType: "json"
  })
 .done(function(data){
    console.log(data);
  })
 .error(function(status){
  console.log(status);
 })
 .always(function(){
    sessionStorage.clear();
    window.location.href = "/login";
 });
}

function SetShelfLinkClicks(){
  $("li.shelfLink").click(function(){
    pagePart = $(this).attr('data');
    if(pagePart == "logout"){
      Logout();
    }
    else{
      $.ajax({
        url: "/dash/" + pagePart,
        data: JSON.stringify({'user_id': sessionStorage.uid}),
        contentType: "application/json",
        type: "POST",
        dataType: "html"
      })
      .done(function(data){
        $(".mainBox").html(data);
        if(pagePart == "newPatient"){
            LoadAllPatients();
            // NewPatientViewer();
        }
        else if(pagePart == 'mainDash'){
          getMainData();
        }
        else if(pagePart == 'search'){
          getServerSearchData();
        }
      })
      .fail(function(data){
        $(".mainBox").html("There was an error");
        console.log("Error: ");
        console.log(data);
      })
      .always(function(data, status){
        console.log(status);
      });
    }
  });
}


function SetShelfEvents(){
  $(".fabNewPatient").click(function(){
    $(".overlay").css("display", "block");
  });
  $(".closer").click(function(){
    $(".overlay").css("display", "none");
  })
}

function NewPatientCreation(){
  keys = ["name", "refDoc", "visitDate", "diagnosis", "insurance", "appScore", "complScore"];
  $(".submitter").click(function(){
    var ptntData = {};
    var responses = [];
    ptntData["userID"] = sessionStorage.uid;
    keys.forEach(function(item, index){
      if(["name", "refDoc", "diagnosis", "insurance"].indexOf(item)>=0){
        ptntData[item] = $("#txt_" + item).val().trim();
      }
      else{
        ptntData[item] = $("#txt_" + item).val();
      }
      console.log(ptntData[item]);
    });
    isSurgical = $(".radioItem.selected[data-group='isSurgical']").attr('id');
    
    ptntData["IsSurgical"] = null;

    if(isSurgical == 'surgical'){
      ptntData["IsSurgical"] = true;
    }
    else if(isSurgical == 'not_surgical'){
      ptntData["IsSurgical"] = false;
    }

    // if(responses.indexOf("")>=0){
    //   $("#newPtntValidator").css("display","block");
    // }
    console.log("This is the patient Data:");
    console.log(ptntData);
    if([ptntData['name'], ptntData['refDoc'], ptntData['visitDate']].indexOf("")>=0){
      $("#newPtntValidator").css("display","block");
    }
    else{
      $("#newPtntValidator").css("display","none");
    $.ajax({
      url: "/dash/createPatient",
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
          $('input').val('');
          $('input[type="range"]').val(3);

          //$("#firstElementBuilder").after(data);
          data = AddPtntToCrossFilter(data);
          // patientCross.add(data);
          //$("#firstElementBuilder").after(MakePatientCard(data));

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
function setNewPtntAutocomplete(parentID, catName){
  $(function(){
    $.widget( "custom.catcomplete", $.ui.autocomplete, {
      _create: function() {
        this._super();
        this.widget().menu( "option", "items", "> :not(.ui-autocomplete-category)" );
      },
      _renderMenu: function( ul, items ) {
        var that = this;
        $.each( items, function( index, item ) {
          if ( item.category == catName ) {
            var li;
            // ul.append( "<li class='ui-autocomplete-category'>" + item.category + "</li>" );
            li = that._renderItemData( ul, item );
            li.attr( "aria-label", item.label );
          }
        });
      }
    });

    $(parentID).catcomplete({
      minLength:1,
      delay: 0,
      source: function(request, response){
        var results = $.ui.autocomplete.filter(allAutocompletes, request.term.toLowerCase().replace("dr.", '').replace('dr ', '').trim());
        response(results.slice(0, 30));
      },

      select:function(event, ui){
        $(parentID).val(ui.item.label);
        event.preventDefault();
        $(parentID).val(ui.item.label);
        $(parentID).attr("data-id",ui.item.value);
      },
      focus: function( event, ui ) {
        event.preventDefault();
        $(parentID).val(ui.item.label);
      }
    });
  });
  $(parentID).removeAttr("disabled");
}
function SetRadioButtonClicks(){
  //setNewPtntAutocomplete("#txt_name", "Patients");
  setNewPtntAutocomplete("#txt_refDoc", "Referrers");
  setNewPtntAutocomplete("#txt_diagnosis", "Diagnoses");
  setNewPtntAutocomplete("#txt_insurance", "Insurances");

  $("span.radioItem").click(function() {
    if($(this).hasClass("selected")) {
      console.log("randomClick");
    }
    else {
      var thisDG = $(this).attr("data-group");
      $('span.radioItem[data-group="'+thisDG+'"]').removeClass("selected");
      $(this).addClass("selected");
    }
  });
}