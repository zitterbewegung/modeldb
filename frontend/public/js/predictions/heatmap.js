var heatmap = function(src, selector, cellSize) {

  var selectedModels = {};

  var tooltip = $('<div id="heatmap-tooltip" class="hidden"><div id="value"></div></div>');
  $('body').append(tooltip);

  var GT_OFFSET = 8;
  var margin = { top: 70, right:0, bottom:0, left: 70 },
    cellSize=12;

    //gridSize = Math.floor(width / 24),
    legendElementWidth = cellSize*2.5,
    colorBuckets = 21,
    colors = ['#005824','#1A693B','#347B53','#4F8D6B','#699F83','#83B09B','#9EC2B3','#B8D4CB','#D2E6E3','#EDF8FB','#FFFFFF','#F1EEF6','#E6D3E1','#DBB9CD','#D19EB9','#C684A4','#BB6990','#B14F7C','#A63467','#9B1A53','#91003F'];
    rows = {};
    cols = {};
    rowLabel = [];
    colLabel = [];
    selectedModel = null;

  d3.json(src,function(error, response) {
    data = response.data;
    rows = response.rows;
    cols = response.cols;
    rowLabel = Object.keys(rows);
    colLabel = Object.keys(cols);

    row_number = rowLabel.length;
    col_number = colLabel.length;
    width = cellSize*col_number + GT_OFFSET; // - margin.left - margin.right,
    height = cellSize*row_number; // - margin.top - margin.bottom,

    var blueScale = d3.scale.linear()
      .domain([0, 1])
      .interpolate(d3.interpolateHcl)
      .range([d3.rgb("#D9E0E8"), d3.rgb("#2c3e50")]);

    var colorScale = d3.scale.linear().domain([0, 0.5, 1])
      //.range(["red", "white", "green"]);
      //.interpolate(d3.interpolateHcl)
      .range([d3.rgb("#e74c3c"), "white", d3.rgb('#2ecc71')]);


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
      .attr("y", function (d, i) { return rows[d] * cellSize; })
      .style("text-anchor", "end")
      .attr("transform", "translate(-4," + cellSize / 1.1 + ")")
      .attr("class", function (d,i) { return "rowLabel mono r"+i;} )
      .on("mouseover", function(d) {d3.select(this).classed("text-hover",true);})
      .on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);})
      .on("click", function(d,i) {rowSortOrder=!rowSortOrder; sortbylabel("r",rows[d],rowSortOrder);})
      ;

    var colLabels = svg.append("g")
      .selectAll(".colLabelg")
      .data(colLabel)
      .enter()
      .append("text")
      .text(function (d) { return d; })
      .attr("x", 0)
      .attr("y", function (d, i) {
        return cols[d] * cellSize + (cols[d] == 0 ? 0 : GT_OFFSET);
      })
      .style("text-anchor", "left")
      .attr("transform", "translate("+cellSize/1.2 + ",-6) rotate (-90)")
      .attr("class",  function (d,i) { return "colLabel mono c"+cols[d];} )
      .on("mouseover", function(d) {selectedModel = d; d3.select(this).classed("text-hover",true);})
      .on("mouseout" , function(d) {selectedModel = null; d3.select(this).classed("text-hover",false);})
      //.on("click", function(d,i) {colSortOrder=!colSortOrder; sortbylabel("c",cols[d],colSortOrder);})
      ;

    var heatMap = svg.append("g").attr("class","g3")
      .selectAll(".cellg")
      .data(data,function(d){return rows[d.y]+":"+cols[d.x];})
      .enter()
      .append("rect")
      .attr("x", function(d) { return (cols[d.x]) * cellSize + (cols[d.x] == 0 ? 0 : GT_OFFSET); })
      .attr("y", function(d) { return (rows[d.y]) * cellSize; })
      .attr("class", function(d){ return "cell cell-border cr"+(rows[d.y])+" cc"+(cols[d.x]);})
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
      .attr("x", cellSize + 1)
      .attr("y", 0)
      .attr("height", height)
      .attr("width", 1)
      ;

    // sort
    function sortbylabel(rORc,i,sortOrder){
      var t = svg.transition().duration(1000 - 5*(row_number + col_number));
      var vals=[];
      var sorted; // sorted is zero-based index
      a = d3.selectAll(".c"+rORc+(i))
       .filter(function(ce){
          vals.push(ce.value);
        })
      ;
      if(rORc=="r"){
        vals.pop();
        sorted=d3.range(1, col_number).sort(function(a,b){ if(sortOrder){ return vals[b-1]-vals[a-1];}else{ return vals[a-1]-vals[b-1];}});
        sorted.unshift(cols['GT']);
        t.selectAll(".cell:not(.cc0)")
          .attr("x", function(d) { return sorted.indexOf(cols[d.x]) * cellSize + (cols[d.x] == 0 ? 0 : GT_OFFSET); })
          ;
        t.selectAll(".colLabel:not(.c0)")
          .attr("y", function (d, i) { return sorted.indexOf(cols[d]) * cellSize + (cols[d] == 0 ? 0 : GT_OFFSET); })
          ;
      } else {
        sorted=d3.range(row_number).sort(function(a,b){if(sortOrder){ return vals[b]-vals[a];}else{ return vals[a]-vals[b];}});
        t.selectAll(".cell")
          .attr("y", function(d) { return sorted.indexOf(rows[d.y]) * cellSize; })
          ;
        t.selectAll(".rowLabel")
          .attr("y", function (d, i) { return sorted.indexOf(i) * cellSize; })
          ;
      }
    }

    $('.heatmap').scrollTop(45);
    $('.heatmap').scrollLeft(45);

    var cc = clickcancel();
    colLabels.call(cc);
    cc.on('click', function(d, i) {
      colSortOrder=!colSortOrder;
      sortbylabel("c", cols[selectedModel] ,colSortOrder);
    });
    cc.on('dblclick', function(d) {
      toggleModel(selectedModel);
    });
  });

  function toggleModel(model) {
    if (model == 'GT') {
      return;
    }
    if (selectedModels[model]) {
      delete selectedModels[model];
      removeModel(model);
    } else {
      selectedModels[model] = true;
      addModel(model, cols[model]);
    }
    d3.selectAll(".cell").classed("col-selected",function(c,ci){ return selectedModels[c.x];});
  }

  function addModel(model, col) {
    if ($('.predictions-selected-models div').length == 0) {
      $('.predictions-selected-models').html('');
    }

    var div = $('<div>' + model + '</div>');
    div.addClass(model + '');
    $('.predictions-selected-models').append(div);

    addPipeline('/pipeline/' + model, '#pipelines');
    addConfusionMatrix(model, '#confusion-matrices', col);
  }

  function removeModel(model) {
    $('.predictions-selected-models div.' + model).remove();
    if ($('.predictions-selected-models div').length == 0) {
      $('.predictions-selected-models').html("Double click on a column label in the prediction matrix to select a model");
    }

    removePipeline(model);
    removeConfusionMatrix(model);
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

};