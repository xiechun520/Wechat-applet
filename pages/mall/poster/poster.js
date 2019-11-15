// pages/mall/poster/poster.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        windowWidth: wx.getSystemInfoSync().windowWidth - 56,
        windowHeight: wx.getSystemInfoSync().windowHeight - 50,
    },
    /**
        * 保存到相册
        */
    saveImg: function () {
        var that = this;
        wx.canvasToTempFilePath({
            canvasId: 'shareGoodImage',
            fileType: 'jpg',
            success: function (res) {
                console.log(res.tempFilePath) // 返回图片路径
                wx.showLoading({
                    title: '保存中...',
                    mask: true
                });
                wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success: function (res) {
                        wx.showToast({
                            title: '保存成功',
                            icon: 'success',
                            duration: 2000
                        })
                    },
                    fail: function (res) {
                        wx.hideLoading()
                        console.log(res)
                    }
                })
            }
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // console.log(options);
        var that = this;
        var sellPrice = options.sellPrice;
        var goodsName = options.goodsName;
        var images = options.images;
        var goodId = options.goodId;
        var newimage1 = images.replace(/http/, 'https');
        var newimage = newimage1.replace(/vij365/,'haoshi360');
        console.log("codeUrl0--" + newimage);
        wx.showLoading({
            title: '生成海报中...',
            mask: true
        });
        app.https_request('goods/getShareGoodCode.do', {
            appId: app.currPlat,
            userId: app.globalData.userId,
            goodId: goodId
        }, function (ret) {
            if (ret.data.code == 0) {
                var codeUrl = ret.data.objects[0].goodCodeUrl;
                console.log("codeUrl--" + codeUrl);
                var ctx = wx.createCanvasContext('shareGoodImage');
                let wW = that.data.windowWidth;
                let wH = that.data.windowHeight;
                ctx.setFillStyle('white');
                ctx.fillRect(0, 0, wW, wH);
                wx.getImageInfo({
                    src: newimage,
                    success: function (res) {
                        console.log("codeUrl1--" + res.path);
                        ctx.drawImage(res.path, 0, 0, wW * 1, wH * 0.6);
                        wx.getImageInfo({
                            src: codeUrl,
                            success: function (res1) {
                                console.log("path4--" + res1.path)
                                ctx.drawImage(res1.path, wW - 110, wH - wH * 0.35, 100, 100);
                                ctx.setFontSize(12);
                                ctx.fillStyle = '#999';
                                ctx.fillText("长按识别二维码", wW - 105, wH - wH * 0.35 + 120);
                                ctx.setFontSize(16);
                                ctx.fillStyle = '#ff0000';
                                ctx.fillText("￥" + sellPrice, 10, wH - wH * 0.32);
                                ctx.setFontSize(14);
                                ctx.fillStyle = '#000';
                                that.drawText(ctx, goodsName, 10, wH - wH * 0.26, 10, wW * 0.5);
                                ctx.draw();
                                wx.hideLoading({});
                            },
                            fail: function (res1) {
                                console.log("path1--" + JSON.stringify(res1));
                            }
                        })
                    },
                    fail: function (res) {

                    }
                })
            } else {

            }
        }, function (ret) {

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
    //文本换行 参数：1、canvas对象，2、文本 3、距离左侧的距离 4、距离顶部的距离 5、6、文本的宽度
    drawText: function (ctx, str, leftWidth, initHeight, titleHeight, canvasWidth) {
        var lineWidth = 0;
        var lastSubStrIndex = 0; //每次开始截取的字符串的索引
        for (let i = 0; i < str.length; i++) {
            lineWidth += ctx.measureText(str[i]).width;
            if (lineWidth > canvasWidth) {
                ctx.fillText(str.substring(lastSubStrIndex, i), leftWidth, initHeight); //绘制截取部分
                initHeight += 16; //16为字体的高度
                lineWidth = 0;
                lastSubStrIndex = i;
                titleHeight += 30;
            }
            if (i == str.length - 1) { //绘制剩余部分
                ctx.fillText(str.substring(lastSubStrIndex, i + 1), leftWidth, initHeight);
            }
        }
        // 标题border-bottom 线距顶部距离
        titleHeight = titleHeight + 10;
        return titleHeight
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

    }
})