// pages/index/springsale/springsale.js
const app = getApp();
Page({
  data: {
    seckillList: [], //限时特惠
    goodsList: [], //新品热销
    pageNo:0,
    hasMoreData: true,
  },
  /**
      * 商品详情
      */
  goGoodsDetail: function (e) {
    var goodsId = e.currentTarget.dataset.goodid;
    console.log('eeeeeee' >> e)
    wx.navigateTo({ url: '/pages/mall/detail/detail?goodsId=' + goodsId });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getSeckillList(); //限时特惠
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
    console.log("%c 下拉", "color:#00f;font-size:36px");
    that.data.pageNo = 1;
    that.data.goodsList = []; // 清空消息列表，但是不渲染
    wx.showNavigationBarLoading(); //在标题栏中显示加载
    that.getSeckillList();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */

    onReachBottom: function () {
      var that = this;
      console.log(that.data.hasMoreData)
      if (that.data.hasMoreData) {
        console.log("%c 上拉", "color:#00f;font-size:36px");
        that.data.pageNo++;
        that.getSeckillList(); // 这里不能写成pageNo++/++pageNo
      } else {
        wx.showToast({
          title: '没有更多数据',
          icon: 'none',
          duration: 2000
        });
      }
    },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  getSeckillList: function () {
    var that = this;
    console.log(that.data.pageNo);
    var tmp = {
      'pageNo': that.data.pageNo,
      'pageSize': 10,//获取秒杀商品的数量
      'loginPlat': app.currPlat,
      'platIntNumb': 3333,
      'isSpp': 1,
    };
    app.https_request("goods/appGoodsList.do", tmp, function (res) {
      var datas = that.data.seckillList;
      if (that.data.pageNo == 1) {
        datas = []
      }
      if (res.data.count > 0) {
        let List = res.data.objects;
        for (let i = 0; i < List.length; i++) {
          var a = List[i].goodsImage.split(',')
          List[i].headImage = a[0];
        }
        var num = res.data.objects;
        num.map(item => {
          item.headImage = item.goodsImage.split(',')[0];
          return item;
        });
        // console.log(res.data.objects);
        if (res.data.objects.length < 6) {
          var ret = {
            seckillList: datas.concat(num),
            hasMoreData: false,
          };
          that.setData(ret);
        } else {
          var ret = {
            seckillList: datas.concat(num),
            hasMoreData: true,
          };
          that.setData(ret);
        }
       
      } else { //无数据

      }
    }, function (err) {
      wx.hideNavigationBarLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'loading',
        duration: 2000
      });
    })
  },
})