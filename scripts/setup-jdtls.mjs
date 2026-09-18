import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtimeDir = path.join(rootDir, '.localcode', 'runtime');
const targetDir = process.env.JDTLS_HOME
  ? path.resolve(process.env.JDTLS_HOME)
  : path.join(runtimeDir, 'jdtls');
const targetParent = path.dirname(targetDir);
const version = process.env.JDTLS_VERSION ?? '1.61.0';
const build = process.env.JDTLS_BUILD ?? '202609031315';
const archiveName = `jdt-language-server-${version}-${build}.tar.gz`;
const downloadUrl = process.env.JDTLS_DOWNLOAD_URL
  ?? `https://download.eclipse.org/jdtls/milestones/${version}/${archiveName}`;
const force = process.argv.includes('--force');

function findLauncher(directory) {
  const pluginsDir = path.join(directory, 'plugins');
  if (!fs.existsSync(pluginsDir)) return null;
  return fs.readdirSync(pluginsDir).find((name) => (
    name.startsWith('org.eclipse.equinox.launcher_') && name.endsWith('.jar')
  ));
}

if (findLauncher(targetDir) && !force) {
  console.log(`JDT LS is already installed at ${targetDir}`);
  process.exit(0);
}

await fsPromises.mkdir(targetParent, { recursive: true });
const archivePath = path.join(targetParent, `.jdtls-${process.pid}.tar.gz`);
const stagingDir = path.join(targetParent, `.jdtls-${process.pid}`);

try {
  console.log(`Downloading JDT LS ${version}...`);
  const response = await fetch(downloadUrl, { redirect: 'follow' });
  if (!response.ok || !response.body) {
    throw new Error(`Download failed with HTTP ${response.status}`);
  }
  await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(archivePath));
  await fsPromises.mkdir(stagingDir, { recursive: true });

  const extraction = spawnSync('tar', ['-xzf', archivePath, '-C', stagingDir], {
    encoding: 'utf8'
  });
  if (extraction.status !== 0) {
    throw new Error(extraction.stderr.trim() || 'Unable to extract JDT LS archive');
  }
  if (!findLauncher(stagingDir)) {
    throw new Error('Downloaded archive does not contain an Eclipse launcher');
  }

  await fsPromises.rm(targetDir, { recursive: true, force: true });
  await fsPromises.rename(stagingDir, targetDir);
  console.log(`JDT LS installed at ${targetDir}`);
} finally {
  await fsPromises.rm(archivePath, { force: true });
  await fsPromises.rm(stagingDir, { recursive: true, force: true });
}
