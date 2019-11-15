// pages/mall/counter/counter.js
var pageNo = 1,
  pageSize = 8,
  userId,
  orderInfo,
  userIp,
  goodsName;

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addr: 'show',
    addressInfo: '',
    choose: 'hide',
    consumeType: 1,
    counts: 1,
    createOrderInfo: '',
    goodsList: [],
    gdlist: [],
    hasRefesh: false,
    hidden: true,
    loadMoreOk: 1, //可刷新
    remarks: '',
    totalPrice: 0,
    total_price: 0,
    yhq: false,
    user_list: [], //用户列表
    walletBalance: '',
    isJF: 0,//是否积分兑换，0：否，1：是
    scoreTotal: 0,//所需积分
    ticketInfo: {},//卡券信息
    ticketMoney: 0,//优惠金额
    isTicket: 0,//是否存在兑换券
    imgCommonUrl: app.imgCommonUrl,
    shifukuan: 0,
  },
  /**
   * 选择优惠券后调用的方法
   */
  chooseUserTicket: function (e) {
    console.log(JSON.stringify(e));
    var shifukuan = this.data.total_price - Number(e.ticketMoney);
    this.setData({
      shifukuan: shifukuan.toFixed(2),
      ticketInfo: e,
      ticketMoney: Number(e.ticketMoney)
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userId = wx.getStorageSync('weiaijia-userId') || app.globalData.userId;
    var isJF = options.isJF ? options.isJF : 0;
    this.getAddressList();
    var goodsList = JSON.parse(wx.getStorageSync('submit_order_data'));
    for (var i = 0; i < goodsList.length; i++) {
      var obj = goodsList[i];
      obj.carGoods.goodsImage = extract_first_url(obj.carGoods.goodsImage);
    }
    console.log("saichoaiscoasicnjasoki", goodsList)
    if (isJF == 1) {
      this.setData({
        goodsList: goodsList,
        isJF: isJF,
        scoreTotal: goodsList[0].carGoods.scoreCount
      });
    } else {
      this.setData({
        goodsList: goodsList,
        isJF: isJF
      });
    }
    this.getUserTicketList();
    this.calculateTotalPrice();
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

  total_sub(e) {
    var goodsList = this.data.goodsList,
      index = e.currentTarget.dataset.index;
    if (goodsList[index]['number'] > 1) {
      goodsList[index]['number']--
      this.setData({
        goodsList: goodsList,
      });
    } else {
      wx.showToast({
        title: "商品数量至少为1",
        icon: 'none',
      })
      return;
    }
    this.calculateTotalPrice();
  },
  total_add(e) {
    var goodsList = this.data.goodsList,
      index = e.currentTarget.dataset.index;
    goodsList[index]['number']++;
    this.setData({
      goodsList: goodsList,
    });
    this.calculateTotalPrice();
  },
  remarks_bindinput(event) {
    this.setData({
      remarks: event.detail.value
    });
  },
  addAddr() {
    wx.navigateTo({
      url: '/pages/personal/address/address'
    });
  },
  /**
   * 优惠券
   */
  goMyTicket: function () {
    if(this.data.yhq == false){
      wx.showToast({
        title: "暂无可用优惠券",
        image: '/images/ai.png',
        duration: 2000
      })
    }else{
      wx.navigateTo({
        url: '/pages/personal/ticket/ticket?type=2&price=' + this.data.total_price
      });
    }
    
  },
  changeCount(e) {
    let value = e.detail.value,
      index = e.target.dataset.index,
      goodsList = this.data.goodsList;
    if (value > this.data.goodsList[index].carGoods.goodsStock) {
      goodsList[index].number = this.data.goodsList[index].carGoods.goodsStock,
        wx.showToast({ title: '数量不能大于库存' });
    } else {
      goodsList[index].number = value
    }
    this.setData({
      goodsList: goodsList
    })
    this.calculateTotalPrice();
  },
  checkMin(e) {
    let value = e.detail.value,
      index = e.target.dataset.index,
      goodsList = this.data.goodsList;
    if (value === undefined || value < 1) {
      wx.showToast({ title: '数量不能少于1' });
      goodsList[index].number = 1
      this.setData({
        goodsList: goodsList,
      })
    }
    this.calculateTotalPrice();
  },
  hide_choose() {
    this.setData({
      hidden: true,
    })
  },
  hideTips() {
    this.setData({
      hidden: true,
    })
  },

  placeAnOrder1() {
    if (this.data.total_price - this.data.ticketMoney < 0){
      wx.showToast({
        title: "付款不能小于0",
        image: '/images/ai.png',
        duration: 2000
      })
    }else{
      this.setData({
        hidden: false,
      })
    }
    
  },

  placeAnOrder(e) {
    let _this = this;
    var payType = e.currentTarget.dataset.type;
    var isOnline = 0;
    if (payType == 1) {
      isOnline = 1;
    }
    if (!userId) {
      wx.showToast({ title: '请先登录' });
      return false;
    }
    if (_this.data.total_price <= 0) {
      wx.showToast({ title: '商品数量不能为0' });
      return false;
    }
    console.log("_this.data.addressInfo--" + _this.data.addressInfo)
    if (Object.keys(_this.data.addressInfo).length == 0) { //判断对象为空,es6写法
      wx.showToast({ title: '请先选择收货地址' });
      return false;
    }

    var order_goods = [];
    _this.data.goodsList.map(obj => {
      var gd = {
        "goodsid": obj.goodsId,
        "buyNumber": obj.number,
        "carId": obj.carId,
        "specId": obj.specId || 0,
        "specTypeString": obj.specTypeString || "",
      }
      order_goods.push(gd);
    });
    var param = {
      userid: userId,
      addressId: _this.data.addressInfo.addressId,
      loginPlat: app.currPlat,
      remarks: _this.data.remarks,
      goods: JSON.stringify(order_goods),
      isOnline: isOnline,
      consumeType: 1,
    }
    console.log(param)

    app.https_request('pay/createUserOrder.do', param, (res) => {
      if (!res.data) {
        wx.showToast({ title: '系统错误' });
        return false;
      }
      console.log("res.data.code--", JSON.stringify(res.data));
      if (res.data.code != 0) {
        wx.showToast({ title: res.data.msg });
        return false;
      }
      var orderId = res.data.orderID;
      console.log("订单ID",orderId);
      if (payType == 2) { //线下支付
        wx.showModal({
          title: '提示',
          content: '你好，已下单成功，请等待商家联系，线下支付交易！',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              wx.redirectTo({
                url: '/pages/personal/order/order'
              })
            }
          }
        });
      } else if (payType == 4) {//积分兑换
        wx.showModal({
          title: '提示',
          content: '确认积分兑换该商品?',
          showCancel: true,
          success: function (res) {
            if (res.confirm) {
              
              app.https_request('pay/payForScore.do', {
                'userId': userId,
                'orderId': orderId
              }, function (res) {
                if (res.data.code == 0) {
                  wx.showToast({ title: res.data.msg });
                  setTimeout(function () {
                    wx.redirectTo({
                      url: '/pages/personal/order/order?currentTab=1',
                    })
                  }, 1000);
                } else {
                  wx.showToast({ title: res.data.msg });
                }
              })
            }
          }
        });
      } else { //线上支付
        _this.goPay(orderId);
      }
    });
  },

  updateAddress(addressInfo) {
    this.setData({
      addressInfo: addressInfo,
    });
  },

  /**获取地址列表**/
  getAddressList() {
    wx.showNavigationBarLoading();
    app.https_request("shoppingAddress/findShoppingAddr.do", {
      'userId': userId,
      'pageNo': pageNo,
      'pageSize': pageSize,
      'loginPlat': app.currPlat
    }, (res) => {
      console.log("地址--" + JSON.stringify(res))
      if (res.data.code == 0) {
        let addressList = res.data.objects;
        this.setData({
          addressInfo: addressList[0],
        });
      } else {
        this.setData({
          addressInfo: '',
        });
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

  calculateTotalPrice() {
    let num = 0,
      goodsList = this.data.goodsList;
    var gdlist = [];
    goodsList.map((item, i) => {
      console.log("jcaioscjaoicn", item)
      if (item.goumai){
        var price = item.goodsprice
      }else{
        var price = item.goodsSpec != null ? item.goodsSpec.price : item.carGoods.sellPrice;
      }
      
      
      item.spprice = price
      num += item.number * price; // 所有价格加起来
      gdlist = gdlist.concat(item);
    });
    this.setData({ // 最后赋值到data中渲染到页面
      gdlist: gdlist,
    });
    var shifukuan = num - this.data.ticketMoney;
    console.log(shifukuan)
    this.setData({ // 最后赋值到data中渲染到页面
      shifukuan: shifukuan.toFixed(2),
    });
    var total_price = num.toFixed(2);
    console.log("价格查看", shifukuan)
    this.setData({ // 最后赋值到data中渲染到页面
      total_price: total_price,
    });
  },

  /**
  //调起支付
  */
  goPay(orderID) {
    let that = this;
    var ticketMoney = that.data.ticketMoney > 0 ? that.data.ticketMoney : 0;
    let param = {
      orderID: orderID,
      payName: "商品",
      userIp: '121.32.142.114',
      ticketMoney: ticketMoney //优惠券金额
    }
    console.log(param);
    app.https_request('/pay/fetchPayInfo.do', param, function (res) {
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
        timeStamp: obj.timeStamp.toString(),
        nonceStr: obj.nonceStr,
        package: 'prepay_id=' + obj.prepayId,
        signType: 'MD5',
        paySign: obj.paySign,
        success: function (res) {
          if (res.errMsg == 'requestPayment:ok') {
            if (ticketMoney > 0) {
              that.updateCardAndOrder(that.data.ticketInfo.id, 1, ticketMoney, JSON.stringify(that.data.ticketInfo), orderID)
            }
            wx.showModal({
              title: '提示',
              content: '你已支付成功，等待卖家确认发货',
              success: function (res) {
                //发送模板
                // that.sendMessage(obj.prepayId, orderID);
                wx.navigateTo({ url: '/pages/personal/order/order' });
              }
            });
          }
        },
        fail: function (res) {
          if (res.errMsg == "requestPayment:fail cancel") {
            wx.showToast({ title: '你已取消支付！' });
            wx.navigateTo({ url: '/pages/personal/order/order?currentTab=0' });
          } else {
            wx.showToast({ title: '调起支付失败，请稍后尝试！' });
            wx.navigateTo({ url: '/pages/personal/order/order?currentTab=0' });
          }
        }
      })
    }, 1);
  },
  /**
   * 更新订单以及优惠券
   */
  updateCardAndOrder: function (id, isTicket, discountMoney, ticketInfo, orderID) {
    var that = this;
    app.https_request("cardticket/updateCardAndOrder.do", {
      id: id,
      isTicket: isTicket,
      discountMoney: discountMoney,
      ticketInfo: ticketInfo,
      orderID: orderID
    }, function (res) {
      if (res.data.code == 0) {
        console.log("操作成功")
      } else {

      }
    });
  },
  /**
      * 卡券列表
      */
  getUserTicketList: function () {
    var that = this;
    app.https_request("cardticket/getUserTicketList.do", {
      'userId': app.globalData.userId,
      'isUse': 0,
      'pageNo': 1,
      'pageSize': 1
    }, function (res) {
      if (res.data.code == 0) {
        if (res.data.count > 0) {
          that.setData({
            isTicket: 1
          })
        } else {
          that.setData({
            isTicket: 0
          })
        }
        res.data.objects.forEach(function (item, index) {
          console.log(item); //这里的item就是从数组里拿出来的每一个每一组
          console.log(that.data.total_price);
          if (item.ticketMoney < that.data.total_price) {
            that.setData({
              yhq: true
            })
          }
          console.log(that.data.yhq);
        })
      } else {
        that.setData({
          isTicket: 0
        })
      }
    }, function (err) {
      that.setData({
        isTicket: 0
      })
    })
  },
  //1.获取token  2.发送模板  [后面优化成后台发送]
  sendMessage(prepayId, orderID) {
    var that = this;
    var senddata = {
      "keyword1": {
        "value": prepayId,
        "color": "#4a4a4a"
      },
      "keyword2": {
        "value": goodsName,
        "color": "#9b9b9b"
      },
      "keyword3": {
        "value": that.formatTime(new Date),
        "color": "#9b9b9b"
      },

    };
    //此处要根据模板类型跳转
    app.https_request('pushmessage/sendmessage.do', { "loginPlat": app.currPlat, "userId": userId, "data": senddata, "form_id": prepayId, "page": "", "tempType": 1, "orderId": orderID }, function (res) {
      if (res.data.code == 0) {
        console.log("推送成功");
      } else {
        console.log("推送失败");
      }
    });
  },


  formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    if (month < 10) {
      month = "0" + month;
    }
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
  }

});
function extract_first_url(image_url) { //以,分隔的图片地址，取第一个
  if (image_url == null) {
    return "";
  }
  var index = image_url.indexOf(",");
  if (index > -1) {
    return image_url.substring(0, index);
  } else {
    return image_url;
  }
}