var heatmap = function(src, selector, cellSize) {

  var margin = { top: 70, right: 70, bottom: 70, left: 70 },
    cellSize=12;

    //gridSize = Math.floor(width / 24),
    legendElementWidth = cellSize*2.5,
    colorBuckets = 21,
    colors = ['#005824','#1A693B','#347B53','#4F8D6B','#699F83','#83B09B','#9EC2B3','#B8D4CB','#D2E6E3','#EDF8FB','#FFFFFF','#F1EEF6','#E6D3E1','#DBB9CD','#D19EB9','#C684A4','#BB6990','#B14F7C','#A63467','#9B1A53','#91003F'];
    rows = {};
    cols = {};
    rowLabel = [];
    colLabel = [];

  d3.json(src,function(error, response) {
    data = response.data;
    rows = response.rows;
    cols = response.cols;
    rowLabel = Object.keys(rows);
    colLabel = Object.keys(cols);

    row_number = rowLabel.length;
    col_number = colLabel.length;
    width = cellSize*col_number; // - margin.left - margin.right,
    height = cellSize*row_number; // - margin.top - margin.bottom,

    var colorScale = d3.scale.quantile()
      .domain([0, 0.5, 1])
      .range(colors);

    var colorScale = d3.scale.linear().domain([0, 1])
      .interpolate(d3.interpolateHcl)
      .range([d3.rgb("#ecf0f1"), d3.rgb('#2c3e50')]);


    var svg = d3.select(selector).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      ;

    var rowSortOrder=false;
    var colSortOrder=false;

    var rowLabels = svg.append("g")
      .selectAll(".rowLabelg")
      .data(rowLabel)
      .enter()
      .append("text")
      .text(function (d) { return d; })
      .attr("x", 0)
      .attr("y", function (d, i) { return i * cellSize; })
      .style("text-anchor", "end")
      .attr("transform", "translate(-4," + cellSize / 1.1 + ")")
      .attr("class", function (d,i) { return "rowLabel mono r"+i;} )
      .on("mouseover", function(d) {d3.select(this).classed("text-hover",true);})
      .on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);})
      .on("click", function(d,i) {rowSortOrder=!rowSortOrder; sortbylabel("r",i,rowSortOrder);})
      ;

    var colLabels = svg.append("g")
      .selectAll(".colLabelg")
      .data(colLabel)
      .enter()
      .append("text")
      .text(function (d) { return d; })
      .attr("x", 0)
      .attr("y", function (d, i) { return i * cellSize; })
      .style("text-anchor", "left")
      .attr("transform", "translate("+cellSize/1.2 + ",-6) rotate (-90)")
      .attr("class",  function (d,i) { return "colLabel mono c"+i;} )
      .on("mouseover", function(d) {d3.select(this).classed("text-hover",true);})
      .on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);})
      .on("click", function(d,i) {colSortOrder=!colSortOrder;  sortbylabel("c",i,colSortOrder);})
      ;

    var heatMap = svg.append("g").attr("class","g3")
      .selectAll(".cellg")
      .data(data,function(d){return d.y+":"+d.x;})
      .enter()
      .append("rect")
      .attr("x", function(d) { return (cols[d.x]) * cellSize; })
      .attr("y", function(d) { return (rows[d.y]) * cellSize; })
      .attr("class", function(d){return "cell cell-border cr"+(d.y-1)+" cc"+(d.x-1);})
      .attr("width", cellSize)
      .attr("height", cellSize)
      .style("fill", function(d) { return colorScale(d.value); })
      /* .on("click", function(d) {
             var rowtext=d3.select(".r"+(d.row-1));
             if(rowtext.classed("text-selected")==false){
                 rowtext.classed("text-selected",true);
             }else{
                 rowtext.classed("text-selected",false);
             }
      })*/
      .on("mouseover", function(d){
        //highlight text
        d3.select(this).classed("cell-hover",true);
        d3.selectAll(".rowLabel").classed("text-highlight",function(r,ri){ return ri==(rows[d.y]);});
        d3.selectAll(".colLabel").classed("text-highlight",function(c,ci){ return ci==(cols[d.x]);});

        //Update the tooltip position and value
        d3.select("#heatmap-tooltip")
          .style("left", (d3.event.pageX+10) + "px")
          .style("top", (d3.event.pageY-10) + "px")
          .select("#value")
          .html('<div><div class="heatmap-tooltip-key">example id:</div>' +
            '<div class="heatmap-tooltip-value">' + d.y + '</div></div>'+
            '<div><div class="heatmap-tooltip-key">model id:</div>' +
            '<div class="heatmap-tooltip-value">' + d.x + '</div></div>'+
            '<div><div class="heatmap-tooltip-key">prediction:</div>' +
            '<div class="heatmap-tooltip-value">' + d.value.toFixed(2) + '</div></div>');
        //Show the tooltip
        d3.select("#heatmap-tooltip").classed("hidden", false);
      })
      .on("mouseout", function(){
             d3.select(this).classed("cell-hover",false);
             d3.selectAll(".rowLabel").classed("text-highlight",false);
             d3.selectAll(".colLabel").classed("text-highlight",false);
             d3.select("#heatmap-tooltip").classed("hidden", true);
      })
      ;

    // sort
    function sortbylabel(rORc,i,sortOrder){
      var t = svg.transition().duration(1000 - 5*(row_number + col_number));
      var vals=[];
      var sorted; // sorted is zero-based index
      d3.selectAll(".c"+rORc+(i-1))
       .filter(function(ce){
          vals.push(ce.value);
        })
      ;
      if(rORc=="r"){
       sorted=d3.range(col_number).sort(function(a,b){ if(sortOrder){ return vals[b]-vals[a];}else{ return vals[a]-vals[b];}});
       t.selectAll(".cell")
         .attr("x", function(d) { return sorted.indexOf(d.x) * cellSize; })
         ;
       t.selectAll(".colLabel")
        .attr("y", function (d, i) { return sorted.indexOf(i) * cellSize; })
       ;
      }else{
       sorted=d3.range(row_number).sort(function(a,b){if(sortOrder){ return vals[b]-vals[a];}else{ return vals[a]-vals[b];}});
       t.selectAll(".cell")
         .attr("y", function(d) { return sorted.indexOf(d.y) * cellSize; })
         ;
       t.selectAll(".rowLabel")
        .attr("y", function (d, i) { return sorted.indexOf(i) * cellSize; })
       ;
      }
    }

  });



};