var util = require('../../utils/util.js');
var cityTop = require('../../libs/cityTOP.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    today: new Date(),
    province: '',
    district: '',
    city: '',
    list: [],
    id: '',

    count: 0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    var self = this;
    // 页面初始化 options为页面跳转所带来的参数
    var city = '';

    this.setData({
      today: util.formatTime(new Date()).split(' ')[0],
      // lifeIndex: this.data.lifeIndex.concat(lifePicture)
    });

    //微信工具获取当前具体位置，返回经纬度信息
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        console.log("当前经纬度：" + res.latitude + "," + res.longitude);

        searchCityTop();
      }
    })
    //self.getTopInfo('正在加载数据...');
    //获取当前日期
    var DATE = util.formatDateHour(new Date());
    this.setData({
      date: DATE,
    });
    var time = util.formatTime(new Date());
    this.setData({
      time: time,
    });

    //传入当前城市，获取当前城市天气信息
    var searchCityTop = function() {
      //首先从数据库中查询是否存在该城市的当前天气记录，如果存在则提取出来，如果不存在则访问百度api获取该城市的天气状况
      //页面加载前，首先访问数据库，查询是否存在该城市天气记录
      wx.request({

        url: 'http://localhost:8080/WechatConnectmysql/conn_servlet',

        data: {
          'method': 'queryTop',
        },
        header: {
          'content-type': 'application/json'
        },
        //访问成功
        success: function(res) {


          if (res.data.list.length != 0) {
            var ct_time = res.data.list[0].ct;
            console.log(res.data.list[0].id)
            console.log(ct_time.substring(0, ct_time.length - 2).replace(/-/g, '/'));
            console.log(time);
            var target = util.getDate(res.data.list[0].ct);
            console.log(target);
            //console.log(typeof target);
            var temp = new Date(time) - target;
            console.log(temp);
            if (Math.floor((temp / 3600) % 24 >= 1)) {
              getTop_add();
            } else {
              var ct_time = res.data.list[0].ct;
              //设置全局data里面的数据
              self.setData({
                list: res.data.list

              });
            }

          } else {
            console.log(res);
            //访问api接口

            getTop_add();

          };
        },
        //访问失败
        fail: function(res) {
          console.log("....fail....");
        }

      })
    }
    //传入当前城市，获取当前城市天气信息
    //api获取
    var getTop_add = function(e) {
      wx.request({
        url: 'https://api.apishop.net/common/air/getPM25Top', //请求接口地址


        data: {
          'apiKey': 'N9mZBJJbf80a8407463c504a856a7dc6b9754cb828a45d7',
          'method': 'POST',
          'city': city

        },
        header: {
          'content-Type': 'application/json'
        },
        success: function(res) {
          //设置全局信息
          self.setData({

            //  statusCode: res.data.statusCode,
            // desc: res.data.desc,
            list: res.data.result.list,
            // ret_code: res.data.result.list
            // list: cityTop.list
          });

          var ct_time = res.data.result.list[0].ct;
          console.log(self.data.list);
          wx.request({
            url: 'http://localhost:8080/WechatConnectmysql/conn_servlet',
          //  method:'addTop',
            header: {
              // 'Content-Type': 'json'
              'content-type': 'application/json'
              // 'Content-Type':'application/x-www-form-urlencoded'

            },
            data: {
              'method': 'addTop',
              // 'list': cityTop.list
              'list': self.data.list
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
          console.log(res);
          console.log(res.data.result.siteList);
        },
        fail: function(res) {
          console.log(res);
        }
      })
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
      // 模拟请求数据，并渲染
      var arr = self.data.list,
        max = Math.max(...arr);
      for (var i = max + 1; i <= max + 3; ++i) {
        arr.unshift(i);
      }
      self.setData({
        list: arr
      });
      // 数据成功后，停止下拉刷新
      wx.stopPullDownRefresh();
    }, 1000);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var arr = this.data.list,
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

      path: '/pages/cityIndex/cityIndex',

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