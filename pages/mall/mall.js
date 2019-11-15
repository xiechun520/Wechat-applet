const app = getApp();
var userId = '';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    searchBoxText: '搜索',
    curIndex: 0,
    curNav: 1,
    goodsList: [], //商品列表
    inputVal: [],
    typeList: [],
    searchGoodslist: [],
    showClearBtn1: true,
    showClearBtn: false,
    top: 1000,
    totalPrice: 0,
    typeName: '推荐',
    pageNo: 1,
    pageSize:10,
    hasMoreData: true,
    isLoad: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getGoodsType(1);
    // if(app.globalData.userId){
    //     //访问商城
    //     app.addUserAction(app.globalData.userId, 0, 2, 0, 0)
    // }
    wx.hideNavigationBarLoading();
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
    console.log("%c onshow", "font-size:36px;")
    // switchTab不能传递参数，所以需要全局变量；
    var curNav = app.globalData.typeId || 0;
    this.setData({
      curNav: curNav
    })
    if (app.globalData.typeId) {
      this.getGoodsList();
    }
    if (app.globalData.typeName) {
      this.setData({
        typeName: app.globalData.typeName
      });
    }
    getApp().globalData.typeId = null;
    getApp().globalData.typeName = null;
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    getApp().globalData.typeId = this.data.curNav;
    getApp().globalData.typeName = this.data.typeName;
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
    that.getGoodsList();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    if (that.data.hasMoreData) {
      console.log("%c 上拉", "color:#00f;font-size:36px");
      that.data.pageNo++;
      that.getGoodsList(); // 这里不能写成pageNo++/++pageNo
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
    var that = this;
    return {
      title: "唯爱家商城",
      path: '/pages/mall/mall?introducer=' + app.globalData.userId,
      success: function (res) {
      },
      fail: function (res) {
        // 转发失败
      }
    }
    // app.addUserAction(app.globalData.userId, 1, 2, 0, 0);//分享商城行为
  },
  showSearchPage:function() {
    wx.navigateTo({
      url: '/pages/index/search/searchPage'
    })

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
showSearchPage:function() {
      wx.navigateTo({
        url: '/pages/index/search/searchPage'
      })

    },
  //点击清除搜索内容
  clearInput(e) {
    var that = this;
    that.setData({
      showClearBtn: false,
      inputVal: '',
    });
  },

  inputShowed() {
    var that = this;
    that.setData({
      showClearBtn1: true,
    });
  },

  // 输入内容时 把当前内容赋值给 查询的关键字，并显示搜索记录  
  inputTyping(e) {
    var searchTitle = e.detail.value;
    if(e.detail.value ==''){
      this.setData({
        searchGoodslist:[]
      })
      return;
    }
    app.https_request("goods/appGoodsList.do", {
      loginPlat: app.currPlat,
      goodsName: searchTitle,
    }, (res) => {
      if (res.data.code == 0) {
        this.setData({
          searchGoodslist: res.data.objects,
          showClearBtn: Boolean(searchTitle),
          inputVal: searchTitle,
          showClearBtn1: true,
        });
        wx.hideNavigationBarLoading();
      } else {
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

  switchRightTab(e) {
    this.data.pageNo = 1;
    var typeName = '';
    let id = Number(e.target.dataset.id);
    var index = parseInt(e.target.dataset.index);
    console.log(id)
    console.log(index)
    switch (id) {
      case 0:
        typeName = "推荐";
        break;
      case 1:
        typeName = "热销";
        break;
      case 2:
        typeName = "秒杀";
        break;
      default:
        typeName = this.data.typeList[index].typeName;
        break;
    }

    this.setData({
      goodsList: [],
      curNav: id,
      curIndex: index,
      typeName: typeName,
      isEmptyPage: false,
    });
    this.hasMoreData = true;
    this.getGoodsList();
  },

  tabClick(e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    })
  },

  goGoodsDetail: function (e) {
    var that = this,
      index = Number(e.currentTarget.dataset.index),
      type = e.target.dataset.type,
      goodsInfo = this.data.goodsList[index];
    wx.setStorage({
      key: "goodsInfo",
      data: goodsInfo,
      success: function (res) {
        wx.navigateTo({
          url: 'detail/detail?goodsId=' + goodsInfo.goodsId
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
      url: '/pages/mall/detail/detail?goodsId=' + goodsId
    });
  },

  /**获取左边全部商品类型**/
  getGoodsType(refresh, loadMore) {
    app.https_request("goods/getGoodsTypeList.do", {
      loginPlat: app.currPlat,
    }, (res) => {
      console.log("商品列表", res);
      if (res.data.code === "0") {
        this.setData({
          typeList: res.data.objects,
        });
       
        this.getGoodsList();
        wx.hideNavigationBarLoading();
      } else {
        console.log("暂无商品分类");
      }
      wx.hideLoading();
    }, function (err) {
      wx.hideLoading();
      wx.hideNavigationBarLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'loading',
        duration: 2000
      });
    })
  },

  /**
   * 获取商品列表
   * page:在且仅在上拉翻页的时候，page才被传入
   */
  getGoodsList() {
    var that = this;
    wx.showNavigationBarLoading();
    var tmp = {
      pageNo: that.data.pageNo,
      pageSize: that.data.pageSize,
      isPassSell: 1,
      loginPlat: app.currPlat,
    }
    console.log(this.data.curNav);
    switch (Number(this.data.curNav)) {
      case 0:
        tmp.isRecommend = 1;
        break;
      case 1:
        tmp.isHot = 1;
        break;
      case 2:
        tmp.isDtbt = 1;
        break;
      default:
        tmp.goodsType = this.data.curNav;
        tmp.isPassSell = 1;
        break;
    }
    app.https_request("goods/appGoodsList.do", tmp, (res) => {
      var datas = that.data.goodsList;
     
      if (res.data.code == 0) {
        if (that.data.pageNo == 1) {
          datas = []
        }
        var list = res.data.objects;
        list.map(item => {
          item.headImage = item.goodsImage.split(',')[0];
          return item;
        });
        
        if (list.length < that.data.pageSize) {
          var ret = {
            
            goodsList: datas.concat(list),
            isLoad: false,
            hasMoreData: false,
          };
          console.log('ggggg', ret)
          that.setData(ret);
        } else {
          var ret = {
            goodsList: datas.concat(list),
            isLoad: false,
            hasMoreData: true,
          };
          console.log('ggggg', ret)
          that.setData(ret);
        }

      } else if (res.data.code == 1) {
        var ret = {
          goodsList: datas,
          isLoad: false,
          hasMoreData: false,
        };
        that.setData(ret);
      } else {
        var ret = {};
        if (that.data.pageNo === 1) {
          ret.isLoad = false;
        }
        ret.goodsList = []
        that.setData(ret);
      }
    }, function (err) {
      wx.hideNavigationBarLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'loading',
        duration: 2000
      });
    });
  }
})