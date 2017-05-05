
function drawAggregateHeatmap(selector, rows, cols, data) {
  $(selector).find('.heatmap-svg').remove();
  var margin = { top: 70, right:20, bottom:20, left: 70 };

  var numrows = adjustIndices(rows);
  var numcols = adjustIndices(cols);


  var width = CELL_SIZE * numcols + GT_OFFSET; // - margin.left - margin.right,
  var height = CELL_SIZE * numrows; // - margin.top - margin.bottom,

  var svg = d3.select(selector).append("svg")
    .attr("class", "heatmap-svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    ;

  var rowSortOrder=false;
  var colSortOrder=false;

  var rowLabels = svg.append("g")
    .selectAll(".rowLabelg")
    .data(Object.values(rows)
      .filter(function(d) {
        return d.show;
      })
    )
    .enter()
    .append("text")
    .text(function (d) { return d.id; })
    .attr("x", 0)
    .attr("y", function (d, i) { return d.index * CELL_SIZE; })
    .style("text-anchor", "end")
    .attr("transform", "translate(-4," + CELL_SIZE / 1.1 + ")")
    .attr("class", function (d,i) { return "rowLabel mono r"+d.index;} )
    .on("mouseover", function(d) {SELECTED_EXAMPLE = d.id; d3.select(this).classed("text-hover",true);})
    .on("mouseout" , function(d) {SELECTED_EXAMPLE = null; d3.select(this).classed("text-hover",false);})
    //.on("click", function(d,i) {rowSortOrder=!rowSortOrder; sortByPrediction("r", d.index, rowSortOrder);})
    ;

  var colLabels = svg.append("g")
    .selectAll(".colLabelg")
    .data(Object.values(cols)
      .filter(function(d) {
        return d.show;
      })
    )
    .enter()
    .append("text")
    .text(function (d) { return d.id; })
    .attr("x", 0)
    .attr("y", function (d, i) {
      return d.index * CELL_SIZE + (d.index == 0 ? 0 : GT_OFFSET);
    })
    .style("text-anchor", "left")
    .attr("transform", "translate("+CELL_SIZE/1.2 + ",-6) rotate (-90)")
    .attr("class",  function (d,i) { return "colLabel mono c"+d.index;} )
    .on("mouseover", function(d) {SELECTED_MODEL = d.id; d3.select(this).classed("text-hover",true);})
    .on("mouseout" , function(d) {SELECTED_MODEL = null; d3.select(this).classed("text-hover",false);})
    //.on("click", function(d,i) {colSortOrder=!colSortOrder; sortByPrediction("c",cols[d],colSortOrder);})
    ;

  var heatMap = svg.append("g").attr("class","g3")
    .selectAll(".cellg")
    .data(data.filter(function(d) {
      return (cols[d.x].show && rows[d.y].show);
    }),function(d){return rows[d.y].index+":"+cols[d.x].index;})
    .enter()
    .append("rect")
    .attr("x", function(d) { return (cols[d.x].index * CELL_SIZE) + (cols[d.x].index == 0 ? 0 : GT_OFFSET); })
    .attr("y", function(d) { return rows[d.y].index * CELL_SIZE; })
    .attr("class", function(d){
      var result = "cell cell-border cr"+(rows[d.y].index)+" cc"+(cols[d.x].index);
      if (d.x == "GT") {
        result += " gt" + rows[d.y].index
      }
      return result;
    })
    .attr("width", CELL_SIZE)
    .attr("height", CELL_SIZE)
    .style("fill", function(d) {
      if (d.x == 'GT') {
        return MONO_SCALE(d.value);
      } else {
        return RG_SCALE(d.value);
      }
    })
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
      d3.selectAll(".rowLabel").classed("text-highlight",function(r,ri){ return r.id==d.y;});
      d3.selectAll(".colLabel").classed("text-highlight",function(c,ci){ return c.id==d.x;});


      var tooltip = '<div><div class="heatmap-tooltip-key">filter group:</div>' +
          '<div class="heatmap-tooltip-value">' + d.y + '</div></div>'+
          '<div><div class="heatmap-tooltip-key">model id:</div>' +
          '<div class="heatmap-tooltip-value">' + d.x + '</div></div>';

      if (d.x == 'GT') {
        tooltip += '<div><div class="heatmap-tooltip-key"># positive:</div>' +
          '<div class="heatmap-tooltip-value">' + d.pos + '</div></div>' +
          '<div><div class="heatmap-tooltip-key"># negative:</div>' +
          '<div class="heatmap-tooltip-value">' + d.neg + '</div></div>';
      } else {
        tooltip += '<div><div class="heatmap-tooltip-key">accuracy:</div>' +
          '<div class="heatmap-tooltip-value">' + d.value.toFixed(2) + '</div></div>';
      }

      //Update the tooltip position and value
      d3.select("#heatmap-tooltip")
        .style("left", (d3.event.pageX+10) + "px")
        .style("top", (d3.event.pageY-10) + "px")
        .select("#value")
        .html(tooltip)
      ;
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

  var border = svg.append("rect").attr("class","gt-border")
    .attr("x", CELL_SIZE + 1)
    .attr("y", 0)
    .attr("height", height)
    .attr("width", 1)
    ;

  var hlRows = svg.append("g").attr("class", "hl-agg-rows");

  $(selector).scrollTop(45);
  $(selector).scrollLeft(45);
  sortByPrediction(selector, "c", 0, true, rows, cols, numrows, numcols);

  // single and double click handlers for columns
  var cc = clickcancel();
  colLabels.call(cc);
  cc.on('click', function(d, i) {
    colSortOrder=!colSortOrder;
    sortByPrediction(selector, "c", cols[SELECTED_MODEL].index, colSortOrder, rows, cols, numrows, numcols);
  });

  // single and double click handlers for rows
  var rc = clickcancel();
  rowLabels.call(rc);
  rc.on('click', function(d, i) {
    rowSortOrder=!rowSortOrder;
    sortByPrediction(selector, "r", rows[SELECTED_EXAMPLE].index, rowSortOrder, rows, cols, numrows, numcols);
  });
  rc.on('dblclick', function(d) {
    toggleGroup(SELECTED_EXAMPLE);
  });
}

function toggleGroup(group) {
  if (SELECTED_GROUP == group) {
    // remove highlight and restore matrix to full view
    d3.select('.hl-agg-row').remove();
    showAllExamples();
    SELECTED_GROUP = null;
  } else {
    // remove other highlights
    d3.select('.hl-agg-row').remove();

    // highlight row
    var row = AGG_ROWS[group].index;

    var y = d3.select('.agg-heatmap .r'+row).attr('y');
    d3.select('.hl-agg-rows')
      .selectAll('.hl-agg-rowg')
      .data([AGG_ROWS[group]])
      .enter()
      .append("rect")
      .attr("height", CELL_SIZE)
      .attr("width", MATRIX_WIDTH - 20)
      .attr("x", CELL_SIZE + GT_OFFSET)
      .attr("y", y)
      .attr("class", "hl-agg-row hl-agg-row-" + row)
      .style("opacity", "0.7")
      .style("fill", "none")
      .style("stroke", "#000")
      .style("stroke-width", "1.5")
    ;

    showFilteredExamples(group);
    SELECTED_GROUP = group;
  }

};