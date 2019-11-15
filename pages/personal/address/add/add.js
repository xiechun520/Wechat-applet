// pages/personal/address/add/add.js
const app = getApp()
var edit = 0,userId, addressId;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        tip: '', //用于提示
        shoppingAddress: '', //地址
        deliveryName: '', //收货人
        deliveryPhone: '', //手机
        postCode: '', //邮编
        button: '新增',
        region: '',
        dele: true,
        isDefault: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (option) {
        userId =  app.globalData.userId;
        var $this = this;
        $this.setData({
            button :'新增', //默认为发布按钮
            shoppingAddress: '',
            deliveryName : '',
            deliveryPhone : '',
            postCode : '',
            region : ['北京市', '北京市', '东城区'],
            isDefault : 0,
        });
        edit = option.edit ? option.edit : 0;
        if (option && option.edit) {
            var addressInfo = JSON.parse(option.addressInfo);
            addressId = addressInfo.addressId;
            $this.setData({
                shoppingAddress : addressInfo.shoppingAddress,
                deliveryName : addressInfo.deliveryName,
                deliveryPhone : addressInfo.deliveryPhone,
                postCode : addressInfo.postCode,
                button : '修改',
                dele: false,
                region : [
                    addressInfo.province ? addressInfo.province : "北京市",
                    addressInfo.city ? addressInfo.city : "北京市",
                    addressInfo.area ? addressInfo.area : "东城区",
                ],
                isDefault : addressInfo.isDefault == 1 ? true : false,
            })    
                   }
    },
    showDeleteAddress(e) {
        var _this = this;
        wx.showModal({
            title: '删除地址',
            content: '你确认要删除该地址吗？',
            cancelText: "取消",
            confirmText: "确定",
            confirmColor: "#41A18D",
            success: (res) => {
                if (res.confirm) {
                    _this.deleteAddress();
                }
            }
        });
    },
    bindRegionChange(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            region : e.detail.value
        })
    },
    switchChange(e) {
        console.log('switch发送选择改变，携带值为', e.detail.value)
        var isDefault = 0;
        if (e.detail.value == true){
            isDefault = 1
        }
        this.setData({
            isDefault: isDefault
        })
    },
    button_submit(e) {
        var that = this;
        var data = e.detail.value;
        console.log(e.detail.value);
        if (data.deliveryName == "") {
            this.setData({
                tip : "请输入收货人姓名",
            });
            return false;
        } 
        if (data.deliveryPhone == "") {
            this.setData({
               tip : "请输入联系手机",
            });
            return false;
        } 
        // if (data.postCode == "") {
        //     this.setData( {
        //         tip : "请输入邮编",
        //     });
        //     return false;
        // } 
        if (data.region == "") {
            this.setData({
                tip : "请选择地区",
            });
            return false;
        } 
        if (data.shoppingAddress == "") {
            this.setData({
                tip : "请输入收货地址",
            });
            return false;
        }

        var param = {
            userId: userId,
            shoppingAddress: data.shoppingAddress,
            deliveryName: data.deliveryName,
            deliveryPhone: data.deliveryPhone,
            postCode: data.postCode,
            area: this.data.region[2],
            city: this.data.region[1],
            isDefault: Number(this.data.isDefault),
            province: this.data.region[0],
        };
        var param1 = {
            userId: userId,
            addressId: addressId,
            shoppingAddress: data.shoppingAddress,
            deliveryName: data.deliveryName,
            deliveryPhone: data.deliveryPhone,
            postCode: data.postCode,
            area: this.data.region[2],
            city: this.data.region[1],
            isDefault: Number(this.data.isDefault),
            province: this.data.region[0],
        };
        if (edit) {
            app.https_request("shoppingAddress/upShoppingAddr.do", param1, function (res) {
                console.log(res)
                if (res.data.code == 0) {
                    wx.showToast({
                        title: '修改成功',
                        icon: 'success',
                        duration: 2000
                    });
                    //返回并刷新上一页
                    var pages = getCurrentPages();
                    var prevPage = pages[pages.length - 2]; //上一个页面
                    prevPage.getAddressList(); //调用上一页的某个方法
                    setTimeout(function () {
                        wx.navigateBack({
                            delta: 1
                        })
                    }, 1000)
                } else {
                    wx.showToast({
                        title: res.data.msg,
                        icon: 'error',
                        duration: 2000
                    })
                }
            });
        } else {
            console.log(JSON.stringify(param));
            app.https_request("shoppingAddress/addAddress.do", param, function (res) {
                if (res.data.code == 0) {
                    wx.showToast({
                        title: '添加成功',
                        icon: 'success',
                        duration: 2000
                    });
                    //返回并刷新上一页
                    var pages = getCurrentPages();
                    var prevPage = pages[pages.length - 2]; //上一个页面
                    prevPage.getAddressList(); //调用上一页的某个方法
                    setTimeout(function () {
                        wx.navigateBack({
                            delta: 1
                        })
                    }, 1000)
                } else {
                    wx.showToast({
                        title: res.data.msg,
                        icon: 'error',
                        duration: 2000
                    })
                }
            });
        }
    },


    deleteAddress() {
        var param = {
            userId: userId,
            addressId: addressId
        };
        app.https_request('/shoppingAddress/deleteAddress.do', param, function (res) {
            if (!res.data || typeof res.data != 'object') {
                wx.showToast({ title: '系统错误' });
                return false;
            }
            if (res.data.code == 0) {
                wx.showToast({ title: '删除成功' });
                setTimeout(function () {
                    wx.navigateBack({
                        delta: 1
                    })
                }, 1000)
            }
        });
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
})