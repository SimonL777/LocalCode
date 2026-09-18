import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  createMessageConnection,
  StreamMessageReader,
  StreamMessageWriter
} from 'vscode-jsonrpc/node';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lspRoot = path.join(rootDir, '.localcode', 'lsp');
const pyrightCommand = path.join(rootDir, 'node_modules', '.bin', 'pyright-langserver');
const bundledJdtlsRoot = process.env.JDTLS_HOME
  ? path.resolve(process.env.JDTLS_HOME)
  : path.join(rootDir, '.localcode', 'runtime', 'jdtls');
const defaultJdtlsDataDir = path.join(lspRoot, `java-data-${process.pid}`);

const languagePreludes = {
  java: `import java.util.*;

class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

`,
  python: `from __future__ import annotations
from typing import *
from collections import *
import heapq
import bisect

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

`
};

function preludeFor(language) {
  return languagePreludes[language] ?? '';
}

function preludeLineCount(language) {
  return (preludeFor(language).match(/\n/g) ?? []).length;
}

function toServerPosition(language, position) {
  return { ...position, line: position.line + preludeLineCount(language) };
}

function toClientRange(language, range) {
  if (!range) return range;
  const offset = preludeLineCount(language);
  const translate = (position) => position.line < offset
    ? { line: 0, character: 0 }
    : { ...position, line: position.line - offset };
  return { start: translate(range.start), end: translate(range.end) };
}

function translateTextEdit(language, edit) {
  if (!edit) return edit;
  return {
    ...edit,
    range: edit.range ? toClientRange(language, edit.range) : undefined,
    insert: edit.insert ? toClientRange(language, edit.insert) : undefined,
    replace: edit.replace ? toClientRange(language, edit.replace) : undefined
  };
}

function translateCompletion(language, item) {
  return {
    ...item,
    textEdit: translateTextEdit(language, item.textEdit),
    additionalTextEdits: item.additionalTextEdits?.map((edit) => translateTextEdit(language, edit))
  };
}

function systemJavaRuntime() {
  const result = spawnSync('java', ['-XshowSettings:properties', '-version'], { encoding: 'utf8' });
  const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  const home = process.env.LOCALCODE_JAVA_HOME
    ?? output.match(/^\s*java\.home\s*=\s*(.+)$/m)?.[1]?.trim()
    ?? null;
  const version = output.match(/^\s*java\.specification\.version\s*=\s*(.+)$/m)?.[1]?.trim() ?? null;
  return {
    home,
    name: version === '1.8' ? 'JavaSE-1.8' : (version ? `JavaSE-${version}` : null)
  };
}

const judgeJavaRuntime = systemJavaRuntime();

const languageConfiguration = {
  python: {
    languageId: 'python',
    extension: 'py',
    command: pyrightCommand,
    args: ['--stdio'],
    settings: {
      python: { analysis: { typeCheckingMode: 'basic', autoImportCompletions: true, diagnosticMode: 'openFilesOnly' } }
    }
  },
  java: {
    languageId: 'java',
    extension: 'java',
    settings: {
      java: {
        autobuild: { enabled: true },
        completion: { enabled: true, guessMethodArguments: true },
        signatureHelp: { enabled: true },
        configuration: {
          runtimes: judgeJavaRuntime.home && judgeJavaRuntime.name
            ? [{ name: judgeJavaRuntime.name, path: judgeJavaRuntime.home, default: true }]
            : []
        }
      }
    }
  }
};

function isSameDocumentUri(left, right) {
  if (!left || !right) return false;
  try {
    return path.resolve(fileURLToPath(left)) === path.resolve(fileURLToPath(right));
  } catch {
    return left === right;
  }
}

function findJdtlsLauncher() {
  const plugins = path.join(bundledJdtlsRoot, 'plugins');
  if (!fs.existsSync(plugins)) return null;
  return fs.readdirSync(plugins)
    .filter((name) => name.startsWith('org.eclipse.equinox.launcher_') && name.endsWith('.jar'))
    .sort()
    .at(-1);
}

function javaCommand() {
  const configured = process.env.JDTLS_JAVA;
  if (configured && fs.existsSync(configured)) return configured;
  const homebrewJava = '/opt/homebrew/opt/openjdk/bin/java';
  if (fs.existsSync(homebrewJava)) return homebrewJava;
  return 'java';
}

function jdtlsProcessConfiguration() {
  const dataDirectory = process.env.JDTLS_DATA_DIR ?? defaultJdtlsDataDir;
  if (process.env.JDTLS_COMMAND) {
    return { command: process.env.JDTLS_COMMAND, args: ['-data', dataDirectory] };
  }
  const launcher = findJdtlsLauncher();
  if (!launcher) return null;
  const configuration = process.platform === 'darwin'
    ? (process.arch === 'arm64' ? 'config_mac_arm' : 'config_mac')
    : process.platform === 'win32'
      ? 'config_win'
      : (process.arch === 'arm64' ? 'config_linux_arm' : 'config_linux');
  return {
    command: javaCommand(),
    args: [
      '-Declipse.application=org.eclipse.jdt.ls.core.id1',
      '-Dosgi.bundles.defaultStartLevel=4',
      '-Declipse.product=org.eclipse.jdt.ls.core.product',
      '-Dlog.level=WARNING',
      '-Xms128m',
      '-Xmx1g',
      '--add-modules=ALL-SYSTEM',
      '--add-opens', 'java.base/java.util=ALL-UNNAMED',
      '--add-opens', 'java.base/java.lang=ALL-UNNAMED',
      '-jar', path.join(bundledJdtlsRoot, 'plugins', launcher),
      '-configuration', path.join(bundledJdtlsRoot, configuration),
      '-data', dataDirectory
    ]
  };
}

function withTimeout(promise, milliseconds, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${milliseconds}ms`)), milliseconds);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForProcessExit(childProcess, milliseconds) {
  if (!childProcess || childProcess.exitCode !== null) return;
  await Promise.race([
    new Promise((resolve) => childProcess.once('exit', resolve)),
    sleep(milliseconds)
  ]);
  if (childProcess.exitCode === null) {
    childProcess.kill('SIGKILL');
    await Promise.race([
      new Promise((resolve) => childProcess.once('exit', resolve)),
      sleep(500)
    ]);
  }
}

class LanguageServerSession {
  constructor(language) {
    this.language = language;
    this.configuration = languageConfiguration[language];
    this.connection = null;
    this.process = null;
    this.starting = null;
    this.document = null;
    this.version = 0;
    this.diagnostics = [];
    this.diagnosticsRevision = 0;
    this.diagnosticListeners = new Set();
    this.serviceReady = language !== 'java';
    this.serviceReadyListeners = new Set();
    this.lastError = null;
    this.operationQueue = Promise.resolve();
    this.completionItems = new Map();
  }

  get workspacePath() {
    return path.join(lspRoot, `${this.language}-workspace`);
  }

  get documentPath() {
    return path.join(this.workspacePath, this.language === 'java' ? 'Solution.java' : 'solution.py');
  }

  status() {
    return {
      available: this.isInstalled(),
      running: Boolean(this.process && !this.process.killed),
      error: this.lastError
    };
  }

  isInstalled() {
    if (this.language === 'python') return fs.existsSync(pyrightCommand);
    return Boolean(jdtlsProcessConfiguration());
  }

  async start() {
    if (this.connection) return;
    if (this.starting) return this.starting;
    this.starting = this.#start();
    try {
      await this.starting;
    } finally {
      this.starting = null;
    }
  }

  async #start() {
    if (!this.isInstalled()) {
      throw new Error(`${this.language} language server is not installed`);
    }
    await fsPromises.mkdir(this.workspacePath, { recursive: true });
    const processConfiguration = this.language === 'java'
      ? jdtlsProcessConfiguration()
      : this.configuration;

    this.process = spawn(processConfiguration.command, processConfiguration.args, {
      cwd: this.workspacePath,
      env: process.env,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    let recentStderr = '';
    this.process.stderr.on('data', (chunk) => {
      const message = chunk.toString().trim();
      if (message) recentStderr = message.slice(-1000);
    });
    let rejectEarlyExit;
    const earlyExit = new Promise((_, reject) => { rejectEarlyExit = reject; });
    this.process.on('exit', (code) => {
      if (code && code !== 0) {
        this.lastError = recentStderr || `${this.language} language server exited with ${code}`;
      }
      rejectEarlyExit(new Error(this.lastError ?? `${this.language} language server exited`));
      this.connection = null;
      this.process = null;
      this.document = null;
    });

    const logger = {
      error: (message) => { this.lastError = String(message); },
      warn: () => {},
      info: () => {},
      log: () => {}
    };
    this.connection = createMessageConnection(
      new StreamMessageReader(this.process.stdout),
      new StreamMessageWriter(this.process.stdin),
      logger
    );
    this.connection.onNotification('textDocument/publishDiagnostics', (params) => {
      if (!isSameDocumentUri(params.uri, this.document?.uri)) return;
      if (params.version !== undefined && params.version < this.version) return;
      this.diagnostics = params.diagnostics ?? [];
      this.diagnosticsRevision += 1;
      for (const listener of this.diagnosticListeners) listener();
    });
    this.connection.onNotification('language/status', (params) => {
      if (params?.type !== 'ServiceReady') return;
      this.serviceReady = true;
      for (const listener of this.serviceReadyListeners) listener();
    });
    this.connection.listen();

    const rootUri = pathToFileURL(this.workspacePath).href;
    this.connection.onRequest('workspace/configuration', (params) => {
      return (params?.items ?? []).map((item) => {
        if (item.section === 'python.analysis') {
          return { typeCheckingMode: 'basic', autoImportCompletions: true, diagnosticMode: 'openFilesOnly' };
        }
        if (!item.section) return this.configuration.settings ?? {};
        return item.section.split('.').reduce((value, key) => value?.[key], this.configuration.settings) ?? {};
      });
    });
    this.connection.onRequest('client/registerCapability', () => null);
    this.connection.onRequest('workspace/workspaceFolders', () => [{ uri: rootUri, name: `localcode-${this.language}` }]);

    try {
      await withTimeout(Promise.race([
        this.connection.sendRequest('initialize', {
          processId: process.pid,
          rootUri,
          workspaceFolders: [{ uri: rootUri, name: `localcode-${this.language}` }],
          capabilities: {
            workspace: { workspaceFolders: true, configuration: true },
            textDocument: {
              completion: {
                completionItem: {
                  snippetSupport: true,
                  documentationFormat: ['markdown', 'plaintext'],
                  insertReplaceSupport: true,
                  resolveSupport: { properties: ['documentation', 'detail', 'additionalTextEdits'] }
                }
              },
              hover: { contentFormat: ['markdown', 'plaintext'] },
              publishDiagnostics: { relatedInformation: true }
            }
          },
          initializationOptions: this.language === 'java'
            ? { settings: this.configuration.settings }
            : undefined
        }),
        earlyExit
      ]), this.language === 'java' ? 45_000 : 15_000, `${this.language} language server initialization`);
    } catch (error) {
      this.lastError = error.message;
      this.process?.kill();
      this.connection = null;
      throw error;
    }
    this.connection.sendNotification('initialized', {});
    this.connection.sendNotification('workspace/didChangeConfiguration', {
      settings: this.configuration.settings ?? {}
    });
    if (this.language === 'java') await this.waitForServiceReady(8_000);
  }

  runExclusive(operation) {
    const result = this.operationQueue.then(operation, operation);
    this.operationQueue = result.catch(() => {});
    return result;
  }

  async updateDocument(code) {
    await this.start();
    const uri = pathToFileURL(this.documentPath).href;
    const documentCode = `${preludeFor(this.language)}${code}`;
    await fsPromises.writeFile(this.documentPath, documentCode, 'utf8');
    this.version += 1;
    if (!this.document) {
      this.document = { uri };
      this.connection.sendNotification('textDocument/didOpen', {
        textDocument: {
          uri,
          languageId: this.configuration.languageId,
          version: this.version,
          text: documentCode
        }
      });
    } else {
      this.connection.sendNotification('textDocument/didChange', {
        textDocument: { uri, version: this.version },
        contentChanges: [{ text: documentCode }]
      });
    }
    return uri;
  }

  async completion({ code, position, triggerCharacter }) {
    return this.runExclusive(async () => {
      const uri = await this.updateDocument(code);
      const result = await withTimeout(this.connection.sendRequest('textDocument/completion', {
        textDocument: { uri },
        position: toServerPosition(this.language, position),
        context: triggerCharacter
          ? { triggerKind: 2, triggerCharacter }
          : { triggerKind: 1 }
      }), 8_000, `${this.language} completion`);
      const items = Array.isArray(result) ? result : result?.items ?? [];
      this.completionItems = new Map(items
        .filter((item) => item.data !== undefined)
        .map((item) => [JSON.stringify(item.data), item]));
      return items.slice(0, 200).map((item) => translateCompletion(this.language, item));
    });
  }

  async resolveCompletion(item) {
    return this.runExclusive(async () => {
      await this.start();
      const serverItem = item.data === undefined
        ? item
        : (this.completionItems.get(JSON.stringify(item.data)) ?? item);
      const resolved = await withTimeout(
        this.connection.sendRequest('completionItem/resolve', serverItem),
        8_000,
        `${this.language} completion resolve`
      );
      return translateCompletion(this.language, resolved);
    });
  }

  async hover({ code, position }) {
    return this.runExclusive(async () => {
      const uri = await this.updateDocument(code);
      return withTimeout(this.connection.sendRequest('textDocument/hover', {
        textDocument: { uri },
        position: toServerPosition(this.language, position)
      }), 8_000, `${this.language} hover`).then((hover) => hover
        ? { ...hover, range: toClientRange(this.language, hover.range) }
        : hover);
    });
  }

  async signatureHelp({ code, position, triggerCharacter, isRetrigger }) {
    return this.runExclusive(async () => {
      const uri = await this.updateDocument(code);
      return withTimeout(this.connection.sendRequest('textDocument/signatureHelp', {
        textDocument: { uri },
        position: toServerPosition(this.language, position),
        context: {
          triggerKind: triggerCharacter ? 2 : (isRetrigger ? 3 : 1),
          triggerCharacter,
          isRetrigger: Boolean(isRetrigger)
        }
      }), 8_000, `${this.language} signature help`);
    });
  }

  async waitForDiagnosticsAfter(revision, milliseconds) {
    if (this.diagnosticsRevision > revision) return;
    await new Promise((resolve) => {
      const finish = () => {
        clearTimeout(timer);
        this.diagnosticListeners.delete(finish);
        resolve();
      };
      const timer = setTimeout(finish, milliseconds);
      this.diagnosticListeners.add(finish);
      if (this.diagnosticsRevision > revision) finish();
    });
  }

  async waitForServiceReady(milliseconds) {
    if (this.serviceReady) return;
    await new Promise((resolve) => {
      const finish = () => {
        clearTimeout(timer);
        this.serviceReadyListeners.delete(finish);
        resolve();
      };
      const timer = setTimeout(finish, milliseconds);
      this.serviceReadyListeners.add(finish);
      if (this.serviceReady) finish();
    });
  }

  async analyze({ code }) {
    return this.runExclusive(async () => {
      this.diagnostics = [];
      const revision = this.diagnosticsRevision;
      const startedAt = Date.now();
      await this.updateDocument(code);
      await this.waitForDiagnosticsAfter(revision, this.language === 'java' ? 2_500 : 1_500);
      const minimumWait = this.language === 'java' ? 700 : 450;
      await sleep(Math.max(0, minimumWait - (Date.now() - startedAt)));
      const offset = preludeLineCount(this.language);
      return this.diagnostics
        .filter((item) => item.range?.end?.line >= offset)
        .map((item) => ({ ...item, range: toClientRange(this.language, item.range) }));
    });
  }

  async close() {
    const connection = this.connection;
    const childProcess = this.process;
    try {
      if (connection) {
        await withTimeout(connection.sendRequest('shutdown'), 2_000, `${this.language} shutdown`);
        connection.sendNotification('exit');
      }
    } catch {}
    await waitForProcessExit(childProcess, 1_500);
    this.connection = null;
    this.process = null;
    this.serviceReady = this.language !== 'java';
    if (this.language === 'java' && !process.env.JDTLS_DATA_DIR) {
      await fsPromises.rm(defaultJdtlsDataDir, {
        recursive: true,
        force: true,
        maxRetries: 5,
        retryDelay: 100
      });
    }
  }
}

const sessions = {
  java: new LanguageServerSession('java'),
  python: new LanguageServerSession('python')
};

function getSession(language) {
  const session = sessions[language];
  if (!session) throw new Error(`No language server configured for ${language}`);
  return session;
}

export function languageServiceStatus() {
  return Object.fromEntries(Object.entries(sessions).map(([language, session]) => [language, session.status()]));
}

export async function getCompletions(request) {
  return getSession(request.language).completion(request);
}

export async function resolveCompletion(request) {
  return getSession(request.language).resolveCompletion(request.item);
}

export async function getHover(request) {
  return getSession(request.language).hover(request);
}

export async function getSignatureHelp(request) {
  return getSession(request.language).signatureHelp(request);
}

export async function getDiagnostics(request) {
  return getSession(request.language).analyze(request);
}

export async function closeLanguageServices() {
  await Promise.all(Object.values(sessions).map((session) => session.close()));
}
