var pipeline = function(src, selector) {

  $.get(src, function(response) {
    console.log(response);
    var container = $('<div class="pipeline-container"></div>')
    var model = response.model;


    //model label
    var modelLabel = $('<div class="pipeline-model-label">Model ' + model + '</div>');
    container.append(modelLabel);

    // stages and transitions
    for (var i=0; i<response.stages.length; i++) {
      var stage = $('<div class="pipeline-stage"></div>');
      stage.addClass('tooltip-trigger');
      stage.data('val', response.stages[i].title);

      var transition = null;
      if (i < response.transitions.length) {
        transition = $('<div class="pipeline-transition">' +
          '<div class="pipeline-transition-tail"></div>' +
          '<div class="pipeline-transition-head"></div>' + '</div>');
        transition.addClass('tooltip-trigger');
        transition.data('val', response.transitions[i].title);
      }

      container.append(stage);
      container.append(transition);
    }

    $(selector).append(container);
  });


  $(document).on('click', '.pipeline-stage', function(event) {
    var elt = $(event.target);
    var selected = elt.hasClass('selected');

    // close all other stages and restore tooltip trigger
    $('.pipeline-stage').html('');
    $('.pipeline-stage').removeClass('selected');
    $('.pipeline-stage').addClass('tooltip-trigger');

    if (!selected) { // selecting new stage
      elt.addClass('selected');
      elt.html(elt.data('val'));

      // remove tooltip
      $('.tooltip').remove();
      elt.removeClass('tooltip-trigger');

      // TODO: make this load appropriate table
    } else { // unselecting stage
      // TODO: make this hide the table
    }

  });

};