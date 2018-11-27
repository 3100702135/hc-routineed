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
    sessionKey : 'tiihtNczf5v6AKRyjwEUhQ=='
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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