// pages/personal/edit/edit.js
const app = getApp();
var userId;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {},
        groupId: '',
        flagEditBox: false, // 修改昵称和手机号需要弹出窗口；
        editPlaceholderText: '', // 提示语
        editButtonText: '', // 【确认按钮】的文字
        editText: '', // 输入的文字
        imgCommonUrl:app.imgCommonUrl,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        userId = wx.getStorageSync('weiaijia-userId');
        this.setData({
            groupId: options.groupId
        })
        this.getUserInfo();
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    inputTextChange: function(e) {
        this.editText = e.detail.value;
        this.setData({
            editText: e.detail.value,
        })
    },

    changeAvator: function() {
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: (res) => {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                const tempFilePaths = res.tempFilePaths;
                console.log(tempFilePaths[0]);
                wx.uploadFile({
                    url: app.urlUpload + '/imageUpload/upload.do',
                    filePath: tempFilePaths[0],
                    name: 'file',
                    success: (ret) => {
                        let data = JSON.parse(ret.data);
                        var userInfo = this.userInfo
                        userInfo.headImage = data.msg;
                        this.setData({
                            userInfo: userInfo,
                        })

                        this.editInfo("headImage", data.msg);
                    },
                    fail: (ret) => {
                        console.log(ret)
                    }
                })

            }
        })
    },

    changeName: function() {
        var data = {};
        data.flagEditBox = true;
        data.editPlaceholderText = "请输入你要修改的昵称";
        data.editButtonText = "确认";
        data.editStatus = 1;
        data.editText = this.data.userInfo.userName;
        this.setData(data);
    },

    changePhone: function() {
        var data = {};
        data.flagEditBox = true;
        data.editPlaceholderText = "请输入你要绑定的手机号码";
        data.editButtonText = "绑定";
        data.editStatus = 2;
       // data.editText = this.data.userInfo.phone;
        this.setData(data);
    },

    chooseBirthday: function(e) {
        var userInfo = this.data.userInfo;
        userInfo.birthday = e.detail.value;
        this.setData({
            userInfo: userInfo
        });
        this.editInfo("birthday", userInfo.birthday);
    },

    chooseSex: function() {
        let userSexList = ['男', '女']
        wx.showActionSheet({
            itemList: userSexList,
            success: (res) => {
                var userInfo = this.data.userInfo;
                userInfo.userSex = userSexList[res.tapIndex];
                this.setData({
                    userInfo: userInfo,
                })
                this.editInfo("userSex", res.tapIndex + 1);
            }
        });
    },

    editBoxInfo: function() {
        var userInfo = this.data.userInfo;
        switch (this.data.editStatus) {
            case 1:
                this.editInfo("userName", this.data.editText);
                userInfo.realName = this.data.editText;
                break;
            case 2:
                this.editInfo("phone", this.data.editText);
               // userInfo.phone = this.data.editText;
            default:
                break;
        }
        this.setData({
            editText: '',
            flagEditBox: false,
            userInfo: userInfo
        })
    },

    editNo: function() {
        this.setData({
            editText: '',
            flagEditBox: false,
        })
    },

    getUserInfo() { //获取用户信息
        if (!userId) {
            return false;
        }
        app.https_request('user/userInfo.do', {
            userId: userId,
            loginPlat: app.currPlat,
        }, (res) => {
            if (res.data.code == 0) {
                let userInfo = res.data.objects[0];

                userInfo.headImage = userInfo.headImage || this.setDefaultAvator();
                userInfo.userName = userInfo.userName || userInfo.nickName;
                switch (userInfo.userSex) {
                    case 1:
                        userInfo.userSex = "男";
                        break;
                    case 2:
                        userInfo.userSex = "女";
                        break;
                    default:
                        break;
                }
                if(!userInfo.birthday){
                    userInfo.birthday = "请选择生日";
                }
                userInfo.phone = userInfo.phone;
                this.setData({
                    userInfo: userInfo,
                });
            }
        });
    },

    setDefaultAvator() {
        this.editInfo('headImage', 'https://www.haoshi360.com/vij365/default_avator.png')
    },

    editInfo(name, value) {
        var param = {
            userId: userId,
            loginPlat: app.currPlat,
        }
        param[name] = value;
        app.https_request('user/updateUserById.do', param, (res) => {
           if(res.data.code == 0){
               this.getUserInfo();
               wx.showToast({
                   title: '修改成功',
                   icon: 'none',
                   duration: 2000
               })
           }else{
               wx.showToast({
                   title: res.data.msg,
                   icon: 'none',
                   duration: 2000
               })
           }
            
        });
    },

    loadimage(e) {
        console("图片加载失败")
        console(e)
    },
})