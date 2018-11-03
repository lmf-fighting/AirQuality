var bmap = require('../../libs/bmap-wx/bmap-wx.min.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ak: "xaT3C9dm5ar7bbwe1n7dRn03U2UDr3GN",
    weatherData: '',
    futureWeather: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    
      //页面加载前，首先访问数据库，查询是否存在该城市天气记录
      wx.request({
        url: 'http://localhost:8080/WechatConnectmysql/conn_servlet',

        data: {
          'method': 'query' ,
          'currentCity': 'currentCity',
          'date': 'date'
        },
        header: {
          'content-type': 'application/json'
        },
        //访问成功
        success: function (res) {
          
          if (res.data!=null) {  //判断回传的数据是否为空，如果为空，则访问api接口，如果不为空，则直接将回传的数据显示出来
            //显示回传数据
           var weatherData=console.log(res.data)
          
          } else {
            //访问api接口
            //设置全局data里面的数据
            that.setData({
              weatherData: weatherData,
              futureWeather: futureWeather
            });
            console.log(that.data.weatherData);

            DBRequest();
          };
        },
        //访问失败
        fail: function (res) {
          console.log("....fail....");
        }

      })

    
    //新建map对象·
    var BMap = new bmap.BMapWX({
      ak: that.data.ak
    });

    //失败回调函数
    var fail = function(data) {
      console.log("fail:   " + data);
    };

    //成功回调函数
    var success = function(data) {
      var weatherData = data.currentWeather[0];
      var futureWeather = data.originalData.results[0].weather_data;
      


      //  weatherData='城市:'+weatherData.currentCity + '\n'+'PM2.5:'+weatherData.pm25+'\n'+'日期:' + weatherData.date+'\n'+'温度:'+weatherData.temperature + '\n'+'天气:' + weatherData.weatherDesc+ '\n'+'风力:' +weatherData.wind+'\n';

      //设置全局data里面的数据
     // that.setData({
       // weatherData: weatherData,
     //   futureWeather: futureWeather
     // });
     // console.log(that.data.weatherData);
      
     // DBRequest();
    }

    //发起weather请求，向api请求weather数据
   
    BMap.weather({
      fail: fail,
      success: success
    });
    

    //  weatherData.currentCity,
    //   weatherData.pm25,
    //   weatherData.date,
    //   weatherData.temperature,
    //   weatherData.weatherDesc,
    //   weatherData.wind
    // http://localhost:8080/WechatConnectmysql/WEB-INF/classes/connect/ConnectDS.java

    var DBRequest = function() {
      wx.request({
        url: 'http://localhost:8080/WechatConnectmysql/conn_servlet',

        data: {
          
          'method': 'add',
          'weatherData': that.data.weatherData

        },
        header: {
          'content-type': 'application/json'
        },
        success: function(res) {
          if(res.data==null){
            
          }
          console.log(res.data);
        },
        fail: function(res) {
          console.log("....fail....");
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})