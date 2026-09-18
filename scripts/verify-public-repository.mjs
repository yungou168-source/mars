import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = process.cwd();
const forbiddenPath = /(^|\/)(\.env(?:\..+)?|[^/]+\.(?:pem|key|p12|db|sqlite|sqlite3|exe|msi)|node_modules|dist|build)(\/|$)/i;
const forbiddenContent = /(BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16})/;

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await files(path));
    else if (entry.isFile()) result.push(path);
  }
  return result;
}

for (const file of await files(root)) {
  const path = relative(root, file);
  if (forbiddenPath.test(path)) throw new Error('公开仓库禁止该文件：' + path);
  if (forbiddenContent.test(await readFile(file, 'utf8'))) throw new Error('公开仓库疑似包含凭据：' + path);
}

console.log('公开仓库安全检查通过。');
