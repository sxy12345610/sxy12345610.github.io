Page({
  /**
   * 页面的初始数据
   */
  data: {
    identityCard: null,
    currentDate: '',
    historyCards: [],
    isNightMode: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const today = new Date();
    const dateStr = today.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
    this.setData({ currentDate: dateStr });
    
    this.loadIdentityCard();
    this.loadHistoryCards();
    this.loadNightMode();
  },

  /**
   * 加载夜间模式状态
   */
  loadNightMode: function() {
    const theme = wx.getStorageSync('theme') || 'day';
    const isNightMode = theme === 'night';
    this.setData({ isNightMode });
    
    if (isNightMode) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#0d0d1a'
      });
      wx.setBackgroundColor({
        backgroundColor: '#0d0d1a'
      });
    } else {
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#fdf6e3'
      });
      wx.setBackgroundColor({
        backgroundColor: '#fdf6e3'
      });
    }
  },

  /**
   * 加载身份卡
   */
  loadIdentityCard: function() {
    const today = new Date().toISOString().split('T')[0];
    const savedCard = wx.getStorageSync('todayIdentity');
    
    if (savedCard) {
      try {
        const card = JSON.parse(savedCard);
        // 检查是否是今天的身份卡
        if (card.date === today) {
          this.setData({ identityCard: card });
          return;
        }
      } catch (e) {
        console.error('解析身份卡失败', e);
      }
    }
    
    // 从API获取身份
    this.fetchIdentityFromAPI();
  },

  /**
   * 从API获取身份
   */
  fetchIdentityFromAPI: function() {
    const nickname = wx.getStorageSync('nickname') || '匿名用户';

    // 本地调试用
    // const backendUrl = 'http://localhost:8080/api/getCard';
    // 上线用
    const backendUrl = 'https://sxy12345610.fly.dev/api/getCard';

    wx.request({
      url: backendUrl,
      method: 'GET',
      data: {
        nickname: encodeURIComponent(nickname)
      },
      success: (res) => {
        console.log('返回数据:', res.data);
        
        if (res.data && res.statusCode === 200) {
          const today = new Date();
          const dateStr = today.toISOString().split('T')[0];
          
          // 使用API数据生成身份卡
          const identityCard = {
            date: dateStr,
            avatar: '✨',
            name: nickname,
            title: res.data.cards && res.data.cards[0] ? res.data.cards[0].text : '平行世界的使者',
            power: Math.floor(Math.random() * 40) + 60,
            luck: Math.floor(Math.random() * 40) + 60,
            charm: Math.floor(Math.random() * 40) + 60,
            skill: '拥有治愈心灵的能力，可以帮助他人走出困境',
            message: '今天的你，拥有改变世界的力量 ✨'
          };
          
          // 保存今日身份
          wx.setStorageSync('todayIdentity', JSON.stringify(identityCard));
          
          // 添加到历史记录
          this.addToHistory(identityCard);
          
          // 更新页面数据
          this.setData({ 
            identityCard: identityCard,
            cardData: res.data
          });
          
          wx.showToast({ title: '🔮 身份生成成功！', icon: 'success' });
        } else {
          console.log('获取身份失败，使用本地生成');
          this.generateIdentity();
        }
      },
      fail: (err) => {
        console.error('请求失败', err);
        console.log('获取身份失败，使用本地生成');
        this.generateIdentity();
      }
    });
  },

  /**
   * 加载历史身份卡
   */
  loadHistoryCards: function() {
    const history = wx.getStorageSync('identityHistory');
    if (history) {
      try {
        const cards = JSON.parse(history);
        this.setData({ historyCards: cards.slice(-7) }); // 只显示最近7天
      } catch (e) {
        console.error('解析历史记录失败', e);
      }
    }
  },

  /**
   * 生成今日身份（每日固定逻辑）
   */
  generateIdentity: function() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    // 检查今日是否已生成
    const savedCard = wx.getStorageSync('todayIdentity');
    if (savedCard) {
      try {
        const card = JSON.parse(savedCard);
        if (card.date === dateStr) {
          wx.showToast({ title: '今日身份已生成', icon: 'none' });
          return;
        }
      } catch (e) {}
    }
    
    // 根据日期和随机算法生成固定身份
    const identity = this.generateFixedIdentity(today);
    
    // 保存今日身份
    wx.setStorageSync('todayIdentity', JSON.stringify(identity));
    
    // 添加到历史记录
    this.addToHistory(identity);
    
    this.setData({ identityCard: identity });
    
    wx.showToast({ title: '🔮 身份生成成功！', icon: 'success' });
  },

  /**
   * 根据日期生成固定身份（核心算法）
   */
  generateFixedIdentity: function(date) {
    // 使用日期作为种子，确保同一天生成的身份相同
    const seed = this.getDateSeed(date);
    
    const avatars = ['🧙', '🧚', '🦋', '🌟', '🐬', '🌺', '🌙', '🦄', '🌈', '✨'];
    const names = [
      '星光守护者', '月光精灵', '梦境旅人', '彩虹使者',
      '云端漫步者', '森林低语者', '海洋之心', '星辰守望者',
      '风之舞者', '花之精灵'
    ];
    const titles = [
      '平行世界的守护者', '梦境的编织者', '心灵的治愈师',
      '希望的传播者', '快乐的收集者', '勇气的化身',
      '智慧的使者', '爱的守护者'
    ];
    const skills = [
      '拥有治愈心灵的能力，可以帮助他人走出困境',
      '能够看到未来的美好，给予人们希望',
      '可以与自然万物沟通，倾听它们的心声',
      '拥有创造快乐的魔法，让身边的人都感到幸福',
      '能够穿越梦境，在平行世界间自由穿梭',
      '拥有预知未来的能力，帮助人们做出正确的选择',
      '可以净化负面情绪，带来内心的平静',
      '拥有与动物交流的能力，理解它们的语言'
    ];
    const messages = [
      '今天的你，拥有改变世界的力量 ✨',
      '相信自己，你比想象中更强大 💪',
      '每一个小行动，都在创造美好的未来 🌟',
      '你的存在，本身就是奇迹 💎',
      '勇敢地迈出第一步，世界会为你让路 🌈',
      '今天也是充满可能性的一天 🎈',
      '你的努力，终将绽放出美丽的花朵 🌸',
      '保持初心，方得始终 💫'
    ];
    
    // 使用种子获取固定索引
    const avatarIndex = seed % avatars.length;
    const nameIndex = (seed * 7) % names.length;
    const titleIndex = (seed * 11) % titles.length;
    const skillIndex = (seed * 13) % skills.length;
    const messageIndex = (seed * 17) % messages.length;
    
    // 生成能力值（固定范围 60-99）
    const power = Math.min(99, 60 + (seed * 3) % 40);
    const luck = Math.min(99, 60 + (seed * 5) % 40);
    const charm = Math.min(99, 60 + (seed * 7) % 40);
    
    return {
      date: date.toISOString().split('T')[0],
      avatar: avatars[avatarIndex],
      name: names[nameIndex],
      title: titles[titleIndex],
      power: power,
      luck: luck,
      charm: charm,
      skill: skills[skillIndex],
      message: messages[messageIndex]
    };
  },

  /**
   * 获取日期种子
   */
  getDateSeed: function(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return year * 10000 + month * 100 + day;
  },

  /**
   * 添加到历史记录
   */
  addToHistory: function(card) {
    const history = wx.getStorageSync('identityHistory');
    const cards = history ? JSON.parse(history) : [];
    
    // 移除重复的日期
    const filtered = cards.filter(c => c.date !== card.date);
    filtered.push(card);
    
    // 只保留最近30天
    if (filtered.length > 30) {
      filtered.shift();
    }
    
    wx.setStorageSync('identityHistory', JSON.stringify(filtered));
    this.setData({ historyCards: filtered.slice(-7) });
  },

  /**
   * 保存身份卡到相册
   */
  saveIdentityCard: function() {
    if (!this.data.identityCard) {
      wx.showToast({ title: '请先生成身份卡', icon: 'none' });
      return;
    }
    
    // 请求相册权限
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              this.generateAndSaveCard();
            },
            fail: () => {
              wx.showModal({
                title: '需要相册权限',
                content: '请在设置中开启相册权限，以便保存身份卡',
                showCancel: false
              });
            }
          });
        } else {
          this.generateAndSaveCard();
        }
      },
      fail: () => {
        this.generateAndSaveCard();
      }
    });
  },

  /**
   * 生成并保存身份卡图片
   */
  generateAndSaveCard: function() {
    wx.showLoading({ title: '生成图片中...' });
    
    // 使用 canvas 生成图片
    const ctx = wx.createCanvasContext('identity-card-canvas');
    
    // 绘制背景渐变
    const gradient = ctx.createLinearGradient(0, 0, 300, 400);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.setFillStyle(gradient);
    ctx.fillRect(0, 0, 300, 400);
    
    // 绘制光晕效果
    ctx.setFillStyle('rgba(255,255,255,0.1)');
    ctx.beginPath();
    ctx.arc(220, 50, 100, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制内容
    ctx.setFillStyle('rgba(255,255,255,0.8)');
    ctx.setFontSize(12);
    ctx.setTextAlign('center');
    ctx.fillText('今日平行身份', 150, 30);
    ctx.setFillStyle('rgba(255,255,255,0.6)');
    ctx.setFontSize(10);
    ctx.fillText(this.data.currentDate, 150, 48);
    
    // 头像
    ctx.setFontSize(50);
    ctx.fillText(this.data.identityCard.avatar, 150, 100);
    
    // 名字
    ctx.setFillStyle('white');
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(this.data.identityCard.name, 150, 140);
    
    // 称号
    ctx.setFillStyle('rgba(255,255,255,0.8)');
    ctx.font = '12px sans-serif';
    ctx.fillText(this.data.identityCard.title, 150, 165);
    
    // 属性面板
    ctx.setFillStyle('rgba(255,255,255,0.1)');
    ctx.fillRect(30, 185, 240, 50);
    
    ctx.setFillStyle('#ffd93d');
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(this.data.identityCard.power.toString(), 90, 215);
    ctx.setFillStyle('rgba(255,255,255,0.7)');
    ctx.font = '10px sans-serif';
    ctx.fillText('能力值', 90, 232);
    
    ctx.setFillStyle('#ffd93d');
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(this.data.identityCard.luck.toString(), 150, 215);
    ctx.setFillStyle('rgba(255,255,255,0.7)');
    ctx.font = '10px sans-serif';
    ctx.fillText('幸运值', 150, 232);
    
    ctx.setFillStyle('#ffd93d');
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(this.data.identityCard.charm.toString(), 210, 215);
    ctx.setFillStyle('rgba(255,255,255,0.7)');
    ctx.font = '10px sans-serif';
    ctx.fillText('魅力值', 210, 232);
    
    // 今日能力
    ctx.setFillStyle('rgba(255,255,255,0.1)');
    ctx.fillRect(30, 250, 240, 60);
    
    ctx.setFillStyle('rgba(255,255,255,0.8)');
    ctx.setFontSize(10);
    ctx.fillText('🌟 今日能力', 150, 270);
    ctx.setFillStyle('white');
    ctx.setFontSize(12);
    ctx.fillText(this.data.identityCard.skill.slice(0, 30), 150, 295);
    
    // 寄语
    ctx.setFillStyle('rgba(255,217,61,0.2)');
    ctx.fillRect(30, 325, 240, 45);
    ctx.setFillStyle('white');
    ctx.setFontSize(12);
    ctx.fillText(this.data.identityCard.message, 150, 350);
    
    // 底部
    ctx.setStrokeStyle('rgba(255,255,255,0.2)');
    ctx.beginPath();
    ctx.moveTo(30, 375);
    ctx.lineTo(270, 375);
    ctx.stroke();
    ctx.setFillStyle('rgba(255,255,255,0.5)');
    ctx.setFontSize(9);
    ctx.fillText('平行世界情绪驿站 · 每日更新', 150, 392);
    
    ctx.draw(false, () => {
      wx.canvasToTempFilePath({
        canvasId: 'identity-card-canvas',
        success: (res) => {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.hideLoading();
              wx.showToast({ title: '已保存到手机相册', icon: 'success' });
            },
            fail: (err) => {
              wx.hideLoading();
              wx.showToast({ title: '保存失败', icon: 'none' });
              console.error(err);
            }
          });
        },
        fail: (err) => {
          wx.hideLoading();
          wx.showToast({ title: '生成图片失败', icon: 'none' });
          console.error(err);
        }
      });
    });
  },

  /**
   * 显示历史身份卡
   */
  showHistoryCard: function(e) {
    const index = e.currentTarget.dataset.index;
    const card = this.data.historyCards[index];
    wx.showModal({
      title: card.name,
      content: `称号：${card.title}\n\n能力：${card.skill}\n\n寄语：${card.message}`,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  /**
   * 格式化日期显示
   */
  formatDate: function(dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  },

  /**
   * 分享功能
   */
  onShareAppMessage: function() {
    const card = this.data.identityCard;
    const title = card ? `我在平行世界获得了新身份：${card.name}` : '平行世界情绪驿站';
    const path = `/pages/identity/identity?id=${card ? card.date : 'default'}`;
    
    return {
      title: title,
      path: path,
      imageUrl: '',
      success: function(res) {
        wx.showToast({ title: '分享成功', icon: 'success' });
      },
      fail: function(res) {
        wx.showToast({ title: '分享失败', icon: 'none' });
      }
    };
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline: function() {
    const card = this.data.identityCard;
    const title = card ? `我在平行世界获得了新身份：${card.name}` : '平行世界情绪驿站';
    
    return {
      title: title,
      query: `id=${card ? card.date : 'default'}`,
      imageUrl: ''
    };
  }
});
