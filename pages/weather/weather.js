var bmap = require('../../libs/bmap-wx/bmap-wx.min.js');
var util = require('../../utils/util.js');
var QQMapWX = require('../../libs/qqmap-wx/qqmap-wx-jssdk.min.js');
var qqmapsdk;
var bmapsdk;
const app = getApp();



Page({

  /**
   * 页面的初始数据
   */
  data: {

    key: '647BZ-AOTWW-RQYRK-OKLYA-NWJUT-ASBF4', //腾讯api的开发密钥
    ak: "xaT3C9dm5ar7bbwe1n7dRn03U2UDr3GN", //百度天气api的ak
    today: new Date(),
    currentProvince: '',
    currentDistrict: '',
    currentCity: '',
    weatherData: '', //天气数据
    futureWeather: [], //未来几天天气数据
    lifeIndex: [],
    lifePicture:[],
    province: '',
    district: '',
    city: '',
now_temp:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var self = this;
    var weather = '';
    var lifePicture=["icon1/clothes.png",
      "icon1/car.png",
      "icon1/sport.png",
      "icon1/cold.png",
      "icon1/sun.png"//生活图标数组
    ];

    qqmapsdk = new QQMapWX({
      key: self.data.key
    });

    this.setData({
      today: util.formatTime(new Date()).split(' ')[0],
      // lifeIndex: this.data.lifeIndex.concat(lifePicture)
      lifePicture: lifePicture
    });

//获取从选择地址传递到gobal再传递到weather的地址参数
    self.setData({
      province: getApp().globalData.province,
      city: getApp().globalData.city,
      district: getApp().globalData.district

    });
    if (self.data.province != null && self.data.district != null && self.data.city != null){

      self.searchWeather(self.data.province, self.data.city, self.data.district);

    // TODO: DO SOMETHING
   
    console.log(getApp().globalData.province, getApp().globalData.city, getApp().globalData.district);
    if (getApp().globalData.province && getApp().globalData.city && getApp().globalData.district) {
      // 处理完成后，清空缓存值
     // getApp().globalData.province = null;
     // getApp().globalData.district = null;
     // getApp().globalData.city = null;
    }
    }else{

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
            var province = res.result.address_component.province; //省名称

            var city = res.result.address_component.city; //城市名称

            var district = res.result.address_component.district; //区名称

            //获取指定位置天气状况
           self.searchWeather(province, city, district);
          },
          fail: function(res) {
            console.log(res);
          }
        });
      }
    })
    }
   
   
   /* console.log(options);
    
    self.setData({
      province: options.province,
      city: options.city,
      district: options.district
    })*/

  },



    //传入当前城市，获取当前城市天气信息
     searchWeather : function(province, city, district) {
      //首先从数据库中查询是否存在该城市的当前天气记录，如果存在则提取出来，如果不存在则访问百度api获取该城市的天气状况
      //页面加载前，首先访问数据库，查询是否存在该城市天气记录
      var self=this;
      wx.request({

        url: 'http://localhost:8080/WechatConnectmysql/conn_servlet',

        data: {
          'method': 'query',
          'province': province,
          'city': city,
          'district': district,
          'currentDate': DATE
        },
        header: {
          'content-type': 'application/json'
        },
        //访问成功
        success: function(res) {

          if (res.data.weather != null) { //判断回传的数据是否为空，如果为空，则访问api接口，如果不为空，则直接将回传的数据显示出来
            console.log(res);
            //设置全局data里面的数据
            self.setData({
              currentProvince: province,
              currentCity: city,
              currentDistrict: district,
              weatherData: res.data.weather,
              weather: weather,
              lifeIndex: res.data.lifeIndex,
              futureWeather: res.data.futureWeather
            });
            var now_temp = self.data.weatherData.date.substring(self.data.weatherData.date.length - 4, self.data.weatherData.date.length - 1);
            self.setData({
              now_temp: now_temp
            })
            console.log(res.data.lifeIndex);
           
          } else {
            //访问api接口
            getWeather(province, city, district);

          };
        },
        //访问失败
        fail: function(res) {
          console.log("....fail....");
        }

      })
       //获取当前日期
       var DATE = util.formatDateHour(new Date());
       this.setData({
         date: DATE,
       });
      //百度地图api获取天气
      var getWeather = function(province, city, district) {
        wx.request({
          url: 'https://api.map.baidu.com/telematics/v3/weather?location=' + district + '&output=json&ak=' + self.data.ak,
          header: {
            'Content-Type': 'application/json'
          },
          success: function(res) {
            console.log(res);
      
            //设置全局信息
            self.setData({
              currentProvince: province,
              currentCity: city,
              currentDistrict: district,
              lifeIndex: res.data.results[0].index,
              weatherData: res.data.results[0].weather_data[0],
              futureWeather: res.data.results[0].weather_data,
            
            })
            var now_temp = self.data.weatherData.date.substring(self.data.weatherData.date.indexOf("：")+1, self.data.weatherData.date.length - 1);
            self.setData({
              now_temp:now_temp
            })
            console.log(res.data.results[0].weather_data[0].date.substring(res.data.results[0].weather_data[0].date.indexOf("：")+1, res.data.results[0].weather_data[0].date.length - 1));
            wx.request({
              url: 'http://localhost:8080/WechatConnectmysql/conn_servlet',

              data: {
                'method': 'add',
                'province': province,
                'city': city,
                'district': district,
                'currentDate': DATE,
                'lifeIndex': res.data.results[0].index,
                'weatherData': res.data.results[0].weather_data[0],
                'futureWeather': res.data.results[0].weather_data
              },
              header: {
                'content-type': 'application/json'
              },
              success: function(res) {
                if (res.data == null) {
                  console.log("ll");
                }
              },
              fail: function(res) {
                console.log("....fail....");
              }
            })
          },
          fail: function(res) {
            console.log(res);
          }
        })
      };

    //页面加载前，首先访问数据库，查询是否存在该城市天气记录
    // wx.request({
    //   url: 'http://localhost:8080/WechatConnectmysql/conn_servlet',

    //   data: {
    //     'method': 'query' ,
    //     'currentCity': 'currentCity',
    //     'date': 'date'
    //   },
    //   header: {
    //     'content-type': 'application/json'
    //   },
    //   //访问成功
    //   success: function (res) {

    //     if (res.data!=null) {  //判断回传的数据是否为空，如果为空，则访问api接口，如果不为空，则直接将回传的数据显示出来
    //       //显示回传数据
    //       var weatherData=console.log(res.data)

    //     } else {
    //       //访问api接口

    //       //设置全局data里面的数据
    //       that.setData({
    //         weatherData: weatherData,
    //         futureWeather: futureWeather
    //       });
    //       console.log(that.data.weatherData);

    //       DBRequest();
    //     };
    //   },
    //   //访问失败
    //   fail: function (res) {
    //     console.log("....fail....");
    //   }

    // })

    //   var DBRequest = function() {
    //     wx.request({
    //       url: 'http://localhost:8080/WechatConnectmysql/conn_servlet',

    //       data: {
    //         'method': 'add',
    //         'weatherData': that.data.weatherData

    //       },
    //       header: {
    //         'content-type': 'application/json'
    //       },
    //       success: function(res) {
    //         if(res.data==null){

    //         }
    //         console.log(res.data);
    //       },
    //       fail: function(res) {
    //         console.log("....fail....");
    //       }

    //     })
    //   }
},
  local: function () {
    wx.navigateTo({ url: '../index/index' })
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
  },
  

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    var self = this;
    setTimeout(() => {
     wx.setNavigationBarTitle({ 
       title: '刷新中……'
      })//动态设置当前页面的标题。     
      wx.showNavigationBarLoading();//在当前页面显示导航条加载动画。     
      self.onLoad();//重新加载产品信息     
      wx.hideNavigationBarLoading();//隐藏导航条加载动画。     
      wx.stopPullDownRefresh();//停止当前页面下拉刷新。     
     
      wx.setNavigationBarTitle({

        title: '空气质量'

      })//动态设置当前页面的标题。
  }, 1000);

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var arr = this.data, max = Math.max(...arr);
    if (this.data.count < 1) {
      for (var i = max + 1; i <= max + 3; ++i) {
        arr.push(i);
      }
      this.setData({
        dataList: arr,
        count: ++this.data.count
      });
    } else {
      wx.showToast({
        title: '没有更多数据了！',
        image: '../../images/icon/noData1.png',
        mask: true,
        duration: 2000
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
      var that = this;

      return {

        title: '',

        path: '/pages/weather/weather',

        success: function (res) {

          // 转发成功
          that.shareClick();

        },

        fail: function (res) {
          // 转发失败
          console.log('转发失败');

        }

      }

    },

  
})