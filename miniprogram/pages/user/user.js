// miniprogram/pages/user.js
import { WXBizDataCrypt } from "../../commen/js/WXBizDataCrypt.js";
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    appId: 'wxb12dd11fbbf2a473',
    secret: '0f74bb40d557bb622b551789a94fcf58', //小程序秘钥
    sessionKey : 'tiihtNczf5v6AKRyjwEUhQ==',
    isHidden: true,  // true:已登录  false:未登录
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function () {
    var that =this
    wx.login({
      success: function (res) {
        if (res.code) {
          //发起网络请求
          app.globalData.js_code = res.code;
          app.globalData.userInfo = res.userInfo
          console.log('获取用户登录code！' + res.code)
          console.log('app.js执行 用户信息' + res.userInfo)
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });

    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          console.log('已经授权')
          // 已经授权，可以直接调用 getUserInfo 
          wx.getUserInfo({
            success: res => {
              console.log('app.js执行 getUserInfo')
              // 可以将 res 发送给后台解码出 unionId
              console.log('app.js未授权false：' + true)
              console.log('app.js执行 encryptedData ：' + res.encryptedData )
              app.globalData.userInfo = res.userInfo
              console.log('app.js执行 昵称：' + app.globalData.userInfo.nickName)
              console.log('app.js执行 头像：' + app.globalData.userInfo.avatarUrl)
              console.log('app.js执行 性别：' + app.globalData.userInfo.gender)
              console.log('app.js执行 省份：' + app.globalData.userInfo.province)
              console.log('app.js执行 市：' + app.globalData.userInfo.city)
              console.log('app.js执行 国家/地区：' + app.globalData.userInfo.country)
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              app.globalData.isHidden = true
              this.setData({
                userInfo: res.userInfo,
                isHidden: true
              })
              that.saveOrUpdateUserInfo(res.encryptedData, res.iv);
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        } else {
          app.globalData.isHidden = false
          this.setData({
            isHidden: false 
          })
          console.log('app.js未授权false：' + false)
        }
      }
    })
  },
  getUserInfo: function (e) {
    var that = this;
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    console.log('获取iv ' + e.detail.iv)
    this.setData({
      userInfo: e.detail.userInfo,
      isHidden: true
    })
    that.saveOrUpdateUserInfo(e.detail.encryptedData, e.detail.iv);
    },

//获取登录用户手机号 1第一次登录授权，存手机号 2第二次登录获取，查询手机号  3获取手机号 
  saveOrUpdateUserInfo: function (encryptedData,iv) {
    var that = this;
    console.log('点击反馈')
    console.log(encryptedData)
    console.log(iv)
    wx.request({
      url: app.globalData.wechatUrl +'saveOrUpdateUserInfo', //这里就写上后台解析手机号的接口
      //这里的几个参数是获取授权后的加密数据，作为参数传递给后台就行了
      data: {
        encryptedData:encryptedData,
        code: app.globalData.js_code,
        iv: iv
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success(res) {
        app.globalData.nullHouse = res.data
        console.log('后台获取数据：', res.data)
        console.log('appjs number显示数据：', app.globalData.nullHouse)
        wx.switchTab({
          url: '../index/index',   //注意switchTab只能跳转到带有tab的页面，不能跳转到不带tab的页面
        })

      }
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
  getPhoneNumber(e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '未授权',
        success: function (res) { }
      })
    } else {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '同意授权',
        success: function (res) {
          console.log('得到APPID' + app.globalData.appId);
         }
      })
    }
  } ,

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})