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

$(document).ready(function(){
  if(sessionStorage.uid){
    getServerSearchData();
    LoadRequiredData();
  }
  else{
    window.location.href = "/login";
  }
})

function LoadRequiredData(){
  $.ajax({
    type:"POST",
    url: "/dashboard/patients",
    data:JSON.stringify({'user_id': sessionStorage.uid}),
    contentType: "application/json",
    dataType: "json"
    })
   .done(function(data){
      SetCrossFilter(data);
      SetShelfLinkClicks();
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

function SetCrossFilter(sentData){
  patientCross = crossfilter(sentData);
  var parseDate = d3.time.format("%a, %d %b %Y %X GMT").parse;
  var monthFormat = d3.time.format("%B %Y");
  //2015-07-09T04:00:00.000Z
  //var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ").parse;
  sentData.forEach(function(d){
    d.ClinicDate = parseDate(d.ClinicDate);
    d.Month = monthFormat(d.ClinicDate);
  });

  dateDim = patientCross.dimension(function(d){return d.ClinicDate;});
  diagDim = patientCross.dimension(function(d){return d.Diagnosis;});
  docDim = patientCross.dimension(function(d){return d.Referring_Doc;});
  pracDim = patientCross.dimension(function(d){return d.Practice;});
  idDim = patientCross.dimension(function(d){return d.Id;});
  insDim = patientCross.dimension(function(d){return d.Insurance;});
  nameDim = patientCross.dimension(function(d){return d.Name;});

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
    allAutocompletes = data;
    setAutocompleteBox(data);
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

function SetShelfLinkClicks(){
  $("li.shelfLink").click(function(){
    pagePart = $(this).attr('data');
    if(pagePart == "logout"){
      sessionStorage.clear();
      window.location.href = "/login";
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
            $('.mainBox').html('');
            LoadAllPatients();
            NewPatientViewer();
            SetRadioButtonClicks();
            NewPatientCreation();
        }
        else if(pagePart == 'mainDash'){
          $('.mainBox').html('');
          getMainData();
        }
        else if(pagePart == 'search'){
          $('.mainBox').html('');
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


