$(function () {
    //userId = '4657c0733c5048a79e7555574a1dc564';
    var userId = getCookie("userId");
    if(userId){
        $('.logined').css('display','inline-block');
        $('.unlogin').css('display','none');
    }else{
        $('.unlogin').css('display','inline-block');
        $('.logined').css('display','none');
    }
    var equipmentId = window.location.href.split('?')[1].split('=')[1];
    //equipmentId = 'df4d7ff823234c6291522951ae7ee10b';
    var params = {};
    params.equipmentId = equipmentId;
    //这个设备的基本信息
    $.post(ip+'/equipment/find',params,function(json){
        //console.log(json)
        var template = $.templates("#equipmentInfo");
        var htmlOutput = template.render(json.data.equipments);
        $(".equipmentInfo").html(htmlOutput);
        //title名称
        document.title = json.data.equipments[0].name;
        //数据导出弹框
        $( "#data-export").click(function(){
            $( "#data_export" ).dialog( "open" );
        });
        //数据导出弹出框
        $( "#data_export" ).dialog({
            autoOpen: false,
            height: 300,
            width: 650,
            modal: true,
            resizable:false

        });
        //时间选择
        $( "#from" ).datepicker({
            defaultDate: "+1w",
            changeMonth: true,
            numberOfMonths: 1,
//      showButtonPanel: true,
            dateFormat: 'yy-mm-dd',//日期格式
            minDate:"-2M",
            maxDate:"today",
            yearSuffix: '年', //年的后缀
            showMonthAfterYear:true,//是否把月放在年的后面
            monthNamesShort: ['一','二','三','四','五','六',
                '七','八','九','十','十一','十二'],
            dayNamesMin: ['日','一','二','三','四','五','六'],
            onSelect: function( selectedDate ) {
                $( "#to" ).datepicker( "option", "minDate", selectedDate );
            }
        });
        $( "#to" ).datepicker({
            defaultDate: "+1w",//
            changeMonth: true,
            dateFormat: 'yy-mm-dd',//日期格式
            numberOfMonths: 1, //显示几个月
//      showButtonPanel: true, //是否显示按钮面板
            yearSuffix: '年', //年的后缀
            showMonthAfterYear:true,//是否把月放在年的后面
            minDate:"-2M",
            maxDate:"today",
            monthNamesShort: ['一','二','三','四','五','六',
                '七','八','九','十','十一','十二'],
            dayNamesMin: ['日','一','二','三','四','五','六'],
            onSelect: function( selectedDate ) {
                $( "#from" ).datepicker( "option", "maxDate", selectedDate );
            }
        });
        //确认提交，进行导出数据
        $(".submit #submit").click(function(e){
            //验证select
            if(0==$('#sela').val()){
                $('.requiredType').css("display","inline");
                return false;
            }else if(0==$('#from').val()||$('#to').val()==0){
                $('.requiredTime').css("display","inline");
                return false;
            }else{
                //关闭弹框
                $( "#data_export" ).dialog('close');
                var hms = ' '+new Date().getHours()+':'+new Date().getMinutes()+':'+new Date().getSeconds();
                //ajax异步加载
                var dataType = $('#sela').val(),
                    beginTime=$('#from').val()+hms,
                    endTime=$('#to').val()+hms,
                    equipmentId=$('#equipmentId').html();

                var params = {
                    "equipmentId":equipmentId,
                    "dataTypes":dataType,
                    "beginTime":new Date(beginTime).getTime(),
                    "endTime":new Date(endTime).getTime()
                };
                var encodeParam = function(json) {
                    var tmps = [];
                    for ( var key in json) {
                        tmps.push(key + '=' + json[key]);
                    }
                    return tmps.join('&');
                };
                var url=ip+"/data/dataLoad?"+encodeParam(params);
                const elink = document.createElement('a');// 创建a标签
                elink.style.display = 'none';
                elink.href = url;
                document.body.appendChild(elink);
                elink.click();// 触发点击a标签事件
                document.body.removeChild(elink);

                //重置表单
                resetData();
            }
        });
    });

    //这个设备支持的传感器类型
    $.post(ip+'/sensor/findDataType',params,function(json){
        //遍历设备传感器，将其填入option中
        if(json.type === "COMMON_SUC"){
            $.each(json.data.sensorTypeResps,function(index,html){
                $('#sela').append(
                    $('<option></option>')
                        .text(html.name)
                        .val(html.dataType)
                );
            });
        }else if(json.type === "SENSOR_NULL_ERROR"){
            alert("该设备未添加任何传感器，请先添加传感器！");
        }
        //数据类型选择
        $("#sela").multiselect({
            noneSelectedText: "==请选择要导出的数据==",
            checkAllText: "全选",
            uncheckAllText: '全不选'
            ,selectedList:8
            ,minWidth:325
        });
    });
    //根据json数据绘制折线图
    $.post(ip+'/sensor/findDataType',params,function(json){
        if(json.type === "COMMON_SUC") {
            $.each(json.data.sensorTypeResps, function (index, data) {
                drawChart(equipmentId, data.dataType, 0);
            });
            //setInterval(
            //    function(){
            //        $.each(json.data.sensorTypeResps, function (index, data){
            //            drawChart(equipmentId, data.dataType, 0);
            //        })
            //    },
            //10000);
            var template1 = $.templates("#showEveryEquipmentData");
            var htmlOutput1 = template1.render(json.data);
            $(".showEveryEquipmentData").html(htmlOutput1);
        }
    });

});

//纵坐标值
function getValue(y){
    return y;
    if(y==1)
        return "关闭";
    else
        return y;
}

//设备id，哪个传感器，时段,    绘制类型(可选)，纵坐标(可选),单位(可选)
function drawChart(id,dataType,no,ctype,ytitle,unit){
    if (ytitle == undefined) ytitle = '';
    var step = false;
//    if (ctype == undefined || ctype == null || ctype == '')
//      ctype = $("#ctype" + id).val();
    if (ctype == null || ctype == "smoothedLine")
        ctype = "spline";
    if (ctype == "step") { ctype = ""; step = "left" }

    if (unit == undefined || unit == null || unit == '')
        unit = $("#" + id).val();

    var containerId = id+dataType;
    var parmas = {};
    parmas.equipmentId=id;
    parmas.dataType=dataType;
    switch(no){
        //实时
        case 0:
            break;
        //最近一天
        case 1:
            parmas.beginTime=getDate(1);
            break;
        //最近一周
        case 2:
            parmas.beginTime=getDate(7);
            break;
        //最近一月
        case 3:
            parmas.beginTime=getDate(30);
            break;
    }
    parmas.endTime=new Date().getTime();
    $("#" + containerId).html('<img src="../images/loading.gif" align="center" style="margin-top:80px;" />');
    $.post(ip+'/data/find',parmas,function(json){
        console.log(json);
        if(json.type === "COMMON_SUC"){
            var data = json.data;
            res = [];
            for (var i in data) {
                var item = [];
                var it=[];
                for (var j in data[i]) item.push(data[i][j]);
                for(var k =0;k<1;k++) it.push(new Date(item[item.length-2]).getTime(),Number(item[0]))
                res.push(it)
            }
            var unit = data[0].unit;
            data = res;
            var data1 = data.reverse();
            if (data == "" || data == undefined || data == null) {
                $("#" + containerId).html('<div style="color:gray;padding-top:80px;">No data.</div>');
                return;
            }
            console.log(data);
            Highcharts.setOptions({ global: { useUTC: false } });
            chart = new Highcharts.Chart({
                chart: {
                    renderTo: containerId,
                    type: ctype,
                    animation: false,
                    zoomType: 'x',
                    events:{
                        load:function(){
                            var series = this.series[0],
                                chart = this;
                            activeLastPointToolip(chart);
                            var as = 0;
                            var x,y = 0;
                            $.post(ip+'/data/find',parmas,function(json) {
                                if(json.type === "COMMON_SUC") {
                                    as = new Date(json.data[0].time).getTime();// 当前时间
                                }
                            });
                            //绘制实时更新的数据
                            setInterval(function () {
                                $.post(ip+'/data/find',parmas,function(json) {
                                    if(json.type === "COMMON_SUC") {
                                            x = new Date(json.data[0].time).getTime();// 当前时间
                                            y = Number(json.data[0].data);
                                        if(as !== x){
                                            series.addPoint([x, y], true, true);
                                            activeLastPointToolip(chart);
                                        }
                                    }
                                });
                                as = x;
                            }, 5000);
                        }
                    }
                },
                legend: {
                    enabled: false
                },
                title: {
                    text: ''
                },
                xAxis: {
                    type: 'datetime'
                },
                yAxis: {
                    title: {
                        text: ytitle
                    },

                    minorGridLineWidth: 0,
                    gridLineWidth: 1,
                    alternateGridColor: null
                },
                tooltip: {
                    formatter: function() {
                        return '' +
                            Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br><b>Value:' + getValue(this.y) + unit + '</b>';
                    }
                },
                plotOptions: {
                    spline: {
                        lineWidth: 2,
                        states: {
                            hover: {
                                lineWidth: 3
                            }
                        },
                        marker: {
                            enabled: false,
                            states: {
                                hover: {
                                    enabled: true,
                                    symbol: 'circle',
                                    radius: 3,
                                    lineWidth: 1
                                }
                            }
                        }

                    },
                    line: {
                        lineWidth: 1,
                        states: {
                            hover: {
                                lineWidth: 1
                            }
                        },
                        marker: {
                            enabled: false,
                            states: {
                                hover: {
                                    enabled: true,
                                    symbol: 'circle',
                                    radius: 3,
                                    lineWidth: 1
                                }
                            }
                        }

                    }
                },
                series: [{
                    data: data1
                }],
                credits: {
                    enabled: false     //去掉highcharts网站url
                },
                exporting:{
                    enabled:false //用来设置是否显示‘打印’,'导出'等功能按钮，不设置时默认为显示
                },
                legend: {
                    enabled: false
                },
                navigation: {
                    menuItemStyle: {
                        fontSize: '10px'
                    }
                }
            });
        }
        else if(json.type ==="DATA_REQ_ERROR"){
            alert("数据请求参数错误,请检查参数");
        }
        else if(json.type === "DATA_FIND_ERROR"){
            alert("数据查询失败,请稍后再试")
        }
    }).fail(function(json){
        alert("请求失败，请稍后再试")
    });
}
function activeLastPointToolip(chart) {
    var points = chart.series[0].points;
    chart.tooltip.refresh(points[points.length -1]);
}
function getDate(index){
    var date = new Date(); //当前日期
    var newDate = new Date(date.getTime() - index*24*60*60*1000);
    return newDate.getTime();
}
//重置
function resetData(){
    $("#sela").multiselect("uncheckAll");
    document.getElementById('from').value="";
    document.getElementById('to').value="";
}
$(".submit #resetButton").click(function(){
    resetData();
});




