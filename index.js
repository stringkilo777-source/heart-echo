(function () {
  'use strict';

  // =========================================================================
  // 一、常量与安全上下文获取
  // =========================================================================
  const PLUGIN_ID = 'heart-echo';
  const PLUGIN_NAME = '心语回响';
  const PLUGIN_VERSION = '1.1.0';
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

  // 纯内联线性 SVG 图标库（零 Emoji，跨设备统一）
  const ICONS = {
    echo: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10z"/><path d="M2 12h2m16 0h2M5 5l1.5 1.5M19 5l-1.5 1.5"/></svg>',
    close: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    max: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>',
    min: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>',
    lock: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    unlock: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.4-2"/></svg>',
    shelf: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    spark: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3v4m0 10v4M3 12h4m10 0h4m-2.6-6.4l-2.8 2.8m-5.2 5.2l-2.8 2.8m0-10.8l2.8 2.8m5.2 5.2l2.8 2.8"/></svg>',
    plus: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    trash: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2m-9 0v14h10V6"/></svg>',
    undo: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>',
    send: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
    eyeOff: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>',
    eye: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
  };

  // =========================================================================
  // 二、默认提示词与默认数据结构（支持多人卡 profiles）
  // =========================================================================
  const DEFAULT_PROMPT = `你是「心语回响」叙事与心智归档师。请读取提供的对话内容，结合既有记忆档案，输出严格符合以下 JSON 结构的更新数据（只输出合法 JSON，不要输出任何代码块标记或多余解释文字）：

【核心铁律】
1. 拒绝流水账与好感百分比：严禁使用百分比数字！用细腻的心理拉扯、性格底色守恒下的当下微变、嘴硬心软或下意识偏袒动作来刻画感情。
2. 认知隔离与掉马/伏笔保护：严格区分【客观事实/暗线底牌】与【角色目前仅知的线索】。角色不知情的马甲、伪装性别、秘密筹备，绝不可混入角色的主观认知中。
3. 多人卡独立归档：请针对当前在场的每位主要角色分别输出对应的心智档案（characterMinds 数组），严禁把 A 角色的经历或心声混到 B 角色名下。
4. 灵魂重影与关键原话：若存在故人替身/死遁重逢/宿命拉扯，重点捕捉角色理智割裂与本能被吸引的瞬间，并在 anchors 中原样保留1-2句最戳心的关键原话台词。
5. 防吃书铁律：严格核对已治愈旧伤、真实战力上限、物资衣着状态，严禁凭空捏造伤病卖惨。

【必须输出的合法 JSON 格式】
{
  "characterMinds": [
    {
      "name": "角色准确名字（必须与当前在场角色名单对齐）",
      "selfBase": "角色当下最新心境与防线的细微松动（覆盖旧状态，只写当前最新处境）",
      "surfaceView": "角色目前以为User是谁、已知哪些表面信息与误判",
      "subconscious": "嘴上/理智态度 vs 行动上的下意识偏袒、双标或灵魂重影恍惚",
      "innerVoice": "以该角色第一人称写一句当下对User最真实、带张力的潜台词心声",
      "anchors": "过去留下的核心触动瞬间与关键原话台词（最多保留4条，新旧择优迭代，格式：[场景/信物] 原话与后遗症反应）"
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

  function createSingleProfile(name) {
    return {
      name: name || '主控角色',
      present: true, // 当前是否在场参与注入与总结
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
      injectMode: 'silent', // 'silent' | 'floor' | 'none'
      actionLock: 'normal', // 'normal' | 'substantive'
      initiativeGear: 1,    // 关系主动推进引擎 1:顺其自然 2:暗宠送礼 3:名分焦灼 4:捅破窗户纸(破99.99%)
      secretGear: 2,        // 通用伏笔/掉马推进器 1:埋种潜伏 2:重影铺垫 3:试探蓄势 4:立即引爆
      activeCharIdx: 0,
      profiles: [createSingleProfile(defaultCharName || '主控角色')],
      locks: {
        userNote: true,
        hardFacts: false
      },
      userNote: {
        attitude: '',
        bottomLine: ''
      },
      secretLedger: {
        truthAndMask: '',
        charClues: '',
        hardFacts: ''
      },
      acts: [],
      snapshot: {
        sceneBridge: '',
        attireAndBody: '',
        itemsAndTodos: ''
      },
      npcs: '',
      history: []
    };
  }

  function createDefaultSettings() {
    return {
      baseUrl: '',
      apiKey: '',
      model: '',
      theme: 'auto',
      showFab: true,
      fabPos: { side: 'right', bottom: 90, docked: false },
      autoInterval: 0,
      customPrompt: DEFAULT_PROMPT
    };
  }

  // =========================================================================
  // 三、数据持久化层（自动兼容 v1.0.0 旧数据无缝升级至多人卡 profiles）
  // =========================================================================
  let globalSettings = createDefaultSettings();
  let currentTab = 'mind';
  let previewDraft = null;
  let isFullscreen = false;

  function loadGlobalSettings() {
    try {
      const ctx = getCtx();
      const extStore = (ctx.extensionSettings || window.extension_settings || {})[PLUGIN_ID];
      const rawLocal = localStorage.getItem(STORAGE_GLOBAL_KEY);
      const parsedLocal = rawLocal ? JSON.parse(rawLocal) : null;
      globalSettings = Object.assign(createDefaultSettings(), extStore || {}, parsedLocal || {});
      if (!globalSettings.fabPos || typeof globalSettings.fabPos !== 'object') {
        globalSettings.fabPos = { side: 'right', bottom: 90, docked: false };
      }
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

    // 兼容 v1.0.0 单人 charMind 无损迁移至 profiles 数组
    if (!Array.isArray(d.profiles) || !d.profiles.length) {
      const migrated = createSingleProfile(defaultName);
      if (d.charMind) {
        migrated.selfBase = d.charMind.selfBase || '';
        migrated.surfaceView = d.charMind.surfaceView || '';
        migrated.subconscious = d.charMind.subconscious || '';
        migrated.innerVoice = d.charMind.innerVoice || '';
        migrated.anchors = d.charMind.anchors || '';
        migrated.locked = !!(d.locks && d.locks.charMind);
      }
      d.profiles = [migrated];
    }

    if (typeof d.activeCharIdx !== 'number' || d.activeCharIdx < 0 || d.activeCharIdx >= d.profiles.length) {
      d.activeCharIdx = 0;
    }
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

  function pushHistorySnapshot(reasonLabel) {
    const d = getChatData();
    const copy = JSON.parse(JSON.stringify({
      time: new Date().toLocaleTimeString(),
      reason: reasonLabel || '操作前自动备份',
      profiles: d.profiles,
      userNote: d.userNote,
      secretLedger: d.secretLedger,
      acts: d.acts,
      snapshot: d.snapshot,
      npcs: d.npcs,
      initiativeGear: d.initiativeGear,
      secretGear: d.secretGear
    }));
    d.history.unshift(copy);
    if (d.history.length > 5) d.history.length = 5;
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
      const chatId = ctx.chatId || ('chat_' + Date.now());
      const oldShelf = loadShelf();
      const oldCount = Object.keys(oldShelf).length;
      const firstProf = chatData.profiles?.[0] || {};

      oldShelf[charName] = oldShelf[charName] || {};
      oldShelf[charName][chatId] = {
        chatId,
        charName,
        updatedAt: new Date().toLocaleString(),
        innerVoice: firstProf.innerVoice || '',
        sceneBridge: chatData.snapshot?.sceneBridge || '',
        actsCount: (chatData.acts || []).length,
        fullText: buildFormattedPromptBlock(chatData, false)
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
  // 四、组装投喂文本（含破 99.99% 关系主动引擎 + 通用伏笔推进器 + 多人卡支持）
  // =========================================================================
  const INITIATIVE_INSTRUCTIONS = {
    1: '【关系推进档位：1档·顺其自然】按当前人设与情感张力自然互动，不强行加速关系定性。',
    2: '【关系推进档位：2档·暗宠与主动关怀】角色必须走出被动对话！主动发起实质生活照顾、筹备贴心礼物/小惊喜、主动邀约或自然提起共同旧事，展现细腻的主动陪伴感。',
    3: '【关系推进档位：3档·醋意与名分焦灼】严禁角色摆出“来日方长/默认User迟早属于自己”的傲慢松弛感！角色必须对“双方尚无正式名分或害怕失去User”产生明显的患得患失、醋意与占有欲，主动试探并渴求确认唯一关系。',
    4: '【关系推进档位：4档·捅破窗户纸/冲破99.99%瓶颈令】严禁再维持模糊暧昧或将好感度卡在99%/99.99%！角色必须在本阶段主动打破僵局，筹划并执行正式告白、正名仪式、求婚或彻底交付底牌，将两人关系实质性推入下一阶段！'
  };

  const SECRET_GEAR_INSTRUCTIONS = {
    1: '【暗线/伏笔推进器：1档·埋种潜伏期】当前严禁提前挑明或引爆暗线/马甲秘密，仅维持表面日常推进。',
    2: '【暗线/伏笔推进器：2档·暗中筹备/重影铺垫期】角色理智上未看穿真相（或事件尚在暗中筹备），但在具体细节、眼神或动作习惯上会产生强烈的灵魂重影与情绪恍惚，制造宿命拉扯感，严禁直接挑明结果。',
    3: '【暗线/伏笔推进器：3档·蓄势待发/违和试探期】暗线或马甲破绽已浮出水面，角色开始频繁产生怀疑并主动设局试探，山雨欲来之势拉满，只差最后临门一脚。',
    4: '【暗线/伏笔推进器：4档·本回合立即引爆】铺垫已满，请结合下方暗线真相在本阶段正面引爆该伏笔/掉马事件，展开高张力情感清算或剧情转折！'
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

    // 1. 在场角色动态心智（支持单人 & 多人卡）
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

    // 关系主动推进引擎指令
    lines.push('- ' + (INITIATIVE_INSTRUCTIONS[d.initiativeGear] || INITIATIVE_INSTRUCTIONS[1]));

    if (d.actionLock === 'substantive') {
      lines.push('- 【防口头挡刀复读机铁律】：面对矛盾或追妻赎罪情境，角色必须做出有实质代价的偏执护短或破局行动！严禁站在原地当道德复读机、严禁空喊“冲我来/杀了我/不碰你/一起死”等逃避式口号！');
    }

    // 2. User 态度备注
    if (d.userNote.attitude || d.userNote.bottomLine) {
      lines.push('### 二、【User立场与设定护栏（角色严禁直接读心看穿，仅从互动细节捉摸）】');
      if (d.userNote.attitude) lines.push('- User当前真实心境张力：' + d.userNote.attitude);
      if (d.userNote.bottomLine) lines.push('- User人设与互动底线：' + d.userNote.bottomLine);
    }

    // 3. 通用暗线/伏笔推进器与防吃书黑名单
    lines.push('### 三、【暗线/伏笔推进器与防吃书物理铁律】');
    lines.push('- ' + (SECRET_GEAR_INSTRUCTIONS[d.secretGear] || SECRET_GEAR_INSTRUCTIONS[2]));
    if (d.secretGear >= 2 && d.secretLedger.truthAndMask) {
      lines.push('- 导演暗线/待推进事件底牌(仅供按档位制造张力，未到4档严禁角色开天眼说破)：' + d.secretLedger.truthAndMask);
    }
    if (d.secretLedger.charClues) lines.push('- 当前已铺垫线索与进度：' + d.secretLedger.charClues);
    if (d.secretLedger.hardFacts) {
      lines.push('- 【不可逆物理/战力/伤病黑名单(严禁违背或乱编旧伤复发卖惨)】：' + d.secretLedger.hardFacts);
    }

    // 4. 分幕卷宗
    const activeActs = (d.acts || []).filter(a => a.summary);
    if (activeActs.length > 0) {
      lines.push('### 四、【过往分幕因果卷宗】');
      activeActs.forEach((a, idx) => {
        lines.push(`- [第${idx + 1}幕 · ${a.title || '阶段记录'}]：${a.summary}`);
      });
    }

    // 5. 切口快照与人物
    lines.push('### 五、【当时情况·切口现场快照（无缝衔接核心）】');
    if (d.snapshot.sceneBridge) lines.push('- 切口场景与情绪余温：' + d.snapshot.sceneBridge);
    if (d.snapshot.attireAndBody) lines.push('- 当下衣着与身体微状态：' + d.snapshot.attireAndBody);
    if (d.snapshot.itemsAndTodos) lines.push('- 关键道具与未完约定：' + d.snapshot.itemsAndTodos);
    if (d.npcs) lines.push('- 重要配角/NPC名册：' + d.npcs);

    if (forFloorDetails) {
      lines.push('</details>');
    } else {
      lines.push('</heart_echo_memory>');
    }

    return forFloorDetails ? lines.join('<br>\n') : lines.join('\n');
  }

  function hasVisibleFloorSummary(chatArr) {
    if (!Array.isArray(chatArr)) return false;
    for (let i = chatArr.length - 1; i >= 0; i--) {
      const m = chatArr[i];
      if (!m || m.is_system) continue;
      const text = String(m.mes || m.content || '');
      if (text.includes(FLOOR_MARK)) return true;
    }
    return false;
  }

  // =========================================================================
  // 五、独立干净的 LLM 请求与楼层切片提取
  // =========================================================================
  async function callCleanLLM(systemPrompt, userContent) {
    const base = String(globalSettings.baseUrl || '').trim().replace(/\/+$/, '');
    const key = String(globalSettings.apiKey || '').trim();
    const model = String(globalSettings.model || '').trim();

    if (!base || !key || !model) {
      setStatus('请先在【设置与API】页签配置 API 地址、密钥与模型名', true);
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
            max_tokens: 2000,
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
        console.warn('[HeartEcho] endpoint try failed:', endpoints[i], e);
      }
    }
    setStatus('LLM 请求失败，请检查 API 地址或网络', true);
    return null;
  }

  function getSpanRuleText(floorCount, extraNote, presentNames) {
    const modeHint = floorCount <= 35
      ? `【本次为短跨度高频更新（共 ${floorCount} 楼）】：请开启「微调防飘模式」——日常寒暄一笔带过，保持角色核心认知稳定，重点精确更新「切口现场快照、衣着微状态与潜台词心声」。`
      : `【本次为长跨度阶段大总结（共 ${floorCount} 楼）】：请开启「长线沉淀模式」——大刀阔斧筛除过渡废话，提炼关键因果转折与关系成长，同时必须精准锁定最后几楼的「切口现场与衣着道具最终状态」以防隐藏前文后断档。`;
    const namesHint = `\n【当前在场主要角色名单（请在 characterMinds 中严格按这些名字归档）】：${presentNames.join('、')}`;
    return modeHint + namesHint + (extraNote ? '\n【用户额外润色叮嘱（最高优先级）】：' + extraNote : '');
  }

  function extractChatSliceText(startFloor, endFloor, skipSpec) {
    const ctx = getCtx();
    const chat = ctx.chat || [];
    if (!chat.length) return { text: '', count: 0 };

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
    return { text: picked.join('\n\n'), count: picked.length };
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
      console.warn('[HeartEcho] JSON parse failed:', e, rawText);
      return null;
    }
  }

  // =========================================================================
  // 六、UI 挂载与渲染（含贴边悬浮球、全屏切换、多人子页签、自由隐藏楼层）
  // =========================================================================
  function mountUI() {
    if (document.getElementById('he-root')) return;

    const root = document.createElement('div');
    root.id = 'he-root';
    root.innerHTML = `
      <!-- 支持左右贴边半隐藏的可拖拽悬浮球 -->
      <div id="he-fab" title="打开心语回响（拖至左右边缘可半隐藏）">${ICONS.echo}</div>

      <!-- 主模态面板 -->
      <div id="he-backdrop">
        <div id="he-panel" role="dialog" aria-label="心语回响记忆面板">
          <!-- 顶栏 -->
          <div class="he-header">
            <div class="he-title-wrap">
              ${ICONS.echo}
              <span>心语回响 · HeartEcho</span>
              <span class="he-badge" id="he-char-badge">当前对话</span>
            </div>
            <div class="he-header-actions">
              <button class="he-btn" data-act="switch-tab" data-tab="shelf" title="跨窗口角色记忆总书架">${ICONS.shelf} 角色书架</button>
              <button class="he-btn" data-act="undo-history" title="一键退回上一档历史快照">${ICONS.undo} 退回上一档</button>
              <button class="he-btn" data-act="cycle-theme" id="he-theme-btn">主题: 跟随</button>
              <button class="he-btn" data-act="toggle-fullscreen" id="he-fs-btn" title="切换全屏展开/窗口还原">${ICONS.max} 全屏</button>
              <button class="he-btn" data-act="close-panel" title="关闭面板">${ICONS.close}</button>
            </div>
          </div>

          <!-- 页签栏 -->
          <div class="he-tabs">
            <button class="he-tab he-active" data-act="switch-tab" data-tab="mind">① 双生心智</button>
            <button class="he-tab" data-act="switch-tab" data-tab="secret">② 暗线与铁律</button>
            <button class="he-tab" data-act="switch-tab" data-tab="acts">③ 分幕卷宗</button>
            <button class="he-tab" data-act="switch-tab" data-tab="snapshot">④ 切口与行囊</button>
            <button class="he-tab" data-act="switch-tab" data-tab="npcs">⑤ 总结与藏楼</button>
            <button class="he-tab" data-act="switch-tab" data-tab="settings">设置与API</button>
          </div>

          <!-- 主体内容区 -->
          <div class="he-body" id="he-body">
            <!-- ① 双生心智（含多人卡子标签 + 关系主动推进引擎） -->
            <div class="he-pane he-active" data-pane="mind">
              <!-- 多人卡角色子标签切换栏 -->
              <div class="he-subtabs" id="he-char-subtabs"></div>

              <div class="he-card">
                <div class="he-card-head">
                  <div class="he-row">
                    <span>当前选中角色：</span>
                    <input class="he-input" id="he-f-profName" style="width:130px; padding:3px 7px;" placeholder="角色名字" />
                    <label class="he-row" style="font-size:12px; color:var(--he-text); cursor:pointer;">
                      <input type="checkbox" id="he-f-profPresent" />
                      <span>当前在场（勾上才参与总结与投喂）</span>
                    </label>
                  </div>
                  <div class="he-row">
                    <button class="he-btn" data-act="toggle-prof-lock" id="he-lock-profBtn"></button>
                    <button class="he-btn he-btn-danger" data-act="delete-prof" title="删除该角色子卡">${ICONS.trash}</button>
                  </div>
                </div>

                <div>
                  <div class="he-label"><span>此刻潜台词心声（第一人称直白心声）</span></div>
                  <input class="he-input" id="he-f-innerVoice" placeholder="例：嘴上嫌她麻烦，视线却总忍不住往她受伤的手腕上飘……" />
                </div>
                <div class="he-grid-2">
                  <div>
                    <div class="he-label"><span>当下最新心境与防线微变（动态覆盖，旧历程沉淀至下方锚点）</span></div>
                    <textarea class="he-textarea" id="he-f-selfBase" placeholder="只记角色当前这一刻的自我处境、执念或心理防线松动状态"></textarea>
                  </div>
                  <div>
                    <div class="he-label"><span>对 User 表层认知（仅角色目前已知信息）</span></div>
                    <textarea class="he-textarea" id="he-f-surfaceView" placeholder="角色目前以为User是谁、存有哪些误判（严禁混入未掉马真相）"></textarea>
                  </div>
                </div>
                <div>
                  <div class="he-label"><span>潜意识态度与灵魂重影（嘴上态度 vs 身体下意识双标）</span></div>
                  <textarea class="he-textarea" id="he-f-subconscious" placeholder="理智上的克制或割裂 vs 行动上的下意识偏袒、护短或透过易容看到的灵魂重影"></textarea>
                </div>
                <div>
                  <div class="he-label"><span>过去沉淀的核心触动锚点与关键原话（最多留4条最戳心瞬间+后遗症）</span></div>
                  <textarea class="he-textarea" id="he-f-anchors" placeholder="[雨夜伞下] 原话：「……」 -> 此后每逢下雨或见User受寒便暗中心软"></textarea>
                </div>
              </div>

              <!-- 关系主动推进引擎（专治万年被动暧昧 & 卡 99.99% 好感度） -->
              <div class="he-card">
                <div class="he-card-head">
                  <span>关系主动推进引擎（专治角色不主动送礼、默认暧昧、好感卡死 99.99%）</span>
                </div>
                <div class="he-gear-group" id="he-init-gear-group">
                  <button class="he-gear-btn" data-act="set-init-gear" data-gear="1">① 顺其自然<br><small>正常拉扯不强推</small></button>
                  <button class="he-gear-btn" data-act="set-init-gear" data-gear="2">② 暗宠主动事件<br><small>主动送礼/关怀/提旧事</small></button>
                  <button class="he-gear-btn" data-act="set-init-gear" data-gear="3">③ 醋意与名分焦灼<br><small>禁松弛感/渴求唯一名分</small></button>
                  <button class="he-gear-btn" data-act="set-init-gear" data-gear="4">④ 捅破窗户纸(破100%)<br><small>禁卡99.99%/主动告白正名</small></button>
                </div>
              </div>

              <div class="he-card">
                <div class="he-card-head">
                  <span>User 态度备注与防口头复读机开关（自带防读心隔离）</span>
                  <button class="he-btn" data-act="toggle-lock" data-lock="userNote" id="he-lock-userNote"></button>
                </div>
                <div class="he-grid-2">
                  <div>
                    <div class="he-label"><span>User 对角色真实情感张力（防 -100 被死板解读成毫无波澜）</span></div>
                    <textarea class="he-textarea" id="he-f-userAttitude" placeholder="例：表面恨入骨髓拒不原谅，实则因旧情未绝而剧烈怨恸（严禁角色直接读心看穿）"></textarea>
                  </div>
                  <div>
                    <div class="he-label"><span>User 人设底线与特殊伪装备注</span></div>
                    <textarea class="he-textarea" id="he-f-userBottomLine" placeholder="例：当前为21岁真身易容潜伏、女扮男装等关键底线"></textarea>
                  </div>
                </div>
                <div class="he-row" style="justify-content: space-between; margin-top: 4px;">
                  <span class="he-label">防口头挡刀复读机开关（治火葬场只会喊“杀了我/冲我来/一起死”）：</span>
                  <select class="he-select" id="he-f-actionLock" style="width: auto;">
                    <option value="normal">常规模式（不额外干预）</option>
                    <option value="substantive">开启强制实质行动（禁口头挡刀说教，必须做出实质割肉行动）</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- ② 暗线与铁律（升级为通用伏笔/掉马四档推进器） -->
            <div class="he-pane" data-pane="secret">
              <div class="he-card">
                <div class="he-card-head">
                  <span>通用伏笔 / 掉马 / 筹备事件四档推进器（控铺垫与引爆速度）</span>
                </div>
                <div class="he-hint">无论是掉马甲、旧忆重提、还是你想让角色暗中铺垫某件事（如筹备生辰宴、酝酿危机），都可写在下方并用四档控制节奏：</div>
                <div class="he-gear-group" id="he-gear-group">
                  <button class="he-gear-btn" data-act="set-gear" data-gear="1">① 埋种潜伏期<br><small>完全保密不提</small></button>
                  <button class="he-gear-btn" data-act="set-gear" data-gear="2">② 重影/暗中铺垫<br><small>制造恍惚与氛围暗示</small></button>
                  <button class="he-gear-btn" data-act="set-gear" data-gear="3">③ 违和/蓄势待发<br><small>察觉破绽频繁试探</small></button>
                  <button class="he-gear-btn" data-act="set-gear" data-gear="4">④ 本回合立即引爆<br><small>彻底揭穿/正面爆发</small></button>
                </div>
                <div class="he-grid-2">
                  <div>
                    <div class="he-label"><span>客观真相 / 马甲底牌 / 想让他铺垫引爆的事件</span></div>
                    <textarea class="he-textarea" id="he-f-truthAndMask" placeholder="记录上帝视角真相或待推进事件（1档不发给AI，2-3档只做铺垫严禁挑明，4档立即引爆）"></textarea>
                  </div>
                  <div>
                    <div class="he-label"><span>角色目前已掌握线索 / 当前铺垫进度</span></div>
                    <textarea class="he-textarea" id="he-f-charClues" placeholder="角色目前仅凭实力查到的真实线索或事件已铺垫到的程度"></textarea>
                  </div>
                </div>
              </div>

              <div class="he-card">
                <div class="he-card-head">
                  <span>不可逆物理 / 战力 / 伤病铁律黑名单（专治吃书乱编卖惨）</span>
                  <button class="he-btn" data-act="toggle-lock" data-lock="hardFacts" id="he-lock-hardFacts"></button>
                </div>
                <textarea class="he-textarea" id="he-f-hardFacts" placeholder="例：1. 体内魔火已于两年前彻底逼出，严禁复发卖惨；2. 修为散尽期间严禁凭空输送灵力；3. 末世弹药余量/男扮女装当前伪装完好度等硬事实"></textarea>
              </div>
            </div>

            <!-- ③ 分幕卷宗 -->
            <div class="he-pane" data-pane="acts">
              <div class="he-card">
                <div class="he-card-head">
                  <span>分幕剧情卷宗库（每次总结自动新增一幕，可自由勾选几幕合并）</span>
                  <div class="he-row">
                    <button class="he-btn" data-act="add-act" title="不调AI，纯手动加一个空白框自己写">${ICONS.plus} 手动添一幕</button>
                    <button class="he-btn he-btn-primary" data-act="merge-selected-acts">${ICONS.spark} 合并勾选幕</button>
                  </div>
                </div>
                <div class="he-hint">说明：每次执行 AI 总结并确认应用后，会自动在这里生成最新一幕。你想保留「第1幕初见」不动、只把「第2、3幕」浓缩合并时，只需勾选第2、3幕再点右上角「合并勾选幕」即可。</div>
                <div id="he-acts-list" style="display:flex; flex-direction:column; gap:8px;"></div>
              </div>
            </div>

            <!-- ④ 切口与行囊 -->
            <div class="he-pane" data-pane="snapshot">
              <div class="he-card">
                <div class="he-card-head"><span>当时情况 · 切口现场快照（隐藏百楼不断气核心）</span></div>
                <div>
                  <div class="he-label"><span>切口场景、空气氛围与未说完的话头（100字内）</span></div>
                  <textarea class="he-textarea" id="he-f-sceneBridge" placeholder="定格最后几楼两人所处位置、刚结束的动作余韵与对话切口"></textarea>
                </div>
                <div>
                  <div class="he-label"><span>当下衣着完好度、身体微状态与随身姿态</span></div>
                  <textarea class="he-textarea" id="he-f-attireAndBody" placeholder="当前穿着、伤势体力、距离姿态（防一件衣服脱三次或状态穿帮）"></textarea>
                </div>
                <div>
                  <div class="he-label"><span>关键随身道具与未完约定 / 待办</span></div>
                  <textarea class="he-textarea" id="he-f-itemsAndTodos" placeholder="重要信物归属、副本物资、尚未兑现的承诺"></textarea>
                </div>
              </div>
            </div>

            <!-- ⑤ 总结控制台、手动自由藏楼与人物名册 -->
            <div class="he-pane" data-pane="npcs">
              <!-- AI 总结范围与叮嘱 -->
              <div class="he-card">
                <div class="he-card-head"><span>AI 总结范围与润色叮嘱（不锁定的模块将一并提炼，并自动生成新一幕卷宗）</span></div>
                <div class="he-grid-2">
                  <div>
                    <div class="he-label"><span>总结起始楼 ~ 结束楼（留空默认总结全篇可见楼层）</span></div>
                    <div class="he-row">
                      <input class="he-input" id="he-sum-start" placeholder="起始楼(如 0)" style="width:48%" />
                      <input class="he-input" id="he-sum-end" placeholder="结束楼(默认最新)" style="width:48%" />
                    </div>
                  </div>
                  <div>
                    <div class="he-label"><span>要跳过的废楼 / 小剧场楼层号</span></div>
                    <input class="he-input" id="he-sum-skip" placeholder="例: 15, 22-26" />
                  </div>
                </div>
                <div>
                  <div class="he-label"><span>本次总结额外润色叮嘱（告诉 AI 重点保留什么情感或细节）</span></div>
                  <input class="he-input" id="he-sum-note" placeholder="例：重点刻画他发现我受伤后的愧疚，原样保留他在洞底说的那句话" />
                </div>
                <div id="he-preview-box" style="display:none; margin-top:6px; border-top:1px dashed var(--he-border); padding-top:8px;">
                  <div class="he-card-head"><span>AI 提炼预览已填入各页签！（检查满意后点下方按钮正式生效）</span></div>
                  <div class="he-row" style="margin-top:6px;">
                    <button class="he-btn he-btn-primary" data-act="confirm-preview">确认应用（若选了插入楼层模式将自动发进聊天楼层）</button>
                    <button class="he-btn he-btn-danger" data-act="cancel-preview">放弃本次生成</button>
                  </div>
                </div>
              </div>

              <!-- 玩家自由控制隐藏/恢复楼层工具 -->
              <div class="he-card">
                <div class="he-card-head"><span>自由隐藏 / 恢复聊天楼层工具（想藏哪几楼自己填，留第0楼可保开场白文风）</span></div>
                <div class="he-row">
                  <span class="he-label">从第</span>
                  <input class="he-input" id="he-hide-start" value="1" style="width:76px;" placeholder="1" />
                  <span class="he-label">楼 到 第</span>
                  <input class="he-input" id="he-hide-end" style="width:86px;" placeholder="如 45" />
                  <span class="he-label">楼：</span>
                  <button class="he-btn he-btn-primary" data-act="hide-floors">${ICONS.eyeOff} 隐藏指定楼层</button>
                  <button class="he-btn" data-act="unhide-floors">${ICONS.eye} 恢复显示指定楼层</button>
                </div>
                <div class="he-hint" id="he-floor-count-hint">提示：第 0 楼通常是角色卡开场白，从第 1 楼开始隐藏即可完美保留开场白文风。</div>
              </div>

              <!-- 重要人物名册 -->
              <div class="he-card">
                <div class="he-card-head"><span>重要配角与 NPC 名册（防同人异名裂变）</span></div>
                <textarea class="he-textarea" id="he-f-npcs" placeholder="各关键配角身份、当前生死/立场与一句话最新印象"></textarea>
              </div>
            </div>

            <!-- 跨窗口角色记忆总书架 -->
            <div class="he-pane" data-pane="shelf">
              <div class="he-card">
                <div class="he-card-head"><span>角色记忆总书架（跨聊天窗口 / 分支搜索与导出）</span></div>
                <input class="he-input" id="he-shelf-search" placeholder="输入角色名或关键词搜索已存档的记忆窗口..." />
                <div id="he-shelf-list" style="display:flex; flex-direction:column; gap:8px; margin-top:6px;"></div>
              </div>
            </div>

            <!-- 设置与独立 API -->
            <div class="he-pane" data-pane="settings">
              <div class="he-card">
                <div class="he-card-head"><span>独立 AI 接口配置（直连不带酒馆预设杂质，快且准）</span></div>
                <div class="he-grid-2">
                  <div>
                    <div class="he-label"><span>API Base URL（自动兼容带不带 /v1）</span></div>
                    <input class="he-input" id="he-set-baseUrl" placeholder="https://api.example.com/v1" />
                  </div>
                  <div>
                    <div class="he-label"><span>API Key（密钥仅保存在本地）</span></div>
                    <input class="he-input" type="password" id="he-set-apiKey" placeholder="sk-..." />
                  </div>
                </div>
                <div class="he-row">
                  <input class="he-input" id="he-set-model" placeholder="模型名称，可手填或点击右侧拉取" style="flex:1;" />
                  <button class="he-btn" data-act="fetch-models">拉取模型列表</button>
                  <select class="he-select" id="he-model-select" style="width:auto; display:none;"></select>
                </div>
              </div>

              <div class="he-card">
                <div class="he-card-head"><span>自动化与总结系统提示词</span></div>
                <div>
                  <div class="he-label"><span>定时自动提醒间隔楼层（填 0 为纯手动）</span></div>
                  <input class="he-input" type="number" id="he-set-autoInterval" placeholder="0" style="max-width:200px;" />
                </div>
                <div>
                  <div class="he-label">
                    <span>内置总结系统提示词（可自由修改微调）</span>
                    <button class="he-btn" data-act="reset-prompt">恢复默认提示词</button>
                  </div>
                  <textarea class="he-textarea" id="he-set-prompt" style="min-height:130px;"></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- 全局底栏（任何页签均可一键提炼总结、插入楼层、保存） -->
          <div class="he-footer">
            <div class="he-row">
              <span class="he-label">投喂模式：</span>
              <select class="he-select" id="he-f-injectMode" style="width:auto;">
                <option value="silent">后台静默喂给AI（不占聊天楼层）</option>
                <option value="floor">插入聊天楼层模式（确认总结时自动发一楼）</option>
                <option value="none">纯记忆仓库（只存不喂给AI）</option>
              </select>
            </div>
            <div class="he-status-bar" id="he-status-text">就绪 · 可随时点右侧提炼总结或保存</div>
            <div class="he-row">
              <button class="he-btn he-btn-primary" data-act="run-summary">${ICONS.spark} 提炼总结</button>
              <button class="he-btn" data-act="insert-to-floor" title="立即把当前记忆排版作为一楼发进聊天框">${ICONS.send} 发进楼层</button>
              <button class="he-btn" data-act="export-worldbook" title="复制为世界书文本">复制世界书</button>
              <button class="he-btn he-btn-primary" data-act="save-all">保存改动</button>
            </div>
          </div>
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
    } catch (e) {
      console.warn('[HeartEcho] mountExtensionMenuEntries warning:', e);
    }
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
    const pos = globalSettings.fabPos || { side: 'right', bottom: 90, docked: false };
    fab.style.top = 'auto';
    fab.style.bottom = (pos.bottom ?? 90) + 'px';

    if (pos.docked) {
      if (pos.side === 'left') {
        fab.classList.add('he-dock-left');
      } else {
        fab.classList.add('he-dock-right');
      }
    } else {
      if (pos.side === 'left') {
        fab.style.left = (pos.left ?? 18) + 'px';
        fab.style.right = 'auto';
      } else {
        fab.style.right = (pos.right ?? 18) + 'px';
        fab.style.left = 'auto';
      }
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
    const bd = document.getElementById('he-backdrop');
    const pn = document.getElementById('he-panel');
    const btn = document.getElementById('he-fs-btn');
    if (bd) bd.classList.toggle('he-fullscreen', isFullscreen);
    if (pn) pn.classList.toggle('he-fullscreen', isFullscreen);
    if (btn) btn.innerHTML = isFullscreen ? `${ICONS.min} 还原` : `${ICONS.max} 全屏`;
  }

  // 渲染面板所有字段
  function renderPanelFromData() {
    const ctx = getCtx();
    const d = getChatData();
    const prof = getCurrentProfile(d);
    const totalFloors = (ctx.chat || []).length;

    const charBadge = document.getElementById('he-char-badge');
    if (charBadge) charBadge.textContent = `${ctx.name2 || '当前对话'} (共${totalFloors}楼)`;

    const floorHint = document.getElementById('he-floor-count-hint');
    if (floorHint) {
      const suggestHideEnd = Math.max(1, totalFloors - 12);
      floorHint.textContent = `当前聊天共 ${totalFloors} 楼（0 ~ ${ Math.max(0, totalFloors - 1) } 楼）。保留第 0 楼开场白并隐藏 1 ~ ${suggestHideEnd} 楼即可无缝接戏。`;
      const hideEndInput = document.getElementById('he-hide-end');
      if (hideEndInput && !hideEndInput.value && totalFloors > 12) {
        hideEndInput.value = String(suggestHideEnd);
      }
    }

    // 渲染多人卡角色子标签
    renderCharSubtabs(d);

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val ?? '';
    };

    // 当前选中角色的心智字段
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
    setVal('he-f-actionLock', d.actionLock || 'normal');

    setVal('he-f-truthAndMask', d.secretLedger.truthAndMask);
    setVal('he-f-charClues', d.secretLedger.charClues);
    setVal('he-f-hardFacts', d.secretLedger.hardFacts);

    setVal('he-f-sceneBridge', d.snapshot.sceneBridge);
    setVal('he-f-attireAndBody', d.snapshot.attireAndBody);
    setVal('he-f-itemsAndTodos', d.snapshot.itemsAndTodos);
    setVal('he-f-npcs', d.npcs);
    setVal('he-f-injectMode', d.injectMode || 'silent');

    // 设置项
    setVal('he-set-baseUrl', globalSettings.baseUrl);
    setVal('he-set-apiKey', globalSettings.apiKey);
    setVal('he-set-model', globalSettings.model);
    setVal('he-set-autoInterval', globalSettings.autoInterval);
    setVal('he-set-prompt', globalSettings.customPrompt || DEFAULT_PROMPT);

    ['userNote', 'hardFacts'].forEach(k => {
      const btn = document.getElementById('he-lock-' + k);
      if (!btn) return;
      const locked = !!d.locks[k];
      btn.innerHTML = locked ? `${ICONS.lock} 已锁定防改` : `${ICONS.unlock} 随总结微调`;
      btn.classList.toggle('he-btn-primary', locked);
    });

    // 渲染关系主动推进引擎四档
    document.querySelectorAll('#he-init-gear-group .he-gear-btn').forEach(btn => {
      const g = parseInt(btn.getAttribute('data-gear'), 10);
      btn.classList.toggle('he-active', g === (d.initiativeGear || 1));
    });

    // 渲染通用伏笔四档推进器
    document.querySelectorAll('#he-gear-group .he-gear-btn').forEach(btn => {
      const g = parseInt(btn.getAttribute('data-gear'), 10);
      btn.classList.toggle('he-active', g === (d.secretGear || 2));
    });

    renderActsList(d);
    renderShelfList();
  }

  function renderCharSubtabs(d) {
    const bar = document.getElementById('he-char-subtabs');
    if (!bar) return;
    const pills = d.profiles.map((p, idx) => {
      const active = idx === d.activeCharIdx ? 'he-active' : '';
      const statusDot = p.present !== false ? '●' : '○';
      return `<button class="he-char-pill ${active}" data-act="select-prof" data-idx="${idx}" title="${p.present !== false ? '当前在场' : '暂不在场(封存不注入)'}">${statusDot} ${escapeHtml(p.name || ('角色' + (idx + 1)))}</button>`;
    }).join('');
    bar.innerHTML = `
      <span class="he-label" style="margin:0;">角色档案卡（支持单人/多人卡切换）：</span>
      ${pills}
      <button class="he-btn" data-act="add-prof">${ICONS.plus} 添加同场/攻略角色</button>
    `;
  }

  function renderActsList(d) {
    const wrap = document.getElementById('he-acts-list');
    if (!wrap) return;
    if (!d.acts.length) {
      wrap.innerHTML = `<div class="he-label">暂无分幕卷宗，可点击底栏「提炼总结」自动生成，或点上方「+ 手动添一幕」手写。</div>`;
      return;
    }
    wrap.innerHTML = d.acts.map((act, idx) => `
      <div class="he-card" data-act-index="${idx}">
        <div class="he-row" style="justify-content:space-between;">
          <label class="he-row" style="cursor:pointer; font-size:13px; font-weight:600; color:var(--he-accent);">
            <input type="checkbox" class="he-act-check" data-idx="${idx}" ${act.checked ? 'checked' : ''} />
            <span>第 ${idx + 1} 幕</span>
          </label>
          <input class="he-input he-act-title" data-idx="${idx}" value="${escapeHtml(act.title || '')}" placeholder="本幕标题 / 时间节点" style="flex:1; max-width:340px;" />
          <button class="he-btn he-btn-danger" data-act="delete-act" data-idx="${idx}">${ICONS.trash}</button>
        </div>
        <textarea class="he-textarea he-act-summary" data-idx="${idx}" placeholder="本幕核心因果脉络...">${escapeHtml(act.summary || '')}</textarea>
      </div>
    `).join('');
  }

  function renderShelfList() {
    const wrap = document.getElementById('he-shelf-list');
    if (!wrap) return;
    const query = (document.getElementById('he-shelf-search')?.value || '').trim().toLowerCase();
    const shelf = loadShelf();
    const rows = [];

    Object.keys(shelf).forEach(charName => {
      const chats = shelf[charName] || {};
      Object.values(chats).forEach(item => {
        const hay = `${charName} ${item.chatId} ${item.innerVoice} ${item.sceneBridge}`.toLowerCase();
        if (query && !hay.includes(query)) return;
        rows.push(item);
      });
    });

    if (!rows.length) {
      wrap.innerHTML = `<div class="he-label">未找到匹配的角色记忆存档。保存过一次当前聊天后会自动收录进此书架。</div>`;
      return;
    }

    wrap.innerHTML = rows.map(item => `
      <div class="he-card">
        <div class="he-card-head">
          <span>${escapeHtml(item.charName)} <small style="color:var(--he-muted);">(${escapeHtml(item.chatId)})</small></span>
          <span class="he-badge">共 ${item.actsCount || 0} 幕 · ${escapeHtml(item.updatedAt || '')}</span>
        </div>
        <div class="he-label">心声：${escapeHtml(item.innerVoice || '暂无')}</div>
        <div class="he-label">切口：${escapeHtml(item.sceneBridge || '暂无')}</div>
        <div class="he-row">
          <button class="he-btn" data-act="copy-shelf-item" data-char="${escapeHtml(item.charName)}" data-chat="${escapeHtml(item.chatId)}">复制该窗口世界书格式记忆</button>
        </div>
      </div>
    `).join('');
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
    d.actionLock = val('he-f-actionLock') || 'normal';

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
    globalSettings.customPrompt = val('he-set-prompt') || DEFAULT_PROMPT;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // =========================================================================
  // 七、事件委托、贴边吸附悬浮球、自由隐藏楼层与核心业务动作
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
        // 按下瞬间先解除半隐藏态方便拉出
        fab.classList.remove('he-dock-left', 'he-dock-right');
        try { fab.setPointerCapture(e.pointerId); } catch (_) {}
      });
      fab.addEventListener('pointermove', e => {
        if (!isDown) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
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
          // 距离左右边缘 42px 内松手自动吸附并收进一半
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
        if (dragged) {
          e.stopPropagation();
          return;
        }
        // 如果正处于半隐藏态，点一下先丝滑弹出并打开面板
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
      const rect = t.getBoundingClientRect();
      const mid = window.innerHeight / 2;
      if (rect.bottom > mid && bodyEl) {
        bodyEl.style.paddingBottom = Math.round(rect.bottom - mid + 40) + 'px';
      }
    });
    root.addEventListener('focusout', () => {
      if (bodyEl) bodyEl.style.paddingBottom = '';
    });

    document.getElementById('he-shelf-search')?.addEventListener('input', () => renderShelfList());
    document.getElementById('he-model-select')?.addEventListener('change', e => {
      const inp = document.getElementById('he-set-model');
      if (inp && e.target.value) inp.value = e.target.value;
    });

    document.getElementById('he-backdrop')?.addEventListener('click', e => {
      if (e.target.id === 'he-backdrop') closePanel();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closePanel();
    });

    // 3. 全局 data-act 事件委托
    root.addEventListener('click', async e => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const act = btn.getAttribute('data-act');
      const d = getChatData();

      if (act === 'close-panel') {
        closePanel();
      } else if (act === 'toggle-fullscreen') {
        toggleFullscreen();
      } else if (act === 'switch-tab') {
        collectFormToData();
        currentTab = btn.getAttribute('data-tab') || 'mind';
        root.querySelectorAll('.he-tab').forEach(t => t.classList.toggle('he-active', t.getAttribute('data-tab') === currentTab));
        root.querySelectorAll('.he-pane').forEach(p => p.classList.toggle('he-active', p.getAttribute('data-pane') === currentTab));
        renderPanelFromData();
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
        setStatus(`已添加角色【${newName.trim()}】独立心智卡`);
      } else if (act === 'delete-prof') {
        if (d.profiles.length <= 1) {
          setStatus('至少需要保留 1 个主控角色心智卡', true);
          return;
        }
        collectFormToData();
        const curName = getCurrentProfile(d).name;
        if (!window.confirm(`确定要删除角色【${curName}】的心智卡吗？（删除后可通过顶栏退回上一档恢复）`)) return;
        pushHistorySnapshot('删除角色子卡前备份');
        d.profiles.splice(d.activeCharIdx, 1);
        d.activeCharIdx = 0;
        saveChatData();
        renderPanelFromData();
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
        setStatus(`关系主动推进引擎已切至 ${d.initiativeGear} 档`);
      } else if (act === 'set-gear') {
        collectFormToData();
        d.secretGear = parseInt(btn.getAttribute('data-gear'), 10) || 2;
        saveChatData();
        renderPanelFromData();
        setStatus(`通用伏笔/掉马推进器已切至 ${d.secretGear} 档`);
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
        if (!isNaN(idx)) {
          pushHistorySnapshot('删除分幕前备份');
          d.acts.splice(idx, 1);
          saveChatData();
          renderActsList(d);
          setStatus('已删除该幕（可点顶栏「退回上一档」恢复）');
        }
      } else if (act === 'merge-selected-acts') {
        collectFormToData();
        await handleMergeSelectedActs(d);
      } else if (act === 'hide-floors') {
        handleHideOrUnhideFloors(true);
      } else if (act === 'unhide-floors') {
        handleHideOrUnhideFloors(false);
      } else if (act === 'undo-history') {
        if (!d.history || !d.history.length) {
          setStatus('暂无可回退的历史档位', true);
          return;
        }
        const snap = d.history.shift();
        if (snap.profiles) d.profiles = snap.profiles;
        d.userNote = snap.userNote;
        d.secretLedger = snap.secretLedger;
        d.acts = snap.acts;
        d.snapshot = snap.snapshot;
        d.npcs = snap.npcs;
        if (snap.initiativeGear) d.initiativeGear = snap.initiativeGear;
        if (snap.secretGear) d.secretGear = snap.secretGear;
        saveChatData();
        renderPanelFromData();
        setStatus(`已回退至历史档位（${snap.time} · ${snap.reason}）`);
      } else if (act === 'save-all') {
        pushHistorySnapshot('手动保存前备份');
        collectFormToData();
        saveGlobalSettings();
        saveChatData();
        setStatus('全部改动已安全落盘并同步至角色书架');
      } else if (act === 'run-summary') {
        collectFormToData();
        saveGlobalSettings();
        await handleRunSummary(d);
      } else if (act === 'confirm-preview') {
        if (!previewDraft) return;
        pushHistorySnapshot('AI总结覆盖前自动备份');
        applyDraftToChatData(d, previewDraft);
        previewDraft = null;
        document.getElementById('he-preview-box').style.display = 'none';
        saveChatData();
        renderPanelFromData();
        if (d.injectMode === 'floor') {
          handleInsertToFloor(d, true);
        } else {
          setStatus('新总结已正式生效并新增一幕卷宗！可随时点顶栏「退回上一档」');
        }
      } else if (act === 'cancel-preview') {
        previewDraft = null;
        document.getElementById('he-preview-box').style.display = 'none';
        renderPanelFromData();
        setStatus('已放弃本次生成结果，恢复原内容');
      } else if (act === 'insert-to-floor') {
        collectFormToData();
        saveChatData();
        handleInsertToFloor(d, false);
      } else if (act === 'export-worldbook') {
        collectFormToData();
        const txt = buildFormattedPromptBlock(d, false);
        await navigator.clipboard?.writeText(txt);
        setStatus('已复制世界书格式文本到剪贴板！');
      } else if (act === 'copy-shelf-item') {
        const cName = btn.getAttribute('data-char');
        const cId = btn.getAttribute('data-chat');
        const shelf = loadShelf();
        const txt = shelf?.[cName]?.[cId]?.fullText || '';
        if (txt) {
          await navigator.clipboard?.writeText(txt);
          setStatus(`已复制【${cName}】该窗口记忆档案到剪贴板`);
        }
      } else if (act === 'fetch-models') {
        collectFormToData();
        await handleFetchModels();
      } else if (act === 'reset-prompt') {
        const el = document.getElementById('he-set-prompt');
        if (el) el.value = DEFAULT_PROMPT;
        globalSettings.customPrompt = DEFAULT_PROMPT;
        saveGlobalSettings();
        setStatus('已恢复默认总结提示词');
      }
    });
  }

  // 玩家手动自由指定隐藏或恢复显示楼层
  function handleHideOrUnhideFloors(toHide) {
    const ctx = getCtx();
    const chat = ctx.chat || [];
    if (!chat.length) {
      setStatus('当前没有可操作的聊天楼层', true);
      return;
    }
    const sRaw = document.getElementById('he-hide-start')?.value;
    const eRaw = document.getElementById('he-hide-end')?.value;
    const s = Math.max(0, parseInt(sRaw, 10) || 0);
    const e = Math.min(chat.length - 1, isNaN(parseInt(eRaw, 10)) ? chat.length - 1 : parseInt(eRaw, 10));

    if (s > e) {
      setStatus('起始楼层不能大于结束楼层', true);
      return;
    }

    let count = 0;
    for (let i = s; i <= e; i++) {
      if (chat[i]) {
        chat[i].is_system = !!toHide;
        count++;
      }
    }
    saveChatData();
    try { ctx.reloadCurrentChat?.(); } catch (_) {}
    setStatus(toHide ? `已成功隐藏第 ${s} ~ ${e} 楼（共 ${count} 楼）！` : `已恢复显示第 ${s} ~ ${e} 楼（共 ${count} 楼）！`);
  }

  // 执行 AI 总结（支持从任意页签点底栏触发，支持多人卡按名字自动对号入座）
  async function handleRunSummary(d) {
    const startVal = document.getElementById('he-sum-start')?.value;
    const endVal = document.getElementById('he-sum-end')?.value;
    const skipVal = document.getElementById('he-sum-skip')?.value;
    const noteVal = document.getElementById('he-sum-note')?.value;

    const slice = extractChatSliceText(startVal, endVal, skipVal);
    if (!slice.count) {
      setStatus('所选楼层范围内没有可总结的对话内容', true);
      return;
    }

    const presentProfs = (d.profiles || []).filter(p => p.present !== false);
    const presentNames = presentProfs.map(p => p.name || '主控角色');

    setStatus(`正在提炼 ${slice.count} 楼剧情与 [${presentNames.join('、')}] 的心智微变...`);
    const sysPrompt = (globalSettings.customPrompt || DEFAULT_PROMPT) + '\n\n' + getSpanRuleText(slice.count, noteVal, presentNames);
    const userPayload = `【既有心智与账本参考】\n${buildFormattedPromptBlock(d, false)}\n\n【待总结新增对话（共${slice.count}楼）】\n${slice.text}`;

    const aiRaw = await callCleanLLM(sysPrompt, userPayload);
    if (!aiRaw) return;

    const parsed = parseAiJson(aiRaw);
    if (!parsed) {
      setStatus('AI 返回格式未能解析为 JSON，请重试或检查模型', true);
      return;
    }

    previewDraft = parsed;

    // 跳转到第⑤页展示确认按钮，同时将预览写入临时视图
    currentTab = 'npcs';
    const root = document.getElementById('he-root');
    root.querySelectorAll('.he-tab').forEach(t => t.classList.toggle('he-active', t.getAttribute('data-tab') === 'npcs'));
    root.querySelectorAll('.he-pane').forEach(p => p.classList.toggle('he-active', p.getAttribute('data-pane') === 'npcs'));
    document.getElementById('he-preview-box').style.display = 'block';

    const modeTip = d.injectMode === 'floor' ? '点「确认应用」将自动生成新一幕并直接插入聊天楼层！' : '可切去各页签检查修改，满意后回第⑤页点「确认应用」！';
    setStatus(`提炼完成！${modeTip}`);

    // 临时填入未锁定字段供用户在各页签预览
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
    if (parsed.npcs) {
      document.getElementById('he-f-npcs').value = parsed.npcs;
    }
  }

  function applyMindPreviewToProfiles(d, parsed) {
    // 兼容多人 characterMinds 数组与单人 charMind 对象
    const list = Array.isArray(parsed.characterMinds)
      ? parsed.characterMinds
      : (parsed.charMind ? [Object.assign({ name: getCurrentProfile(d).name }, parsed.charMind)] : []);

    list.forEach(item => {
      if (!item) return;
      // 匹配已有角色或默认匹配第一个在场未锁角色
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

    // 刷新当前选中角色输入框显示
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
    if (draft?.newAct?.summary) {
      d.acts.push({
        id: 'act_' + Date.now(),
        title: draft.newAct.title || ('阶段记录 ' + (d.acts.length + 1)),
        summary: draft.newAct.summary,
        checked: false
      });
    }
  }

  async function handleMergeSelectedActs(d) {
    const selectedIndices = [];
    d.acts.forEach((a, idx) => {
      if (a.checked) selectedIndices.push(idx);
    });
    if (selectedIndices.length < 2) {
      setStatus('请至少勾选 2 个需要合并的分幕卷宗（不想合并的幕不要打勾）', true);
      return;
    }

    setStatus(`正在将勾选的 ${selectedIndices.length} 幕卷宗浓缩合并...`);
    const toMergeText = selectedIndices.map(i => `【第${i + 1}幕 · ${d.acts[i].title}】\n${d.acts[i].summary}`).join('\n\n');
    const sys = '你是专业叙事归档师。请将用户勾选的以下几幕剧情浓缩合并为一段脉络清晰、保留关键时间节点与情感转折的精炼卷宗（300字以内），直接输出合并后的正文，不要多余解释。';
    const mergedText = await callCleanLLM(sys, toMergeText);
    if (!mergedText) return;

    pushHistorySnapshot('合并勾选分幕前备份');
    const firstIdx = selectedIndices[0];
    const mergedTitle = selectedIndices.map(i => d.acts[i].title).filter(Boolean).join(' + ');
    d.acts[firstIdx] = {
      id: 'act_' + Date.now(),
      title: mergedTitle || '合并卷宗',
      summary: mergedText.trim(),
      checked: false
    };
    for (let k = selectedIndices.length - 1; k >= 1; k--) {
      d.acts.splice(selectedIndices[k], 1);
    }
    saveChatData();
    renderActsList(d);
    setStatus('勾选分幕已成功合并！未勾选的卷宗完好保留');
  }

  function handleInsertToFloor(d, fromAutoConfirm) {
    const ctx = getCtx();
    if (!Array.isArray(ctx.chat)) {
      setStatus('当前未处于有效聊天窗口中', true);
      return;
    }
    const blockHtml = buildFormattedPromptBlock(d, true);
    ctx.chat.push({
      name: PLUGIN_NAME,
      is_user: false,
      is_system: false,
      send_date: Date.now(),
      mes: blockHtml
    });

    d.injectMode = 'floor';
    saveChatData();
    try { ctx.reloadCurrentChat?.(); } catch (e) {}
    setStatus(fromAutoConfirm ? '总结已生效并自动作为新楼层插入当前聊天！' : '已将美化排版记忆块插入当前聊天最新一楼！');
  }

  async function handleFetchModels() {
    const base = String(globalSettings.baseUrl || '').trim().replace(/\/+$/, '');
    const key = String(globalSettings.apiKey || '').trim();
    if (!base || !key) {
      setStatus('请先填写 API Base URL 和 API Key', true);
      return;
    }
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
      } catch (e) {}
    }
    setStatus('拉取模型列表失败，请直接手动输入模型名', true);
  }

  // =========================================================================
  // 八、事件监听与三明治静默注入
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
            chatMsgs.splice(insertIdx, 0, {
              role: 'system',
              content: promptBlock
            });
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
        } catch (e) {}
      });
    }
  }

  // =========================================================================
  // 九、三重保险幂等启动
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
