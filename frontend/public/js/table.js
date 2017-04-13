var table = function(colSrc, dataSrc, selector) {
  $.get(colSrc, function(response) {
    var dt = $(selector).DataTable({
      "autoWidth": false,
      "ajax": {
        url: dataSrc,
        dataSrc: ''
      },
      "columns": response
    });

    // wrap table for overflow scroll
    $(selector).wrap($('<div class="table-scroll-wrapper"></div>'));

    // add icon to show column toggles
    $('#table_filter').append($('<img class="table-sliders-icon" src="/images/sliders.png">'));

    // add column toggles
    var columnsContainer = $('<div class="columns-container"></div>');
    for (var i=0; i<response.length; i++) {
      var title = response[i].title;
      var col = $('<div class="column-checkbox"></div>');
      col.append($('<div class="rkmd-checkbox checkbox-ripple">' +
      '<label class="input-checkbox checkbox-lightBlue">' +
      '<input type="checkbox" id="checkbox-' + title + '" checked data-id="' + i + '">' +
      '<span class="checkbox"></span>' +
      '</label>' +
      '<label for="checkbox-' + title + '" class="label">' + title + '</label>'));

      columnsContainer.append(col);
    }
    columnsContainer.insertBefore('.table-scroll-wrapper');
    $('.checkbox-ripple').rkmd_checkboxRipple();

    // figure out column widths
    var maxWidth = 0;
    var cols = $('.column-checkbox');
    for (var i=0; i<cols.length; i++) {
      var width = $(cols[i]).width();
      maxWidth = Math.max(maxWidth, width);
    }
    $('.column-checkbox').css('width', maxWidth);

    // handlers
    $(document).on('click', '.table-sliders-icon', function() {
      $('.columns-container').slideToggle();
    });

    $(document).on('change', '.column-checkbox input', function(event) {
      var checked = event.target.checked;
      var column = dt.column($(event.target).data('id'));
      column.visible(checked);
    });
  });

};

(function($) {

  $.fn.rkmd_checkboxRipple = function() {
    console.log('test');
    var self, checkbox, ripple, size, rippleX, rippleY, eWidth, eHeight;
    self = this;
    checkbox = self.find('.input-checkbox');

    checkbox.on('mousedown', function(e) {
      if(e.button === 2) {
        return false;
      }

      if($(this).find('.ripple').length === 0) {
        $(this).append('<span class="ripple"></span>');
      }
      ripple = $(this).find('.ripple');

      eWidth = $(this).outerWidth();
      eHeight = $(this).outerHeight();
      size = Math.max(eWidth, eHeight);
      ripple.css({'width': size, 'height': size});
      ripple.addClass('animated');

      $(this).on('mouseup', function() {
        setTimeout(function () {
          ripple.removeClass('animated');
        }, 200);
      });

    });
  }

}(jQuery));
