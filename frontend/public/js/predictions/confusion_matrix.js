var addConfusionMatrix = function(model, selector, col) {
  var THRESHOLD = 0.5;

  var count = 0;
  var vals = {
    'TP': 0,
    'TN': 0,
    'FP': 0,
    'FN': 0
  };


  var container = $('<div class="confusion-matrix-container"></div>');
  var matrix = $('<div class="confusion-matrix"></div>');

  var predictedLabel = $('<div class="cfm-predicted-label">Predicted</div>');
  var actualLabel = $('<div class="cfm-actual-label">Actual</div>');
  var modelLabel = $('<div class="cfm-model-label">Model ' + model + '</div>');

  var p0 = $('<div class="cfm-p0">0</div>');
  var p1 = $('<div class="cfm-p1">1</div>');
  var a0 = $('<div class="cfm-a0">0</div>');
  var a1 = $('<div class="cfm-a1">1</div>');

  matrix.append(predictedLabel);
  matrix.append(actualLabel);
  matrix.append(modelLabel);
  matrix.append(p0);
  matrix.append(p1);
  matrix.append(a0);
  matrix.append(a1);

  // go through examples for selected model
  d3.selectAll('.cc' + col)
    .filter(function(d){

      // get ground truth
      d3.select('.cc' + 0 + '.cr' + d.y)
        .filter(function (e, i) {
          var GT = e.value;

          if (d.value < THRESHOLD && e.value == 0) {
            vals['TN'] += 1;
          } else if (d.value > THRESHOLD && e.value ==1) {
            vals['TP'] += 1;
          } else if (d.value < THRESHOLD && e.value == 1) {
            vals['FN'] += 1;
          } else if (d.value > THRESHOLD && e.value == 0) {
            vals['FP'] += 1;
          }

          count += 1;
        });
    });

  var TP = $('<div class="cfm-cell cfm-tp"></div>');
  var FN = $('<div class="cfm-cell cfm-fn"></div>');
  var FP = $('<div class="cfm-cell cfm-fp"></div>');
  var TN = $('<div class="cfm-cell cfm-tn"></div>');

  TP.html(vals['TP']);
  FN.html(vals['FN']);
  FP.html(vals['FP']);
  TN.html(vals['TN']);

  var blueScale = d3.scale.linear()
  .domain([0, count])
  .interpolate(d3.interpolateHcl)
  .range([d3.rgb("#D9E0E8"), d3.rgb("#2c3e50")]);

  TP.css('background-color', blueScale(vals['TP']));
  FN.css('background-color', blueScale(vals['FN']));
  FP.css('background-color', blueScale(vals['FP']));
  TN.css('background-color', blueScale(vals['TN']));

  matrix.append(TP);
  matrix.append(FN);
  matrix.append(FP);
  matrix.append(TN);

  container.append(matrix);
  container.addClass('' + model);
  $(selector).append(container);


}

var removeConfusionMatrix = function(model) {
  $('.confusion-matrix-container.' + model).remove();
}