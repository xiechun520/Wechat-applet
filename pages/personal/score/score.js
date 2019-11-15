// pages/personal/score/score.js
var app = getApp();
var userId;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        redeemList: '',
        userInfo: {},
        pageNo: 1,
        pageSize: 10,
        hasMoreData: true,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        userId = wx.getStorageSync('weiaijia-userId') ? wx.getStorageSync('weiaijia-userId'):app.globalData.userId;
        console.log(userId);
        this.getUserInfo(userId);
        this.getRedeemList();
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
        var that = this;
        wx.stopPullDownRefresh();
        that.data.pageNo = 1;
        that.getRedeemList();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        if (this.data.hasMoreData) {
            that.data.pageNo++;
            this.getRedeemList();
        }else{
            wx.showToast({
                title: '没有更多数据',
                icon: 'none',
                duration: 2000
            });
        }
    },



    goDetail(e) {
        let that = this;
        var goodsId = e.currentTarget.dataset.goodid;
      wx.navigateTo({url:'/pages/mall/award/award?goodsId='+goodsId});
    },

    getRedeemList() {
        var that = this;
        wx.showNavigationBarLoading();
        app.https_request("goods/appGoodsList.do", {
            'pageNo': that.data.pageNo,
            'pageSize': that.data.pageSize,
            'isRemove': 0,
            'platIntNumb': 3333,
            'loginPlat': app.currPlat,
            'isScore': 1
        }, function(res) {
            let List = res.data.objects;
            for (let i = 0; List != null && i < List.length; i++) {
                var a = List[i].goodsImage.split(',');
                List[i].headImage = a[0];
            }
            if (res.data.count > 0) {
                var datas = that.data.redeemList;
                if (that.data.pageNo == 1) {
                    datas = []
                }
                if (List.length < that.data.pageSize) {
                    that.setData({
                        redeemList: datas.concat(List),
                        hasMoreData: false,
                    })
                } else {
                    that.setData({
                        redeemList: datas.concat(List),
                        hasMoreData: true,
                    })
                }
            } else {
               
            }
            wx.stopPullDownRefresh();
            wx.hideNavigationBarLoading();
        }, function(err) {
            wx.stopPullDownRefresh();
            wx.hideNavigationBarLoading();
            wx.showToast({
                title: '加载失败',
                icon: 'loading',
                duration: 2000
            });
        })
    },

    //获取用户信息
    getUserInfo(userId) { //获取用户信息
        var that = this;
        if (!userId) {
            return false;
        }
        app.https_request('user/userInfo.do', {
            userId: userId,
            loginPlat: app.currPlat
        }, (res) => {
            if (res.data.code == 0) {
                res.data.objects[0].nickName = res.data.objects[0].nickName.substring(0, 10);
                this.setData({
                    userInfo: res.data.objects[0]
                });
            }
        });
    }

})