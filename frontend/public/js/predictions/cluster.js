function hcluster_pred() {
  var rows = {};
  var sortedRows = {};
  var inorderRows = [];

  // cluster on prediction space
  for (var i=0; i<MATRIX_NUMROWS; i++) {
    var row = [];
    d3.selectAll(".heatmap .cr" + (i))
     .filter(function(ce){
        row.push(ce.value);
      })
    ;
    rows[i] = row;
  }

  // cluster
  var node = clusterfck.hcluster(Object.values(rows));

  // traverse tree to get order
  traverse(node, inorderRows);
  for (var id in rows) {
    sortedRows[id] = inorderRows.indexOf(rows[id]);
  }

  var svg = d3.select('.heatmap .heatmap-svg');
  var t = svg.transition().duration(1000 - 5*(MATRIX_NUMROWS + MATRIX_NUMCOLS));
  animateRows(sortedRows, t);

  // cluster columns
  var cols = {};
  var sortedCols = {};
  var inorderCols = [];

  for (var i=1; i<MATRIX_NUMCOLS; i++) {
    var col = [];
    d3.selectAll(".heatmap .cc" + (i))
     .filter(function(ce){
        col.push(ce.value);
      })
    ;
    cols[i] = col;
  }

  // cluster
  var node = clusterfck.hcluster(Object.values(cols));

  // traverse tree to get order
  traverse(node, inorderCols);
  for (var id in cols) {
    sortedCols[id] = inorderCols.indexOf(cols[id]) + 1;
  }

  animateCols(sortedCols, t);

}

function hcluster_data() {
  var rows = {};
  var sortedRows = {};
  var inorderRows = [];

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

  // cluster
  var node = clusterfck.hcluster(Object.values(rows));

  // traverse tree to get order
  traverse(node, inorderRows);
  for (var id in rows) {
    sortedRows[id] = inorderRows.indexOf(rows[id]);
  }

  var svg = d3.select('.heatmap .heatmap-svg');
  var t = svg.transition().duration(1000 - 5*(MATRIX_NUMROWS + MATRIX_NUMCOLS));
  animateRows(sortedRows, t);
}

function kmeans_pred(k) {
  var rows = {};
  var sortedRows = {};
  var vals = [];

  // collect vectors
  for (var i=0; i<MATRIX_NUMROWS; i++) {
    var row = [];
    d3.selectAll(".heatmap .cr" + (i))
     .filter(function(ce){
        row.push(ce.value);
      })
    ;
    rows[row] = i;
    vals.push(row);
  }

  var counter = 0;
  var clusters = clusterfck.kmeans(vals, k);

  for (var i=0; i<clusters.length; i++) {
    for (var j=0; j<clusters[i].length; j++) {
      sortedRows[rows[clusters[i][j]]] = counter++;
    }
  }

  // animate changes
  var svg = d3.select('.heatmap .heatmap-svg');
  var t = svg.transition().duration(1000 - 5*(MATRIX_NUMROWS + MATRIX_NUMCOLS));
  animateRows(sortedRows, t);

}

// inorder traversal of hcluster tree
function traverse(node, result) {
  if (node == null) {
    return;
  }

  traverse(node.left, result);
  if (node.left == null && node.right == null) {
    result.push(node.value);
  }
  traverse(node.right, result);
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

function animateCols(sortedCols, t) {
  t.selectAll(".cell:not(.cc0)")
    .attr("x", function(d) { return CELL_SIZE_Y + (sortedCols[COLS[d.x].index] - 1) * CELL_SIZE_X + GT_OFFSET; })
    ;
  t.selectAll(".colLabel:not(.c0)")
    .attr("y", function (d, i) { return sortedCols[d.index] * CELL_SIZE_X + GT_OFFSET; })
    ;
  t.selectAll(".hl-col")
    .attr("x", function(d) { return CELL_SIZE_Y + (sortedCols[d.index] - 1) * CELL_SIZE_X + GT_OFFSET;})
    ;
}

function animateRows(sortedRows, t) {
  // animate changes
  t.selectAll(".cell")
    .attr("y", function(d) { return sortedRows[ROWS[d.y].index] * CELL_SIZE_Y; })
    ;
  t.selectAll(".rowLabel")
    .attr("y", function (d, i) { return sortedRows[d.index] * CELL_SIZE_Y; })
    ;
  t.selectAll(".hl-row")
    .attr("y", function(d) { return sortedRows[d.index] * CELL_SIZE_Y; })
    ;
}
