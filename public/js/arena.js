$(function() {

  // var socket = io();

  var totalTime;

  var finalTotalSeconds;

  // socket.on('push', function(data) {
  //   console.log(data);
  // });

  $.fn.countdown = function(finished) {
    totalTime = $(this).text();
    var start = $(this).text().split(':');
    var minutes = parseInt(start[0]);
    var seconds = parseInt(start[1]);

    var totalSeconds = (minutes / 60) + seconds;

    finalTotalSeconds = totalSeconds;

    var $time = $(this);

    var updateInterval = setInterval(function() {
      seconds--;
      updateWPM(totalSeconds - seconds);
      updateAccuracy();
      // socket.emit('arena-update', {
        // data: 'test'
      // });

      if (seconds <= 0) {
        seconds = 59;
        if (minutes <= 0) {
          seconds = 0;
          $time.setTime(minutes, seconds);
          clearInterval(updateInterval);
          finished();
        }

        if (minutes > 0) {
          minutes--;
        }
      }
      $time.setTime(minutes, seconds);
    }, 1000);
  }

  $.fn.setTime = function(min, sec) {
    var strMin = String(min).leftJustify(2, '0'),
        strSec = String(sec).leftJustify(2, '0');

    $(this).text(strMin + ':' + strSec);
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

  function updateWPM(seconds) {
    var correctWordCount = $('.well span[complete=true]').length;
    $('.wpm')
      .text(String((correctWordCount / seconds) * 60).split('.')[0]);
  }

  function updateAccuracy() {
    var correctCount = $('.well span[complete=true]').length;
    var totalAttempted = correctCount + ($('.well span[complete=false]').length);

    var accuracy = (correctCount / totalAttempted) * 100;

    if (isNaN(accuracy))
      accuracy = 0;
    $('.accuracy').text(String(accuracy).split('.')[0] + '%');
  }

  var finished = function(){
    $('#starting-in').text("Time's up!");

    $('.typing-area').attr('disabled', true);
    $('#results-modal').modal('show');

    $('#results-modal #time-played').val(totalTime);
    $('#results-modal #wpm').val($('.wpm').text());
    $('#results-modal #accuracy').val($('.accuracy').text());

    $.ajax({
      url: '/users/' + $('.username').text() + '/updateFromResults',
      dataType: 'json',
      method: 'put',
      data: {
        correctWords: $('.well span[complete=true]').length,
        wordsAttempted: $('.well span[complete=true]').length + $('.well span[complete=false]').length,
        secondsPlayed: finalTotalSeconds
      }
    });
    return;
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
      $('#time-remaining').countdown(finished);
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
            .attr('complete', true)
            .css('color', 'lightgreen');
        } else {
          $('.well span[data-word=' + i + ']')
            .attr('complete', false)
            .css('color', 'black');
        }
      })
    }
  })


});
