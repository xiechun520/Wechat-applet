// pages/personal/invite/invite.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        user_list: [],
        pageNo: 1,
        pageSize: 10,
        hasMoreData: true,
        imgCommonUrl:app.imgCommonUrl,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getUserList();
    },
    /**获取我邀请别人列表**/
    getUserList:function() {
        var that = this;
        wx.showNavigationBarLoading();
        app.https_request("user/uservisitlist.do", {
            'introducer': app.globalData.userId,
            'pageNo': that.data.pageNo,
            'pageSize': that.data.pageSize,
            'loginPlat': app.currPlat,
        }, function (res) {
            if (res.data.count > 0) {
                var datas = that.data.collectionList;
                if (that.data.pageNo == 1) {
                    datas = []
                }
                var userlist = res.data.objects;
                if (userlist.length < that.data.pageSize) {
                    that.setData({
                        loadData: true,
                        user_list: datas.concat(userlist),
                        hasMoreData: false,
                    })
                } else {
                    that.setData({
                        loadData: true,
                        user_list: datas.concat(userlist),
                        hasMoreData: true,
                    })
                }
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
        var that = this;
        that.data.pageNo = 1;
        wx.showNavigationBarLoading();//在标题栏中显示加载
        that.getUserList();
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        var that = this;
        if (that.data.hasMoreData) {
            that.data.pageNo++;
            that.getUserList();
        } else {
            wx.showToast({
                title: '没有更多数据',
                icon: 'none',
                duration: 2000
            });
        }
    },
})