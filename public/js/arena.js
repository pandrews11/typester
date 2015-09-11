$(function() {

  socket.on('push', function(data) {
    console.log(data);
  });

  $.fn.countdown = function() {
    var start = $(this).text().split(':');
    var minutes = parseInt(start[0]);
    var seconds = parseInt(start[1]);

    var $time = $(this);

    var updateInterval = setInterval(function() {
      seconds--;
      socket.emit('arena-update', {
        data: 'test'
      });

      if (seconds <= 0) {
        seconds = 59;
        if (minutes <= 0) {
          clearInterval(updateInterval);
          // finishCB();
          return
        }

        if (minutes > 0) {
          minutes--;
        }
      }
      $time.text(String(minutes) + ':' + String(seconds));
    }, 1000);
  }

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
      $('#starting-in').text('Go!');
      clearInterval(interval);
      $('#time-remaining').countdown();
    } else {
      $('#starting-in').text('Game will start in ' + counter);
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
