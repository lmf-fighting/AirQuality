Page({
  data: {
    current_address: "",
    wc_guide_info: [],
    current_page: 1,          //当前页码
    sum_page: 1               //总页码，后台会返回
  },
  getwcinfo: function () {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.url + '../weather/weather',
      data: {
        type: 1,
        lng: app.globalData.location.longitude,
        lat: app.globalData.location.latitude,
        page: that.data.current_page,
        page_size:10 //每页加载的数据，建议数字大一点，数字小了第一页数据没有到底部，不足以触发onReachBottom函数，不能加载第二页数据
      },
      success: function (data) {
        wx.hideLoading();
        if (data.data.status == 200) {
          if (that.data.current_page == 1) {
            that.setData({
              wc_guide_info: data.data.data.res,
              sum_page: data.data.data.totalpage
            })
          } else {
            var new_page_cont = that.data.wc_guide_info;
            var current_guide_list = data.data.data.res;
            for (var i = 0; i < current_guide_list.length; i++) {
              new_page_cont.push(current_guide_list[i])
            }
            that.setData({
              wc_guide_info: new_page_cont
            })
          }

        } else {
          wx.showToast({
            title: data.data.error,
            icon: 'loading',
            duration: 1000
          });
        }
      },
      fail: function () {
        wx.hideLoading();
        wx.showToast({
          title: '请求失败',
          icon: 'loading',
          duration: 1000
        })
      }
    })
  },
  onReachBottom: function (e) {
    var that = this;
    var current_page = null;
    current_page = that.data.current_page + 1;
    that.setData({
      current_page: current_page
    })
    if (current_page <= that.data.sum_page) {
      wx.showToast({
        title: '加载中！',
        icon: 'loading',
        duration: 1000
      })
      that.getwcinfo();
    } else if (current_page > that.data.sum_page) {
      wx.showToast({
        title: '数据已加载完',
        icon: 'loading',
        duration: 1000
      });
      return;
    }

  }
})