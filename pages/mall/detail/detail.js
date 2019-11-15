// pages/mall/detail/detail.js
const app = getApp();
var pageNo = 1,
  pageSize = 8,
  userId,
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
    specChosen: {}, // 被选中的规格对应的元素
    specList: [], // 商品规格，每个元素代表一个规格
    specTypeList: [], // 规格种类，每个数组元素的specSet用于记录该规格的子类
    nodes: '', // 商品详情富文本
    showAction: true,
    goodsId: '',//商品id
    imgCommonUrl: app.imgCommonUrl,
  },
  //分享
  goShare: function () {
    var that = this;
    that.setData({
      showAction: false
    })
  },
  //关闭弹窗
  closeModal: function () {
    var that = this;
    that.setData({
      showAction: true
    })
  },
  gotoHB: function () {
    var that = this;
    that.setData({
      showAction: true
    })
    wx.navigateTo({
      url: '/pages/mall/poster/poster?goodId=' + that.data.goodsId + '&sellPrice=' + that.data.goodsInfo.sellPrice + '&goodsName=' + that.data.goodsInfo.goodsName + '&images=' + that.data.goodsImgs[0]
    })
  },

  /**
  * 插入用户-商品二维码信息
  */
  addCodeInfo: function (goodId) {
    var that = this;
    app.https_request('goods/newMakeGoodCode.do', {
      appId: app.currPlat,
      goodId: goodId,
      userId: app.globalData.userId,
    }, function (res) {

    }, function (res) { })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.reset();
    userId = wx.getStorageSync('weiaijia-userId') || app.globalData.userId;
    var goodsId = options.goodsId;
    this.setData({
      goodsId: options.goodsId
    })
    console.log('ddd', goodsId)
    var scene = decodeURIComponent(options.scene);
    if (scene.indexOf("g") != -1) { //扫码进来
      var arr = scene.split("*");
      var goodArr = arr[1].split("/");
      goodsId = goodArr[1];//商品id
    }
    this.setData({
      goodsId: goodsId
    })
    this.addCodeInfo(goodsId);//生成商品二维码
    // app.addUserAction(userId, 0, 2, goodsId, 0); //访问商品详情行为,salerId先默认为0
    this.getGoodsDetails();
    this.getOrderList();
  },
  /**
      * 插入用户-商品二维码信息
      */
  addCodeInfo: function (goodId) {
    var that = this;
    app.https_request('goods/newMakeGoodCode.do', {
      appId: app.currPlat,
      goodId: goodId,
      userId: app.globalData.userId,
    }, function (res) {

    }, function (res) { })
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
    if (this.data.goodsInfo.isDtbt == 1) {
      if (this.data.goodsInfo.seckillStartTime && this.data.goodsInfo.msTime) {
        this.calculateSeckillTime(this.data.goodsInfo.createTime, this.data.goodsInfo.msTime);
      }
    }
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
    clearInterval(interval); //清除定时器
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
    var that = this;
    return {
      title: that.data.goodsInfo.goodsName,
      path: '/pages/mall/detail/detail?introducer=' + userId + "&goodsId=" + that.data.goodsId,
      success: function (res) {
        // app.addUserAction(userId, 1, 2, that.data.goodsId, 0); //访问商品详情行为,salerId先默认为0
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  //预览轮播图片
  lookPicture(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    wx.previewImage({
      urls: that.data.goodsImgs,
      current: that.data.goodsImgs[index]
    })
  },

  buyNow() {
    let check = this.checkGoodsStock() && this.checkChooseSpec();
    if (check === false) {
      return;
    }
    if (this.data.goodsInfo.isMoreSpec === 1) {
      var goodsList = [{
        "goodsId": this.data.goodsId,
        "carGoods": this.data.goodsInfo,
        "number": this.data.counts,
        "goodsprice": this.data.goodsPriceSpec.toFixed(2),
        "specId": this.data.specChosen.id,
        "goumai": true,
        "specTypeString": this.data.specChosen.type1 + "/" + this.data.specChosen.type2
      }];
    } else {
      var goodsList = [{
        "goodsId": this.data.goodsId,
        "carGoods": this.data.goodsInfo,
        "goumai": true,
        "goodsprice": this.data.goodsPriceSpec.toFixed(2),
        "number": this.data.counts,
      }];
    }
    this.setData({
      showGoodsSpec: 0
    })
    this.data.goodsPriceSpec
    console.log("价格农家菜那吃你",goodsList)
    wx.setStorageSync('submit_order_data', JSON.stringify(goodsList));
    wx.navigateTo({
      url: '/pages/mall/counter/counter'
    });
  },

  joinCart() {
    var _this = this,
      check = this.checkGoodsStock() && this.checkChooseSpec(),
      param;
    if (!check) {
      return;
    }
    if (this.data.goodsInfo.isMoreSpec === 1) {
      param = {
        "goodsId": this.data.goodsId,
        'userId': userId,
        "number": this.data.counts,
        "specId": this.data.specChosen.id,
        "specTypeString": this.data.specChosen.type1 + "/" + this.data.specChosen.type2
      }
    } else {
      param = {
        "goodsId": this.data.goodsId,
        'userId': userId,
        "number": this.data.counts,
      }
    }
    app.https_request("shoppingCar/addGoodsToCar.do", param, (res) => {
      if (res.data.code == 0) {
        //app.addUserAction(userId, 13, 2, this.data.goodsId, 0);//加入购物车
        wx.showToast({
          title: res.data.msg,
          icon: 'success',
        })
      }
      this.setData({
        showGoodsSpec: 0
      })
    })
  },

  showSpecBox(event) {
    console.log(this.data.goodsInfo)
    if (this.data.goodsInfo.goodsStatus == 2){
      wx.showToast({
        title: '该商品已删除',
        image: '/images/ai.png',
        duration: 2000
      });
      return
    } else if (this.data.goodsInfo.isSelled == 0){
      wx.showToast({
        title: '该商品已下架',
        image: '/images/ai.png',
        duration: 2000
      });
      return
    }else{

      this.calcGoodsPriceSpec();
      var goodsStock = Number(event.currentTarget.dataset.stock),
        specBoxType = Number(event.currentTarget.dataset.type);

      if (this.data.goodsInfo.isDtbt == 1 && !this.checkSeckillStatus()) {
        return;
      }
      this.setData({
        goodsStock: goodsStock,
        specBoxType: specBoxType,
        showGoodsSpec: 1,
      })
    }
    
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
    
    var specIndex = e.target.dataset.specindex;
    var itemIndex = e.target.dataset.itemindex;
    console.log("specIndex", specIndex);
    console.log("itemIndex", itemIndex);
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
          console.log(item)
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
      console.log("下标",index)
      if (index >=0) {
        // 选中的规格的详情,只有在选中完之后才有值
        // eg: {appId:709,goodsId:3561,id:52,price:6649,type1:ref, type2: size, type3: null, }
        var specChosen = specList[index];
        console.log(specChosen)
        this.setData({
          chosenSpecList: chosenSpecList,
          specChosen: specChosen,
        });
        // console.log(this.data.specChosen)
        this.calcGoodsPriceSpec();
        return;
      }
      
    }
    this.setData({
      chosenSpecList: chosenSpecList,
    });
    console.log("this.setData>>", this.data.chosenSpecList);
    
  },
  /**
   * 以下两个函数用作更换商品数量
   */

  minusCount() {
    if (this.data.counts <= 1) {
      return;
    }
    this.setData({
      counts: --this.data.counts,
    });
    this.calcGoodsPriceSpec();
  },
  plusCount() {
    var unuber = this.data.goodsInfo.goodsStock;
    if (this.data.counts < unuber){
      this.setData({
        counts: ++this.data.counts,
      });
    }else{
      wx.showToast({
        title: '库存不足',
        image: '/images/ai.png',
        duration: 2000
      });
    }

    
   
    this.calcGoodsPriceSpec();
  },
  calcGoodsPriceSpec: function () {
    var price;
    if (this.data.goodsInfo.isMoreSpec == 1) {
      let arr = Object.keys(this.data.specChosen);
      if (arr.length>0) {
        console.log("go to here?");
        price = this.data.specChosen.price * this.data.counts
      } else {
        price = this.data.lowestPrice * this.data.counts;
      }
    } else {
      price = this.data.goodsInfo.sellPrice * this.data.counts
    }
    this.setData({
      goodsPriceSpec: price,
    })
    console.log("nscaoinsaiohcvnaiso", this.data.goodsPriceSpec);
  },
  goCart() {
    wx.reLaunch({
      url: '/pages/shopcar/index'
    })
  },

  collectGoods(event) {
    var _this = this;
    var switchvar = event.target.dataset.switch;
    this.setData({
      isLike: !switchvar,
    })
    app.https_request("goods/goodsCollection.do", {
      'goodsId': _this.data.goodsInfo.goodsId,
      'userId': userId,
      'loginPlat': app.currPlat,
    }, (res) => {
      if (res.data.code == 0) {
        //app.addUserAction(userId, 12, 2, _this.data.goodsInfo.goodsId, 0);//收藏产品
        wx.showToast({
          title: '收藏成功',
          icon: 'success',
          duration: 2000
        });
        this.setData({
          isLike: 0,
        })
      } else {
        wx.showToast({
          title: '已取消收藏商品',
          icon: 'error',
          duration: 2000
        })
        this.setData({
          isLike: 1,
        })
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

  getGoodsDetails() {
    app.https_request("goods/goodsDetails.do", {
      goodsid: this.data.goodsId,
      userId: userId
    }, (res) => {
      if (res.data.code == 0) {
        var goodsInfo = res.data.object;
        // 多规格处理
        console.log("goodsInfo>>", goodsInfo);
        if (goodsInfo.isMoreSpec == 1) {
          this.recombineSpecList(goodsInfo.specList, goodsInfo.spectypeList)
        }

        // 秒杀处理
        if (goodsInfo.isDtbt) {
          this.calculateSeckillTime(goodsInfo.seckillStartTime, goodsInfo.msTime);
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
        let regex1 = new RegExp('<p', 'gi');
        nodes = nodes.replace(regex, `<img style="width: 100%;vertical-align:top;outline-width:0px;"`);
        nodes = nodes.replace(regex1, '<p style="margin: 0;"');
        dataSetting.nodes = nodes;

        this.setData(dataSetting);
      } else {
        wx.showToast({ title: res.data.msg });
      }
    })
  },

  /**
   * [getOrderList 获取订单列表，用于显示购买记录]
   */
  getOrderList() {
    let $this = this;
    app.https_request("goodsOrder/orderBygid.do", {
      goodsId: $this.data.goodsId,
      payStatus: 1,
      pageNo: 1,
      pageSize: 10,
    }, (res) => {
      if (res.data.count > 0) {
        var array = res.data.objects
        for (var i = 0; i < array.length; i++) {
          var obj = array[i];
          obj.buyNumber = 1;
          try {
            if (obj.objects != null) {
              var gs = JSON.parse(obj.objects);
              for (var j = 0; j < gs.length; j++) {
                var obj2 = gs[j];
                if (obj2.goodsId == $this.data.goodsId && obj2.buyNumber != null) {
                  obj.buyNumber = obj2.buyNumber;
                }
              }
            }
          } catch (e) { }
        }
        this.setData({
          orderList: array,
        })
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
    // for (var i = 0; i < specTypeList.length; i++) {
    //     var specTypeKey = "type" + specTypeList[i].type;
    //     var specSet = new Set();
    //     for (var j = 0; j < specList.length; j++) {
    //         specSet.add(specList[j][specTypeKey]);
    //         if (i == 0 && price > specList[j].price) {
    //             // 在商品没有选择完规格的时候，价格要显示最低价
    //             lowestPrice = specList[j].price;
    //         }
    //     }
    //     specTypeList[i].specSet = Array.from(specSet);
    // }
    this.setData({
      lowestPrice: lowestPrice,
      specList: specList,
      specTypeList: specTypeList,
    });
  },

  /**
   * 计算秒杀剩余时间
   * @param  {long} seckillStartTime      [开始秒杀时间]
   * @param  {int} continuingTime [持续时间，单位:hour]
   */
  calculateSeckillTime(seckillStartTime, continuingTime) {
    //seckillStartTime = seckillStartTime || Date.parse(new Date()) - 1000;
    console.log(continuingTime);
    var _this = this,
      startTimestamp = seckillStartTime * 1000,
      nowTimestamp = Date.parse(new Date()),
      totalSecond;
    console.log(nowTimestamp)
    console.log("startTimestamp + continuingTime * 3600", (startTimestamp + continuingTime * 3600));
    if (nowTimestamp < startTimestamp) {
      this.setData({
        seckillStatus: -1, //未开始
      })
      totalSecond = (startTimestamp - nowTimestamp) / 1000;

    } else if (nowTimestamp > startTimestamp + continuingTime * 3600 * 1000) {
      this.setData({
        seckillStatus: 101, //已结束
      })
      return;
    } else {
      this.setData({
        seckillStatus: 1, //已开始
      })
      totalSecond = (startTimestamp - nowTimestamp) / 1000 + continuingTime * 3600;
    }

    interval = setInterval(function () {
      // 秒数
      var second = totalSecond;

      // 小时位
      var hour = Math.floor(second / 3600);
      var hourStr = hour.toString();
      if (hourStr.length == 1) {
        hourStr = '0' + hourStr;
      }

      // 分钟位
      var minute = Math.floor((second - hour * 3600) / 60);
      var minuteStr = minute.toString();
      if (minuteStr.length == 1) {
        minuteStr = '0' + minuteStr;
      }

      // 秒位
      var sec = second - hour * 3600 - minute * 60;
      var secondStr = sec.toString();
      if (secondStr.length == 1) {
        secondStr = '0' + secondStr;
      }

      var countDown = hourStr + ":" + minuteStr + ":" + secondStr;
      _this.setData({
        countDown: countDown,
      })

      totalSecond--;
      if (totalSecond < 0) {
        clearInterval(interval);
        _this.calculateSeckillTime(seckillStartTime, continuingTime);
      }
    }.bind(this), 1000);
  },

  checkSeckillStatus() {
    if (this.data.seckillStatus == -1) {
      wx.showToast({
        title: '秒杀未开始',
        icon: 'none'
      })
      return false;
    } else if (this.data.seckillStatus == 101) {
      wx.showToast({
        title: '秒杀已结束',
        icon: 'none'
      })
      return false;
    } else if (this.data.seckillStatus != 1) {
      wx.showToast({
        title: '未知错误',
        icon: 'none'
      })
      return false;
    };
    return true;
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