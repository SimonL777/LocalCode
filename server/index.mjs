import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { store } from './database.mjs';
import {
  closeLanguageServices,
  getCompletions,
  getDiagnostics,
  getHover,
  getSignatureHelp,
  languageServiceStatus,
  resolveCompletion
} from './language-service.mjs';
import { findProblem, loadProblems } from './problems.mjs';
import { runSubmission } from './runner.mjs';

const app = express();
const port = Number(process.env.PORT ?? 8787);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', runner: 'local-process', storage: 'sqlite' });
});

app.get('/api/state', (_request, response) => {
  response.json(store.getState());
});

app.get('/api/intelligence/status', (_request, response) => {
  response.json(languageServiceStatus());
});

app.post('/api/intelligence/completion', async (request, response, next) => {
  try {
    response.json({ items: await getCompletions(request.body) });
  } catch (error) {
    response.status(503).json({ message: error.message });
  }
});

app.post('/api/intelligence/completion/resolve', async (request, response) => {
  try {
    response.json({ item: await resolveCompletion(request.body) });
  } catch (error) {
    response.status(503).json({ message: error.message });
  }
});

app.post('/api/intelligence/hover', async (request, response) => {
  try {
    response.json({ hover: await getHover(request.body) });
  } catch (error) {
    response.status(503).json({ message: error.message });
  }
});

app.post('/api/intelligence/signature', async (request, response) => {
  try {
    response.json({ signature: await getSignatureHelp(request.body) });
  } catch (error) {
    response.status(503).json({ message: error.message });
  }
});

app.post('/api/intelligence/diagnostics', async (request, response) => {
  try {
    response.json({ diagnostics: await getDiagnostics(request.body) });
  } catch (error) {
    response.status(503).json({ message: error.message });
  }
});

app.post('/api/state/import', (request, response) => {
  response.json(store.importState(request.body ?? {}));
});

app.put('/api/solutions/:problemId/:language', (request, response) => {
  const { problemId, language } = request.params;
  const { code } = request.body ?? {};
  if (!['java', 'javascript', 'python'].includes(language) || typeof code !== 'string' || code.length > 100_000) {
    return response.status(400).json({ message: '作答数据不合法。' });
  }
  response.json(store.saveSolution({ problemId, language, code }));
});

app.put('/api/progress/:problemId', (request, response) => {
  const value = request.body ?? {};
  response.json(store.saveProgress({ problemId: request.params.problemId, ...value }));
});

app.get('/api/problems', async (_request, response, next) => {
  try {
    const problems = await loadProblems();
    response.json(problems);
  } catch (error) {
    next(error);
  }
});

app.get('/api/problems/:id', async (request, response, next) => {
  try {
    const problem = await findProblem(request.params.id);
    if (!problem) return response.status(404).json({ message: '题目不存在。' });
    response.json(problem);
  } catch (error) {
    next(error);
  }
});

app.post('/api/run', async (request, response, next) => {
  try {
    const startedAt = Date.now();
    const result = await runSubmission(request.body);
    const { problemId, language, mode = 'debug', code } = request.body;
    const validIdentity = problemId !== undefined && ['java', 'javascript', 'python'].includes(language);
    if (validIdentity && typeof code === 'string') {
      store.saveSolution({ problemId, language, code });
    }
    if (validIdentity && ['debug', 'submit'].includes(mode)) {
      store.recordAttempt({ problemId, language, mode, result, durationMs: Date.now() - startedAt });
    }
    response.json(result);
  } catch (error) {
    next(error);
  }
});

app.use(express.static(path.join(rootDir, 'dist')));
app.get(/.*/, (_request, response) => {
  response.sendFile(path.join(rootDir, 'dist', 'index.html'));
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ message: error.message || '服务器错误。' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`LocalCode API listening on http://localhost:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    await closeLanguageServices();
    process.exit(0);
  });
}
