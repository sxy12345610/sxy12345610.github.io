Page({
  /**
   * 页面的初始数据
   */
  data: {
    particles: [],
    bottleMessage: '',
    stats: {
      totalCards: 0,
      completedChallenges: 0,
      daysStreak: 0
    },
    dailyMessage: '',
    isNightMode: false,
    floatingMessages: [],
    moodIndex: 75,
    hasCheckedIn: false,
    checkinStreak: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initParticles();
    this.initBottleMessage();
    this.loadStats();
    this.initDailyMessage();
    this.initFloatingMessages();
    this.loadNightMode();
    this.loadMoodIndex();
    this.loadCheckin();
  },

  /**
   * 初始化漂浮粒子
   */
  initParticles: function() {
    const particles = [];
    for (let i = 0; i < 12; i++) {
      particles.push({
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 6 + Math.random() * 4
      });
    }
    this.setData({ particles });
  },

  /**
   * 初始化漂浮瓶子消息
   */
  initBottleMessage: function() {
    const messages = [
      '漂流瓶说：今天也要好好爱自己 💕',
      '有人在平行世界为你加油 ✨',
      '每一个情绪都值得被看见 💫',
      '深呼吸，一切都会好起来 🌿',
      '你的故事正在被倾听 🎧',
      '愿你今夜好眠 🌙',
      '前方有光，继续前行 🌟'
    ];
    const index = Math.floor(Math.random() * messages.length);
    this.setData({ bottleMessage: messages[index] });
  },

  /**
   * 加载统计数据
   */
  loadStats: function() {
    const nickname = wx.getStorageSync('nickname') || '匿名用户';
    
    wx.request({
      url: 'https://your-backend-domain.com/api/getStats',
      data: {
        nickname: encodeURIComponent(nickname)
      },
      method: 'GET',
      success: (res) => {
        if (res.data && res.statusCode === 200) {
          const daysStreak = this.calculateDaysStreak();
          this.setData({
            stats: {
              totalCards: res.data.draws || 0,
              completedChallenges: res.data.completed || 0,
              daysStreak: daysStreak
            }
          });
        } else {
          console.log('获取统计失败，使用本地数据');
          this.loadStatsFromLocal();
        }
      },
      fail: (err) => {
        console.log('获取统计失败，使用本地数据', err);
        this.loadStatsFromLocal();
      }
    });
  },

  /**
   * 从本地存储加载统计数据（备用）
   */
  loadStatsFromLocal: function() {
    const totalCards = parseInt(wx.getStorageSync('totalCards') || '0');
    const completedChallenges = parseInt(wx.getStorageSync('completedChallenges') || '0');
    const daysStreak = this.calculateDaysStreak();
    
    this.setData({
      stats: {
        totalCards,
        completedChallenges,
        daysStreak
      }
    });
  },

  /**
   * 计算连续天数
   */
  calculateDaysStreak: function() {
    const lastDate = wx.getStorageSync('lastDrawDate');
    if (!lastDate) return 0;
    
    const today = new Date();
    const last = new Date(lastDate);
    const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return parseInt(wx.getStorageSync('daysStreak') || '1');
    } else if (diffDays === 1) {
      const streak = parseInt(wx.getStorageSync('daysStreak') || '0') + 1;
      wx.setStorageSync('daysStreak', streak.toString());
      wx.setStorageSync('lastDrawDate', today.toISOString().split('T')[0]);
      return streak;
    } else {
      wx.setStorageSync('daysStreak', '1');
      wx.setStorageSync('lastDrawDate', today.toISOString().split('T')[0]);
      return 1;
    }
  },

  /**
   * 初始化每日治愈语
   */
  initDailyMessage: function() {
    const messages = [
      '今天的你，比昨天更勇敢了 🌟',
      '每一个小进步都值得庆祝 🎉',
      '温柔对待自己，也是一种勇气 💪',
      '相信美好，美好就会到来 🌈',
      '你的存在，本身就是意义 💎',
      '放慢脚步，感受生活的美好 🌸',
      '今天也要给自己一个微笑 😊',
      '困难只是暂时的，你比想象中更强大 💫',
      '愿你被世界温柔以待 💕',
      '每一天都是新的开始 🌄',
      '你的努力终将被看见 ✨',
      '保持初心，方得始终 🎈'
    ];
    const dayOfYear = this.getDayOfYear();
    const index = dayOfYear % messages.length;
    this.setData({ dailyMessage: messages[index] });
  },

  /**
   * 获取一年中的第几天
   */
  getDayOfYear: function() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  },

  /**
   * 初始化漂浮弹幕
   */
  initFloatingMessages: function() {
    const messages = [
      '风雨过后是彩虹 🌈',
      '做自己就好 ✨',
      '相信美好会降临 🌸',
      '你是独一无二的 💫',
      '愿你被温柔以待 💕',
      '每一天都值得期待 🎈',
      '勇敢向前走 👣',
      '未来可期 🌟',
      '加油，你可以的 💪',
      '明天会更好 🌅'
    ];
    
    const floatingMessages = messages.map((text, index) => ({
      text,
      top: 200 + Math.random() * 300,
      duration: 12 + Math.random() * 6,
      delay: index * 1.5
    }));
    
    this.setData({ floatingMessages });
  },

  /**
   * 加载夜间模式状态
   */
  loadNightMode: function() {
    const theme = wx.getStorageSync('theme') || 'day';
    const isNightMode = theme === 'night';
    this.setData({ isNightMode });
    this.updateNightModeUI(isNightMode);
  },

  /**
   * 切换夜间模式
   */
  toggleNightMode: function() {
    const isNightMode = !this.data.isNightMode;
    this.setData({ isNightMode });
    wx.setStorageSync('theme', isNightMode ? 'night' : 'day');
    this.updateNightModeUI(isNightMode);
  },

  /**
   * 更新夜间模式UI
   */
  updateNightModeUI: function(isNightMode) {
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
   * 加载情绪指数
   */
  loadMoodIndex: function() {
    const today = new Date().toISOString().split('T')[0];
    const savedIndex = wx.getStorageSync('moodIndex_' + today);
    if (savedIndex) {
      this.setData({ moodIndex: parseInt(savedIndex) });
    } else {
      // 根据时间和随机因素生成情绪指数
      const hour = new Date().getHours();
      let baseIndex = 70;
      
      // 根据时间段调整基础指数
      if (hour >= 6 && hour < 9) {
        baseIndex = 75; // 早晨
      } else if (hour >= 9 && hour < 12) {
        baseIndex = 80; // 上午
      } else if (hour >= 12 && hour < 14) {
        baseIndex = 75; // 中午
      } else if (hour >= 14 && hour < 18) {
        baseIndex = 78; // 下午
      } else if (hour >= 18 && hour < 22) {
        baseIndex = 72; // 晚上
      } else {
        baseIndex = 65; // 深夜
      }
      
      // 添加随机波动
      const randomOffset = Math.floor(Math.random() * 11) - 5;
      const moodIndex = Math.min(100, Math.max(30, baseIndex + randomOffset));
      
      this.setData({ moodIndex });
      wx.setStorageSync('moodIndex_' + today, moodIndex.toString());
    }
  },

  /**
   * 获取情绪指数描述
   */
  getMoodDescription: function(index) {
    if (index >= 90) return '🌟 情绪极佳，继续保持！';
    if (index >= 80) return '😊 心情不错，充满活力';
    if (index >= 70) return '🌤️ 状态平稳，一切安好';
    if (index >= 60) return '🌥️ 略有波动，需要关注';
    if (index >= 50) return '☁️ 情绪低落，给自己一点时间';
    return '🌧️ 需要关爱，记得照顾好自己';
  },

  /**
   * 加载签到状态
   */
  loadCheckin: function() {
    const today = new Date().toISOString().split('T')[0];
    const lastCheckin = wx.getStorageSync('lastCheckin');
    const checkinStreak = parseInt(wx.getStorageSync('checkinStreak') || '0');
    
    const hasCheckedIn = lastCheckin === today;
    
    this.setData({ hasCheckedIn, checkinStreak });
  },

  /**
   * 执行签到
   */
  checkin: function() {
    if (this.data.hasCheckedIn) {
      wx.showToast({ title: '今日已签到', icon: 'none' });
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const lastCheckin = wx.getStorageSync('lastCheckin');
    let checkinStreak = parseInt(wx.getStorageSync('checkinStreak') || '0');
    
    const lastDate = lastCheckin ? new Date(lastCheckin) : null;
    const todayDate = new Date(today);
    
    if (lastDate) {
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        checkinStreak++;
      } else if (diffDays > 1) {
        checkinStreak = 1;
      }
    } else {
      checkinStreak = 1;
    }
    
    wx.setStorageSync('lastCheckin', today);
    wx.setStorageSync('checkinStreak', checkinStreak.toString());
    
    this.setData({ hasCheckedIn: true, checkinStreak });
    
    wx.showToast({ 
      title: `签到成功！${checkinStreak}天连续`, 
      icon: 'success' 
    });
  },

  /**
   * 打开AI聊天
   */
  openAIChat: function() {
    wx.showModal({
      title: '🤖 温柔机器人',
      content: '温柔机器人正在开发中，即将与你见面！\n\n在平行世界里，你并不孤单，所有的情绪都值得被倾听。',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  /**
   * 跳转到抽卡页面
   */
  goToCardsPage: function() {
    wx.switchTab({
      url: '/pages/cards/cards'
    });
  },

  /**
   * 跳转到身份卡页面
   */
  goToIdentityPage: function() {
    wx.switchTab({
      url: '/pages/identity/identity'
    });
  },

  /**
   * 跳转到旅程页面
   */
  goToJourneyPage: function() {
    wx.switchTab({
      url: '/pages/journey/journey'
    });
  },

  /**
   * 页面显示时刷新数据
   */
  onShow: function() {
    this.loadStats();
    this.loadCheckin();
  },

  /**
   * 分享功能
   */
  onShareAppMessage: function() {
    return {
      title: '平行世界情绪驿站 - 每一种情绪都是平行世界的入口',
      path: '/pages/index/index',
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
    return {
      title: '平行世界情绪驿站 - 探索你的平行身份'
    };
  }
});
