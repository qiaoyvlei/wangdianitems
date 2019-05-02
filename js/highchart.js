/**
 * Created by Administrator on 2018/11/1.
 */
var datas=[],names=["temperature","illumination","speed","direction","rainfall","isRain","mq135","mq2", "humidity","pressure","altitude","voltage","pitch","roll","yaw"];
var cname=['温度传感器(℃)','光照传感器(lux)','风速传感器(m/s)',
    '风向传感器','风向传感器','是否下雨传感器','有害气体传感器(Nm3/h)',
    '烟雾传感器(Nm3/h)','湿度传感器(%RH)','大气压强传感器(Pa)','海拔高度传感器(m)']
$(".dfg").ready(function() {
    var chart = {
        type: 'spline',
        animation: Highcharts.svg,// don't animate in IE < IE 10.
        marginRight: 10,
        marginTop:60,
        events: {
            load: function () {
                // set up the updating of the chart each second
                var series = this.series[0];
                setInterval(function () {
                    $.ajax({
                        url: "http://47.100.6.42/electric/get_data.php",
                        type: 'post',
                        dataType: "json",
                        async: false,
                        cache: false,
                        success: function (res){
                            //console.log(res);
                            for(var i=0;i<res.length;i++){
                                var nn=res[i].split("");
                                var len=res[i].split("").length;
                                for(var j=0;j<len;j++){
                                    if(res[i].split("")[j]==':'){
                                        var dd=nn.slice(j+1,len).join('');
                                        datas.push(dd);
                                        break;
                                    }
                                }
                            }
                            var x=(new Date()).getTime();
                            for(var i=0;i<2;i++){
                                var y=Number(datas[i]);
                                series.addPoint([x, y], true, true);
                            }
                        }
                    });
                }, 1000);
            }
        }
    };
    var xAxis = {
        type: 'datetime',
        tickPixelInterval: 150//横轴的间距
    };
    var yAxis = {
        title: {
            text: 'Value'
        },
        plotLines: [{
            value: 0,
            width: 3,
            color: '#808080'//横轴的线颜色
        }]
    };
    //标注
    var tooltip = {
        formatter: function () {
            //console.log(this.x);
            return '<b>' + this.series.name + '</b><br/>' +
                Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                Highcharts.numberFormat(this.y, 2);
        }
    };
    //以平滑的曲线展现
    var plotOptions = {
        area: {
            pointStart: 1940,
            marker: {
                enabled: false,
                symbol: 'circle',
                radius: 2,
                states: {
                    hover: {
                        enabled: true
                    }
                }
            }
        }
    };
    var legend = {
        enabled: false
    };
    var credits={
        enabled:false
    };
    var exporting = {
        enabled: false
    };
    var series= [{
        name: 'Random data',
        data: (function () {
            // generate an array of random data
            var data = [],time = (new Date()).getTime(),i;
            for (i = -6; i <= 0; i += 1) {//代表有多少个点
                data.push({
                    x: time + i * 1000,
                    y:(Math.random() * (1.1 - 1) + 1)*20
                });
            }
            //console.log(data);
            return data;
        }())
    }];
    for(var i=0;i<2;i++){
        var title = {
            //text: 'Live random data'
            text: names[i]+cname[i]
        };
        var json = {};
        json.chart = chart;
        json.title = title;
        json.tooltip = tooltip;
        json.xAxis = xAxis;
        json.yAxis = yAxis;
        json.legend = legend;
        json.exporting = exporting;
        json.series = series;
        json.plotOptions = plotOptions;
        json.credits=credits;
        Highcharts.setOptions({
            global: {
                useUTC: false
            }
        });
        $('.container'+i).highcharts(json);
    }

});