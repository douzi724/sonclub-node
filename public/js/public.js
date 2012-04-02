/**
 * Created by JetBrains WebStorm.
 * User: nemo
 * Date: 12-4-2
 * Time: 下午7:43
 * To change this template use File | Settings | File Templates.
 */
function showMsg(msgType, msgs) {
    var flashMsg = $("#flashMsg");
    var msgDiv = flashMsg.find("div").addClass("alert-" + msgType);
    var msgArray = msgs.split(',');
    for(i in msgArray) {
        msgDiv.append("<strong> * " + msgArray[i] + "</strong><br/>");
    }
    flashMsg.find('.close').one('click', function() {
        closeFlashMsg("#flashMsg", 0);
    });
    $("#flashMsg").fadeIn("slow");
    closeFlashMsg("#flashMsg", 5);
}
function closeFlashMsg(closeDivId, time) {
    if(time === 0) {
        clearInterval(interval);
        $(closeDivId).slideUp();
        return;
    }
    var interval = setInterval(function(){
        time--;
        if(time === 0) {
            clearInterval(interval);
            $(closeDivId).slideUp();
        }
    }, 1000);
}
