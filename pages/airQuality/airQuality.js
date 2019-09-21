var bmap = require('../../libs/bmap-wx/bmap-wx.min.js');
var util = require('../../utils/util.js');
var QQMapWX = require('../../libs/qqmap-wx/qqmap-wx-jssdk.min.js');
var qqmapsdk;
var bmapsdk;
var stationJson = require('../../libs/Station.js');



Page({

  /**
   * 页面的初始数据
   */
  data: {

    key: '647BZ-AOTWW-RQYRK-OKLYA-NWJUT-ASBF4',
    today: new Date(),
    province: '',
    district: '',
    city: '',
    result: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    var self = this;
    var weather = '';
    var latitude = '';
    var longitude = '';

    qqmapsdk = new QQMapWX({
      key: self.data.key
    });

    this.setData({
      today: util.formatTime(new Date()).split(' ')[0],
      // lifeIndex: this.data.lifeIndex.concat(lifePicture)
    });


    //获取从选择地址传递到gobal再传递到weather的地址参数
    self.setData({
      province: getApp().globalData.province,
      city: getApp().globalData.city,
      district: getApp().globalData.district,
      latitude: getApp().globalData.latitude,
      longitude: getApp().globalData.longitude

    });
    if (self.data.province != null && self.data.district != null && self.data.city != null) {

      self.searchAirQuality(self.data.province, self.data.city, self.data.district);

      // TODO: DO SOMETHING

      console.log(getApp().globalData.province, getApp().globalData.city, getApp().globalData.district);
      console.log("经纬" + self.data.latitude, self.data.longitude);
      if (getApp().globalData.province && getApp().globalData.city && getApp().globalData.district) {
        // 处理完成后，清空缓存值
        //getApp().globalData.province = null;
        //getApp().globalData.district = null;
        //getApp().globalData.city = null;
      }
    } else {



      //微信工具获取当前具体位置，返回经纬度信息
      wx.getLocation({
        type: 'wgs84',
        success: function(res) {
          latitude = res.latitude;
          longitude = res.longitude;
          self.setData({
            latitude: res.latitude,
            longitude: res.longitude
          })
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
              self.searchAirQuality(province, city, district);

            },
            fail: function(res) {
              console.log(res);
            }
          });
        }
      })
    }


  },
  //传入当前城市，获取当前城市天气信息
  searchAirQuality: function(province, city, district) {
    //首先从数据库中查询是否存在该城市的当前天气记录，如果存在则提取出来，如果不存在则访问百度api获取该城市的天气状况
    var self = this;
    //页面加载前，首先访问数据库，查询是否存在该城市天气记录
    wx.request({

      url: 'http://localhost:8080/WechatConnectmysql/conn_servlet',

      data: {
        'method': 'queryAir',
        'province': province,
        'city': city,
        'district': district,
        'createdDate': DATE
      },
      header: {
        'content-type': 'application/json'
      },
      //访问成功
      success: function(res) {

        if (res.data.airQuality != null) { //判断回传的数据是否为空，如果为空，则访问api接口，如果不为空，则直接将回传的数据显示出来
          console.log("res", res);
          //设置全局data里面的数据
          self.setData({
            province: province,
            city: city,
            district: district,
            result: res.data.result

          });
          //console.log(res.data.lifeIndex);

        } else {
          //访问api接口
          getAirQuality(province, city, district);

        };
      },
      //访问失败
      fail: function(res) {
        console.log("....fail....");
      }

    })
    var DATE = util.formatDateHour(new Date());
    this.setData({
      date: DATE,
    });

    //传入当前城市，获取当前城市天气信息
    //api获取
    var getAirQuality = function(province, city, district) {
      //获取从选择地址传递到gobal再传递到weather的地址参数
      self.setData({
        latitude1: getApp().globalData.latitude,
        longitude1: getApp().globalData.longitude

      });

      console.log("选择的经纬度：" + self.data.latitude, self.data.longitude);
      if (self.data.province != null && self.data.district != null && self.data.city != null) {
        wx.request({
          url: 'https://api.apishop.net/common/air/getNearestStationAirQuality', //请求接口地址

          data: {

            'apiKey': 'N9mZBJJbf80a8407463c504a856a7dc6b9754cb828a45d7',
            'method': 'POST',
            //'latitude': latitude,
            //'longitude': longitude,
            'latitude': self.data.latitude1,
            'longitude': self.data.longitude1,
            'city': city

          },
          header: {
            'Content-Type': 'application/json'
          },
          success: function(res) {
            //设置全局信息
            self.setData({
              province: province,
              city: city,
              district: district,
              statusCode: res.data.statusCode,
              // result: stationJson.result,
              desc: res.data.desc,
              result: res.data.result,



            });
            
         //   console.log(stationJson.result);
            //获取当前日期
        
            wx.request({
              url: 'http://localhost:8080/WechatConnectmysql/conn_servlet',
              header: {
                'content-type': 'application/json'
              },
              data: {
                'method': 'addAir',
                'province': province,
                'city': city,
                'district': district,
                'createdDate': DATE,
               // result: stationJson.result
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
            //  console.log(dataList);
          },
          fail: function(res) {
            console.log(res);
          }
        })
      
      }else{
        wx.request({
          url: 'https://api.apishop.net/common/air/getNearestStationAirQuality', //请求接口地址

          data: {

            'apiKey': 'N9mZBJJbf80a8407463c504a856a7dc6b9754cb828a45d7',
            'method': 'POST',
            'latitude': self.data.latitude,
            'longitude': self.data.longitude,
            'city': city

          },
          header: {
            'Content-Type': 'application/json'
          },
          success: function (res) {
            //设置全局信息
            self.setData({
              province: province,
              city: city,
              district: district,
              statusCode: res.data.statusCode,
              // result: stationJson.result,
              desc: res.data.desc,
              result: res.data.result,



            });

            //   console.log(stationJson.result);
            //获取当前日期

            wx.request({
              url: 'http://localhost:8080/WechatConnectmysql/conn_servlet',

              data: {
                'method': 'addAir',
                'province': province,
                'city': city,
                'district': district,
                'createdDate': DATE,
              //  result: stationJson.result
                result: res.data.result,
              },
              header: {
                'content-type': 'application/json'
              },
              success: function (res) {
                if (res.data == null) {
                  console.log("ll");
                }
              },
              fail: function (res) {
                console.log("....fail....");
              }
            })
            //  console.log(dataList);
          },
          fail: function (res) {
            console.log(res);
          }
        })
      }
    }

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
    var that = this;
    that.onLoad();
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
      }) //动态设置当前页面的标题。     
      wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画。     
      self.onLoad(); //重新加载产品信息     
      wx.hideNavigationBarLoading(); //隐藏导航条加载动画。     
      wx.stopPullDownRefresh(); //停止当前页面下拉刷新。     

      wx.setNavigationBarTitle({

        title: '空气质量'

      }) //动态设置当前页面的标题。
    }, 1000);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var arr = this.data,
      max = Math.max(...arr);
    if (this.data.count < 1) {
      for (var i = max + 1; i <= max + 5; ++i) {
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

      path: '/pages/airQuality/airQuality',

      success: function(res) {

        // 转发成功
        that.shareClick();

      },

      fail: function(res) {
        // 转发失败
        console.log('转发失败');

      }

    }
  }
})