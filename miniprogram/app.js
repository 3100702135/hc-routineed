App({
  globalData: {
    userInfo: null,
    js_code:'',
    appId: 'wxb12dd11fbbf2a473',
    wechatUrl:'http://localhost:8080/ibccf/wechat/',
    model: null,
    version : null,
    system: null,
    platform: null,
    isHidden: true,  // true:已登录  false:未登录
    nullHouse: false,  //获取手机界面是否显示
    SDKVersion: null
  },
  onLaunch: function () {
    var that = this;
    that.globalData.sysinfo = wx.getSystemInfoSync()


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
