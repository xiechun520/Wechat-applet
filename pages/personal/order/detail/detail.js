// pages/personal/order/detail/detail.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        order: {},
        orderId: '',
        imgCommonUrl: app.imgCommonUrl,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this
        var orderId = options.orderId;
        that.setData({
            orderId:orderId
        })
        that.getOrderDetail();
    },
    getOrderDetail() {
        try {
            var orderString = wx.getStorageSync("orderString")

            var order = JSON.parse(orderString);
          console.log("SANCIJASIC" + orderString)
            this.setData({
                order : order
            })
        } catch (e) {
            console.log(e)
        }
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