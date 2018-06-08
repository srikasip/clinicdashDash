function NewPatientViewer(){
  $("#newptntAdderIcon").click(function(){
      $('#firstElementBuilder').removeClass('addForm').addClass('inputForm');
  });
}

function LoadAllPatients(){
    var patientGrid = dc.dataGrid('.mainBox');

  patientGrid
    .dimension(idDim)
    .group(function(d){return d.ClinicDate;})
    .sortBy(function(a){return a.ClinicDate})
    .order(function(a,b){return b - a;})
    .html(function(patientData){
      return MakePatientCard(patientData);
    })
    .htmlGroup(function(d){return '';});

  patientGrid.render();
}

function getDate(sentDate){
  var formatDate = d3.timeFormat("%a %B %d, %Y");
  // date = new Date(2014, 4, 1); // Thu May 01 2014 00:00:00 GMT-0700 (PDT)

  return formatDate(sentDate);
}

function MakePatientCard(d){
  var surg = "Not Surgical";
  if(d.IsSurgical){surg = "Surgical";}
  stringy = '<div class="patient patientCard">';
  stringy += '<h2>'+d.Name+' ('+surg+')</h2>';
  stringy += '<div class="line">';
  stringy += '  <strong>Seen on </strong><span><span>'+getDate(d.ClinicDate)+'</span>';
  stringy += '</div>';
  stringy += '<div class="line">';
  stringy += '  <strong>Referred by: </strong><span>'+d.Referring_Doc+'</span>';
  stringy += '</div>';
  stringy += '<div class="line">';
  stringy += '  <strong>Diagnosis: </strong><span>'+d.Diagnosis+'</span>';
  stringy += '</div>';
  stringy += '<div class="line">';
  stringy += '  <strong>Insurance: </strong><span><span>'+d.Insurance+'</span>';
  stringy += '</div>';
  stringy += '<div class="line">';
  stringy += '  <strong>Appropriateness: </strong><span><span>'+d.AppScore+' out of 5</span>';
  stringy += '</div>';
  stringy += '<div class="line">';
  stringy += '  <strong>Complexity: </strong><span><span>'+d.ComplexityScore+' out of 5</span>';
  stringy += '</div>';
  stringy += '</div>';

  return stringy;
}

function NewPatientCreation(){
  keys = ["name", "refDoc", "visitDate", "diagnosis", "insurance", "appScore", "complScore"]
  $(".submitter").click(function(){
    var ptntData = {};
    var responses = []
    ptntData["userID"] = sessionStorage.uid;
    keys.forEach(function(item, index){
      if(item != "isSurgical"){
        ptntData[item] = $("#txt_" + item).val();
        responses.push(ptntData[item]);
      }
    });
    isSurgical = $(".radioItem.selected[data-group='isSurgical']").attr('id');
    ptntData["isSurgical"] = false;
    if(isSurgical == 'surgical'){
      ptntData["isSurgical"] = true;
    }

    if(responses.indexOf("")>=0){
      $("#newPtntValidator").css("display","block");
    }
    else{
    $.ajax({
      url: "/dash/createPatient",
      data: JSON.stringify(ptntData),
      contentType: "application/json",
      type: "POST"
    })
      .done(function(data){
        if(data == "Invalid User"){
          Logout();
        }
        else if(data != 0){
          $('input').val('');
          $('input[type="range"]').val(3);
          $('#firstElementBuilder').removeClass('inputForm').addClass('addForm');
          $("#firstElementBuilder").after(data);
          //patientCross.add(data);
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