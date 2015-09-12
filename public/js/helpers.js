String.prototype.leftJustify = function( length, char ) {
    var fill = [];
    while ( fill.length + this.length < length ) {
      fill[fill.length] = char;
    }
    return fill.join('') + this;
}

String.prototype.rightJustify = function( length, char ) {
    var fill = [];
    while ( fill.length + this.length < length ) {
      fill[fill.length] = char;
    }
    return this + fill.join('');
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
