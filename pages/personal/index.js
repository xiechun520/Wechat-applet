// pages/personal/index.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {},
        userid: '',
        imgCommonUrl:app.imgCommonUrl,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var userId = wx.getStorageSync('weiaijia-userId') || app.globalData.userId;
        that.setData({
          userid: userId,
        });
        // if (userId) {
        //     app.addUserAction(userId, 0,18, 0, 0);
        // }
        this.getUserInfo(userId);
    },
    getUserInfo:function(userId) { //获取用户信息
        var that = this;
        if (!userId) {
            return false;
        }
        app.https_request('user/userInfo.do', {
            userId: userId,
            loginPlat: app.currPlat
        }, function(res) {
            if (res.data.code == 0) {
                var tempInfo = res.data.objects[0]; // 临时数据
                that.setData({
                    userInfo: tempInfo,
                });
            }
        });
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
        this.getUserInfo(app.globalData.userId)
    },
  // 下拉刷新
  onPullDownRefresh: function () {
    var that = this;
    console.log("%c 下拉", "color:#00f;font-size:36px");
    that.data.userInfo = []; // 清空消息列表，但是不渲染
    wx.showNavigationBarLoading(); //在标题栏中显示加载
    that.getUserInfo(that.data.userid);
    setInterval(function () {
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    }, 1000)
   
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
})