App({
  globalData: {
    userInfo: null,
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
          that.js_code = res.code;
          console.log('获取用户登录code！' + res.code)
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
              this.globalData.userInfo = res.userInfo
              console.log('app.js执行 昵称：' + this.globalData.userInfo.nickName)
              console.log('app.js执行 头像：' + this.globalData.userInfo.avatarUrl)
              console.log('app.js执行 性别：' + this.globalData.userInfo.gender)
              console.log('app.js执行 省份：' + this.globalData.userInfo.province)
              console.log('app.js执行 市：' + this.globalData.userInfo.city)
              console.log('app.js执行 国家/地区：' + this.globalData.userInfo.country)

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        } else {
          wx.getUserInfo({
            success: res => {
              console.log('app.js执行 getUserInfo2')
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })

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
