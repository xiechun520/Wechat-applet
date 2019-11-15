// vijpro/pages/index/search/searchPage.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    inputVal: '',
    showSearchFocus:true,
    showClearBtn1: true,
    searchGoodslist:[],
    searchData:'',
    objItem:[
      
      ],
    historySeaData:[],
    tHotData:[],
    getHotSearchGoods:'',
    
  },
   /** 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  this.getHotSearchGoods()
  app.https_request("footMark/myMarked.do", {
      'userId': app.globalData.userId,
      'pageNo': 1,
      'pageSize': 5
    }, (res) => {
    })
    let historyData = wx.getStorageSync('historyShearch');
    let allSearchData = JSON.parse(historyData)
    if (allSearchData) {
      let ff = this.unique(allSearchData.proJectName);
      let sData = [];
      for (let i = 0; i < ff.length; i++) {
        if (i < 5) {
          sData.push(ff[i])
        }
      }
      this.setData({
        historySeaData: sData
      })

    }
  },

/*热门搜索 */
getHotSearchGoods:function(){
  var that=this;
  let sendData={
    'loginPlat': app.currPlat,
    'isHot':1,
  }
  app.https_request("carousel/getHotGoods.do", sendData,(res) => {
    if (res.data.code == 0){
      that.setData({
        getHotSearchGoods: res.data.objects
      })
    }else{
      that.setData({
        getHotSearchGoods: [],
      })
    }
  })
},

 
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  unique(arr){
    var tmp = new Array();
        for(var m in arr){
      tmp[arr[m]] = 1;
    }
    //再把键和值的位置再次调换
    console.log(tmp);
    var tmparr = new Array();
    for (var n in tmp) {
      tmparr.push(n);
    }
    return tmparr;
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

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },




  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },




  //点击清除搜索内容
  clearInput(e) {
    var that = this;
    that.setData({
      showClearBtn: false,
      inputVal: '',
    });
  },

  showSearchFocus() {
    var that = this;
    that.setData({
      showClearBtn1: true,
    });
  },
  searchData(e){
    console.log('eeee',e)
    this.setData({
      searchData: e.detail.value
    })
  },
  search(e) {
    var that = this;
    console.log("ffff", e)
    // console.log('ggg>', this.searchData);
    let datas = e.detail.value ? e.detail.value:e.currentTarget.dataset.variable;
    if (datas == '' || datas == undefined  ){
      wx.showModal({
        title: '提示',
        content: '请输入想要查询的商品信息！',
        success(res) {
          if(res.confirm) {
            // console.log('用户点击确定')
          } else if (res.cancel) {
            // console.log('用户点击取消')
          }
        }
      })
      return;
    }
    let srt = { 'proJectName': [datas]}
    let historyData = wx.getStorageSync('historyShearch');
    console.log('historyData>>>', historyData)
    if (historyData){
      let allSearchData = JSON.parse(historyData)
      allSearchData.proJectName.unshift(datas );
      console.log('allSearchData>>>', allSearchData);
      wx.setStorageSync('historyShearch', JSON.stringify(allSearchData))
    }else{
      wx.setStorageSync('historyShearch', JSON.stringify(srt))
    }

    wx.navigateTo({
      url: '/pages/index/searchcom/searchcom?content=' + datas
    })

  },

 

  tabClick(e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    })
  },

  goDetailFromSearch(e) {
    let goodsId = e.currentTarget.dataset.item.goodsId;
    this.setData({
      showClearBtn1: false,
      top: 1000,
      inputVal: '',
    })
    wx.navigateTo({
      url: '/pages/mall/detail/detail?goodsId ='+ goodsId
    });
  },

})
