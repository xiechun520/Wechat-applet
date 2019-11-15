// pages/personal/collect/collect.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        collectionList: [], //收藏列表        
        pageNo: 1,
        pageSize: 10,
        hasMoreData: true,
        appId:'',//应用id
    },
    /**
     * 前往分类
     */
    gotoMall(){
      var that=this;
      wx.reLaunch({
          url: '/pages/mall/mall',
      })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getcollectionList();
        this.setData({
             appId:app.currPlat
        })
    },
    /**获取收藏列表**/
    getcollectionList:function() {
        var that = this;
        wx.showNavigationBarLoading();
        app.https_request("goods/goodsCollList.do", {
            'userId': app.globalData.userId,
            'loginPlat': app.currPlat,
            'pageNo' : that.data.pageNo,
            'pageSize' : that.data.pageSize
        }, (res) => {
            if (res.data.code == 0) {
                var datas = that.data.collectionList;
                if (that.data.pageNo == 1) {
                    datas = []
                }
                for (var i = 0; i < res.data.objects.length; i++) {
                    var goodsImageString = res.data.objects[i].goodsCommon.goodsImage;
                    if (goodsImageString) {
                        res.data.objects[i].goodsCommon.goodsImageUrl = goodsImageString.split(",")[0]
                    }
                }
                var arr = [];
                var arr1 = [];//下架數組
              res.data.objects.forEach(function (item, index) {
                  //这里的item就是从数组里拿出来的每一个每一组
                if (item.goodsCommon.isSelled == 0 || item.goodsCommon.goodsStatus == 2) {
                    arr1 = arr1.concat(item);
                  } else {
                    arr = arr.concat(item);
                  }
                })
              
              var coll = arr.concat(arr1);
              console.log(coll)
                if (coll.length < that.data.pageSize) {
                    that.setData({
                        loadData: true,
                        collectionList: datas.concat(coll),
                        hasMoreData: false,
                    })
                } else {
                    that.setData({
                        loadData: true,
                        collectionList: datas.concat(coll),
                        hasMoreData: true,
                    })
                }
            } else {
                
            }
            wx.stopPullDownRefresh();
            wx.hideNavigationBarLoading();
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
        that.getcollectionList();
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        var that = this;
        if (that.data.hasMoreData) {
            that.data.pageNo++;
            that.getcollectionList();
        } else {
            wx.showToast({
                title: '没有更多数据',
                icon: 'none',
                duration: 2000
            });
        }
    },

})