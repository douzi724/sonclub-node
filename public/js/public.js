/**
 * 公用js
 * User: nemo
 * Date: 12-4-2
 * Time: 下午7:43
 */
function showFlashMsg(msgType, msgs) {
  if (undefined === msgType || msgType === '' || undefined === msgs || msgs === '') return;
  var flashMsg = $('#flashMsg');
  var msgDiv = flashMsg.find('div').addClass('alert-' + msgType);
  var msgArray = msgs.split(',');
  for (var i=0; i< msgArray.length; i++) {
    msgDiv.append('<strong> * ' + msgArray[i] + '</strong><br/>');
  }
  flashMsg.find('.close').one('click', function() {
    closeFlashMsg('#flashMsg', 0);
  });
  $('#flashMsg').fadeIn('slow');
  closeFlashMsg('#flashMsg', 5);
}
function closeFlashMsg(closeDivId, time) {
  if (time === 0) {
    clearInterval(interval);
    $(closeDivId).slideUp();
    return;
  }
  var interval = setInterval(function() {
    time--;
    if(time === 0) {
      clearInterval(interval);
      $(closeDivId).slideUp();
    }
  }, 1000);
}
