//app.js
App({
    //正式    
    url: "https://www.vij365.com/cofC/wx/",
    urlUpload: "https://www.vij365.com/cofC/",
    aidaUrl: "https://www.vij365.com/cofC/aida/", //
    gameUrl: "https://wwww.vij365.com/suit_tiles/wx/cofC", //
    imgCommonUrl:'http://www.vij365.com/cofC',//
    // url:"http://192.168.0.100:54009/cofC_war_exploded/wx/",
    // urlUpload: "http://192.168.0.100:54009/cofC_war_exploded/cofC/",
    // aidaUrl: "http://192.168.0.100:54009/cofC_war_exploded/aida/", //
    // gameUrl: "http://192.168.0.100:54009/cofC_war_exploded/wx/", //
    // imgCommonUrl:'http://192.168.0.100:54009/cofC_war_exploded',//
    currPlat: 709, 
    headImg: "imageUpload/upload.do",
    carouse: "carouselUpload/upload.do",
    goods: "goodsImageUpload/upload.do",
    userImage: "userImageUpload/upload.do",
    aType: 3, 
    onLaunch: function(option) {
        var that = this;
        console.log("onlaunch--" + JSON.stringify(option));
        var introducer = option.query.introducer ? option.query.introducer : '';
        that.Promise = that.wxLogin(introducer);
        that.Promise.then(function(userId) {
            that.globalData.userId = userId; //设置全局变量
            wx.setStorageSync('weiaijia-userId', userId);
        });
    },


    https_request(urlaction, data, callback, errorcallback, loading) {
        var url = this.url + urlaction;
        wx.showNavigationBarLoading();
        if (loading) {
            wx.showLoading();
        }
        var requestTask = wx.request({
            url: url,
            header: {
                'content-type': 'application/json'
            },
            data: data,

            success: function(res) {
                if (typeof callback == "function") {
                    loading && wx.hideLoading();
                    wx.hideNavigationBarLoading();
                    callback(res)
                }
            },
            fail: function(error) {
                loading && wx.hideLoading();
                wx.hideNavigationBarLoading();
                if (typeof errorcallback == "function") {
                    errorcallback(error);
                } else {
                    wx.showToast({
                        title: '网络请求错误',
                        icon: "loading"
                    });
                }
            }
        });
        return requestTask; //返回请求任务对象,可以用requestTask.abort()取消请求任务
    },
    /**
     * 名片的接口
     */
    aida_http_request: function(urlaction, data, callback, errorcallback, loading) {
        var url = this.aidaUrl + urlaction;
        wx.showNavigationBarLoading();
        if (loading) {
            wx.showLoading();
        }
        var requestTask = wx.request({
            url: url,
            header: {
                'content-type': 'application/json'
            },
            data: data,
            success: function(res) {
                if (typeof callback == "function") {
                    loading && wx.hideLoading();
                    wx.hideNavigationBarLoading();
                    callback(res)
                }
            },
            fail: function(error) {
                loading && wx.hideLoading();
                wx.hideNavigationBarLoading();
                if (typeof errorcallback == "function") {
                    errorcallback(error);
                } else {
                    wx.showToast({
                        title: '网络请求错误',
                        icon: "loading"
                    });
                }
            }
        });
        return requestTask; //返回请求任务对象,可以用requestTask.abort()取消请求任务
    },
    /**
     * 游戏的接口
     */
    game_http_request: function(urlaction, data, callback, errorcallback, loading) {
        var url = this.gameUrl + urlaction;
        wx.showNavigationBarLoading();
        if (loading) {
            wx.showLoading();
        }
        var requestTask = wx.request({
            url: url,
            header: {
                'content-type': 'application/json'
            },
            data: data,
            success: function(res) {
                if (typeof callback == "function") {
                    loading && wx.hideLoading();
                    wx.hideNavigationBarLoading();
                    callback(res)
                }
            },
            fail: function(error) {
                loading && wx.hideLoading();
                wx.hideNavigationBarLoading();
                if (typeof errorcallback == "function") {
                    errorcallback(error);
                } else {
                    wx.showToast({
                        title: '网络请求错误',
                        icon: "loading"
                    });
                }
            }
        });
        return requestTask; //返回请求任务对象,可以用requestTask.abort()取消请求任务
    },

    /**
     * introducerId:邀请人id，可不传
     */
    //微信登陆接口
    wxLogin: function(introducer) {
        var that = this;
        return new Promise(function(resolve, reject) { //ES6
            var userId = that.globalData.userId;
            if ((userId != null) && (userId.length != 0)) {
                that.globalData.userId = userId; //设置全局变量
                resolve(userId);
            }
            wx.login({
                success: function(res) {
                    console.log('ggggggggggggggggggggggggggggggggggg',res)
                    if (res.code) {
                        //组装数据
                        var params = {
                            "code": res.code,
                            "loginPlat": that.currPlat
                        }
                        if (introducer != null && introducer.length != 0) {
                            params["introducer"] = introducer;
                        }
                        //发起网络请求
                        that.https_request('weixinLogin/analysisCode.do', params, function(ret) {
                            if (ret.data.code == 0) {
                                var user_info = ret.data.objects[0];
                                var userId = user_info.userId;
                                that.globalData.userId = userId; //设置全局变量
                                wx.setStorageSync("weiaijia-userId", userId);
                                that.updateUser(userId);
                                resolve(userId);

                            } else {
                                wx.showToast({
                                    title: '登陆失败',
                                    icon: 'none',
                                    duration: 2000
                                })
                                return;
                            }
                        }, function(err) {
                            wx.showToast({
                                title: '授权登陆失败',
                                icon: 'none',
                                duration: 2000
                            })
                            return;
                        })
                    } else {
                        wx.showToast({
                            title: '登陆失败',
                            icon: 'none',
                            duration: 2000
                        })
                        return;
                    }
                }
            });
        })

    },
    //更新用户信息
    updateUser: function(userId) {
        var that = this;
        wx.getUserInfo({
            withCredentials: true,
            success: function(res2) {
              console.log('wx login >>', res2, userId);
                console.log("获取个人信息成功");
                var userInfo = JSON.parse(res2.rawData);
                var loginTemp = {
                    "userId": userId,
                    "nickName": userInfo.nickName,
                    "headImage": userInfo.avatarUrl,
                    "userSex": userInfo.gender,
                    "city": userInfo.city,
                    "country": userInfo.country,
                    "province": userInfo.province,
                }
                that.https_request("weixinLogin/updateUserdata.do", loginTemp, function(res3) {
                    console.log("更新个人信息成功");
                })
            },
            error: function(res2) {
                console.log("授权失败--" + JSON.stringify(res2));
            }
        });
    },

    //行为上报: 0为小程序，1为网站，2为APP,3为公众号
    addUserAction(userId, type, objectType, objectId, salesPersonId, formId) {
        var that = this;
        var param;
        if (!formId || formId == '') {
            param = {
                appId: that.currPlat,
                userId: userId,
                type: type,
                objectType: objectType,
                objectId: objectId,
                salesPersonId: salesPersonId,
                gateway: 0
            }
        } else {
            param = {
                appId: that.currPlat,
                userId: userId,
                type: type,
                objectType: objectType,
                objectId: objectId,
                salesPersonId: salesPersonId,
                formId: formId,
                gateway: 0
            }
        }
        that.aida_http_request("reportUserCardBehavior.do", param, function(ret) {
            console.log("userId----" + userId);
            console.log("数据上报--" + JSON.stringify(ret.data));
        }, function(ret) {
            console.log("数据上报失败--" + JSON.stringify(ret.msg));
        })
    },
    globalData: {
        userId: '',
        scene: '',
    },
    //自定义弹窗
    toastShow: function (that, str, icon) {
    that.setData({
      isShow: true,
      txt: str,
      iconClass: icon
    });
    setTimeout(function () {
      that.setData({
        isShow: false
      });
    }, 1000);
  }, 
})
