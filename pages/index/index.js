//index.js
//获取应用实例
const app = getApp()
Page({
    data: {
        showClearBtn1: true,
        showClearBtn: false,
        goodsList1: [], //爆品
        goodsList: [], //新品热销
        //inputVal:[],//搜索
        lunboList: [], //轮播图
        lunboListBaner:[],//小轮播
        seckillList: [], //秒杀
        navigatorType: [], //分类
        tehuiList:[],//特惠
        pageNo: 1, //分页
        pageSize: 15, //每页条数seckillList
        shouquan: true, //授权标识
        isShow: true, //是否隐藏        
        isTan: true,
        cancel:true,
        loginScore: '',
        showCodePopup: false,
        imgCommonUrl:app.imgCommonUrl,
    },
    /**
     * 商品详情
     */
     goGoodsDetail: function(e) {
         var goodsId = e.currentTarget.dataset.goodid;
         console.log('eeeeeee'>>e)
         wx.navigateTo({ url: '/pages/mall/detail/detail?goodsId=' + goodsId });
     },
    /**
     * 分类
     */
    goMall: function(e) {
        getApp().globalData.typeId = e.currentTarget.dataset.typeid;
        getApp().globalData.typeName = e.currentTarget.dataset.typename;
        wx.reLaunch({
            url: '/pages/mall/mall',
        })
    },
    /**
     * 热销
     */
  goSpringsale: function () {
      wx.navigateTo({
        url: '/pages/index/springsale/springsale',
      })

  },
    /**
     * 授权更新用户信息
     */
    onGotUserInfo: function(e) {
        var that = this;
        var formId = e.detail.formId;
        var userId = app.globalData.userId;
        if (userId) {
            app.updateUser(userId);
        } else {
            console.log(e);
        }
        that.setData({
            shouquan: true
        })
    },
    /**
     * 获取页面滚动
     */
    onPageScroll: function (e) {
      let that = this;
      this.setData({
        scrollTop: e.scrollTop
      })
      let query = wx.createSelectorQuery()
      query.select('#search').boundingClientRect((rect) => {
        // let top = rect.top
        // console.log('ssssssssssssssssss',top);
        // if (top <=0) {  //临界值，根据自己的需求来调整
        //   that.setData({
        //     fixedNav: true,    //是否固定导航栏
        //     showToTop: true  //是否回到临界值的状态
        //   })
        // } else {
        //   this.setData({
        //     fixedNav: false,
        //     showToTop: false
        //   })
        // }
      }).exec()
    },

    /**
     * 关闭送积分，
     */
  cancel:function(e) {

        var that = this;
        that.setData({
            isShow: true 
        });
    },
  /**
  * 关闭送积分，
  */
  closeScoreModal: function (e) {
    var that = this;
    that.setData({
      isShow: true
    });
  },
    /**
     * 增加访问记录
     */
    addVisit: function(userId, score) {
        var that = this;
        app.https_request('visit/addVisit.do', {
            loginPlat: app.currPlat,
            userId: userId,
        }, function(ret) {
            if (ret.data.code == 0) {
                //更新用户积分
                that.setData({
                    isShow: false //不隐藏
                })
                that.updateScore(userId, score);
            } else {
                if (that.data.isTan) {
                    that.setData({
                        shareShow: true,
                        isTan: false
                    });
                }
            }
        }, function(err) {

        })
    },
  goPageMall: function () {
    wx.reLaunch({
      url: '/pages/mall/mall',

    })
  },
    /**
     * 更新状态
     */
    updateScore: function(userId, score) {
        var that = this;
        app.https_request("user/updateNewScore.do", { userId: userId, score: score }, function(ret) {
            if (ret.data.code == 0) { //该处执行调用刷新个人中心页的方法

            } else {

            }
        })
    },
    //获取积分
    checkScore: function() {
        //1.获取积分配置
        var that = this;
        var userId = wx.getStorageSync('weiaijia-userId') ? wx.getStorageSync('weiaijia-userId') : app.globalData.userId;
        app.https_request('config/getConfigScore.do', {
            loginPlat: app.currPlat
        }, function(res) {
            if (res.data.code == 0) { //有设置积分
                var object = res.data.objects[0];
                that.setData({
                    loginScore: object.dayLoginScore
                })
                if (userId) {
                    if (object.dayLoginScore > 0) {
                        that.addVisit(userId, object.dayLoginScore);
                    }
                }
            } else {

            }
        })
    },

    showPopupFromQrcode: function(options) {
        Object.keys(options).map(key => {
             options[key] = encodeURIComponent(options[key]);
        })
        console.log(options);
        if (app.globalData.userId) {
            this.setData({
                qrcodeScore: 88,
                showCodePopup: true,
            })
        } else {
            app.wxLogin().then(() => {
                this.setData({
                    qrcodeScore: 88,
                    showCodePopup: true,
                })
            }).catch(() => {
                console.log("登陆失败")
            });
        }
    },

    closeCodePopup: function() {
        this.setData({
            showCodePopup: false,
        });
    },

    onLoad: function(options) {
        this.setData({
            isTan: true
        })
        // var userId = wx.getStorageSync('weiaijia-userId') || app.globalData.userId;
        // if (userId) {
        //     app.addUserAction(userId, 0, 14, 0, 0)
        //  }
        this.getLunboList(); //轮播
        this.getLunboListBaner();//小轮播
        this.getSeckillList(); //秒杀
        this.getGoodsList(); //新品推荐
        this.getGoodsList1(); //热销爆品
        this.getGoodsType(); //获取分类
     

        if (Object.keys(options).length) {
            this.showPopupFromQrcode(options); // 扫二维码获取积分弹窗
        } else {
            console.log("没有扫二维码获得积分")
        }
    },

    onShow: function() {
        var that = this;
        wx.getSetting({
            success(res) {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                    that.setData({
                        shouquan: true
                    });
                    that.checkScore();
                } else {
                    that.setData({
                        shouquan: false
                    });
                }
            }
        });
        // this.showQrcodeComing();
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },
    /**
     * 搜索框事件
     */
  showSearchPage:function() {
      wx.navigateTo({
        url: '/pages/index/search/searchPage'
      })

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },
    /**
     * 用户点击右上角分享
     */



/*搜索结束*/


    onShareAppMessage: function() {
        var that = this;
        return {
            title: '欢迎进入唯爱家商城',
            path: '/pages/index/index?introducer=' + app.globalData.userId,
            success: function(res) {},
            fail: function(res) {
                // 转发失败
            }
        }
        //app.addUserAction(app.globalData.userId, 1, 14, 0, 0); //分享首页行为
    },

    /**
     * 获取录轮播图
     * 最多支持 15张
     */
    getLunboList: function() {
        var that = this;
        app.https_request("carousel/pictureList.do", {
            'pageNo': that.data.pageNo,
            'pageSize': that.data.pageSize,
            'loginPlat': app.currPlat
        }, function(res) {
            that.setData({
                lunboList: res.data.objects,
            })
            console.log('轮播图',res.data)
        })
    },
    /*banner接口*/
  getLunboListBaner: function () {
    var that = this;
    app.https_request("carousel/getAdvList.do", {
      'isEffect': 1,
      'advLocation': 5,
    }, function (res) {
      that.setData({
        lunboListBaner: res.data.data,
      })
      console.log('广告轮播',res.data)
    }, false, false, true)
  },
    /**
     * 获取秒杀商品
     */
    getSeckillList: function() {
        var that = this;
        var tmp = {
            'pageNo': that.data.pageNo,
            'pageSize': 4,//获取秒杀商品的数量
            'loginPlat': app.currPlat,
            'platIntNumb':3333,
            'isSpp': 1,
        };
        app.https_request("goods/appGoodsList.do", tmp, function(res) {
            if (res.data.count > 0) {
                let List = res.data.objects;
                for (let i = 0; i < List.length; i++) {
                    var a = List[i].goodsImage.split(',')
                    List[i].headImage = a[0];
                }
              console.log("秒杀",res.data);
              console.log("dddd",res.pageSize)
                that.setData({
                    seckillList: res.data.objects
                })
            } else { //无数据

            }
        }, function(err) {
            wx.hideNavigationBarLoading();
            wx.showToast({
                title: '加载失败',
                icon: 'loading',
                duration: 2000
            });
        })
    },
    /**
     * 新品推荐
     */
    getGoodsList: function() {
        var that = this;
        var tmp = {
            'pageNo': that.data.pageNo,
            'pageSize': 4,
            'loginPlat': app.currPlat,
            'platIntNumb': 3333,
            'isRecommend': 1,
            'isNew': 1,
        };
        app.https_request("goods/appGoodsList.do", tmp, function(res) {
            if (res.data.count > 0) {
                let List = res.data.objects;
                for (let i = 0; i < List.length; i++) {
                    var a = List[i].goodsImage.split(',')
                    List[i].headImage = a[0];
                }
                that.setData({
                    goodsList: res.data.objects
                })
            } else { //无数据

            }
        })
    },
    /**
     * 热销爆品
     */
    getGoodsList1: function() {
        var that = this;
        var tmp = {
            'pageNo': that.data.pageNo,
            'pageSize': 15,
            'loginPlat': app.currPlat,
            'platIntNumb': 3333,
            'isHot': 1,
           
        };
        app.https_request("goods/appGoodsList.do", tmp, function(res) {
          console.log("热销",res);
            if (res.data.count > 0) {
                let List = res.data.objects;
                for (let i = 0; i < List.length; i++) {
                    var a = List[i].goodsImage.split(',')
                    List[i].headImage = a[0];
                }
                that.setData({
                    goodsList1: res.data.objects
                })
            } else { //无数据

            }
        })
    },
    /**获取全部商品类型**/
    getGoodsType() {
        var that = this;
        app.https_request("/goods/getGoodsTypeList.do", {
            'loginPlat': app.currPlat,
        }, function(res) {
            if (res.data.code != 0) {
                return;
            }
            var navigatorType = res.data.objects;
            for (var i = 0; i < navigatorType.length; i++) {
                if (!navigatorType[i].typeIcon) {
                    navigatorType[i].typeIcon = 'http://www.haoshi360.com/xcximages/allShop.png';
                }
            }
            that.setData({
                navigatorType: navigatorType
            });
            wx.hideNavigationBarLoading();
        }, function(err) {
            wx.hideNavigationBarLoading();
            wx.showToast({
                title: '加载失败',
                icon: 'none',
                duration: 2000
            });
        })
    }
})