// pages/personal/address/address.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        addressList: [], //地址列表
        pageNo: 1,
        pageSize: 10,
        hasMoreData: true,
    },
    newAddr() {
      wx.navigateTo({ url: '/pages/personal/address/add/add' });
    },
    chooseAddress(e) {
        var addressInfo = e.currentTarget.dataset.info,
            pages = getCurrentPages(), //当前页面
            prevPage = pages[pages.length - 2]; //上一页面
        prevPage.setData({ //直接给上移页面赋值
            addressInfo: addressInfo,
        });
        wx.navigateBack({ //返回
            delta: 1
        })
    },
    editAddress(e) {
        var index = e.currentTarget.dataset.index;
        var addressInfo = this.data.addressList[index];
      wx.navigateTo({ url: '/pages/personal/address/add/add?edit=1&addressInfo=' + JSON.stringify(addressInfo) });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getAddressList();
    },
    /**获取地址列表**/
    getAddressList() {
        var that = this;
        wx.showNavigationBarLoading();
        app.https_request("/shoppingAddress/findShoppingAddr.do", {
            'userId': app.globalData.userId,
            'pageNo': that.data.pageNo,
            'pageSize': that.data.pageSize
        }, function(res) {
            if (res.data.code == 0) {
                var datas = that.data.addressList;
                if (that.data.pageNo == 1) {
                    datas = []
                }

                var addressList = res.data.objects;
                for (var i = 0; i < addressList.length; i++) {
                    addressList[i].firstString = addressList[i].deliveryName.charAt(0);
                }
                if (addressList.length < that.data.pageSize) {
                    that.setData({
                        loadData: true,
                        addressList: datas.concat(addressList),
                        hasMoreData: false,
                    })
                } else {
                    that.setData({
                        loadData: true,
                        addressList: datas.concat(addressList),
                        hasMoreData: true,
                    })
                }
            } else {

            }
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
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        var that = this;
        that.data.pageNo = 1;
        wx.showNavigationBarLoading(); //在标题栏中显示加载
        that.getAddressList();
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        var that = this;
        if (that.data.hasMoreData) {
            that.data.pageNo++;
            that.getAddressList();
        } else {
            wx.showToast({
                title: '没有更多数据',
                icon: 'none',
                duration: 2000
            });
        }
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },
})