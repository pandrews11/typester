$(function() {
  $.fn.spanify = function() {
    $(this).each(function(el) {
      var $well = $(this),
           text = $(this).text().split(' ');

      $well.empty();
      $.each(text, function(i, v) {
        $well.append($("<span>").attr('data-word', i).text(v + ' '))
      });
    })
  }

  $('.well').spanify();

  var released = false;
  var counter = 5;

  var interval = setInterval(function() {
    counter--;

    if (counter == 0) {
      released = true;
      $('#starting-in').val('Go!');
      clearInterval(interval);
    } else {
      $('#starting-in').val('Game will start in ' + counter);
    }
  }, 1000);

  $('.typing-area').keydown(function(e) {
    if (released === false)
      return false;

    if (e.keyCode == 32 || e.keyCode == 8) {
      var typedText = $('.typing-area').val().split(' ');

      $.each(typedText, function(i, v) {
        if ( v == $('.well span[data-word=' + i + ']').text().trim() ) {
          $('.well span[data-word=' + i + ']')
            .css('color', 'lightgreen');
        } else {
          $('.well span[data-word=' + i + ']')
            .css('color', 'black');
        }
      })
    }
  })


});
