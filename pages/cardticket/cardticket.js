// pages/cardticket/cardticket.js
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        pageNo: 1,
        pageSize: 10,
        hasMoreData: true,
        ticketList: {},
    },
    /**
     * 卡券列表
     */
    getCardTicketList:function(){
        var that = this;
        wx.showNavigationBarLoading();
        app.https_request("cardticket/getCardTicketList.do", {
            'loginPlat': app.currPlat,
            'userId': app.globalData.userId,
            'pageNo': that.data.pageNo,
            'pageSize': that.data.pageSize
        }, function (res) {
            if (res.data.code == 0) {
                var datas = that.data.ticketList;
                if (that.data.pageNo == 1) {
                    datas = []
                }

                var ticketList = res.data.objects;
              
                if (ticketList.length < that.data.pageSize) {
                    that.setData({
                        loadData: true,
                        ticketList: datas.concat(ticketList),
                        hasMoreData: false,
                    })
                } else {
                    that.setData({
                        loadData: true,
                        ticketList: datas.concat(ticketList),
                        hasMoreData: true,
                    })
                }
            } else {

            }
        }, function (err) {
            wx.stopPullDownRefresh();
            wx.hideNavigationBarLoading();
            wx.showToast({
                title: '加载失败',
                icon: 'loading',
                duration: 2000
            });
        })
    },
    /**
     * 领取卡券
     */
    getTicket:function(e){
        var that = this;
        var ticketId = e.currentTarget.dataset.ticketid;
        app.https_request("cardticket/getCardTicketById.do", {
            userId: app.globalData.userId,
            ticketId: ticketId,
        }, function (res) {
            if (res.data.code == 0) {
                wx.showToast({
                    title: '领取成功',
                    icon: 'none',
                    duration: 2000
                });
                // let pages = getCurrentPages();//当前页面
                // console.log('getpage>>>',pages);
                // let prevPage = pages[pages.length - 2]; //上一页面
                // prevPage.getUserTicketList(); //直接给上移页面赋值
                that.getCardTicketList();
            } else {
                wx.showToast({
                    title: res.data.msg,
                    icon: 'none',
                    duration: 2000
                });
            }
        });
    },
    /**
     * 返回
     */
    goCUserTicket:function(){
        wx.navigateBack({
            delta: 0
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getCardTicketList();
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
        wx.showNavigationBarLoading(); //在标题栏中显示加载
        that.getCardTicketList();
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        var that = this;
        if (that.data.hasMoreData) {
            that.data.pageNo++;
            that.getCardTicketList();
        } else {
            wx.showToast({
                title: '没有更多数据',
                icon: 'none',
                duration: 2000
            });
        }
    },
})