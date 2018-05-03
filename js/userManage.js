var map;var marker;var pos;
$(document).ready(function(){
    /** 通过点击展开左边栏 **/
    $("#sideslip").click(function(){
        if($(".sidebar").css("left") == "0px") {
            $("#sideslip").animate({left:"0px"});
        }
        else{
            $("#sideslip").animate({left:"190px"});
        }
    });
    //显示devices列表
    var showlist = everyDevices(equipment.equipmentList);
    for(var i=0;i<equipment.equipmentList.length;i++){
        $(".showDevicesList").append(showlist[i]);
    }
    //这里使用ajax获取数据之后进行渲染
    //用户id从cookie中获取,首次查询，使用页码号1
//    $.get("http://139.199.28.148:8080/smart-sso-demo/equipment/findByUId/"+uid+"/1/",function(data){
//      var showlist = everyDevices(data.devicesList);
//      for(var i=0;i<data.devicesList.length;i++){
//        $(".showDevicesList").append(showlist[i]);
//      }
//    });

    //我的设备分页
    // 创建分页
    //将num值传给后台
    $("#Pagination_mydevice").jqPaginator( {
        //返回页码数
        totalPages: 6,
        visiblePages: 5,
        currentPage: 1,
        onPageChange: function (num, type) {
            //uid获取自cookie
//        $.post("http://139.199.28.148:8080/smart-sso-demo/equipment/findByUId/"+uid+"/"+num+"",function(data){
//          var showlist = everyDevices(data.devicesList);
//          for(var i=0;i<data.devicesList.length;i++){
//            $(".showDevicesList").append(showlist[i]);
//          }
//        });
        },
        first: '<li class="first"><a href="javascript:void(0);">首页<\/a><\/li>',
        prev: '<li class="prev"><a href="javascript:void(0);"><i class="arrow arrow2"><\/i>上一页<\/a><\/li>',
        next: '<li class="next"><a href="javascript:void(0);">下一页<i class="arrow arrow3"><\/i><\/a><\/li>',
        last: '<li class="last"><a href="javascript:void(0);">末页<\/a><\/li>',
        page: '<li class="page"><a href="javascript:void(0);">{{page}}<\/a><\/li>'
    });

    //显示实时设备信息table
    var template = $.templates("#theTmpl");
    var htmlOutput = template.render(equipment);
    $("#realtimeDataList").html(htmlOutput);
    //这里使用ajax获取数据之后进行渲染
    //使用funcion
    //function findNewData(){
    //    $.get('http://139.199.28.148:8080/smart-sso-demo/data/findNew',function(data){
    //      var template = $.templates("#theTmpl");
    //      var htmlOutput = template.render(data);
    //      $("#realtimeDataList").html(htmlOutput);
    //    });
    //setTimeout(function(){findNewData();},10000);
    // }


    //实时数据分页
    // 创建分页
    //将num值传给后台
    $("#Pagination_realtimeData").jqPaginator( {
        //返回页码数
        totalPages: 6,
        visiblePages: 5,
        currentPage: 1,
        onPageChange: function (num, type) {
            //uid获取自cookie
//        $.post("http://139.199.28.148:8080/smart-sso-demo/equipment/findByUId/"+uid+"/"+num+"",function(data){
//          findNewData();
//        });
        },
        first: '<li class="first"><a href="javascript:void(0);">首页<\/a><\/li>',
        prev: '<li class="prev"><a href="javascript:void(0);"><i class="arrow arrow2"><\/i>上一页<\/a><\/li>',
        next: '<li class="next"><a href="javascript:void(0);">下一页<i class="arrow arrow3"><\/i><\/a><\/li>',
        last: '<li class="last"><a href="javascript:void(0);">末页<\/a><\/li>',
        page: '<li class="page"><a href="javascript:void(0);">{{page}}<\/a><\/li>'
    });
    //编辑设备弹出框
    $( "#edit_device" ).dialog({
        autoOpen: false,
        height: 500,
        width: 800,
        modal: true,
        resizable:false,
        buttons:{
            "取消":function(){
                $(this).dialog('close');
            }
        }
    });
    //编辑设备弹框
    $( ".edit-device").click(function(){
        $( "#edit_device" ).dialog( "open" );
    });


    //传感器
    $.each(sensorList,function(index,html){
        $('#sela').append(
            $('<option></option>')
                .text(html)
                .val(html)
        );
    });
    $("#sela").multiselect({
        noneSelectedText: "==请选择设备支持的传感器类型==",
        checkAllText: "全选",
        uncheckAllText: '全不选'
        ,selectedList:10
        ,minWidth:450
    });


    //地理位置
    map = new AMap.Map('mapDiv', {
        resizeEnable: true,
        center: new AMap.LngLat(116.306206, 39.975468),
        zoom:10
    });
    var districtSearch = new AMap.DistrictSearch();
    districtSearch.search('中国',function(status, result){
        var subDistricts = result.districtList[0].districtList;
        var select = document.getElementById('subDistricts');
        for(var i = 0;i < subDistricts.length; i += 1){
            var name = subDistricts[i].name;
            var option = document.createElement('option');
            option.value = option.innerHTML = name;
            select.appendChild(option);
        }
        select.onchange = function(){map.setCity(this.value)};
        select.value = subDistricts[0].name;
        select.onchange();
    });
    map.plugin(["AMap.ToolBar"], function () {
        var toolBar = new AMap.ToolBar();
        map.addControl(toolBar);
    });
    if(false){
        pos = new AMap.LngLat(0, 0);
        map.setZoom(12);
    }
    else
    {// showCityInfo();
    }
    map.setCenter(pos);
    addMarker();
    var clickEventListener=AMap.event.addListener(map,'click',function(e){
        var lng =e.lnglat.getLng();
        var lat =e.lnglat.getLat();
        console.log(lng,lat);
        addPoint(lng,lat);
    });


});

//显示设备详细信息
function everyDevices(data){
    var list=[];
    for(var i=0;i<data.length;i++){
        list[i]='<tr class="t1">'
        +'<td class="t30">'+data[i].id+'</td>'
        +'<td class="t30">'+data[i].name+'</td>'
        +'<td class="t20">'+data[i].createTime+'</td>'
        +'<td class="t40" style="font-size:3px;">'+data[i].sensor+'</td>'
        +'<td class="t20">'
        +'<button class="btn btn-default btn-sm edit-device"  onclick=editDevice("'+data[i].id+'",this)>'+'编辑'+'</button>'
        +'<input class="btn btn-default btn-sm" type="button" value="删除" onclick=deleteDevice("'+data[i].id+'","'+data[i].name+'",this)>'
        +'</td>'+'</tr>'
    }
    return list;
}
//删除设备
function deleteDevice(id,name,obj){
    var con = confirm("确认删除 "+name+" 及其全部信息吗？");
    if(con==true){
        //    从页面删除
        var tr=obj.parentNode.parentNode;
        var tbody=tr.parentNode;
        tbody.removeChild(tr);

        var param = {"id":id};
        $.post("http://139.199.28.148:8080/smart-sso-demo/equipment/delete",param);
    }
}
//编辑设备
function editDevice(id,obj){
    console.log(id);
    console.log(obj);

    //将数据填人编辑设备中
    var template = $.templates("#edit_device_data");
    var htmlOutput = template.render(equipment.equipmentList[3]);
    $("#edit_device").html(htmlOutput);
    //传感器类型
    //将后台传过来的值附进去，让其选中
    $.each(sensorList,function(index,html){
        $('#sela_edit').append(
            $('<option></option>')
                .text(html)
                .val(html)
        );
    });
    var arrSensor = [];
    for(var i=0;i<equipment.equipmentList[0].sensor.length;i++){
        (function(){
            arrSensor.push(equipment.equipmentList[0].sensor[i]);
        })(i);
    }
    $("#sela_edit").val(arrSensor);
    $("#sela_edit").multiselect({
        noneSelectedText: "==请选择设备支持的传感器类型==",
        checkAllText: "全选",
        uncheckAllText: '全不选'
        ,selectedList:10
        ,minWidth:450
    });
    //地图

    var location  = equipment.equipmentList[0].location;
    console.log(location);
    map = new AMap.Map('mapDiv_edit', {
        resizeEnable: true,
        center: new AMap.LngLat(0,0),
        zoom:10
    });
    var districtSearch = new AMap.DistrictSearch();
    districtSearch.search('中国',function(status, result){
        var subDistricts = result.districtList[0].districtList;
        var select = document.getElementById('subDistricts_edit');
        for(var i = 0;i < subDistricts.length; i += 1){
            var name = subDistricts[i].name;
            var option = document.createElement('option');
            option.value = option.innerHTML = name;
            select.appendChild(option);
        }
        select.onchange = function(){map.setCity(this.value)};
        select.value = subDistricts[0].name;
//      select.onchange();
        thisLocation(location);
    });


    map.plugin(["AMap.ToolBar"], function () {
        var toolBar = new AMap.ToolBar();
        map.addControl(toolBar);
    });
    if(false){
        pos = new AMap.LngLat(0, 0);
        map.setZoom(12);
    }
    else
    {// showCityInfo();
    }
    map.setCenter(pos);
    addMarker();
    var clickEventListener=AMap.event.addListener(map,'click',function(e){
        var lng =e.lnglat.getLng();
        var lat =e.lnglat.getLat();
        addPoint(lng,lat);
    });


//    $.get("http://139.199.28.148:8080/smart-sso-demo/data/findByEquipmentId/{"+id+"}",function(data){
//
//    });
//    var values={};
//    $.post("http://139.199.28.148:8080/smart-sso-demo/equipment/update",values);
//    var url=window.location.href;
//    window.location.href = url;
}

//保存编辑好的设备
function updateDevice(id){
    if(0==$('#sela_edit').val()){
        $('.requiredType').css("display","inline");
        return false;
    }else{
        var params = $("#form_edit").serializeArray();
        console.log(params);
        var values={};
        $.each(params,function(i,val){
            values[val.name] = val.value;
        });
        console.log(1)
        var sensor = $('#sela_edit').val();
        values['sensor'] = sensor;
        values['id']= id;
        console.log(values);
//    $.post("http://139.199.28.148:8080/smart-sso-demo/equipment/update",values);
//    var url=window.location.href;
//    window.location.href = url;
    }
}
//保存新添加的设备信息
function saveDevice(){
    if(0==$('#sela').val()){
        $('.requiredType').css("display","inline");
        return false;
    }else{
        var params = $("#form1").serializeArray();
        console.log(params);
        var values={};
        $.each(params,function(i,val){
            values[val.name] = val.value;
        });
        var sensor = $('#sela').val();
        values['sensor'] = sensor;
        console.log(values);
//      $.post("http://139.199.28.148:8080/smart-sso-demo/equipment/add",values);
//      var url=window.location.href;
//      window.location.href = url;
    }

}
//取消正在添加的设备信息
function cancelAddDevice(){
    document.getElementById('form1').reset();
    var Rurl=window.location.href;
    window.location.href = Rurl;
}

//点添加到地图上
function addPoint(lng,lat) {
    var point =  new AMap.LngLat(lng, lat);  // 创建标注
    marker.setPosition(point);            // 将标注添加到地图中
    $("#location").val(lng + "," + lat);
}
//标记
function addMarker() {
    marker = new AMap.Marker({
        position:pos,
        draggable:false, //点标记可拖拽
        cursor:'move',  //鼠标悬停点标记时的鼠标样式
        raiseOnDrag:true//鼠标拖拽点标记时开启点标记离开地图的效果

    });
    marker.setMap(map);
}
///显示当前城市
function showCityInfo() {
    map.plugin(["AMap.CitySearch"], function () {
        var citysearch = new AMap.CitySearch();
        citysearch.getLocalCity();
        AMap.event.addListener(citysearch, "complete", function (result) {
            if (result && result.city && result.bounds) {
                var cityinfo = result.city;
                var citybounds = result.bounds;
                map.setBounds(citybounds);
                addMarker();
            }
            else {
            }
        });
        AMap.event.addListener(citysearch, "error", function (result) { alert(result.info); });
    });
}
function thisLocation(location){
    var locationX = location.split(',')[0];
    var locationY = location.split(',')[1];
    map.plugin(["AMap.Geocoder"],function(){
        geocoder=new AMap.Geocoder({
            radius:1000, //以已知坐标为中心点，radius为半径，返回范围内兴趣点和道路信息
            extensions: "all"//返回地址描述以及附近兴趣点和道路信息，默认"base"
        });
        //逆地理编码
        geocoder.getAddress(location,function(status,result){
            if (status === 'complete' && result.info === 'OK') {
                $('#subDistricts_edit').val(result.regeocode.addressComponent.province);
                now = new AMap.LngLat(locationX,locationY);
                map.setCenter(now);
            }
        });
    });

}


var sensorList = ['温度','湿度','二氧化碳浓度','光照强度','烟雾浓度','PM2.5'];
var equipment = {
    "equipmentList":[
        {
            "id":"8646aee7229e48f4810966b93e4450c1",
            "name":"温湿度监控",
            "createTime":"20171111",
            "imgUrl":"../images/machineRoom-display1.png",
            "sensor":['温度','湿度','烟雾浓度'],
            "info":"asdds1",
            "location":"106.353202,29.584348",
            "data":[
                {
                    key:"温度",
                    value:"23"
                },
                {
                    key:"湿度",
                    value:"23"
                },
                {
                    key:"烟雾浓度",
                    value:123
                }
            ]
        },
        {
            "id":"8646aee7229e48f4810966b93e4450c2",
            "name":"温湿度监控",
            "createTime":"20171112",
            "imgUrl":"../images/machineRoom-display1.png",
            "sensor":['温度','湿度','二氧化碳','烟雾浓度'],
            "info":"asdds2",
            "location":"",
            "data":[
                {
                    key:"温度",
                    value:"23"
                },
                {
                    key:"湿度",
                    value:"23"
                },
                {
                    key:"二氧化碳",
                    value:23
                },
                {
                    key:"烟雾浓度",
                    value:123
                }
            ]
        }
        ,{
            "id":"8646aee7229e48f4810966b93e4450c3",
            "name":"小伊利温湿度监控",
            "createTime":"20171113",
            "imgUrl":"../images/machineRoom-display1.png",
            "sensor":['温度','二氧化碳','光照强度','烟雾浓度'],
            "info":"asdds3",
            "location":"",
            "data":[
                {
                    key:"温度",
                    value:"23"
                },
                {
                    key:"光照强度",
                    value:23
                },
                {
                    key:"二氧化碳",
                    value:23
                },
                {
                    key:"烟雾浓度",
                    value:123
                }
            ]
        }
        ,{
            "id":"8646aee7229e48f4810966b93e4450c4",
            "name":"小蒙牛温湿度监控",
            "createTime":"20171114",
            "imgUrl":"../images/machineRoom-display1.png",
            "sensor":['温度','湿度','二氧化碳','光照强度','烟雾浓度'],
            "info":"asdds4",
            "location":"",
            "data":[
                {
                    key:"温度",
                    value:"23"
                },
                {
                    key:"湿度",
                    value:"23"
                },
                {
                    key:"光照强度",
                    value:23
                },
                {
                    key:"二氧化碳",
                    value:23
                },
                {
                    key:"烟雾浓度",
                    value:123
                }
            ]
        }
        ,{
            "id":"8646aee7229e48f4810966b93e4450c5",
            "name":"温湿度监控",
            "createTime":"20171115",
            "imgUrl":"../images/machineRoom-display1.png",
            "sensor":['温度','湿度','二氧化碳','光照强度','烟雾浓度'],
            "info":"asdds5",
            "location":"",
            "data":[
                {
                    key:"温度",
                    value:"23"
                },
                {
                    key:"湿度",
                    value:"23"
                },
                {
                    key:"光照强度",
                    value:23
                },
                {
                    key:"二氧化碳",
                    value:23
                },
                {
                    key:"烟雾浓度",
                    value:123
                }
            ]
        }
    ]
};
