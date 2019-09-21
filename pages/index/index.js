//index.js
//获取应用实例
// var app = getApp()
// var util = require('../../utils/util.js')
var area = require('../../libs/area.js')
var QQMapWX = require('../../libs/qqmap-wx/qqmap-wx-jssdk.min.js');
var qqmapsdk;

var areaInfo = []; //所有省市区县数据

var provinces = []; //省

var citys = []; //城市

var countys = []; //区县

var index = [0, 0, 0];

var cellId;

var t = 0;
var show = false;
var moveY = 200;

var app = getApp();

Page({
  data: {
    show: show,
    provinces: provinces,
    citys: citys,
    countys: countys,
    value: [0, 0, 0],
    key: '647BZ-AOTWW-RQYRK-OKLYA-NWJUT-ASBF4', //腾讯api的开发密钥
  },
  //滑动事件
  bindChange: function(e) {
    var val = e.detail.value
    // console.log(e)
    //判断滑动的是第几个column
    //若省份column做了滑动则定位到地级市和区县第一位
    if (index[0] != val[0]) {
      val[1] = 0;
      val[2] = 0;
      getCityArr(val[0], this); //获取地级市数据
      getCountyInfo(val[0], val[1], this); //获取区县数据
    } else { //若省份column未做滑动，地级市做了滑动则定位区县第一位
      if (index[1] != val[1]) {
        val[2] = 0;
        getCountyInfo(val[0], val[1], this); //获取区县数据
      }
    }
    index = val;

    console.log(index + " => " + val);

    //更新数据
    this.setData({
      value: [val[0], val[1], val[2]],
      province: provinces[val[0]].name,
      city: citys[val[1]].name,
      district: countys[val[2]].name
    })

  },
  onLoad: function(options) {
    cellId = options.cellId;
    var that = this;
    var date = new Date()
    console.log(date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日");

    //获取省市区县数据
    area.getAreaInfo(function(arr) {
      areaInfo = arr;
      //获取省份数据
      getProvinceData(that);
    });

    qqmapsdk = new QQMapWX({ //腾讯api初始化
      key: that.data.key
    });

  },
  // ------------------- 分割线 --------------------
  onReady: function() {
    this.animation = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: 0,
      timingFunction: "ease",
      delay: 0
    })
    this.animation.translateY(200 + 'vh').step();
    this.setData({
      animation: this.animation.export(),
      show: show
    })
  },
  //移动按钮点击事件
  translate: function(e) {
    if (t == 0) {
      moveY = 0;
      show = false;
      t = 1;
    } else {
      moveY = 200;
      show = true;
      t = 0;
    }
    // this.animation.translate(arr[0], arr[1]).step();
    animationEvents(this, moveY, show);

  },

  //隐藏弹窗浮层
  hiddenFloatView(e) {
    console.log(e);
    moveY = 200;
    show = true;
    t = 0;
    animationEvents(this, moveY, show);

  },
  //页面滑至底部事件
  onReachBottom: function() {
    // Do something when page reach bottom.
  },

  searchMt: function(e) {
    var that = this;
    app.globalData.province = e.currentTarget.dataset.cid1;
    app.globalData.city = e.currentTarget.dataset.cid2;
    app.globalData.district = e.currentTarget.dataset.cid3;
    qqmapsdk.geocoder({
      address: app.globalData.province + app.globalData.city + app.globalData.district + '', //传入地址
      success: function(res) {
        // var latitude = res.result.location.latitude;

        //  var longitude = res.result.location.longitude; //接口调用成功，取得地址坐标！！
        //这里是调用小程序提供的地图接口，将上面获取的坐标传入
        console.log(res);
        app.globalData.latitude = res.result.location.lat;
        app.globalData.longitude = res.result.location.lng; //接口调用成功，取得地址坐标！


        // console.log("选择的经纬度：" + res.result.location.lat, res.result.location.lng);
      },
      fail: function(res) {
        // console.log(res);     
      },
      complete: function(res) {
        // console.log(res);    
      }
    });

    wx.switchTab({
      url: '../../pages/weather/weather',
      success: function(res) {
        console.log("11");
        console.log(res);
        var page = getCurrentPages().pop();

        if (page == undefined || page == null) return;
        page.onLoad();
        //  page.serchAirQuality();
      },
      fail: function(res) {
        console.log(that.data.province);
        console.log(res);
      },
      complete: function() {
        console.log("33");

      }
    })
  },
  local: function(e) {
    var that = this;
    //微信工具获取当前具体位置，返回经纬度信息
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        console.log("当前经纬度：" + res.latitude + "," + res.longitude);
        //腾讯地图将当前经纬度转换成城市具体信息
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },

          success: function(res) {
            console.log(res);
            app.globalData.province = res.result.address_component.province; //省名称

            app.globalData.city = res.result.address_component.city; //城市名称

            app.globalData.district = res.result.address_component.district; //区名称
            app.globalData.latitude=res.result.location.lat;
            app.globalData.longitude = res.result.location.lng;

            wx.switchTab({
              url: '../../pages/weather/weather',
              success: function (res) {
                console.log("定位成功");
                console.log(res);
                var page = getCurrentPages().pop();

                if (page == undefined || page == null) return;
                page.onLoad();
              },
              fail: function (res) {
                console.log(that.data.province);
                console.log(res);
              },
              complete: function () {
                console.log("99");

              }
            })
          },
          fail: function(res) {
            console.log(res);
          }
        });
      }
    })

    
  },
})

//动画事件
function animationEvents(that, moveY, show) {
  console.log("moveY:" + moveY + "\nshow:" + show);
  that.animation = wx.createAnimation({
    transformOrigin: "50% 50%",
    duration: 400,
    timingFunction: "ease",
    delay: 0
  })
  that.animation.translateY(moveY + 'vh').step()

  that.setData({
    animation: that.animation.export(),
    show: show
  })

}

// ---------------- 分割线 ---------------- 

//获取省份数据
function getProvinceData(that) {
  var s;
  provinces = [];
  var num = 0;
  for (var i = 0; i < areaInfo.length; i++) {
    s = areaInfo[i];
    if (s.di == "00" && s.xian == "00") {
      provinces[num] = s;
      num++;
    }
  }
  that.setData({
    provinces: provinces
  })

  //初始化调一次
  getCityArr(0, that);
  getCountyInfo(0, 0, that);
  that.setData({
    province: "北京市",
    city: "市辖区",
    district: "东城区",
  })

}

// 获取地级市数据
function getCityArr(count, that) {
  var c;
  citys = [];
  var num = 0;
  for (var i = 0; i < areaInfo.length; i++) {
    c = areaInfo[i];
    if (c.xian == "00" && c.sheng == provinces[count].sheng && c.di != "00") {
      citys[num] = c;
      num++;
    }
  }
  if (citys.length == 0) {
    citys[0] = {
      name: ''
    };
  }

  that.setData({
    city: "",
    citys: citys,
    value: [count, 0, 0]
  })
}

// 获取区县数据
function getCountyInfo(column0, column1, that) {
  var c;
  countys = [];
  var num = 0;
  for (var i = 0; i < areaInfo.length; i++) {
    c = areaInfo[i];
    if (c.xian != "00" && c.sheng == provinces[column0].sheng && c.di == citys[column1].di) {
      countys[num] = c;
      num++;
    }
  }
  if (countys.length == 0) {
    countys[0] = {
      name: ''
    };
  }
  that.setData({
    district: "",
    countys: countys,
    value: [column0, column1, 0]
  })
}