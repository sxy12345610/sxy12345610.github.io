Page({
  /**
   * 页面的初始数据
   */
  data: {
    emotions: [
      { name: '开心', icon: '😊', color: '#84fab0' },
      { name: '难过', icon: '😢', color: '#667eea' },
      { name: '焦虑', icon: '😰', color: '#ffd93d' },
      { name: '平静', icon: '😌', color: '#6bcb77' },
      { name: '兴奋', icon: '🤩', color: '#ff6b6b' },
      { name: '迷茫', icon: '😕', color: '#9b59b6' },
      { name: '愤怒', icon: '😤', color: '#e74c3c' },
      { name: '孤独', icon: '🥺', color: '#3498db' }
    ],
    selectedEmotion: '',
    showCards: false,
    currentCards: [],
    flippedCards: {},
    completedCards: {},
    userMessage: '',
    hasDrawnToday: false,
    floatingMessages: [],
    isNightMode: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.checkTodayDraw();
    this.initFloatingMessages();
    this.loadNightMode();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
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
   * 切换夜间模式
   */
  toggleNightMode: function() {
    const isNightMode = !this.data.isNightMode;
    this.setData({ isNightMode });
    wx.setStorageSync('theme', isNightMode ? 'night' : 'day');

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
   * 检查今日是否已抽卡
   */
  checkTodayDraw: function() {
    const today = new Date().toISOString().split('T')[0];
    const lastDrawDate = wx.getStorageSync('lastDrawDate');
    this.setData({ hasDrawnToday: lastDrawDate === today });
    
    if (this.data.hasDrawnToday) {
      this.loadPreviousCards();
    }
  },

  /**
   * 加载之前的卡片
   */
  loadPreviousCards: function() {
    const cards = wx.getStorageSync('todayCards');
    if (cards) {
      try {
        this.setData({ 
          currentCards: JSON.parse(cards),
          showCards: true,
          selectedEmotion: wx.getStorageSync('lastEmotion') || '开心'
        });
      } catch (e) {
        console.error('加载卡片失败', e);
      }
    }
  },

  /**
   * 选择情绪
   */
  selectEmotion: function(e) {
    const emotion = e.currentTarget.dataset.emotion;
    this.setData({ selectedEmotion: emotion });
  },

  /**
   * 获取情绪对应的颜色
   */
  getEmotionColor: function(emotion) {
    const found = this.data.emotions.find(e => e.name === emotion);
    return found ? found.color : '#667eea';
  },

  /**
   * 获取小行动建议
   */
  getSmallAction: function(emotion) {
    const actions = {
      '开心': '记录今天的美好瞬间',
      '难过': '找朋友聊聊天',
      '焦虑': '做深呼吸平静一下',
      '平静': '享受此刻的宁静',
      '兴奋': '把能量传递给别人',
      '迷茫': '写下你的困惑',
      '愤怒': '做一些运动释放',
      '孤独': '给自己一个拥抱'
    };
    return actions[emotion] || '做一些让自己开心的事';
  },

  /**
   * 获取卡片抽取次数
   */
  getCardDrawCount: function(cardText) {
    const cardCounts = wx.getStorageSync('cardCounts');
    if (!cardCounts) return Math.floor(Math.random() * 100) + 10;
    try {
      const counts = JSON.parse(cardCounts);
      return counts[cardText] ? counts[cardText] : Math.floor(Math.random() * 100) + 10;
    } catch (e) {
      return Math.floor(Math.random() * 100) + 10;
    }
  },

  /**
   * 获取随机故事
   */
  getRandomStories: function(emotion, count) {
    const stories = {
      '开心': [
        { text: '今天和朋友一起去公园散步，阳光正好，微风不燥，心情格外舒畅。', challenge: '记录今天最开心的一件事', backText: '快乐是会传染的，把这份好心情分享给更多人吧！' },
        { text: '收到了期待已久的礼物，拆开包装的那一刻，幸福感爆棚！', challenge: '给送你礼物的人回一个感谢', backText: '感恩之心会让快乐加倍，珍惜每一份温暖' },
        { text: '努力了很久的项目终于完成了，那种成就感真是太棒了！', challenge: '奖励自己一顿美食', backText: '你的努力值得被肯定，继续加油！' }
      ],
      '难过': [
        { text: '今天心情很低落，不知道为什么就是开心不起来。', challenge: '写下让你难过的事', backText: '难过是暂时的，明天又是新的一天' },
        { text: '和朋友吵架了，心里很难受，不知道该怎么办。', challenge: '主动发一条关心的消息', backText: '沟通是桥梁，真诚能化解误会' },
        { text: '考试失利了，感觉自己很没用。', challenge: '分析错题，下次改进', backText: '失败是成功的垫脚石，每一次跌倒都是成长' }
      ],
      '焦虑': [
        { text: '面对即将到来的面试，心里很紧张，担心自己表现不好。', challenge: '为面试做一次模拟练习', backText: '充分准备是消除焦虑的最好方法' },
        { text: '事情太多了，感觉压力好大，喘不过气来。', challenge: '把任务按优先级排序', backText: '一步一步来，你比想象中更强大' },
        { text: '不知道未来会怎样，对前途感到迷茫和焦虑。', challenge: '制定一个短期目标', backText: '未来由你书写，每一步都算数' }
      ],
      '平静': [
        { text: '今天什么特别的事都没发生，但这种平静的感觉也很好。', challenge: '享受一杯茶的时光', backText: '平凡的日子也值得珍惜' },
        { text: '坐在窗边看书，听着雨声，内心格外宁静。', challenge: '记录此刻的感受', backText: '静能生慧，在宁静中寻找力量' },
        { text: '和家人一起吃了顿简单的晚餐，温馨又幸福。', challenge: '陪家人聊聊天', backText: '陪伴是最长情的告白' }
      ],
      '兴奋': [
        { text: '明天要去旅行了，兴奋得睡不着觉！', challenge: '列一个旅行清单', backText: '期待是美好的，享受这段旅程吧' },
        { text: '收到了心仪公司的offer！', challenge: '庆祝一下', backText: '你的努力得到了回报，未来可期' },
        { text: '暗恋的人主动约我看电影，紧张又期待！', challenge: '准备一份小礼物', backText: '勇敢一点，美好的事情即将发生' }
      ],
      '迷茫': [
        { text: '不知道自己想要什么，感觉很迷茫。', challenge: '写下三个你感兴趣的事', backText: '探索是找到方向的第一步' },
        { text: '站在人生的十字路口，不知道该往哪个方向走。', challenge: '和长辈聊一聊', backText: '迷茫是暂时的，相信你的直觉' },
        { text: '感觉自己做什么都提不起劲，缺乏动力。', challenge: '从一件小事开始', backText: '行动是治愈迷茫的良药' }
      ],
      '愤怒': [
        { text: '今天遇到了很生气的事，差点忍不住发脾气。', challenge: '做10次深呼吸', backText: '愤怒会伤害自己，冷静下来再处理' },
        { text: '被别人误解了，心里很委屈也很生气。', challenge: '找机会解释清楚', backText: '沟通比愤怒更有力量' },
        { text: '努力做的事情被否定了，很不甘心。', challenge: '分析原因，下次做得更好', backText: '你的价值不需要别人来定义' }
      ],
      '孤独': [
        { text: '一个人在城市里打拼，有时候会觉得很孤独。', challenge: '给家人打个电话', backText: '你并不孤单，总有人关心你' },
        { text: '周末一个人待在家里，感觉有点寂寞。', challenge: '出门走走，认识新朋友', backText: '主动一点，世界很精彩' },
        { text: '感觉自己和周围的人格格不入。', challenge: '找到你的兴趣圈子', backText: '总有一群人和你志同道合' }
      ]
    };
    
    const emotionStories = stories[emotion] || stories['平静'];
    const shuffled = [...emotionStories].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },

  /**
   * 抽卡
   */
  drawCards: function() {
    if (!this.data.selectedEmotion) {
      wx.showToast({ title: '请先选择心情', icon: 'none' });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const lastDrawDate = wx.getStorageSync('lastDrawDate');
    
    if (lastDrawDate === today) {
      wx.showToast({ title: '今天的卡片已抽取', icon: 'none' });
      return;
    }

    const nickname = wx.getStorageSync('nickname') || '匿名用户';
    
    wx.request({
      url: 'https://your-backend-domain.com/api/getCard',
      data: {
        nickname: encodeURIComponent(nickname),
        emotion: this.data.selectedEmotion
      },
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.cards && res.statusCode === 200) {
          const cards = res.data.cards.slice(0, 3); // 取前3张卡片
          
          const totalCards = parseInt(wx.getStorageSync('totalCards') || '0') + cards.length;
          wx.setStorageSync('totalCards', totalCards.toString());
          wx.setStorageSync('lastDrawDate', today);
          wx.setStorageSync('lastEmotion', this.data.selectedEmotion);
          wx.setStorageSync('todayCards', JSON.stringify(cards));
          
          this.updateCardDrawCounts(cards);

          this.setData({
            currentCards: cards,
            showCards: true,
            flippedCards: {},
            completedCards: {},
            hasDrawnToday: true
          });

          wx.showToast({ title: '抽卡成功！', icon: 'success' });
        } else {
          console.log('获取卡片失败，使用本地卡片');
          this.drawCardsFromLocal();
        }
      },
      fail: (err) => {
        console.log('获取卡片失败，使用本地卡片', err);
        this.drawCardsFromLocal();
      }
    });
  },

  /**
   * 从本地抽卡（备用）
   */
  drawCardsFromLocal: function() {
    const cards = this.getRandomStories(this.data.selectedEmotion, 3);
    
    const today = new Date().toISOString().split('T')[0];
    const totalCards = parseInt(wx.getStorageSync('totalCards') || '0') + 3;
    wx.setStorageSync('totalCards', totalCards.toString());
    wx.setStorageSync('lastDrawDate', today);
    wx.setStorageSync('lastEmotion', this.data.selectedEmotion);
    wx.setStorageSync('todayCards', JSON.stringify(cards));
    
    this.updateCardDrawCounts(cards);

    this.setData({
      currentCards: cards,
      showCards: true,
      flippedCards: {},
      completedCards: {},
      hasDrawnToday: true
    });

    wx.showToast({ title: '抽卡成功！', icon: 'success' });
  },

  /**
   * 更新卡片抽取次数
   */
  updateCardDrawCounts: function(cards) {
    const cardCounts = wx.getStorageSync('cardCounts');
    const counts = cardCounts ? JSON.parse(cardCounts) : {};
    
    cards.forEach(card => {
      counts[card.text] = (counts[card.text] || 0) + 1;
    });
    
    wx.setStorageSync('cardCounts', JSON.stringify(counts));
  },

  /**
   * 翻牌
   */
  flipCard: function(e) {
    const index = e.currentTarget.dataset.index;
    const flippedCards = { ...this.data.flippedCards };
    flippedCards[index] = !flippedCards[index];
    this.setData({ flippedCards });
    
    if (flippedCards[index]) {
      this.createSparkles(index);
    }
  },

  /**
   * 创建闪光效果
   */
  createSparkles: function(index) {
    setTimeout(() => {
    }, 3000);
  },

  /**
   * 完成挑战
   */
  completeChallenge: function(e) {
    const index = e.currentTarget.dataset.index;
    const completedCards = { ...this.data.completedCards };
    
    if (completedCards[index]) {
      wx.showToast({ title: '已完成此挑战', icon: 'none' });
      return;
    }
    
    completedCards[index] = true;
    this.setData({ completedCards });
    
    const completedChallenges = parseInt(wx.getStorageSync('completedChallenges') || '0') + 1;
    wx.setStorageSync('completedChallenges', completedChallenges.toString());
    
    wx.showToast({ title: '🎉 挑战完成！', icon: 'success' });
  },

  /**
   * 更新情绪条
   */
  updateMoodBar: function(e) {
    const value = e.detail.value;
    this.setData({ userMessage: value });
  },

  /**
   * 提交消息
   */
  submitMessage: function() {
    const message = this.data.userMessage.trim();
    if (!message) {
      wx.showToast({ title: '请输入寄语', icon: 'none' });
      return;
    }

    const messages = wx.getStorageSync('userMessages');
    const userMessages = messages ? JSON.parse(messages) : [];
    userMessages.push({
      text: message,
      time: new Date().toISOString()
    });
    wx.setStorageSync('userMessages', JSON.stringify(userMessages));

    const floatingMessages = [
      ...this.data.floatingMessages,
      {
        text: message,
        top: 20 + Math.random() * 40,
        duration: 12 + Math.random() * 6,
        delay: 0
      }
    ];
    this.setData({ floatingMessages, userMessage: '' });

    wx.showToast({ title: '寄语已发送！', icon: 'success' });
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
      '未来可期 🌟'
    ];
    
    const floatingMessages = messages.map((text, index) => ({
      text,
      top: 20 + Math.random() * 40,
      duration: 12 + Math.random() * 6,
      delay: index * 2
    }));
    
    this.setData({ floatingMessages });
  },

  /**
   * 返回首页
   */
  goToHome: function() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  /**
   * 分享功能
   */
  onShareAppMessage: function() {
    const emotion = this.data.selectedEmotion || '开心';
    const title = `${emotion}的平行世界故事`;
    const path = `/pages/cards/cards?emotion=${encodeURIComponent(emotion)}`;
    
    return {
      title: title,
      path: path,
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
    const emotion = this.data.selectedEmotion || '开心';
    const title = `${emotion}的平行世界故事`;
    
    return {
      title: title,
      query: `emotion=${encodeURIComponent(emotion)}`
    };
  }
});