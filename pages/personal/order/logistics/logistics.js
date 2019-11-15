// pages/personal/order/logistics.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    expresslist: [],//物流详情列表 ,
    expressstatus: '',//物流状态
    showexpress: false

  },
  onLoad: function (options) {
    var that = this;
    var orderId = options.orderId;//order表主键id
    var type = options.type;//活动类型
    var sid = options.sid;
    app.globalData.sid = sid;
    wx.showLoading({
      title: '查询物流信息中~',
    })
    //这里执行根据物流单号查询物流信息,封装调用方法可以参考前面的几篇博文
    logistics.getLogistics(orderId, sid, type, result => {
      if (result.code == '001') {
        that.setData({
          list: result.data,
          hasData: true
        })
      } else {
        that.setData({
          hasData: false
        })
      }
      wx.hideLoading();
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  

})