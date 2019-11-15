// pages/personal/ticket/ticket.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: ["未使用", "已使用", "已失效"],//页面显示集合
    tabsList: [0, 1, 2],//根据状态实际和接口交互的数值  :识别到0默认全部
    activeIndex: 0,
    pageNo: 1,
    pageSize: 10,
    hasMoreData: true,
    ticketList: {},
    price:'',
    type: 1,//1：为普通 2：确认订单处选择
  },
  tabClick: function (e) {
    var that = this;
    var index = e.currentTarget.id;
    //重置数据
    that.setData({
      pageNo: 1,
      ticketList: {},
      activeIndex: index
    })
    that.getUserTicketList();
  },
  /**
   * 去领券
   */
  goCardTicket: function () {
    wx.navigateTo({
      url: '/pages/cardticket/cardticket',
    })
  },
  /**
   * 确认订单处进来选择优惠券
   */
  chooseUserCard: function (e) {
    var ticketInfo = e.currentTarget.dataset.item;
    // console.log(this.data.price);
    // console.log(ticketInfo)
    if (this.data.price < ticketInfo.ticketMoney){
      // wx.showToast({
      //   title: '优惠金额大于商品金额',
      //   image: '/images/ai.png',
      //   duration: 2000
      // });
      app.toastShow(this, "优惠金额大于商品金额", "../../../images/ai.png");
      }else{
        pages = getCurrentPages(), //当前页面
        prevPage = pages[pages.length - 2]; //上一页面
        prevPage.chooseUserTicket(ticketInfo); //直接给上移页面赋值
        wx.navigateBack({ //返回
          delta: 1
        })
      }
      
  },
  /**
  * 卡券列表
  */
  getUserTicketList: function () {
    var that = this;
    wx.showNavigationBarLoading();
    app.https_request("cardticket/getUserTicketList.do", {
      'userId': app.globalData.userId,
      'isUse': that.data.tabsList[that.data.activeIndex],
      'pageNo': that.data.pageNo,
      'pageSize': that.data.pageSize
    }, function (res) {
      if (res.data.code == 0) {
        var datas = that.data.ticketList;

        if (that.data.pageNo == 1) {
          datas = []
        }

        var ticketList = res.data.objects;
        console.log(ticketList)
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
  // 去使用
  goshopping(){
    wx.navigateTo({
      url: '/pages/cardticket/cardticket',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var type = options.type ? options.type : 1;
    var price = options.price;
    // console.log(price);
    this.setData({
      price: price
    });
    this.setData({
      type: type
    });
    this.getUserTicketList();
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
    that.getUserTicketList();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    if (that.data.hasMoreData) {
      that.data.pageNo++;
      that.getUserTicketList();
    } else {
      wx.showToast({
        title: '没有更多数据',
        icon: 'none',
        duration: 2000
      });
    }
  },
})