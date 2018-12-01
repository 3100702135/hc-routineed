App({
  globalData: {
    userInfo: {},
    js_code:'',
    appId: 'wxb12dd11fbbf2a473',
    model: null,
    version : null,
    system: null,
    platform: null,
    SDKVersion: null
  },
  onLaunch: function () {
    var that = this;
    that.globalData.sysinfo = wx.getSystemInfoSync()
    wx.login({
      success: function (res) {
        if (res.code) {
          //发起网络请求
          that.globalData.js_code = res.code;
          that.globalData.userInfo = res.userInfo
          console.log('获取用户登录code！' + res.code)
          console.log('app.js执行 用户信息' + res.userInfo)
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });

    // wx.getSetting({
    //   success(res) {
    //     if (!res.authSetting['scope.userInfo']) {
    //       wx.authorize({
    //         scope: 'scope.userInfo',
    //         success() {
    //           // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
    //            wx.startRecord()
    //         }
    //       })
    //     }
    //   }
    // })


  },
  getModel: function () { //获取手机型号
    return this.globalData.sysinfo["model"]
  },
  getVersion: function () { //获取微信版本号
    return this.globalData.sysinfo["version"]
  },
  getSystem: function () { //获取操作系统版本
    return this.globalData.sysinfo["system"]
  },
  getPlatform: function () { //获取客户端平台
    return this.globalData.sysinfo["platform"]
  },
  getSDKVersion: function () { //获取客户端基础库版本
    return this.globalData.sysinfo["SDKVersion"]
  }
})
