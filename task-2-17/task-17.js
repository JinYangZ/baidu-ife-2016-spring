window.onload = function () {
  /* 数据格式演示
  var aqiSourceData = {
    '北京': {
      '2016-01-01': 10,
      '2016-01-02': 10,
      '2016-01-03': 10,
      '2016-01-04': 10
    }
  };
  */

  // 以下两个函数用于随机模拟生成测试数据
  function getDateStr(dat) {
    var y = dat.getFullYear();
    var m = dat.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    var d = dat.getDate();
    d = d < 10 ? '0' + d : d;
    return y + '-' + m + '-' + d;
  }
  function randomBuildData(seed) {
    var returnData = {};
    var dat = new Date('2016-01-01');
    var datStr = ''
    for (var i = 1; i < 92; i++) {
      datStr = getDateStr(dat);
      returnData[datStr] = Math.ceil(Math.random() * seed);
      dat.setDate(dat.getDate() + 1);
    }
    return returnData;
  }

  var aqiSourceData = {
    '北京': randomBuildData(500),
    '上海': randomBuildData(300),
    '广州': randomBuildData(200),
    '深圳': randomBuildData(100),
    '成都': randomBuildData(300),
    '西安': randomBuildData(500),
    '福州': randomBuildData(100),
    '厦门': randomBuildData(100),
    '沈阳': randomBuildData(500)
  };

  // 用于渲染图表的数据
  var chartData = {};

  // 记录当前页面的表单选项
  var pageState = {
    nowSelectCity: '北京',
    nowGraTime: 'day'
  }

  
  function getColor(aqi) {
    // aqi scale colors: http://www.air.dnr.state.ga.us/information/aqi.html 
    
    // var colors = ["#00BB00", "#FFFF66", "#FF9800", 
    //               "#FF0000", "#990044", "#000000"]
    var colors = ["#7dd096", "#ffe89a", "#eca400", 
                  "#b24d37", "#9e5c75", "#727272"]

    switch(true) {
      case (aqi <= 50):
        return colors[0]
        break;
      case (aqi <= 100):
        return colors[1]
        break;
      case (aqi <= 150):
        return colors[2]
        break;
      case (aqi <= 200):
        return colors[3]
        break;
      case (aqi <= 300):
        return colors[4]
        break;
      default:
        return colors[5]
    }
  }

  /**
   * 渲染图表
   */
  function renderChart() {
    var $wrap        = document.getElementsByClassName('aqi-chart-wrap')[0],
        $debug       = document.getElementById('debug-wrap'),
        selectedData = chartData[pageState.nowGraTime][pageState.nowSelectCity];

    var keys       = Object.keys(selectedData),
        count      = keys.length,
        totalWidth = $wrap.clientWidth,
        width      = totalWidth/(count*2);
        

    $wrap.innerHTML = keys.map(function(key, i){
                        var aqi   = selectedData[key],
                            color = getColor(aqi);
                        return '<div\
                          style="height: '+aqi+'px;\
                                 width:'+width+'px;\
                                 background-color: '+color+';"\
                          title="'+key+' 空气质量：'+aqi+'"></div>'
                      })
                      .join('');


    $debug.innerHTML = keys.map(function(data){
                         return data+': '+selectedData[data]+'<br>';
                       })
                       .join('');

    console.log($wrap);
  }

  /**
   * 日、周、月的radio事件点击时的处理函数
   */
  function graTimeChange() {
    var graTime = this.value;

    // 确定是否选项发生了变化
    if (pageState.nowGraTime != graTime) {
      // 设置对应数据
      pageState.nowGraTime = graTime;
      // 调用图表渲染函数
      renderChart();
    } 
  }

  /**
   * select发生变化时的处理函数
   */
  function citySelectChange() {
    var selectCity = this.value;

    // 确定是否选项发生了变化 
    if (pageState.nowSelectCity != selectCity) {
      // 设置对应数据
      pageState.nowSelectCity = selectCity;
      // 调用图表渲染函数
      renderChart();
    }
  }

  /**
   * 初始化日、周、月的radio事件，当点击时，调用函数graTimeChange
   */
  function initGraTimeForm() {
    var $graTimeInputs = document.getElementsByName('gra-time');

    [].forEach.call($graTimeInputs, function($input){
      $input.addEventListener('click', graTimeChange);
    });
  }

  /**
   * 初始化城市Select下拉选择框中的选项
   */
  function initCitySelector() {
    var $citySelect = document.getElementById('city-select');

    // 读取aqiSourceData中的城市，然后设置id为city-select的下拉列表中的选项
    // by extracting an array of city names from aqiSourceData,
    //    mapping it into one of options, and then
    //    joining them together into a string.
    $citySelect.innerHTML = Object.keys(aqiSourceData)  
                                  .map(function(city) {
                                    return '<option>' + city + '</option>';
                                  })
                                  .join('');

    // 给select设置事件，当选项发生变化时调用函数citySelectChange
    $citySelect.addEventListener('change', citySelectChange);
  }

  /**
   * 初始化图表需要的数据格式
   */
  function initAqiChartData() {
    // 将原始的源数据处理成图表需要的数据格式
    // 处理好的数据存到 chartData 中

    function daysToMonths(daysData) {
      // calculate total and count
      var monthsData = Object.keys(daysData)
                             .reduce(function(acc, day) {
                                var month = day.slice(0, 7);

                                if (!acc[month]) {
                                  acc[month] = {total: 0, count: 0};
                                }
                                acc[month].total += daysData[day];
                                acc[month].count += 1;

                                return acc;
                             }, {});
                             
      // calculate average
      monthsData = Object.keys(monthsData)
                         .reduce(function(acc, month) {
                            var total = monthsData[month].total,
                                count = monthsData[month].count;
                            acc[month] = Math.round(total / count);
                            return acc;
                         }, {});
      return monthsData;
    }

    function daysToWeeks(daysData) {
      var days = Object.keys(daysData),
          week = 0;

      // calculate total and count; mark start and end of days
      var weeksData = days.reduce(function(acc, day, i){
                        if (!acc[week]) {
                          acc[week] = {total: 0, count: 0};
                          acc[week].start = day;
                        }
                        acc[week].total += daysData[day];
                        acc[week].count += 1;
                        
                        // console.log(day, daysData[day], 'Days of week:', dayDate.getDay(), "Week:", week);      
                        
                        var dayDate  = new Date(day);
                        //每逢周日：++week并标记endDay
                        if (dayDate.getDay() == 0) {
                          acc[week++].end = day;  
                        }
                        //days循环结束：标记endDay
                        if (i == days.length-1) {
                          acc[week].end = day;
                        }

                        return acc;
                      }, {});

      // calculate average
      weeksData = Object.keys(weeksData)
                        .reduce(function(acc, week) {
                          var weekLabel = weeksData[week].start+'~'+weeksData[week].end,
                              total = weeksData[week].total,
                              count = weeksData[week].count;
                          acc[weekLabel] = Math.round(total / count);
                          return acc;
                        }, {});
      return weeksData;
    }

    // 数据格式演示
    // chartData.month = {
    //   '北京': {
    //     '2016-01': 10,
    //     '2016-02': 10,
    //     '2016-03': 10,
    //   }
    // };
    // chartData.week = {
    //   '北京': {
    //     '2016-01-01~2016-01-03': 10,
    //     '2016-01-04~2016-01-10': 10,
    //     '2016-01-11~2016-01-17': 10,
    //   }
    // }; 
    // chartData.day = {
    //   '北京': {
    //     '2016-01-01': 10,
    //     '2016-01-02': 10,
    //     '2016-01-03': 10,
    //   }
    // };

    var cities = Object.keys(aqiSourceData);

    chartData.month = cities.reduce(function(acc, city) {
                        acc[city] = daysToMonths(aqiSourceData[city]);
                        return acc;
                      }, {});

    chartData.week = cities.reduce(function(acc, city) {
                        acc[city] = daysToWeeks(aqiSourceData[city]);
                        return acc;
                      }, {});

    chartData.day = aqiSourceData;

    // console.log('initAqiChartData:', chartData);
 
    renderChart();
  }

  /**
   * 初始化函数
   */
  function init() {
    initGraTimeForm();
    initCitySelector();
    initAqiChartData();
  }

  init();

}