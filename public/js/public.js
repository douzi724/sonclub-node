/**
 * 公用js
 * User: nemo
 * Date: 12-4-2
 * Time: 下午7:43
 */
var msgInterval;

function showFlashMsg(msgType, msgs, cb) {
  if (undefined === msgType || msgType === '' || undefined === msgs || msgs === '') return;
  var flashMsg = $('#flash_msg').addClass('alert-' + msgType);
  var msgArray = msgs.split(',');
  var contentDiv = flashMsg.find('#content');
  var icon = "";
  if (msgType == 'error') {
    icon = "&nbsp;<i class='icon-remove-sign'></i>";
  }
  for (var i=0; i< msgArray.length; i++) {
    contentDiv.append(icon + '&nbsp;<strong>' + msgArray[i] + '</strong><br/>');
  }
  flashMsg.find('.close').one('click', function() {
    closeFlashMsg(flashMsg, 0);
  });
  flashMsg.fadeIn('slow');
  if (undefined !== cb) {
    cb();
  } else {
    alert('dasda');
  }
  closeFlashMsg(flashMsg, 5);
}

function closeFlashMsg(closeDiv, time) {
  if (time === 0) {
    clearInterval(msgInterval);
    closeDiv.slideUp();
    return;
  }
  msgInterval = setInterval(function() {
    time--;
    if(time === 0) {
      clearInterval(msgInterval);
      closeDiv.slideUp();
    }
  }, 1000);
}
