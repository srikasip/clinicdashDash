$(document).ready(function(){
  if(sessionStorage.uid){
    LoadRequiredData();
  }
  else{
    Logout();
  }
});

function LoadRequiredData(){
  mainData = getData();
  var parseDate = d3.timeParse("%a, %d %b %Y %I:%M:%S GMT");
  mainData.forEach(function(d){
    d.ClinicDate = parseDate(d.ClinicDate);
  });

  ndx = crossfilter(mainData);
  LoadFilterizer(ndx);

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

function LoadFilterizer(patientCross){
  
  filterDim = patientCross.dimension(function(d){return d3.timeWeek(d.ClinicDate);});

  var clinicDateSurgGroup = filterDim.group().reduceSum(function(d){
    if(d.IsSurgical == false){return 0;}
    else {return 1;} });
  var clinicDateNonSurgGroup = filterDim.group().reduceSum(function(d){
    if(d.IsSurgical == false){return 1;}
    else {return 0;} });

  var minclinicDate = d3.timeWeek(filterDim.bottom(1)[0].ClinicDate);
  var maxclinicDate = d3.timeWeek(filterDim.top(1)[0].ClinicDate);
  var minMaxArrclinicDate = [minclinicDate,maxclinicDate];

  var clinicDategraphingGroups = [{'data':clinicDateSurgGroup, 'name': 'Surgical'},{'data':clinicDateNonSurgGroup, 'name': 'Non Surgical'}];
  setBarChartChooser("#somethingSpecialFilterizer", filterDim, 0,60, clinicDategraphingGroups, minMaxArrclinicDate, "Number of Cases");
}

function setBarChartChooser(dom_id, sentDimension, width=0, height=400, allGroups=[], minMax=[], yTitle=''){
  height=400;

  if(width == 0){
    width = $(dom_id).parent().innerWidth();
  }
  var hitslineChart  = dc.barChart(dom_id);
  hitslineChart
    .width(width).height(height)
    .dimension(sentDimension)
    .group(allGroups[0].data,allGroups[0].name)
    .xUnits(d3.timeWeeks);
  
  counter = 0;
  allGroups.forEach(function(d) {
    if(counter > 0) {
      hitslineChart.stack(d.data, d.name);
    }
    counter = counter + 1;
  });
  
  hitslineChart
    .x(d3.scaleTime())
    .valueAccessor(function(d){return d.value;})
    .keyAccessor(function(d){return d.key;})
    .round(d3.timeWeek.round)
    .brushOn(true)
    .yAxis().ticks(d3.format('.3s'));

  function calc_domain(chart) {
                var min = d3.min(chart.group().all(), function(kv) { return kv.key; }),
                    max = d3.max(chart.group().all(), function(kv) { return kv.key; });
                max = d3.timeMonth.offset(max, 1);
                chart.x().domain([min, max]);
            }
  hitslineChart.on('preRender', calc_domain);
  hitslineChart.on('preRedraw', calc_domain);

  hitslineChart.render();
}

function getData(){
  sentData = [{"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 03 Jul 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 26 Jun 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 26 Jun 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 26 Jun 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 26 Jun 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 26 Jun 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 26 Jun 2018 00:00:00 GMT","IsSurgical":true},
              {"ClinicDate":"Tue, 26 Jun 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 26 Jun 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 26 Jun 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 26 Jun 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 26 Jun 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 26 Jun 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 26 Jun 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 26 Jun 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 26 Jun 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 26 Jun 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 26 Jun 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 26 Jun 2018 00:00:00 GMT","IsSurgical":false},
              {"ClinicDate":"Tue, 26 Jun 2018 00:00:00 GMT","IsSurgical":false}];

  return sentData;
}