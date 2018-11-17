const app = getApp()
Page({
  data: {
    progress_E: '88',
    progress_T: '26',
    progress_L: '19',
    progress_Z: '59',
    progress_F: '50',
    progress_M: '50',
    progress_B: '50',

    setProgressValue_L: '',
    setProgressValue_F: '',
    setProgressValue_M: '',
    setProgressValue_B: '',

    count: 0, // 设置 计数器 初始为0
    countTimer: null, // 设置 定时器 初始为nul
    isChecked: false,
    voiceCheckValue: 'V20',
    voiceChecked : true,
    isShow: false, //是否第一次，隐藏连接成功
    isLoading: true,  //蓝牙是否连接
    isConnected: false,  //蓝牙是否连接  已连接不能刷新
    isConnectedStr: '未连接',  //蓝牙是否连接
    getConnectedTimer : 20000,  //蓝牙连接时间
    blueName : 'BT05',
    flag : false,
    serviceId : '',
    deviceId : '',
    characteristicId : '' ,  //蓝牙设备特征值ID
    characteristic_read: false,   //蓝牙设备特是否支持读
    characteristic_write: false,  //蓝牙设备特是否支持写
    characteristic_notify: false, //蓝牙设备特是否支持notify 操作
    characteristic_indicate: false, //蓝牙设备特是否支持indicate 操作

  },
  flashBlueTooth() {
    wx.showLoading({
      title: '请稍后...'
    });
    setTimeout(function () {
      wx.hideToast()
    }, 2000)
  },
  onLoad: function (options) {
    //加载判断微信版本是否兼容
    if (app.getPlatform() == 'android' && this.versionCompare('6.5.7', app.getVersion())) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，请更新至最新版本',
        showCancel: false
      })
    }
    else if (app.getPlatform() == 'ios' && this.versionCompare('6.5.6', app.getVersion())) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，请更新至最新版本',
        showCancel: false
      })
    }
    // 页面初始化 options为页面跳转所带来的参数 
    this.startConnect();
  },

  startConnect: function () {
    var that = this;
    wx.showLoading({
      title: '开启蓝牙适配'
    });
    // setTimeout(function () {
    //   wx.hideToast()
    // }, 2000)
    wx.openBluetoothAdapter({
      success: function (res) {
        console.log("初始化蓝牙适配器");
        console.log(res);
        that.getBluetoothAdapterState();
      },
      fail: function (err) {
        console.log(err);
        wx.showToast({
          title: '打开蓝牙失败',
          icon: 'success',
          duration: 5000
        })
      }
    });
    wx.onBluetoothAdapterStateChange(function (res) {
      var available = res.available;
      if (available) {
        that.getBluetoothAdapterState();
      }
      else{
          wx.showToast({
            title: '蓝牙已关闭',
            icon: 'success',
            duration: 4000
          })
          wx.hideToast();
        that.setData({
          isLoading: true,  //是否显示正在加载
          isConnected: false, //刷新蓝牙变成已连接状态
          isConnectedStr: '未连接'  //刷新蓝牙变成已连接
        })
      }
      
    })
  },

  getBluetoothAdapterState: function () {
    var that = this;
    wx.getBluetoothAdapterState({
      success: function (res) {
        var available = res.available,
          discovering = res.discovering;
        if (!available) {
          wx.showToast({
            title: '设备无法开启蓝牙连接',
            icon: 'success',
            duration: 2000
          })
          wx.hideToast();
        } else {
          if (!discovering) {
            that.startBluetoothDevicesDiscovery();
          }
        }
      }
    })
  },

  startBluetoothDevicesDiscovery: function () {
    var that = this;
    wx.showLoading({
      title: '开始搜索'
    });
    wx.startBluetoothDevicesDiscovery({
      services: [],
      allowDuplicatesKey: false,
      success: function (res) {
        console.log('开启蓝牙搜索成功！');
        if (!res.isDiscovering) {
          that.getBluetoothAdapterState();
        } else {
          that.onBluetoothDeviceFound();
        }
      },
      fail: function (err) {
        console.log('开启蓝牙搜索失败！');
        wx.showToast({
          title: '蓝牙搜索失败'
        })
        setTimeout(function () {
          wx.hideToast()
        }, 2000)
        that.startBluetoothDevicesDiscovery();
        console.log(err);
      }
    });
  },

  onBluetoothDeviceFound: function () {
    var blueName = 'BT05';
    var that = this;
    var flag = false;
    var conDevList = [];
    console.log('onBluetoothDeviceFound');
    wx.onBluetoothDeviceFound(function (res) {
      console.log('new device list has founded')
      console.log(res);
      var devices = res['devices'];
      console.log(devices);
      devices.forEach(function (value, index, array) {
        var strName = value['name']
        console.log(strName);
        console.log(strName);
        if (strName.indexOf(blueName) != -1) {
          // 如果存在包含BT05字段的设备
          console.log('发现BT05,准备进行连接');
          console.log('哦耶', strName);
          flag = true;
          index += 1;
          conDevList.push(value['deviceId']);
          that.deviceId = value['deviceId'];
          console.log('发现BT05,准备进行连接');
          that.startConnectDevices();
          return;
        }
      });

    })
  },

  startConnectDevices: function (ltype, array) {
    var that = this;
    console.log('开始连接蓝牙服务startConnectDevices');
    that.stopBluetoothDevicesDiscovery();
    console.log('停止扫描stopBluetoothDevicesDiscovery');
    wx.createBLEConnection({
      deviceId: that.deviceId,
      success: function (res) {
        console.log('连接蓝牙成功');
        that.setData({
          isShow:true,
          isLoading: false, //是否显示正在加载
          isConnected: true, //刷新蓝牙变成已连接状态
          isConnectedStr: '已连接' //刷新蓝牙变成已连接
        })
        wx.showLoading({
          title: '已连接,请稍等...',
          duration: 8000
        })
        if (res.errCode == 0) {
          setTimeout(function () {
            that.getService(that.deviceId);
          }, 5000)
        }
        
      },
      fail: function (err) {
        console.log('连接蓝牙失败：', err);
        that.startConnect();
      },
      complete: function () {
        console.log('complete connect devices');
        this.isConnectting = false;
      }
    });
  },

  stopBluetoothDevicesDiscovery: function () {
    wx.stopBluetoothDevicesDiscovery({
      success: res => console.log(res),
      fail: res => console.log(res),
    })
  },

  getService: function (deviceId) {
    console.log('进入连接服务getService');
    var that = this;
    // 监听蓝牙连接
    console.log('开启蓝牙监听onBLEConnectionStateChange');
    wx.onBLEConnectionStateChange(function (res) {
      console.log(res);
      if (!res.connected) {
        console.log('回调状态！！！蓝牙状态异常');
        wx.showToast({
          title: '异常请重新打开！'
        })
        that.setData({
          isLoading: true,  //是否显示正在加载
          isConnected: false, //刷新蓝牙变成已连接状态
          isConnectedStr: '未连接'  //刷新蓝牙变成已连接
        })
        wx.closeBLEConnection({
          success: function (res) {
            console.log(res)
          }
        })
      }
    });
    // 获取蓝牙设备service值
    wx.getBLEDeviceServices({
      deviceId: deviceId,
      success: function (res) {
        console.log(res.services[1].uuid);
        that.serviceId = res.services[1].uuid;
        console.log(that.serviceId);
        that.getCharacter(deviceId, res.services);
      }
    })
  },

  getCharacter: function (deviceId, services) {
    console.log('获取服务特征值getCharacter');
    var that = this;
    var character ='';
    var characteristics = [];
    services.forEach(function (value, index, array) {
      if (value == that.serviceId) {
        console.log(that.serviceId);
        that.serviceId = array[index];
      }
    });
    wx.getBLEDeviceCharacteristics({
      deviceId: that.deviceId,
      serviceId: that.serviceId,
      success: function (res) {
      that.characteristicId = res.characteristics[0].uuid;
      that.characteristic_read = res.characteristics[0].properties.read;   //蓝牙设备特是否支持读
      that.characteristic_write = res.characteristics[0].properties.write;  //蓝牙设备特是否支持写
      that.characteristic_notify = res.characteristics[0].properties.notify; //蓝牙设备特是否支持notify 操作
      that.characteristic_indicate = res.characteristics[0].properties.indicate; //蓝牙设备特是否支持indicate操作
      if (!that.characteristic_read)
      {
        console.log('蓝牙设备不支持读操作');
        return;
      }
      if (!that.characteristic_write) {
        console.log('蓝牙设备不支持写操作');
          return;
      }
      if (!that.characteristic_notify) {
          console.log('蓝牙设备不支持notify操作');
          return;
      }
      wx.notifyBLECharacteristicValueChange({
        deviceId: that.deviceId,
        serviceId: that.serviceId,
        characteristicId: that.characteristicId,
        state: true,
        success: function(res) {
          console.log('蓝牙设备特征值变化',res);
        },
      })
      wx.onBLECharacteristicValueChange(function (res) {
        that.characteristicId = res.characteristicId;
        console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`);
        console.log('打印接受数据', that.ArrayBufferToStr(res.value))
      })
      that.readFromBLE();
      },
      fail: function (err) {
        console.log(err);
      },
      complete: function () {
        console.log('complete');
      }
    })
  },

  /**
* 读取 设备的数据
*/
  readFromBLE: function () {
    var that = this;
    wx.readBLECharacteristicValue({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
      deviceId: that.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: that.serviceId,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      characteristicId: that.characteristicId,
      success: function (res) {
        console.log('准备读取蓝牙设备信息readBLECharacteristicValue:', res.errMsg);
      }
    })
  },

  /**
* 发送 数据到设备中
*/
  writeToBLE: function (str) {
    var that = this;
    var writeBuffer = that.stringToBytes(str +'  ');
    console.log(str)
    console.log(writeBuffer)
    wx.writeBLECharacteristicValue({
      deviceId: that.deviceId,
      serviceId: that.serviceId,
      characteristicId: that.characteristicId,
      value: writeBuffer,
      success: function (res) {
        // success
        console.log("success 指令发送成功");
        console.log(res);
      },
      fail: function (res) {
        // fail
        console.log("success 指令发送失败");
        console.log(res);
      },
      complete: function (res) {
        // complete
      }
    })
  },

  // ArrayBuffer转16进度字符串示例
  ArrayBufferToStr: function (arrayBuffer) {
    var that = this;
    var dataview = new DataView(arrayBuffer)
    var ints = new Uint8Array(arrayBuffer.byteLength)
    var str = ''
    for (var i = 0; i < ints.length; i++) {
      str += String.fromCharCode(dataview.getUint8(i))
    }
    str = str.substr(0,3);
    console.log('准备读取蓝牙设备信息readBLECharacteristicValue:', str);
    that.readToShow(str);
    return str;
  },

  // 字符串转byte
  stringToBytes: function (str) {
    var array = new Int8Array(32)
    for(var i = 0; i<str.length; i++) {
    array[i] = str.charCodeAt(i);
    }
    return array.buffer
  },

  // 接受数据显示
  readToShow: function (str) {
    console.log('strFlag', str);
    var that = this;
    var strFlag = '';
    var strValue = '';
    if (str=='' || str==undefined)
    {
      return;
    }
    strFlag = str.substr(0, 1);
    strValue = str.substr(1, 2);
    console.log('strFlag', strFlag);
    console.log('strValue', strValue);
    switch (strFlag)
    {
      
      case 'E': this.setData({ progress_E: strValue });    break; //电量
      case 'T': this.setData({ progress_T: strValue });   break; // 温度
      case 'L': this.setData({ progress_L: strValue });   break;  //分钟
      case 'Z': this.setData({ progress_Z: strValue });   break;  //秒

      case 'F': this.setData({ progress_F: strValue });   break;  //前部亮度
      case 'M': this.setData({ progress_M: strValue });   break;  //顶部亮度
      case 'B': this.setData({ progress_B: strValue });   break;  //后部亮度

      case 'V': 
      if (strValue=='20')
      {
        this.setData({ voiceChecked: true}); break;  //打开声音
      }
      else{
        this.setData({ voiceChecked: false }); break;  //关闭声音
      }
      default : this.onShow(); break;
    }
  },

  setProgress_L: function (e) {
    var that = this;
    that.setProgressValue_L = e.detail.value;
    if (that.setProgressValue_L<10)
    {
      that.setProgressValue_L = '0' + that.setProgressValue_L;
    }
    that.writeToBLE('L' + that.setProgressValue_L.toString());
    console.log('设置时间啦', 'L' + that.setProgressValue_L.toString());
  },
  setProgress_F: function (e) {
    var that = this;
    that.setProgressValue_F = e.detail.value;
    that.writeToBLE('F' + that.setProgressValue_F.toString());
    console.log('设置前额亮度', 'F' + that.setProgressValue_F.toString());  
  },
  setProgress_M: function (e) {
    var that = this;
    that.setProgressValue_M = e.detail.value;
    that.writeToBLE('M' + that.setProgressValue_M.toString());
    console.log('设置头顶亮度', 'M' + that.setProgressValue_M.toString());  
  },
  setProgress_B: function (e) {
    var that = this;
    that.setProgressValue_B = e.detail.value;
    that.writeToBLE('B' + that.setProgressValue_B.toString());
    console.log('设置后枕亮度', 'B' + that.setProgressValue_B.toString());  
  },

  //版本比较
  versionCompare: function (ver1, ver2) { 
    var version1pre = parseFloat(ver1)
    var version2pre = parseFloat(ver2)
    var version1next = parseInt(ver1.replace(version1pre + ".", ""))
    var version2next = parseInt(ver2.replace(version2pre + ".", ""))
    if (version1pre > version2pre)
      return true
    else if (version1pre < version2pre)
      return false
    else {
      if (version1next > version2next)
        return true
      else
        return false
    }
  },

  checkboxChange: function (e) {
    var that = this;
    var CheckValue='';
    that.CheckValue = e.detail.value[0];
    console.log('接受变化值');
    console.log(that.CheckValue);
    if (that.CheckValue == 'V20') 
    {
      console.log('打开声音V20');
      that.writeToBLE('V20' );
    }
    else
    {
      console.log('关闭声音V10');
      that.writeToBLE('V10');
    }
  },

  onReady: function () {

  },
  onShow: function () {
    // 页面显示 
  },
  onHide: function () {
    // 页面隐藏 
  },
  onUnload: function () {
    // 页面关闭 
  },



})