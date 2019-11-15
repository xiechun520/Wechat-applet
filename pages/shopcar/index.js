// pages/shopcar/index.js
const app = getApp();
var loginPlat = app.currPlat,
    userId;
Page({
    /**
     * 页面的初始数据
     */
    data: {
        bianjiTxt: '管理',
        cartList: [],
        display: 'none',
        editStatus: 0,
        selectAllStatus: false, // 全选状态，默认全选
        selectedNum: 0,
        totalPrice: 0, // 总价，初始为0
        pageNo:1,
        pageSize:10,
        pagelist:[],
        xjlist:[],
        hasMoreData:true,
        isLoad:true,
        imgCommonUrl:app.imgCommonUrl,
    },

    /**
     * 生命周期函数  --监听页面加载
     */
    onLoad: function(options) {
        userId = wx.getStorageSync('weiaijia-userId') || app.globalData.userId;
        // if (userId) {
        //     app.addUserAction(userId, 0, 19, 0, 0);
        // }
    },
    /**
     * 获取购物车列表
     */
    getCartsList: function() {
        var that = this;
        app.https_request("shoppingCar/myShoppingCar.do", {
            pageNo: that.data.pageNo,
            pageSize: that.data.pageSize,
            userId: app.globalData.userId,
        }, (res) => {
            console.log("nsocanoakiscn",res)
            var datas = that.data.cartList;
            if (res.data.code === "0") {
                if (that.data.pageNo === 1) {
                    datas = [];
                }
              var arr = [];
              var arr1 = [];//下架數組
              res.data.objects.forEach(function (item, index) {
                 //这里的item就是从数组里拿出来的每一个每一组
                if (item.carGoods.isSelled == 0 || item.carGoods.goodsStatus == 2) {
                  arr1 = arr1.concat(item);
                }else{
                  arr = arr.concat(item);
                }
              })
              
              var list = arr.reverse();
              var xjlist = arr1.reverse();
              console.log(arr1);
              console.log(list);
              this.setData({
                xjlist: xjlist
              });
              this.setData({
                selectAllStatus: false,
              });
                console.log(list)
                list.map(item => {
                    // item.selected = 1;
                    item.carGoods.goodsImage = extract_first_url(item.carGoods.goodsImage);
                    return item;
                });
                that.getTotalPrice(list);
                if(list.length <  that.data.pageSize){
                    var ret = {
                        isLoad: false,
                        cartList: datas.concat(list),
                        hasMoreData:false,
                    }
                    this.setData(ret);
                }else{
                    var ret = {
                        isLoad: false,
                        cartList: datas.concat(list),
                        hasMoreData:true,
                    }
                    this.setData(ret);
                }
            } else {
                if(that.data.pageNo == 1){
                    that.setData({
                        isLoad: false
                    })
                }
                var ret = {
                    cartList:[]
                }
                this.setData(ret);
            }
            wx.hideNavigationBarLoading();
            wx.stopPullDownRefresh();
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
     * 去商品详情
     */
    goDetail: function(e) {
        var goodsId = e.currentTarget.dataset.goodid;
      wx.navigateTo({ url: '/pages/mall/detail/detail?goodsId=' + goodsId });
    },
    /**
     * 去分类
     */
    goShop: function() {
      wx.reLaunch({
            url: '/pages/mall/mall'
        });
    },
    /**
     * 显示删除
     */
    shouDel: function() {
        if (this.data.bianjiTxt == "管理") {
            this.setData({
                display: 'block',
                bianjiTxt: '完成',
                editStatus: 1
            })
          this.getCartsList();
          this.setData({
            selectAllStatus: false,
          });
        } else {
            this.setData({
                display: 'none',
                bianjiTxt: '管理',
                editStatus: 0
            })
          this.getCartsList();
          this.setData({
            selectAllStatus: false,
          });
        }
    },
    /**
     * 选择
     */
    choose: function(e) {
        var selected = e.currentTarget.dataset.selected;
        var index = e.currentTarget.dataset.index;
        if (this.data.bianjiTxt == '管理'){
          if (this.data.cartList[index].carGoods.isSelled == 0) {
            wx.showToast({
              title: "商品已下架",
              image: '/images/ai.png',
              duration: 2000
            })
            return
          }
        }
        this.data.cartList[index].selected = selected ? 0 : 1;
        var num = 0;
        
        this.data.cartList.forEach(function (item, index) {
          console.log(item); //这里的item就是从数组里拿出来的每一个每一组
          if (item.selected === 1) {
            num++
          } else {
            num--
          }
        })
      if (num == this.data.cartList.length){
          this.setData({
            selectAllStatus: true,
          });
        }else{
        this.setData({
          selectAllStatus: false,
        });
        }
        this.setData({
            cartList: this.data.cartList
        });
        this.getTotalPrice(this.data.cartList);
    },





    /**
     * 全选
     */
    selectAll: function(e) {
      var that = this;
        var selectAllStatus = !this.data.selectAllStatus; // 是否全选状态
          // if (selectAllStatus) {
          //   for (var i = 0; i < that.data.cartList.length; i++) {
          //     console.log(that.data.cartList.length)
              
                
          //     // that.data.pagelist = that.data.pagelist.concat(this.data.cartList[i]);
          //     var list = this.data.cartList.map(item => {
          //           item.selected = selectAllStatus;
          //           return item;
          //       })
              
          //   }
          // } else {
          //   that.getCartsList();
          // }
      that.data.cartList.forEach((items, index) => {
        if (items.carGoods.isSelled !== 0) {
          var selectAllStatus = !this.data.selectAllStatus;
          console.log(selectAllStatus)
          that.data.cartList[index].selected = selectAllStatus;
          }
        })
      var list = that.data.cartList.map(item => {
            // item.selected = selectAllStatus;
            return item;
        })
      // console.log(list)
        this.setData({
            selectAllStatus: selectAllStatus,
            cartList: list
        });
      // console.log(that.data.selectAllStatus)
        this.getTotalPrice(list); // 重新获取总价
    },




  /**
     * 全选删除
     */
  deltAll: function (e) {
    var selectAllStatus = !this.data.selectAllStatus; // 是否全选状态
    var list = this.data.cartList.map(item => {
        item.selected = selectAllStatus;
        return item;
    })
    this.setData({
      selectAllStatus: selectAllStatus,
      cartList: list
    });
    // console.log(that.data.selectAllStatus)
    // this.getTotalPrice(list); // 重新获取总价
  },
    /**
     * 提交订单
     */
    goSubmitOrderPage: function(e) {
        var number = e.currentTarget.dataset.selectednum
        if (number <= 0) {
            wx.showToast({
                title: '没有选中商品',
                image: '/images/ai.png',
                duration: 2000
            });
            return;
        }
        var currentPages = getCurrentPages();
        var array = [];
        for (var i = 0; i < this.data.cartList.length; i++) {
            var obj = this.data.cartList[i];
            if (obj.selected == 1) {
                array.push(obj);
            }
        }
        if (array.length == 0) {
            wx.showToast({
                title: '没有选中商品',
                image: '/images/ai.png',
                duration: 2000
            });
            return;
        }
        wx.setStorageSync('submit_order_data', JSON.stringify(array));
      wx.navigateTo({
            url: '/pages/mall/counter/counter'
        });
    },
    /**
     * 删除
     */
    deleteGoods: function(e) {
        var index = e.currentTarget.dataset.index,
        carId = this.data.cartList[index].carId;
        app.https_request("shoppingCar/removeGoods.do", {
            'carId': carId
        }, (res) => {
            this.getCartsList();
        });
    },
    /**
     * 全删
     */
    deleteGoodses: function() {
        var _this = this;
        var array = [];
        for (var i = 0; i < this.data.cartList.length; i++) {
            var obj = this.data.cartList[i];
            if (obj.selected == 1) {
                array.push(obj.carId);
            }
        }
        if (array.length === 0) {
            wx.showToast({
                title: '没有选中商品',
                image: '/images/ai.png',
                duration: 2000
            });
            return;
        }
        var ids = array.join(",");
      console.log(ids)
        app.https_request("shoppingCar/removeAllGoods.do", {
            ids: ids,
        }, function(res) {
            console.log(res)
            if (res.data.code == 0) {
                _this.getCartsList();
            }
        })
    },
    /**
     * 减一
     */
    total_sub: function(e) {
        var that = this;
        var index = e.target.dataset.index;
        var cartList = that.data.cartList;
        if (cartList[index] === undefined) {
            wx.showToast({
                title: "操作过快",
                image: '/images/ai.png',
                duration: 2000
            });
            return;
        }
        if (cartList[index]['number'] > 1) {
            cartList[index]['number']--;
            that.setData({
              display: 'none',
              bianjiTxt: '管理',
              cartList: cartList
            });
        }else{
          wx.showToast({
            title: "商品不能小于1",
            image: '/images/ai.png',
            duration: 2000
          })
          return
        }
        var carObj = cartList[index];
      app.https_request("shoppingCar/updateShopCarNumber.do", {
        'carId': carObj.carId,
        'number': carObj.number
      }, function (res) {
        that.getTotalPrice(cartList);
      });
    },
    /**
     * 加一
     */
    total_add: function(e) {
        var that = this;
        var index = e.target.dataset.index;
      var cartList = that.data.cartList;
        if (cartList[index] === undefined) {
            wx.showToast({
                title: "操作过快",
                image: '/images/ai.png',
                duration: 2000
            });
            return;
        }
        wx.hideNavigationBarLoading();
        cartList[index]['number']++;
        that.setData({
            display: 'none',
            bianjiTxt: '管理',
            cartList: cartList
        });
        var carObj = cartList[index];
        // this.updateShopCarNumber(carObj.carId, carObj.number);
        app.https_request("shoppingCar/updateShopCarNumber.do", {
          'carId': carObj.carId,
          'number': carObj.number
        }, function (res) {
          if (res.data.code != 0) {
            cartList[index]['number']--;
            that.setData({
              display: 'none',
              bianjiTxt: '管理',
              cartList: cartList
            });
            that.getTotalPrice(cartList);
            wx.showToast({
              title: res.data.msg,
              image: '/images/ai.png',
              duration: 2000
            })
          }
          that.getTotalPrice(cartList);
        });
      
    },
    //计算总价格
    getTotalPrice: function(cardList) {
        let totalPrice = 0;
        var nums = 0; //选中总数量
        let newcardList = cardList ? cardList : this.data.cardList;
        newcardList.map(item => {
          console.log("jcoiasjciacac", item)
          console.log("jcoiasjcia", item.goodsSpec.price)
          // var price;
          // if (item.goodsSpec !== null){
          //    price = item.goodsSpec.price;
          // }else{
          //   price = item.carGoods.sellPrice;
          // }
          var price = item.goodsSpec != null ? item.goodsSpec.price : item.carGoods.sellPrice;

            if (item.selected) { // 判断选中才会计算价格
                totalPrice += item.number * price;
                nums += item.number; //选中总数量
            }
            return item;
        })
        this.setData({ // 最后赋值到data中渲染到页面
            cardList: newcardList,
            totalPrice: totalPrice.toFixed(2),
            selectedNum: nums
        });
    },
    /**
     * 修改数量
     */
    updateShopCarNumber: function(carId, number) {
        var that = this;
        app.https_request("shoppingCar/updateShopCarNumber.do", {
            'carId': carId,
            'number': number
        }, function(res) {
            if (res.data.code != 0) {
              wx.showToast({
                title: res.data.msg,
                icon: 'none',
                duration: 2000
              })
            }
            that.getCartsList();
        });
    },

    //刪除失效商品
    delxj(){
      var _this = this;
      var array = [];
      for (var i = 0; i < this.data.xjlist.length; i++) {
        var obj = this.data.xjlist[i];
          array.push(obj.carId);
      }
      var ids = array.join(",");
      console.log(this.data.xjlist)
      wx.showModal({
        title: '提示',
        content: '确认删除吗？',
        success: function (res) {
          if (res.confirm) {
            app.https_request("shoppingCar/removeAllGoods.do", {
              ids: ids,
            }, function (res) {
              console.log(res)
              if (res.data.code == 0) {
                _this.getCartsList();
              }
            })
          } else if (res.cancel) {
            
          }
        }
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
       this.getCartsList();
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
        wx.showNavigationBarLoading(); //在标题栏中显示加载
        that.data.pageNo = 1;
        that.getCartsList();
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        var that = this;
        if (that.data.hasMoreData) {
            that.data.pageNo++
            that.getCartsList();
        } else {
            wx.showToast({
                title: '没有更多数据',
                icon: 'none',
                duration: 2000
            });
        }
    },

})

function extract_first_url(image_url) { //以,分隔的图片地址，取第一个
    if (image_url == null) {
        return "";
    }
    var index = image_url.indexOf(",");
    if (index > -1) {
        return image_url.substring(0, index);
    } else {
        return image_url;
    }
}