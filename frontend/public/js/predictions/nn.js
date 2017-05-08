function nn(id, k, select) {
  var rows = {};
  // cluster based on raw data space
  for (var i=0; i<MATRIX_NUMROWS; i++) {
    d3.select(".heatmap .r" + i).filter(function(ce) {
      var row = jQuery.extend({}, RAW_DATA[ce.id]);
      for (key in row) {
        row[key] = parseFloat(row[key]);
      }

      // manually delete some keys
      delete row['id'];
      delete row['EmployeeNumber'];

      rows[i] = row;
    });
  }
  normalizeRows(rows);

  var example = rows[id];

  for (var i in rows) {
    rows[i] = dist(example, rows[i]);
  }

  var sortable = [];
  for (var row in rows) {
    sortable.push([row, rows[row]]);
  }

  sortable.sort(function(a, b) {
      return a[1] - b[1];
  });

  sortable.shift();

  var neighbors = sortable.slice(0, k);

  // highlight self
  var gt = d3.select('.heatmap .gt' + id).classed('gt-hover', true);
  if (select) {
    gt.classed("gt-selected", true);
  }

  // highlight neighbors
  for (var i=0; i<neighbors.length; i++) {
    var nn_hover = d3.select('.heatmap .gt' + neighbors[i][0])
      .classed("nn-hover",true);

    if (select) {
      nn_hover.classed("nn-hover-selected", true);
    }
  }

  var lineGenerator = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate("basis");

  for (var i=0; i<neighbors.length; i++) {
    var curveData = [];
    var n_id = neighbors[i][0];

    var x1 = parseFloat(d3.select('.heatmap .gt' + id).attr('x')) + CELL_SIZE_Y / 2;
    var y1 = parseFloat(d3.select('.heatmap .gt' + id).attr('y')) + CELL_SIZE_Y / 2;

    var x2 = parseFloat(d3.select('.heatmap .gt' + n_id).attr('x'))+ CELL_SIZE_Y / 2;
    var y2 = parseFloat(d3.select('.heatmap .gt' + n_id).attr('y')) + CELL_SIZE_Y / 2;

    curveData.push({
      'x': x1,
      'y': y1
    });

    curveData.push({
      'x': (x1 + x2)/2 - 70,
      'y': (y1 + y2)/2
    });

    curveData.push({
      'x': x2,
      'y': y2
    });

    var pathData = lineGenerator(curveData);

    var path = d3.select('.heatmap .paths')
      .append('path')
      .attr('d', pathData)
      .attr("class","path")
      .attr('stroke', '#555')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '10, 5')
      .attr('fill', 'none');

    if (select) {
      path.classed("path-selected", select)
    }
  }
}

function dist(a, b) {
  var sum = 0;
  for (var i=0; i<a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  return Math.pow(sum, 0.5);
}

function getMinValues(rows) {
  var vals = {};
  for (row in rows) {
    for (key in rows[row]) {
      if (vals.hasOwnProperty(key)) {
        vals[key] = Math.min(vals[key], rows[row][key]);
      } else {
        vals[key] = rows[row][key];
      }
    }
  }
  return vals;
}

function getMaxValues(rows) {
  var vals = {};
  for (row in rows) {
    for (key in rows[row]) {
      if (vals.hasOwnProperty(key)) {
        vals[key] = Math.max(vals[key], rows[row][key]);
      } else {
        vals[key] = rows[row][key];
      }
    }
  }
  return vals;
}

function normalizeRows(rows) {
  var minValues = getMinValues(rows);
  var maxValues = getMaxValues(rows);

  for (id in rows) {
    var row = rows[id];
    var arr = [];
    for (x in row) {
      if (maxValues[x] == minValues[x]) {
        arr.push(0.5);
      } else {
        arr.push((row[x] - minValues[x]) / (maxValues[x] - minValues[x]));
      }
    }
    rows[id] = arr;
  }
}

function nnRedraw() {
  d3.selectAll('.heatmap .path').remove();
  setTimeout(function() {
    d3.selectAll('.heatmap .gt-selected').classed('gt-selected', false);
    d3.selectAll('.heatmap .nn-hover-selected').classed('nn-hover-selected', false);
    nn(SELECTED_NN, 3, true);
  }, 1000)
}
