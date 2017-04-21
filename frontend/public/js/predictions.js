$(function() {

  heatmap('/heatmap', '#chart');
  table('/table-columns', '/table-data', '#table');


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
    SCALES["BINARY_SCALE"] = BINARY_SCALE;

    // update matrix if necessary
    var scheme = $('select.color-scheme').val();
    if (scheme == "BINARY_SCALE") {
      updateColorScale(scheme);
    }
  });

});