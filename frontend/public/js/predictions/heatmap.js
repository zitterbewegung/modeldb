$(function() {
  $('.heatmap').scroll(function(e) {
    $('.agg-heatmap').scrollLeft($(e.target).scrollLeft());
  });

  $('.agg-heatmap').scroll(function(e) {
    $('.heatmap').scrollLeft($(e.target).scrollLeft());
  });
});

var heatmap = function(src, selector, models) {
  ROWS = {};
  COLS = {};

  $.get(src, function(response) {
    MATRIX_DATA = response.data;

    // store in object form
    for (var i=0; i<MATRIX_DATA.length; i++) {
      var x = MATRIX_DATA[i].x;
      var y = MATRIX_DATA[i].y;
      var val = MATRIX_DATA[i].value;
      if (MATRIX_OBJ[x] == null) {
        MATRIX_OBJ[x] = {};
        MATRIX_OBJ[x][y] = val;
      } else {
        MATRIX_OBJ[x][y] = val;
      }
    }

    ROWS = response.rows;
    COLS = response.cols;

    if (models != null && models.length > 0) {
      for (col in COLS) {
        COLS[col].show = (col == 'GT' || models.indexOf(col) > -1);
        COLS[col].index = models.indexOf(col);
      }
    }

    drawHeatmap(selector, ROWS, COLS, MATRIX_DATA);

    setTimeout(function() {
      if (models != null && models.length > 0) {
        toggleModel(models[models.length-1]);
      }
    }, 500)

  });

};

function drawHeatmap(selector, rows, cols, data) {
  $(selector).find('.heatmap-svg').remove();
  var margin = { top: 70, right:20, bottom:20, left: 70 };

  MATRIX_NUMROWS = adjustIndices(rows);
  MATRIX_NUMCOLS = adjustIndices(cols);

  CELL_SIZE_X = Math.max(12, Math.round(700/MATRIX_NUMCOLS));
  CELL_SIZE_Y = Math.min(20, Math.max(12, Math.round(650/MATRIX_NUMROWS)));

  var width = CELL_SIZE_Y + CELL_SIZE_X * (MATRIX_NUMCOLS - 1) + GT_OFFSET; // GT + offset + cells
  var height = CELL_SIZE_Y * MATRIX_NUMROWS;
  MATRIX_HEIGHT = height;
  MATRIX_WIDTH = width;

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
    .attr("y", function (d, i) { return d.index * CELL_SIZE_Y; })
    .style("text-anchor", "end")
    .attr("transform", "translate(-4," + CELL_SIZE_Y / 1.1 + ")")
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
      return d.index * CELL_SIZE_X + (d.index == 0 ? 0 : GT_OFFSET);
    })
    .style("text-anchor", "left")
    .attr("transform", "translate("+CELL_SIZE_Y/1.2 + ",-6) rotate (-90)")
    .attr("class",  function (d,i) { return "colLabel mono c"+d.index;} )
    .on("mouseover", function(d) {
      SELECTED_MODEL = d.id;
      d3.select(this).classed("text-hover",true);

      if (d.id == 'GT') { return; }

      var model = MODELS[d.id];
      var tooltip = '<div><div class="heatmap-tooltip-key">type:</div>' +
          '<div class="heatmap-tooltip-value">' + model.specification.transformerType + '</div></div>';
      for (var i=0; i<model.metrics.length; i++) {
        tooltip += '<div><div class="heatmap-tooltip-key">' + model.metrics[i].key + ':</div>';
        tooltip += '<div class="heatmap-tooltip-value">' + model.metrics[i].val + '</div></div>';
      }

      //Update the tooltip position and value
      d3.select("#heatmap-tooltip")
        .style("left", (d3.event.pageX+10) + "px")
        .style("top", (d3.event.pageY-10) + "px")
        .select("#value")
        .html(tooltip);
      //Show the tooltip
      d3.select("#heatmap-tooltip").classed("hidden", false);
    })
    .on("mouseout" , function(d) {
      SELECTED_MODEL = null;
      d3.select(this).classed("text-hover",false);
      d3.select("#heatmap-tooltip").classed("hidden", true);
    })
    //.on("click", function(d,i) {colSortOrder=!colSortOrder; sortByPrediction("c",cols[d],colSortOrder);})
    ;

  var heatMap = svg.append("g").attr("class","g3")
    .selectAll(".cellg")
    .data(data.filter(function(d) {
      return (cols[d.x].show && rows[d.y].show);
    }),function(d){return rows[d.y].index+":"+cols[d.x].index;})
    .enter()
    .append("rect")
    .attr("x", function(d) {
      if (cols[d.x].index == 0) {
        return 0;
      } else {
        return (cols[d.x].index - 1) * CELL_SIZE_X + CELL_SIZE_Y + GT_OFFSET;
      }
    })
    .attr("y", function(d) { return rows[d.y].index * CELL_SIZE_Y; })
    .attr("class", function(d){
      var result = "cell cell-border cr"+(rows[d.y].index)+" cc"+(cols[d.x].index);
      if (d.x == "GT") {
        result += " gt" + rows[d.y].index
      }
      return result;
    })
    .attr("width", function(d) { return (cols[d.x].index == 0 ? CELL_SIZE_Y : CELL_SIZE_X); })
    .attr("height", CELL_SIZE_Y)
    .style("fill", function(d) {
      if (d.x == 'GT') {
        return MONO_SCALE(d.value);
      } else {
        return COLOR_SCALE(d.value);
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
    .attr("x", CELL_SIZE_Y + 1)
    .attr("y", 0)
    .attr("height", height)
    .attr("width", 1)
    ;

  var hlCols = svg.append("g").attr("class","hl-cols");
  var hlRows = svg.append("g").attr("class", "hl-rows");


  $(selector).scrollTop(45);
  $(selector).scrollLeft(45);
  sortByPrediction(selector, "c", 0, true, rows, cols, MATRIX_NUMROWS, MATRIX_NUMCOLS);
  updateLegend();
  updateColorScale("CORRECTNESS_SCALE");

  // single and double click handlers for columns
  var cc = clickcancel();
  colLabels.call(cc);
  cc.on('click', function(d, i) {
    colSortOrder=!colSortOrder;
    sortByPrediction(selector, "c", cols[SELECTED_MODEL].index, colSortOrder, rows, cols, MATRIX_NUMROWS, MATRIX_NUMCOLS);
  });
  cc.on('dblclick', function(d) {
    toggleModel(SELECTED_MODEL);
  });

  // single and double click handlers for rows
  var rc = clickcancel();
  rowLabels.call(rc);
  rc.on('click', function(d, i) {
    rowSortOrder=!rowSortOrder;
    sortByPrediction(selector, "r", rows[SELECTED_EXAMPLE].index, rowSortOrder, rows, cols, MATRIX_NUMROWS, MATRIX_NUMCOLS);
  });
  rc.on('dblclick', function(d) {
    toggleExample(SELECTED_EXAMPLE)
  });
}

function sortByPrediction(selector, rORc,i,sortOrder, rows, cols, numRows, numCols){
  var cell_size_x = (selector == ".heatmap") ? CELL_SIZE_X : CELL_SIZE_X_AGG;
  var cell_size_y = (selector == ".heatmap") ? CELL_SIZE_Y : CELL_SIZE_Y_AGG;

  var svg = d3.select(selector + ' .heatmap-svg');
  var t = svg.transition().duration(1000 - 5*(numRows + numCols));
  var vals=[];
  var sorted; // sorted is zero-based index
  d3.selectAll(selector + " .c"+rORc+(i))
   .filter(function(ce){
      vals.push(ce.value);
    })
  ;
  if(rORc=="r"){
    vals.shift(); // remove GT, assumes it is first one
    sorted=d3.range(1, numCols).sort(function(a,b){ if(sortOrder){ return vals[b-1]-vals[a-1];}else{ return vals[a-1]-vals[b-1];}});
    sorted.unshift(cols['GT'].index);
    t.selectAll(".cell:not(.cc0)")
      .attr("x", function(d) { return cell_size_y + (sorted.indexOf(cols[d.x].index) - 1) * cell_size_x + GT_OFFSET; })
      ;
    t.selectAll(".colLabel:not(.c0)")
      .attr("y", function (d, i) { return sorted.indexOf(d.index) * cell_size_x + (cols[d] == 0 ? 0 : GT_OFFSET); })
      ;
    t.selectAll(".hl-col")
      .attr("x", function(d) { return cell_size_x + (sorted.indexOf(d.index) -1 ) * cell_size_x + GT_OFFSET; })
      ;
  } else {
    sorted=d3.range(numRows).sort(function(a,b){if(sortOrder){ return vals[b]-vals[a];}else{ return vals[a]-vals[b];}});
    t.selectAll(".cell")
      .attr("y", function(d) { return sorted.indexOf(rows[d.y].index) * cell_size_y; })
      ;
    t.selectAll(".rowLabel")
      .attr("y", function (d, i) { return sorted.indexOf(d.index) * cell_size_y; })
      ;
    t.selectAll(".hl-row")
      .attr("y", function(d) { return sorted.indexOf(d.index) * cell_size_y; })
      ;
    t.selectAll(".hl-agg-row")
      .attr("y", function(d) { return sorted.indexOf(d.index) * cell_size_y; })
      ;
  }

  // reset select to None so we can resort by model or example
  $('.predictions-sort').val('None')
}

function sortByLabel(selector, rORc, sortOrder, rows, cols, numRows, numCols, agg) {
  var svg = d3.select(selector + ' .heatmap-svg');
  var t = svg.transition().duration(1000 - 5*(numRows + numCols));
  var vals=[];
  var sorted; // sorted is zero-based index

  var type = rORc == "r" ? ".rowLabel" : ".colLabel";
  d3.selectAll(selector + ' ' + type)
   .filter(function(ce){
      vals.push(ce.id);
    })
  ;

  if(rORc=="c"){
    vals.shift();
    sorted=d3.range(1, numCols).sort(function(a,b){
      if (vals[a-1] < vals[b-1]) {
        return sortOrder ? 1 : -1;
      } else {
        return sortOrder ? -1 : 1;
      }
    });
    sorted.unshift(cols['GT'].index);
    t.selectAll(".cell:not(.cc0)")
      .attr("x", function(d) { return CELL_SIZE_Y + (sorted.indexOf(cols[d.x].index) - 1) * CELL_SIZE_X + GT_OFFSET; })
      ;
    t.selectAll(".colLabel:not(.c0)")
      .attr("y", function (d, i) { return sorted.indexOf(d.index) * CELL_SIZE_X + (cols[d] == 0 ? 0 : GT_OFFSET); })
      ;
    t.selectAll(".hl-col")
      .attr("x", function(d) { return CELL_SIZE_Y + (sorted.indexOf(d.index) -1 ) * CELL_SIZE_X + GT_OFFSET; })
      ;
  } else {
    sorted=d3.range(numRows).sort(function(a,b){if(sortOrder){ return vals[b]-vals[a];}else{ return vals[a]-vals[b];}});
    t.selectAll(".cell")
      .attr("y", function(d) { return sorted.indexOf(rows[d.y].index) * CELL_SIZE_Y; })
      ;
    t.selectAll(".rowLabel")
      .attr("y", function (d, i) { return sorted.indexOf(i) * CELL_SIZE_Y; })
      ;
    t.selectAll(".hl-row")
      .attr("y", function(d) { return sorted.indexOf(d.index) * CELL_SIZE_Y; })
      ;
  }
}

function adjustIndices(data) {
  var idx = 0;
  var vals = Object.values(data);
  vals.sort(function(a,b) {
    if (a.o_index == null || b.o_index == null) {
      return a.index - b.index;
    } else {
      return a.o_index - b.o_index;
    }
  });
  for (var i=0; i<vals.length; i++) {
    var o = data[vals[i].id].index;
    if (data[vals[i].id].o_index == null) {
      data[vals[i].id].o_index = o;
    }
    if (data[vals[i].id].show) {
      data[vals[i].id].index = idx++;
    }
  }
  return idx;
}

function toggleExample(example) {
  if (SELECTED_EXAMPLES[example]) {
    delete SELECTED_EXAMPLES[example];
    removeExample(example);
  } else {
    SELECTED_EXAMPLES[example] = true;
    addExample(example);
  }
}

function addExample(example) {
  var html = new EJS({url: '/ejs/example.ejs'}).render({"example": RAW_DATA[example]});
  $('.example-container').append($(html));
  $('.example-container').animate({"right": "20px"});
  $('.example-container').data('id', example);

  // highlight row
  var row = ROWS[example].index;

  var y = d3.select('.heatmap .r'+row).attr('y');
  d3.select('.hl-rows')
    .selectAll('.hl-rowg')
    .data([ROWS[example]])
    .enter()
    .append("rect")
    .attr("height", CELL_SIZE_Y)
    .attr("width", MATRIX_WIDTH - (CELL_SIZE_Y + GT_OFFSET))
    .attr("x", CELL_SIZE_Y + GT_OFFSET)
    .attr("y", y)
    .attr("class", "hl-row hl-row-" + row)
    .style("opacity", "0.7")
    .style("fill", "none")
    .style("stroke", "#000")
    .style("stroke-width", "1.5")
  ;
}

function removeExample(example) {
  var row = ROWS[example].index;
  d3.select(".hl-row-" + row).remove();
  if ($('.example').length == 1) {
    $('.example-container').animate({"right": "-250px"}, function() {
      $('.example').remove();
    });
  } else {
    $('.example[data-id="' + example + '"]').remove();
  }
}

function toggleModel(model) {
  if (model == 'GT') {
    return;
  }
  if (SELECTED_MODELS[model]) {
    delete SELECTED_MODELS[model];
    removeModel(model, COLS[model].index);
  } else {
    SELECTED_MODELS[model] = true;
    addModel(model, COLS[model].index);
  }
}

function addModel(model, col) {
  // update list of models in menu
  var div = $('<div>' + model + '</div>');
  div.addClass(model + '');
  $('.predictions-selected-models').append(div);

  // highlight column in prediction matrix
  var x = d3.select('.heatmap .c'+col).attr('y');
  d3.select('.hl-cols')
    .selectAll('.hl-colg')
    .data([COLS[model]])
    .enter()
    .append("rect")
    .attr("height", MATRIX_HEIGHT)
    .attr("width", CELL_SIZE_X)
    .attr("x", x - (CELL_SIZE_X - CELL_SIZE_Y))
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
  updateThresholdSlider();
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

  updateThresholdSlider();
}

var updateLegend = function() {
  d3.select('.heatmap-legend svg').remove();
  var cellSize = 12;
  var legendCellSize = 25;
  var width = 750;
  var scaleWidth = 522;
  var gtWidth = 100;
  var margin = 26;
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
    .attr("x", scaleWidth - right.length * 7)
    .attr("y", 12)
    ;

  legendTitle.append("text")
    .attr("class", "mono")
    .text("Ground Truth (GT)")
    .attr("x", scaleWidth + margin)
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

  legend.append("rect")
    .attr("x", scaleWidth + margin)
    .attr("y", 18)
    .attr("width", gtWidth)
    .attr("height", cellSize)
    .style("fill", "#D9E0E8")
  ;

  legend.append("rect")
    .attr("x", scaleWidth + margin + gtWidth)
    .attr("y", 18)
    .attr("width", gtWidth)
    .attr("height", cellSize)
    .style("fill", "#2c3e50")
  ;

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

  legend.append("text")
    .attr("class", "mono")
    .text("0")
    .attr("x", scaleWidth + margin)
    .attr("y", 42);

  legend.append("text")
    .attr("class", "mono")
    .text("1")
    .attr("x", width - 10)
    .attr("y", 42);
}

var updateColorScale = function(scale) {
  COLOR_SCALE = SCALES[scale];
  d3.selectAll(".heatmap .cell.cc0")
  .style("fill", function(d) {
    return MONO_SCALE(d.value);
  });
  if (scale == "MONO_SCALE") {
    d3.selectAll(".heatmap .cell:not(.cc0)")
      .style("fill", function(d) {
        // use distance from ground truth
        var val;
        d3.select('.gt' + ROWS[d.y].index).filter(function(e) {
          val = COLOR_SCALE(Math.abs(d.value - e.value));
        });

        return val;
      });
  } else if (scale == "CORRECTNESS_SCALE") {
    d3.selectAll(".heatmap .cell:not(.cc0)")
      .style("fill", function(d) {
        var val;
        d3.select('.heatmap .gt' + ROWS[d.y].index).filter(function(e) {
          if (e.value < 0.5) {
            val = CORRECTNESS_SCALE_GT0(d.value);
          } else {
            val = CORRECTNESS_SCALE_GT1(d.value);
          }
        });

        return val;
      });
  } else {
    d3.selectAll(".heatmap .cell:not(.cc0)")
      .style("fill", function(d) {
        return COLOR_SCALE(d.value);
      });
  }

  // make correction to GT when
  // binary scale threshold = 0
  if (scale == "BINARY_SCALE") {
    d3.selectAll(".heatmap .cell.cc0")
      .style("fill", function(d) {
        return (d.value < 0.5) ? "#D9E0E8" : "#2c3e50";
      });
  }

  updateLegend();
  updateThresholdSlider();
}

function updateThresholdSlider() {
  var scale = $('.color-scheme').val();
  // hide threshold if necessary
  if (scale == "OB_SCALE" || scale == "MONO_SCALE") {
    if (jQuery.isEmptyObject(SELECTED_MODELS) &&
      jQuery.isEmptyObject(GROUPS)) {
      $('.predictions-threshold-container').slideUp();
    } else {
      $('.predictions-threshold-container').slideDown();
    }
  } else {
    $('.predictions-threshold-container').slideDown();
  }
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