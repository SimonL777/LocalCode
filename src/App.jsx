import { useEffect, useMemo, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Code2,
  Eye,
  FileQuestion,
  Filter,
  FlaskConical,
  Play,
  RotateCcw,
  Search,
  Send,
  TerminalSquare,
  X
} from 'lucide-react';

const languages = [
  { id: 'java', label: 'Java' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' }
];

const completionItems = {
  java: [
    ['fori', 'for (int i = 0; i < ${1:nums}.length; i++) {\n    ${0}\n}', '索引循环'],
    ['hashmap', 'Map<${1:Integer}, ${2:Integer}> ${3:map} = new HashMap<>();', 'HashMap 声明'],
    ['arraylist', 'List<${1:Integer}> ${2:list} = new ArrayList<>();', 'ArrayList 声明'],
    ['deque', 'Deque<${1:Integer}> ${2:deque} = new ArrayDeque<>();', '双端队列'],
    ['priorityqueue', 'PriorityQueue<${1:Integer}> ${2:heap} = new PriorityQueue<>();', '优先队列'],
    ['sort', 'Arrays.sort(${1:nums});', '数组排序']
  ],
  javascript: [
    ['fori', 'for (let i = 0; i < ${1:nums}.length; i++) {\n  ${0}\n}', '索引循环'],
    ['map', 'const ${1:map} = new Map();', 'Map'],
    ['set', 'const ${1:set} = new Set();', 'Set'],
    ['queue', 'const ${1:queue} = [];', '队列'],
    ['sortnum', '${1:nums}.sort((a, b) => a - b);', '数字升序排序']
  ],
  python: [
    ['enumerate', 'for ${1:i}, ${2:value} in enumerate(${3:nums}):\n    ${0}', '带下标遍历'],
    ['defaultdict', '${1:counts} = defaultdict(int)', 'defaultdict'],
    ['deque', '${1:queue} = deque()', '双端队列'],
    ['heap', '${1:heap} = []\nheapq.heapify(${1:heap})', '最小堆'],
    ['dict', '${1:seen}: dict[int, int] = {}', '字典']
  ]
};

const lspLanguages = new Set(['java', 'python']);

function toMonacoRange(range) {
  if (!range) return null;
  return {
    startLineNumber: range.start.line + 1,
    startColumn: range.start.character + 1,
    endLineNumber: range.end.line + 1,
    endColumn: range.end.character + 1
  };
}

function completionDocumentation(documentation) {
  if (!documentation) return undefined;
  if (typeof documentation === 'string') return { value: documentation };
  if (typeof documentation.value === 'string') return { value: documentation.value };
  return undefined;
}

function lspDocumentation(documentation) {
  if (!documentation) return undefined;
  if (typeof documentation === 'string') return documentation;
  if (typeof documentation.value === 'string') return { value: documentation.value };
  return undefined;
}

function completionLabel(label) {
  if (typeof label === 'string') return label;
  return label?.label ?? String(label ?? '');
}

function mapCompletionItem(monaco, model, position, item) {
  const word = model.getWordUntilPosition(position);
  const fallbackRange = {
    startLineNumber: position.lineNumber,
    startColumn: word.startColumn,
    endLineNumber: position.lineNumber,
    endColumn: word.endColumn
  };
  const edit = item.textEdit;
  const editRange = edit?.range ?? edit?.replace ?? edit?.insert;
  const insertText = edit?.newText ?? item.insertText ?? completionLabel(item.label);
  return {
    label: completionLabel(item.label),
    kind: item.kind ?? monaco.languages.CompletionItemKind.Text,
    detail: item.detail,
    documentation: completionDocumentation(item.documentation),
    insertText,
    insertTextRules: item.insertTextFormat === 2
      ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
      : undefined,
    range: toMonacoRange(editRange) ?? fallbackRange,
    sortText: item.sortText,
    filterText: item.filterText,
    additionalTextEdits: item.additionalTextEdits?.map((additionalEdit) => ({
      range: toMonacoRange(additionalEdit.range),
      text: additionalEdit.newText
    })),
    lspItem: item
  };
}

function mergeResolvedCompletion(monaco, suggestion, item) {
  const edit = item.textEdit;
  const editRange = edit?.range ?? edit?.replace ?? edit?.insert;
  return {
    ...suggestion,
    label: completionLabel(item.label),
    detail: item.detail ?? suggestion.detail,
    documentation: completionDocumentation(item.documentation) ?? suggestion.documentation,
    insertText: edit?.newText ?? item.insertText ?? suggestion.insertText,
    insertTextRules: item.insertTextFormat === 2
      ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
      : suggestion.insertTextRules,
    range: toMonacoRange(editRange) ?? suggestion.range,
    additionalTextEdits: item.additionalTextEdits?.map((additionalEdit) => ({
      range: toMonacoRange(additionalEdit.range),
      text: additionalEdit.newText
    })) ?? suggestion.additionalTextEdits,
    lspItem: item
  };
}

function mapSignatureHelp(signature) {
  if (!signature?.signatures?.length) return null;
  return {
    value: {
      activeSignature: signature.activeSignature ?? 0,
      activeParameter: signature.activeParameter ?? 0,
      signatures: signature.signatures.map((item) => ({
        label: item.label,
        documentation: lspDocumentation(item.documentation),
        activeParameter: item.activeParameter,
        parameters: (item.parameters ?? []).map((parameter) => ({
          label: parameter.label,
          documentation: lspDocumentation(parameter.documentation)
        }))
      }))
    },
    dispose: () => {}
  };
}

function hoverContents(contents) {
  if (!contents) return [];
  if (typeof contents === 'string') return [{ value: contents }];
  if (Array.isArray(contents)) {
    return contents.map((item) => {
      if (typeof item === 'string') return { value: item };
      if (item?.value) return { value: item.value };
      return { value: String(item ?? '') };
    });
  }
  if (contents.value) return [{ value: contents.value }];
  return [];
}

function storageKey(problemId, language) {
  return `localcode:code:${problemId}:${language}`;
}

function progressKey(problemId) {
  return `localcode:progress:${problemId}`;
}

function readLocalProgress(problemId) {
  try {
    return JSON.parse(localStorage.getItem(progressKey(problemId))) ?? {};
  } catch {
    return {};
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const rest = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${rest}`;
}

function difficultyLabel(value) {
  return value === 'Easy' ? '简单' : value === 'Medium' ? '中等' : '困难';
}

export default function App() {
  const [problems, setProblems] = useState([]);
  const [selectedId, setSelectedId] = useState('1');
  const [language, setLanguage] = useState('java');
  const [code, setCode] = useState('');
  const [query, setQuery] = useState('');
  const [coreOnly, setCoreOnly] = useState(false);
  const [result, setResult] = useState(null);
  const [runningMode, setRunningMode] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [revealedHints, setRevealedHints] = useState(0);
  const [error, setError] = useState('');
  const [solutions, setSolutions] = useState({});
  const [progressById, setProgressById] = useState({});
  const [storageReady, setStorageReady] = useState(false);
  const saveTimer = useRef(null);
  const progressSaveTimer = useRef(null);
  const diagnosticsTimer = useRef(null);
  const diagnosticsRequest = useRef(0);
  const monacoRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/problems').then((response) => {
        if (!response.ok) throw new Error('题库加载失败');
        return response.json();
      }),
      fetch('/api/state').then((response) => {
        if (!response.ok) throw new Error('SQLite 状态加载失败');
        return response.json();
      })
    ])
      .then(([loadedProblems, persisted]) => {
        const mergedSolutions = { ...(persisted.solutions ?? {}) };
        const mergedProgress = { ...(persisted.progress ?? {}) };
        let migrated = false;

        for (const problem of loadedProblems) {
          for (const item of languages) {
            const key = `${problem.id}:${item.id}`;
            const localCode = localStorage.getItem(storageKey(problem.id, item.id));
            if (mergedSolutions[key] === undefined && localCode !== null) {
              mergedSolutions[key] = localCode;
              migrated = true;
            }
          }
          const localProgress = readLocalProgress(problem.id);
          if (mergedProgress[problem.id] === undefined && Object.keys(localProgress).length > 0) {
            mergedProgress[problem.id] = localProgress;
            migrated = true;
          }
        }

        setProblems(loadedProblems);
        setSolutions(mergedSolutions);
        setProgressById(mergedProgress);
        setStorageReady(true);

        if (migrated) {
          fetch('/api/state/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ solutions: mergedSolutions, progress: mergedProgress })
          }).catch(() => {});
        }
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  const selected = problems.find((problem) => problem.id === selectedId) ?? problems[0];

  useEffect(() => {
    if (!selected || !storageReady) return;
    const key = `${selected.id}:${language}`;
    setCode(solutions[key] ?? selected.starters[language] ?? '');
    setResult(null);
    setReferenceOpen(false);
    setRevealedHints(0);
    setSeconds(progressById[selected.id]?.seconds ?? 0);
    setTimerRunning(false);
  }, [selected?.id, language, storageReady]);

  useEffect(() => {
    if (!timerRunning) return undefined;
    const interval = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    if (!selected || !storageReady) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const key = `${selected.id}:${language}`;
      setSolutions((current) => current[key] === code ? current : { ...current, [key]: code });
      fetch(`/api/solutions/${selected.id}/${language}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      }).catch(() => {});
    }, 350);
    return () => clearTimeout(saveTimer.current);
  }, [code, selected?.id, language, storageReady]);

  useEffect(() => {
    if (!selected || !storageReady) return;
    clearTimeout(progressSaveTimer.current);
    progressSaveTimer.current = setTimeout(() => {
      const nextProgress = { ...(progressById[selected.id] ?? {}), seconds };
      setProgressById((current) => ({ ...current, [selected.id]: nextProgress }));
      fetch(`/api/progress/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextProgress)
      }).catch(() => {});
    }, 250);
    return () => clearTimeout(progressSaveTimer.current);
  }, [seconds, selected?.id, storageReady]);

  useEffect(() => {
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    const model = editor?.getModel();
    if (!monaco || !model || !storageReady) return;

    clearTimeout(diagnosticsTimer.current);
    if (!lspLanguages.has(language)) {
      monaco.editor.setModelMarkers(model, 'localcode-lsp', []);
      return;
    }

    const requestId = diagnosticsRequest.current + 1;
    diagnosticsRequest.current = requestId;
    diagnosticsTimer.current = setTimeout(async () => {
      try {
        const response = await fetch('/api/intelligence/diagnostics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language, code })
        });
        if (!response.ok) return;
        const payload = await response.json();
        if (diagnosticsRequest.current !== requestId || editorRef.current?.getModel() !== model) return;
        const severity = {
          1: monaco.MarkerSeverity.Error,
          2: monaco.MarkerSeverity.Warning,
          3: monaco.MarkerSeverity.Info,
          4: monaco.MarkerSeverity.Hint
        };
        monaco.editor.setModelMarkers(model, 'localcode-lsp', (payload.diagnostics ?? []).map((item) => ({
          ...toMonacoRange(item.range),
          message: item.message,
          severity: severity[item.severity] ?? monaco.MarkerSeverity.Info,
          source: item.source,
          code: typeof item.code === 'object' ? item.code.value : item.code
        })));
      } catch {}
    }, 550);
    return () => clearTimeout(diagnosticsTimer.current);
  }, [code, language, selected?.id, storageReady]);

  const filteredProblems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return problems.filter((problem) => {
      const matchesQuery = !normalized || `${problem.id} ${problem.title} ${problem.pattern}`.toLowerCase().includes(normalized);
      return matchesQuery && (!coreOnly || problem.core16);
    });
  }, [problems, query, coreOnly]);

  const passedCount = problems.filter((problem) => progressById[problem.id]?.status === 'passed').length;

  function configureMonaco(monaco) {
    monacoRef.current = monaco;
    monaco.editor.defineTheme('localcode-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#111318',
        'editorLineNumber.foreground': '#555b66',
        'editorLineNumber.activeForeground': '#d8dce5',
        'editor.selectionBackground': '#325f5266',
        'editor.inactiveSelectionBackground': '#263d3766'
      }
    });
    Object.entries(completionItems).forEach(([languageId, items]) => {
      monaco.languages.registerCompletionItemProvider(languageId, {
        provideCompletionItems: () => ({
          suggestions: items.map(([label, insertText, detail]) => ({
            label,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail,
            sortText: `zz-${label}`
          }))
        })
      });
    });

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false
    });
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      allowNonTsExtensions: true,
      checkJs: true,
      target: monaco.languages.typescript.ScriptTarget.ES2022
    });
    monaco.languages.typescript.javascriptDefaults.addExtraLib(`
declare class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val?: number, next?: ListNode | null);
}
declare class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null);
}
`, 'file:///localcode-runtime.d.ts');

    for (const languageId of lspLanguages) {
      monaco.languages.registerCompletionItemProvider(languageId, {
        triggerCharacters: languageId === 'java' ? ['.', '@', '#'] : ['.'],
        provideCompletionItems: async (model, position, context) => {
          try {
            const response = await fetch('/api/intelligence/completion', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                language: languageId,
                code: model.getValue(),
                position: { line: position.lineNumber - 1, character: position.column - 1 },
                triggerCharacter: context.triggerCharacter
              })
            });
            if (!response.ok) return { suggestions: [] };
            const payload = await response.json();
            return {
              suggestions: (payload.items ?? []).map((item) => mapCompletionItem(monaco, model, position, item))
            };
          } catch {
            return { suggestions: [] };
          }
        },
        resolveCompletionItem: async (suggestion) => {
          if (!suggestion.lspItem) return suggestion;
          try {
            const response = await fetch('/api/intelligence/completion/resolve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ language: languageId, item: suggestion.lspItem })
            });
            if (!response.ok) return suggestion;
            const { item } = await response.json();
            return item ? mergeResolvedCompletion(monaco, suggestion, item) : suggestion;
          } catch {
            return suggestion;
          }
        }
      });

      monaco.languages.registerHoverProvider(languageId, {
        provideHover: async (model, position) => {
          try {
            const response = await fetch('/api/intelligence/hover', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                language: languageId,
                code: model.getValue(),
                position: { line: position.lineNumber - 1, character: position.column - 1 }
              })
            });
            if (!response.ok) return null;
            const { hover } = await response.json();
            if (!hover) return null;
            return { contents: hoverContents(hover.contents), range: toMonacoRange(hover.range) ?? undefined };
          } catch {
            return null;
          }
        }
      });

      monaco.languages.registerSignatureHelpProvider(languageId, {
        signatureHelpTriggerCharacters: ['(', ','],
        signatureHelpRetriggerCharacters: [','],
        provideSignatureHelp: async (model, position, _token, context) => {
          try {
            const response = await fetch('/api/intelligence/signature', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                language: languageId,
                code: model.getValue(),
                position: { line: position.lineNumber - 1, character: position.column - 1 },
                triggerCharacter: context.triggerCharacter,
                isRetrigger: context.isRetrigger
              })
            });
            if (!response.ok) return null;
            const { signature } = await response.json();
            return mapSignatureHelp(signature);
          } catch {
            return null;
          }
        }
      });
    }
  }

  function editorMounted(editor, monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;
  }

  function updateProgress(patch) {
    if (!selected) return;
    const progress = { ...(progressById[selected.id] ?? {}), ...patch, seconds };
    setProgressById((current) => ({ ...current, [selected.id]: progress }));
    fetch(`/api/progress/${selected.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progress)
    }).catch(() => {});
  }

  async function runCode(mode) {
    if (!selected?.runnable || runningMode) return;
    setRunningMode(mode);
    setResult(null);
    setTimerRunning(false);
    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: selected.id, language, code, mode })
      });
      const payload = await response.json();
      setResult(payload);
      if (payload.ok && mode === 'submit') {
        updateProgress({ status: 'passed', lastPassedAt: new Date().toISOString() });
      }
    } catch (requestError) {
      setResult({ ok: false, stage: 'network', message: requestError.message });
    } finally {
      setRunningMode(null);
    }
  }

  function resetCode() {
    if (!selected) return;
    const starter = selected.starters[language] ?? '';
    setCode(starter);
    setResult(null);
  }

  if (error) return <main className="fatal-state"><FileQuestion size={28} /><p>{error}</p></main>;
  if (!selected || !storageReady) return <main className="fatal-state"><Circle className="spinner" size={24} /><p>正在读取本地题库...</p></main>;

  const currentIndex = problems.findIndex((problem) => problem.id === selected.id);
  const progress = progressById[selected.id] ?? {};

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><Code2 size={20} /><strong>LocalCode</strong></div>
        <div className="today-progress"><span>{passedCount}/{problems.length} 已通过</span><div className="progress-track"><i style={{ width: `${problems.length ? (passedCount / problems.length) * 100 : 0}%` }} /></div></div>
        <div className="top-actions">
          <button className="icon-button" title="上一题" disabled={currentIndex <= 0} onClick={() => setSelectedId(problems[currentIndex - 1].id)}><ChevronLeft /></button>
          <button className="icon-button" title="下一题" disabled={currentIndex >= problems.length - 1} onClick={() => setSelectedId(problems[currentIndex + 1].id)}><ChevronRight /></button>
        </div>
      </header>

      <aside className="problem-sidebar">
        <div className="sidebar-tools">
          <label className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索题目或模式" /></label>
          <button className={`filter-button ${coreOnly ? 'active' : ''}`} onClick={() => setCoreOnly((value) => !value)}><Filter size={15} />保底 16</button>
        </div>
        <div className="problem-list">
          {filteredProblems.map((problem) => {
            const itemProgress = progressById[problem.id] ?? {};
            return (
              <button key={problem.id} className={`problem-row ${problem.id === selected.id ? 'selected' : ''}`} onClick={() => setSelectedId(problem.id)}>
                <span className={`status-dot ${itemProgress.status === 'passed' ? 'passed' : ''}`}>{itemProgress.status === 'passed' ? <Check size={12} /> : null}</span>
                <span className="problem-title"><b>{problem.id}. {problem.title}</b><small>{problem.pattern} · {problem.date}</small></span>
                <span className={`difficulty ${problem.difficulty.toLowerCase()}`}>{difficultyLabel(problem.difficulty)}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="statement-pane">
        <div className="pane-header">
          <div>
            <div className="title-line"><h1>{selected.id}. {selected.title}</h1>{selected.core16 && <span className="core-badge">保底</span>}</div>
            <div className="metadata"><span>{difficultyLabel(selected.difficulty)}</span><span>{selected.pattern}</span><span>{selected.date}</span></div>
          </div>
          {progress.status === 'passed' && <span className="passed-label"><Check size={14} />已通过</span>}
        </div>
        <article className="markdown-body"><ReactMarkdown remarkPlugins={[remarkGfm]}>{selected.statement}</ReactMarkdown></article>
      </section>

      <section className="workbench-pane">
        <div className="editor-toolbar">
          <div className="language-tabs">
            {languages.map((item) => <button key={item.id} className={language === item.id ? 'active' : ''} onClick={() => setLanguage(item.id)}>{item.label}</button>)}
          </div>
          <div className="timer-control">
            <Clock3 size={15} /><span>{formatTime(seconds)}</span>
            <button onClick={() => setTimerRunning((value) => !value)}>{timerRunning ? '暂停' : '计时'}</button>
          </div>
          <button className="icon-button" title="恢复起始代码" onClick={resetCode}><RotateCcw size={16} /></button>
        </div>

        <div className="editor-wrap">
          <Editor
            language={language}
            value={code}
            onChange={(value) => setCode(value ?? '')}
            beforeMount={configureMonaco}
            onMount={editorMounted}
            theme="localcode-dark"
            options={{
              automaticLayout: true,
              fontFamily: "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace",
              fontSize: 14,
              lineHeight: 22,
              minimap: { enabled: false },
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              tabSize: 4,
              suggest: { showSnippets: true },
              quickSuggestions: { other: true, comments: false, strings: false },
              suggestOnTriggerCharacters: true,
              parameterHints: { enabled: true, cycle: true },
              wordBasedSuggestions: 'off',
              acceptSuggestionOnEnter: 'smart'
            }}
          />
        </div>

        <div className="action-bar">
          <div className="action-left">
            {selected.reference && <button className="secondary-button" onClick={() => setReferenceOpen(true)}><Eye size={16} />提示与答案</button>}
            {!selected.runnable && <span className="runner-note">本题判题适配待接入</span>}
          </div>
          <div className="run-actions">
            <button className="debug-button" disabled={!selected.runnable || Boolean(runningMode)} onClick={() => runCode('debug')}>
              <FlaskConical size={16} />{runningMode === 'debug' ? '调试中' : '运行调试'}
            </button>
            <button className="run-button" disabled={!selected.runnable || Boolean(runningMode)} onClick={() => runCode('submit')}>
              <Send size={15} />{runningMode === 'submit' ? '提交中' : '提交测试'}
            </button>
          </div>
        </div>

        <div className="result-pane">
          <div className="result-heading"><TerminalSquare size={16} /><strong>测试结果</strong></div>
          {!result && <p className="empty-result">运行代码后在这里查看编译信息和测试结果。</p>}
          {result && result.stage !== 'test' && <pre className="error-output">{result.message}</pre>}
          {result?.stage === 'test' && (
            <div className="test-results">
              <div className={`result-summary ${result.ok ? 'success' : 'failure'}`}>
                <span>{result.mode === 'submit' ? '正式测试' : '调试用例'}</span>
                <b>{result.passedCount}/{result.totalCount} 通过</b>
              </div>
              {result.tests.map((test) => (
                <div className="test-row" key={test.index}>
                  <span>{test.passed ? <Check size={15} /> : <X size={15} />}</span>
                  <b>{test.hidden ? `隐藏用例 ${test.index + 1}` : `用例 ${test.index + 1}`}</b>
                  <code>{test.name}</code>
                  {test.hidden
                    ? <code className="hidden-case">{test.passed ? '通过' : '未通过'}</code>
                    : <code>期望 {JSON.stringify(test.expected)} · 得到 {JSON.stringify(test.received)}</code>}
                </div>
              ))}
              {result.stdout && <pre>{result.stdout}</pre>}
            </div>
          )}
        </div>
      </section>

      {referenceOpen && selected.reference && (
        <div className="drawer-backdrop" onClick={() => setReferenceOpen(false)}>
          <aside className="reference-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-header"><div><small>复刷辅助</small><h2>{selected.id}. {selected.title}</h2></div><button className="icon-button" onClick={() => setReferenceOpen(false)}><X /></button></div>
            <div className="hint-section">
              <h3>逐级提示</h3>
              {selected.reference.hints.slice(0, revealedHints).map((hint, index) => <p key={hint}><b>提示 {index + 1}</b>{hint}</p>)}
              {revealedHints < selected.reference.hints.length && <button className="secondary-button" onClick={() => setRevealedHints((value) => value + 1)}>揭示提示 {revealedHints + 1}</button>}
            </div>
            <div className="answer-section">
              <h3>参考实现</h3>
              <p>{selected.reference.complexity}</p>
              <pre><code>{selected.reference[language]}</code></pre>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
