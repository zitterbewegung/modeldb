var DATA_PLOT_POINTS = {};
var DATA_PLOT_WIDTH = 0;

function addDataPlot(id, selector) {
  addDataPlotPoints(id);
  updateDataPlotVega(selector);
}

function removeDataPlot(id, selector) {
  removeDataPlotPoints(id);
  updateDataPlotVega(selector);
};

function addDataPlotPoints(id) {
  var rows = {};

  for (var i=0; i<MATRIX_NUMROWS; i++) {
    d3.select(".heatmap .r" + i).filter(function(ce) {
      var row = jQuery.extend({}, RAW_DATA[ce.id]);
      var row_id = row['id'];

      for (key in row) {
        row[key] = parseFloat(row[key]);
      }

      // manually delete some keys
      delete row['id'];
      delete row['EmployeeNumber'];

      rows[row_id] = row;
    });
  }

  var normalized = getNormalizedExample(rows, id);
  DATA_PLOT_WIDTH = Object.keys(normalized).length * 30;

  var points = [];
  for (var key in normalized) {
    points.push({
      'x': key,
      'y': normalized[key],
      'label': rows[id][key],
      'example': id
    });
  }

  DATA_PLOT_POINTS[id] = points;
}

function removeDataPlotPoints(id) {
  delete DATA_PLOT_POINTS[id];
};

function updateDataPlotVega(selector) {
  var specs = {
    "width": DATA_PLOT_WIDTH,
    "height": 400,
    "data": [
      {
        "name": "table",
        "values": [].concat.apply([], Object.values(DATA_PLOT_POINTS))
      }
    ],
    "scales": [
      {
        "name": "x",
        "type": "ordinal",
        "domain": {"data": "table", "field": "x"},
        "range": "width",
        "points": true
      },
      {
        "name": "y",
        "type": "linear",
        "range": "height",
        "domain": [0, 1]
      },
      {
        "name": "color",
        "type": "ordinal",
        "domain": {"data": "table", "field": "example"},
        "range": "category10"
      }
    ],
    "axes": [
      {
        "type": "x",
        "scale": "x",
        "title": "Feature",
        "grid": true,
        "properties": {
          "labels": {
            "angle": {"value": -90},
            "align": {"value": "right"},
            "dx": {"value": -10},
            "dy": {"value": -7}
          }
        }
      },
      {"type": "y", "scale": "y", "title": "Scaled Value", "grid": true}
    ],

    "legends": [
        {
          "fill": "color",
          "title": "Example",
          "orient": "left",
          "properties": {
            "symbols": {
              "fillOpacity": {"value": 0.5},
              "stroke": {"value": "transparent"}
            }
          }
        }
    ],
    "marks": [
      {
        "type": "group",
        "from": {
          "data": "table",
          "transform": [{"type": "facet", "groupby": ["example"]}]
        },
        "marks": [
          {
            "type": "symbol",
            "properties": {
              "enter": {
                "x": {"scale": "x", "field": "x"},
                "y": {"scale": "y", "field": "y"},
                "stroke": {"scale": "color", "field": "example"},
                "strokeWidth": {"value": 1},
                "size": 10
              }
            }
          }
          /*
          {
            "type": "line",
            "properties": {
              "enter": {
                "x": {"scale": "x", "field": "x"},
                "y": {"scale": "y", "field": "y"},
                "stroke": {"scale": "color", "field": "example"},
                "strokeWidth": {"value": 1}
              }
            }
          }
          */
        ]
      }
    ]
  }

  vg.embed(selector, specs, function(error, result) {
    //$(selector).append($('<div class="roc-title">ROC</div>'));
    console.log(error);
    console.log(result);
  });
}