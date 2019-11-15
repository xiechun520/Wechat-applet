// pages/mall/award/award.js
const app = getApp();
var pageNo = 1,
    pageSize = 8,
    userId,
    goodsId,
    interval;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        chosenSpecList: [], // 被选中的规格，用于记录那些规格的被选中
        countDown: '--:--:--', //倒计时
        counts: 1, // 要购买商品的数量
        goodsImgs: [],
        goodsInfo: {},
        goodsPriceSpec: 0,
        goodsStock: 0,
        isLike: '',
        lowestPrice: 0, // 在商品没有选择完规格的时候，价格要显示最低价
        orderList: [], //订单，用于展示购买记录
        seckillStatus: '', //秒杀的状态：-1未开始，101已结束，1进行中
        showGoodsSpec: 0, //多规格
        specBoxType: '', // 弹窗盒子类型，用于控制底部文字（加入购物车/确定购买）
        specChosen: [], // 被选中的规格对应的元素
        specList: [], // 商品规格，每个元素代表一个规格
        specTypeList: [], // 规格种类，每个数组元素的specSet用于记录该规格的子类
        nodes: '', // 商品详情富文本
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.reset();
        userId = app.globalData.userId;
        goodsId = options.goodsId;
        app.addUserAction(userId, 0, 2, goodsId, 0); //访问商品详情行为,salerId先默认为0
        this.getGoodsDetails();
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


    buyNow() {
        let check = this.checkGoodsStock() && this.checkChooseSpec();
        if (check === false) {
            return;
        }
        if (this.data.goodsInfo.isMoreSpec === 1) {
            var goodsList = [{
                "goodsId": goodsId,
                "carGoods": this.data.goodsInfo,
                "number": this.data.counts,
                "specId": this.data.specChosen.id,
                "specTypeString": this.data.specChosen.type1 + "/" + this.data.specChosen.type2
            }];
        } else {
            var goodsList = [{
                "goodsId": goodsId,
                "carGoods": this.data.goodsInfo,
                "number": this.data.counts,
            }];
        }
        this.setData({
            showGoodsSpec: 0
        })

        wx.setStorageSync('submit_order_data', JSON.stringify(goodsList));
      wx.navigateTo({
            url: '/pages/mall/counter/counter?isJF=1'
        });
    },

    showSpecBox(event) {
        this.calcGoodsPriceSpec();
        var goodsStock = Number(event.currentTarget.dataset.stock),
            specBoxType = Number(event.currentTarget.dataset.type);

        // if (this.data.goodsInfo.isDtbt == 1) {
        //     return;
        // }
        this.setData({
            goodsStock: goodsStock,
            specBoxType: specBoxType,
            showGoodsSpec: 1,
        })
    },

    hideBuy() {
        this.setData({
            showGoodsSpec: 0,
        })
    },
    /**
     * [chooseSpec description]
     * @param  {[int]} specIndex [哪种规格]
     * @param  {[int]} itemIndex [该规格的第几项]
     * @return {[type]}           [description]
     *
     * eg：color[red][blue];size:[36][37]
     */
    chooseSpec(e) {
        this.calcGoodsPriceSpec();
        var specIndex = e.target.dataset.specindex;
        var itemIndex = e.target.dataset.itemindex;

        // specList商品规格列表，每个元素代表一个规格
        // eg:[{id:51,appId:709,goodsId:3561,price:6649,type1:"1.5米*2米",type2:"米白色",type3:null,createTime:"2018-12-10 09:53:48"},...]
        var specList = this.data.specList;

        /**
         *  specTypeList:每个规格的子项
         *  [{id: 24,appId: 709,goodsId: 3561,type: 1,name: "尺寸",
         *  specSet: ["1.5米*2米", "1.8米*2米"]}, 
         *  {id: 25,appId: 709,goodsId: 3561,type: 2,name: "颜色",
         *  specSet: ["米白色", "深咖色"]}]
         */
        var specTypeList = this.data.specTypeList;

        // chosenSpecList为选中规格的下标,如果选中[red]/[36],该数组的值为[0,0]
        var chosenSpecList = this.data.chosenSpecList;
        chosenSpecList[specIndex] = itemIndex;

        // index用于标识specTypeList的下标，当能判断所属规格后，index>=0
        var index = -1;

        // 根据所选下标判断属于哪一种规格
        // chosenSpecList和specTypeList的长度相等是能进行判断的必要非充分条件 
        // eg:[undefine,0].length=2,但无法判断
        if (chosenSpecList.length == specTypeList.length) {

            // 第一步，每一次都能判断一项规格是否符合要求
            for (var i = 0; i < specList.length; i++) {

                // index已经找到了，可以退出循环了(单规格)
                if (index >= 0) {
                    break;
                }

                // 第二步，每一次都可以确认一个规格的子项是否符合条件
                for (var j = 0; j < specTypeList.length; j++) {
                    // chosenSpecList所有元素非空+
                    // chosenSpecList和specTypeList的长度相等是能进行判断的充要条件,
                    // 注意：这里不能写成!chosenSpecList[j]
                    if (chosenSpecList[j] === undefined) {
                        break;
                    }

                    // item为一个specList中一个规格的字符串,对比选中的规格的字符串是否相等
                    var item = specList[i]["type" + (j + 1)];
                    if (specTypeList[j].specSet[chosenSpecList[j]] == item) {

                        // 此时已经检测完了,chosenSpecList的每一项都符合要求，i就是要找的下标
                        if (j == specTypeList.length - 1) {
                            index = i;
                            break;
                        }
                        // 第一个子项符合要求，继续轮训判断
                        continue;
                    }
                    // 有子项不符合要求，那么该规格就不符合要求
                    break;
                }
            }

            // 找到下标后才能发送数据
            if (index) {
                // 选中的规格的详情,只有在选中完之后才有值
                // eg: {appId:709,goodsId:3561,id:52,price:6649,type1:ref, type2: size, type3: null, }
                var specChosen = specList[index];
                this.setData({
                    chosenSpecList: chosenSpecList,
                    specChosen: specChosen,
                });
                return;
            }
        }
        this.setData({
            chosenSpecList: chosenSpecList,
        });
    },
    /**
     * 以下两个函数用作更换商品数量
     */
    minusCount() {
        if (this.counts <= 1) {
            return;
        }
        this.setData({
            counts: --this.data.counts,
        });
        this.calcGoodsPriceSpec();
    },
    plusCount() {
        this.setData({
            counts: ++this.data.counts,
        });
        this.calcGoodsPriceSpec();
    },

    calcGoodsPriceSpec: function() {
        var price;
        price = this.data.goodsInfo.scoreCount * this.data.counts
        this.setData({
            goodsPriceSpec: price,
        })
    },



    getGoodsDetails() {
        app.https_request("goods/goodsDetails.do", {
            goodsid: goodsId,
            userId: userId
        }, (res) => {
            if (res.data.code == 0) {
                var goodsInfo = res.data.object;
                // 多规格处理
                if (goodsInfo.isMoreSpec == 1) {
                    this.recombineSpecList(goodsInfo.specList, goodsInfo.spectypeList)
                }              

                // 图片处理
                let imgs = goodsInfo.goodsImage ? goodsInfo.goodsImage.split(',') : [];
                var dataSetting = {};
                dataSetting.goodsInfo = goodsInfo;
                dataSetting.goodsName = goodsInfo.goodsName;
                dataSetting.goodsImgs = imgs;
                dataSetting.isLike = goodsInfo.isCancel;

                var nodes = goodsInfo.goodsDetails;
                let regex = new RegExp('<img', 'gi');
                nodes = nodes.replace(regex, `<img style="width: 100%;"`);
                dataSetting.nodes = nodes;

                this.setData(dataSetting);
            } else {
                wx.showToast({ title: res.data.msg });
            }
        })
    },

    /**
     * [recombineSpecList 重组多规格数组]
     * @param specList 多规格商品:每一种规格的商品为一个数组元素
     * @param specTypeList 多规格类型：每一种规格为一个数组元素
     * 该函数的主要目的是为specTypeList新增specSet属性
     */
    recombineSpecList(specList, specTypeList) {
        if (!specList || !specTypeList) {
            return;
        }
        var sList = [];
        var price = specList[0].price;
        var lowestPrice = specList[0].price;
        specTypeList.map((item, index) => {
            var specTypeKey = "type" + item.type;
            var specSet = new Set();
            specList.map(_item => {
                specSet.add(_item[specTypeKey]);
                if (index == 0 && price > _item.price) {
                    // 在商品没有选择完规格的时候，价格要显示最低价
                    lowestPrice = _item.price;
                }
                return _item;
            });
            item.specSet = Array.from(specSet);
            return item;
        });
        this.setData({
            lowestPrice: lowestPrice,
            specList: specList,
            specTypeList: specTypeList,
        });
    },

    checkGoodsStock() {
        if (this.data.goodsStock <= 0) {
            wx.showToast({
                title: '已售罄',
            })
            this.setData({
                showGoodsSpec: 0
            })
            return false;
        };
        return true;
    },

    checkChooseSpec() {
        if (this.data.goodsInfo.isMoreSpec === 0) {
            return true;
        }
        if (this.data.specChosen == undefined || this.data.specChosen.id == undefined) {
            wx.showToast({
                title: "请选择规格",
                icon: 'error',
            })
            return false;
        }
        return true;
    },

    reset() {
        var dataSetting = {};
        dataSetting.orderList = [];
        dataSetting.goodsInfo = {};
        dataSetting.goodsName = "";
        dataSetting.goodsImgs = [];
        dataSetting.totalPrice = 0;
        dataSetting.showGoodsSpec = 0;
        dataSetting.counts = 1;
        this.setData(dataSetting);
    },
})