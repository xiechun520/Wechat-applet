// vijpro/pages/index/search/searchPage.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputVal: [],
    showSearchFocus: true,
    showClearBtn1: true,
    searchGoodslist: [],
    keywords:'',
    showNotData:false,
    hasMoreData: true,
    number: '1',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.searchType(options.content)
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
    that.data.number = 1;
    that.data.searchGoodslist = []; // 清空消息列表，但是不渲染
    that.getGoodsList(that.data.keywords);
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
      that.data.number++;
      that.searchType(that.data.keywords); // 这里不能写成pageNo++/++pageNo
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


  hideSearch() {
    var that = this;
    that.setData({
      top: '1000',
      searchBoxText: '搜索',
    });
  },

  searchLogShowed() {
    var that = this;
    that.setData({
      top: '48',
      searchBoxText: '取消',
    });
  },

  //点击清除搜索内容
  clearInput(e) {
    var that = this;
    that.setData({
      showClearBtn: false,
      inputVal:'',
    });
  },

  showSearchFocus() {
    var that = this;
    that.setData({
      showClearBtn1: true,
    });
  },

  // search() {
  //   var that = this;
  //   console.log("ffff")
  //   wx.navigateTo({
  //     url: '/pages/mall/poster/poster?goodId= '
  //   })

  // },

  // 输入内容时 把当前内容赋值给 查询的关键字，并显示搜索记录  
  searchType(e) {
    console.log('eeeeeeeeeeeee>>', e);
    console.log(app.currPlat)
    this.setData({
      keywords: e,
    })
    this.setData({
      showNotData:false,
    })
    var searchTitle = e
    if (e == '') {
      console.log('ddd')
      this.setData({
        searchGoodslist: []
      });
      return;
    }
    console.log(app.currPlat, searchTitle)
    app.https_request("goods/searchGoodsListPort.do", {
      loginPlat: app.currPlat,
      goodsName: searchTitle,
      page: this.data.number,
      limit: 10,
    }, (res) => {
      console.log('res', res);
      var datas = this.data.searchGoodslist;
     
      if (res.data.code == 0) {
        if (res.data.objects.length>0){
          for (let i = 0; i < res.data.objects.length; i++) {
            let headerImg = res.data.objects[i].goodsImage.split(',')[0];
            var style = [];
            var arr = [];
            for (var j = 0; j < res.data.objects[i].spectypeList.length;j++){
              style = style.concat(res.data.objects[i].spectypeList[j].specInfo.split(",")[0]);
            }
            
            res.data.objects[i].style = style;
            
            res.data.objects[i].headerImg = headerImg;
          }
        }
        var list = res.data.objects;
        console.log("changdu",list.length)
        if (list.length < 10) {
          var ret = {
            searchGoodslist: datas.concat(list),
            hasMoreData: false,
            showClearBtn: Boolean(searchTitle),
            inputVal: searchTitle,
            showClearBtn1: true,
          };
          console.log('ggggg', ret)
          this.setData(ret);
        } else {
          var ret = {
            searchGoodslist: datas.concat(list),
            hasMoreData: true,
            showClearBtn: Boolean(searchTitle),
            inputVal: searchTitle,
            showClearBtn1: true,
          };
          console.log('ggggg', ret)
          this.setData(ret);
        }
      } else if (res.data.code == 1){
        this.setData({
          showNotData: true,
        })
      }
    }, function (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'loading',
        duration: 1500
      });
    })
  },


  tabClick(e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    })
  },

  goGoodsDetail: function (e) {
    var that = this;
    console.log('e//',e)
    let id = e.currentTarget.dataset.goodsid;
    let goodsInfo = '';
    wx.setStorage({
      key: "goodsInfo",
      data: goodsInfo,
      success: function (res) {
        wx.navigateTo({
          url: '/pages/mall/detail/detail?goodsId=' + id
        });
      },
      fail: function () {
        wx.showToast({
          title: '数据错误'
        });
      }
    });
  },


  goDetailFromSearch(e) {
    let goodsId = e.currentTarget.dataset.item.goodsId;
    this.setData({
      showClearBtn1: false,
      top: 1000,
      inputVal: '',
    })
    wx.navigateTo({
      url: '/pages/mall/detail/detail?goodsId =' + goodsId
    });
  },

})