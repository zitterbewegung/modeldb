var addPipeline = function(src, selector) {

  $.get(src, function(response) {
    var container = $('<div class="pipeline-container"></div>')
    var model = response.model;


    //model label
    var modelLabel = $('<div class="pipeline-model-label">Model ' + model + '</div>');
    container.append(modelLabel);

    // stages and transitions
    for (var i=0; i<response.stages.length; i++) {
      var stage = $('<div class="pipeline-stage"></div>');
      stage.html(response.stages[i].title);
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

    container.data('id', model);
    $(selector).append(container);
  });

};

$(document).on('click', '.pipeline-stage', function(event) {
  var elt = $(event.target);
  console.log(elt);
  var selected = elt.hasClass('selected');

  $('.pipeline-stage').removeClass('selected');
  if (!selected) { // selecting new stage
    elt.addClass('selected');
    // TODO: make this load appropriate table
  } else { // unselecting stage

    // TODO: make this hide the table
  }
});