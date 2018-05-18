var map;var marker;var pos;
var image = '';
var canvas;
var base64;//将canvas压缩为base64格式
var mapObj, cluster;
var markers = [];
//var userId = '4657c0733c5048a79e7555574a1dc564';
var userId = getCookie("userId");
if(userId){
    $('.logined').css('display','inline-block');
    $('.unlogin').css('display','none');
}else{
    $('.unlogin').css('display','inline-block');
    $('.logined').css('display','none');
}
$(document).ready(function(){
    $( ".edit-device").click(function(){
        $( "#edit_device" ).dialog( "open" );
    });
    /** 通过点击展开左边栏 **/
    $("#sideslip").click(function(){
        if($(".sidebar").css("left") == "0px") {
            $("#sideslip").animate({left:"0px"});
        }
        else{
            $("#sideslip").animate({left:"190px"});
        }
    });

    $('.front').on('change', function() {
        //var fileUp = $('#front-form');
        //console.log(fileUp);
        //var sendForm = new FormData(fileUp);
        //console.log(sendForm);
        //$.post(ip+'/upload/uploadimg',sendForm,function(json){
        //
        //});
        var foemd = new FormData();
        foemd.append("file",$(".front")[0].files[0]);
        var xhr = new XMLHttpRequest();
        xhr.open("POST",ip+'/upload/uploadimg', true);
        xhr.send(foemd);
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4 && xhr.status == 200) {
                var obj = JSON.parse(xhr.responseText);
                if(obj.path) {
                    $('.frontBtn').css('background-color','green');
                    $('.frontBtn').html('已上传');
                } else {
                    alert('上传失败，请再试一次');

                }
            }
        }
    });

    var params = {};
    params.userId = userId;
    params.pageNo = 1 || pageIndex;
    //显示devices列表
    $.post(ip+'/equipment/find',params,function(json){
        if(json.type === "COMMON_SUC"){
            var template1 = $.templates("#showDevicesList");
            var htmlOutput1 = template1.render(json.data);
            $(".showDevicesList").html(htmlOutput1);

            $("#Pagination_mydevice").jqPaginator( {
                //返回页码数
                totalPages: json.data.pageNum,
                visiblePages: 5,
                currentPage: 1,
                onPageChange: function (num, type) {
                    pageIndex = num;
                    return pageIndex;
                },
                first: '<li class="first"><a href="javascript:void(0);">首页<\/a><\/li>',
                prev: '<li class="prev"><a href="javascript:void(0);"><i class="arrow arrow2"><\/i>上一页<\/a><\/li>',
                next: '<li class="next"><a href="javascript:void(0);">下一页<i class="arrow arrow3"><\/i><\/a><\/li>',
                last: '<li class="last"><a href="javascript:void(0);">末页<\/a><\/li>',
                page: '<li class="page"><a href="javascript:void(0);">{{page}}<\/a><\/li>'
            });

        }else if(json.type === "Equipment_REQ_ERROR"){
            alert("设备请求参数错误！")
        }else if(json.type === "Equipment_FIND_ERROR"){
            alert("设备信息查询失败！")
        }
    },'json').fail(function(json){
        alert("请求失败，请稍后再试")
    });

    //显示实时设备信息table
    //使用funcion
    findNewData();
    setInterval(function(){findNewData();},20000);
    function findNewData(){
        $.post(ip+'/equipment/findEData',{userId:userId},function(data){
          var template = $.templates("#theTmpl");
          var htmlOutput = template.render(data);
          $("#realtimeDataList").html(htmlOutput);
        });
    }


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

    //查看传感器类型
    $( "#showDataTypes" ).dialog({
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
        addPoint(lng,lat);
    });

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
    var params1 = {};
    params1.userId = userId;
    $.post(ip+"/equipment/findLocationUserId",params1,function(json){
        $.each(json.data, function (i, item) {
            var ss = '<span style="font-size: 16px;">设备名称：</span>'
                +'<span style="font-size:14px;text-decoration:underline;" >'
                + '<a href="dataEquipment.html?id='+item.equipmentId+'" target="view_window">'
                + item.name
                + '</a>'+'</span>';
            lng = item.location_X;
            lat = item.location_Y;
            addPoint1(lng,lat, ss,item.equipmentId);
        });
        //当出现两个以上位置很相近的，采用聚集点标记
        mapObj.plugin(["AMap.MarkerClusterer"], function () {
            cluster = new AMap.MarkerClusterer(mapObj, markers);
            cluster.setGridSize(60);
        });
    });
});

//删除设备
function deleteDevice(id,name,obj){
    var con = confirm("确认删除 "+name+" 及其全部信息吗？");
    if(con==true){
        //    从页面删除
        var tr=obj.parentNode.parentNode;
        var tbody=tr.parentNode;
        tbody.removeChild(tr);

        var params = {"equipmentId":id};
        $.post(ip+"/equipment/del",params,function(json){
            if(json.typpe === "COMMPN_SUC"){
                var url=window.location.href;
                window.location.href = url;
            }else if(json.type === "Equipment_DEL_ERROR"){
                alert("设备信息删除失败");
            }
        }).fail(function(){
            alert("请求错误，请稍后再试");
        });
    }
}
//编辑设备
function editDevice(id,obj){
    //将数据填人编辑设备中
    $.post(ip+'/equipment/find',{equipmentId:id},function(json){
        var data = json.data.equipments[0];
        if(json.type === "COMMON_SUC"){
            var template = $.templates("#edit_device_data");
            var htmlOutput = template.render(data);
            $("#edit_device").html(htmlOutput);

            //编辑设备弹框
            $( ".edit-device").click(function(){
                $( "#edit_device" ).dialog( "open" );
            });
            //地图
            var location  = data.location_X + ','+ data.location_Y;
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
            addPoint(data.location_X ,data.location_Y );
            var clickEventListener=AMap.event.addListener(map,'click',function(e){
                var lng =e.lnglat.getLng();
                var lat =e.lnglat.getLat();
                console.log(lng,lat);
                addPointEdit(lng,lat);
            });
        }else if(json.type === "Equipment_REQ_ERROR"){
            alert("设备请求参数错误！")
        }else if(json.type === "Equipment_FIND_ERROR"){
            alert("设备信息查询失败！")
        }
    }).fail(function(){
        alert("请求错误，请稍后再试")
    });
}

//查看传感器
function showDataTypes(id){
    console.log(id);
    $.post(ip+'/sensor/find',{equipmentId:id},function(json){
        var firstData = json.data;
        console.log(firstData);
        if(json.type === "COMMON_SUC"){
            var template = $.templates("#showDataTypes_Data");
            var htmlOutput = template.render(json);
            $("#showDataTypes_body").html(htmlOutput);

            //编辑设备弹框
            $( ".show_dataTypes").click(function(){
                $( "#showDataTypes" ).dialog( "open" );
            });

        }else if(json.type === "Equipment_REQ_ERROR"){
            alert("设备请求参数错误！")
        }else if(json.type === "Equipment_FIND_ERROR"){
            alert("设备信息查询失败！")
        }
        else if(json.type === "SENSOR_NULL_ERROR"){
            //编辑设备弹框
            $( ".show_dataTypes").click(function(){
                $( "#showDataTypes" ).dialog( "open" );
            });
            $("#showDataTypes_body").html("");
        }
    }).fail(function(){
        alert("请求错误，请稍后再试")
    });
    $.post(ip+'/equipment/find',{equipmentId:id},function(data){
        if(data.type === "COMMON_SUC") {
            var t1 = $.templates("#getEquipmentId_js");
            var h1 = t1.render(data.data.equipments[0]);
            $("#getEquipmentId").html(h1);
        }
    }).fail(function(){
        alert("请求错误，请稍后再试")
    });
}

//增加传感器
function addDataTypes(id) {
    var text = "<tr class='t1'>" +
        "<td class='t30' id='mid'>" +
        "<input type='text' name='name' value='' required/>" +
        "</td>" +
        "<td class='t30' id='mid'>" +
        "<input type='text' name='dataType' value='' required/>" +
        "</td>" +
        "<td class='t30' id='mid'>" +
        "<input type='text' name='unit' value='' required/>" +
        "</td>" +
        "<td class='t40'>" +
        "<button class='btn btn-default addDToK'>确定</button>" +
        "<button class='btn btn-default addDTCancel'>取消</button>" +
        "</td>" +
        "</tr>";
    $("#showDataTypes_body").append(text);
    $(".addDTCancel").click(function () {
        $(this).parents("tr").remove();
    });
    $(".addDToK").click(function () {
        $(this).parents("tr").each(function(){
            var name = $(this).find('td').eq(0).find('input').val();
            var dataType = $(this).find('td').eq(1).find('input').val();
            var unit = $(this).find('td').eq(2).find('input').val();
            var params = {};
            params.name = name;
            params.dataType = dataType;
            params.equipmentId = id;
            params.unit = unit;
            if(name&&dataType&&unit){
                console.log(params);
                $.post(ip+'/sensor/add',params,function(data){
                    if(data.type === "COMMON_SUC"){
                        var url=window.location.href;
                        window.location.href = url;
                    }else if(data.type === "SENSOR_INSERT_ERROR"){
                        alert("传感器添加失败，请稍后再试")
                    }
                })
            }else{
                alert("请填写正确的信息");
            }

        })
    });
}

//编辑传感器
function editDataType(id,sensorId,obj){
    $(obj).parents("tr").find('td').eq(0).find('span').eq(0).css('display','none');
    $(obj).parents("tr").find('td').eq(0).find('span').eq(1).css('display','block');

    $(".eNameCancel").click(function () {
        $(this).parents("tr").find('td').eq(0).find('span').eq(0).css('display','block');
        $(this).parents("tr").find('td').eq(0).find('span').eq(1).css('display','none');
    });
    $(".eNameOk").click(function () {
        console.log(2)
        var name = $(this).parents("tr").find('td').eq(0).find('span').eq(1).find('input').val();
        console.log(name)
        var params = {};
        params.name = name;
        params.sensorId = sensorId;
        if(name){
            console.log(params);
            $.post(ip+'/sensor/update',params,function(data){
                if(data.type === "COMMON_SUC"){
                    var url=window.location.href;
                    window.location.href = url;
                }else if(data.type === "SENSOR_UPDATE_ERROR"){
                    alert("传感器编辑失败，请稍后再试")
                }
            })
        }else{
            alert("请填写正确的信息");
        }
    });
}
//删除传感器
function deleteDataType(id,sensorId,name){
    var con = confirm("确认删除 "+name+" 及其全部数据吗？");
    if(con==true){
        var params = {};
        params.sensorId = sensorId;
        $.post(ip+'/sensor/delById',params,function(json){
            if(json.type === "COMMON_SUC"){
                var url=window.location.href;
                window.location.href = url;
            }else if(json.type === "SENSOR_DELETE_ERROR"){
                alert("传感器删除失败");
            }
        }).fail(function(){
            alert("请求错误，请稍后再试");
        });
    }

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
        values['equipmentId']= id;
        values.imgUrl = "";
        console.log(values);
        $.post(ip+'/equipment/update',values,function(json){
            console.log(json);
            if(json.type === "COMMON_SUC"){
                var url=window.location.href;
                window.location.href = url;
            }else if(json.type === "Equipment_UPDATE_ERROR"){
                alert("设备信息更新失败")
            }
        }).fail(function(){
            alert("请求错误，请稍后再试")
        });
    }
}
//保存新添加的设备信息
function saveDevice(){
    if($("#Name").val()){
        var params = $("#form1").serializeArray();
        console.log(params);
        var values={};
        $.each(params,function(i,val){
            values[val.name] = val.value;
        });
        values.imgUrl = "";
        values.userId = userId;
        console.log(values);
        $.post(ip+'/equipment/add',values,function(json){
            console.log(json);
            if(json.type === "COMMON_SUC"){
                var url=window.location.href;
                window.location.href = url;
            }

        }).fail(function(){
            alert("请求错误，请稍后再试")
        });
    }else{
        alert("请填写必要信息")
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
    //$("#location").val(lng + "," + lat);
    $("#location_X").val(lng);
    $("#location_Y").val(lat);
}
function addPointEdit(lng,lat) {
    var point =  new AMap.LngLat(lng, lat);  // 创建标注
    marker.setPosition(point);            // 将标注添加到地图中
    //$("#location").val(lng + "," + lat);
    $("#location_X_edit").val(lng);
    $("#location_Y_edit").val(lat);
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
function selectImg(file){
    if(!file.files || !file.files[0]){
        return;
    }
    var reader = new FileReader();//读取文件
    reader.onload = function(event){//文件读取完成的回调函数
        image = document.getElementById('showImg');
        image.src = event.target.result;//读入文件的base64数据(可直接作为src属性来显示图片)
        image.style.width = '200px';
        image.style.height = '200px';
        //alert(event.target.result);
        //图片读取完成的回调函数（必须加上否则数据读入不完整导致出错！）
        image.onload = function(){
            canvas = convertImageToCanvas(image); //图片转canvas
            base64 = canvas.toDataURL('image/jpeg'); //将图片数据转为base64.
            alert(base64);
            $.post(
                ip+"/upload/uploadimg", //服务器接口(返回图片路径)
                {data:base64},
                function(data) {
                    alert(data.target);
                    alert(2)
                    //alert(eval(data));
                    //修改上传文件的路径名字(图片完整路径)
                    $('#img').val('http://path/'+data.target);
                }, "json");
        }
    };
    //将文件已Data URL的形式读入页面
    reader.readAsDataURL(file.files[0]);
}
// 把image 转换为 canvas对象
function convertImageToCanvas(image) {
    // 创建canvas DOM元素，并设置其宽高和图片一样
    var canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    // 坐标(0,0) 表示从此处开始绘制，相当于偏移。
    canvas.getContext("2d").drawImage(image, 0, 0);

    return canvas;
}



//展示窗口信息
var showSensors = function (infoWindow, marker1,gid) {
    infoWindow.open(mapObj, marker1.getPosition());
};
function addPoint1(lng, lat, content, typeIcon,gid) {
    var marker1 = new AMap.Marker({
        position: new AMap.LngLat(lng, lat),
        draggable: false, //点标记可拖拽
        raiseOnDrag: true//鼠标拖拽点标记时开启点标记离开地图的效果
    });
    var infoWindow = new AMap.InfoWindow({
        content: content,
        offset: new AMap.Pixel(0, 0)//-113, -140
    });
    AMap.event.addListener(marker1, 'click', function () { //鼠标点击marker弹出自定义的信息窗体
        showSensors(infoWindow, marker1,gid);
    });
    marker1.setMap(mapObj);
    markers.push(marker1);
}


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
            "info":"温湿度监控温湿度监控温湿度监控asdds2asdds2s2",
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
            "info":"asddsdds3asdds3",
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
