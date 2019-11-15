// pages/personal/order/order.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabs: ["待付款", "待发货", "待收货", "已收货","已取消"],//页面显示集合
        tabsList: [3, 5, 10, 14,-1],//根据状态实际和接口交互的数值  :识别到0默认全部
        activeIndex:0,
        pageNo: 1,
        pageSize: 10,
        hasMoreData: true,
        orderList: [],
        statusString: '',
        userIp:'',
        imgCommonUrl: app.imgCommonUrl,
    },
    tabClick: function (e) {
        var that = this;
        var index = e.currentTarget.id;
        //重置数据
        that.setData({
            pageNo: 1,
            orderList: {},
            activeIndex: index
        })
        that.getOrderList(that.data.tabsList[index]);
        that.getStatusString(that.data.tabsList[index]);
    },
    /**
     * 详情
     */
    goodsOrderDetail(e) {
        console.log(JSON.stringify(e))
        var order = e.currentTarget.dataset.order;
        var orderId = e.currentTarget.dataset.orderid;
        var orderString = JSON.stringify(order);
        try {
            wx.setStorageSync('orderString', orderString);
          wx.navigateTo({
                url: '/pages/personal/order/detail/detail?orderId='+orderId
            });
        } catch (e) {
            wx.showToast({
                title: e,
                icon: none
            });
        }

    },
    confirmReceipt(e) {
        var that = this;
        var orderId = e.currentTarget.dataset.orderid;
        app.https_request("goodsOrder/takeGoods.do", {
            'userId': app.globalData.userId,
            'orderId': orderId
        }, function (res) {
            if (res.data.code == 0) {
                wx.showToast({ title: "操作成功" });
                that.pageNo = 1;
                that.getOrderList(that.data.tabsList[that.data.activeIndex]);
            } else {
                wx.showToast({ title: res.data.msg });
            }
        });
    },

    //取消订单
    quitOrder(e) {
        var that = this;
        var orderId = e.currentTarget.dataset.orderid;
        app.https_request("goodsOrder/quitgoodorder.do", {
            'userId': app.globalData.userId,
            'orderId': orderId
        }, function (res) {
            if (res.data.code == 0) {
                wx.showToast({ title: "取消订单成功" });
                that.getOrderList(that.data.tabsList[that.data.activeIndex]);
            } else {
                wx.showToast({ title: res.data.msg });
            }
        });
    },

    //删除订单
    deleteOrder(orderID) {
        var that = this;
        var orderId = e.currentTarget.dataset.orderid;
        app.https_request("goodsOrder/deletegoodorder.do", {
            'userId': app.globalData.userId,
            'orderId': orderId
        }, function (res) {
            if (res.data.code == 0) {
                wx.showToast({ title: "删除订单成功" });
                that.getOrderList(that.data.tabsList[that.data.activeIndex]);
            } else {
                wx.showToast({ title: res.data.msg });
            }
        });
    },
    // 详情页
    godetal(e){
      // console.log()
      wx.navigateTo({
        url: '../../mall/detail/detail?goodsId=' + e.currentTarget.dataset.spid
      });
    },
    /**
          *调起支付
          */
    goPay(e) {
        var that = this;
      console.log(this.data.userIp);
        var orderId = e.currentTarget.dataset.orderid;
        var param = {
            orderID: orderId,
            payName: "商品",
            userIp: '121.32.142.114',
            ticketMoney: '0'
        }
        app.https_request('pay/fetchPayInfo.do', param, function (res) {
            if (!res.data) {
                wx.showToast({ title: '系统错误' });
                return false;
            }
            if (res.data.code != 0) {
                wx.showToast({ title: res.data.msg });
                return false;
            }
            let obj = res.data.objects;
            wx.requestPayment({
                'timeStamp': obj.timeStamp.toString(),
                'nonceStr': obj.nonceStr,
                'package': 'prepay_id=' + obj.prepayId,
                'signType': 'MD5',
                'paySign': obj.paySign,
                'success': function (res) {
                    if (res.errMsg == 'requestPayment:ok') {
                        wx.showModal({
                            title: '提示',
                            content: '你已支付成功，等待卖家确认发货',
                            success: function (res) {
                                //that.sendMessage(obj.prepayId, orderId);//后续做模板推送
                                that.getOrderList(that.data.tabsList[that.data.activeIndex]);

                            }
                        });
                    }
                },
                'fail': function (res) {
                    if (res.errMsg == "requestPayment:fail cancel") {
                        wx.showToast({ title: '你已取消支付！' });
                    } else {
                        wx.showToast({ title: '调起支付失败，请稍后尝试！' });
                    }
                }
            })
        }, 1);
    },
  
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        var status = options.currentTab ? options.currentTab:0;
        that.setData({
            activeIndex : status
        })
        that.getOrderList(that.data.tabsList[status]);
      console.log("getOrderList")
        that.getStatusString(that.data.tabsList[status]);

    },
    getOrderList:function(status) {
        var that = this;
        wx.request({
          url: 'http://ip-api.com/json',
          success: function (e) {
            console.log("用户ip", e.data);
            that.setData({
              userIp: e.data.query
            })
          }
        })
      console.log("status>>", status)
        //请求列表数据
        app.https_request("goodsOrder/businessOrdersList.do", {
            'pageNo': that.data.pageNo,
            'pageSize': that.data.pageSize,
            'userId': app.globalData.userId,
            'loginPlat': app.currPlat,
            'orderStatus':status
        }, function (res) {
          console.log('ffffffggg',res)
            var datas = that.data.orderList;
            if(that.data.pageNo == 1){
                datas = [];
            }
            var list = res.data.objects;
            console.log(list);
            for (var key in list) {
                var totalBuyNumber = 0,
                    totalPrice = 0;
                try {
                    list[key].objects = JSON.parse(list[key].objects);
                } catch (e) {
                    list[key].objects = [{}];
                }
                var array = list[key].objects;
                if (list[key].orderStatus == -1) {
                    list[key].orderStatusString = "交易已取消"
                } else if (list[key].orderStatus == 10) {
                    list[key].orderStatusString = "交易中"
                }else if (list[key].orderStatus == 14){
                    list[key].orderStatusString = "交易已结束"
                }else {
                    list[key].orderStatusString = "交易进行中"
                }
                if (array == null) {
                    list[key].objects = [{}];
                }
                if (array.length > 0) {
                    for (var k in array) { //goodsImage可能有多张图片，以逗号分隔
                        var goodsObj = array[k];

                        totalBuyNumber += goodsObj.buyNumber;
                        totalPrice += goodsObj.buyNumber * goodsObj.sellPrice;

                        if (goodsObj.goodsImage != null) {
                            var index = goodsObj.goodsImage.indexOf(",");
                            if (index > -1) {
                                goodsObj.goodsImage = goodsObj.goodsImage.substring(0, index);
                            }
                        }
                    }
                }
                list[key].totalBuyNumber = totalBuyNumber;
                list[key].totalPrice = totalPrice.toFixed(2);
            }
            if (list.length < that.data.pageSize) {
                that.setData({
                    loadData: true,
                    orderList: datas.concat(list),
                    hasMoreData: false,
                })
            } else {
                that.setData({
                    loadData: true,
                    orderList: datas.concat(list),
                    hasMoreData: true,
                })
            }
        })
    },
    getStatusString(status) {
        var statusString = "";
        var that = this;
        switch (status) {
            case 3:
                statusString = '待付款';
                break;
            case 5:
                statusString = '待发货';
                break;
            case 10:
                statusString = '待收货';
                break;
            case 14:
                statusString = '已收货';
                break;
            case -1:
                statusString = '已取消';
                break;
            default:
                break;
        }
        console.log(statusString)
        that.setData({
            statusString: statusString
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
        that.getOrderList(that.data.tabsList[that.data.activeIndex]);
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        var that = this;
        if (that.data.hasMoreData) {
            that.data.pageNo++;
            that.getOrderList(that.data.tabsList[that.data.activeIndex]);
        } else {
            wx.showToast({
                title: '没有更多数据',
                icon: 'none',
                duration: 2000
            });
        }
    },

})