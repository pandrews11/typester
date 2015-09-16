$(function() {

  var totalSeconds;

  var socket    = io(),
  arenaReleased = false;

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

  function userRow() {
    return $('tr[data-id=' + getUserID() + ']');
  }

  function correctWords() {
    return $('.well span[complete=true]').length;
  }

  function wordsAttempted() {
    return correctWords() + $('.well span[complete=false]').length
  }

  function getCurrentWPM() {
    return userRow().find('.wpm').text();
  }

  function getCurrentAccuracy() {
    return userRow().find('.accuracy').text();
  }

  function accuracy() {
    return (correctWords() / wordsAttempted()) * 100;
  }

  function updateWPM(seconds) {
    userRow().find('.wpm').text(((correctWords() / seconds) * 60).toFixed(3));
  }

  function updateAccuracy() {
    if (!isNaN(accuracy()))
      userRow().find('.accuracy').text((accuracy()).toFixed(3) + '%');
  }

  function startArena() {
    getUsersTable();

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
      $('.well').spanify();
      startArena();
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

      updateLocalStats(totalSeconds - elapsedSeconds)
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

  function updateLocalStats(seconds) {
    updateWPM(seconds);
    updateAccuracy();
  }

  function populateResults() {
    $('#results-modal #time-played').val(
      moment(0).seconds(totalSeconds).format('mm:ss')
    );

    $('#results-modal #wpm').val(getCurrentWPM());
    $('#results-modal #accuracy').val(getCurrentAccuracy());
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
      url: '/users/' + getUserID() + '/updateFromResults',
      dataType: 'json',
      method: 'put',
      data: getResultsJSON()
    });
    return;
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

  function createStatusHash() {
    var status = {}
    $('.well span').each(function(i, v) {
      status[i] = $(v).attr('complete') == 'true'
    });
    return status;
  }

  function postStatus() {
    socket.emit('update', {
      userId: getUserID(),
      currentStatus: createStatusHash(),
      currentWPM: getCurrentWPM(),
      currentAccuracy: getCurrentAccuracy()
    });
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
