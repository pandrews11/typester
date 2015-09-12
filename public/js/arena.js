$(function() {

  var totalSeconds;

  var socket    = io(),
  arenaReleased = false;

  function getArenaID() {
    return window.location.pathname.split('/').pop();
  }

  function correctWords() {
    return $('.well span[complete=true]').length;
  }

  function wordsAttempted() {
    return correctWords() + $('.well span[complete=false]').length
  }

  function accuracy() {
    return (correctWords() / wordsAttempted()) * 100;
  }

  function updateWPM(seconds) {
    $('.wpm').text(((correctWords() / seconds) * 60).toFixed(3));
  }

  function updateAccuracy() {
    if (!isNaN(accuracy()))
      $('.accuracy').text((accuracy()).toFixed(3) + '%');
  }

  function startArena() {
    var countDown = 5;

    var interval = setInterval(function() {
      countDown--;

      if (countDown == 0) {
        clearInterval(interval);
        arenaReleased = true;

        $('#starting-in').text('Go!');
        $('#time-remaining').countdown(finished);
      } else {
        $('#starting-in').text('Game will start in ' + countDown);
      }
    }, 1000);
  }

  $('.typing-area').keydown(function(e) {
    if (arenaReleased === false)
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
      });
    }
  });

  socket.emit('join', {
    arenaID: getArenaID()
  });

  socket.on('beginCountdown', function(data) {
    if (data.arenaID == getArenaID()) {
      $('.well').spanify();
      startArena();
    }
  });


  $.fn.countdown = function(finished) {
    var start = $(this).text().split(':');

    totalSeconds = moment(0)
      .minutes(parseInt(start[0])).seconds(parseInt(start[1])).unix();

    var elapsedSeconds = totalSeconds;
    var $time = $(this);

    var updateInterval = setInterval(function() {
      elapsedSeconds--;
      updateWPM(totalSeconds - elapsedSeconds);
      updateAccuracy();

      $time.text(
        moment(0).seconds(elapsedSeconds).format('mm:ss')
      );

      if (elapsedSeconds == 0) {
        clearInterval(updateInterval);
        finished();
      }

    }, 1000);
  }

  function populateResults() {
    $('#results-modal #time-played').val(
      moment(0).seconds(totalSeconds).format('mm:ss')
    );

    $('#results-modal #wpm').val($('.wpm').text());
    $('#results-modal #accuracy').val($('.accuracy').text());
  }

  function getResultsJSON() {
    return {
      correctWords: correctWords(),
      wordsAttempted: wordsAttempted(),
      secondsPlayed: totalSeconds
    }
  }

  var finished = function(){
    $('#starting-in').text("Time's up!");

    $('.typing-area').attr('disabled', true);
    $('#results-modal').modal('show');

    populateResults();

    $.ajax({
      url: '/users/' + $('.username').text() + '/updateFromResults',
      dataType: 'json',
      method: 'put',
      data: getResultsJSON()
    });
    return;
  }

  $('#results-modal').on('hidden.bs.modal', function() {
    socket.emit('gameover', {
      arenaID: getArenaID()
    });

    window.location.replace(window.location.origin);
  });
});
