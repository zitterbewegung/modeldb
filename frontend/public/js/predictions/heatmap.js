var cols;
var rows;

var heatmap = function(src, selector, cellSize) {
  rows = {};
  cols = {};

  $.get(src, function(response) {
    MATRIX_DATA = response.data;
    rows = response.rows;
    cols = response.cols;

    drawHeatmap(selector, cols, rows);
  });

};

function drawHeatmap(selector, cols, rows) {
  var margin = { top: 70, right:0, bottom:0, left: 70 };
  var rowLabel = Object.keys(rows);
  var colLabel = Object.keys(cols);
  MATRIX_NUMROWS = rowLabel.length;
  MATRIX_NUMCOLS = colLabel.length;
  var width = CELL_SIZE * MATRIX_NUMCOLS + GT_OFFSET; // - margin.left - margin.right,
  var height = CELL_SIZE * MATRIX_NUMROWS; // - margin.top - margin.bottom,
  MATRIX_HEIGHT = height;
  MATRIX_WIDTH = width;

  var svg = d3.select(selector).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("class", "heatmap-svg")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    ;

  var rowSortOrder=false;
  var colSortOrder=false;

  var rowLabels = svg.append("g")
    .selectAll(".rowLabelg")
    .data(Object.values(rows))
    .enter()
    .append("text")
    .text(function (d) { return d.id; })
    .attr("x", 0)
    .attr("y", function (d, i) { return d.index * CELL_SIZE; })
    .style("text-anchor", "end")
    .attr("transform", "translate(-4," + CELL_SIZE / 1.1 + ")")
    .attr("class", function (d,i) { return "rowLabel mono r"+d.index;} )
    .on("mouseover", function(d) {d3.select(this).classed("text-hover",true);})
    .on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);})
    .on("click", function(d,i) {rowSortOrder=!rowSortOrder; sortbylabel("r", d.index, rowSortOrder);})
    ;

  var colLabels = svg.append("g")
    .selectAll(".colLabelg")
    .data(Object.values(cols))
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
    .on("mouseover", function(d) {selectedModel = d.id; d3.select(this).classed("text-hover",true);})
    .on("mouseout" , function(d) {selectedModel = null; d3.select(this).classed("text-hover",false);})
    //.on("click", function(d,i) {colSortOrder=!colSortOrder; sortbylabel("c",cols[d],colSortOrder);})
    ;

  var heatMap = svg.append("g").attr("class","g3")
    .selectAll(".cellg")
    .data(MATRIX_DATA,function(d){return rows[d.y].index+":"+cols[d.x].index;})
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
    .style("fill", function(d) { return COLOR_SCALE(d.value); })
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
      d3.selectAll(".rowLabel").classed("text-highlight",function(r,ri){ return r==d.y;});
      d3.selectAll(".colLabel").classed("text-highlight",function(c,ci){ return c==d.x;});

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

  var border = svg.append("rect").attr("class","gt-border")
    .attr("x", CELL_SIZE + 1)
    .attr("y", 0)
    .attr("height", height)
    .attr("width", 1)
    ;

  var hlCols = svg.append("g").attr("class","hl-cols")



  $('.heatmap').scrollTop(45);
  $('.heatmap').scrollLeft(45);
  sortbylabel("c",0,true);
  updateLegend();

  var cc = clickcancel();
  colLabels.call(cc);
  cc.on('click', function(d, i) {
    colSortOrder=!colSortOrder;
    sortbylabel("c", cols[selectedModel].index ,colSortOrder);
  });
  cc.on('dblclick', function(d) {
    toggleModel(selectedModel);
  });
}

function sortbylabel(rORc,i,sortOrder){
  var svg = d3.select('.heatmap-svg');
  var t = svg.transition().duration(1000 - 5*(MATRIX_NUMROWS + MATRIX_NUMCOLS));
  var vals=[];
  var sorted; // sorted is zero-based index
  d3.selectAll(".c"+rORc+(i))
   .filter(function(ce){
      vals.push(ce.value);
    })
  ;
  if(rORc=="r"){
    vals.pop();
    sorted=d3.range(1, MATRIX_NUMCOLS).sort(function(a,b){ if(sortOrder){ return vals[b-1]-vals[a-1];}else{ return vals[a-1]-vals[b-1];}});
    sorted.unshift(cols['GT'].index);
    t.selectAll(".cell:not(.cc0)")
      .attr("x", function(d) { return sorted.indexOf(cols[d.x].index) * CELL_SIZE + (cols[d.x] == 0 ? 0 : GT_OFFSET); })
      ;
    t.selectAll(".colLabel:not(.c0)")
      .attr("y", function (d, i) { return sorted.indexOf(d.index) * CELL_SIZE + (cols[d] == 0 ? 0 : GT_OFFSET); })
      ;
    t.selectAll(".hl-col")
      .attr("x", function(d) { return sorted.indexOf(d.index) * CELL_SIZE + (cols[d] == 0 ? 0 : GT_OFFSET);})
      ;
  } else {
    sorted=d3.range(MATRIX_NUMROWS).sort(function(a,b){if(sortOrder){ return vals[b]-vals[a];}else{ return vals[a]-vals[b];}});
    t.selectAll(".cell")
      .attr("y", function(d) { return sorted.indexOf(rows[d.y].index) * CELL_SIZE; })
      ;
    t.selectAll(".rowLabel")
      .attr("y", function (d, i) { return sorted.indexOf(i) * CELL_SIZE; })
      ;
  }
}

function toggleModel(model) {
  if (model == 'GT') {
    return;
  }
  if (SELECTED_MODELS[model]) {
    delete SELECTED_MODELS[model];
    removeModel(model, cols[model].index);
  } else {
    SELECTED_MODELS[model] = true;
    addModel(model, cols[model].index);
  }
}

function addModel(model, col) {
  // update list of models in menu
  var div = $('<div>' + model + '</div>');
  div.addClass(model + '');
  $('.predictions-selected-models').append(div);

  // highlight column in prediction matrix
  var x = d3.select('.c'+col).attr('y');
  d3.select('.hl-cols')
    .selectAll('.hl-colg')
    .data([cols[model]])
    .enter()
    .append("rect")
    .attr("height", MATRIX_HEIGHT)
    .attr("width", CELL_SIZE)
    .attr("x", x)
    .attr("y", 0)
    .attr("class", "hl-col hl-col-" + col)
    .style("opacity", "0.7")
    .style("fill", "none")
    .style("stroke", "#000")
    .style("stroke-width", "1.5")
  ;
  // add relevant visualizations
  addPipeline('/pipeline/' + model, '#pipelines');
  addConfusionMatrix(model, '#confusion-matrices', col);
  addROC(model, '.roc-container', col);
  addPR(model, '.pr-container', col);
}

function removeModel(model, col) {
  // update list of models in menu
  $('.predictions-selected-models div.' + model).remove();

  // unhighlight column in prediction matrix
  d3.select(".hl-col-" + col).remove();

  // remove relevant visualizations
  removePipeline(model);
  removeConfusionMatrix(model);
  removeROC(model, '.roc-container');
  removePR(model, '.pr-container');
}

var updateLegend = function() {
  d3.select('.heatmap-legend svg').remove();
  var cellSize = 12;
  var legendCellSize = 23;
  var width = 480;
  var height = 50;
  var left = "";
  var right = "";

  var scale = $('.color-scheme').val();
  if (scale == "RG_SCALE" || scale == "OB_SCALE") {
    left = "Prediction value";
  } else if (scale == "BINARY_SCALE") {
    left = "Binary classification";
  } else if (scale == "MONO_SCALE" ) {
    left = "Closer";
    right = "Farther";
  } else if (scale == "CORRECTNESS_SCALE") {
    left = "Incorrect";
    right = "Correct";
  }

  var svg = d3.select('.heatmap-legend')
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    ;

  var linspace = [];
  for (var i=0; i<=1.01; i+= 0.05) {
    linspace.push(i);
  }

  var legend = svg.selectAll(".legend")
    .data(linspace)
    .enter()
    .append('g')
    .attr("class", "legend");

  var legendTitle = svg.append('g')
    .attr("class", 'legend-title');

  legendTitle.append("text")
    .attr("class", "mono")
    .text(left)
    .attr("x", 0)
    .attr("y", 12)
    ;

  legendTitle.append("text")
    .attr("class", "mono")
    .text(right)
    .attr("x", width - right.length * 7)
    .attr("y", 12)
    ;

  legend.append("rect")
    .attr("x", function(d, i) { return legendCellSize * i; })
    .attr("y", 18)
    .attr("width", legendCellSize)
    .attr("height", cellSize)
    .style("fill", function(d, i) {
      if (scale == "BINARY_SCALE") {
        return (d < 0.5) ? "#D9E0E8" : "#2c3e50";
      } else {
        return COLOR_SCALE(d);
      }
    });

  // adjust halfway point for binary scale
  if (scale == "BINARY_SCALE") {
    legend.append("rect")
      .attr("x", legendCellSize * 10.5)
      .attr("y", 18)
      .attr("width", legendCellSize)
      .attr("height", cellSize)
      .style("fill", "#2c3e50");
  }

  legend.append("text")
    .attr("class", "mono")
    .text(function(d, i) {
      if (scale == "CORRECTNESS_SCALE") { return; }
      if (i==0 || i==20) {
        return d.toFixed(1);
      }
      if (scale != "BINARY_SCALE" && i == 10) {
        return d.toFixed(1);
      }
    })
    .attr("x", function(d, i) { return legendCellSize * i; })
    .attr("y", 42);
}

var updateColorScale = function(scale) {
  COLOR_SCALE = SCALES[scale];
  if (scale == "MONO_SCALE") {
    d3.selectAll(".cell.cc0")
      .style("fill", function(d) {
        return COLOR_SCALE(d.value);
      });
    d3.selectAll(".cell:not(.cc0)")
      .style("fill", function(d) {
        // use distance from ground truth
        var val;
        d3.select('.gt' + rows[d.y]).filter(function(e) {
          val = COLOR_SCALE(Math.abs(d.value - e.value));
        });

        return val;
      });
  } else if (scale == "CORRECTNESS_SCALE") {
    d3.selectAll(".cell.cc0")
      .style("fill", function(d) {
        return MONO_SCALE(d.value);
      });
    d3.selectAll(".cell:not(.cc0)")
      .style("fill", function(d) {
        var val;
        d3.select('.gt' + rows[d.y]).filter(function(e) {
          if (e.value < 0.5) {
            val = CORRECTNESS_SCALE_GT0(d.value);
          } else {
            val = CORRECTNESS_SCALE_GT1(d.value);
          }
        });

        return val;
      });
  } else {
    d3.selectAll(".cell")
      .style("fill", function(d) {
        return COLOR_SCALE(d.value);
      });
  }

  // make correction to GT when
  // binary scale threshold = 0
  if (scale == "BINARY_SCALE") {
    d3.selectAll(".cell.cc0")
      .style("fill", function(d) {
        return (d.value < 0.5) ? "#D9E0E8" : "#2c3e50";
      });
  }

  updateLegend();
}

function clickcancel() {
    var event = d3.dispatch('click', 'dblclick');
    function cc(selection) {
        var down,
            tolerance = 5,
            last,
            wait = null;
        // euclidean distance
        function dist(a, b) {
            return Math.sqrt(Math.pow(a[0] - b[0], 2), Math.pow(a[1] - b[1], 2));
        }
        selection.on('mousedown', function() {
            down = d3.mouse(document.body);
            last = +new Date();
        });
        selection.on('mouseup', function() {
            if (dist(down, d3.mouse(document.body)) > tolerance) {
                return;
            } else {
                if (wait) {
                    window.clearTimeout(wait);
                    wait = null;
                    event.dblclick(d3.event);
                } else {
                    wait = window.setTimeout((function(e) {
                        return function() {
                            event.click(e);
                            wait = null;
                        };
                    })(d3.event), 300);
                }
            }
        });
    };
    return d3.rebind(cc, event, 'on');
}