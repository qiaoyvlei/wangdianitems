/**
 * Created by dell-pc on 2017/12/19.
 */

    //每个用户的设备在这个地图模式上显示
var mapObj, cluster;
var markers = [];
$(document).ready(function () {
    mapObj = new AMap.Map("mapShow", {
        //二维地图显示视口
        view: new AMap.View2D({
            center: new AMap.LngLat(104.451345, 37.284562),//地图中心点
            zoom: 4 //地图显示的缩放级别
        })
    });
    mapObj.plugin(["AMap.ToolBar"], function () {
        var toolBar = new AMap.ToolBar();
        mapObj.addControl(toolBar);
    });
    //请求所有数据，展示每个设备
    $.post(ip+"/equipment/findLocationUserId",params,function(json){
        console.log(data)
        $.each(json.data, function (i, item) {
            var ss = '设备名称：<span style="font-size:14px;text-decoration:underline;" >' + item.name + '</span>';
            lng = item.location_X;
            lat = item.location_Y;
            addPoint(lng,lat, ss,item.equipmentId);
        });
        //当出现两个以上位置很相近的，采用聚集点标记
        mapObj.plugin(["AMap.MarkerClusterer"], function () {
            cluster = new AMap.MarkerClusterer(mapObj, markers);
            cluster.setGridSize(20);
        });
    });
});
//展示窗口信息
var showSensors = function (infoWindow, marker,gid) {
    infoWindow.open(mapObj, marker.getPosition());
};
function addPoint(lng, lat, content, typeIcon,gid) {
    var marker = new AMap.Marker({
        position: new AMap.LngLat(lng, lat),
        draggable: false, //点标记可拖拽
        raiseOnDrag: true//鼠标拖拽点标记时开启点标记离开地图的效果
    });
    var infoWindow = new AMap.InfoWindow({
        content: content,
        offset: new AMap.Pixel(0, 0)//-113, -140
    });
    AMap.event.addListener(marker, 'click', function () { //鼠标点击marker弹出自定义的信息窗体
        showSensors(infoWindow, marker,gid);
    });
    marker.setMap(mapObj);
    markers.push(marker);
}

