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

if (text.includes("const shouldSendSuccessTip = kind !== 'voice';")) {
  console.log('Voice success tip patch already applied.');
  process.exit(0);
}

const anchor = `  const ok = await safeSendPrivateMessage(userId, cq, \`\${tag}_cq_\${kind}\`);
  if (ok) {
    await safeSendPrivateMessage(userId, \`✅ 已通过QQ发送成果：\${base}\`, \`\${tag}_sent_tip\`);
    return true;
  }`;

const replacement = `  const ok = await safeSendPrivateMessage(userId, cq, \`\${tag}_cq_\${kind}\`);
  if (ok) {
    const shouldSendSuccessTip = kind !== 'voice';
    if (shouldSendSuccessTip) {
      await safeSendPrivateMessage(userId, \`✅ 已通过QQ发送成果：\${base}\`, \`\${tag}_sent_tip\`);
    }
    return true;
  }`;

if (!text.includes(anchor)) {
  fail('Success tip anchor not found.');
}

text = text.replace(anchor, replacement);
fs.writeFileSync(targetPath, text, 'utf8');
console.log(`Patched voice success tip in ${targetPath}`);
