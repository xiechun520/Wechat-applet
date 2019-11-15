// pages/personal/message/message.js
const app = getApp();
var userId = 0,
    loginPlat = app.currPlat,
    pageNo = 1,
    pageSize = 10,
    hasMoreData = true;

Page({
    /**
     * 页面的初始数据
     */
    data: {
        messageList: [],
        isEmptyPage: false,
        imgCommonUrl: app.imgCommonUrl,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        userId = app.globalData.userId;
        this.getMessageList();
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
        pageNo = 1;
        this.data.messageList = []; // 清空消息列表，但是不渲染
        this.getMessageList();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        if (hasMoreData === true) {
            ++pageNo;
            this.getMessageList();
        } else {
            wx.showToast({
                title: '没有更多数据',
                icon: 'none',
                duration: 2000
            });
        }
    },
    getMessageList: function() {
        app.https_request('sysmes/getMesList.do', {
            userId: userId,
            loginPlat: loginPlat,
            page: pageNo,
            limit: pageSize,
        }, (res) => {
            if (res.data.code === "0") {
                var ret = {
                    messageList: this.data.messageList.concat(res.data.objects),
                    hasMoreData: true,
                }
                this.setData(ret);
            } else {
                var ret = {
                    hasMoreData: false,
                };
                if (pageNo === 1) {
                    ret.isEmptyPage = true;
                }
                this.setData(ret);
            }
        });
    }
})