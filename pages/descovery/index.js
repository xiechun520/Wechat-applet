// pages/descovery/index.js
const app = getApp()
Page({
    /**
     * 页面的初始数据
     */
    data: {
        news: [], //项目列表. 
        likeImg: app.imgCommonUrl+'/xcximages/like.png',
        pageNo: 1,
        pageSize: 10,
        hasMoreData: true,
        loadData: false,
    },
    /**
     * 详情
     */
    goDetail: function(e) {
        console.log(e);
        var id = e.currentTarget.id;
      wx.navigateTo({
            url: '/pages/descovery/detail/detail?descoveryId=' + id
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this;
        // if(app.globalData.userId){
        //     app.addUserAction(app.globalData.userId, 0, 3, 0, 0)
        // }
        that.getArticleList();
    },
    /**
     * 获取列表
     */
    getArticleList: function() {
        var that = this;
        app.https_request("/recommend/recommendDescoveryList.do", {
            'pageNo': that.data.pageNo,
            'pageSize': that.data.pageSize,
            'applicationID': app.currPlat,
        }, function(res) {
            var datas = that.data.news;
            if (that.data.pageNo == 1) {
                datas = []
            }
            var List = res.data.objects;
            var news = [];
            for (var i = 0; i < List.length; i++) {
                var type = List[i].descoveryType;
                if(type != 10){
                    news.push(List[i]);
                }
            }
            for (var i = 0; i < news.length; i++) {
                var string = news[i].descoveryDetails;
                if (!string) { continue; }
                var imgList = string.match(/<img.*?(?:>|\/>)/gi);
                if (!imgList) { continue; }
                news[i].imagesList = [];
                for (var time = 0; time < (imgList.length >= 3 ? 3 : imgList.length); time++) {
                    var url = imgList[time].match(/src=[\'\"]?([^\'\"]*)[\'\"]?/i);
                    var output = url[1];
                    news[i].imagesList.push(output)
                }
            }
            if (res.data.count > 0) {
                if (news.length < that.data.pageSize) {
                    that.setData({
                        loadData: true,
                        news: datas.concat(news),
                        hasMoreData: false
                    })
                } else {
                    that.setData({
                        loadData: true,
                        news: datas.concat(news),
                        hasMoreData: true
                    })
                }
            } else { //无数据
                if (that.data.pageNo == 1) {
                    that.setData({
                        loadData: true
                    })
                }
            }
        }, function(err) {
            wx.showToast({
                title: '加载失败',
                icon: 'none',
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
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        var that = this;
        that.data.pageNo = 1;
        wx.showNavigationBarLoading(); //在标题栏中显示加载
        that.getArticleList();
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        var that = this;
        if (that.data.hasMoreData) {
            that.data.pageNo++;
            that.getArticleList();
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
    onShareAppMessage: function() {
        var that = this;
        return {
            title: "唯爱家动态",
            path: '/pages/descovery/index?introducer=' + app.globalData.userId,
            success: function (res) {
            },
            fail: function (res) {
                // 转发失败
            }
        }
        //app.addUserAction(app.globalData.userId, 1, 3, 0, 0);//分享首页行为
    }
})