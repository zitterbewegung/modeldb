$(function() {

  heatmap('/heatmap', '#heatmap');
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
    aggregateHeatmap();
  });

  $(document).on('click', '.example-container-close', function() {
    removeExample($($(this).parent()).data('id'));
  });

  $('.tab').scroll(function(e){
    var scroll = e.target.scrollTop;
    var height = $('.heatmap-container').height();
    if (scroll + $('.examples-menu').height() < height) {
      $('.examples-menu').addClass('fixed');
      $('.examples-menu').css({
        'margin-top': '0'
      });
    } else {
      $('.examples-menu').removeClass('fixed');
      $('.examples-menu').css({
        'margin-top': (height - $('.examples-menu').height()) + 'px'
      });
    }
  });

  $(document).on('change', '.predictions-sort', function(event) {
    var type = event.target.value;
    var rORc;
    var order;

    switch(type) {
      case 'ex_inc':
        rORc = 'r';
        order = true;
        break;
      case 'ex_dec':
        rORc = 'r';
        order = false;
        break;
      case 'm_inc':
        rORc = 'c';
        order = true;
        break;
      case 'm_dec':
        rORc = 'c';
        order = false;
        break;
      default:
        return;
    }
    sortByLabel('.heatmap', rORc, !order, ROWS, COLS, MATRIX_NUMROWS, MATRIX_NUMCOLS);
  });

  $(document).on('click', '.examples-menu-close', function() {
    // hide menu
    $('.menu-icon').addClass('rotated');
    $('.examples-menu').animate({'right': '-250px'});
    $('.examples-menu').css({'margin-left': '250px'});

    // expand matrix
    $('.heatmap').css({'max-width': '100%'});
    $('.agg-heatmap').css({'max-width': '100%'});
    $('.heatmap-container').css({'width': '100%'});
  });

  $(document).on('click', '.menu-icon', function() {
    var closed = $(this).hasClass('rotated');
    var fixed = $('.examples-menu').hasClass('fixed');

    if (closed) {

      // open menu
      if (fixed) {
        $('.examples-menu').animate({'right': '0px'});
        $('.examples-menu').css({'margin-left': '0px'});
      } else {
        $('.examples-menu').animate({'margin-left': '0px'});
        $('.examples-menu').css({'right': '0px'});
      }

      // shrink matrix
      $('.heatmap-container').css({'width': '770px'});
      $('.heatmap').css({'max-width': '750px'});
      $('.agg-heatmap').css({'max-width': '750px'});
      setTimeout(function() {
        $('.heatmap').scrollLeft(45);
        $('.agg-heatmap').scrollLeft(45);
      }, 100)
    } else {

      // close menu
      if (fixed) {
        $('.examples-menu').animate({'right': '-250px'});
        $('.examples-menu').css({'margin-left': '250px'});
      } else {
        $('.examples-menu').animate({'margin-left': '250px'});
        $('.examples-menu').css({'right': '-250px'});
      }

      // expand matrix
      $('.heatmap').css({'max-width': '100%'});
      $('.agg-heatmap').css({'max-width': '100%'});
      $('.heatmap-container').css({'width': '100%'});
    }
    $(this).toggleClass('rotated');
  });

});