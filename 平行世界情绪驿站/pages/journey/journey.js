Page({
  /**
   * 页面的初始数据
   */
  data: {
    stats: {
      totalCards: 0,
      completedChallenges: 0,
      daysCount: 0,
      identityCards: 0
    },
    todayMood: null,
    isNightMode: false,
    emotionStats: [
      { name: '开心', count: 0, percent: 0, color: '#84fab0' },
      { name: '难过', count: 0, percent: 0, color: '#667eea' },
      { name: '焦虑', count: 0, percent: 0, color: '#ffd93d' },
      { name: '平静', count: 0, percent: 0, color: '#6bcb77' },
      { name: '兴奋', count: 0, percent: 0, color: '#ff6b6b' },
      { name: '迷茫', count: 0, percent: 0, color: '#9b59b6' },
      { name: '愤怒', count: 0, percent: 0, color: '#e74c3c' },
      { name: '孤独', count: 0, percent: 0, color: '#3498db' }
    ],
    achievements: [
      { id: 1, name: '初来乍到', desc: '完成第一次抽卡', icon: '🌱', bgColor: '#84fab0', unlocked: false },
      { id: 2, name: '坚持不懈', desc: '连续打卡7天', icon: '💪', bgColor: '#ffd93d', unlocked: false },
      { id: 3, name: '情绪大师', desc: '体验所有情绪', icon: '🎭', bgColor: '#667eea', unlocked: false },
      { id: 4, name: '挑战者', desc: '完成10个挑战', icon: '🏋️', bgColor: '#ff6b6b', unlocked: false },
      { id: 5, name: '身份收集者', desc: '获得10张身份卡', icon: '🧙', bgColor: '#9b59b6', unlocked: false },
      { id: 6, name: '心语者', desc: '发送50条寄语', icon: '💌', bgColor: '#ffb7b2', unlocked: false }
    ],
    recentRecords: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadStats();
    this.loadTodayMood();
    this.loadEmotionStats();
    this.loadRecentRecords();
    this.checkAchievements();
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
   * 加载统计数据
   */
  loadStats: function() {
    const totalCards = parseInt(wx.getStorageSync('totalCards') || '0');
    const completedChallenges = parseInt(wx.getStorageSync('completedChallenges') || '0');
    const identityCards = this.getIdentityCardsCount();
    const daysCount = this.getDaysCount();
    
    this.setData({
      stats: {
        totalCards,
        completedChallenges,
        identityCards,
        daysCount
      }
    });
  },

  /**
   * 获取身份卡数量
   */
  getIdentityCardsCount: function() {
    const history = wx.getStorageSync('identityHistory');
    if (history) {
      try {
        return JSON.parse(history).length;
      } catch (e) {
        return 0;
      }
    }
    return 0;
  },

  /**
   * 获取连续打卡天数
   */
  getDaysCount: function() {
    const dates = wx.getStorageSync('drawDates');
    if (!dates) return 0;
    
    try {
      const dateArray = JSON.parse(dates);
      if (dateArray.length === 0) return 0;
      
      // 按日期排序
      dateArray.sort((a, b) => new Date(b) - new Date(a));
      
      let count = 1;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < dateArray.length; i++) {
        const checkDate = new Date(dateArray[i]);
        checkDate.setHours(0, 0, 0, 0);
        
        const prevDate = new Date(today);
        prevDate.setDate(prevDate.getDate() - i);
        
        if (checkDate.getTime() !== prevDate.getTime()) {
          break;
        }
        count++;
      }
      
      return count;
    } catch (e) {
      return 0;
    }
  },

  /**
   * 加载今日心情
   */
  loadTodayMood: function() {
    const today = new Date().toISOString().split('T')[0];
    const lastEmotion = wx.getStorageSync('lastEmotion');
    
    if (lastEmotion) {
      const emotions = {
        '开心': { emoji: '😊', text: '今天心情不错！' },
        '难过': { emoji: '😢', text: '今天有些难过' },
        '焦虑': { emoji: '😰', text: '今天有点焦虑' },
        '平静': { emoji: '😌', text: '今天很平静' },
        '兴奋': { emoji: '🤩', text: '今天很兴奋！' },
        '迷茫': { emoji: '😕', text: '今天有些迷茫' },
        '愤怒': { emoji: '😤', text: '今天有点生气' },
        '孤独': { emoji: '🥺', text: '今天感觉孤独' }
      };
      
      this.setData({ todayMood: emotions[lastEmotion] || { emoji: '🧐', text: '今日心情' } });
    }
  },

  /**
   * 加载情绪统计
   */
  loadEmotionStats: function() {
    const emotionCounts = wx.getStorageSync('emotionCounts');
    const stats = [...this.data.emotionStats];
    
    if (emotionCounts) {
      try {
        const counts = JSON.parse(emotionCounts);
        let total = 0;
        
        stats.forEach(stat => {
          stat.count = counts[stat.name] || 0;
          total += stat.count;
        });
        
        stats.forEach(stat => {
          stat.percent = total > 0 ? Math.round((stat.count / total) * 100) : 0;
        });
      } catch (e) {
        console.error('解析情绪统计失败', e);
      }
    }
    
    this.setData({ emotionStats: stats });
  },

  /**
   * 加载近期记录
   */
  loadRecentRecords: function() {
    const records = wx.getStorageSync('activityRecords');
    if (records) {
      try {
        const recent = JSON.parse(records).slice(-10);
        this.setData({ recentRecords: recent });
      } catch (e) {
        console.error('解析记录失败', e);
      }
    }
  },

  /**
   * 检查成就解锁
   */
  checkAchievements: function() {
    const achievements = [...this.data.achievements];
    const { totalCards, completedChallenges, daysCount, identityCards } = this.data.stats;
    
    // 检查每个成就
    achievements.forEach(achievement => {
      switch (achievement.id) {
        case 1: // 初来乍到
          achievement.unlocked = totalCards >= 1;
          break;
        case 2: // 坚持不懈
          achievement.unlocked = daysCount >= 7;
          break;
        case 3: // 情绪大师
          const emotionCounts = wx.getStorageSync('emotionCounts');
          if (emotionCounts) {
            const counts = JSON.parse(emotionCounts);
            achievement.unlocked = Object.keys(counts).length >= 8;
          }
          break;
        case 4: // 挑战者
          achievement.unlocked = completedChallenges >= 10;
          break;
        case 5: // 身份收集者
          achievement.unlocked = identityCards >= 10;
          break;
        case 6: // 心语者
          const messages = wx.getStorageSync('userMessages');
          if (messages) {
            const userMessages = JSON.parse(messages);
            achievement.unlocked = userMessages.length >= 50;
          }
          break;
      }
    });
    
    this.setData({ achievements });
  },

  /**
   * 显示成就详情
   */
  showAchievement: function(e) {
    const id = e.currentTarget.dataset.id;
    const achievement = this.data.achievements.find(a => a.id === parseInt(id));
    
    if (achievement) {
      wx.showModal({
        title: achievement.unlocked ? '🎉 ' + achievement.name : '🔒 ' + achievement.name,
        content: achievement.desc + '\n\n' + (achievement.unlocked ? '已解锁！' : '未解锁'),
        showCancel: false,
        confirmText: '知道了'
      });
    }
  },

  /**
   * 分享旅程
   */
  shareJourney: function() {
    wx.showModal({
      title: '分享旅程',
      content: '您的旅程数据:\n\n' +
        `• 抽取卡片: ${this.data.stats.totalCards}\n` +
        `• 完成挑战: ${this.data.stats.completedChallenges}\n` +
        `• 连续打卡: ${this.data.stats.daysCount}天\n` +
        `• 身份卡片: ${this.data.stats.identityCards}张`,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  /**
   * 格式化时间
   */
  formatTime: function(timeStr) {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return '今天';
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  },

  /**
   * 分享功能
   */
  onShareAppMessage: function() {
    const { totalCards, completedChallenges, daysCount, identityCards } = this.data.stats;
    const title = `我在平行世界情绪驿站获得了${identityCards}张身份卡，完成了${completedChallenges}个挑战！`;
    
    return {
      title: title,
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
    const { totalCards, completedChallenges, daysCount, identityCards } = this.data.stats;
    const title = `我在平行世界情绪驿站获得了${identityCards}张身份卡，连续打卡${daysCount}天！`;
    
    return {
      title: title
    };
  }
});
