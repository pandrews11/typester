$(function() {

  var totalSeconds;

  var socket    = io(),
  arenaReleased = false;

  var user = new User($('#user-id').val())

  // Tell the server which arena we have joined
  socket.emit('join', {
    arenaID: getArenaID()
  });

  function getArenaID() {
    return window.location.pathname.split('/').pop();
  }

  function getUserID() {
    return $('#user-id').val();
  }

  function correctWords() {
    return $('.well span[complete=true]').length;
  }

  function totalWords() {
    return correctWords() + $('.well span[complete=false]').length
  }

  function getGameStats(secondsPlayed) {
    return {
      correctWords: correctWords(),
      totalWords: totalWords(),
      secondsPlayed: secondsPlayed
    }
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

  socket.on('beginCountdown', function(data) {
    if (data.arenaID == getArenaID()) {
      $('.waiting-for-players').fadeOut('slow');
      $('.well').spanify();
      startArena();
      getUsersTable();
    }
  });


  $.fn.countdown = function(finished) {
    initializeStatusVisualization();

    var start = $(this).text().split(':');

    totalSeconds = moment(0)
      .minutes(parseInt(start[0])).seconds(parseInt(start[1])).unix();

    var elapsedSeconds = totalSeconds;
    var $time = $(this);

    var updateInterval = setInterval(function() {
      elapsedSeconds--;

      user.setStats(getGameStats(totalSeconds - elapsedSeconds));
      user.updateLocalStats();
      postStatus();

      socket.emit('get-update', { arenaID: getArenaID() });

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

    $('#results-modal #wpm').val(user.wordsPerMinute());
    $('#results-modal #accuracy').val(user.accuracy());
  }

  var finished = function(){
    $('#results-modal').modal('show');

    populateResults();
    user.postResultsToServer();
  }

  function initializeStatusVisualization() {
    socket.on('update', function(data) {
      $.each(data.users, function(i, user) {
        if (user._id != getUserID()) {
          // Set opponent WPM
          $('tr[data-id=' + user._id + ']')
            .find('.wpm')
            .text(user.currentWPM);

          // Set opponent Accuracy
          $('tr[data-id=' + user._id + ']')
            .find('.accuracy')
            .text(user.currentAccuracy);


          // Visualize where the opponent is
          $.each(JSON.parse(user.currentStatus), function(i, v) {
            if (v == true) {
              $('.well span')
              .eq(i).css('background-color', 'rgba(255, 0, 0, 0.2)');
            }
          });
        }
      });
    });
  };

  function postStatus() {
    socket.emit('update', user.completeStatus());
  }

  function getUsersTable() {
    $.ajax({
      url: '/arenas/statusUpdate/' + getArenaID(),
      dataType: 'html',
      method: 'get',
      success: function(data) {
        $('#user-stats-wrapper').html(data);
      }
    });
  }

  $('#results-modal').on('hidden.bs.modal', function() {
    socket.emit('gameover', {
      arenaID: getArenaID()
    });

    window.location.replace(window.location.origin);
  });
});
