// for functions dealing with example raw data

$(function() {

  // fetch columns
  $.get('/table-columns', function(response) {
    TABLE_COLUMNS = response;
    TABLE_COLUMNS.unshift({'data': 'id', 'title': 'id'});

    // store columns
    for (var i=0; i<response.length; i++) {
      RAW_DATA_KEYS[response[i].title] = true;
    }

    // fetch example data
    $.get('/examples', function(response) {
      for (var i=0; i<response.length; i++) {
        RAW_DATA[response[i].id] = response[i];
      }

    table(TABLE_COLUMNS, Object.values(RAW_DATA), '#table');
    });
  });


  // handlers
  $(document).on('click', '.add-filter-group', function() {
    var html = new EJS({url: '/ejs/filter-group.ejs'}).render({"keys": Object.keys(RAW_DATA_KEYS)});
    $('.filter-groups-container').append($(html));
  });

  $(document).on('click', '.filter-group-close', function() {
    var elt = $(this).closest('.filter-group');
    elt.remove();
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
});

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

      // apply filters to examples
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

      GROUPS[key] = filtered;

    } // end loop over result
  }
}