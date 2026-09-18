import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { javascriptStarters, references, runnableSpecs } from './catalog.mjs';

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(serverDir, '..');
const legacyStudyDir = path.resolve(serverDir, '../..');
const bundledStudyDir = path.join(rootDir, 'data', 'demo');

function resolveStudyDir() {
  const candidates = [
    process.env.LOCALCODE_STUDY_DIR,
    legacyStudyDir,
    bundledStudyDir
  ].filter(Boolean).map((value) => path.resolve(value));
  const selected = candidates.find((directory) => fs.existsSync(path.join(directory, '题源索引.json')));
  if (!selected) {
    throw new Error('找不到题库。请设置 LOCALCODE_STUDY_DIR，或保留 data/demo 演示题库。');
  }
  return selected;
}

function problemPath(studyDir, localFile) {
  const resolved = path.resolve(studyDir, localFile);
  if (resolved !== studyDir && !resolved.startsWith(`${studyDir}${path.sep}`)) {
    throw new Error(`题目文件路径越界：${localFile}`);
  }
  return resolved;
}

function extractCode(markdown, language) {
  const heading = language === 'java' ? '### Java' : '### Python3';
  const start = markdown.indexOf(heading);
  if (start < 0) return '';
  const tail = markdown.slice(start + heading.length);
  const match = tail.match(/```(?:java|python)?\s*\n([\s\S]*?)```/);
  return match?.[1]?.trim() ?? '';
}

function statementOnly(markdown) {
  return markdown
    .split('## 起始代码（不含题解）')[0]
    .replace(/^> 这是个人学习用题面快照[^\n]*\n?/m, '')
    .trim();
}

export async function loadProblems() {
  const studyDir = resolveStudyDir();
  const index = JSON.parse(await fsPromises.readFile(path.join(studyDir, '题源索引.json'), 'utf8'));
  return Promise.all(index.questions.map(async (question) => {
    const markdown = await fsPromises.readFile(problemPath(studyDir, question.local_file), 'utf8');
    return {
      ...question,
      statement: statementOnly(markdown),
      runnable: Boolean(runnableSpecs[question.id]),
      starters: {
        java: extractCode(markdown, 'java'),
        javascript: javascriptStarters[question.id] ?? '',
        python: extractCode(markdown, 'python')
      },
      reference: references[question.id] ?? null
    };
  }));
}

export async function findProblem(id) {
  const problems = await loadProblems();
  return problems.find((problem) => problem.id === String(id));
}
