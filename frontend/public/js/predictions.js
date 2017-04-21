$(function() {

  heatmap('/heatmap', '#chart');
  table('/table-columns', '/table-data', '#table');


  $(document).on('change', 'select.color-scheme', function(event){
    var scale = event.target.value;
    updateColorScale(scale);
  });

});