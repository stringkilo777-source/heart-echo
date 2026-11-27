(function () {
  'use strict';

  // =========================================================================
  // 一、常量与安全上下文获取（严守交底文档第 03/04 章铁律）
  // =========================================================================
  const PLUGIN_ID = 'heart-echo';
  const PLUGIN_NAME = '心语回响';
  const PLUGIN_VERSION = '1.0.0';
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

  // 纯内联线性 SVG 图标库（严守第 07/12 章禁 Emoji 视觉铁律）
  const ICONS = {
    echo: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10z"/><path d="M2 12h2m16 0h2M5 5l1.5 1.5M19 5l-1.5 1.5"/></svg>',
    close: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    lock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    unlock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.4-2"/></svg>',
    shelf: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    spark: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3v4m0 10v4M3 12h4m10 0h4m-2.6-6.4l-2.8 2.8m-5.2 5.2l-2.8 2.8m0-10.8l2.8 2.8m5.2 5.2l2.8 2.8"/></svg>',
    plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2m-9 0v14h10V6"/></svg>',
    undo: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>',
    send: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>'
  };

  // =========================================================================
  // 二、默认提示词与默认数据结构
  // =========================================================================
  const DEFAULT_PROMPT = `你是「心语回响」叙事与心智归档师。请读取提供的对话内容，结合既有记忆档案，输出严格符合以下 JSON 结构的更新数据（不要输出任何代码块标记或多余解释文字）：

【核心铁律】
1. 拒绝流水账与好感百分比：严禁使用百分比数字！用细腻的心理拉扯、性格底色守恒下的微变、嘴硬心软或下意识偏袒动作来刻画感情。
2. 认知隔离与掉马保护：严格区分【客观事实/User秘密】与【Char目前已知的线索】。Char不知情的马甲、伪装性别、暗线，绝不可混入Char的主观认知中。
3. 灵魂重影与关键原话：若存在故人替身/死遁重逢/宿命拉扯，重点捕捉Char理智割裂与本能被吸引的瞬间，并原样保留1-2句最戳心的关键原话台词。
4. 防吃书铁律：严格核对已治愈旧伤、真实战力上限、物资衣着状态，严禁凭空捏造伤病卖惨。

【必须输出的合法 JSON 格式】
{
  "charMind": {
    "selfBase": "角色当前自我处境、性格底色与防线的细微松动",
    "surfaceView": "角色目前以为User是谁、已知哪些表面信息与误判",
    "subconscious": "嘴上/理智态度 vs 行动上的下意识偏袒、双标或灵魂重影恍惚",
    "innerVoice": "以角色第一人称写一句当下对User最真实、带张力的潜台词心声",
    "anchors": "保留最多4条最深刻的触动瞬间与关键原话台词（格式：[场景/信物] 原话与后遗症反应）"
  },
  "secretLedger": {
    "truthAndMask": "客观真相、User真实马甲/性别伪装/底牌",
    "charClues": "角色目前已察觉的蛛丝马迹与当前怀疑方向",
    "hardFacts": "不可逆物理/战力/伤病铁律黑名单（防AI吃书乱编卖惨）"
  },
  "newAct": {
    "title": "本幕简短标题（含时间跨度）",
    "summary": "200字以内高密度因果脉络，保留核心转折与情感张力，舍弃寒暄"
  },
  "snapshot": {
    "sceneBridge": "100字以内切口现场快照：定格最后几楼的时间地点、空气氛围与未说完的话头",
    "attireAndBody": "当下双方衣着完好度、身体微状态、距离与随身姿态",
    "itemsAndTodos": "关键道具归属变更与未兑现的约定/伏笔"
  },
  "npcs": "重要登场人物及当前立场/状态一句话备忘"
}`;

  function createEmptyChatData() {
    return {
      version: PLUGIN_VERSION,
      updatedAt: Date.now(),
      injectMode: 'silent', // 'none' | 'silent' | 'floor'
      actionLock: 'normal', // 'normal' | 'substantive' (专治火葬场口头挡刀复读机)
      secretGear: 2,        // 1:潜伏 2:重影恍惚 3:违和试探 4:彻底引爆
      locks: {
        charMind: false,
        userNote: true,     // User态度默认锁定防AI乱改
        hardFacts: false
      },
      charMind: {
        selfBase: '',
        surfaceView: '',
        subconscious: '',
        innerVoice: '',
        anchors: ''
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
      acts: [], // [{ id, title, summary, checked }]
      snapshot: {
        sceneBridge: '',
        attireAndBody: '',
        itemsAndTodos: ''
      },
      npcs: '',
      history: [] // 最近5档后悔药快照
    };
  }

  function createDefaultSettings() {
    return {
      baseUrl: '',
      apiKey: '',
      model: '',
      theme: 'auto', // 'auto' | 'dark' | 'light'
      showFab: true,
      fabPos: { right: 18, bottom: 90 },
      autoInterval: 0, // 0为纯手动，>0为每满X楼提醒/自动总结
      keepFloors: 12,  // 插入楼层隐藏旧楼时默认保留尾部楼层数
      customPrompt: DEFAULT_PROMPT
    };
  }

  // =========================================================================
  // 三、数据持久化层（严守第 05/08 章双写落盘与骤减保护铁律）
  // =========================================================================
  let globalSettings = createDefaultSettings();
  let currentTab = 'mind';
  let previewDraft = null; // 暂存AI刚生成待确认的预览档

  function loadGlobalSettings() {
    try {
      const ctx = getCtx();
      const extStore = (ctx.extensionSettings || window.extension_settings || {})[PLUGIN_ID];
      const rawLocal = localStorage.getItem(STORAGE_GLOBAL_KEY);
      const parsedLocal = rawLocal ? JSON.parse(rawLocal) : null;
      globalSettings = Object.assign(createDefaultSettings(), extStore || {}, parsedLocal || {});
    } catch (e) {
      console.warn('[HeartEcho] loadGlobalSettings error:', e);
    }
  }

  function saveGlobalSettings() {
    try {
      localStorage.setItem(STORAGE_GLOBAL_KEY, JSON.stringify(globalSettings));
      const ctx = getCtx();
      const extRoot = ctx.extensionSettings || window.extension_settings;
      if (extRoot) {
        extRoot[PLUGIN_ID] = globalSettings;
      }
      ctx.saveSettingsDebounced?.();
      window.saveSettingsDebounced?.();
    } catch (e) {
      console.warn('[HeartEcho] saveGlobalSettings error:', e);
    }
  }

  function getChatData() {
    const ctx = getCtx();
    const meta = ctx.chatMetadata || window.chat_metadata;
    if (!meta) return createEmptyChatData();
    meta.extensions = meta.extensions || {};
    if (!meta.extensions[PLUGIN_ID]) {
      meta.extensions[PLUGIN_ID] = createEmptyChatData();
    }
    const d = meta.extensions[PLUGIN_ID];
    // 补齐可能缺失的字段
    const base = createEmptyChatData();
    d.locks = Object.assign(base.locks, d.locks || {});
    d.charMind = Object.assign(base.charMind, d.charMind || {});
    d.userNote = Object.assign(base.userNote, d.userNote || {});
    d.secretLedger = Object.assign(base.secretLedger, d.secretLedger || {});
    d.snapshot = Object.assign(base.snapshot, d.snapshot || {});
    d.acts = Array.isArray(d.acts) ? d.acts : [];
    d.history = Array.isArray(d.history) ? d.history : [];
    return d;
  }

  // 备份当前档位到最近5档后悔药
  function pushHistorySnapshot(reasonLabel) {
    const d = getChatData();
    const copy = JSON.parse(JSON.stringify({
      time: new Date().toLocaleTimeString(),
      reason: reasonLabel || '手动/更新前自动备份',
      charMind: d.charMind,
      userNote: d.userNote,
      secretLedger: d.secretLedger,
      acts: d.acts,
      snapshot: d.snapshot,
      npcs: d.npcs
    }));
    d.history.unshift(copy);
    if (d.history.length > 5) d.history.length = 5;
  }

  function saveChatData() {
    const ctx = getCtx();
    const d = getChatData();
    d.updatedAt = Date.now();
    // 同步登记到跨窗口角色总书架
    syncToCharacterShelf(d);
    // 依序调用全部可用落盘方法（交底文档第08节铁律）
    try { ctx.saveChat?.(); } catch (e) {}
    try { window.saveChatConditional?.(); } catch (e) {}
    try { window.saveChat?.(); } catch (e) {}
    try { ctx.saveMetadata?.(); } catch (e) {}
    try { window.saveMetadataDebounced?.(); } catch (e) {}
    try { window.insertOrAssignVariables?.({ [PLUGIN_ID]: d }, { type: 'chat' }); } catch (e) {}
  }

  // 跨窗口角色总书架同步（带骤减保护）
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
      const charName = ctx.name2 || '未知角色';
      const chatId = ctx.chatId || ('chat_' + Date.now());
      const oldShelf = loadShelf();
      const oldCount = Object.keys(oldShelf).length;

      oldShelf[charName] = oldShelf[charName] || {};
      oldShelf[charName][chatId] = {
        chatId,
        charName,
        updatedAt: new Date().toLocaleString(),
        innerVoice: chatData.charMind?.innerVoice || '',
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
  // 四、组装投喂文本（含第0楼开场白三明治隔离法 & 四档变速箱）
  // =========================================================================
  const GEAR_INSTRUCTIONS = {
    1: '【暗线档位：1档·潜伏期】当前严禁提及或暗示未揭晓的马甲/过往身份秘密，专注当下剧情推进。',
    2: '【暗线档位：2档·灵魂重影与恍惚】角色理智上绝不知晓User隐藏身份，但会在具体的眼神、习惯或动作细节上本能地感到熟悉与灵魂重影，产生强烈的情绪失神或拉扯，严禁直接猜出真相。',
    3: '【暗线档位：3档·违和与暗中试探】角色已察觉细节处的违和感，允许在言行中设局试探或产生动摇怀疑，但尚未拿到决定性铁证。',
    4: '【暗线档位：4档·真相引爆期】信息差壁垒已打破，允许结合全部过往真相与真实身份展开正面情感爆发与清算。'
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

    // 1. 双生心智与防复读机锁
    lines.push('### 一、【角色动态心智与认知】');
    if (d.charMind.selfBase) lines.push('- 性格底色与心境微变：' + d.charMind.selfBase);
    if (d.charMind.surfaceView) lines.push('- 对User表层认知(仅知信息)：' + d.charMind.surfaceView);
    if (d.charMind.subconscious) lines.push('- 潜意识态度与身体惯性：' + d.charMind.subconscious);
    if (d.charMind.innerVoice) lines.push('- 此刻潜台词心声：「' + d.charMind.innerVoice + '」');
    if (d.charMind.anchors) lines.push('- 核心触动锚点与原话：\n' + d.charMind.anchors);

    if (d.userNote.attitude || d.userNote.bottomLine) {
      lines.push('### 二、【User立场与设定护栏（角色严禁直接读心看穿，仅从互动细节捉摸）】');
      if (d.userNote.attitude) lines.push('- User当前真实心境张力：' + d.userNote.attitude);
      if (d.userNote.bottomLine) lines.push('- User人设与互动底线：' + d.userNote.bottomLine);
    }

    if (d.actionLock === 'substantive') {
      lines.push('- 【破局行动铁律】：面对矛盾或追妻赎罪情境，角色必须做出有实质代价的偏执护短或破局行动！严禁站在原地当道德复读机、严禁空喊“冲我来/杀了我/不碰你/一起死”等逃避式口号！');
    }

    // 2. 暗线变速与防吃书黑名单
    lines.push('### 三、【信息差暗线与不可逆铁律】');
    lines.push('- ' + (GEAR_INSTRUCTIONS[d.secretGear] || GEAR_INSTRUCTIONS[2]));
    if (d.secretGear >= 2 && d.secretLedger.truthAndMask) {
      lines.push('- 导演暗线背景(仅供制造戏剧张力，角色严禁开天眼)：' + d.secretLedger.truthAndMask);
    }
    if (d.secretLedger.charClues) lines.push('- 角色当前仅掌握线索：' + d.secretLedger.charClues);
    if (d.secretLedger.hardFacts) {
      lines.push('- 【防吃书物理/战力钢印(严禁违背或捏造旧伤卖惨)】：' + d.secretLedger.hardFacts);
    }

    // 3. 分幕卷宗
    const activeActs = (d.acts || []).filter(a => a.summary);
    if (activeActs.length > 0) {
      lines.push('### 四、【过往分幕因果脉络】');
      activeActs.forEach((a, idx) => {
        lines.push(`- [第${idx + 1}幕 · ${a.title || '阶段记录'}]：${a.summary}`);
      });
    }

    // 4. 切口快照与人物
    lines.push('### 五、【当时情况·切口现场快照（无缝衔接核心）】');
    if (d.snapshot.sceneBridge) lines.push('- 切口场景与情绪余温：' + d.snapshot.sceneBridge);
    if (d.snapshot.attireAndBody) lines.push('- 当下衣着与身体微状态：' + d.snapshot.attireAndBody);
    if (d.snapshot.itemsAndTodos) lines.push('- 关键道具与未完约定：' + d.snapshot.itemsAndTodos);
    if (d.npcs) lines.push('- 登场人物名册：' + d.npcs);

    if (forFloorDetails) {
      lines.push('</details>');
    } else {
      lines.push('</heart_echo_memory>');
    }

    return forFloorDetails ? lines.join('<br>\n') : lines.join('\n');
  }

  // 检查当前未隐藏的聊天楼层里是否已经插过总结块（防双倍烧 Token）
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
  // 五、独立干净的 LLM 请求（严守第 06/07 章 fetch 直连与 /v1 兼容铁律）
  // =========================================================================
  async function callCleanLLM(systemPrompt, userContent) {
    const base = String(globalSettings.baseUrl || '').trim().replace(/\/+$/, '');
    const key = String(globalSettings.apiKey || '').trim();
    const model = String(globalSettings.model || '').trim();

    if (!base || !key || !model) {
      setStatus('请先在【设置】页签配置 API 地址、密钥与模型名', true);
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
            max_tokens: 1800,
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

  // 根据楼层跨度自动生成快慢双轨补充指令
  function getSpanRuleText(floorCount, extraNote) {
    const modeHint = floorCount <= 35
      ? '【本次为短跨度高频更新（共 ' + floorCount + ' 楼）】：请开启「微调防飘模式」——日常寒暄一笔带过，若无重大冲突请保持角色核心认知稳定，重点精确更新「切口现场快照、衣着微状态与潜台词心声」。'
      : '【本次为长跨度阶段大总结（共 ' + floorCount + ' 楼）】：请开启「长线沉淀模式」——大刀阔斧筛除过渡废话，提炼关键因果转折与潜意识里的关系破冰成长，同时必须精准锁定最后几楼的「切口现场与衣着道具最终状态」以防隐藏前文后断档。';
    return modeHint + (extraNote ? '\n【用户额外润色叮嘱（最高优先级）】：' + extraNote : '');
  }

  // 提取指定范围楼层文本（支持跳过如 20-25 的小剧场楼层）
  function extractChatSliceText(startFloor, endFloor, skipSpec) {
    const ctx = getCtx();
    const chat = ctx.chat || [];
    if (!chat.length) return { text: '', count: 0 };

    const s = Math.max(0, parseInt(startFloor, 10) || 0);
    const e = Math.min(chat.length - 1, isNaN(parseInt(endFloor, 10)) ? chat.length - 1 : parseInt(endFloor, 10));

    // 解析要跳过的楼层集合（如 "15, 20-23"）
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

  // 解析 AI 返回的 JSON
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
  // 六、UI 挂载与渲染（严守第 04/07/10/11 章 DOM 与移动端交互铁律）
  // =========================================================================
  function mountUI() {
    if (document.getElementById('he-root')) return;

    const root = document.createElement('div');
    root.id = 'he-root';
    root.innerHTML = `
      <!-- 可拖拽悬浮球 -->
      <div id="he-fab" title="打开心语回响">${ICONS.echo}</div>

      <!-- 主模态面板 -->
      <div id="he-backdrop">
        <div id="he-panel" role="dialog" aria-label="心语回响记忆面板">
          <!-- 顶栏 -->
          <div class="he-header">
            <div class="he-title-wrap">
              ${ICONS.echo}
              <span>心语回响 · HeartEcho</span>
              <span class="he-badge" id="he-char-badge">当前角色</span>
            </div>
            <div class="he-header-actions">
              <button class="he-btn" data-act="switch-tab" data-tab="shelf" title="跨窗口角色记忆总书架">${ICONS.shelf} 角色书架</button>
              <button class="he-btn" data-act="undo-history" title="一键退回上一档历史快照">${ICONS.undo} 退回上一档</button>
              <button class="he-btn" data-act="cycle-theme" id="he-theme-btn">主题: 跟随</button>
              <button class="he-btn" data-act="close-panel" title="关闭面板">${ICONS.close}</button>
            </div>
          </div>

          <!-- 五大核心抽屉 + 书架 + 设置页签 -->
          <div class="he-tabs">
            <button class="he-tab he-active" data-act="switch-tab" data-tab="mind">① 双生心智</button>
            <button class="he-tab" data-act="switch-tab" data-tab="secret">② 暗线与铁律</button>
            <button class="he-tab" data-act="switch-tab" data-tab="acts">③ 分幕卷宗</button>
            <button class="he-tab" data-act="switch-tab" data-tab="snapshot">④ 切口与行囊</button>
            <button class="he-tab" data-act="switch-tab" data-tab="npcs">⑤ 人物与总结</button>
            <button class="he-tab" data-act="switch-tab" data-tab="settings">设置与API</button>
          </div>

          <!-- 主体内容区 -->
          <div class="he-body" id="he-body">
            <!-- ① 双生心智 -->
            <div class="he-pane he-active" data-pane="mind">
              <div class="he-card">
                <div class="he-card-head">
                  <span>角色动态心智补丁（性格守恒下的细腻微变）</span>
                  <button class="he-btn" data-act="toggle-lock" data-lock="charMind" id="he-lock-charMind"></button>
                </div>
                <div>
                  <div class="he-label"><span>此刻潜台词心声（第一人称直白心声）</span></div>
                  <input class="he-input" id="he-f-innerVoice" placeholder="例：嘴上嫌她麻烦，视线却总忍不住往她受伤的手腕上飘……" />
                </div>
                <div class="he-grid-2">
                  <div>
                    <div class="he-label"><span>性格底色与心境微变</span></div>
                    <textarea class="he-textarea" id="he-f-selfBase" placeholder="经历本阶段后，角色执念或心理防线的细微松动"></textarea>
                  </div>
                  <div>
                    <div class="he-label"><span>对 User 表层认知（仅角色已知）</span></div>
                    <textarea class="he-textarea" id="he-f-surfaceView" placeholder="角色目前以为User是谁、存有哪些误判（严禁混入未掉马真相）"></textarea>
                  </div>
                </div>
                <div>
                  <div class="he-label"><span>潜意识态度与灵魂重影（嘴上态度 vs 身体下意识双标）</span></div>
                  <textarea class="he-textarea" id="he-f-subconscious" placeholder="理智上的克制或割裂 vs 行动上的下意识偏袒、护短或透过易容看到的灵魂重影"></textarea>
                </div>
                <div>
                  <div class="he-label"><span>核心触动锚点与关键原话（最多4条，新旧择优保留）</span></div>
                  <textarea class="he-textarea" id="he-f-anchors" placeholder="[雨夜伞下] 原话：「……」 -> 此后每逢下雨或见User受寒便暗中心软"></textarea>
                </div>
              </div>

              <div class="he-card">
                <div class="he-card-head">
                  <span>User 态度备注与防复读机破局锁（自带防读心隔离）</span>
                  <button class="he-btn" data-act="toggle-lock" data-lock="userNote" id="he-lock-userNote"></button>
                </div>
                <div class="he-grid-2">
                  <div>
                    <div class="he-label"><span>User 对角色真实情感张力（防 -100 死板解读）</span></div>
                    <textarea class="he-textarea" id="he-f-userAttitude" placeholder="例：表面恨入骨髓拒不原谅，实则因旧情未绝而剧烈怨恸（严禁角色直接读心看穿）"></textarea>
                  </div>
                  <div>
                    <div class="he-label"><span>User 人设底线与特殊伪装备注</span></div>
                    <textarea class="he-textarea" id="he-f-userBottomLine" placeholder="例：当前为21岁真身易容潜伏、女扮男装等关键底线"></textarea>
                  </div>
                </div>
                <div class="he-row" style="justify-content: space-between; margin-top: 4px;">
                  <span class="he-label">困境/火葬场破局行动锁（专治口头挡刀“冲我来/一起死”复读机）：</span>
                  <select class="he-select" id="he-f-actionLock" style="width: auto;">
                    <option value="normal">常规自然推演</option>
                    <option value="substantive">强力破局锁（强制实质割肉行动，禁道德说教与逃避口号）</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- ② 暗线与铁律 -->
            <div class="he-pane" data-pane="secret">
              <div class="he-card">
                <div class="he-card-head">
                  <span>掉马与伏笔四档变速箱（点选切换当前戏剧张力）</span>
                </div>
                <div class="he-gear-group" id="he-gear-group">
                  <button class="he-gear-btn" data-act="set-gear" data-gear="1">① 潜伏档<br><small>纯日常不提旧事</small></button>
                  <button class="he-gear-btn" data-act="set-gear" data-gear="2">② 重影恍惚档<br><small>本能吸引不破马甲</small></button>
                  <button class="he-gear-btn" data-act="set-gear" data-gear="3">③ 违和试探档<br><small>察觉破绽暗中试探</small></button>
                  <button class="he-gear-btn" data-act="set-gear" data-gear="4">④ 掉马引爆档<br><small>彻底揭穿正面清算</small></button>
                </div>
                <div class="he-grid-2">
                  <div>
                    <div class="he-label"><span>客观真相 / 马甲 / 性别伪装底牌</span></div>
                    <textarea class="he-textarea" id="he-f-truthAndMask" placeholder="记录上帝视角真相（1档完全不发给AI，2-3档加防开天眼护栏发送）"></textarea>
                  </div>
                  <div>
                    <div class="he-label"><span>角色当前已掌握线索与怀疑方向</span></div>
                    <textarea class="he-textarea" id="he-f-charClues" placeholder="角色目前仅凭实力查到的真实线索"></textarea>
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
                  <span>分幕剧情卷宗库（支持自由勾选合并，初见名场面可保留不乱炖）</span>
                  <div class="he-row">
                    <button class="he-btn" data-act="add-act">${ICONS.plus} 新增空白幕</button>
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

            <!-- ⑤ 人物名册与总结控制台 -->
            <div class="he-pane" data-pane="npcs">
              <div class="he-card">
                <div class="he-card-head"><span>重要登场人物与 NPC 名册（防同人异名裂变）</span></div>
                <textarea class="he-textarea" id="he-f-npcs" placeholder="各关键人物身份、当前生死/立场与一句话最新关系"></textarea>
              </div>

              <div class="he-card">
                <div class="he-card-head"><span>执行总结与楼层范围控制（支持跳过小剧场）</span></div>
                <div class="he-grid-2">
                  <div>
                    <div class="he-label"><span>起始楼层 ~ 结束楼层（留空默认总结全篇）</span></div>
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
                  <input class="he-input" id="he-sum-note" placeholder="例：重点刻画他发现我受伤后的愧疚，不要改写第一幕初见锚点" />
                </div>
                <div class="he-row" style="justify-content: space-between; margin-top:4px;">
                  <button class="he-btn he-btn-primary" data-act="run-summary">${ICONS.spark} 立即提炼总结（生成后可预览修改）</button>
                  <div class="he-row">
                    <button class="he-btn" data-act="insert-to-floor">${ICONS.send} 美化插入当前楼层并可选藏旧楼</button>
                    <button class="he-btn" data-act="export-worldbook">复制世界书格式</button>
                  </div>
                </div>
                <div id="he-preview-box" style="display:none; margin-top:8px; border-top:1px dashed var(--he-border); padding-top:8px;">
                  <div class="he-card-head"><span>AI 提炼预览（确认无误后点击「应用存档」，绝不盲目覆盖）</span></div>
                  <div class="he-row" style="margin-top:6px;">
                    <button class="he-btn he-btn-primary" data-act="confirm-preview">确认应用并自动备份旧档</button>
                    <button class="he-btn he-btn-danger" data-act="cancel-preview">放弃本次生成</button>
                  </div>
                </div>
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
                <div class="he-card-head"><span>自动化与隐藏楼层偏好</span></div>
                <div class="he-grid-2">
                  <div>
                    <div class="he-label"><span>定时自动提醒/总结间隔楼层（填 0 为纯手动）</span></div>
                    <input class="he-input" type="number" id="he-set-autoInterval" placeholder="0" />
                  </div>
                  <div>
                    <div class="he-label"><span>插入楼层隐藏旧楼时默认保留尾部楼层数</span></div>
                    <input class="he-input" type="number" id="he-set-keepFloors" placeholder="12" />
                  </div>
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

          <!-- 底栏 -->
          <div class="he-footer">
            <div class="he-row">
              <span class="he-label">投喂模式：</span>
              <select class="he-select" id="he-f-injectMode" style="width:auto;">
                <option value="silent">后台静默注入（保第0楼文风 + 防穿帮）</option>
                <option value="floor">插入聊天楼层模式（含防重复扣费锁）</option>
                <option value="none">纯记忆仓库（只存不喂给 AI）</option>
              </select>
            </div>
            <div class="he-status-bar" id="he-status-text">就绪 · 修改后点击右侧保存即可落盘</div>
            <div class="he-row">
              <button class="he-btn he-btn-primary" data-act="save-all">保存当前改动</button>
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

  // 注入魔法棒菜单与酒馆扩展管理页（满足 A+B 三处入口需求）
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
          globalSettings.fabPos = { right: 18, bottom: 90 };
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
    fab.classList.remove('he-hidden');
    fab.style.left = 'auto';
    fab.style.top = 'auto';
    fab.style.right = (globalSettings.fabPos?.right ?? 18) + 'px';
    fab.style.bottom = (globalSettings.fabPos?.bottom ?? 90) + 'px';
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

  // 把当前聊天数据渲染到表单
  function renderPanelFromData() {
    const ctx = getCtx();
    const d = getChatData();
    const charBadge = document.getElementById('he-char-badge');
    if (charBadge) charBadge.textContent = ctx.name2 || '当前对话';

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val ?? '';
    };

    setVal('he-f-innerVoice', d.charMind.innerVoice);
    setVal('he-f-selfBase', d.charMind.selfBase);
    setVal('he-f-surfaceView', d.charMind.surfaceView);
    setVal('he-f-subconscious', d.charMind.subconscious);
    setVal('he-f-anchors', d.charMind.anchors);

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

    // 渲染设置项
    setVal('he-set-baseUrl', globalSettings.baseUrl);
    setVal('he-set-apiKey', globalSettings.apiKey);
    setVal('he-set-model', globalSettings.model);
    setVal('he-set-autoInterval', globalSettings.autoInterval);
    setVal('he-set-keepFloors', globalSettings.keepFloors);
    setVal('he-set-prompt', globalSettings.customPrompt || DEFAULT_PROMPT);

    // 渲染锁定按钮状态
    ['charMind', 'userNote', 'hardFacts'].forEach(k => {
      const btn = document.getElementById('he-lock-' + k);
      if (!btn) return;
      const locked = !!d.locks[k];
      btn.innerHTML = locked ? `${ICONS.lock} 已锁定防改` : `${ICONS.unlock} 随总结微调`;
      btn.classList.toggle('he-btn-primary', locked);
    });

    // 渲染四档变速箱高亮
    document.querySelectorAll('#he-gear-group .he-gear-btn').forEach(btn => {
      const g = parseInt(btn.getAttribute('data-gear'), 10);
      btn.classList.toggle('he-active', g === (d.secretGear || 2));
    });

    renderActsList(d);
    renderShelfList();
  }

  function renderActsList(d) {
    const wrap = document.getElementById('he-acts-list');
    if (!wrap) return;
    if (!d.acts.length) {
      wrap.innerHTML = `<div class="he-label">暂无分幕卷宗，可点击上方「新增空白幕」或去第⑤页签执行总结生成。</div>`;
      return;
    }
    wrap.innerHTML = d.acts.map((act, idx) => `
      <div class="he-card" data-act-index="${idx}">
        <div class="he-row" style="justify-content:space-between;">
          <label class="he-row" style="cursor:pointer; font-size:13px; font-weight:600; color:var(--he-accent);">
            <input type="checkbox" class="he-act-check" data-idx="${idx}" ${act.checked ? 'checked' : ''} />
            <span>第 ${idx + 1} 幕</span>
          </label>
          <input class="he-input he-act-title" data-idx="${idx}" value="${escapeHtml(act.title || '')}" placeholder="本幕标题 / 时间节点" style="flex:1; max-width:320px;" />
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
    const val = id => document.getElementById(id)?.value ?? '';

    d.charMind.innerVoice = val('he-f-innerVoice');
    d.charMind.selfBase = val('he-f-selfBase');
    d.charMind.surfaceView = val('he-f-surfaceView');
    d.charMind.subconscious = val('he-f-subconscious');
    d.charMind.anchors = val('he-f-anchors');

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

    // 收集分幕列表
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

    // 收集全局设置
    globalSettings.baseUrl = val('he-set-baseUrl');
    globalSettings.apiKey = val('he-set-apiKey');
    globalSettings.model = val('he-set-model');
    globalSettings.autoInterval = parseInt(val('he-set-autoInterval'), 10) || 0;
    globalSettings.keepFloors = parseInt(val('he-set-keepFloors'), 10) || 12;
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
  // 七、事件委托、安卓中线防遮挡、拖拽与核心业务动作
  // =========================================================================
  function bindEvents() {
    const root = document.getElementById('he-root');
    if (!root) return;

    // 1. 悬浮球拖拽 vs 点击（>6px 判定拖拽，严守第 07/11 章铁律）
    const fab = document.getElementById('he-fab');
    let startX = 0, startY = 0, dragged = false, isDown = false;
    if (fab) {
      fab.addEventListener('pointerdown', e => {
        isDown = true;
        dragged = false;
        startX = e.clientX;
        startY = e.clientY;
        try { fab.setPointerCapture(e.pointerId); } catch (_) {}
      });
      fab.addEventListener('pointermove', e => {
        if (!isDown) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
          dragged = true;
          const right = Math.max(6, Math.min(window.innerWidth - 52, window.innerWidth - e.clientX - 22));
          const bottom = Math.max(6, Math.min(window.innerHeight - 52, window.innerHeight - e.clientY - 22));
          fab.style.right = right + 'px';
          fab.style.bottom = bottom + 'px';
          globalSettings.fabPos = { right, bottom };
        }
      });
      fab.addEventListener('pointerup', () => {
        if (isDown && dragged) saveGlobalSettings();
        isDown = false;
      });
      fab.addEventListener('click', e => {
        if (dragged) {
          e.stopPropagation();
          return;
        }
        openPanel();
      });
    }

    // 2. 安卓键盘弹出“屏幕中线定位法”（严守第 07 章铁律）
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

    // 3. 搜索框实时过滤书架
    document.getElementById('he-shelf-search')?.addEventListener('input', () => renderShelfList());

    // 4. 模型下拉选择同步
    document.getElementById('he-model-select')?.addEventListener('change', e => {
      const inp = document.getElementById('he-set-model');
      if (inp && e.target.value) inp.value = e.target.value;
    });

    // 5. 点击遮罩空白处或按 ESC 正常退出
    document.getElementById('he-backdrop')?.addEventListener('click', e => {
      if (e.target.id === 'he-backdrop') closePanel();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closePanel();
    });

    // 6. 全局 data-act 事件委托
    root.addEventListener('click', async e => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const act = btn.getAttribute('data-act');
      const d = getChatData();

      if (act === 'close-panel') {
        closePanel();
      } else if (act === 'switch-tab') {
        collectFormToData();
        currentTab = btn.getAttribute('data-tab') || 'mind';
        root.querySelectorAll('.he-tab').forEach(t => t.classList.toggle('he-active', t.getAttribute('data-tab') === currentTab));
        root.querySelectorAll('.he-pane').forEach(p => p.classList.toggle('he-active', p.getAttribute('data-pane') === currentTab));
        renderPanelFromData();
      } else if (act === 'cycle-theme') {
        const order = ['auto', 'dark', 'light'];
        const next = order[(order.indexOf(globalSettings.theme) + 1) % order.length];
        globalSettings.theme = next;
        saveGlobalSettings();
        applyThemeClass();
      } else if (act === 'toggle-lock') {
        collectFormToData();
        const k = btn.getAttribute('data-lock');
        if (k) d.locks[k] = !d.locks[k];
        saveChatData();
        renderPanelFromData();
      } else if (act === 'set-gear') {
        collectFormToData();
        d.secretGear = parseInt(btn.getAttribute('data-gear'), 10) || 2;
        saveChatData();
        renderPanelFromData();
        setStatus(`已切换至 ${d.secretGear} 档暗线模式`);
      } else if (act === 'add-act') {
        collectFormToData();
        d.acts.push({ id: 'act_' + Date.now(), title: '新分幕', summary: '', checked: false });
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
      } else if (act === 'undo-history') {
        if (!d.history || !d.history.length) {
          setStatus('暂无可回退的历史档位', true);
          return;
        }
        const snap = d.history.shift();
        d.charMind = snap.charMind;
        d.userNote = snap.userNote;
        d.secretLedger = snap.secretLedger;
        d.acts = snap.acts;
        d.snapshot = snap.snapshot;
        d.npcs = snap.npcs;
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
        setStatus('新总结已生效并存盘！若不满意可随时点顶栏「退回上一档」');
      } else if (act === 'cancel-preview') {
        previewDraft = null;
        document.getElementById('he-preview-box').style.display = 'none';
        setStatus('已放弃本次生成结果');
      } else if (act === 'insert-to-floor') {
        collectFormToData();
        saveChatData();
        handleInsertToFloor(d);
      } else if (act === 'export-worldbook') {
        collectFormToData();
        const txt = buildFormattedPromptBlock(d, false);
        await navigator.clipboard?.writeText(txt);
        setStatus('已复制世界书格式文本到剪贴板！可直接粘贴至新窗口世界书');
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

  // 执行 AI 提炼总结
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

    setStatus(`正在提炼 ${slice.count} 楼剧情与心智微变，请稍候...`);
    const sysPrompt = (globalSettings.customPrompt || DEFAULT_PROMPT) + '\n\n' + getSpanRuleText(slice.count, noteVal);
    const userPayload = `【既有心智与账本参考】\n${buildFormattedPromptBlock(d, false)}\n\n【待总结新增对话（共${slice.count}楼）】\n${slice.text}`;

    const aiRaw = await callCleanLLM(sysPrompt, userPayload);
    if (!aiRaw) return;

    const parsed = parseAiJson(aiRaw);
    if (!parsed) {
      setStatus('AI 返回格式未能解析为 JSON，请重试或检查模型', true);
      return;
    }

    previewDraft = parsed;
    // 先将未锁定的字段填入表单供用户直观预览修改
    if (!d.locks.charMind && parsed.charMind) {
      document.getElementById('he-f-innerVoice').value = parsed.charMind.innerVoice || d.charMind.innerVoice;
      document.getElementById('he-f-selfBase').value = parsed.charMind.selfBase || d.charMind.selfBase;
      document.getElementById('he-f-surfaceView').value = parsed.charMind.surfaceView || d.charMind.surfaceView;
      document.getElementById('he-f-subconscious').value = parsed.charMind.subconscious || d.charMind.subconscious;
      document.getElementById('he-f-anchors').value = parsed.charMind.anchors || d.charMind.anchors;
    }
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

    document.getElementById('he-preview-box').style.display = 'block';
    setStatus('提炼完成！你可直接在各页签检查修改文字，确认无误后点「确认应用」');
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

  // 自由勾选分幕合并（绝不强制一锅乱炖）
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

  // 美化排版插入当前聊天楼层 + 可选隐藏前面旧楼（延续果实QR安心感）
  function handleInsertToFloor(d) {
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

    // 询问是否顺手隐藏旧楼（保留第0楼开场白 + 尾部 keepFloors 楼）
    const keep = Math.max(2, parseInt(globalSettings.keepFloors, 10) || 12);
    const hideEnd = ctx.chat.length - 1 - keep;
    if (hideEnd > 1 && window.confirm(`记忆折叠块已生成！是否自动隐藏第 1 楼至第 ${hideEnd} 楼的旧对话（自动保留第 0 楼开场白与最后 ${keep} 楼不断气）？`)) {
      for (let i = 1; i <= hideEnd; i++) {
        if (ctx.chat[i]) ctx.chat[i].is_system = true;
      }
    }

    d.injectMode = 'floor';
    saveChatData();
    try { ctx.reloadCurrentChat?.(); } catch (e) {}
    closePanel();
  }

  // 拉取模型列表
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
  // 八、事件监听与三明治静默注入（严守第 09 章 CHAT_COMPLETION_PROMPT_READY 铁律）
  // =========================================================================
  function bindTavernEvents() {
    const ctx = getCtx();
    const eventSource = ctx.eventSource || window.eventSource;
    const event_types = ctx.event_types || window.event_types;
    if (!eventSource || !event_types) return;

    // 1. 生成前静默注入（采用三明治隔离法卡在第 0 楼开场白之后，兼顾文风与切口衔接）
    if (event_types.CHAT_COMPLETION_PROMPT_READY) {
      eventSource.on(event_types.CHAT_COMPLETION_PROMPT_READY, eventData => {
        try {
          const d = getChatData();
          if (d.injectMode === 'none') return;
          // 防双倍扣 Token 锁：若聊天楼层里已有可见的本插件总结块，则暂停后台重复注入
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

    // 2. 监听新消息到达，支持定时楼层提醒
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
  // 九、三重保险幂等启动（严守第 03 章 APP_READY + 轮询 + 幂等铁律）
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
