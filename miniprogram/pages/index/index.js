const app = getApp()
Page({
  data: {
    progress_E: '20%',
    progress_T: '26',
    progress_L: '19',
    progress_Z: '59',
    progress_E: '50',
    progress_E: '50',
    progress_E: '50',

    count: 0, // 设置 计数器 初始为0
    countTimer: null, // 设置 定时器 初始为nul
    isChecked: false,
    isLoading: true,  //蓝牙是否连接
    isConnected: false,  //蓝牙是否连接  已连接不能刷新
    isConnectedStr: '未连接',  //蓝牙是否连接
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
  openBluetooth() {
    console.log("打开蓝牙按钮");
  },

  flashBlueTooth() {
    setTimeout(function () {
      wx.hideToast()
    }, 2000)
    wx.showLoading({
      title: '请稍后...'
    });
    // this.startConnect();
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数 
    this.startConnect();
  },

  startConnect: function () {
    var that = this;
    wx.showLoading({
      title: '开启蓝牙适配'
    });
    wx.openBluetoothAdapter({
      success: function (res) {
        console.log("初始化蓝牙适配器");
        console.log(res);
        that.getConnectedBluetoothDevices();
        that.getBluetoothAdapterState();
      },
      fail: function (err) {
        console.log(err);
        wx.showToast({
          title: '蓝牙初始化失败',
          icon: 'success',
          duration: 2000
        })
        setTimeout(function () {
          wx.hideToast()
        }, 2000)
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
            duration: 2000
          })
          setTimeout(function () {
            wx.hideToast()
          }, 2000)
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
          setTimeout(function () {
            wx.hideToast()
          }, 2000)
        } else {
          if (!discovering) {
            that.startBluetoothDevicesDiscovery();
            that.getConnectedBluetoothDevices();
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
        if (!res.isDiscovering) {
          that.getBluetoothAdapterState();
        } else {
          that.onBluetoothDeviceFound();
        }
      },
      fail: function (err) {
        wx.showToast({
          title: '蓝牙搜索失败'
        })
        setTimeout(function () {
          wx.hideToast()
        }, 2000)
        console.log(err);
      }
    });
  },

  getConnectedBluetoothDevices: function () {
    var that = this;
    console.log('getConnectedBluetoothDevices.serviceId', that.serviceId);
    wx.getConnectedBluetoothDevices({
      services: [that.serviceId],
      success: function (res) {
        console.log("获取处于连接状态的设备", res);
        var devices = res['devices'], flag = false, index = 0, conDevList = [];
        devices.forEach(function (value, index, array) {
          if (value['name'].indexOf('BT-05') != -1) {
            // 如果存在包含BT05字段的设备
            flag = true;
            index += 1;
            conDevList.push(value['deviceId']);
            that.deviceId = value['deviceId'];
            return;
          }
        });
        if (flag) {
          this.connectDeviceIndex = 0;
          that.loopConnect(conDevList);
        } else {
          if (!this.getConnectedTimer) {
            that.getConnectedTimer = setTimeout(function () {
              that.getConnectedBluetoothDevices();
            }, 5000);
          }
        }
      },
      fail: function (err) {
        if (!this.getConnectedTimer) {
          that.getConnectedTimer = setTimeout(function () {
            that.getConnectedBluetoothDevices();
          }, 5000);
        }
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
    clearTimeout(that.getConnectedTimer);
    that.getConnectedTimer = null;
    clearTimeout(that.discoveryDevicesTimer);
    that.stopBluetoothDevicesDiscovery();
    console.log('停止扫描stopBluetoothDevicesDiscovery');
    wx.createBLEConnection({
      deviceId: that.deviceId,
      success: function (res) {
        console.log('连接蓝牙成功');
        wx.showToast({
          title: '设备连接成功'
        })
        setTimeout(function () {
          wx.hideToast()
        }, 5000)
        that.setData({
          isLoading: false, //是否显示正在加载
          isConnected: true, //刷新蓝牙变成已连接状态
          isConnectedStr: '已连接' //刷新蓝牙变成已连接
        })
        setTimeout(function () {
          wx.hideToast()
        }, 2000)
        if (res.errCode == 0) {
          setTimeout(function () {
            that.getService(that.deviceId);
          }, 5000)
        }
        
      },
      fail: function (err) {
        console.log('连接蓝牙失败：', err);
        if (ltype == 'loop') {
          that.connectDeviceIndex += 1;
          that.loopConnect(array);
        } else {
          that.startBluetoothDevicesDiscovery();
          that.getConnectedBluetoothDevices();
        }
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
 * 发送 数据到设备中
 */
  writeToBLE: function (str) {
    var that = this;
    var writeArray = new Int8Array(str.length)
    for (var i = 0; i < str.length; i++) {
      writeArray[i] = str.charCodeAt(i)
    }
    var writeBuffer = writeArray.buffer
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
    var array = new Int8Array(str.length)
    for(var i = 0; i<str.length; i++) {
    array[i] = str.charCodeAt(i)
    }
    return array.buffer
  },

  // 接受数据显示
  readToShow: function (str) {
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
    that.progress_E ='88';
    switch (strFlag)
    {
      
      case 'E': this.setData({ progress_E: strValue}); break; //电量
      case 'T': this.setData({ progress_T: strValue }); break; // 温度
      case 'L': this.setData({ progress_L: strValue }); break;  //分钟
      case 'Z': this.setData({ progress_Z: strValue }); break;  //秒

      case 'F': this.setData({ progress_F: strValue }); break;  //前部亮度
      case 'M': this.setData({ progress_M: strValue }); break;  //顶部亮度
      case 'B': this.setData({ progress_B: strValue }); break;  //后部亮度
      default : break;
    }
  },

  loopConnect: function (devicesId) {
    var that = this;
    var listLen = devicesId.length;
    if (devicesId[this.connectDeviceIndex]) {
      this.deviceId = devicesId[this.connectDeviceIndex];
      this.startConnectDevices('loop', devicesId);
    } else {
      console.log('已配对的设备小程序蓝牙连接失败');
      that.startBluetoothDevicesDiscovery();
      that.getConnectedBluetoothDevices();
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

  drawProgressbg: function () {
    // 使用 wx.createContext 获取绘图上下文 context
    var ctx = wx.createCanvasContext('canvasProgressbg')
    ctx.setLineWidth(4);// 设置圆环的宽度
    ctx.setStrokeStyle('#20183b'); // 设置圆环的颜色
    ctx.setLineCap('round') // 设置圆环端点的形状
    ctx.beginPath();//开始一个新的路径
    ctx.arc(55, 55, 50, 0, 2 * Math.PI, false);
    //设置一个原点(100,100)，半径为90的圆的路径到当前路径
    ctx.stroke();//对当前路径进行描边
    ctx.draw();
  },
  drawCircle: function (step) {
    var context = wx.createCanvasContext('canvasProgress');
    // 设置渐变
    var gradient = context.createLinearGradient(100, 50, 50, 100);
    gradient.addColorStop("0", "#2661DD");
    gradient.addColorStop("0.5", "#40ED94");
    gradient.addColorStop("1.0", "#5956CC");

    context.setLineWidth(10);
    context.setStrokeStyle(gradient);
    context.setLineCap('round')
    context.beginPath();
    // 参数step 为绘制的圆环周长，从0到2为一周 。 -Math.PI / 2 将起始角设在12点钟位置 ，结束角 通过改变 step 的值确定
    context.arc(55, 55, 50, -Math.PI / 2, step * Math.PI - Math.PI / 2, false);
    context.stroke();
    context.draw()
  },
  onReady: function () {
    this.drawProgressbg();

    this.drawCircle(2);
  },


})



const deviceNameHC ="HC-05";
function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

