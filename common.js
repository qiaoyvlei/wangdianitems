var ip = "http://192.168.1.185:8080"; //宝宝
//var ip = "http://139.199.28.148:8080/IOTCloud-provider-1.0-SNAPSHOT"; //公共腾讯
//var ip = "http://39.106.59.168:8080/IOTCloud-provider-1.0-SNAPSHOT";//公共阿里
//var ip = "http://192.168.1.199:8080"; //奎奎
//var ip = "http://localhost:8080";  //本地服务器
/* 获取指定cookie */
function getCookie(name) {
    var strCookie = document.cookie;
    var arrCookie = strCookie.split("; ");
    for (var i = 0; i < arrCookie.length; i++) {
        var arr = arrCookie[i].split("=");
        if (arr[0] == name)
            return arr[1];
    }
    return "";
}
//设置cookie
function setCookie(name,value,iday){
    var oDate = new Date();
    oDate.setDate(oDate.getDate()+iday);
    document.cookie = name+'='+value+';expires='+oDate;
}
//删除cookie
function removeCookie(name){
    setCookie(name,"1",-1);
}