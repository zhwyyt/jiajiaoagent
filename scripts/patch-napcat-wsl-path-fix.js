const fs = require('fs');

const targetPath = 'I:\\autoweb\\autoribao\\src\\qq-bot-napcat.js';

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!fs.existsSync(targetPath)) {
  fail(`Target file not found: ${targetPath}`);
}

let text = fs.readFileSync(targetPath, 'utf8');

if (text.includes('function normalizeOutboundFilePath')) {
  console.log('WSL path fix already applied.');
  process.exit(0);
}

const anchor = `async function sendResultFileToUser(userId, filePath, tag, kind) {
  const st = statSafe(filePath);`;

const replacement = `function normalizeOutboundFilePath(filePath) {
  const raw = String(filePath || '').trim();
  if (!raw) {
    return raw;
  }

  const mntMatch = raw.match(/^\\/mnt\\/([a-zA-Z])\\/(.*)$/);
  if (!mntMatch) {
    return raw;
  }

  const drive = mntMatch[1].toUpperCase();
  const rest = mntMatch[2].replace(/\\//g, '\\\\');
  return drive + ':\\\\' + rest;
}

async function sendResultFileToUser(userId, filePath, tag, kind) {
  const normalizedPath = normalizeOutboundFilePath(filePath);
  const st = statSafe(normalizedPath);`;

if (!text.includes(anchor)) {
  fail('sendResultFileToUser anchor not found.');
}

text = text.replace(anchor, replacement);

text = text.replace(
  `{ tag, kind, exists: !!st, size: st ? st.size : null, base: st ? path.basename(filePath) : path.basename(filePath) },`,
  `{ tag, kind, exists: !!st, size: st ? st.size : null, base: st ? path.basename(normalizedPath) : path.basename(normalizedPath), originalPath: filePath, normalizedPath },`
);

text = text.replace(
  `    await safeSendPrivateMessage(userId, \`⚠️ 未找到生成文件：\${filePath}\`, \`\${tag}_missing\`);`,
  `    await safeSendPrivateMessage(userId, \`⚠️ 未找到生成文件：\${normalizedPath}\`, \`\${tag}_missing\`);`
);

text = text.replace(
  `  const uri = toFileUri(filePath);
  const base = path.basename(filePath);`,
  `  const uri = toFileUri(normalizedPath);
  const base = path.basename(normalizedPath);`
);

text = text.replace(
  `  await safeSendPrivateMessage(userId, \`⚠️ 成果文件已生成但QQ发送失败，可在本机查看：\${filePath}\`, \`\${tag}_path_fallback\`);`,
  `  await safeSendPrivateMessage(userId, \`⚠️ 成果文件已生成但QQ发送失败，可在本机查看：\${normalizedPath}\`, \`\${tag}_path_fallback\`);`
);

fs.writeFileSync(targetPath, text, 'utf8');
console.log(`Patched WSL path fix into ${targetPath}`);
