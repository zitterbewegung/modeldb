var PR_POINTS = {};

var addPR = function(model, selector, col) {
  addPRPoints(model, col);
  updatePRVega(selector);
};

var removePR = function(model, selector) {
  removePRPoints(model);
  updatePRVega(selector);
};

var addPRPoints = function(model, col) {
  var points = []

  for (var t=0; t<=1; t+= 0.01) {
    var vals = countExamplesForThreshold(col, t);
    var P = vals['TP'] / (vals['TP'] + vals['FP']);
    var R = vals['TP'] / (vals['TP'] + vals['FN']);

    points.push({
      'x': R,
      'y': P,
      'model': model
    });
  }

  PR_POINTS[model] = points;
};

var removePRPoints = function(model) {
  delete PR_POINTS[model];
};

var updatePRVega = function(selector) {
  var specs = {
    "width": 400,
    "height": 200,
    "data": [
      {
        "name": "PR",
        "values": [].concat.apply([], Object.values(PR_POINTS))
      }
    ],
    "scales": [
      {
        "name": "x",
        "range": [0, 250],
        "domain": [0, 1]
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
        "domain": {"data": "PR", "field": "model"},
        "range": "category10"
      }
    ],
    "axes": [
      {"type": "x", "scale": "x", "tickSizeEnd": 0, "title": "Recall"},
      {"type": "y", "scale": "y", "title": "Precision"}
    ],

    "legends": [
        {
          "fill": "color",
          "title": "Model",
          "offset": -120,
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
          "data": "PR",
          "transform": [{"type": "facet", "groupby": ["model"]}]
        },
        "marks": [
          {
            "type": "line",
            "properties": {
              "enter": {
                "x": {"scale": "x", "field": "x"},
                "y": {"scale": "y", "field": "y"},
                "stroke": {"scale": "color", "field": "model"},
                "strokeWidth": {"value": 2}
              }
            }
          }
        ]
      }
    ]
  }

  vg.embed(selector, specs, function(error, result) {
    console.log(error);
    console.log(result);
    $(selector).append($('<div class="pr-title">PR</div>'));
    if (Object.keys(PR_POINTS).length == 0) {
      $(selector).append($('<div class="pr-placeholder">SELECT A MODEL</div>'));
    }
  });
}

var countExamplesForThreshold = function(col, t) {
  var vals = {
    'TP': 0,
    'TN': 0,
    'FP': 0,
    'FN': 0,
    'count': 0,
  };

  // go through examples for selected model
  d3.selectAll('.cc' + col)
    .filter(function(d){

      // get ground truth
      d3.select('.cc' + 0 + '.cr' + d.y)
        .filter(function (e, i) {
          var GT = e.value;

          if (d.value < t && e.value == 0) {
            vals['TN'] += 1;
          } else if (d.value > t && e.value ==1) {
            vals['TP'] += 1;
          } else if (d.value < t && e.value == 1) {
            vals['FN'] += 1;
          } else if (d.value > t && e.value == 0) {
            vals['FP'] += 1;
          }

          vals['count'] += 1;
        });
    });

  return vals;
}