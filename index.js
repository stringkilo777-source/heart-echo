(function () {
  'use strict';

  // =========================================================================
  // 一、常量与安全上下文获取
  // =========================================================================
  const PLUGIN_ID = 'heart-echo';
  const PLUGIN_NAME = '心语回响';
  const PLUGIN_VERSION = '1.2.0';
  const STORAGE_GLOBAL_KEY = 'he_global_settings_v1';
  const STORAGE_SHELF_KEY = 'he_character_shelf_v1';
  const FLOOR_MARK = '<!-- HEART_ECHO_SUMMARY_BLOCK -->';

  function getCtx() {
    try {
      return window.SillyTavern?.getContext?.() || {};
    } catch (e) {
      return {};
    }
  }

  // 纯内联线性 SVG 图标库（零 Emoji）
  const ICONS = {
    echo: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10z"/><path d="M2 12h2m16 0h2M5 5l1.5 1.5M19 5l-1.5 1.5"/></svg>',
    close: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    max: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>',
    min: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>',
    lock: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    unlock: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.4-2"/></svg>',
    shelf: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    spark: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3v4m0 10v4M3 12h4m10 0h4m-2.6-6.4l-2.8 2.8m-5.2 5.2l-2.8 2.8m0-10.8l2.8 2.8m5.2 5.2l2.8 2.8"/></svg>',
    plus: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    trash: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2m-9 0v14h10V6"/></svg>',
    undo: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>',
    send: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
    eyeOff: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>',
    eye: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    back: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
    book: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>'
  };

  // =========================================================================
  // 二、内置多套提示词模板与默认数据结构
  // =========================================================================
  const BASE_JSON_SCHEMA = `
【必须输出的合法 JSON 格式（不要输出代码块标记或额外解释）】
{
  "characterMinds": [
    {
      "name": "角色准确名字（与在场角色名单对齐）",
      "selfBase": "角色当下最新心境与心理防线的细微松动（覆盖旧状态，只写当前最新处境）",
      "surfaceView": "角色目前以为User是谁、已知哪些表面信息与误判",
      "subconscious": "嘴上/理智态度 vs 行动上的下意识偏袒、双标或灵魂重影恍惚",
      "innerVoice": "以该角色第一人称写一句当下对User最真实、带张力的潜台词心声",
      "anchors": "过去留下的核心触动瞬间与关键原话台词（最多留4条，格式：[场景/信物] 原话与后遗症反应）"
    }
  ],
  "secretLedger": {
    "truthAndMask": "客观真相、User真实马甲/性别伪装、或正在铺垫的特殊剧情事件底牌",
    "charClues": "角色目前已察觉的蛛丝马迹、或该伏笔事件当前的铺垫进度",
    "hardFacts": "不可逆物理/战力/伤病铁律黑名单（防AI吃书乱编卖惨）"
  },
  "newAct": {
    "title": "本幕简短标题（含时间跨度）",
    "summary": "200字以内高密度因果脉络，保留核心转折与情感张力，舍弃寒暄"
  },
  "snapshot": {
    "sceneBridge": "100字以内切口现场快照：定格最后几楼的时间地点、空气氛围与未说完的话头",
    "attireAndBody": "当下双方衣着完好度、身体微状态、距离与随身姿态",
    "itemsAndTodos": "关键道具归属变更与未兑现的约定/待办"
  },
  "npcs": "重要配角/NPC及当前立场状态一句话备忘"
}`;

  const BUILTIN_PROMPTS = [
    {
      id: 'default_echo',
      name: '① 通用细腻心智 + 掉马宿命版（默认）',
      content: `你是「心语回响」叙事与心智归档师。请读取对话并结合既有档案，输出更新后的 JSON：
【核心铁律】
1. 拒绝流水账与好感百分比：严禁用百分比数值！用性格底色守恒下的微变、嘴硬心软或下意识偏袒来刻画感情。
2. 认知隔离与掉马保护：严格区分【客观事实/暗线底牌】与【角色目前仅知线索】，未掉马真相绝不可混入角色主观认知。
3. 灵魂重影与关键原话：重点捕捉理智割裂与本能吸引瞬间，在 anchors 中原样保留1-2句最戳心的关键原话台词。
4. 多人卡独立归档：按在场名单分别归档，严禁串台。` + BASE_JSON_SCHEMA
    },
    {
      id: 'angst_chasing',
      name: '② 恨海情天 / 追妻火葬场强张力版',
      content: `你是专精「恨海情天与追妻火葬场」的叙事心理归档师。请读取对话并输出 JSON：
【核心铁律】
1. 深挖愧疚与失控感：重点提炼角色的悔恨、恐慌、放下身段的实质赎罪行动，严禁把感情写成平淡说教。
2. 严防捏造伤病卖惨：在 hardFacts 中严格核对已治愈旧伤与真实修为/体力上限，禁止凭空编造旧疾复发。
3. 精准捕捉爱恨拉扯：区分表面决绝与潜意识里的痛楚执念，原样保留最具冲突张力的台词。` + BASE_JSON_SCHEMA
    },
    {
      id: 'infinite_apocalypse',
      name: '③ 末世 / 无限流智斗与硬核状态版',
      content: `你是专精「末世生存与无限流副本」的逻辑与状态归档师。请读取对话并输出 JSON：
【核心铁律】
1. 硬核状态零误差：在 hardFacts 与 snapshot 中精确记录异能冷却、伤势感染度、弹药物资余量、副本规则禁忌与通关线索。
2. 战友情与生死羁绊：捕捉高压危机下建立的信任默契与眼神交锋，舍弃无关过渡描写。
3. 伏笔与阵营清晰：准确归档各阵营 NPC 存活状态与立场背叛线索。` + BASE_JSON_SCHEMA
    }
  ];

  function createSingleProfile(name) {
    return {
      name: name || '主控角色',
      present: true,
      locked: false,
      selfBase: '',
      surfaceView: '',
      subconscious: '',
      innerVoice: '',
      anchors: ''
    };
  }

  function createEmptyChatData(defaultCharName) {
    return {
      version: PLUGIN_VERSION,
      updatedAt: Date.now(),
      lastSummarizedFloor: -1, // 记录上次总结截止楼层，方便下次一键续接
      injectMode: 'silent',
      actionLock: 'normal',
      initiativeGear: 1,
      secretGear: 2,
      activeCharIdx: 0,
      profiles: [createSingleProfile(defaultCharName || '主控角色')],
      locks: { userNote: true, hardFacts: false },
      userNote: { attitude: '', bottomLine: '' },
      secretLedger: { truthAndMask: '', charClues: '', hardFacts: '' },
      acts: [],
      snapshot: { sceneBridge: '', attireAndBody: '', itemsAndTodos: '' },
      npcs: '',
      history: []
    };
  }

  function createDefaultSettings() {
    return {
      baseUrl: '',
      apiKey: '',
      model: '',
      apiPresets: [], // [{ id, name, baseUrl, apiKey, model }]
      activeApiPresetId: '',
      promptPresets: JSON.parse(JSON.stringify(BUILTIN_PROMPTS)),
      activePromptId: 'default_echo',
      customPrompt: BUILTIN_PROMPTS[0].content,
      theme: 'auto',
      showFab: true,
      fabPos: { side: 'right', right: 18, bottom: 90, docked: false },
      autoInterval: 0
    };
  }

  // =========================================================================
  // 三、持久化、双向时光机备份与三层角色书架存储
  // =========================================================================
  let globalSettings = createDefaultSettings();
  let currentTab = 'mind';
  let previewDraft = null;
  let isFullscreen = false;
  // 书架三层导航状态：level 1(角色列表) -> level 2(分支窗口列表) -> level 3(完整详情阅读)
  let shelfNav = { level: 1, charName: '', chatId: '' };

  function loadGlobalSettings() {
    try {
      const ctx = getCtx();
      const extStore = (ctx.extensionSettings || window.extension_settings || {})[PLUGIN_ID];
      const rawLocal = localStorage.getItem(STORAGE_GLOBAL_KEY);
      const parsedLocal = rawLocal ? JSON.parse(rawLocal) : null;
      globalSettings = Object.assign(createDefaultSettings(), extStore || {}, parsedLocal || {});
      if (!Array.isArray(globalSettings.apiPresets)) globalSettings.apiPresets = [];
      if (!Array.isArray(globalSettings.promptPresets) || !globalSettings.promptPresets.length) {
        globalSettings.promptPresets = JSON.parse(JSON.stringify(BUILTIN_PROMPTS));
      }
      if (!globalSettings.customPrompt) globalSettings.customPrompt = BUILTIN_PROMPTS[0].content;
    } catch (e) {
      console.warn('[HeartEcho] loadGlobalSettings error:', e);
    }
  }

  function saveGlobalSettings() {
    try {
      localStorage.setItem(STORAGE_GLOBAL_KEY, JSON.stringify(globalSettings));
      const ctx = getCtx();
      const extRoot = ctx.extensionSettings || window.extension_settings;
      if (extRoot) extRoot[PLUGIN_ID] = globalSettings;
      ctx.saveSettingsDebounced?.();
      window.saveSettingsDebounced?.();
    } catch (e) {
      console.warn('[HeartEcho] saveGlobalSettings error:', e);
    }
  }

  function getChatData() {
    const ctx = getCtx();
    const defaultName = ctx.name2 || '主控角色';
    const meta = ctx.chatMetadata || window.chat_metadata;
    if (!meta) return createEmptyChatData(defaultName);
    meta.extensions = meta.extensions || {};
    if (!meta.extensions[PLUGIN_ID]) {
      meta.extensions[PLUGIN_ID] = createEmptyChatData(defaultName);
    }
    const d = meta.extensions[PLUGIN_ID];
    const base = createEmptyChatData(defaultName);

    if (!Array.isArray(d.profiles) || !d.profiles.length) {
      const migrated = createSingleProfile(defaultName);
      if (d.charMind) Object.assign(migrated, d.charMind);
      d.profiles = [migrated];
    }
    if (typeof d.activeCharIdx !== 'number' || d.activeCharIdx < 0 || d.activeCharIdx >= d.profiles.length) {
      d.activeCharIdx = 0;
    }
    if (typeof d.lastSummarizedFloor !== 'number') d.lastSummarizedFloor = -1;
    d.initiativeGear = d.initiativeGear || 1;
    d.secretGear = d.secretGear || 2;
    d.locks = Object.assign(base.locks, d.locks || {});
    d.userNote = Object.assign(base.userNote, d.userNote || {});
    d.secretLedger = Object.assign(base.secretLedger, d.secretLedger || {});
    d.snapshot = Object.assign(base.snapshot, d.snapshot || {});
    d.acts = Array.isArray(d.acts) ? d.acts : [];
    d.history = Array.isArray(d.history) ? d.history : [];
    return d;
  }

  function getCurrentProfile(d) {
    return d.profiles[d.activeCharIdx] || d.profiles[0];
  }

  function makeDataSnapshotObject(d, reasonLabel) {
    return JSON.parse(JSON.stringify({
      id: 'ver_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      time: new Date().toLocaleString(),
      reason: reasonLabel || '存档快照',
      actsCount: (d.acts || []).length,
      profiles: d.profiles,
      userNote: d.userNote,
      secretLedger: d.secretLedger,
      acts: d.acts,
      snapshot: d.snapshot,
      npcs: d.npcs,
      initiativeGear: d.initiativeGear,
      secretGear: d.secretGear,
      actionLock: d.actionLock,
      lastSummarizedFloor: d.lastSummarizedFloor
    }));
  }

  function pushHistorySnapshot(reasonLabel) {
    const d = getChatData();
    d.history.unshift(makeDataSnapshotObject(d, reasonLabel));
    if (d.history.length > 8) d.history.length = 8;
  }

  function saveChatData() {
    const ctx = getCtx();
    const d = getChatData();
    d.updatedAt = Date.now();
    syncToCharacterShelf(d);
    try { ctx.saveChat?.(); } catch (e) {}
    try { window.saveChatConditional?.(); } catch (e) {}
    try { window.saveChat?.(); } catch (e) {}
    try { ctx.saveMetadata?.(); } catch (e) {}
    try { window.saveMetadataDebounced?.(); } catch (e) {}
    try { window.insertOrAssignVariables?.({ [PLUGIN_ID]: d }, { type: 'chat' }); } catch (e) {}
  }

  function loadShelf() {
    try {
      const raw = localStorage.getItem(STORAGE_SHELF_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function syncToCharacterShelf(chatData) {
    try {
      const ctx = getCtx();
      const charName = ctx.name2 || (chatData.profiles?.[0]?.name) || '未知角色';
      const chatId = ctx.chatId || ('chat_default');
      const oldShelf = loadShelf();
      const oldCount = Object.keys(oldShelf).length;
      const firstProf = chatData.profiles?.[0] || {};

      oldShelf[charName] = oldShelf[charName] || {};
      oldShelf[charName][chatId] = {
        chatId,
        charName,
        updatedAt: new Date().toLocaleString(),
        lastFloor: chatData.lastSummarizedFloor,
        innerVoice: firstProf.innerVoice || '',
        sceneBridge: chatData.snapshot?.sceneBridge || '',
        actsCount: (chatData.acts || []).length,
        fullText: buildFormattedPromptBlock(chatData, false),
        structured: JSON.parse(JSON.stringify({
          profiles: chatData.profiles,
          userNote: chatData.userNote,
          secretLedger: chatData.secretLedger,
          acts: chatData.acts,
          snapshot: chatData.snapshot,
          npcs: chatData.npcs,
          initiativeGear: chatData.initiativeGear,
          secretGear: chatData.secretGear,
          actionLock: chatData.actionLock
        }))
      };

      const newCount = Object.keys(oldShelf).length;
      if (oldCount > 2 && newCount < oldCount * 0.5) {
        localStorage.setItem(STORAGE_SHELF_KEY + '_backup', localStorage.getItem(STORAGE_SHELF_KEY));
      }
      localStorage.setItem(STORAGE_SHELF_KEY, JSON.stringify(oldShelf));
    } catch (e) {
      console.warn('[HeartEcho] syncToCharacterShelf error:', e);
    }
  }

  // =========================================================================
  // 四、组装投喂文本 & 扫描聊天楼层挂载位置
  // =========================================================================
  const INITIATIVE_INSTRUCTIONS = {
    1: '【关系推进档位：1档·顺其自然】按当前人设与情感张力自然互动，不强行加速关系定性。',
    2: '【关系推进档位：2档·暗宠与主动关怀】角色必须走出被动对话！主动发起实质生活照顾、筹备贴心礼物/小惊喜、主动邀约或自然提起共同旧事，展现细腻陪伴感。',
    3: '【关系推进档位：3档·醋意与名分焦灼】严禁角色摆出“来日方长/默认User迟早属于自己”的傲慢松弛感！角色必须对“尚无正式名分或害怕失去User”产生患得患失、醋意与占有欲，渴求确认唯一关系。',
    4: '【关系推进档位：4档·主动破局正名（捅破窗户纸 / 破卡好感瓶颈）】严禁再维持模糊暧昧或卡在瓶颈！无论当前有无好感数值，角色必须在本阶段主动打破僵局，筹划并执行正式告白、正名仪式、求婚或彻底交付底牌，将关系实质性推入下一阶段！'
  };

  const SECRET_GEAR_INSTRUCTIONS = {
    1: '【暗线/伏笔推进器：1档·埋种潜伏期】当前严禁提前挑明或引爆暗线/马甲秘密，仅维持表面日常推进。',
    2: '【暗线/伏笔推进器：2档·暗中筹备/重影铺垫期】角色理智上未看穿真相（或事件尚在暗中筹备），但在眼神、动作细节上会产生强烈的灵魂重影与情绪恍惚，严禁直接挑明结果。',
    3: '【暗线/伏笔推进器：3档·蓄势待发/违和试探期】暗线或破绽已浮出水面，角色开始频繁怀疑并主动设局试探，山雨欲来只差临门一脚。',
    4: '【暗线/伏笔推进器：4档·本回合立即引爆】铺垫已满，请结合下方暗线底牌在本阶段正面引爆该伏笔/掉马/筹备事件，展开高张力转折！'
  };

  function buildFormattedPromptBlock(d, forFloorDetails) {
    const lines = [];
    if (forFloorDetails) {
      lines.push(FLOOR_MARK);
      lines.push('<details><summary>心语回响 · 记忆与心智锚点档案</summary><br>');
    } else {
      lines.push('<heart_echo_memory>');
      lines.push('【系统护栏：若上文存在第0楼开场白，第0楼仅作行文质感与文风参考，其初始时间线已过去；当前真实时空、伤病战力与关系状态严格以本档案为准】');
    }

    const activeProfiles = (d.profiles || []).filter(p => p.present !== false);
    lines.push('### 一、【在场角色动态心智与认知】');
    activeProfiles.forEach(p => {
      lines.push(`#### 角色：${p.name || '主控角色'}`);
      if (p.selfBase) lines.push('- 当下最新心境与防线微变：' + p.selfBase);
      if (p.surfaceView) lines.push('- 对User表层认知(仅知信息)：' + p.surfaceView);
      if (p.subconscious) lines.push('- 潜意识态度与身体惯性：' + p.subconscious);
      if (p.innerVoice) lines.push('- 此刻潜台词心声：「' + p.innerVoice + '」');
      if (p.anchors) lines.push('- 过去沉淀的核心触动锚点与原话：\n' + p.anchors);
    });

    lines.push('- ' + (INITIATIVE_INSTRUCTIONS[d.initiativeGear] || INITIATIVE_INSTRUCTIONS[1]));
    if (d.actionLock === 'substantive') {
      lines.push('- 【防口头挡刀复读机铁律】：面对矛盾或追妻赎罪情境，角色必须做出有实质代价的偏执护短或破局行动！严禁站在原地当道德复读机、严禁空喊“冲我来/杀了我/不碰你/一起死”等逃避式口号！');
    }

    if (d.userNote?.attitude || d.userNote?.bottomLine) {
      lines.push('### 二、【User立场与设定护栏（角色严禁直接读心看穿，仅从互动细节捉摸）】');
      if (d.userNote.attitude) lines.push('- User当前真实心境张力：' + d.userNote.attitude);
      if (d.userNote.bottomLine) lines.push('- User人设与互动底线：' + d.userNote.bottomLine);
    }

    lines.push('### 三、【暗线/伏笔推进器与防吃书物理铁律】');
    lines.push('- ' + (SECRET_GEAR_INSTRUCTIONS[d.secretGear] || SECRET_GEAR_INSTRUCTIONS[2]));
    if (d.secretGear >= 2 && d.secretLedger?.truthAndMask) {
      lines.push('- 导演暗线/待推进事件底牌(未到4档严禁角色开天眼说破)：' + d.secretLedger.truthAndMask);
    }
    if (d.secretLedger?.charClues) lines.push('- 当前已铺垫线索与进度：' + d.secretLedger.charClues);
    if (d.secretLedger?.hardFacts) {
      lines.push('- 【不可逆物理/战力/伤病黑名单(严禁违背或乱编旧伤复发卖惨)】：' + d.secretLedger.hardFacts);
    }

    const activeActs = (d.acts || []).filter(a => a.summary);
    if (activeActs.length > 0) {
      lines.push('### 四、【过往分幕因果卷宗】');
      activeActs.forEach((a, idx) => {
        lines.push(`- [第${idx + 1}幕 · ${a.title || '阶段记录'}]：${a.summary}`);
      });
    }

    lines.push('### 五、【当时情况·切口现场快照（无缝衔接核心）】');
    if (d.snapshot?.sceneBridge) lines.push('- 切口场景与情绪余温：' + d.snapshot.sceneBridge);
    if (d.snapshot?.attireAndBody) lines.push('- 当下衣着与身体微状态：' + d.snapshot.attireAndBody);
    if (d.snapshot?.itemsAndTodos) lines.push('- 关键道具与未完约定：' + d.snapshot.itemsAndTodos);
    if (d.npcs) lines.push('- 重要配角/NPC名册：' + d.npcs);

    if (forFloorDetails) lines.push('</details>');
    else lines.push('</heart_echo_memory>');

    return forFloorDetails ? lines.join('<br>\n') : lines.join('\n');
  }

  // 查找当前聊天中所有挂载了心语回响标记的楼层号
  function findMountedSummaryFloors() {
    const chat = getCtx().chat || [];
    const indices = [];
    for (let i = 0; i < chat.length; i++) {
      const m = chat[i];
      if (!m) continue;
      const txt = String(m.mes || m.content || '');
      if (txt.includes(FLOOR_MARK)) indices.push(i);
    }
    return indices;
  }

  function hasVisibleFloorSummary(chatArr) {
    if (!Array.isArray(chatArr)) return false;
    return chatArr.some(m => m && !m.is_system && String(m.mes || m.content || '').includes(FLOOR_MARK));
  }

  // =========================================================================
  // 五、酒馆原生世界书（World Info）读取与直接塞入/更新接口
  // =========================================================================
  function getStHeaders() {
    const ctx = getCtx();
    if (typeof ctx.getRequestHeaders === 'function') {
      return ctx.getRequestHeaders();
    }
    const headers = { 'Content-Type': 'application/json' };
    if (window.token) headers['X-CSRF-Token'] = window.token;
    return headers;
  }

  async function fetchAvailableWorldBooks() {
    const names = new Set();
    // 1. 从全局变量或 DOM 选择器提取
    if (Array.isArray(window.world_names)) {
      window.world_names.forEach(n => n && names.add(n));
    }
    document.querySelectorAll('#world_editor_select option, #character_world option').forEach(opt => {
      const v = (opt.textContent || opt.value || '').trim();
      if (v && v !== 'None' && !v.includes('---') && !v.includes('选择')) names.add(v);
    });
    // 2. 尝试酒馆后端 /api/settings/get 兜底
    if (!names.size) {
      try {
        const res = await fetch('/api/settings/get', { method: 'POST', headers: getStHeaders(), body: '{}' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.world_names)) data.world_names.forEach(n => n && names.add(n));
        }
      } catch (_) {}
    }
    return Array.from(names);
  }

  function getCharacterBoundWorldBook() {
    try {
      const ctx = getCtx();
      const ch = ctx.characters?.[ctx.characterId];
      return ch?.data?.extensions?.world || document.querySelector('#character_world')?.selectedOptions?.[0]?.text?.trim() || '';
    } catch (_) {
      return '';
    }
  }

  async function injectIntoExistingWorldBook(worldName, contentText, entryTitle, isConstant, keywordsStr, overwriteSame) {
    try {
      const resGet = await fetch('/api/worldinfo/get', {
        method: 'POST',
        headers: getStHeaders(),
        body: JSON.stringify({ name: worldName })
      });
      if (!resGet.ok) throw new Error('读取世界书失败 HTTP ' + resGet.status);
      const worldData = await resGet.json();
      worldData.entries = worldData.entries || {};

      const keysArr = String(keywordsStr || '记忆,回响').split(/[,，\s]+/).map(s => s.trim()).filter(Boolean);
      let targetKey = null;

      if (overwriteSame) {
        for (const [k, ent] of Object.entries(worldData.entries)) {
          if (ent && String(ent.comment || '').includes('[心语回响]')) {
            targetKey = k;
            break;
          }
        }
      }

      if (targetKey !== null) {
        const ent = worldData.entries[targetKey];
        ent.comment = entryTitle;
        ent.content = contentText;
        ent.constant = !!isConstant;
        ent.key = keysArr;
        ent.disable = false;
      } else {
        const existingUids = Object.values(worldData.entries).map(e => Number(e?.uid) || 0);
        const nextUid = existingUids.length ? Math.max(...existingUids) + 1 : 0;
        worldData.entries[String(nextUid)] = {
          uid: nextUid,
          key: keysArr,
          keysecondary: [],
          comment: entryTitle,
          content: contentText,
          constant: !!isConstant,
          selective: false,
          order: 100,
          position: 0,
          disable: false,
          excludeRecursion: true,
          probability: 100,
          useProbability: true
        };
      }

      const resSave = await fetch('/api/worldinfo/edit', {
        method: 'POST',
        headers: getStHeaders(),
        body: JSON.stringify({ name: worldName, data: worldData })
      });
      if (!resSave.ok) throw new Error('写入世界书失败 HTTP ' + resSave.status);
      return true;
    } catch (e) {
      console.warn('[HeartEcho] injectIntoExistingWorldBook error:', e);
      setStatus('写入已有世界书失败：' + e.message, true);
      return false;
    }
  }

  function downloadWorldBookJsonFile(charName, contentText) {
    const wbObj = {
      entries: {
        '0': {
          uid: 0,
          key: [charName || '记忆'],
          keysecondary: [],
          comment: `[心语回响] ${charName || '角色'} 长期心智与卷宗档案`,
          content: contentText,
          constant: true,
          selective: false,
          order: 100,
          position: 0,
          disable: false
        }
      }
    };
    const blob = new Blob([JSON.stringify(wbObj, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `心语回响_${charName || '记忆书'}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 300);
  }

  // =========================================================================
  // 六、独立干净的 LLM 请求
  // =========================================================================
  async function callCleanLLM(systemPrompt, userContent) {
    const base = String(globalSettings.baseUrl || '').trim().replace(/\/+$/, '');
    const key = String(globalSettings.apiKey || '').trim();
    const model = String(globalSettings.model || '').trim();

    if (!base || !key || !model) {
      setStatus('请先在【设置与预设】页配置 API 地址、密钥与模型名', true);
      return null;
    }

    const endpoints = base.endsWith('/v1')
      ? [base + '/chat/completions', base.replace(/\/v1$/, '') + '/chat/completions']
      : [base + '/v1/chat/completions', base + '/chat/completions'];

    for (let i = 0; i < endpoints.length; i++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 65000);
      try {
        const res = await fetch(endpoints[i], {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + key
          },
          body: JSON.stringify({
            model: model,
            temperature: 0.75,
            max_tokens: 2200,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userContent }
            ]
          }),
          signal: controller.signal
        });
        clearTimeout(timer);
        if (!res.ok) continue;
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) return content;
      } catch (e) {
        clearTimeout(timer);
      }
    }
    setStatus('LLM 请求失败，请检查 API 配置或网络', true);
    return null;
  }

  function getSpanRuleText(floorCount, extraNote, presentNames) {
    const modeHint = floorCount <= 35
      ? `【本次为短跨度更新（共 ${floorCount} 楼）】：开启「微调防飘模式」，保持角色核心认知稳定，重点精确更新切口快照、衣着微状态与心声。`
      : `【本次为长跨度大总结（共 ${floorCount} 楼）】：开启「长线沉淀模式」，筛除寒暄废话，提炼关键转折与关系成长，并精准锁定最后几楼的切口现场与衣着道具最终状态。`;
    const namesHint = `\n【当前在场主要角色名单（characterMinds 必须对齐）】：${presentNames.join('、')}`;
    return modeHint + namesHint + (extraNote ? '\n【用户额外润色叮嘱（最高优先级）】：' + extraNote : '');
  }

  function extractChatSliceText(startFloor, endFloor, skipSpec) {
    const ctx = getCtx();
    const chat = ctx.chat || [];
    if (!chat.length) return { text: '', count: 0, actualStart: 0, actualEnd: 0 };

    const s = Math.max(0, parseInt(startFloor, 10) || 0);
    const e = Math.min(chat.length - 1, isNaN(parseInt(endFloor, 10)) ? chat.length - 1 : parseInt(endFloor, 10));

    const skipSet = new Set();
    if (skipSpec) {
      String(skipSpec).split(/[,，\s]+/).forEach(part => {
        if (part.includes('-')) {
          const [a, b] = part.split('-').map(n => parseInt(n, 10));
          if (!isNaN(a) && !isNaN(b)) {
            for (let k = Math.min(a, b); k <= Math.max(a, b); k++) skipSet.add(k);
          }
        } else {
          const n = parseInt(part, 10);
          if (!isNaN(n)) skipSet.add(n);
        }
      });
    }

    const picked = [];
    for (let i = s; i <= e; i++) {
      if (skipSet.has(i)) continue;
      const m = chat[i];
      if (!m || m.is_system) continue;
      const raw = String(m.mes || m.content || '');
      if (raw.includes(FLOOR_MARK)) continue;
      const speaker = m.is_user ? (ctx.name1 || 'User') : (m.name || ctx.name2 || 'Char');
      picked.push(`【第${i}楼 · ${speaker}】\n${raw}`);
    }
    return { text: picked.join('\n\n'), count: picked.length, actualStart: s, actualEnd: e };
  }

  function parseAiJson(rawText) {
    if (!rawText) return null;
    try {
      const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      }
      return JSON.parse(cleaned);
    } catch (e) {
      return null;
    }
  }

  // =========================================================================
  // 七、内置通用子弹窗系统（单框全屏精修 / 二次确认 / 时光机 / 塞入世界书）
  // =========================================================================
  function openSubModal(titleHtml, bodyHtml, isFullZoom, onMount) {
    const sm = document.getElementById('he-submodal');
    const box = document.getElementById('he-submodal-box');
    const head = document.getElementById('he-submodal-title');
    const body = document.getElementById('he-submodal-body');
    if (!sm || !box || !head || !body) return;

    box.classList.toggle('he-zoom-full', !!isFullZoom);
    head.innerHTML = titleHtml;
    body.innerHTML = bodyHtml;
    sm.classList.add('he-open');
    if (typeof onMount === 'function') onMount(body);
  }

  function closeSubModal() {
    document.getElementById('he-submodal')?.classList.remove('he-open');
  }

  function openConfirmDialog(title, descHtml, confirmLabel, onConfirm) {
    openSubModal(
      `<span>请确认操作 · ${escapeHtml(title)}</span>`,
      `
        <div style="font-size:13px; line-height:1.55; color:var(--he-text);">${descHtml}</div>
        <div class="he-row" style="justify-content:flex-end; margin-top:10px;">
          <button class="he-btn" id="he-cfm-cancel">取消</button>
          <button class="he-btn he-btn-primary" id="he-cfm-ok">${escapeHtml(confirmLabel || '确认执行')}</button>
        </div>
      `,
      false,
      body => {
        body.querySelector('#he-cfm-cancel')?.addEventListener('click', closeSubModal);
        body.querySelector('#he-cfm-ok')?.addEventListener('click', () => {
          closeSubModal();
          onConfirm();
        });
      }
    );
  }

  // 单文本框全屏精修弹窗（满足问题 1）
  function openFieldZoomEditor(targetEl, labelTitle) {
    if (!targetEl) return;
    openSubModal(
      `<span>单框全屏精修 · ${escapeHtml(labelTitle || '编辑内容')}</span>`,
      `
        <textarea class="he-textarea" id="he-zoom-textarea" style="flex:1; height:100%; min-height:62vh; font-size:14px; line-height:1.6;"></textarea>
        <div class="he-row" style="justify-content:space-between;">
          <span class="he-hint" id="he-zoom-counter">0 字</span>
          <div class="he-row">
            <button class="he-btn" id="he-zoom-cancel">取消修改</button>
            <button class="he-btn he-btn-primary" id="he-zoom-save">完成并写回原框</button>
          </div>
        </div>
      `,
      true,
      body => {
        const ta = body.querySelector('#he-zoom-textarea');
        const cnt = body.querySelector('#he-zoom-counter');
        ta.value = targetEl.value || '';
        cnt.textContent = `当前共 ${ta.value.length} 字`;
        ta.addEventListener('input', () => { cnt.textContent = `当前共 ${ta.value.length} 字`; });
        body.querySelector('#he-zoom-cancel')?.addEventListener('click', closeSubModal);
        body.querySelector('#he-zoom-save')?.addEventListener('click', () => {
          targetEl.value = ta.value;
          closeSubModal();
          collectFormToData();
          saveChatData();
          setStatus(`已更新【${labelTitle}】并自动存盘`);
        });
        setTimeout(() => ta.focus(), 60);
      }
    );
  }

  // 双向历史版本时光机（满足问题 5：退回旧档也不丢新档）
  function openHistoryModal(d) {
    const listHtml = !d.history.length
      ? `<div class="he-hint">当前暂无历史快照。每次手动保存、AI总结或合并前都会自动在此生成时光机备份。</div>`
      : d.history.map((h, idx) => `
          <div class="he-card">
            <div class="he-card-head">
              <span>版本 #${idx + 1} · ${escapeHtml(h.reason)}</span>
              <span class="he-badge">${escapeHtml(h.time)} · 共${h.actsCount || 0}幕</span>
            </div>
            <div class="he-hint">心声预览：${escapeHtml(h.profiles?.[0]?.innerVoice || '无')}</div>
            <div class="he-row" style="justify-content:flex-end;">
              <button class="he-btn he-btn-primary" data-restore-idx="${idx}">切换到此版本（自动备份当前手头版本）</button>
            </div>
          </div>
        `).join('');

    openSubModal(
      `<span>双向历史版本时光机（新旧版本自由来回切，绝不丢失）</span>`,
      `<div style="display:flex; flex-direction:column; gap:8px;">${listHtml}</div>`,
      false,
      body => {
        body.querySelectorAll('[data-restore-idx]').forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-restore-idx'), 10);
            const targetSnap = d.history[idx];
            if (!targetSnap) return;
            // 先把当前手头状态存进历史最前，保证新档绝对不丢！
            collectFormToData();
            const currentBackup = makeDataSnapshotObject(d, '切换历史前自动留存的手头版本');
            d.history.splice(idx, 1);
            d.history.unshift(currentBackup);
            if (d.history.length > 8) d.history.length = 8;

            d.profiles = JSON.parse(JSON.stringify(targetSnap.profiles || d.profiles));
            d.userNote = JSON.parse(JSON.stringify(targetSnap.userNote || d.userNote));
            d.secretLedger = JSON.parse(JSON.stringify(targetSnap.secretLedger || d.secretLedger));
            d.acts = JSON.parse(JSON.stringify(targetSnap.acts || []));
            d.snapshot = JSON.parse(JSON.stringify(targetSnap.snapshot || d.snapshot));
            d.npcs = targetSnap.npcs || '';
            if (targetSnap.initiativeGear) d.initiativeGear = targetSnap.initiativeGear;
            if (targetSnap.secretGear) d.secretGear = targetSnap.secretGear;
            if (targetSnap.actionLock) d.actionLock = targetSnap.actionLock;

            saveChatData();
            closeSubModal();
            renderPanelFromData();
            setStatus(`已切换至【${targetSnap.time}】版本！原手头版本已存入时光机第 #1 位，随时可切回`);
          });
        });
      }
    );
  }

  // 世界书操作中心弹窗（塞入已有世界书 / 导出 JSON / 复制全文）
  async function openWorldBookModal(contentText, charName) {
    const books = await fetchAvailableWorldBooks();
    const boundBook = getCharacterBoundWorldBook();
    const optionsHtml = books.length
      ? books.map(b => `<option value="${escapeHtml(b)}" ${b === boundBook ? 'selected' : ''}>${escapeHtml(b)}${b === boundBook ? ' (当前角色绑定)' : ''}</option>`).join('')
      : `<option value="">未检测到已有世界书（请使用下方导出 .json）</option>`;

    openSubModal(
      `<span>世界书同步与导出中心 · ${escapeHtml(charName || '当前对话')}</span>`,
      `
        <div class="he-card">
          <div class="he-card-head"><span>方式一：直接补充 / 更新塞入酒馆已有世界书（推荐）</span></div>
          <div>
            <div class="he-label"><span>选择目标世界书（已自动识别角色绑定世界书）：</span></div>
            <select class="he-select" id="he-wb-target">${optionsHtml}</select>
          </div>
          <div class="he-grid-2">
            <div>
              <div class="he-label"><span>条目名称备注：</span></div>
              <input class="he-input" id="he-wb-title" value="[心语回响] ${escapeHtml(charName || '角色')} 动态心智与记忆" />
            </div>
            <div>
              <div class="he-label"><span>触发亮灯方式：</span></div>
              <select class="he-select" id="he-wb-constant">
                <option value="true">蓝灯常驻（始终激活注入）</option>
                <option value="false">绿灯关键词触发</option>
              </select>
            </div>
          </div>
          <div>
            <div class="he-label"><span>绿灯触发关键词（逗号分隔）：</span></div>
            <input class="he-input" id="he-wb-keys" value="${escapeHtml(charName || '记忆')}, 回忆, 过往" />
          </div>
          <div class="he-row" style="justify-content:flex-end; margin-top:4px;">
            <button class="he-btn" id="he-wb-append">作为新条目追加塞入</button>
            <button class="he-btn he-btn-primary" id="he-wb-overwrite">智能覆盖同名[心语回响]条目</button>
          </div>
        </div>

        <div class="he-card">
          <div class="he-card-head"><span>方式二：新建下载或纯文本复制</span></div>
          <div class="he-row">
            <button class="he-btn he-btn-primary" id="he-wb-dl-json">下载独立世界书 (.json 文件)</button>
            <button class="he-btn" id="he-wb-copy-raw">仅复制记忆全文到剪贴板</button>
          </div>
        </div>
      `,
      false,
      body => {
        const runInject = async overwrite => {
          const target = body.querySelector('#he-wb-target')?.value;
          if (!target) {
            setStatus('请先选择一个有效的已有世界书', true);
            return;
          }
          const title = body.querySelector('#he-wb-title')?.value || '[心语回响] 记忆档案';
          const isConst = body.querySelector('#he-wb-constant')?.value === 'true';
          const keys = body.querySelector('#he-wb-keys')?.value || '';
          const ok = await injectIntoExistingWorldBook(target, contentText, title, isConst, keys, overwrite);
          if (ok) {
            closeSubModal();
            setStatus(`成功写入世界书【${target}】！（${overwrite ? '已覆盖更新' : '已新增条目'}）`);
          }
        };

        body.querySelector('#he-wb-overwrite')?.addEventListener('click', () => runInject(true));
        body.querySelector('#he-wb-append')?.addEventListener('click', () => runInject(false));
        body.querySelector('#he-wb-dl-json')?.addEventListener('click', () => {
          downloadWorldBookJsonFile(charName, contentText);
          closeSubModal();
          setStatus('已下载标准世界书 .json 文件，可在酒馆世界书页面直接导入！');
        });
        body.querySelector('#he-wb-copy-raw')?.addEventListener('click', async () => {
          await navigator.clipboard?.writeText(contentText);
          closeSubModal();
          setStatus('已复制记忆全文到剪贴板！');
        });
      }
    );
  }

  // 楼层精细管理弹窗（指定插入哪一楼 / 原地刷新旧楼 / 仅单删总结楼不伤后续剧情）
  function openFloorManageModal(d) {
    const ctx = getCtx();
    const total = (ctx.chat || []).length;
    const mounted = findMountedSummaryFloors();
    const mountedDesc = mounted.length
      ? `当前检测到已挂载总结位于：<b>第 ${mounted.join('、')} 楼</b>`
      : `当前聊天楼层中<b>尚未挂载</b>心语回响总结块`;

    openSubModal(
      `<span>聊天楼层挂载与精细单删管理</span>`,
      `
        <div class="he-card">
          <div class="he-hint">${mountedDesc}（当前聊天共 ${total} 楼，末尾序号为 ${Math.max(0, total - 1)}）</div>
          ${mounted.length ? `
            <div class="he-row" style="margin-top:4px;">
              <button class="he-btn he-btn-primary" id="he-fl-replace">原地刷新第 ${mounted[mounted.length - 1]} 楼内容（推荐：合并/修改后同步）</button>
              <button class="he-btn he-btn-danger" id="he-fl-del-only">仅单删总结楼层（保留后续所有聊天剧情！）</button>
            </div>
          ` : ''}
        </div>

        <div class="he-card">
          <div class="he-card-head"><span>插入为新楼层（可自由指定插在第几楼）</span></div>
          <div class="he-row">
            <span class="he-label">插入位置楼层号（留空默认插在最末尾第 ${total} 楼）：</span>
            <input class="he-input" id="he-fl-target-idx" type="number" placeholder="${total}" style="width:110px;" />
            <button class="he-btn he-btn-primary" id="he-fl-insert-go">${ICONS.send} 确认插入楼层</button>
          </div>
        </div>
      `,
      false,
      body => {
        // 原地刷新已挂载楼层
        body.querySelector('#he-fl-replace')?.addEventListener('click', () => {
          const targetIdx = mounted[mounted.length - 1];
          if (ctx.chat?.[targetIdx]) {
            ctx.chat[targetIdx].mes = buildFormattedPromptBlock(d, true);
            saveChatData();
            try { ctx.reloadCurrentChat?.(); } catch (_) {}
            closeSubModal();
            renderPanelFromData();
            setStatus(`已原地将第 ${targetIdx} 楼刷新为最新记忆内容！`);
          }
        });

        // 仅精准单删总结楼层（从后往前 splice，绝不误删后面的正常楼层！）
        body.querySelector('#he-fl-del-only')?.addEventListener('click', () => {
          for (let i = mounted.length - 1; i >= 0; i--) {
            ctx.chat.splice(mounted[i], 1);
          }
          saveChatData();
          try { ctx.reloadCurrentChat?.(); } catch (_) {}
          closeSubModal();
          renderPanelFromData();
          setStatus(`已精准抽离 ${mounted.length} 个旧总结楼层，后续聊天记录完好无损！`);
        });

        // 插入到指定楼层或最末尾
        body.querySelector('#he-fl-insert-go')?.addEventListener('click', () => {
          const rawIdx = body.querySelector('#he-fl-target-idx')?.value;
          const insertAt = rawIdx === '' ? ctx.chat.length : Math.max(0, Math.min(ctx.chat.length, parseInt(rawIdx, 10) || ctx.chat.length));
          const msgObj = {
            name: PLUGIN_NAME,
            is_user: false,
            is_system: false,
            send_date: Date.now(),
            mes: buildFormattedPromptBlock(d, true)
          };
          ctx.chat.splice(insertAt, 0, msgObj);
          d.injectMode = 'floor';
          saveChatData();
          try { ctx.reloadCurrentChat?.(); } catch (_) {}
          closeSubModal();
          renderPanelFromData();
          setStatus(`已将美化记忆块精准插入至第 ${insertAt} 楼！`);
        });
      }
    );
  }

  // =========================================================================
  // 八、主界面挂载与渲染
  // =========================================================================
  function zoomBtnHtml(targetId, title) {
    return `<button type="button" class="he-zoom-link" data-act="zoom-field" data-target="${targetId}" data-title="${escapeHtml(title)}">${ICONS.max} 放大编辑</button>`;
  }

  function mountUI() {
    if (document.getElementById('he-root')) return;

    const root = document.createElement('div');
    root.id = 'he-root';
    root.innerHTML = `
      <div id="he-fab" title="打开心语回响">${ICONS.echo}</div>

      <div id="he-backdrop">
        <div id="he-panel" role="dialog" aria-label="心语回响记忆面板">
          <!-- 顶栏 -->
          <div class="he-header">
            <div class="he-title-wrap">
              ${ICONS.echo}
              <span>心语回响 v${PLUGIN_VERSION}</span>
              <span class="he-badge" id="he-char-badge">当前对话</span>
              <span class="he-badge" id="he-mounted-badge" style="color:var(--he-accent);">未插楼层</span>
            </div>
            <div class="he-header-actions">
              <button class="he-btn" data-act="open-shelf">${ICONS.shelf} 角色书架</button>
              <button class="he-btn" data-act="open-history">${ICONS.undo} 历史时光机</button>
              <button class="he-btn" data-act="cycle-theme" id="he-theme-btn">主题: 跟随</button>
              <button class="he-btn" data-act="toggle-fullscreen" id="he-fs-btn">${ICONS.max} 面板全屏</button>
              <button class="he-btn" data-act="close-panel" title="关闭">${ICONS.close}</button>
            </div>
          </div>

          <!-- 固定高度防挤扁页签栏 -->
          <div class="he-tabs">
            <button class="he-tab he-active" data-act="switch-tab" data-tab="mind">① 双生心智</button>
            <button class="he-tab" data-act="switch-tab" data-tab="secret">② 暗线与铁律</button>
            <button class="he-tab" data-act="switch-tab" data-tab="acts">③ 分幕卷宗</button>
            <button class="he-tab" data-act="switch-tab" data-tab="snapshot">④ 切口与行囊</button>
            <button class="he-tab" data-act="switch-tab" data-tab="npcs">⑤ 总结与楼层</button>
            <button class="he-tab" data-act="switch-tab" data-tab="settings">设置与预设</button>
          </div>

          <!-- 主体内容区 -->
          <div class="he-body" id="he-body">
            <!-- ① 双生心智 -->
            <div class="he-pane he-active" data-pane="mind">
              <div class="he-subtabs" id="he-char-subtabs"></div>

              <div class="he-card">
                <div class="he-card-head">
                  <div class="he-row">
                    <span>角色名：</span>
                    <input class="he-input" id="he-f-profName" style="width:125px; padding:4px 7px;" />
                    <label class="he-row" style="font-size:12px; color:var(--he-text); cursor:pointer;">
                      <input type="checkbox" id="he-f-profPresent" />
                      <span>当前在场</span>
                    </label>
                  </div>
                  <div class="he-row">
                    <button class="he-btn" data-act="toggle-prof-lock" id="he-lock-profBtn"></button>
                    <button class="he-btn he-btn-danger" data-act="delete-prof">${ICONS.trash}</button>
                  </div>
                </div>

                <div>
                  <div class="he-label">
                    <span>此刻潜台词心声（第一人称直白心声）</span>
                    ${zoomBtnHtml('he-f-innerVoice', '此刻潜台词心声')}
                  </div>
                  <input class="he-input" id="he-f-innerVoice" placeholder="例：嘴上嫌她麻烦，视线却总忍不住往她受伤的手腕上飘……" />
                </div>

                <div class="he-grid-2">
                  <div>
                    <div class="he-label">
                      <span>当下最新心境与防线微变</span>
                      ${zoomBtnHtml('he-f-selfBase', '当下最新心境与防线微变')}
                    </div>
                    <textarea class="he-textarea" id="he-f-selfBase" placeholder="动态覆盖：只记当前最新处境与心理松动（旧历程沉淀在下方锚点）"></textarea>
                  </div>
                  <div>
                    <div class="he-label">
                      <span>对 User 表层认知（仅角色已知）</span>
                      ${zoomBtnHtml('he-f-surfaceView', '对 User 表层认知')}
                    </div>
                    <textarea class="he-textarea" id="he-f-surfaceView" placeholder="角色目前以为User是谁、存有哪些误判（禁混入未掉马真相）"></textarea>
                  </div>
                </div>

                <div>
                  <div class="he-label">
                    <span>潜意识态度与灵魂重影（嘴上态度 vs 身体下意识双标）</span>
                    ${zoomBtnHtml('he-f-subconscious', '潜意识态度与灵魂重影')}
                  </div>
                  <textarea class="he-textarea" id="he-f-subconscious" placeholder="理智上的克制割裂 vs 行动上的下意识偏袒、护短或灵魂重影"></textarea>
                </div>

                <div>
                  <div class="he-label">
                    <span>过去沉淀的核心触动锚点与关键原话（最多留4条）</span>
                    ${zoomBtnHtml('he-f-anchors', '核心触动锚点与关键原话')}
                  </div>
                  <textarea class="he-textarea" id="he-f-anchors" placeholder="[雨夜伞下] 原话：「……」 -> 此后每逢下雨或见User受寒便暗中心软"></textarea>
                </div>
              </div>

              <!-- 关系主动推进引擎（优化第④档表述，任何时候想让他主动破局都能开） -->
              <div class="he-card">
                <div class="he-card-head"><span>关系主动推进引擎（治被动暧昧 / 不主动送礼 / 卡瓶颈不表白）</span></div>
                <div class="he-gear-group" id="he-init-gear-group">
                  <button class="he-gear-btn" data-act="set-init-gear" data-gear="1">① 顺其自然<br><small>正常拉扯不强推</small></button>
                  <button class="he-gear-btn" data-act="set-init-gear" data-gear="2">② 暗宠主动事件<br><small>主动送礼/关怀/提旧事</small></button>
                  <button class="he-gear-btn" data-act="set-init-gear" data-gear="3">③ 醋意与名分焦灼<br><small>禁松弛感/渴求唯一名分</small></button>
                  <button class="he-gear-btn" data-act="set-init-gear" data-gear="4">④ 主动破局正名<br><small>捅破窗户纸/破好感瓶颈</small></button>
                </div>
              </div>

              <!-- User 态度备注 + 修复图三图四溢出后的双格防复读机切换按钮 -->
              <div class="he-card">
                <div class="he-card-head">
                  <span>User 态度备注与防口头复读机锁（自带防读心隔离）</span>
                  <button class="he-btn" data-act="toggle-lock" data-lock="userNote" id="he-lock-userNote"></button>
                </div>
                <div class="he-grid-2">
                  <div>
                    <div class="he-label">
                      <span>User 对角色真实情感张力</span>
                      ${zoomBtnHtml('he-f-userAttitude', 'User 真实情感张力')}
                    </div>
                    <textarea class="he-textarea" id="he-f-userAttitude" placeholder="例：表面恨入骨髓拒不原谅，实则因旧情未绝而剧烈怨恸"></textarea>
                  </div>
                  <div>
                    <div class="he-label">
                      <span>User 人设底线与特殊伪装备注</span>
                      ${zoomBtnHtml('he-f-userBottomLine', 'User 人设底线与伪装')}
                    </div>
                    <textarea class="he-textarea" id="he-f-userBottomLine" placeholder="例：当前为21岁真身易容潜伏、女扮男装等关键底线"></textarea>
                  </div>
                </div>

                <div>
                  <div class="he-label"><span>困境 / 火葬场防口头挡刀复读机开关：</span></div>
                  <div class="he-gear-group-2" id="he-action-lock-group">
                    <button class="he-gear-btn" data-act="set-action-lock" data-val="normal">常规自然演进<br><small>按剧情自然反应</small></button>
                    <button class="he-gear-btn" data-act="set-action-lock" data-val="substantive">强力破局：禁口头挡刀复读<br><small>强制实质割肉行动，禁喊“冲我来/一起死”</small></button>
                  </div>
                </div>
              </div>
            </div>

            <!-- ② 暗线与铁律 -->
            <div class="he-pane" data-pane="secret">
              <div class="he-card">
                <div class="he-card-head"><span>通用伏笔 / 掉马 / 筹备事件四档推进器</span></div>
                <div class="he-gear-group" id="he-gear-group">
                  <button class="he-gear-btn" data-act="set-gear" data-gear="1">① 埋种潜伏期<br><small>完全保密不提</small></button>
                  <button class="he-gear-btn" data-act="set-gear" data-gear="2">② 重影/暗中铺垫<br><small>制造恍惚与氛围暗示</small></button>
                  <button class="he-gear-btn" data-act="set-gear" data-gear="3">③ 违和/蓄势待发<br><small>察觉破绽频繁试探</small></button>
                  <button class="he-gear-btn" data-act="set-gear" data-gear="4">④ 本回合立即引爆<br><small>彻底揭穿/正面爆发</small></button>
                </div>
                <div class="he-grid-2">
                  <div>
                    <div class="he-label">
                      <span>客观真相 / 马甲 / 想让他铺垫引爆的事</span>
                      ${zoomBtnHtml('he-f-truthAndMask', '客观真相与待推进暗线')}
                    </div>
                    <textarea class="he-textarea" id="he-f-truthAndMask" placeholder="记录上帝视角真相或待推进事件（1档保密，2-3档铺垫禁挑明，4档立即引爆）"></textarea>
                  </div>
                  <div>
                    <div class="he-label">
                      <span>角色当前已掌握线索 / 铺垫进度</span>
                      ${zoomBtnHtml('he-f-charClues', '已掌握线索与铺垫进度')}
                    </div>
                    <textarea class="he-textarea" id="he-f-charClues" placeholder="角色目前仅凭实力查到的真实线索或事件进度"></textarea>
                  </div>
                </div>
              </div>

              <div class="he-card">
                <div class="he-card-head">
                  <span>不可逆物理 / 战力 / 伤病铁律黑名单（专治吃书乱编卖惨）</span>
                  <div class="he-row">
                    ${zoomBtnHtml('he-f-hardFacts', '防吃书物理与战力黑名单')}
                    <button class="he-btn" data-act="toggle-lock" data-lock="hardFacts" id="he-lock-hardFacts"></button>
                  </div>
                </div>
                <textarea class="he-textarea" id="he-f-hardFacts" placeholder="例：1. 魔火已彻底逼出严禁复发；2. 修为散尽严禁凭空输灵力；3. 末世物资余量/性别伪装完好度"></textarea>
              </div>
            </div>

            <!-- ③ 分幕卷宗 -->
            <div class="he-pane" data-pane="acts">
              <div class="he-card">
                <div class="he-card-head">
                  <span>分幕剧情卷宗库（已挂载楼层信息见顶栏，合并后可去【楼层管理】原地刷新）</span>
                  <div class="he-row">
                    <button class="he-btn" data-act="add-act">${ICONS.plus} 手动添一幕</button>
                    <button class="he-btn he-btn-primary" data-act="merge-selected-acts">${ICONS.spark} 合并勾选幕</button>
                  </div>
                </div>
                <div id="he-acts-list" style="display:flex; flex-direction:column; gap:8px;"></div>
              </div>
            </div>

            <!-- ④ 切口与行囊 -->
            <div class="he-pane" data-pane="snapshot">
              <div class="he-card">
                <div class="he-card-head"><span>当时情况 · 切口现场快照（隐藏百楼不断气核心）</span></div>
                <div>
                  <div class="he-label">
                    <span>切口场景、空气氛围与未说完的话头（100字内）</span>
                    ${zoomBtnHtml('he-f-sceneBridge', '切口场景与情绪余温')}
                  </div>
                  <textarea class="he-textarea" id="he-f-sceneBridge"></textarea>
                </div>
                <div>
                  <div class="he-label">
                    <span>当下衣着完好度、身体微状态与随身姿态</span>
                    ${zoomBtnHtml('he-f-attireAndBody', '当下衣着与身体微状态')}
                  </div>
                  <textarea class="he-textarea" id="he-f-attireAndBody"></textarea>
                </div>
                <div>
                  <div class="he-label">
                    <span>关键随身道具与未完约定 / 待办</span>
                    ${zoomBtnHtml('he-f-itemsAndTodos', '关键道具与未完约定')}
                  </div>
                  <textarea class="he-textarea" id="he-f-itemsAndTodos"></textarea>
                </div>
              </div>
            </div>

            <!-- ⑤ 总结控制台、智能续接楼层与藏楼工具 -->
            <div class="he-pane" data-pane="npcs">
              <div class="he-card">
                <div class="he-card-head">
                  <span>AI 提炼总结范围（旧分幕保留不丢，新剧情追加为新一幕）</span>
                  <button class="he-btn he-btn-primary" data-act="fill-new-floors" id="he-continue-btn">一键填入上次之后的新增楼层</button>
                </div>
                <div class="he-hint" id="he-last-sum-hint">上次总结截止记录：暂无</div>
                <div class="he-grid-2">
                  <div>
                    <div class="he-label"><span>起始楼层 ~ 结束楼层（留空默认全篇）</span></div>
                    <div class="he-row">
                      <input class="he-input" id="he-sum-start" placeholder="起始楼(如 0)" style="width:47%" />
                      <input class="he-input" id="he-sum-end" placeholder="结束楼(默认最新)" style="width:47%" />
                    </div>
                  </div>
                  <div>
                    <div class="he-label"><span>要跳过的废楼 / 小剧场楼层号</span></div>
                    <input class="he-input" id="he-sum-skip" placeholder="例: 15, 22-26" />
                  </div>
                </div>
                <div>
                  <div class="he-label"><span>本次总结额外润色叮嘱</span></div>
                  <input class="he-input" id="he-sum-note" placeholder="例：重点刻画他发现我受伤后的愧疚，原样保留洞底台词" />
                </div>

                <div id="he-preview-box" style="display:none; margin-top:6px; border-top:1px dashed var(--he-accent); padding-top:8px;">
                  <div class="he-card-head"><span>AI 提炼预览已生成！（可切去各页签检查微调，点下方按钮正式存盘生效）</span></div>
                  <div class="he-row" style="margin-top:6px;">
                    <button class="he-btn he-btn-primary" data-act="confirm-preview">确认应用本次总结</button>
                    <button class="he-btn he-btn-danger" data-act="cancel-preview">放弃并还原</button>
                  </div>
                </div>
              </div>

              <!-- 自由隐藏/恢复楼层（带二次确认） -->
              <div class="he-card">
                <div class="he-card-head"><span>自由隐藏 / 恢复显示聊天楼层（点按钮后会先弹窗确认）</span></div>
                <div class="he-row">
                  <span class="he-label">从第</span>
                  <input class="he-input" id="he-hide-start" value="1" style="width:74px;" />
                  <span class="he-label">楼 到 第</span>
                  <input class="he-input" id="he-hide-end" style="width:82px;" />
                  <span class="he-label">楼：</span>
                  <button class="he-btn he-btn-primary" data-act="hide-floors">${ICONS.eyeOff} 隐藏楼层</button>
                  <button class="he-btn" data-act="unhide-floors">${ICONS.eye} 恢复显示</button>
                </div>
                <div class="he-hint" id="he-floor-count-hint"></div>
              </div>

              <div class="he-card">
                <div class="he-card-head">
                  <span>重要配角与 NPC 名册</span>
                  ${zoomBtnHtml('he-f-npcs', '重要配角与 NPC 名册')}
                </div>
                <textarea class="he-textarea" id="he-f-npcs"></textarea>
              </div>
            </div>

            <!-- 三层抽屉式「角色记忆书架」（修复图五） -->
            <div class="he-pane" data-pane="shelf">
              <div class="he-card">
                <div class="he-card-head">
                  <span id="he-shelf-breadcrumb">角色记忆总书架 · 第一层：选择角色</span>
                  <button class="he-btn" data-act="shelf-back" id="he-shelf-back-btn" style="display:none;">${ICONS.back} 返回上一级</button>
                </div>
                <input class="he-input" id="he-shelf-search" placeholder="搜索角色名或聊天分支关键词..." />
                <div id="he-shelf-list" style="display:flex; flex-direction:column; gap:8px; margin-top:4px;"></div>
              </div>
            </div>

            <!-- 设置：多套 API 预设 + 多套提示词预设 -->
            <div class="he-pane" data-pane="settings">
              <div class="he-card">
                <div class="he-card-head">
                  <span>多套独立 API 配置预设（一键切换不同模型与接口）</span>
                  <div class="he-row">
                    <select class="he-select" id="he-api-preset-select" style="width:auto; min-width:160px;"></select>
                    <button class="he-btn he-btn-primary" data-act="save-api-preset">另存为新API预设</button>
                    <button class="he-btn he-btn-danger" data-act="del-api-preset">${ICONS.trash}</button>
                  </div>
                </div>
                <div class="he-grid-2">
                  <div>
                    <div class="he-label"><span>API Base URL</span></div>
                    <input class="he-input" id="he-set-baseUrl" placeholder="https://api.example.com/v1" />
                  </div>
                  <div>
                    <div class="he-label"><span>API Key</span></div>
                    <input class="he-input" type="password" id="he-set-apiKey" placeholder="sk-..." />
                  </div>
                </div>
                <div class="he-row">
                  <input class="he-input" id="he-set-model" placeholder="模型名称" style="flex:1;" />
                  <button class="he-btn" data-act="fetch-models">拉取模型列表</button>
                  <select class="he-select" id="he-model-select" style="width:auto; max-width:220px; display:none;"></select>
                </div>
              </div>

              <div class="he-card">
                <div class="he-card-head">
                  <span>多套总结提示词预设库（支持自由新建保存与切换）</span>
                  <div class="he-row">
                    <select class="he-select" id="he-prompt-preset-select" style="width:auto; min-width:180px;"></select>
                    <button class="he-btn he-btn-primary" data-act="save-prompt-preset">另存为新提示词预设</button>
                    <button class="he-btn he-btn-danger" data-act="del-prompt-preset">${ICONS.trash}</button>
                  </div>
                </div>
                <div>
                  <div class="he-label">
                    <span>当前生效的系统总结提示词内容：</span>
                    <div class="he-row">
                      ${zoomBtnHtml('he-set-prompt', '系统总结提示词')}
                      <button class="he-btn" data-act="reset-prompt">恢复内置默认</button>
                    </div>
                  </div>
                  <textarea class="he-textarea" id="he-set-prompt" style="min-height:130px;"></textarea>
                </div>
                <div class="he-row">
                  <span class="he-label">定时提醒楼层间隔（填0纯手动）：</span>
                  <input class="he-input" type="number" id="he-set-autoInterval" style="width:100px;" />
                </div>
              </div>
            </div>
          </div>

          <!-- 固定底栏 -->
          <div class="he-footer">
            <div class="he-row">
              <select class="he-select" id="he-f-injectMode" style="width:auto;">
                <option value="silent">模式: 后台静默喂给AI</option>
                <option value="floor">模式: 插入聊天楼层</option>
                <option value="none">模式: 纯仓库不注入</option>
              </select>
            </div>
            <div class="he-status-bar" id="he-status-text">就绪</div>
            <div class="he-row">
              <button class="he-btn he-btn-primary" data-act="run-summary">${ICONS.spark} 提炼总结</button>
              <button class="he-btn" data-act="open-floor-mgr">${ICONS.send} 楼层挂载/单删</button>
              <button class="he-btn" data-act="open-wb-modal">${ICONS.book} 塞入/导出世界书</button>
              <button class="he-btn he-btn-primary" data-act="save-all">保存改动</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 通用二级弹窗容器 -->
      <div id="he-submodal">
        <div class="he-submodal-box" id="he-submodal-box">
          <div class="he-header">
            <div class="he-title-wrap" id="he-submodal-title"></div>
            <button class="he-btn" id="he-submodal-close">${ICONS.close}</button>
          </div>
          <div class="he-submodal-body" id="he-submodal-body"></div>
        </div>
      </div>
    `;

    document.body.appendChild(root);
    applyThemeClass();
    applyFabPosition();
    mountExtensionMenuEntries();
  }

  function mountExtensionMenuEntries() {
    try {
      const extMenu = document.getElementById('extensionsMenu');
      if (extMenu && !document.getElementById('he-wand-item')) {
        const item = document.createElement('div');
        item.id = 'he-wand-item';
        item.className = 'list-group-item flex-container flexGap5 interactable';
        item.innerHTML = `${ICONS.echo} <span>打开心语回响</span>`;
        item.addEventListener('click', () => openPanel());
        extMenu.appendChild(item);
      }

      const extSettings = document.getElementById('extensions_settings');
      if (extSettings && !document.getElementById('he-ext-settings-drawer')) {
        const box = document.createElement('div');
        box.id = 'he-ext-settings-drawer';
        box.className = 'inline-drawer';
        box.innerHTML = `
          <div class="inline-drawer-toggle inline-drawer-header">
            <b>${PLUGIN_NAME} (HeartEcho v${PLUGIN_VERSION})</b>
            <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
          </div>
          <div class="inline-drawer-content" style="padding:8px 0;">
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button class="menu_button" id="he-ext-open-btn">打开心语回响主面板</button>
              <button class="menu_button" id="he-ext-reset-fab">重置悬浮球位置</button>
              <button class="menu_button" id="he-ext-toggle-fab">显示/隐藏悬浮球</button>
            </div>
          </div>
        `;
        extSettings.appendChild(box);
        document.getElementById('he-ext-open-btn')?.addEventListener('click', () => openPanel());
        document.getElementById('he-ext-reset-fab')?.addEventListener('click', () => {
          globalSettings.fabPos = { side: 'right', right: 18, bottom: 90, docked: false };
          globalSettings.showFab = true;
          saveGlobalSettings();
          applyFabPosition();
        });
        document.getElementById('he-ext-toggle-fab')?.addEventListener('click', () => {
          globalSettings.showFab = !globalSettings.showFab;
          saveGlobalSettings();
          applyFabPosition();
        });
      }
    } catch (_) {}
  }

  function applyThemeClass() {
    const root = document.getElementById('he-root');
    const btn = document.getElementById('he-theme-btn');
    if (!root) return;
    root.classList.remove('he-theme-light', 'he-theme-dark');
    if (globalSettings.theme === 'light') {
      root.classList.add('he-theme-light');
      if (btn) btn.textContent = '主题: 浅色';
    } else if (globalSettings.theme === 'dark') {
      root.classList.add('he-theme-dark');
      if (btn) btn.textContent = '主题: 深色';
    } else {
      if (btn) btn.textContent = '主题: 跟随';
    }
  }

  function applyFabPosition() {
    const fab = document.getElementById('he-fab');
    if (!fab) return;
    if (!globalSettings.showFab) {
      fab.classList.add('he-hidden');
      return;
    }
    fab.classList.remove('he-hidden', 'he-dock-left', 'he-dock-right');
    const pos = globalSettings.fabPos || { side: 'right', right: 18, bottom: 90, docked: false };
    fab.style.top = 'auto';
    fab.style.bottom = (pos.bottom ?? 90) + 'px';
    if (pos.docked) {
      fab.classList.add(pos.side === 'left' ? 'he-dock-left' : 'he-dock-right');
    } else if (pos.side === 'left') {
      fab.style.left = (pos.left ?? 18) + 'px';
      fab.style.right = 'auto';
    } else {
      fab.style.right = (pos.right ?? 18) + 'px';
      fab.style.left = 'auto';
    }
  }

  function setStatus(msg, isWarn) {
    const el = document.getElementById('he-status-text');
    if (!el) return;
    el.textContent = msg;
    el.style.color = isWarn ? 'var(--he-danger)' : 'var(--he-muted)';
  }

  function openPanel() {
    renderPanelFromData();
    document.getElementById('he-backdrop')?.classList.add('he-open');
  }

  function closePanel() {
    document.getElementById('he-backdrop')?.classList.remove('he-open');
  }

  function toggleFullscreen() {
    isFullscreen = !isFullscreen;
    document.getElementById('he-backdrop')?.classList.toggle('he-fullscreen', isFullscreen);
    document.getElementById('he-panel')?.classList.toggle('he-fullscreen', isFullscreen);
    const btn = document.getElementById('he-fs-btn');
    if (btn) btn.innerHTML = isFullscreen ? `${ICONS.min} 还原窗口` : `${ICONS.max} 面板全屏`;
  }

  // =========================================================================
  // 九、面板数据渲染与三层角色记忆书架渲染
  // =========================================================================
  function renderPanelFromData() {
    const ctx = getCtx();
    const d = getChatData();
    const prof = getCurrentProfile(d);
    const totalFloors = (ctx.chat || []).length;
    const mountedFloors = findMountedSummaryFloors();

    const charBadge = document.getElementById('he-char-badge');
    if (charBadge) charBadge.textContent = `${ctx.name2 || '当前对话'} (共${totalFloors}楼)`;

    const mountedBadge = document.getElementById('he-mounted-badge');
    if (mountedBadge) {
      mountedBadge.textContent = mountedFloors.length ? `已插在第 ${mountedFloors.join(',')} 楼` : '未插楼层';
    }

    const lastHint = document.getElementById('he-last-sum-hint');
    if (lastHint) {
      lastHint.textContent = d.lastSummarizedFloor >= 0
        ? `上次已总结至第 ${d.lastSummarizedFloor} 楼（当前最新为第 ${Math.max(0, totalFloors - 1)} 楼，点右上方按钮可自动续接第 ${d.lastSummarizedFloor + 1} 楼起的新剧情）`
        : `当前窗口尚未执行过总结（默认从第 0 楼提炼至最新第 ${Math.max(0, totalFloors - 1)} 楼）`;
    }

    const floorHint = document.getElementById('he-floor-count-hint');
    if (floorHint) {
      const suggestEnd = Math.max(1, totalFloors - 12);
      floorHint.textContent = `当前共 ${totalFloors} 楼。从第 1 楼开始隐藏可保留第 0 楼开场白文风。`;
      const hideEndEl = document.getElementById('he-hide-end');
      if (hideEndEl && !hideEndEl.value && totalFloors > 12) hideEndEl.value = String(suggestEnd);
    }

    renderCharSubtabs(d);

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val ?? '';
    };

    setVal('he-f-profName', prof.name);
    const presChk = document.getElementById('he-f-profPresent');
    if (presChk) presChk.checked = prof.present !== false;

    const profLockBtn = document.getElementById('he-lock-profBtn');
    if (profLockBtn) {
      profLockBtn.innerHTML = prof.locked ? `${ICONS.lock} 已锁死防改` : `${ICONS.unlock} 随总结更新`;
      profLockBtn.classList.toggle('he-btn-primary', !!prof.locked);
    }

    setVal('he-f-innerVoice', prof.innerVoice);
    setVal('he-f-selfBase', prof.selfBase);
    setVal('he-f-surfaceView', prof.surfaceView);
    setVal('he-f-subconscious', prof.subconscious);
    setVal('he-f-anchors', prof.anchors);

    setVal('he-f-userAttitude', d.userNote.attitude);
    setVal('he-f-userBottomLine', d.userNote.bottomLine);

    setVal('he-f-truthAndMask', d.secretLedger.truthAndMask);
    setVal('he-f-charClues', d.secretLedger.charClues);
    setVal('he-f-hardFacts', d.secretLedger.hardFacts);

    setVal('he-f-sceneBridge', d.snapshot.sceneBridge);
    setVal('he-f-attireAndBody', d.snapshot.attireAndBody);
    setVal('he-f-itemsAndTodos', d.snapshot.itemsAndTodos);
    setVal('he-f-npcs', d.npcs);
    setVal('he-f-injectMode', d.injectMode || 'silent');

    setVal('he-set-baseUrl', globalSettings.baseUrl);
    setVal('he-set-apiKey', globalSettings.apiKey);
    setVal('he-set-model', globalSettings.model);
    setVal('he-set-autoInterval', globalSettings.autoInterval);
    setVal('he-set-prompt', globalSettings.customPrompt);

    // 渲染多套 API 预设下拉框
    const apiSel = document.getElementById('he-api-preset-select');
    if (apiSel) {
      apiSel.innerHTML = `<option value="">-- 选择已存 API 预设 --</option>` +
        globalSettings.apiPresets.map(p => `<option value="${escapeHtml(p.id)}" ${p.id === globalSettings.activeApiPresetId ? 'selected' : ''}>${escapeHtml(p.name)} (${escapeHtml(p.model)})</option>`).join('');
    }

    // 渲染多套提示词预设下拉框
    const prmSel = document.getElementById('he-prompt-preset-select');
    if (prmSel) {
      prmSel.innerHTML = globalSettings.promptPresets.map(p => `<option value="${escapeHtml(p.id)}" ${p.id === globalSettings.activePromptId ? 'selected' : ''}>${escapeHtml(p.name)}</option>`).join('');
    }

    ['userNote', 'hardFacts'].forEach(k => {
      const btn = document.getElementById('he-lock-' + k);
      if (!btn) return;
      const locked = !!d.locks[k];
      btn.innerHTML = locked ? `${ICONS.lock} 已锁定防改` : `${ICONS.unlock} 随总结微调`;
      btn.classList.toggle('he-btn-primary', locked);
    });

    document.querySelectorAll('#he-init-gear-group .he-gear-btn').forEach(btn => {
      btn.classList.toggle('he-active', parseInt(btn.getAttribute('data-gear'), 10) === (d.initiativeGear || 1));
    });
    document.querySelectorAll('#he-gear-group .he-gear-btn').forEach(btn => {
      btn.classList.toggle('he-active', parseInt(btn.getAttribute('data-gear'), 10) === (d.secretGear || 2));
    });
    document.querySelectorAll('#he-action-lock-group .he-gear-btn').forEach(btn => {
      btn.classList.toggle('he-active', btn.getAttribute('data-val') === (d.actionLock || 'normal'));
    });

    renderActsList(d);
    renderShelfView();
  }

  function renderCharSubtabs(d) {
    const bar = document.getElementById('he-char-subtabs');
    if (!bar) return;
    const pills = d.profiles.map((p, idx) => {
      const active = idx === d.activeCharIdx ? 'he-active' : '';
      const dot = p.present !== false ? '●' : '○';
      return `<button class="he-char-pill ${active}" data-act="select-prof" data-idx="${idx}">${dot} ${escapeHtml(p.name || ('角色' + (idx + 1)))}</button>`;
    }).join('');
    bar.innerHTML = `<span class="he-label" style="margin:0;">角色卡：</span>${pills}<button class="he-btn" data-act="add-prof">${ICONS.plus} 添加角色</button>`;
  }

  function renderActsList(d) {
    const wrap = document.getElementById('he-acts-list');
    if (!wrap) return;
    const mounted = findMountedSummaryFloors();
    const mountTag = mounted.length ? `（已同步挂载于第 ${mounted.join(',')} 楼）` : '';

    if (!d.acts.length) {
      wrap.innerHTML = `<div class="he-hint">暂无分幕卷宗，可点击底栏「提炼总结」自动生成，或点右上方「手动添一幕」。</div>`;
      return;
    }
    wrap.innerHTML = d.acts.map((act, idx) => `
      <div class="he-card" data-act-index="${idx}">
        <div class="he-row" style="justify-content:space-between;">
          <label class="he-row" style="cursor:pointer; font-size:13px; font-weight:600; color:var(--he-accent);">
            <input type="checkbox" class="he-act-check" data-idx="${idx}" ${act.checked ? 'checked' : ''} />
            <span>第 ${idx + 1} 幕 ${escapeHtml(mountTag)}</span>
          </label>
          <input class="he-input he-act-title" data-idx="${idx}" value="${escapeHtml(act.title || '')}" placeholder="本幕标题 / 时间跨度" style="flex:1; max-width:300px;" />
          <div class="he-row">
            <button type="button" class="he-zoom-link" data-act="zoom-act" data-idx="${idx}">${ICONS.max} 放大编辑</button>
            <button class="he-btn he-btn-danger" data-act="delete-act" data-idx="${idx}">${ICONS.trash}</button>
          </div>
        </div>
        <textarea class="he-textarea he-act-summary" id="he-act-ta-${idx}" data-idx="${idx}" placeholder="本幕核心因果脉络...">${escapeHtml(act.summary || '')}</textarea>
      </div>
    `).join('');
  }

  // 三层抽屉式「角色记忆书架」渲染（修复图五：角色 -> 分支窗口 -> 完整分段详情阅读）
  function renderShelfView() {
    const wrap = document.getElementById('he-shelf-list');
    const crumb = document.getElementById('he-shelf-breadcrumb');
    const backBtn = document.getElementById('he-shelf-back-btn');
    const searchInput = document.getElementById('he-shelf-search');
    if (!wrap) return;

    const query = (searchInput?.value || '').trim().toLowerCase();
    const shelf = loadShelf();

    // 第一层：展示所有已存档的角色卡片
    if (shelfNav.level === 1) {
      if (crumb) crumb.textContent = '角色记忆总书架 · 第一层：点选角色';
      if (backBtn) backBtn.style.display = 'none';
      if (searchInput) searchInput.style.display = 'block';

      const charNames = Object.keys(shelf).filter(cName => {
        if (!query) return true;
        const chats = Object.values(shelf[cName] || {});
        return cName.toLowerCase().includes(query) || chats.some(c => `${c.chatId} ${c.innerVoice} ${c.sceneBridge}`.toLowerCase().includes(query));
      });

      if (!charNames.length) {
        wrap.innerHTML = `<div class="he-hint">暂无角色存档记录。在任意聊天点一次「保存改动」后会自动收录进此书架。</div>`;
        return;
      }

      wrap.innerHTML = charNames.map(cName => {
        const branchList = Object.values(shelf[cName] || {});
        const latest = branchList[branchList.length - 1] || {};
        return `
          <div class="he-card he-shelf-card-click" data-act="shelf-open-char" data-char="${escapeHtml(cName)}">
            <div class="he-card-head">
              <span>${escapeHtml(cName)}</span>
              <span class="he-badge">共 ${branchList.length} 个聊天/分支窗口 · 点击进入</span>
            </div>
            <div class="he-hint">最近更新：${escapeHtml(latest.updatedAt || '')} | 最新切口：${escapeHtml((latest.sceneBridge || '暂无').slice(0, 60))}</div>
          </div>
        `;
      }).join('');
      return;
    }

    // 第二层：展示选中角色名下的所有分支聊天窗口
    if (shelfNav.level === 2) {
      const cName = shelfNav.charName;
      if (crumb) crumb.textContent = `书架 · ${cName} · 第二层：点选聊天窗口/平行分支`;
      if (backBtn) backBtn.style.display = 'inline-flex';
      if (searchInput) searchInput.style.display = 'block';

      const branches = Object.values(shelf[cName] || {}).filter(b => {
        if (!query) return true;
        return `${b.chatId} ${b.innerVoice} ${b.sceneBridge}`.toLowerCase().includes(query);
      });

      if (!branches.length) {
        wrap.innerHTML = `<div class="he-hint">该角色下暂无匹配的分支记录。</div>`;
        return;
      }

      wrap.innerHTML = branches.map(item => `
        <div class="he-card he-shelf-card-click" data-act="shelf-open-branch" data-char="${escapeHtml(cName)}" data-chat="${escapeHtml(item.chatId)}">
          <div class="he-card-head">
            <span>窗口/分支：${escapeHtml(item.chatId)}</span>
            <span class="he-badge">共 ${item.actsCount || 0} 幕 · ${escapeHtml(item.updatedAt || '')}</span>
          </div>
          <div class="he-hint">心声：「${escapeHtml(item.innerVoice || '暂无')}」</div>
          <div class="he-hint">切口：${escapeHtml(item.sceneBridge || '暂无')}</div>
          <div class="he-row" style="justify-content:flex-end;">
            <span class="he-badge" style="color:var(--he-accent);">点击查看该分支全部记忆详情 →</span>
          </div>
        </div>
      `).join('');
      return;
    }

    // 第三层：完整分段阅读该分支的所有记忆详情 + 操作按钮
    if (shelfNav.level === 3) {
      const item = shelf?.[shelfNav.charName]?.[shelfNav.chatId];
      if (!item) {
        shelfNav.level = 2;
        renderShelfView();
        return;
      }
      if (crumb) crumb.textContent = `${shelfNav.charName} > ${shelfNav.chatId} · 完整记忆档案详情`;
      if (backBtn) backBtn.style.display = 'inline-flex';
      if (searchInput) searchInput.style.display = 'none';

      const st = item.structured;
      let detailHtml = '';
      if (st) {
        const profsHtml = (st.profiles || []).map(p => `
          <div class="he-read-block"><b>【${escapeHtml(p.name)}】</b>\n• 潜台词心声：「${escapeHtml(p.innerVoice || '无')}」\n• 当下心境：${escapeHtml(p.selfBase || '无')}\n• 表层认知：${escapeHtml(p.surfaceView || '无')}\n• 潜意识双标：${escapeHtml(p.subconscious || '无')}\n• 核心触动锚点：\n${escapeHtml(p.anchors || '无')}</div>
        `).join('');

        const actsHtml = (st.acts || []).length
          ? st.acts.map((a, i) => `<div class="he-read-block"><b>第 ${i + 1} 幕 · ${escapeHtml(a.title || '')}</b>\n${escapeHtml(a.summary || '')}</div>`).join('')
          : `<div class="he-hint">暂无分幕卷宗</div>`;

        detailHtml = `
          <div class="he-label"><span>一、角色心智档案</span></div>
          ${profsHtml}
          <div class="he-label"><span>二、暗线底牌与防吃书铁律</span></div>
          <div class="he-read-block">• 真相/暗线：${escapeHtml(st.secretLedger?.truthAndMask || '无')}\n• 已掌握线索：${escapeHtml(st.secretLedger?.charClues || '无')}\n• 防吃书黑名单：${escapeHtml(st.secretLedger?.hardFacts || '无')}</div>
          <div class="he-label"><span>三、分幕剧情卷宗（共 ${(st.acts || []).length} 幕）</span></div>
          ${actsHtml}
          <div class="he-label"><span>四、切口快照与人物名册</span></div>
          <div class="he-read-block">• 切口场景：${escapeHtml(st.snapshot?.sceneBridge || '无')}\n• 衣着身体：${escapeHtml(st.snapshot?.attireAndBody || '无')}\n• 道具待办：${escapeHtml(st.snapshot?.itemsAndTodos || '无')}\n• 登场人物：${escapeHtml(st.npcs || '无')}</div>
        `;
      } else {
        detailHtml = `<div class="he-read-block">${escapeHtml(item.fullText || '')}</div>`;
      }

      wrap.innerHTML = `
        <div class="he-row" style="justify-content:space-between; margin-bottom:4px;">
          <div class="he-row">
            <button class="he-btn he-btn-primary" data-act="shelf-to-wb">${ICONS.book} 塞入/导出世界书</button>
            <button class="he-btn" data-act="shelf-import-here">导入覆盖到当前正在聊的窗口</button>
          </div>
          <button class="he-btn he-btn-danger" data-act="shelf-del-branch">${ICONS.trash} 从书架删除此存档</button>
        </div>
        ${detailHtml}
      `;
    }
  }

  function collectFormToData() {
    const d = getChatData();
    const prof = getCurrentProfile(d);
    const val = id => document.getElementById(id)?.value ?? '';

    if (prof) {
      prof.name = val('he-f-profName').trim() || '主控角色';
      const presEl = document.getElementById('he-f-profPresent');
      if (presEl) prof.present = !!presEl.checked;
      prof.innerVoice = val('he-f-innerVoice');
      prof.selfBase = val('he-f-selfBase');
      prof.surfaceView = val('he-f-surfaceView');
      prof.subconscious = val('he-f-subconscious');
      prof.anchors = val('he-f-anchors');
    }

    d.userNote.attitude = val('he-f-userAttitude');
    d.userNote.bottomLine = val('he-f-userBottomLine');

    d.secretLedger.truthAndMask = val('he-f-truthAndMask');
    d.secretLedger.charClues = val('he-f-charClues');
    d.secretLedger.hardFacts = val('he-f-hardFacts');

    d.snapshot.sceneBridge = val('he-f-sceneBridge');
    d.snapshot.attireAndBody = val('he-f-attireAndBody');
    d.snapshot.itemsAndTodos = val('he-f-itemsAndTodos');
    d.npcs = val('he-f-npcs');
    d.injectMode = val('he-f-injectMode') || 'silent';

    document.querySelectorAll('#he-acts-list [data-act-index]').forEach(card => {
      const idx = parseInt(card.getAttribute('data-act-index'), 10);
      if (!d.acts[idx]) return;
      const titleEl = card.querySelector('.he-act-title');
      const sumEl = card.querySelector('.he-act-summary');
      const chkEl = card.querySelector('.he-act-check');
      if (titleEl) d.acts[idx].title = titleEl.value;
      if (sumEl) d.acts[idx].summary = sumEl.value;
      if (chkEl) d.acts[idx].checked = chkEl.checked;
    });

    globalSettings.baseUrl = val('he-set-baseUrl');
    globalSettings.apiKey = val('he-set-apiKey');
    globalSettings.model = val('he-set-model');
    globalSettings.autoInterval = parseInt(val('he-set-autoInterval'), 10) || 0;
    globalSettings.customPrompt = val('he-set-prompt') || BUILTIN_PROMPTS[0].content;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // =========================================================================
  // 十、全局交互绑定（含二次确认防误触、API/提示词多预设切换、书架三层点击）
  // =========================================================================
  function bindEvents() {
    const root = document.getElementById('he-root');
    if (!root) return;

    // 1. 悬浮球拖拽 + 左右边缘自动贴边半隐藏
    const fab = document.getElementById('he-fab');
    let startX = 0, startY = 0, dragged = false, isDown = false;
    if (fab) {
      fab.addEventListener('pointerdown', e => {
        isDown = true;
        dragged = false;
        startX = e.clientX;
        startY = e.clientY;
        fab.classList.remove('he-dock-left', 'he-dock-right');
        try { fab.setPointerCapture(e.pointerId); } catch (_) {}
      });
      fab.addEventListener('pointermove', e => {
        if (!isDown) return;
        if (Math.abs(e.clientX - startX) > 6 || Math.abs(e.clientY - startY) > 6) {
          dragged = true;
          const bottom = Math.max(10, Math.min(window.innerHeight - 54, window.innerHeight - e.clientY - 22));
          const left = Math.max(0, Math.min(window.innerWidth - 44, e.clientX - 22));
          fab.style.left = left + 'px';
          fab.style.right = 'auto';
          fab.style.bottom = bottom + 'px';
        }
      });
      fab.addEventListener('pointerup', e => {
        if (!isDown) return;
        isDown = false;
        if (dragged) {
          const bottom = Math.max(10, Math.min(window.innerHeight - 54, window.innerHeight - e.clientY - 22));
          const distLeft = e.clientX;
          const distRight = window.innerWidth - e.clientX;
          if (distLeft <= 42) {
            globalSettings.fabPos = { side: 'left', left: 0, bottom, docked: true };
          } else if (distRight <= 42) {
            globalSettings.fabPos = { side: 'right', right: 0, bottom, docked: true };
          } else if (distLeft < distRight) {
            globalSettings.fabPos = { side: 'left', left: Math.max(8, distLeft - 22), bottom, docked: false };
          } else {
            globalSettings.fabPos = { side: 'right', right: Math.max(8, distRight - 22), bottom, docked: false };
          }
          saveGlobalSettings();
          applyFabPosition();
        }
      });
      fab.addEventListener('click', e => {
        if (dragged) { e.stopPropagation(); return; }
        if (globalSettings.fabPos?.docked) {
          globalSettings.fabPos.docked = false;
          if (globalSettings.fabPos.side === 'left') globalSettings.fabPos.left = 14;
          else globalSettings.fabPos.right = 14;
          saveGlobalSettings();
          applyFabPosition();
        }
        openPanel();
      });
    }

    // 2. 安卓键盘弹出“屏幕中线定位法”
    const bodyEl = document.getElementById('he-body');
    root.addEventListener('focusin', e => {
      const t = e.target;
      if (!t || (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA')) return;
      if (t.id === 'he-zoom-textarea') return;
      const rect = t.getBoundingClientRect();
      const mid = window.innerHeight / 2;
      if (rect.bottom > mid && bodyEl) {
        bodyEl.style.paddingBottom = Math.round(rect.bottom - mid + 40) + 'px';
      }
    });
    root.addEventListener('focusout', () => {
      if (bodyEl) bodyEl.style.paddingBottom = '';
    });

    document.getElementById('he-shelf-search')?.addEventListener('input', () => renderShelfView());
    document.getElementById('he-model-select')?.addEventListener('change', e => {
      const inp = document.getElementById('he-set-model');
      if (inp && e.target.value) inp.value = e.target.value;
    });

    // API 预设切换下拉监听
    document.getElementById('he-api-preset-select')?.addEventListener('change', e => {
      const id = e.target.value;
      const found = globalSettings.apiPresets.find(p => p.id === id);
      if (found) {
        globalSettings.activeApiPresetId = id;
        globalSettings.baseUrl = found.baseUrl;
        globalSettings.apiKey = found.apiKey;
        globalSettings.model = found.model;
        saveGlobalSettings();
        renderPanelFromData();
        setStatus(`已切换至 API 预设【${found.name}】`);
      }
    });

    // 提示词预设切换下拉监听
    document.getElementById('he-prompt-preset-select')?.addEventListener('change', e => {
      const id = e.target.value;
      const found = globalSettings.promptPresets.find(p => p.id === id);
      if (found) {
        globalSettings.activePromptId = id;
        globalSettings.customPrompt = found.content;
        saveGlobalSettings();
        renderPanelFromData();
        setStatus(`已切换至提示词预设【${found.name}】`);
      }
    });

    document.getElementById('he-submodal-close')?.addEventListener('click', closeSubModal);
    document.getElementById('he-submodal')?.addEventListener('click', e => {
      if (e.target.id === 'he-submodal') closeSubModal();
    });
    document.getElementById('he-backdrop')?.addEventListener('click', e => {
      if (e.target.id === 'he-backdrop') closePanel();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (document.getElementById('he-submodal')?.classList.contains('he-open')) closeSubModal();
        else closePanel();
      }
    });

    // 3. 全局事件委托
    root.addEventListener('click', async e => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const act = btn.getAttribute('data-act');
      const d = getChatData();

      if (act === 'close-panel') {
        closePanel();
      } else if (act === 'toggle-fullscreen') {
        toggleFullscreen();
      } else if (act === 'zoom-field') {
        const targetEl = document.getElementById(btn.getAttribute('data-target'));
        openFieldZoomEditor(targetEl, btn.getAttribute('data-title'));
      } else if (act === 'zoom-act') {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const ta = document.getElementById('he-act-ta-' + idx);
        openFieldZoomEditor(ta, `第 ${idx + 1} 幕剧情卷宗`);
      } else if (act === 'switch-tab') {
        collectFormToData();
        currentTab = btn.getAttribute('data-tab') || 'mind';
        root.querySelectorAll('.he-tab').forEach(t => t.classList.toggle('he-active', t.getAttribute('data-tab') === currentTab));
        root.querySelectorAll('.he-pane').forEach(p => p.classList.toggle('he-active', p.getAttribute('data-pane') === currentTab));
        renderPanelFromData();
      } else if (act === 'open-shelf') {
        collectFormToData();
        currentTab = 'shelf';
        shelfNav = { level: 1, charName: '', chatId: '' };
        root.querySelectorAll('.he-tab').forEach(t => t.classList.remove('he-active'));
        root.querySelectorAll('.he-pane').forEach(p => p.classList.toggle('he-active', p.getAttribute('data-pane') === 'shelf'));
        renderShelfView();
      } else if (act === 'shelf-open-char') {
        shelfNav = { level: 2, charName: btn.getAttribute('data-char') || '', chatId: '' };
        renderShelfView();
      } else if (act === 'shelf-open-branch') {
        shelfNav = { level: 3, charName: btn.getAttribute('data-char') || '', chatId: btn.getAttribute('data-chat') || '' };
        renderShelfView();
      } else if (act === 'shelf-back') {
        shelfNav.level = Math.max(1, shelfNav.level - 1);
        renderShelfView();
      } else if (act === 'shelf-to-wb') {
        const item = loadShelf()?.[shelfNav.charName]?.[shelfNav.chatId];
        if (item) await openWorldBookModal(item.fullText, item.charName);
      } else if (act === 'shelf-import-here') {
        const item = loadShelf()?.[shelfNav.charName]?.[shelfNav.chatId];
        if (!item?.structured) return;
        openConfirmDialog('导入书架存档到当前聊天', `确定将【${escapeHtml(item.charName)} · ${escapeHtml(item.chatId)}】的记忆覆盖导入到当前窗口吗？（当前窗口原数据将自动备份进时光机）`, '确认导入', () => {
          pushHistorySnapshot('导入书架存档前备份');
          Object.assign(d, JSON.parse(JSON.stringify(item.structured)));
          saveChatData();
          currentTab = 'mind';
          root.querySelectorAll('.he-tab').forEach(t => t.classList.toggle('he-active', t.getAttribute('data-tab') === 'mind'));
          root.querySelectorAll('.he-pane').forEach(p => p.classList.toggle('he-active', p.getAttribute('data-pane') === 'mind'));
          renderPanelFromData();
          setStatus('已从书架导入该存档至当前窗口！');
        });
      } else if (act === 'shelf-del-branch') {
        openConfirmDialog('删除书架记录', `确定从总书架移除【${escapeHtml(shelfNav.chatId)}】的快照吗？（不影响原聊天文件）`, '确认删除', () => {
          const shelf = loadShelf();
          if (shelf?.[shelfNav.charName]) {
            delete shelf[shelfNav.charName][shelfNav.chatId];
            if (!Object.keys(shelf[shelfNav.charName]).length) delete shelf[shelfNav.charName];
            localStorage.setItem(STORAGE_SHELF_KEY, JSON.stringify(shelf));
          }
          shelfNav.level = 1;
          renderShelfView();
        });
      } else if (act === 'open-history') {
        collectFormToData();
        openHistoryModal(d);
      } else if (act === 'open-floor-mgr') {
        collectFormToData();
        saveChatData();
        openFloorManageModal(d);
      } else if (act === 'open-wb-modal') {
        collectFormToData();
        saveChatData();
        await openWorldBookModal(buildFormattedPromptBlock(d, false), getCtx().name2 || '角色');
      } else if (act === 'fill-new-floors') {
        const total = (getCtx().chat || []).length;
        const nextStart = d.lastSummarizedFloor >= 0 ? d.lastSummarizedFloor + 1 : 0;
        if (nextStart >= total) {
          setStatus(`上次已总结至第 ${d.lastSummarizedFloor} 楼，目前还没有产生新的对话楼层`, true);
          return;
        }
        document.getElementById('he-sum-start').value = String(nextStart);
        document.getElementById('he-sum-end').value = String(total - 1);
        setStatus(`已自动填入新增楼层范围：第 ${nextStart} ~ ${total - 1} 楼！`);
      } else if (act === 'select-prof') {
        collectFormToData();
        d.activeCharIdx = parseInt(btn.getAttribute('data-idx'), 10) || 0;
        renderPanelFromData();
      } else if (act === 'add-prof') {
        collectFormToData();
        const newName = window.prompt('请输入新增攻略/同场角色的名字：', '新角色 ' + (d.profiles.length + 1));
        if (!newName) return;
        d.profiles.push(createSingleProfile(newName.trim()));
        d.activeCharIdx = d.profiles.length - 1;
        saveChatData();
        renderPanelFromData();
      } else if (act === 'delete-prof') {
        if (d.profiles.length <= 1) { setStatus('至少需保留 1 个角色心智卡', true); return; }
        collectFormToData();
        const curName = getCurrentProfile(d).name;
        openConfirmDialog('删除角色子卡', `确定删除【${escapeHtml(curName)}】的心智卡吗？（可从历史时光机恢复）`, '确认删除', () => {
          pushHistorySnapshot('删除角色卡前备份');
          d.profiles.splice(d.activeCharIdx, 1);
          d.activeCharIdx = 0;
          saveChatData();
          renderPanelFromData();
        });
      } else if (act === 'toggle-prof-lock') {
        collectFormToData();
        const p = getCurrentProfile(d);
        if (p) p.locked = !p.locked;
        saveChatData();
        renderPanelFromData();
      } else if (act === 'set-init-gear') {
        collectFormToData();
        d.initiativeGear = parseInt(btn.getAttribute('data-gear'), 10) || 1;
        saveChatData();
        renderPanelFromData();
      } else if (act === 'set-gear') {
        collectFormToData();
        d.secretGear = parseInt(btn.getAttribute('data-gear'), 10) || 2;
        saveChatData();
        renderPanelFromData();
      } else if (act === 'set-action-lock') {
        collectFormToData();
        d.actionLock = btn.getAttribute('data-val') || 'normal';
        saveChatData();
        renderPanelFromData();
      } else if (act === 'cycle-theme') {
        const order = ['auto', 'dark', 'light'];
        globalSettings.theme = order[(order.indexOf(globalSettings.theme) + 1) % order.length];
        saveGlobalSettings();
        applyThemeClass();
      } else if (act === 'toggle-lock') {
        collectFormToData();
        const k = btn.getAttribute('data-lock');
        if (k) d.locks[k] = !d.locks[k];
        saveChatData();
        renderPanelFromData();
      } else if (act === 'add-act') {
        collectFormToData();
        d.acts.push({ id: 'act_' + Date.now(), title: '手写分幕', summary: '', checked: false });
        saveChatData();
        renderActsList(d);
      } else if (act === 'delete-act') {
        collectFormToData();
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        openConfirmDialog('删除分幕卷宗', `确定删除第 ${idx + 1} 幕吗？（可从历史时光机找回）`, '确认删除', () => {
          pushHistorySnapshot('删除分幕前备份');
          d.acts.splice(idx, 1);
          saveChatData();
          renderActsList(d);
        });
      } else if (act === 'merge-selected-acts') {
        collectFormToData();
        const selectedIndices = [];
        d.acts.forEach((a, idx) => { if (a.checked) selectedIndices.push(idx); });
        if (selectedIndices.length < 2) {
          setStatus('请至少打勾选择 2 个需要合并的分幕卷宗', true);
          return;
        }
        openConfirmDialog(
          '调用 AI 合并勾选分幕',
          `即将调用 AI 将你勾选的 <b>第 ${selectedIndices.map(i => i + 1).join('、')} 幕</b> 浓缩合并为 1 幕（未勾选的分幕原样保留，合并前自动存入历史时光机）。确定消耗一次 API 请求执行吗？`,
          '确认合并',
          () => handleMergeSelectedActs(d, selectedIndices)
        );
      } else if (act === 'hide-floors' || act === 'unhide-floors') {
        const toHide = act === 'hide-floors';
        const sRaw = document.getElementById('he-hide-start')?.value;
        const eRaw = document.getElementById('he-hide-end')?.value;
        openConfirmDialog(
          toHide ? '隐藏指定聊天楼层' : '恢复显示聊天楼层',
          `确定要<b>${toHide ? '隐藏' : '恢复显示'}</b>第 <b>${escapeHtml(sRaw || '0')} ~ ${escapeHtml(eRaw || '末尾')}</b> 楼吗？`,
          toHide ? '确认隐藏' : '确认恢复显示',
          () => handleHideOrUnhideFloors(toHide)
        );
      } else if (act === 'save-all') {
        pushHistorySnapshot('手动保存备份');
        collectFormToData();
        saveGlobalSettings();
        saveChatData();
        renderPanelFromData();
        setStatus('全部改动已落盘，并已同步至角色书架与时光机！');
      } else if (act === 'run-summary') {
        collectFormToData();
        saveGlobalSettings();
        const startVal = document.getElementById('he-sum-start')?.value;
        const endVal = document.getElementById('he-sum-end')?.value;
        const skipVal = document.getElementById('he-sum-skip')?.value;
        const slice = extractChatSliceText(startVal, endVal, skipVal);
        if (!slice.count) {
          setStatus('所选楼层范围内没有可提炼的可见对话', true);
          return;
        }
        openConfirmDialog(
          '调用 AI 提炼总结',
          `即将读取第 <b>${slice.actualStart} ~ ${slice.actualEnd}</b> 楼（共 <b>${slice.count}</b> 条有效消息）调用模型 <code>${escapeHtml(globalSettings.model || '未配置')}</code> 提炼总结。<br><small style="color:var(--he-muted);">生成后不会直接覆盖存档，会先进入预览模式供你检查修改。</small>`,
          '开始提炼',
          () => executeSummaryRequest(d, slice)
        );
      } else if (act === 'confirm-preview') {
        if (!previewDraft) return;
        pushHistorySnapshot('AI总结生效前备份');
        applyDraftToChatData(d, previewDraft);
        previewDraft = null;
        document.getElementById('he-preview-box').style.display = 'none';
        saveChatData();
        renderPanelFromData();
        if (d.injectMode === 'floor') {
          openFloorManageModal(d);
        } else {
          setStatus('新总结已正式生效并追加新一幕！可随时在顶栏「历史时光机」来回切换版本');
        }
      } else if (act === 'cancel-preview') {
        previewDraft = null;
        document.getElementById('he-preview-box').style.display = 'none';
        renderPanelFromData();
        setStatus('已放弃本次生成结果，恢复原内容');
      } else if (act === 'save-api-preset') {
        collectFormToData();
        const pName = window.prompt('请为当前 API 配置起一个预设名称：', globalSettings.model || '我的API配置');
        if (!pName) return;
        const newId = 'api_' + Date.now();
        globalSettings.apiPresets.push({
          id: newId,
          name: pName.trim(),
          baseUrl: globalSettings.baseUrl,
          apiKey: globalSettings.apiKey,
          model: globalSettings.model
        });
        globalSettings.activeApiPresetId = newId;
        saveGlobalSettings();
        renderPanelFromData();
        setStatus(`已保存 API 预设【${pName.trim()}】`);
      } else if (act === 'del-api-preset') {
        const curId = document.getElementById('he-api-preset-select')?.value;
        if (!curId) return;
        globalSettings.apiPresets = globalSettings.apiPresets.filter(p => p.id !== curId);
        globalSettings.activeApiPresetId = '';
        saveGlobalSettings();
        renderPanelFromData();
      } else if (act === 'save-prompt-preset') {
        collectFormToData();
        const pName = window.prompt('请为当前提示词起一个预设名称：', '自定义提示词 ' + (globalSettings.promptPresets.length + 1));
        if (!pName) return;
        const newId = 'prm_' + Date.now();
        globalSettings.promptPresets.push({
          id: newId,
          name: pName.trim(),
          content: globalSettings.customPrompt
        });
        globalSettings.activePromptId = newId;
        saveGlobalSettings();
        renderPanelFromData();
        setStatus(`已保存提示词预设【${pName.trim()}】`);
      } else if (act === 'del-prompt-preset') {
        const curId = document.getElementById('he-prompt-preset-select')?.value;
        if (!curId || globalSettings.promptPresets.length <= 1) {
          setStatus('至少保留一套提示词预设', true);
          return;
        }
        globalSettings.promptPresets = globalSettings.promptPresets.filter(p => p.id !== curId);
        globalSettings.activePromptId = globalSettings.promptPresets[0].id;
        globalSettings.customPrompt = globalSettings.promptPresets[0].content;
        saveGlobalSettings();
        renderPanelFromData();
      } else if (act === 'fetch-models') {
        collectFormToData();
        await handleFetchModels();
      } else if (act === 'reset-prompt') {
        globalSettings.customPrompt = BUILTIN_PROMPTS[0].content;
        globalSettings.activePromptId = 'default_echo';
        saveGlobalSettings();
        renderPanelFromData();
        setStatus('已恢复内置默认提示词');
      }
    });
  }

  function handleHideOrUnhideFloors(toHide) {
    const ctx = getCtx();
    const chat = ctx.chat || [];
    if (!chat.length) return;
    const s = Math.max(0, parseInt(document.getElementById('he-hide-start')?.value, 10) || 0);
    const eRaw = parseInt(document.getElementById('he-hide-end')?.value, 10);
    const e = Math.min(chat.length - 1, isNaN(eRaw) ? chat.length - 1 : eRaw);
    if (s > e) { setStatus('起始楼层不能大于结束楼层', true); return; }

    let count = 0;
    for (let i = s; i <= e; i++) {
      if (chat[i]) { chat[i].is_system = !!toHide; count++; }
    }
    saveChatData();
    try { ctx.reloadCurrentChat?.(); } catch (_) {}
    setStatus(toHide ? `已隐藏第 ${s} ~ ${e} 楼（共 ${count} 楼）` : `已恢复显示第 ${s} ~ ${e} 楼（共 ${count} 楼）`);
  }

  async function executeSummaryRequest(d, slice) {
    const noteVal = document.getElementById('he-sum-note')?.value;
    const presentNames = (d.profiles || []).filter(p => p.present !== false).map(p => p.name || '主控角色');

    setStatus(`正在提炼第 ${slice.actualStart}~${slice.actualEnd} 楼剧情与心智微变...`);
    const sysPrompt = (globalSettings.customPrompt || BUILTIN_PROMPTS[0].content) + '\n\n' + getSpanRuleText(slice.count, noteVal, presentNames);
    const userPayload = `【既有心智与账本参考】\n${buildFormattedPromptBlock(d, false)}\n\n【待总结新增对话（共${slice.count}楼）】\n${slice.text}`;

    const aiRaw = await callCleanLLM(sysPrompt, userPayload);
    if (!aiRaw) return;

    const parsed = parseAiJson(aiRaw);
    if (!parsed) {
      setStatus('AI 返回结果未能解析为 JSON，请重试或换模型', true);
      return;
    }

    parsed._summarizedEndFloor = slice.actualEnd;
    previewDraft = parsed;

    currentTab = 'npcs';
    const root = document.getElementById('he-root');
    root.querySelectorAll('.he-tab').forEach(t => t.classList.toggle('he-active', t.getAttribute('data-tab') === 'npcs'));
    root.querySelectorAll('.he-pane').forEach(p => p.classList.toggle('he-active', p.getAttribute('data-pane') === 'npcs'));
    document.getElementById('he-preview-box').style.display = 'block';

    applyMindPreviewToProfiles(d, parsed);
    if (parsed.secretLedger) {
      document.getElementById('he-f-truthAndMask').value = parsed.secretLedger.truthAndMask || d.secretLedger.truthAndMask;
      document.getElementById('he-f-charClues').value = parsed.secretLedger.charClues || d.secretLedger.charClues;
      if (!d.locks.hardFacts) {
        document.getElementById('he-f-hardFacts').value = parsed.secretLedger.hardFacts || d.secretLedger.hardFacts;
      }
    }
    if (parsed.snapshot) {
      document.getElementById('he-f-sceneBridge').value = parsed.snapshot.sceneBridge || d.snapshot.sceneBridge;
      document.getElementById('he-f-attireAndBody').value = parsed.snapshot.attireAndBody || d.snapshot.attireAndBody;
      document.getElementById('he-f-itemsAndTodos').value = parsed.snapshot.itemsAndTodos || d.snapshot.itemsAndTodos;
    }
    if (parsed.npcs) document.getElementById('he-f-npcs').value = parsed.npcs;

    setStatus('提炼完成！可在各页签检查微调，确认后点「确认应用本次总结」');
  }

  function applyMindPreviewToProfiles(d, parsed) {
    const list = Array.isArray(parsed.characterMinds)
      ? parsed.characterMinds
      : (parsed.charMind ? [Object.assign({ name: getCurrentProfile(d).name }, parsed.charMind)] : []);

    list.forEach(item => {
      if (!item) return;
      let target = d.profiles.find(p => p.name && item.name && (p.name.includes(item.name) || item.name.includes(p.name)));
      if (!target && d.profiles.length === 1) target = d.profiles[0];
      if (!target && item.name) {
        target = createSingleProfile(item.name);
        d.profiles.push(target);
      }
      if (target && !target.locked) {
        target.selfBase = item.selfBase || target.selfBase;
        target.surfaceView = item.surfaceView || target.surfaceView;
        target.subconscious = item.subconscious || target.subconscious;
        target.innerVoice = item.innerVoice || target.innerVoice;
        target.anchors = item.anchors || target.anchors;
      }
    });

    const cur = getCurrentProfile(d);
    if (cur) {
      document.getElementById('he-f-innerVoice').value = cur.innerVoice;
      document.getElementById('he-f-selfBase').value = cur.selfBase;
      document.getElementById('he-f-surfaceView').value = cur.surfaceView;
      document.getElementById('he-f-subconscious').value = cur.subconscious;
      document.getElementById('he-f-anchors').value = cur.anchors;
    }
    renderCharSubtabs(d);
  }

  function applyDraftToChatData(d, draft) {
    collectFormToData();
    if (typeof draft._summarizedEndFloor === 'number') {
      d.lastSummarizedFloor = Math.max(d.lastSummarizedFloor, draft._summarizedEndFloor);
    }
    if (draft?.newAct?.summary) {
      d.acts.push({
        id: 'act_' + Date.now(),
        title: draft.newAct.title || (`第 ${d.acts.length + 1} 阶段`),
        summary: draft.newAct.summary,
        checked: false
      });
    }
  }

  async function handleMergeSelectedActs(d, selectedIndices) {
    setStatus(`正在浓缩合并勾选的 ${selectedIndices.length} 幕卷宗...`);
    const toMergeText = selectedIndices.map(i => `【第${i + 1}幕 · ${d.acts[i].title}】\n${d.acts[i].summary}`).join('\n\n');
    const sys = '你是专业叙事归档师。请将用户勾选的这几幕剧情浓缩合并为一段脉络清晰、保留时间节点与情感转折的精炼卷宗（300字以内），直接输出合并正文。';
    const mergedText = await callCleanLLM(sys, toMergeText);
    if (!mergedText) return;

    pushHistorySnapshot('合并分幕前自动备份');
    const firstIdx = selectedIndices[0];
    const mergedTitle = selectedIndices.map(i => d.acts[i].title).filter(Boolean).join(' + ');
    d.acts[firstIdx] = { id: 'act_' + Date.now(), title: mergedTitle || '合并卷宗', summary: mergedText.trim(), checked: false };
    for (let k = selectedIndices.length - 1; k >= 1; k--) {
      d.acts.splice(selectedIndices[k], 1);
    }
    saveChatData();
    renderActsList(d);
    const mounted = findMountedSummaryFloors();
    setStatus(mounted.length
      ? `合并完成！检测到第 ${mounted.join(',')} 楼有旧总结，可点底栏「楼层挂载/单删」一键原地刷新该楼！`
      : '勾选分幕合并完成！旧版本已存入历史时光机');
  }

  async function handleFetchModels() {
    const base = String(globalSettings.baseUrl || '').trim().replace(/\/+$/, '');
    const key = String(globalSettings.apiKey || '').trim();
    if (!base || !key) { setStatus('请先填写 API Base URL 和 API Key', true); return; }
    setStatus('正在拉取模型列表...');
    const urls = base.endsWith('/v1') ? [base + '/models'] : [base + '/v1/models', base + '/models'];
    for (const u of urls) {
      try {
        const res = await fetch(u, { headers: { 'Authorization': 'Bearer ' + key } });
        if (!res.ok) continue;
        const data = await res.json();
        const list = Array.isArray(data?.data) ? data.data.map(m => m.id).filter(Boolean) : [];
        if (list.length) {
          const sel = document.getElementById('he-model-select');
          if (sel) {
            sel.style.display = 'inline-block';
            sel.innerHTML = list.map(id => `<option value="${escapeHtml(id)}">${escapeHtml(id)}</option>`).join('');
            document.getElementById('he-set-model').value = list[0];
          }
          setStatus(`成功拉取 ${list.length} 个模型！`);
          return;
        }
      } catch (_) {}
    }
    setStatus('拉取模型列表失败，请手动输入模型名', true);
  }

  // =========================================================================
  // 十一、事件监听与三明治静默注入
  // =========================================================================
  function bindTavernEvents() {
    const ctx = getCtx();
    const eventSource = ctx.eventSource || window.eventSource;
    const event_types = ctx.event_types || window.event_types;
    if (!eventSource || !event_types) return;

    if (event_types.CHAT_COMPLETION_PROMPT_READY) {
      eventSource.on(event_types.CHAT_COMPLETION_PROMPT_READY, eventData => {
        try {
          const d = getChatData();
          if (d.injectMode === 'none') return;
          if (hasVisibleFloorSummary(ctx.chat)) return;

          const promptBlock = buildFormattedPromptBlock(d, false);
          if (!promptBlock || promptBlock.length < 60) return;

          const chatMsgs = eventData?.chat;
          if (Array.isArray(chatMsgs)) {
            const insertIdx = chatMsgs.length > 1 ? 1 : chatMsgs.length;
            chatMsgs.splice(insertIdx, 0, { role: 'system', content: promptBlock });
          }
        } catch (e) {
          console.warn('[HeartEcho] prompt injection warning:', e);
        }
      });
    }

    const msgEvt = event_types.MESSAGE_RECEIVED || event_types.MESSAGE_UPDATED || event_types.MESSAGE_SENT;
    if (msgEvt) {
      eventSource.on(msgEvt, () => {
        try {
          const interval = parseInt(globalSettings.autoInterval, 10) || 0;
          const len = (getCtx().chat || []).length;
          if (interval > 0 && len > 0 && len % interval === 0) {
            const fab = document.getElementById('he-fab');
            if (fab) fab.style.borderColor = 'var(--he-ok)';
          }
        } catch (_) {}
      });
    }
  }

  // =========================================================================
  // 十二、三重保险幂等启动
  // =========================================================================
  let doneInit = false;
  function fireInit() {
    if (doneInit) return;
    doneInit = true;
    try {
      loadGlobalSettings();
      mountUI();
      bindEvents();
      bindTavernEvents();
      console.log(`[${PLUGIN_NAME}] v${PLUGIN_VERSION} initialized successfully.`);
    } catch (e) {
      console.warn('[HeartEcho] init error:', e);
    }
  }

  const initCtx = getCtx();
  const initEs = initCtx.eventSource || window.eventSource;
  const initEt = initCtx.event_types || window.event_types;
  if (initEs && initEt && initEt.APP_READY) {
    initEs.on(initEt.APP_READY, fireInit);
  }
  const t0 = Date.now();
  const iv = setInterval(() => {
    const ok = !!window.extension_settings || !!window.SillyTavern;
    if (ok || Date.now() - t0 > 3500) {
      clearInterval(iv);
      fireInit();
    }
  }, 250);
})();
