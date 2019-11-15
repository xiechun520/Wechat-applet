// pages/personal/rank/rank.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        ranklist:{},
        page:1,
        limit:20,
        userinfo:{},
        imgCommonUrl:app.imgCommonUrl,
    },
    /**
     * 获取某个用户的
     */
    getUserRankByUserId: function () {
        var that = this;
        wx.showNavigationBarLoading();
        app.https_request("user/getRankByUserId.do", {
            'userId': app.globalData.userId,
            'loginPlat':app.currPlat,
        }, function (res) {
            console.log(JSON.stringify(res.data));
            if (res.data.count > 0) {
                that.setData({
                    userinfo: res.data.objects[0],
                })

            } else {

            }
            wx.hideNavigationBarLoading();
        }, function (err) {
            wx.hideNavigationBarLoading();
            wx.showToast({
                title: '加载失败',
                icon: 'loading',
                duration: 2000
            });
        })
    },
    /**
     * 获取排名列表:前二十位
     */
    getUserRankList: function () {
        var that = this;
        wx.showNavigationBarLoading();
        app.https_request("user/getUserRank.do", {
            'page': that.data.page,
            'limit': that.data.limit,
            'loginPlat': app.currPlat,
        }, function (res) {
            if (res.data.count > 0) {                    
                that.setData({
                    ranklist: res.data.objects,
                })
              
            } else {

            }
            wx.hideNavigationBarLoading();
        }, function (err) {
            wx.hideNavigationBarLoading();
            wx.showToast({
                title: '加载失败',
                icon: 'loading',
                duration: 2000
            });
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getUserRankList();
        this.getUserRankByUserId();
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