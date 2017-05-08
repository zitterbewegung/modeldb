function getStandardDeviations(rows) {
  var vals = {};
  for (row in rows) {
    for (key in rows[row]) {
      if (vals.hasOwnProperty(key)) {
        vals[key].push(rows[row][key]);
      } else {
        vals[key] = [rows[row][key]];
      }
    }
  }

  for (val in vals) {
    vals[val] = math.std(vals[val]);
  }
  return vals;
}

function getMeans(rows) {
  var vals = {};
  for (row in rows) {
    for (key in rows[row]) {
      if (vals.hasOwnProperty(key)) {
        vals[key].push(rows[row][key]);
      } else {
        vals[key] = [rows[row][key]];
      }
    }
  }

  for (val in vals) {
    vals[val] = math.mean(vals[val]);
  }
  return vals;
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

// min-max normalization
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

// z-score standardization
function standardizeRows(rows) {
  var means = getMeans(rows);
  var stds = getStandardDeviations(rows);

  for (id in rows) {
    var row = rows[id];
    var arr = [];

    for (x in row) {
      if (stds[x] == 0) {
        arr.push(0);
      } else {
        arr.push((row[x] - means[x]) / stds[x]);
      }
    }

    rows[id] = arr;
  }
}