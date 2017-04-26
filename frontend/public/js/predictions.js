$(function() {

  heatmap('/heatmap', '#heatmap');
  table('/table-columns', '/table-data', '#table');
  updateROCVega('.roc-container');
  updatePRVega('.pr-container');

  $(document).on('change', 'select.color-scheme', function(event){
    var scale = event.target.value;
    updateColorScale(scale);
  });

  $(document).on('input', 'input.threshold', function(event) {
    var t = event.target.value;
    $('.predictions-threshold-value').html(t);
    THRESHOLD = t;

    // update scale
    BINARY_SCALE = d3.scale.threshold()
      .domain([THRESHOLD])
      .range(["#D9E0E8", "#2c3e50"]);

    CORRECTNESS_SCALE_GT1 = d3.scale.linear()
      .domain([0, Math.min(Math.max(THRESHOLD, 0.001), 0.999), 1])
      .range([d3.rgb("#e74c3c"), "white", d3.rgb('#2ecc71')]);

    CORRECTNESS_SCALE_GT0 = d3.scale.linear()
      .domain([0, Math.min(Math.max(THRESHOLD, 0.001), 0.999), 1])
      .range([d3.rgb("#2ecc71"), "white", d3.rgb('#e74c3c')]);

    SCALES["BINARY_SCALE"] = BINARY_SCALE;
    SCALES["CORRECTNESS_SCALE_GT0"] = CORRECTNESS_SCALE_GT0;
    SCALES["CORRECTNESS_SCALE_GT1"] = CORRECTNESS_SCALE_GT1;

    // update matrix if necessary
    var scheme = $('select.color-scheme').val();
    if (scheme == "BINARY_SCALE" || scheme == "CORRECTNESS_SCALE") {
      updateColorScale(scheme);
    }

    updateConfusionMatrices();
  });

  $(document).on('click', '.example-container-close', function() {
    removeExample($($(this).parent()).data('id'));
  });

});