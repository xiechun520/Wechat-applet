// pages/descovery/detail/detail.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        Lists: {},
        comment: {},
        descoveryId: '',
        userId: '',
        pageNo: 1,
        pageSize: 8,
        switchbtn: 0,
        switchbtn1: 0,
        points: {},
        groupType: '',
        animationData: "",
        show: false,
        currPlat: 1,
        wit: 1,
        title: '',
        imgCommonUrl:app.imgCommonUrl
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var descoveryId = options.descoveryId;
        this.setData({
            descoveryId: descoveryId
        })
        if (app.globalData.userId) {
            app.addUserAction(app.globalData.userId, 0, 3, descoveryId, 0)
        }
        this.getList(descoveryId, app.globalData.userId); //获取详情
        this.getMessage(descoveryId); //获取留言
    },

    ShowModal() {
        var that = this;
        var animation = wx.createAnimation({
            duration: 200,
            timingFunction: "linear",
            delay: 0
        });
        that.animation = animation;
        animation.translateY(600)
            .step();
        that.setData({
            animationData: animation.export(),
            show: true
        });
        setTimeout(function() {
            animation.translateY(0)
                .step()
            that.setData({
                animationData: animation.export()
            })
        }.bind(that), 200)

    },
    /**
     * 隐藏评论信息
     */
    HideModal: function() {
        var that = this;
        var animation = wx.createAnimation({
            duration: 200,
            timingFunction: "linear",
            delay: 0
        });
        that.animation = animation;
        animation.translateY(600)
            .step();
        that.setData({
            animationData: animation.export(),
            show: false
        });
        setTimeout(function() {
            animation.translateY(0)
                .step()
            that.setData({
                animationData: animation.export(),
                show: false
            })
        }.bind(that), 200)
    },
    //获取详情
    getList: function(descoveryId, userId) {
        var that = this;
        app.https_request("descovery/descoveryDetails.do", {
            'descoveryId': descoveryId,
            'userId': userId,
            'pageNo': that.data.pageNo,
            'pageSize': that.data.pageSize,
            'loginPlat': app.currPlat
        }, function(res) {
            var a = res.data.objects;
            var classname = 'style="max-width:100%; width:100%"';
            a[0].descoveryDetails = a[0].descoveryDetails.replace(/<img /g, "<img " + classname + " ");
            that.setData({
                Lists: a[0],
                switchbtn: a[0].isCollected,
                switchbtn1: a[0].isParised,
                points: a[0].pariseCount,
            });
        })
    },
    getMessage: function(descoveryId) {
        var that = this;
        app.https_request("descoery/leaveMsgList.do", {
            'descoveryId': descoveryId,
            'pageNo': 1,
            'pageSize': 100,
            'loginPlat': app.currPlat
        }, function(res) {
            if (res.data.code == 0) {
                var a = res.data.objects;
                that.setData({
                    comment: a
                });
            }
        })
    },
    //收藏
    switchbtn: function(index) {
        var that = this;
        var switchvar = index.target.dataset.switch;
        if (switchvar == 1) {
            switchvar = 0;
        } else {
            switchvar = 1;
        }
        that.setData({
            switchbtn: switchvar,
        });
        var temp = {
            userId: app.globalData.userId,
            descoveryId: that.data.descoveryId,
            loginPlat: app.currPlat
        }
        app.https_request("descoery/collect.do", temp, function(res) {
            if (res.data.code == 0) {
                wx.showToast({
                    title: '收藏成功',
                    icon: 'none',
                    duration: 2000
                });

            } else {
                wx.showToast({
                    title: res.data.msg,
                    icon: 'none',
                    duration: 2000
                })
            }
        });
    },
    //点赞
    switchbtn1: function(index) {
        var that = this;
        var switchvar = index.target.dataset.switch;

        var temp = {
            userId: app.globalData.userId,
            descoveryId: that.data.descoveryId,
            loginPlat: app.currPlat
        }
        app.https_request("descoery/pariseDescovery.do", temp, function(res) {
            if (res.data.code == 0) {
                wx.showToast({
                    title: '点赞成功',
                    icon: 'success',
                    duration: 2000
                });
                var points = that.data.points;
                if (switchvar == 1) {
                    switchvar = 0;
                    points = points - 1;
                } else {
                    switchvar = 1;
                    points = points + 1;
                }
                that.setData({
                    switchbtn1: switchvar,
                    points: points
                });

            } else {
                wx.showToast({
                    title: res.data.msg,
                    icon: 'error',
                    duration: 2000
                })
            }
        });
    },
    clickbtn: function() {
        if (this.data.show) {
            this.HideModal();
        } else {
            this.ShowModal();
        }
    },
    hidebtn: function() {
        this.HideModal();
    },
    formSubmit: function(e) {
        var that = this;
        if (e.detail.value.messageContent == "") {
            that.setData({
                tip: "请输入留言",
                messageContent: "",
            });
            return false;
        } else {
            that.setData({
                tip: "",
                messageContent: e.detail.value.messageContent,
            });
        }
        var temp = {
            userId: app.globalData.userId,
            descoveryId: that.data.descoveryId,
            messageContent: that.data.messageContent
        }
        app.https_request("descoery/leaveMsg.do", temp, function(res) {
            if (res.data.code == 0) {
                wx.showToast({
                    title: '发表成功',
                    icon: 'none',
                    duration: 2000
                });
                that.getMessage(that.data.descoveryId); //刷新我发布的列表页
            } else {
                wx.showToast({
                    title: res.data.msg,
                    icon: 'error',
                    duration: 2000
                })
            }
        });
        this.HideModal();

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

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        var that = this;
        console.log("isLoad: false=="+that.data.descoveryId);
        return {
            title: that.data.Lists.descoveryTitle,
            path: '/pages/descovery/detail/detail?introducer=' + app.globalData.userId + '&descoveryId=' + that.data.descoveryId,
            success: function (res) {
            },
            fail: function (res) {
                // 转发失败
            }
        }
        app.addUserAction(app.globalData.userId, 1, 3, that.data.descoveryId, 0);//分享首页行为
    }
})