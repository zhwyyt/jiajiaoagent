const fs = require('fs');
const path = require('path');

const targetPath = 'I:\\autoweb\\autoribao\\src\\qq-bot-napcat.js';

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!fs.existsSync(targetPath)) {
  fail(`Target file not found: ${targetPath}`);
}

let text = fs.readFileSync(targetPath, 'utf8');

if (text.includes('JIAJIAOAGENT_ROUTING_CONFIG_PATH')) {
  console.log('NapCat whitelist routing patch already applied.');
  process.exit(0);
}

const configAnchor = `const PEC_CONFIG = {
  unifiedAutomationRoot: 'I:\\\\autoweb\\\\unified-automation',
  runnerScript: 'I:\\\\autoweb\\\\unified-automation\\\\backend\\\\pec\\\\src\\\\qq-run-single-file.js',
  inputFolder: null
};`;

const configInsert = `const PEC_CONFIG = {
  unifiedAutomationRoot: 'I:\\\\autoweb\\\\unified-automation',
  runnerScript: 'I:\\\\autoweb\\\\unified-automation\\\\backend\\\\pec\\\\src\\\\qq-run-single-file.js',
  inputFolder: null
};
const JIAJIAOAGENT_REPO_ROOT = 'I:\\\\jiajiaoagent';
const JIAJIAOAGENT_ROUTING_CONFIG_PATH = path.join(JIAJIAOAGENT_REPO_ROOT, 'config', 'napcat-routing.json');
const JIAJIAOAGENT_BRIDGE_PS1 = path.join(
  JIAJIAOAGENT_REPO_ROOT,
  'backend',
  'scripts',
  'invoke-hermes-tutor-bridge.ps1'
);
let QQ_WHITELIST_ROUTING = {
  defaultTarget: 'ignore',
  targets: {
    autoribao: { userIds: [] },
    jiajiaoagent: { userIds: [] }
  }
};`;

if (!text.includes(configAnchor)) {
  fail('Config anchor not found.');
}
text = text.replace(configAnchor, configInsert);

const configCatchAnchor = `} catch (e) {
  // #region agent log
  DEBUG_LOG('qq-bot-napcat.js:config:error', 'failed to load config', { configPath: CONFIG_PATH, errorMessage: e.message }, 'H8');
  // #endregion
}`;

const configCatchInsert = `} catch (e) {
  // #region agent log
  DEBUG_LOG('qq-bot-napcat.js:config:error', 'failed to load config', { configPath: CONFIG_PATH, errorMessage: e.message }, 'H8');
  // #endregion
}

try {
  const raw = fs.readFileSync(JIAJIAOAGENT_ROUTING_CONFIG_PATH, 'utf8');
  const cfg = JSON.parse(raw);
  if (cfg && cfg.targets) {
    QQ_WHITELIST_ROUTING = cfg;
  }
  DEBUG_LOG(
    'qq-bot-napcat.js:routing:loaded',
    'loaded napcat whitelist routing config',
    { routingConfigPath: JIAJIAOAGENT_ROUTING_CONFIG_PATH, targets: Object.keys((QQ_WHITELIST_ROUTING && QQ_WHITELIST_ROUTING.targets) || {}) },
    'H21'
  );
} catch (e) {
  DEBUG_LOG(
    'qq-bot-napcat.js:routing:error',
    'failed to load napcat whitelist routing config',
    { routingConfigPath: JIAJIAOAGENT_ROUTING_CONFIG_PATH, errorMessage: e.message },
    'H21'
  );
}`;

if (!text.includes(configCatchAnchor)) {
  fail('Config catch anchor not found.');
}
text = text.replace(configCatchAnchor, configCatchInsert);

const retryAnchor = `async function callAPIWithRetry(endpoint, data, retries = 1) {
  try {
    return await callAPI(endpoint, data);
  } catch (err) {
    if (retries > 0 && isTransientNetError(err)) {
      // #region agent log
      DEBUG_LOG('qq-bot-napcat.js:callAPI:retry', 'retrying transient API error', { endpoint, errorCode: err.code }, 'H13');
      // #endregion
      return await callAPIWithRetry(endpoint, data, retries - 1);
    }
    throw err;
  }
}`;

const retryInsert = `async function callAPIWithRetry(endpoint, data, retries = 1) {
  try {
    return await callAPI(endpoint, data);
  } catch (err) {
    if (retries > 0 && isTransientNetError(err)) {
      // #region agent log
      DEBUG_LOG('qq-bot-napcat.js:callAPI:retry', 'retrying transient API error', { endpoint, errorCode: err.code }, 'H13');
      // #endregion
      return await callAPIWithRetry(endpoint, data, retries - 1);
    }
    throw err;
  }
}

function normalizeUserId(userId) {
  return String(userId || '').trim();
}

function resolveWhitelistTarget(userId) {
  const normalized = normalizeUserId(userId);
  const targets = (QQ_WHITELIST_ROUTING && QQ_WHITELIST_ROUTING.targets) || {};

  for (const [target, cfg] of Object.entries(targets)) {
    const list = Array.isArray(cfg && cfg.userIds) ? cfg.userIds.map((item) => String(item)) : [];
    if (list.includes(normalized)) {
      return target;
    }
  }

  return (QQ_WHITELIST_ROUTING && QQ_WHITELIST_ROUTING.defaultTarget) || 'ignore';
}

function invokeJiajiaoagentBridge(content, senderId) {
  const args = [
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    JIAJIAOAGENT_BRIDGE_PS1,
    '-Text',
    content,
    '-SenderId',
    String(senderId),
    '-Source',
    'qq',
    '-ChildId',
    'trial-child-001'
  ];

  DEBUG_LOG(
    'qq-bot-napcat.js:jiajiaoagent:bridgeInvoke',
    'invoking jiajiaoagent bridge',
    { bridgeScript: JIAJIAOAGENT_BRIDGE_PS1, senderId: String(senderId) },
    'H22'
  );

  return spawnSync('powershell', args, {
    encoding: 'utf8',
    stdio: 'pipe'
  });
}

async function handleJiajiaoagentRoute(senderId, content) {
  const result = invokeJiajiaoagentBridge(content, senderId);

  if (result.status !== 0) {
    const errorMsg = result.stderr || result.stdout || '未知错误';
    await safeSendPrivateMessage(senderId, '❌ 家教陪练处理失败：\\n' + errorMsg, 'jiajiaoagent_bridge_fail');
    return;
  }

  let payload = null;
  try {
    payload = JSON.parse(result.stdout || '{}');
  } catch (error) {
    await safeSendPrivateMessage(
      senderId,
      '❌ 家教陪练返回格式异常：' + error.message,
      'jiajiaoagent_bridge_parse_fail'
    );
    return;
  }

  if (!payload || !payload.ok || !payload.handled) {
    await safeSendPrivateMessage(senderId, '⚠️ 家教陪练当前未处理这条消息。', 'jiajiaoagent_unhandled');
    return;
  }

  if (payload.replyText) {
    await safeSendPrivateMessage(senderId, payload.replyText, 'jiajiaoagent_reply');
  }

  if (Array.isArray(payload.files) && payload.files.length > 0) {
    for (let i = 0; i < payload.files.length; i += 1) {
      const file = payload.files[i];
      if (!file || !file.path) continue;
      await sendResultFileToUser(senderId, file.path, 'jiajiaoagent_file_' + (i + 1), file.kind || 'file');
    }
  }
}`;

if (!text.includes(retryAnchor)) {
  fail('Retry anchor not found.');
}
text = text.replace(retryAnchor, retryInsert);

const cqAnchor = `  const cq =
    kind === 'image'
      ? \`[CQ:image,file=\${uri}]\`
      : \`[CQ:file,file=\${uri},name=\${base}]\`;`;

const cqInsert = `  const cq =
    kind === 'image'
      ? \`[CQ:image,file=\${uri}]\`
      : kind === 'voice'
        ? \`[CQ:record,file=\${uri}]\`
        : \`[CQ:file,file=\${uri},name=\${base}]\`;`;

if (!text.includes(cqAnchor)) {
  fail('CQ anchor not found.');
}
text = text.replace(cqAnchor, cqInsert);

const handleMessageAnchor = `async function handleMessage(message) {
  console.log(\`💬 收到消息: \${message.raw_message}\`);
  
  const content = String(message.raw_message || '').trim();
  const senderId = message.sender.user_id;
  const incomingFile = extractIncomingFile(message);
  
  // 权限检查
  const allowAll = AUTHORIZED_USERS.length === 0;
  const isAuthorized = allowAll || AUTHORIZED_USERS.includes(senderId);
  // #region agent log
  DEBUG_LOG('qq-bot-napcat.js:auth:check', 'auth check', { allowAll, authorizedUsersCount: AUTHORIZED_USERS.length, isAuthorized }, 'H9');
  // #endregion
  if (!isAuthorized) {
    await safeSendPrivateMessage(senderId, '❌ 无权限使用此机器人', 'unauthorized');
    return;
  }`;

const handleMessageInsert = `async function handleMessage(message) {
  console.log(\`💬 收到消息: \${message.raw_message}\`);
  
  const content = String(message.raw_message || '').trim();
  const senderId = message.sender.user_id;
  const incomingFile = extractIncomingFile(message);
  const routedTarget = resolveWhitelistTarget(senderId);
  
  DEBUG_LOG(
    'qq-bot-napcat.js:routing:resolved',
    'resolved user route target',
    { senderId: String(senderId), routedTarget },
    'H23'
  );

  if (routedTarget === 'ignore') {
    return;
  }

  if (routedTarget === 'jiajiaoagent') {
    if (!content) {
      return;
    }

    await handleJiajiaoagentRoute(senderId, content);
    return;
  }
  
  // 权限检查
  const allowAll = AUTHORIZED_USERS.length === 0;
  const isAuthorized = routedTarget === 'autoribao' ? true : allowAll || AUTHORIZED_USERS.includes(senderId);
  // #region agent log
  DEBUG_LOG('qq-bot-napcat.js:auth:check', 'auth check', { allowAll, authorizedUsersCount: AUTHORIZED_USERS.length, isAuthorized, routedTarget }, 'H9');
  // #endregion
  if (!isAuthorized) {
    await safeSendPrivateMessage(senderId, '❌ 无权限使用此机器人', 'unauthorized');
    return;
  }`;

if (!text.includes(handleMessageAnchor)) {
  fail('handleMessage anchor not found.');
}
text = text.replace(handleMessageAnchor, handleMessageInsert);

fs.writeFileSync(targetPath, text, 'utf8');
console.log(`Patched ${targetPath}`);
