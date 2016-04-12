window.onload = function () {
  /**
   * aqiData，存储用户输入的空气指数数据
   * 示例格式：
   * aqiData = {
   *    '北京': 90,
   *    '上海': 40
   * };
   */
  var aqiData   = {},
      $cityInput = document.getElementById('aqi-city-input'),
      $aqiInput  = document.getElementById('aqi-value-input'),
      $addBtn    = document.getElementById('add-btn'),
      $form      = document.getElementById('form'),
      $aqiTable  = document.getElementById('aqi-table');
  
  /**
   * 从用户输入中获取数据，向aqiData中增加一条数据
   * 然后渲染aqi-list列表，增加新增的数据
   */
  function addAqiData(event) {
    var city = $cityInput.value.trim();
    var aqi = $aqiInput.value.trim();
    
    if (!city.match(/^[A-z\u4e00-\u9fa5]+$/)) {
      $cityInput.setCustomValidity('城市名必须为中英文字符');
      return;
    } else {
      $cityInput.setCustomValidity('');
    }

    if (!aqi.match(/^\d+$/)) {
      $aqiInput.setCustomValidity('空气质量指数必须为整数');
      return;
    } else {
      $aqiInput.setCustomValidity('');
    }

    $cityInput.value = '';
    $aqiInput.value = '';
    aqiData[city] = +aqi;
    console.log(aqiData);
  }

  /**
   * 渲染aqi-table表格
   */
  function renderAqiList() {
    var cities = Object.keys(aqiData);

    if (cities.length) {
      $tableHeader = ['<thead><th>城市</th><th>空气质量</th><th>操作</th></thead>'];

      $aqiTable.innerHTML = cities.reduce(function(table, city) {
        table += "<tr><td>"+city+"</td><td>"+aqiData[city]+"</td><td><button data-city='"+city+"' class='btn btn-danger'>删除</button></td></tr>";
        return table;
      }, $tableHeader);
      
    } else {
      $aqiTable.innerHTML = '';
    }
  }

  /**
   * 点击add-btn时的处理逻辑
   * 获取用户输入，更新数据，并进行页面呈现的更新
   */
  function $addBtnHandle(event) {
    addAqiData(event);
    renderAqiList();
  }

  /**
   * 点击各个删除按钮的时候的处理逻辑
   * 获取哪个城市数据被删，删除数据，更新表格显示
   */
  function delBtnHandle(city) {
    // do sth.
    delete aqiData[city];
    renderAqiList();
  }

  function init() {

    // 在这下面给add-btn绑定一个点击事件，点击时触发$addBtnHandle函数
    $addBtn.addEventListener('click', $addBtnHandle);

    // 需要阻止form提交，否则页面会刷新、数据会丢失
    $form.addEventListener('submit', function(event) {
      event.preventDefault();
    });

    // 想办法给aqi-table中的所有删除按钮绑定事件，触发delBtnHandle函数
    $aqiTable.addEventListener('click', function(event) {
      if (event.target.nodeName === 'BUTTON') {
        delBtnHandle(event.target.dataset.city);
      }
    });
  }

  init();
}