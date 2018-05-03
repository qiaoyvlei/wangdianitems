$().ready(function() {
    //获取焦点和失去焦点时样式的改变
    $(".info").focusin(function () {
           $(this).parent().addClass("focus");
       }).focusout(function () {
           $(this).parent().removeClass("focus");
       });

    //页面加载完毕，让首个输入框获取焦点
    $("#username").focus();

    //用插件对表单信息进行验证
    var $validator = $("#registerForm").validate({
        rules: {
            name: {
                required: true,
                minlength: 2,
                maxlength: 10,
                remote: true //'http://139.199.28.148:8080/smart-sso-demo/user/findByName'
                             //ajax请求地址
            },
            password: {
                required: true,
                minlength: 6,
                maxlength: 15
            },
            confirmPassword: {
                required: true,
                equalTo: "#password"
            },
            phone:{
                required:true,
                isMobile:true
            },
            email:{
                required:true,
                isEmail:true
            }
        },
        messages: {
            name: {
                required: "请输入用户名",
                minlength: "用户名不能少于两位",
                maxlength: "用户名不能超过十位",
                remote: "用户名已存在"
            },
            password: {
                required: "请输入密码",
                minlength: "密码长度不能小于6个字母",
                maxlength:"密码长度不能大于15个字母"
            },
            confirmPassword: {
                required: "请输入密码",
                equalTo: "两次密码输入不一致"
            },
            phone:{
                required:"请输入手机号",
                isMobile:"请输入有效的手机号"
            },
            email:{
                required:"请输入邮箱",
                isEmail:"请输入有效的邮箱格式"
            }
        },
        errorPlacement: function (error, element) {
            //error是错误提示元素span对象  element是触发错误的input对象
            //当通过验证时 error是一个内容为空的span元素
            error.appendTo(element.parent().next());
        }
    });

    jQuery.validator.addMethod("isMobile", function(value, element) {
        var length = value.length;
        var mobile = /^1[3|4|5|7|8][0-9]{9}$/;
        return this.optional(element) || (length == 11 && mobile.test(value));
    }, "请正确填写您的手机号码");
    jQuery.validator.addMethod("isEmail", function (value, element) {
        var mail =  /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-]{2,5})+/ ;
        return this.optional(element) || (mail.test(value));
    }, "请填入正确的邮箱");

    $(".confirmButton").click(function () {
        if($validator.form()) {
            alert("注册成功！");
            /*将数据传递给后台*/
            var dataInfo = $("#registerForm").serializeArray();
            var values={};
            $.each(dataInfo,function(i,val){
                values[val.name] = val.value;
            });
            //删除confirmPassword
            delete values.confirmPassword;
            console.log(values);
            //将数据发出去
            $.post("http://139.199.28.148:8080/smart-sso-demo/user/register", values)
                //.error(function(){
                //    alert("请稍后重试");
                //})
            ;
            //window.location.href = "login.html";
        } else {
            alert("信息填写有错误哦，再仔细检查一下吧！");

        }
    });

});