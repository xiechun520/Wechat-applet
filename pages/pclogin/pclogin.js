// pages/pclogin/pclogin.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uuid: '',
    userId:'',
    imgCommonUrl:app.imgCommonUrl,
  },
  login:function() {
    var that = this;
    app.https_request("vijcodelogin/vijLogin.do", {
      userId: that.data.userId,
      uuid: that.data.uuid,
      loginPlat: app.currPlat,
    }, function (res) {
      if (res.data.code == 0) {
        wx.showToast({ title: "登陆成功" });
        setTimeout(function(){
          wx.reLaunch({
            url: '/pages/index/index',
          })
        },1000);
       
      } else {
        wx.showToast({ title: res.data.msg });
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var userId = wx.getStorageSync('weiaijia-userId') || app.globalData.userId;
    var scene = decodeURIComponent(options.scene);
    var arr = scene.split("/");
    var uuid = arr[1];
    that.setData({
       uuid:uuid,
       userId:userId,
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})