/**
 * 微信小程序二维码生成工具
 * 基于 QR Code 算法实现
 */

var QRCode = function () {
  this.typeNumber = 4;
  this.errorCorrectLevel = 'M';
  this.qrData = null;
};

QRCode.prototype = {
  constructor: QRCode,
  
  // 二维码编码表
  QRCodeModel: {
    PAD0: 0xEC,
    PAD1: 0x11
  },
  
  // 生成二维码数据
  encode: function (data) {
    var typeNumber = this.typeNumber;
    var errorCorrectLevel = this.errorCorrectLevel;
    
    var blocks = this.getBlocks(data, typeNumber, errorCorrectLevel);
    var code = this.createData(typeNumber, errorCorrectLevel, blocks);
    
    this.qrData = code;
    return code;
  },
  
  // 获取数据块
  getBlocks: function (data, typeNumber, errorCorrectLevel) {
    var rsBlocks = this.getRSBlocks(typeNumber, errorCorrectLevel);
    var buffer = new QRBitBuffer();
    
    buffer.put(4, this.getModeIndicator(data));
    buffer.put(this.getCharCountIndicator(typeNumber, this.getModeIndicator(data)), data.length);
    
    for (var i = 0; i < data.length; i++) {
      buffer.put(8, data.charCodeAt(i));
    }
    
    var totalDataCount = 0;
    for (var i = 0; i < rsBlocks.length; i++) {
      totalDataCount += rsBlocks[i].dataCount;
    }
    
    if (buffer.getLengthInBits() > totalDataCount * 8) {
      throw new Error('Too much data');
    }
    
    if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
      buffer.put(4, 0);
    }
    
    while (buffer.getLengthInBits() % 8 !== 0) {
      buffer.putBit(false);
    }
    
    while (true) {
      if (buffer.getLengthInBits() >= totalDataCount * 8) {
        break;
      }
      buffer.put(8, this.QRCodeModel.PAD0);
      if (buffer.getLengthInBits() >= totalDataCount * 8) {
        break;
      }
      buffer.put(8, this.QRCodeModel.PAD1);
    }
    
    return this.splitBuffer(buffer, rsBlocks);
  },
  
  // 获取模式指示符
  getModeIndicator: function (data) {
    if (/^[0-9]+$/.test(data)) {
      return 1; // 数字模式
    } else if (/^[A-Za-z0-9 \$%*+\-.\/:]+$/.test(data)) {
      return 2; // 字母数字模式
    } else {
      return 4; // 字节模式
    }
  },
  
  // 获取字符计数指示符位数
  getCharCountIndicator: function (typeNumber, mode) {
    var table = {
      1: [10, 9, 8],
      2: [12, 11, 16],
      3: [14, 13, 16]
    };
    var group = Math.floor((typeNumber - 1) / 4);
    return table[mode] ? table[mode][group] : 8;
  },
  
  // 获取RS块
  getRSBlocks: function (typeNumber, errorCorrectLevel) {
    var rsBlock = this.getRSBlockTable(typeNumber, errorCorrectLevel);
    var blocks = [];
    
    for (var i = 0; i < rsBlock.length; i += 3) {
      var count = rsBlock[i];
      var total = rsBlock[i + 1];
      var data = rsBlock[i + 2];
      
      for (var j = 0; j < count; j++) {
        blocks.push({ totalCount: total, dataCount: data });
      }
    }
    
    return blocks;
  },
  
  // RS块表
  getRSBlockTable: function (typeNumber, errorCorrectLevel) {
    var table = {
      'L': [
        [1, 26, 19], [1, 44, 34], [1, 70, 55], [1, 100, 80],
        [1, 134, 108], [2, 86, 68], [2, 108, 86], [2, 130, 104],
        [2, 156, 124], [2, 180, 144], [2, 213, 173], [2, 243, 199],
        [2, 279, 231], [2, 321, 265], [2, 367, 305], [2, 417, 351],
        [2, 459, 385], [2, 513, 433], [2, 571, 481], [4, 338, 276]
      ],
      'M': [
        [1, 26, 16], [1, 44, 28], [1, 70, 44], [2, 50, 32],
        [2, 67, 43], [2, 87, 55], [2, 108, 68], [2, 130, 82],
        [2, 156, 98], [2, 180, 111], [2, 213, 131], [2, 243, 151],
        [2, 279, 175], [4, 162, 106], [4, 180, 116], [4, 198, 128],
        [4, 222, 146], [4, 250, 166], [4, 276, 182], [4, 306, 202]
      ],
      'Q': [
        [1, 26, 13], [1, 44, 22], [2, 35, 22], [2, 50, 32],
        [2, 67, 43], [4, 43, 27], [4, 54, 34], [2, 65, 41],
        [4, 65, 41], [2, 80, 50], [4, 80, 50], [4, 90, 56],
        [2, 105, 65], [4, 105, 65], [4, 117, 73], [4, 129, 81],
        [6, 108, 68], [4, 135, 85], [6, 135, 85], [6, 150, 96]
      ],
      'H': [
        [1, 26, 9], [1, 44, 16], [2, 35, 22], [4, 25, 15],
        [2, 33, 20], [4, 43, 27], [4, 54, 34], [4, 65, 41],
        [2, 80, 50], [4, 80, 50], [3, 100, 62], [4, 90, 56],
        [4, 105, 65], [6, 105, 65], [4, 117, 73], [6, 117, 73],
        [4, 135, 85], [6, 135, 85], [6, 150, 96], [6, 150, 96]
      ]
    };
    
    return table[errorCorrectLevel] ? table[errorCorrectLevel][typeNumber - 1] : table['M'][typeNumber - 1];
  },
  
  // 分割缓冲区
  splitBuffer: function (buffer, rsBlocks) {
    var offset = 0;
    var maxDcCount = 0;
    var maxEcCount = 0;
    
    for (var i = 0; i < rsBlocks.length; i++) {
      maxDcCount = Math.max(maxDcCount, rsBlocks[i].dataCount);
      maxEcCount = Math.max(maxEcCount, rsBlocks[i].totalCount - rsBlocks[i].dataCount);
    }
    
    var dcData = [];
    var ecData = [];
    
    for (var i = 0; i < maxDcCount; i++) {
      dcData[i] = [];
      for (var j = 0; j < rsBlocks.length; j++) {
        if (i < rsBlocks[j].dataCount) {
          dcData[i].push(buffer.buffer[offset++]);
        }
      }
    }
    
    for (var i = 0; i < maxEcCount; i++) {
      ecData[i] = [];
      for (var j = 0; j < rsBlocks.length; j++) {
        if (i < rsBlocks[j].totalCount - rsBlocks[j].dataCount) {
          ecData[i].push(buffer.buffer[offset++]);
        }
      }
    }
    
    var totalBlocks = [];
    for (var i = 0; i < dcData.length; i++) {
      for (var j = 0; j < dcData[i].length; j++) {
        totalBlocks.push(dcData[i][j]);
      }
    }
    for (var i = 0; i < ecData.length; i++) {
      for (var j = 0; j < ecData[i].length; j++) {
        totalBlocks.push(ecData[i][j]);
      }
    }
    
    return totalBlocks;
  },
  
  // 创建数据
  createData: function (typeNumber, errorCorrectLevel, blocks) {
    var size = typeNumber * 4 + 17;
    var data = this.createQRMatrix(typeNumber, errorCorrectLevel, blocks);
    return { data: data, size: size };
  },
  
  // 创建QR矩阵
  createQRMatrix: function (typeNumber, errorCorrectLevel, blocks) {
    var size = typeNumber * 4 + 17;
    var matrix = [];
    
    for (var i = 0; i < size; i++) {
      matrix[i] = [];
      for (var j = 0; j < size; j++) {
        matrix[i][j] = false;
      }
    }
    
    this.drawPositionProbe(matrix, 0, 0);
    this.drawPositionProbe(matrix, size - 7, 0);
    this.drawPositionProbe(matrix, 0, size - 7);
    
    this.drawPositionAdjust(matrix, typeNumber);
    this.drawTimingPattern(matrix, size);
    
    this.drawData(matrix, size, blocks);
    
    return matrix;
  },
  
  // 绘制定位探测图形
  drawPositionProbe: function (matrix, x, y) {
    for (var i = -1; i <= 7; i++) {
      if (x + i > -1 && x + i < matrix.length && y - 1 > -1 && y - 1 < matrix.length) {
        matrix[y - 1][x + i] = true;
      }
      if (x + i > -1 && x + i < matrix.length && y + 7 > -1 && y + 7 < matrix.length) {
        matrix[y + 7][x + i] = true;
      }
      if (y + i > -1 && y + i < matrix.length && x - 1 > -1 && x - 1 < matrix.length) {
        matrix[y + i][x - 1] = true;
      }
      if (y + i > -1 && y + i < matrix.length && x + 7 > -1 && x + 7 < matrix.length) {
        matrix[y + i][x + 7] = true;
      }
    }
    
    for (var i = 0; i < 7; i++) {
      for (var j = 0; j < 7; j++) {
        matrix[y + i][x + j] = true;
      }
    }
    
    for (var i = 2; i < 5; i++) {
      for (var j = 2; j < 5; j++) {
        matrix[y + i][x + j] = false;
      }
    }
    
    for (var i = 3; i < 4; i++) {
      for (var j = 3; j < 4; j++) {
        matrix[y + i][x + j] = true;
      }
    }
  },
  
  // 绘制定位调整图形
  drawPositionAdjust: function (matrix, typeNumber) {
    var pos = this.getPositionAdjustPattern(typeNumber);
    for (var i = 0; i < pos.length; i++) {
      for (var j = 0; j < pos.length; j++) {
        var x = pos[i];
        var y = pos[j];
        if (matrix[y][x] === false) {
          for (var k = -2; k <= 2; k++) {
            for (var l = -2; l <= 2; l++) {
              matrix[y + k][x + l] = (k === -2 || k === 2 || l === -2 || l === 2) || (k === 0 && l === 0);
            }
          }
        }
      }
    }
  },
  
  // 获取定位调整模式位置
  getPositionAdjustPattern: function (typeNumber) {
    var positions = [
      [],
      [],
      [6, 18],
      [6, 22],
      [6, 26],
      [6, 30],
      [6, 34],
      [6, 22, 38],
      [6, 24, 42],
      [6, 26, 46],
      [6, 28, 50],
      [6, 30, 54],
      [6, 32, 58],
      [6, 34, 62],
      [6, 26, 46, 66],
      [6, 26, 48, 70],
      [6, 26, 50, 74],
      [6, 30, 54, 78],
      [6, 30, 56, 82],
      [6, 30, 58, 86]
    ];
    return positions[typeNumber - 1] || [];
  },
  
  // 绘制时序图案
  drawTimingPattern: function (matrix, size) {
    for (var i = 8; i < size - 8; i++) {
      matrix[i][6] = (i % 2 === 0);
      matrix[6][i] = (i % 2 === 0);
    }
  },
  
  // 绘制数据
  drawData: function (matrix, size, blocks) {
    var dataIndex = 0;
    var bitIndex = 7;
    
    for (var i = size - 1; i > 0; i -= 2) {
      if (i === 6) i--;
      for (var j = 0; j < size; j++) {
        var x = (i % 2 === 0) ? size - 1 - j : j;
        var y = i;
        
        if (!matrix[y][x]) {
          var bit = false;
          if (dataIndex < blocks.length) {
            bit = (blocks[dataIndex] >>> bitIndex) & 1;
            bitIndex--;
            if (bitIndex === -1) {
              dataIndex++;
              bitIndex = 7;
            }
          }
          matrix[y][x] = bit;
        }
        
        x = (i % 2 === 0) ? size - 1 - j : j;
        y = i - 1;
        
        if (!matrix[y][x]) {
          var bit = false;
          if (dataIndex < blocks.length) {
            bit = (blocks[dataIndex] >>> bitIndex) & 1;
            bitIndex--;
            if (bitIndex === -1) {
              dataIndex++;
              bitIndex = 7;
            }
          }
          matrix[y][x] = bit;
        }
      }
    }
  },
  
  // 绘制到Canvas
  drawToCanvas: function (ctx, size, x, y, scale) {
    if (!this.qrData) return;
    
    var data = this.qrData.data;
    var qrSize = this.qrData.size;
    
    for (var i = 0; i < qrSize; i++) {
      for (var j = 0; j < qrSize; j++) {
        if (data[i][j]) {
          ctx.fillRect(x + j * scale, y + i * scale, scale, scale);
        }
      }
    }
  }
};

// BitBuffer类
var QRBitBuffer = function () {
  this.buffer = [];
  this.length = 0;
};

QRBitBuffer.prototype = {
  constructor: QRBitBuffer,
  
  get: function (index) {
    var bufIndex = Math.floor(index / 8);
    var bitIndex = index % 8;
    return ((this.buffer[bufIndex] >>> (7 - bitIndex)) & 1) === 1;
  },
  
  put: function (numBits, value) {
    for (var i = 0; i < numBits; i++) {
      this.putBit(((value >>> (numBits - i - 1)) & 1) === 1);
    }
  },
  
  putBit: function (bit) {
    var bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    
    if (bit) {
      this.buffer[bufIndex] |= (0x80 >>> (this.length % 8));
    }
    
    this.length++;
  },
  
  getLengthInBits: function () {
    return this.length;
  }
};

// 导出模块
module.exports = QRCode;
