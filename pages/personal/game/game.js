// pages/personal/game/game.js
const app = getApp();
var eatTimer;
var wadouTimer;
const douvoice = wx.createInnerAudioContext(); //单个全局对象
Page({

    /**
     * 页面的初始数据
     */
    data: {
        playerId: '',//玩家id
        petInfo: {},//宠物信息
        playerInfo: {},//玩家信息
        doustatus: 'kong',//空碗
        eattimeflag: true,//进食时间隐藏标识
        douflag: false,//豆隐藏标识
        eattime: '00:00:00',//进食时间
        lj_bz: 0,//累计标识
        sayflag: true,//说话显示隐藏
        isalreadyflag: true,//是否有金豆收
        shuogeflag: true,//收金豆特效
        showBtn: true,//隐藏与显示
        showmessageflag: true,//提示信息
        showMessage: '',
        tuankuanflag: true,
        count: 0,
        imgCommonUrl:app.imgCommonUrl,
    },
    /**
     * 点击猴子显示
     */
    showBtn: function () {
        this.setData({
            showBtn: false
        })
    },
    /**
     * 关闭遮罩
     */
    closeModal: function () {
        this.setData({
            showBtn: true
        })
    },
    /**
     * 去游戏
     */
    gotogame: function () {
      wx.navigateTo({
          url: '/pages/game/game'
        })
    },
    /**
     * 获取用户金币排名
    */
    goToPM: function () {
      wx.navigateTo({
          url: '/pages/rank/rank'
        })
    },
    /**
     * 我的好友
     */
    goToFriend: function () {
      wx.navigateTo({
          url: '/pages/friend/friend?playerId=' + this.data.playerId
        })
    },
    /**
     * 攻略
     */
    goToGL: function () {
        wx.navigateTo({
            url: '/pages/travel/travel'
        })
    },
    /**
     * 商城
     */
    goToMall: function () {
        wx.navigateTo({
            url: '/pages/mall/mall'
        })
    },
    /**
     * 攻略
     */
    goGongLue: function () {
        // wx.navigateTo({
        //   url: '/pages/manor/gonglue/gonglue'
        // })
        this.setData({
            showBtn: true,
            tuankuanflag: false,
        })
    },
    /**
     * 关闭弹框
     */
    closeTuanKuang: function () {
        this.setData({
            tuankuanflag: true,
        })
    },
    /**
     * 收金豆
     */
    getFood: function () {
        //获取用户信息
        var that = this;
        app.game_http_request("fomo3d/addCoinToUser.do", {
            parkUserId: that.data.playerId,
            petId: that.data.petInfo.id,
        }, function (ret) {
            if (ret.data.code == 0) {
                that.innerAudioContext = douvoice;
                that.innerAudioContext.autoplay = true;
                that.innerAudioContext.loop = false;
                that.innerAudioContext.src = "http://www.haoshi360.com/fomo3d/bgm/zhifubao.mp3";
                that.innerAudioContext.onPlay(() => {
                   // console.log('开始播放')
                })
                that.innerAudioContext.onError((res) => {
                   // console.log(res.errMsg)
                   // console.log(res.errCode)
                })
                //隐藏
                that.setData({
                    isalreadyflag: true,
                    shuogeflag: false
                })
                setTimeout(function () {
                    that.setData({
                        shuogeflag: true
                    })
                    that.getPetInfo(that.data.playerId);
                }, 1000);
            } else {
                wx.showToast({
                    title: ret.data.msg,
                    icon: 'error',
                    duration: 2000
                });
            }
        }, function () {

        })
    },
    //获取宠物信息
    getPetInfo: function (playerId) {
        var that = this;
        that.getInfo(playerId);
        app.game_http_request("fomo3d/getPet.do", {
            parkUserId: playerId
        },
            function (ret) {
                if (ret) {
                    if (ret.data.code == 0) {
                        var data = ret.data.data[0];
                        var eattime = "00:00:00";
                        if (data.saying) {
                            setTimeout(function () {
                                that.setData({
                                    sayflag: false
                                })
                            }, 4000);
                        }
                        if (data.coin > 0) {
                            that.setData({
                                isalreadyflag: false
                            })
                            setTimeout(function () {
                                that.setData({
                                    isalreadyflag: true
                                })
                            }, 10000);
                        }
                        console.log(JSON.stringify(data));

                        that.setData({
                            petInfo: data,
                            count: ret.data.count
                        })
                        eatTimer = setInterval(function () {
                            var resData = data.eatTime.replace(/-/g, '/'); //外国人只识别： 2017/08/24 15:28:30,需要转换
                            var timestamp = Date.parse(resData) - (that.data.lj_bz * 1000);

                            timestamp = timestamp / 1000;
                            if (timestamp <= 0) {
                                clearInterval(eatTimer);
                                that.setData({
                                    eattimeflag: true
                                })
                            } else {
                                eattime = that.changeTime(timestamp);
                                that.setData({
                                    eattimeflag: false,
                                    eattime: eattime
                                })
                            }

                            that.data.lj_bz++;
                        }, 1000);
                    } else {
                        //console.log("没有数据")
                    }
                } else {

                }
            }, function () {

            })
    },
    /**
     * 用户转玩家
     */
    getPlayerInfo: function (userId) {
        //获取用户信息
        var that = this;
        return new Promise(function (resolve, reject) {
            app.https_request('user/userInfo.do', {
                loginPlat: app.currPlat,
                userId: userId
            }, function (ret) {
                if (ret.data.code == 0) {
                    var userInfo = ret.data.objects[0];
                    var introducer = app.globalData.introducer ? app.globalData.introducer : 0;
                    app.game_http_request("fomo3d/getParkUserByCommUserId.do", {
                        commUserId: userId,
                        name: userInfo.nickName,
                        phone: userInfo.phone,
                        headUrl: userInfo.headImage,
                        commUserParentId: introducer
                    },
                        function (ret) {
                            if (ret.data.code == 0) {
                                var data = ret.data.objects[0];
                                that.setData({
                                    playerId: data.id  //玩家id
                                });
                                that.getInfo(data.id);
                                resolve(data.id);
                            } else {

                            }
                        }, function () {

                        })

                } else {

                }
            }, function (err) {

            })
        })

    },

    /**
   * 监控弹框
   */
    checkModal: function (playerId) {
        var that = this;
        app.game_http_request("fomo3d/getUserPopUp.do", {
            parkUserId: playerId
        },
            function (ret) {
                if (ret.data.code == 0) {
                    // that.setData({
                    //     modalMsg: ret.data.msg,
                    //     flag: false,
                    //     advflag: true
                    // })
                } else {
                    // that.setData({
                    //     modalMsg: ret.data.msg,
                    //     flag: true,
                    //     advflag: false
                    // })
                }
            }, function () {

            })
    },
    /**
     * 喂食
     */
    givefood: function () {
        var that = this;
        app.game_http_request("fomo3d/addFoodToPet.do", {
            parkUserId: that.data.playerId,
            petId: that.data.petInfo.id
        },
            function (ret) {
                if (ret.data.code == 0) {
                    clearInterval(eatTimer);
                    that.setData({
                        doustatus: 'man'
                    })
                    that.getPetInfo(that.data.playerId);
                    that.getInfo(that.data.playerId);
                } else {
                    that.setData({
                        doustatus: 'kong',
                        showmessageflag: false,
                        showMessage: ret.data.msg,

                    })
                    setTimeout(function () {
                        that.setData({
                            showmessageflag: true,
                        })
                    }, 3000);
                }

            }, function () {

            })

    },

    /**
      * 获取玩家信息
      */
    getInfo: function (playerId) {
        var that = this;
        app.game_http_request("fomo3d/getParkUserById.do", {
            id: playerId,
        },
            function (ret) {
                if (ret.data.code == 0) {
                    that.setData({
                        playerInfo: ret.data.objects[0]
                    })
                    that.checkModal(playerId);//获取食物
                } else {

                }
            }, function () {

            })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        that.Promise = that.getPlayerInfo(app.globalData.userId);
        that.Promise.then(function (playerId) {
            that.getPetInfo(playerId);
        })
        //一分钟轮询一次
        wadouTimer = setInterval(function () {
            clearInterval(eatTimer);
            that.getPetInfo(that.data.playerId);
        }, 60000);
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
        clearInterval(eatTimer);
        clearInterval(wadouTimer);
        //douvoice.destroy();//销毁声音
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
    // onShareAppMessage: function () {
    //     var that = this;
    //     return {
    //         title: '邀请你一起玩转庄园',
    //         path: '/pages/index/index?introducer=' + app.globalData.userId,
    //         success: function (res) {
    //             // 转发成功
    //         },
    //         fail: function (res) {
    //             // 转发失败
    //         }
    //     }
    // },
    /**
     * 为开始时间和结束时间的差值
     */
    changeTime: function (time) {
        var hour = parseInt(time / 3600);
        var minute = parseInt(time % 3600 / 60);
        var second = parseInt(time % 3600 % 60);
        if (hour < 10) {
            hour = "0" + hour;
        }
        if (minute < 10) {
            minute = "0" + minute;
        }
        if (second < 10) {
            second = "0" + second;
        }

        var timeStr = hour + ":" + minute + ":" + second;
        return timeStr;
    }
})