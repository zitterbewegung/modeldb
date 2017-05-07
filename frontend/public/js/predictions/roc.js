var ROC_POINTS = {};

var addROC = function(model, selector, col) {
  addROCPoints(model, col);
  updateROCVega(selector);
};

var removeROC = function(model, selector) {
  removeROCPoints(model);
  updateROCVega(selector);
};

var addROCPoints = function(model, col) {
  var name;
  if (jQuery.isEmptyObject(MODELS)) {
    name = model;
  } else {
    name = MODELS[model].specification.transformerType + ' (id: ' + MODELS[model].id + ')';
  }

  var points = []

  for (var t=0; t<=1; t+= STEP_SIZE) {
    var vals = countExamplesForThreshold(col, t);
    var TPR = vals['TP'] / (vals['TP'] + vals['FN']);
    var FPR = vals['FP'] / (vals['FP'] + vals['TN']);

    points.push({
      'x': FPR,
      'y': TPR,
      'model': name
    });
  }

  ROC_POINTS[model] = points;
};

var removeROCPoints = function(model) {
  delete ROC_POINTS[model];
};

var updateROCVega = function(selector) {
  var specs = {
    "width": 350,
    "height": 200,
    "data": [
      {
        "name": "roc",
        "values": [].concat.apply([], Object.values(ROC_POINTS))
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
        "domain": {"data": "roc", "field": "model"},
        "range": "category10"
      }
    ],
    "axes": [
      {"type": "x", "scale": "x", "tickSizeEnd": 0, "title": "False Positive"},
      {"type": "y", "scale": "y", "title": "True Positive"}
    ],

    "legends": [
        {
          "fill": "color",
          "title": "Model",
          "offset": -70,
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
          "data": "roc",
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
    $(selector).append($('<div class="roc-title">ROC</div>'));
    if (Object.keys(ROC_POINTS).length == 0) {
      $(selector).append($('<div class="roc-placeholder">SELECT A MODEL</div>'));
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
  d3.selectAll('.heatmap .cc' + col)
    .filter(function(d){

      // get ground truth
      d3.select('.heatmap .cc' + 0 + '.cr' + ROWS[d.y].index)
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