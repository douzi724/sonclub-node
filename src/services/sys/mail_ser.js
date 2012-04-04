/**
 * 邮件控制类
 * User: nemo
 * Date: 12-4-4
 * Time: 上午12:03
 */
var nodemailer = require('nodemailer');
var config = require('../../../resources/config');
var EventProxy = require('eventproxy').EventProxy;

var transport = nodemailer.createTransport("SMTP", {
  service: "Gmail",
  auth: {
    user: config.mail.user,
    pass: config.mail.pass
  }
});

var mails = [];
var timer;

var mailEvent = new EventProxy();
mailEvent.on("sendMails", function() {
  if (mails.length === 0) {
    return;
  } else {
    //遍历邮件数组，发送每一封邮件，如果有发送失败的，就再压入数组，同时触发mailEvent事件
    var failed = false;
    for (var i = 0, len = mails.length; i != len; ++i) {
      var message = mails[i];
      mails.splice(i, 1);
      i--;
      len--;
      var mail;
      try {
        mail = transport.sendMail(message, function(error, response) {
          if (error) {
            mails.push(message);
            failed = true;
          }
        });
      } catch(e) {
        mails.push(message);
        failed = true;
      }
      if (mail) {
        var oldemit = mail.emit;
        mail.emit = function() {
          oldemit.apply(mail, arguments);
        }
      }
    }
    if (failed) {
      clearTimeout(timer);
      timer = setTimeout(trigger, 60000);
    }
  }
});

var trigger = function() {
  mailEvent.trigger("sendMails");
}

var sendMail = function(data) {
  mails.push(data);
  trigger();
};

var sendActiveMail = function (email, token, cb) {
  var sender =  config.mail.sender;
  var subject = '[' + config.system.name + '] 帐号激活';
  var html = '<p>卵崽：<p/>' +
    '<p>速度点击下面的链接来激活帐户：</p>' +
    '<a href="' + config.system.host + '/active_account?key=' + token + '&email=' + email + '">激活链接</a>' +
    '<p>若您没有在 [' + config.system.name + '] 填写过注册信息，说明有卵崽滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
    '<p>[' +config.system.name + '] 谨上。</p>';

  var data = {
    from: sender,
    to: email,
    subject: subject,
    html: html
  };
  cb (null, true);
  sendMail(data);
};

exports.sendActiveMail = sendActiveMail;