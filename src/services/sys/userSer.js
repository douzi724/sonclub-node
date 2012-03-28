/**
 * Created by JetBrains WebStorm.
 * User: nemo
 * Date: 12-3-28
 * Time: 下午8:17
 * To change this template use File | Settings | File Templates.
 */

exports.create  = function(req, res, User) {
    User.find({ '$or': [{'name':req.body.name}, {'email':req.body.email}] }, function(err, users){
        //if(err) return next(err);
        if(users.length > 0){
            req.pushMsg('error', '昵称或邮箱已被占用！');
            return res.render('sys/sign.html' , {foo : 'www'});
        }

        // md5 the pass
        //pass = md5(pass);
        // create gavatar
        //var avatar_url = 'http://www.gravatar.com/avatar/' + md5(email) + '?size=48';

        /*var user = new User();
        user.name = name;
        user.loginname = loginname;
        user.pass = pass;
        user.email = email;
        user.avatar = avatar_url;
        user.active = false;
        user.save(function(err){
            if(err) return next(err);
            mail_ctrl.send_active_mail(email,md5(email+config.session_secret),name,email,function(err,success){
                if(success){
                    res.render('sign/signup', {success:'欢迎加入 ' + config.name + '！我们已给您的注册邮箱发送了一封邮件，请点击里面的链接来激活您的帐号。'});
                    return;
                }
            });
        });*/
    });
};