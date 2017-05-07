// for functions dealing with example raw data

$(function() {

  var id = $('body').data('id');

  // fetch columns
  $.get('/projects/' + id + '/predictions/columns', function(response) {
    TABLE_COLUMNS = response;

    // store columns
    for (var i=0; i<response.length; i++) {
      RAW_DATA_KEYS[response[i].title] = true;
    }

    for (var i=0; i<response.length; i++) {
      var option = $('<option value="' + response[i].title + '">' + response[i].title + '</option>');
      $('.examples-group-by select').append(option);
    }

    // fetch example data
    $.get('/projects/' + id + '/predictions/examples', function(response) {
      for (var i=0; i<response.length; i++) {
        RAW_DATA[response[i].id] = response[i];
      }
      SHOW_RATIO = 50/response.length;

      table(TABLE_COLUMNS, Object.values(RAW_DATA), '#table');
    });
  });


  // handlers
  $(document).on('click', '.add-filter-group-btn', function() {
    var html = new EJS({url: '/ejs/filter-group.ejs'}).render({"keys": Object.keys(RAW_DATA_KEYS)});
    $('.filter-groups-container').append($(html));
    $('.filter-groups-container').find('.filter-group:last').slideDown();
  });

  $(document).on('click', '.filter-group-close', function() {
    var elt = $(this).closest('.filter-group');
    elt.slideUp("normal", function() { $(this).remove(); } );
  });

  $(document).on('click', '.example-filter-add', function() {
    var elt = $(this);
    if (elt.hasClass('last')) {
      var filter = elt.closest('.example-filter').clone();
      filter.find('input').val('');
      elt.closest('.filter-group').append(filter);

      elt.html("-");
      elt.removeClass('last');
    } else {
      elt.closest('.example-filter').remove();
    }
  });

  $(document).on('click', '.filter-btn', function() {
    generateFilterGroups();
  });

  $(document).on('change', '.examples-group-by select', function(e) {
    var key = e.target.value;
    if (key == "None") {
      hideAggregateHeatmap();
      showAllExamples();
    } else {
      generateGroupsForKey(key);
    }
  });

  $(document).on('click', '#radio-random', function() {
    if (this.checked) {
      $('.example-filter-groups').slideUp();
      $('.examples-group-by').slideUp();
      hideAggregateHeatmap();
      showAllExamples();
    }
  });

  $(document).on('change', '#radio-filter', function() {
    if (this.checked) {
      $('.example-filter-groups').slideDown();
      $('.examples-group-by').slideUp();
    }
  });

  $(document).on('change', '#radio-group', function() {
    if (this.checked) {
      $('.example-filter-groups').slideUp();
      $('.examples-group-by').slideDown();
    }
  });
});

var calculateAggregateDataAvg = function() {
  var data = [];
  for (var key in GROUPS) {
    if (GROUPS.hasOwnProperty(key)) {
      var examples = GROUPS[key];

      // go through each model and calculate average
      for (var col in COLS) {
        if (COLS.hasOwnProperty(col)) {
          var total = 0;

          for (var i=0; i<examples.length; i++) {
            total += MATRIX_OBJ[COLS[col].id][examples[i]];
          }

          data.push({
            'x': COLS[col].id,
            'y': key,
            'value': total/examples.length
          })
        }
      }

    }
  }

  return data;
}

var calculateAggregateDataAcc = function() {
  var data = [];
  for (var key in GROUPS) {
    if (GROUPS.hasOwnProperty(key)) {
      var examples = GROUPS[key];

      // go through each model and calculate average
      for (var col in COLS) {
        if (COLS.hasOwnProperty(col)) {
          var total = 0;

          for (var i=0; i<examples.length; i++) {
            if (col == 'GT') {
              // calculate average value
              total += MATRIX_OBJ[COLS[col].id][examples[i]];
            } else {
              // calculate accuracy
              var GT = MATRIX_OBJ['GT'][examples[i]] > 0.5;
              var prediction = MATRIX_OBJ[COLS[col].id][examples[i]] > THRESHOLD;
              if (GT == prediction) {
                total += 1
              }
            }
          }

          obj = {
            'x': COLS[col].id,
            'y': key,
            'value': total/examples.length
          };

          if (col == 'GT') {
            obj['pos'] = total;
            obj['neg'] = examples.length - total;
          }

          data.push(obj);
        }
      }

    }
  }

  return data;
}

var aggregateHeatmap = function() {
  var c = 0;
  if ($.isEmptyObject(GROUPS)) {
    if ($('.agg-heatmap .heatmap-svg').length > 0) {
      hideAggregateHeatmap();
      showAllExamples();
    }
    return;
  }

  AGG_ROWS = {};
  for (var key in GROUPS) {
    if (GROUPS.hasOwnProperty(key)) {
      AGG_ROWS[key] = {
        'id': key,
        'show': true,
        'index': c++
      }
    }
  }

  AGG_DATA = calculateAggregateDataAcc();
  drawAggregateHeatmap('.agg-heatmap', AGG_ROWS, COLS, AGG_DATA);
  SELECTED_GROUP = null;
}

// group is JSON object where the key/value pairs
// define a group of filters on the raw data examples
var getExamplesInGroup = function(group) {
  var exampleIDs = Object.keys(RAW_DATA);
  var examples = {};
  for (var i=0; i<exampleIDs.length; i++) {
    // initialize all examples to true
    examples[exampleIDs[i]] = true;
  }

  // go through each filter of the filter group
  for (f in group) {
    if (group.hasOwnProperty(f)) {

      // go through each example and see if filter is met
      for (ex in examples) {
        if (examples.hasOwnProperty(ex)) {
          if (RAW_DATA[ex][f] != group[f]) {
            examples[ex] = false;
          }
        }
      } // end loop over examples

    }
  } // end loop over group

  var filtered = [];
  for (ex in examples) {
    if (examples.hasOwnProperty(ex)) {
      if (examples[ex]) {
        filtered.push(ex);
      }
    }
  }

  return filtered;
}

var generateFilterGroups = function() {
  var counter = 0;
  var groups = $('.filter-group');

  var result = {};

  // go through groups
  for (var i=0; i<groups.length; i++) {

    var g = {};
    var group = $(groups[i]);

    // fetch name or use default name
    var name = group.find('.filter-group-name').val();
    if (name.length == 0) {
      name = "filter_group_" + counter;
      counter += 1;
    }

    // go through filters
    var filters = group.find('.example-filter');
    var numFilters = 0;
    for (var j=0; j<filters.length; j++) {
      var filter = $(filters[j]);
      var key = filter.find('.example-filter-key').val();
      var val = filter.find('.example-filter-val').val();
      if (key != null && val.length > 0) {
        g[key] = val;
        numFilters += 1;
      }
    }

    // add group
    if (numFilters > 0) {
      result[name] = g;
    }
  }

  FILTER_GROUPS = result;
  GROUPS = {};

  // go through each filter group
  for (var key in result) {
    if (result.hasOwnProperty(key)) {
      var group = result[key];

      GROUPS[key] = getExamplesInGroup(group);

    } // end loop over result
  }

  aggregateHeatmap();
}

function generateGroupsForKey(key) {
  FILTER_GROUPS = {};
  GROUPS = {};
  for (var d in RAW_DATA) {
    var val = RAW_DATA[d][key];
    FILTER_GROUPS[key + ": " + val] = {};
    FILTER_GROUPS[key + ": " + val][key] = val;
  }

  // go through each filter group
  for (var key in FILTER_GROUPS) {
    if (FILTER_GROUPS.hasOwnProperty(key)) {
      var group = FILTER_GROUPS[key];

      GROUPS[key] = getExamplesInGroup(group);

    } // end loop over result
  }

  aggregateHeatmap();
};

function hideAggregateHeatmap() {
  GROUPS = {};
  $('.agg-heatmap .heatmap-svg').remove();
}

function showAllExamples() {
  for (var key in ROWS) {
    if (ROWS.hasOwnProperty(key)) {
      ROWS[key].show = Math.random() < SHOW_RATIO;
    }
  }
  drawHeatmap('.heatmap', ROWS, COLS, MATRIX_DATA);
  var scheme = $('select.color-scheme').val();
  updateColorScale(scheme);
  unfilterTable();

  // unselect all models
  for (var model in SELECTED_MODELS) {
    toggleModel(model);
  }
}

function showFilteredExamples(group) {
  var examples = GROUPS[group];
  for (var key in ROWS) {
    if (examples.indexOf(ROWS[key].id + '') < 0) {
      ROWS[key].show = false;
    } else {
      ROWS[key].show = true;
    }
  }
  drawHeatmap('.heatmap', ROWS, COLS, MATRIX_DATA);
  var scheme = $('select.color-scheme').val();
  updateColorScale(scheme);
  filterTable();

  // unselect all models
  for (var model in SELECTED_MODELS) {
    toggleModel(model);
  }
}