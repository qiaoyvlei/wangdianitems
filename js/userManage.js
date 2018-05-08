var map;var marker;var pos;
var image = '';
var canvas;
var base64;//将canvas压缩为base64格式
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
    var params = {};
    params.userId = '4657c0733c5048a79e7555574a1dc564';
    params.pageNo = 1 || pageIndex;
    //显示devices列表
    $.post(ip+'/equipment/find',params,function(json){
        console.log(json);
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
            console.log(json);
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
        console.log(data);
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
                addPoint(lng,lat);
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

function showDataTypes(id){
    $.post(ip+'/sensor/findDataType',{equipmentId:id},function(json){
        var firstData = json.data;
        if(json.type === "COMMON_SUC"){
            var template = $.templates("#showDataTypes_Data");
            var htmlOutput = template.render(firstData);
            $("#showDataTypes").html(htmlOutput);

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
            //编辑设备弹框
            $( ".show_dataTypes").click(function(){
                $( "#showDataTypes" ).dialog( "open" );
            });

        }else if(json.type === "Equipment_REQ_ERROR"){
            alert("设备请求参数错误！")
        }else if(json.type === "Equipment_FIND_ERROR"){
            alert("设备信息查询失败！")
        }else if(json.type === "SENSOR_NULL_ERROR"){
            alert("该设备未添加任何传感器")
        }
    }).fail(function(){
        alert("请求错误，请稍后再试")
    });
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
                ip+"/server_interface_url/", //服务器接口(返回图片路径)
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
