// patientCross = crossfilter(sentData);
// var parseDate = d3.time.format("%a, %d %b %Y %X GMT").parse;
// //2015-07-09T04:00:00.000Z
// //var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ").parse;
// sentData.forEach(function(d){
//   d.ClinicDate = parseDate(d.ClinicDate);
// });

// dateDim = patientCross.dimension(function(d){return d.ClinicDate;});
// diagDim = patientCross.dimension(function(d){return d.Diagnosis;});
// docDim = patientCross.dimension(function(d){return d.Referring_Doc;});
// pracDim = patientCross.dimension(function(d){return d.Practice;});
// idDim = patientCross.dimension(function(d){return d.Id;});
// insDim = patientCross.dimension(function(d){return d.Insurance;});
// nameDim = patientCross.dimension(function(d){return d.Name;});

function  getMainData(){
  console.log("I am in all data");
  SetGraphsData();
}

function SetGraphsData(){
  LoadTotalPatientsGraph();
  LoadMonthlyPatientsGraph();
  LoadSurgicalYield();
  LoadMonthlySurgicalYieldGraph();
  LoadPracticeDisto();
  //LoadPracDistroCum()
  LoadDocDistro();
  LoadLeaderBoards();
  LoadScatterBox();
  
  dc.renderAll();
}
function SetGraphsDataTry(){
  try{
    LoadTotalPatientsGraph();
  }
  catch(err){
    $("#totalCount").append("Not Enough Data.");
  }

  try{
    LoadMonthlyPatientsGraph();
  }
  catch(err){
    $("#monthlyCount").append("Not Enough Data.");
  }
  try{
    LoadSurgicalYield();
  }
  catch(err){
    $("#totalYield").append("Not Enough Data.");
  }
  try{
    LoadMonthlySurgicalYieldGraph();
  
  }
  catch(err){
    $("#monthlyYield").append("Not Enough Data.");
  }
  try{
    LoadPracticeDisto();
  }
  catch(err){
    $("#practiceDistribution").append("Not Enough Data.");
  }
  try{
    LoadDocDistro();
  }
  catch(err){
    $("#docDistribution").append("Not Enough Data.");
  }
  try{
    LoadScatterBox();
  }
  catch(err){
    $("#totalSurg").append("Not Enough Data.");
  }
  try{
    LoadLeaderBoards();
  }
  catch(err){
    $(".chart-stage table").append("Not Enough Data.");
  }
  

  dc.renderAll();
}

function LoadLeaderBoards(){
  //#topDocs
  //#newDocs
  //#topPractices
  //#worstDocs
  topDocs = dc.dataTable("#topDocs");
  topPracs = dc.dataTable("#topPractices");
  worstDocs = dc.dataTable("#worstDocs");
  newDocs = dc.dataTable("#newDocs");

  rank = function (p) {return ""; };
  height = 480;
  halfHeight = $("#totalSurg").height()/2;
  width = $("#topDocs").width();
  //docGroup = docGroup.order(function(d){return ((d.surgical * d.surgical)/(d.surgical + d.nonsurgical));});
  //pracGroup = pracGroup.order(function(d){return ((d.surgical * d.surgical)/(d.surgical + d.nonsurgical));});

  topDocs
    .width(halfHeight)
    .height(width)
    .dimension(docGroup)
    .group(rank)
    .columns([function (d) { return d.value.surgical; },
              function (d) { return (d.value.surgical + d.value.nonsurgical); },
              function (d) { return String(Math.round(100*(d.value.surgical/(d.value.surgical + d.value.nonsurgical)))) + "%"; },
              function (d) {return d.key;}])
    .sortBy(function (d) { groupScoringFunc })
    .size(10)
    .order(d3.descending);

  //noNullPracs = remove_null_bins(pracGroup);
  topPracs
    .width(height)
    .height(width)
    .dimension(pracGroup)
    .group(rank)
    .columns([function (d) { return d.value.surgical; },
              function (d) { return (d.value.surgical + d.value.nonsurgical); },
              function (d) { return String(Math.round(100*(d.value.surgical/(d.value.surgical + d.value.nonsurgical)))) + "%"; },
              function (d) {return d.key;}])
    .sortBy(groupScoringFunc)
    .size(10)
    .order(d3.descending);


  badDocs = reversible_group(docGroup);
  worstDocs
    .width(halfHeight)
    .height(width)
    .dimension(badDocs)
    .group(rank)
    .columns([function (d) { return d.value.surgical; },
              function (d) { return (d.value.surgical + d.value.nonsurgical); },
              function (d) { return String(Math.round(100*(d.value.surgical/(d.value.surgical + d.value.nonsurgical)))) + "%"; },
              function (d) {return d.key;}])
    .sortBy(groupScoringFunc)
    .size(10)
    .order(d3.ascending);

  docByDateGroup = docDim.group().reduce(
    function(p,v){
      if(v.IsSurgical){
        p.surgical += 1;
      }
      else{
        p.nonsurgical += 1;
      }
      dateMunj = mungeDateToNum(v.ClinicDate);

      if(dateMunj < p.firstDateRep){
        p.firstDate = v.ClinicDate;
        p.firstDateRep = dateMunj;
      }
      return p;
    },

    function(p,v){
      if(v.IsSurgical){
        p.surgical -= 1;
      }
      else{
        p.nonsurgical -= 1;
      }
      return p;
    },

    function(){
      return {"surgical":0, "nonsurgical":0, "firstDate":new Date(), "firstDateRep": mungeDateToNum(new Date())};
    }).order(function(d){return d.firstDateRep;});

  var formatDate = d3.timeFormat("%b %Y");
  newDocs
    .width(height)
    .height(width)
    .dimension(docByDateGroup)
    .group(rank)
    .columns([function (d) { return d.value.surgical; },
              function (d) { return (d.value.surgical + d.value.nonsurgical); },
              function (d) { return formatDate(d.value.firstDate); },
              function (d) {return d.key;}])
    .sortBy(function (d) { return d.firstDateRep; })
    .size(10)
    .order(d3.descending);
}

function mungeDateToNum(sentDate){
  year = sentDate.getFullYear();
  month = sentDate.getMonth();
  day = sentDate.getDate();

  dayNum = (year *10000) + (month*100) + (day);

  return dayNum;
}

function reversible_group(group) {
    return {
        all:function () {
          results = [];
          group.all().forEach(function(d,i){
                results.unshift(d);
          });
          return results;
        },
        top: function(N) {
            return group.top(N);
        },
        bottom: function(N) {
            return group.top(Infinity).slice(-N).reverse();
        }
    };
}

function groupScoringFunc(d){
  return ((1.5*d.surgical - d.nonsurgical) * d.surgical/(d.surgical + d.nonsurgical));
}
function graphOrderingFunction(d){
  return -((1.5*d.value.surgical - d.value.nonsurgical) * d.value.surgical/(d.value.surgical + d.value.nonsurgical));
}

function LoadScatterBox(){
  var data45 = getLineYisXData(0, 45);
  var ndx = crossfilter(data45);
  var lineDim = ndx.dimension(function(d){return d.x;});
  var lineGroup = lineDim.group().reduceSum(function(d){return d.y;});

  var scatterChartle = dc.compositeChart("#totalSurg");
  //var chart = dc.scatterPlot(dom_id);
  var width = $("#totalSurg").width();
  var height = 480;
  //var height = $("#topDocs").height() * 2;
  //print_filter(sentGroup);

  scatterChartle
    .width(width)
    .height(height)
    .x(d3.scaleLinear().domain([0,45]).range([height, 0]))
    .clipPadding(10)
    .yAxisLabel("Surgical")
    .xAxisLabel("Non Surgical")
    .brushOn(false)
    .shareTitle(false)
    .compose([
        dc.scatterPlot(scatterChartle)
          .dimension(docDim)
          .group(docGroup)
          .symbolSize(8)
          .keyAccessor(function(p) {return p.value["nonsurgical"];})
          .valueAccessor(function(p) {return p.value["surgical"];})
          .renderTitle(true)
          .title(function (p) {
            return [
              'Referrer: ' + p.key,
              'Surgical: ' + String(p.value["surgical"]),
              'Non Surgical: ' + String(p.value["nonsurgical"]),
              'Distance: ' + String((p.value['surgical']-p.value["nonsurgical"])/Math.sqrt(2))
            ].join('\n');
          }),
        dc.lineChart(scatterChartle)
          .dimension(lineDim)
          .group(lineGroup)
          .renderTitle(false)
      ]);
}

function LoadDocDistro(){
  docGroup = docDim.group().reduce(
                        function(p,v){
                          if(v.IsSurgical){
                            p["surgical"] += 1;
                          }
                          else{
                            p["nonsurgical"] += 1;
                          }
                          return p;
                        },
                        function(p,v){
                          if(v.IsSurgical){
                            p["surgical"] -= 1;
                          }
                          else{
                            p["nonsurgical"] -= 1;
                          }
                          return p;
                        },
                        function(){return {"surgical":0, "nonsurgical":0};}
                      ).order(groupScoringFunc);//.order(function(p){return (p.surgical + p.nonsurgical);});

  height = 480;
  width = $("#docDistribution").width();

  var newDocGroup = cap_bins(docGroup, 75);
  // var newDocGroup = docGroup;
  docDistro = dc.barChart("#docDistribution");

  docDistro
    .width(width)
    .height(height)
    .dimension(docDim)
    .group(newDocGroup, "Surgical", function(d){return d.value["surgical"];})
    .stack(newDocGroup, "NonSurgical", function(d){return d.value["nonsurgical"];})
    .ordering(function(d){return -(d.value["surgical"] + d.value["nonsurgical"]);})
    //.ordering(graphOrderingFunction)
    .xUnits(dc.units.ordinal)
    .x(d3.scaleOrdinal())
    .yAxisLabel("Number of Cases")
    .xAxisLabel("ReferringDocs")
    .legend(dc.legend().x(100).y(10).itemHeight(13).gap(5))
    .keyAccessor(function(d){return d["key"];})
    .title(function(d){
      return [d.key, "Surgical: " + d.value["surgical"], "Non-Surgical: " + d.value["nonsurgical"]].join("\n");
    });

    docDistro.renderlet(function(chart){
      chart.selectAll("g.x text")
        .style("text-anchor", "start")
        .style("fill", "#000")
        .attr('transform', "translate(-12,-5) rotate(-90)");

      chart.selectAll(".stack._0 .bar")
        .style("fill", "#ed6355");

      chart.selectAll(".stack._0 .bar.deselected")
        .style("fill", "#ddd");

      chart.selectAll(".stack._1 .bar")
        .style("fill", "#6e5bba");
      chart.selectAll(".stack._1 .bar.deselected")
        .style("fill", "#ddd");

      chart.selectAll("g.dc-legend-item rect")
        .filter(function(d){ return d.name == "Surgical";
                })
        .style("fill", "#ed6355");
      
      chart.selectAll("g.dc-legend-item rect")
      .filter(function(d){ return d.name == "NonSurgical";
              })
      .style("fill", "#6e5bba");

    });
}

function LoadPracDistroCum(){
  pracGroup = pracDim.group().reduce(
                        function(p,v){
                          if(v.IsSurgical){
                            p["surgical"] += 1;
                          }
                          else{
                            p["nonsurgical"] += 1;
                          }
                          return p;
                        },
                        function(p,v){
                          if(v.IsSurgical){
                            p["surgical"] -= 1;
                          }
                          else{
                            p["nonsurgical"] -= 1;
                          }
                          return p;
                        },
                        function(){return {"surgical":0, "nonsurgical":0};}
                      ).order(groupScoringFunc);//There was nothing here previously

  height = 480;
  width = $("#practiceDistribution").width();
  var newPracGroup = pracGroup;//remove_null_bins(pracGroup);
  // print_filter(newPracGroup)
    
  cumGroup = cumTotalsGroup(pracGroup);

  yScale = d3.scaleLinear().domain([0,100]).range([0, height]);

  composerLine = dc.compositeChart("#practiceDistribution");
  composerLine
    .width(width)
    .height(height)
    .x(d3.scaleOrdinal())
    .xUnits(dc.units.ordinal)
    .compose([
      dc.barChart(composerLine)
        .dimension(pracDim)
        .group(newPracGroup, "Surgical", function(d){return d.value["surgical"];})
        // .stack(newPracGroup, "NonSurgical", function(d){return d.value["nonsurgical"];})
        .ordering(function(d){return -(d.value["surgical"] + d.value["nonsurgical"]);})
        //.ordering(graphOrderingFunction)
        .yAxisLabel("Number of Cases")
        .xAxisLabel("Practices")
        .legend(dc.legend().x(100).y(10).itemHeight(13).gap(5))
        .keyAccessor(function(d){return d["key"];})
        .title(function(d){
          return [d.key, "Surgical: " + d.value["surgical"], "Non-Surgical: " + d.value["nonsurgical"]].join("\n");
        }),
      dc.lineChart(composerLine)
        .dimension(pracDim)
        .curve(d3.curveLinear)
        .y(yScale)
        .group(cumGroup)
        .keyAccessor(function(d){return d.key;})
        .valueAccessor(function(d){return (100.0 * d.value.runningTotal / numPatientCountGroup.value());})

      ]);
    

    composerLine.renderlet(function(chart){
      chart.selectAll("g.x text")
        .style("text-anchor", "start")
        .style("fill", "#000")
        .attr('transform', "translate(-12,-5) rotate(-90)");

      chart.selectAll(".stack._0 .bar")
        .style("fill", "#ed6355");

      chart.selectAll(".stack._0 .bar.deselected")
        .style("fill", "#ddd");

      chart.selectAll(".stack._1 .bar")
        .style("fill", "#6e5bba");
      chart.selectAll(".stack._1 .bar.deselected")
        .style("fill", "#ddd");

      chart.selectAll("g.dc-legend-item rect")
        .filter(function(d){ return d.name == "Surgical";
                })
        .style("fill", "#ed6355");
      
      chart.selectAll("g.dc-legend-item rect")
      .filter(function(d){ return d.name == "NonSurgical";
              })
      .style("fill", "#6e5bba");

    });

    


}

function LoadPracticeDisto(){
  pracGroup = pracDim.group().reduce(
                        function(p,v){
                          if(v.IsSurgical){
                            p["surgical"] += 1;
                          }
                          else{
                            p["nonsurgical"] += 1;
                          }
                          return p;
                        },
                        function(p,v){
                          if(v.IsSurgical){
                            p["surgical"] -= 1;
                          }
                          else{
                            p["nonsurgical"] -= 1;
                          }
                          return p;
                        },
                        function(){return {"surgical":0, "nonsurgical":0};}
                      ).order(groupScoringFunc);//There was nothing here previously

  height = 480;
  width = $("#practiceDistribution").width();
  var newPracGroup = remove_null_bins(pracGroup);
  pracDistro = dc.barChart("#practiceDistribution");

  pracDistro
    .width(width)
    .height(height)
    .dimension(pracDim)
    .group(newPracGroup, "Surgical", function(d){return d.value["surgical"];})
    .stack(newPracGroup, "NonSurgical", function(d){return d.value["nonsurgical"];})
    .ordering(function(d){return -(d.value["surgical"] + d.value["nonsurgical"]);})
    //.ordering(graphOrderingFunction)
    .xUnits(dc.units.ordinal)
    .x(d3.scaleOrdinal())
    .yAxisLabel("Number of Cases")
    .xAxisLabel("Practices")
    .legend(dc.legend().x(100).y(10).itemHeight(13).gap(5))
    .keyAccessor(function(d){return d["key"];})
    .title(function(d){
      return [d.key, "Surgical: " + d.value["surgical"], "Non-Surgical: " + d.value["nonsurgical"]].join("\n");
    });

    pracDistro.renderlet(function(chart){
      chart.selectAll("g.x text")
        .style("text-anchor", "start")
        .style("fill", "#000")
        .attr('transform', "translate(-12,-5) rotate(-90)");

      chart.selectAll(".stack._0 .bar")
        .style("fill", "#ed6355");

      chart.selectAll(".stack._0 .bar.deselected")
        .style("fill", "#ddd");

      chart.selectAll(".stack._1 .bar")
        .style("fill", "#6e5bba");
      chart.selectAll(".stack._1 .bar.deselected")
        .style("fill", "#ddd");

      chart.selectAll("g.dc-legend-item rect")
        .filter(function(d){ return d.name == "Surgical";
                })
        .style("fill", "#ed6355");
      
      chart.selectAll("g.dc-legend-item rect")
      .filter(function(d){ return d.name == "NonSurgical";
              })
      .style("fill", "#6e5bba");

    });

    cumGroup = remove_null_bins(cumTotalsGroup(pracGroup));
    yScale = d3.scaleLinear().domain([0,100]).range([0, height]);
    //var extra_data = [{x: chart.x().range()[0], y: chart.y()(left_y)}, {x: chart.x().range()[1], y: chart.y()(right_y)}];
    
    var line = d3.line()
        .x(function(d) { return d.key; })
        .y(function(d) { return yScale(100.0 * d.value.runningTotal / numPatientCountGroup.value()); })
        .curve(d3.curveLinear);
    var chartBody = pracDistro.select('g.chart-body');
    var path = chartBody.selectAll('path.extra').data(cumGroup);

    path = path
        .enter()
            .append('path')
            .attr('class', 'extra')
            .attr('stroke', 'red')
            .attr('id', 'extra-line')
        .merge(path);
    path.attr('d', line);

    // pracDistro.render();

    // dc.lineChart(pracDistro)
    //   .height(height)
    //   .width(width)
    //   .x(d3.scaleOrdinal())
    //   .xUnits(dc.units.ordinal)
    //   .curve(d3.curveLinear)
    //   .y(yScale)
    //   .dimension(pracDim)
    //   .group(cumGroup)
    //   .keyAccessor(function(d){return d.key;})
    //   .valueAccessor(function(d){return (100.0 * d.value.runningTotal / numPatientCountGroup.value());});



}


function LoadMonthlySurgicalYieldGraph(){
  //today = new Date(2017,11,31,0,0,0,0);
  today = new Date();
  //monthDim = patientCross.dimension(function(d){if(numMonthsBetween(today, d.ClinicDate)<=8){return [d.ClinicDate.getFullYear(), d.ClinicDate.getMonth()]}});
  
  thisMonth = monthDim.top(1)[0];
  monthGroupCount = monthDim.group()
                        .reduce(
                          function(p,v)
                          {
                            p["total"] += 1;
                            if(v.IsSurgical){
                              p["numSurgical"] += 1.0;
                            }

                            return p;
                          }, 
                          function(p,v)
                          {
                              p["total"] -= 1;
                              if(v.IsSurgical){
                                p["numSurgical"] -= 1.0;
                              }

                              return p;
                          }, 
                          function()
                          {
                            return {"total":0, "numSurgical":0.0};
                          }
                          );

  height = $("#totalCount").height();
  width = $("#monthlyYield").width();

  scalePoints = [];

  months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
  if(today.getMonth() <11){
    newMonths = months.slice(today.getMonth()+1, 12);
    newMonths = newMonths.concat(months.slice(0,today.getMonth() + 1));
    shiftMonths = newMonths;
  }
  else{
    shiftMonths = months;
  }
  for (i=1; i<=12; i+=1){
    scalePoints.push((width/months.length)*i);
  }
  // print_filter(monthGroupCount);
  // print_filter(monthDim);
  // var orderedFiltered_monthData = remove_empty_bins(monthGroupCount, shiftMonths, months);
  var orderedFiltered_monthData = keep_only12month_bins(monthGroupCount, shiftMonths, months, today);

  monthLineScale = d3.scaleBand()
                .domain(shiftMonths)
                .range([0,width])
                .paddingInner(0.05);
  

  outputScale = d3.scaleLinear()
                  .domain([0,100])
                  .range([height,0])

  var monthLine = dc.lineChart("#monthlyYield");

  console.log("In monthly yield patients");
  monthLine
    .width(width)
    .height(height)
    .x(monthLineScale)
    .y(outputScale)
    .renderDataPoints({radius: 2, fillOpacity: 0.8, strokeOpacity: 0.8})
    .xUnits(dc.units.ordinal)
    .curve(d3.curveNatural)
    .dimension(monthDim)
    .group(orderedFiltered_monthData)
    .keyAccessor(function(d){return months[d.key[1]];})
    .valueAccessor(function(d){
      if(d.value["total"] == 0){
        numBum = 0;
      }
      else {
        numBum = (d.value["numSurgical"]/d.value["total"])*100;
      }
      return numBum; 
    })
    .xAxisLabel("Last 12 Months")
    .yAxisLabel("% Surgical Patients")
    .colors(["#ed6355"])
    .title(function(d){return months[d.key[1]] + ": " + dc.utils.printSingleValue((d.value["numSurgical"]/d.value["total"])*100) + '%';});

  // monthLine.yAxis().tickValues(3);
  // monthLine.xAxis().tickValues([shiftMonths[0], shiftMonths[shiftMonths.length/2], shiftMonths[shiftMonths.length -1]]);
}

function LoadSurgicalYield(){
  height = $("#totalCount").height() - 32;
  width = $("#totalYield").innerWidth();

  var colorScale = d3.scaleOrdinal().domain([true, false])
                                   .range(["#ed6355", "#6e5bba"]);

  surgicalGroup = surgicalDim.group().reduceCount();


  isSurgicalPie = dc.pieChart("#totalYield");
  isSurgicalPie
    .width(width)
    .height(height)
    .slicesCap(2)
    .innerRadius(0)
    .dimension(surgicalDim)
    .group(surgicalGroup)
    .colors(colorScale)
    // workaround for #703: not enough data is accessible through .label() to display percentages
    .on('pretransition', function(chart) {
        chart.selectAll('text.pie-slice')
        .text('')
        .append('tspan')
        .text(function(d){
          if(d.data.key) {return 'Surgical';}
          else { return 'Non Surgical'; }
        })
        .append('tspan')
        .attr('dy',18)
        .attr('x',0)
        .text(function(d) {
            return dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
        })
    });
}

function LoadMonthlyPatientsGraph(){
  //today = new Date(2017,11,31,0,0,0,0);
  today = new Date();

  //monthDim = patientCross.dimension(function(d){if(numMonthsBetween(today, d.ClinicDate)<=8){return [d.ClinicDate.getFullYear(), d.ClinicDate.getMonth()]}});
  thisMonth = monthDim.top(1)[0];
  //monthGroupCount = monthDim.group().reduceCount();

  monthGroupCount = monthDim.group()
                        .reduce(
                          function(p,v)
                          {
                            p["total"] += 1;
                            if(v.IsSurgical){
                              p["numSurgical"] += 1.0;
                            }

                            return p;
                          }, 
                          function(p,v)
                          {
                              p["total"] -= 1;
                              if(v.IsSurgical){
                                p["numSurgical"] -= 1.0;
                              }

                              return p;
                          }, 
                          function()
                          {
                            return {"total":0, "numSurgical":0.0};
                          }
                          ).order(function(p){return p.total;});
                        
  numScale = monthGroupCount.top(1)[0].value.total;

  height = $("#totalCount").height();
  width = $("#monthlyCount").width();

  scalePoints = []

  months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
  if(today.getMonth() <11){
    newMonths = months.slice(today.getMonth()+1, 12);
    newMonths = newMonths.concat(months.slice(0,today.getMonth() + 1));
    shiftMonths = newMonths;
  }
  else{
    shiftMonths = months;
  }
  for (i=1; i<=12; i+=1){
    scalePoints.push((width/months.length)*i);
  }
  // print_filter(monthGroupCount);
  // print_filter(monthDim);
  var orderedFiltered_monthData = keep_only12month_bins(monthGroupCount, shiftMonths, months, today);
  console.log("In monthly patients");
  monthLineScale = d3.scaleBand()
                .domain(shiftMonths)
                .range([0,width])
                .paddingInner(0.05);
  

  outputScale = d3.scaleLinear()
                  .domain([0,numScale+10])
                  .range([height,0])

  var monthLine = dc.lineChart("#monthlyCount");
  monthLine
    .width(width)
    .height(height)
    .x(monthLineScale)
    .y(outputScale)
    .renderDataPoints({radius: 2, fillOpacity: 0.8, strokeOpacity: 0.8})
    .xUnits(dc.units.ordinal)
    .curve(d3.curveNatural)
    .dimension(monthDim)
    .group(orderedFiltered_monthData)
    .keyAccessor(function(d){return months[d.key[1]];})
    .valueAccessor(function(d){return d.value.total;})
    .xAxisLabel("Last 12 Months")
    .yAxisLabel("Total Patients Seen")
    .colors(["#ed6355"]);

  // monthLine.yAxis().ticks(3);
  // monthLine.xAxis().tickValues([shiftMonths[0], shiftMonths[shiftMonths.length/2], shiftMonths[shiftMonths.length -1]]);
}

function LoadTotalPatientsGraph(){
  numPatientCountGroup = patientCross.groupAll().reduce(
    function(p,v){ 
      p["total"] += 1; 
      if(v.IsSurgical){
        p["surgical"] += 1;
      }
      return p;
    },
    function(p,v){
      p["total"] -= 1; 
      if(v.IsSurgical){
        p["surgical"] -= 1;
      }
      return p;
    },
    function(){return {"total":0, "surgical": 0};}
  );
  totalDisplay = dc.numberDisplay('#totalCount');
  totalDisplay
    .group(numPatientCountGroup)
    .valueAccessor(function(d){return d.total;})
    .formatNumber(d3.format('^d'));
}

function reverseOrder(source_group) {
  return {
      all:function () {
          results = [];
          source_group.all().forEach(function(d,i){
                results.unshift(d);
            });
          return results;
        }
  };
}

function remove_empty_bins(source_group, ordMonths, allMonths) {
  return {
      all:function () {
          results = [{},{},{},{},{},{},{},{},{},{},{},{}];
          source_group.all().forEach(function(d,i){
            if(d.value){
                results[ordMonths.indexOf(allMonths[d.key[1]])] = d;
              }
            });
          return results;
        }
  };
}

function cumTotalsGroup(source_group){
  return{
    all: function(){
      runningTotal = 0;
      runningSurgical = 0;

      results = [];
      // print_filter(source_group);
      source_group.all().forEach(function(d,i){
        runningTotal = runningTotal + d.value.surgical + d.value.nonsurgical;
        runningSurgical = runningSurgical + d.value.surgical;
        d.value.runningTotal = runningTotal;
        d.value.runningSurgical = runningSurgical;

        results.push(d);
      });

      return results;
    }
  };
}


function keep_only12month_bins(source_group, ordMonths, allMonths, today) {
  return {
      all:function () {
          results = [{},{},{},{},{},{},{},{},{},{},{},{}];
          source_group.all().forEach(function(d,i){
            if(d.value && d.key){
              monthsBetween = numMonthsBetweenParts(today.getMonth(), today.getFullYear(), d.key[1], d.key[0]);
              if(((monthsBetween>=0)&&(monthsBetween<=11)))
              {
                  results[ordMonths.indexOf(allMonths[d.key[1]])] = d;
              }
            }
          });
          results.forEach(function(d,i){
            if(!d.key) {
              newData = {"key":[today.getFullYear(),i], "value":{"numSurgical":0, "total":0}};
              indexJan = ordMonths.indexOf("Jan");
              if(i<indexJan){
                newData["key"][0] = today.getFullYear() - 1;
              }
              else{
                newData["key"][0] = today.getFullYear();
              }
              newData["key"][1] = allMonths.indexOf(ordMonths[i]);
              results[i] = newData;
            }
          });
          return results;
        }
  };
}

function remove_null_bins(source_group) {
  return {
      all:function () {
          results = [];
          source_group.all().forEach(function(d,i){
            if((d.key)&&(d.value)){
                results.push(d);
              }
            });
          return results;
        }
  };
}

function cap_bins(source_group, cap){
  return{
    all:function(){
      results = [];
      rolling = {"surgical":0, "nonsurgical":0};
      results = source_group.top(cap);
      // source_group.all().forEach(function(d,i){
      //   if(i<=cap){
      //     results.push(d);
      //   }
      //   else{
      //     rolling["surgical"] += d.value["surgical"];
      //     rolling["nonsurgical"] += d.value["nonsurgical"];
      //   }
      // });
      
      other = {"key":"Other", "value":rolling};
      //results.push(other);

      return results;
    }
  };
}

function numMonthsBetween(d2, d1){
  return d2.getMonth() - d1.getMonth()
       + (12 * (d2.getFullYear() - d1.getFullYear()));
}
function numMonthsBetweenParts(d2Month, d2Year, d1Month, d1Year){
  return d2Month - d1Month
       + (12 * (d2Year - d1Year));
}

function getLineYisXData(lowerbound, upperbound){
  var newArray = [{'x':lowerbound, 'y':lowerbound}, {'x':upperbound, 'y':upperbound}];
  return newArray;
}