var User = function (id) {
  this.id = id;
  this.correctWords = 0;
  this.wordsAttempted = 0;
  this.secondsPlayed = 0;
}

User.prototype.id = function(value) {
  return this.id = value;
}

User.prototype.setCorrectWords = function(value) {
  this.correctWords = Number(value);
}

User.prototype.setWordsAttempted = function(value) {
  this.wordsAttempted = Number(value);
}

User.prototype.setSecondsPlayed = function(value) {
  this.secondsPlayed = Number(value);
}

User.prototype.accuracy = function() {
  return ((this.correctWords / this.wordsAttempted) * 100).toFixed(2);
};

User.prototype.wordsPerMinute = function() {
  return ((this.correctWords / this.secondsPlayed) * 60).toFixed(2);
}

User.prototype.tableRow = function() {
  return $('tr[data-id=' + this.id + ']');
}

User.prototype.setStats = function(data) {
  this.correctWords = data.correctWords;
  this.wordsAttempted = data.totalWords;
  this.secondsPlayed = data.secondsPlayed;
}

User.prototype.updateLocalStats = function() {
  this.tableRow().find('.wpm').text(this.wordsPerMinute());
  this.tableRow().find('.accuracy').text(this.accuracy());
}

User.prototype.statusHash = function() {
  var status = {}
  $('.well span').each(function(i, v) {
    status[i] = $(v).attr('complete') == 'true'
  });
  return status;
}

User.prototype.resultsForServer = function() {
  return {
    correctWords: this.correctWords,
    wordsAttempted: this.wordsAttempted,
    secondsPlayed: this.secondsPlayed
  }
}

User.prototype.postResultsToServer = function() {
  $.ajax({
    url: '/users/' + this.id + '/updateFromResults',
    dataType: 'json',
    method: 'put',
    data: this.resultsForServer
  });
}

User.prototype.completeStatus = function() {
  return {
    userId: this.id,
    currentStatus: this.statusHash(),
    currentWPM: this.wordsPerMinute(),
    currentAccuracy: this.accuracy()
  };
}

User.prototype.printStats = function() {
  console.log('ID: ' + this.id);
  console.log('Correct Words: ' + this.correctWords);
  console.log('Total Words: ' + this.wordsAttempted);
  console.log('Seconds Played: ' + this.secondsPlayed);
}
