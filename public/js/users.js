$(function() {

  togglePanels();

  $('ul.nav li a').click(function() {
    var dataID = $(this).attr('data-id');

    $('ul.nav li').removeClass('active');
    $('.tab-pane').removeClass('active')

    $(this).parents('li').addClass('active');
    $(dataID).addClass('active');

    togglePanels();
  });

  function togglePanels() {
    $('.tab-pane').not('.active').hide();
    $('.tab-pane.active').show();
  }
});
