import type { ExecutionLog, SupportedLanguage } from '../types';

declare global {
  interface Window {
    loadPyodide?: any;
    pyodideInstance?: any;
  }
}

// Piston API mapping
const PISTON_LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  python: { language: 'python', version: '3.10.0' },
  cpp: { language: 'c++', version: '10.2.0' },
  c: { language: 'c', version: '10.2.0' },
  java: { language: 'java', version: '15.0.2' },
  rust: { language: 'rust', version: '1.68.2' },
  javascript: { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
};

export async function runCode(
  language: SupportedLanguage,
  code: string,
  filename: string,
  onLog: (log: ExecutionLog) => void
): Promise<{ success: boolean; durationMs: number }> {
  const startTime = performance.now();

  const addLog = (text: string, type: ExecutionLog['type'] = 'stdout') => {
    onLog({
      id: Math.random().toString(36).substring(2, 9),
      text,
      type,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  addLog(`[SatyamLabs] Launching execution for ${filename}...`, 'system');

  // 1. Python Execution: Try In-Browser Pyodide first (Offline capable!)
  if (language === 'python') {
    try {
      if (typeof window.loadPyodide === 'function') {
        if (!window.pyodideInstance) {
          addLog('[Pyodide] Initializing offline WebAssembly Python 3 runtime...', 'system');
          window.pyodideInstance = await window.loadPyodide();
        }

        const pyodide = window.pyodideInstance;
        
        // Redirect stdout/stderr
        pyodide.setStdout({
          batched: (text: string) => addLog(text, 'stdout'),
        });
        pyodide.setStderr({
          batched: (text: string) => addLog(text, 'stderr'),
        });

        await pyodide.runPythonAsync(code);
        const duration = Math.round(performance.now() - startTime);
        addLog(`[Pyodide] Process exited with status 0 (in ${duration}ms)`, 'system');
        return { success: true, durationMs: duration };
      }
    } catch (wasmErr: any) {
      console.warn('Pyodide offline error, falling back to API runner:', wasmErr);
      addLog(`[Pyodide Notice] ${wasmErr.message || 'Falling back to high-speed cloud runner'}`, 'info');
    }
  }

  // 2. JavaScript / TypeScript direct in-browser runner
  if (language === 'javascript' || language === 'typescript') {
    try {
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;

      console.log = (...args: any[]) => {
        addLog(args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '), 'stdout');
        originalLog(...args);
      };

      console.warn = (...args: any[]) => {
        addLog(args.map(a => String(a)).join(' '), 'info');
        originalWarn(...args);
      };

      console.error = (...args: any[]) => {
        addLog(args.map(a => String(a)).join(' '), 'stderr');
        originalError(...args);
      };

      try {
        const result = new Function(code)();
        if (result !== undefined) {
          addLog(`Result: ${String(result)}`, 'info');
        }
      } finally {
        console.log = originalLog;
        console.warn = originalWarn;
        console.error = originalError;
      }

      const duration = Math.round(performance.now() - startTime);
      addLog(`[JS Engine] Completed in ${duration}ms`, 'system');
      return { success: true, durationMs: duration };
    } catch (jsErr: any) {
      addLog(jsErr.stack || jsErr.message || String(jsErr), 'stderr');
      const duration = Math.round(performance.now() - startTime);
      return { success: false, durationMs: duration };
    }
  }

  // 3. Piston API for C++, C, Java, Rust, Python fallback
  const mapped = PISTON_LANGUAGE_MAP[language];
  if (!mapped) {
    addLog(`Direct compilation for ${language} is not supported offline. Preview is available.`, 'info');
    return { success: false, durationMs: 0 };
  }

  try {
    addLog(`[Runner] Dispatching ${filename} to compiler engine...`, 'system');

    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: mapped.language,
        version: mapped.version,
        files: [
          {
            name: filename,
            content: code,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Execution service responded with HTTP ${response.status}`);
    }

    const data = await response.json();
    const run = data.run || {};

    if (data.compile?.stderr) {
      addLog(`[Compilation Error]:\n${data.compile.stderr}`, 'stderr');
    }

    if (run.stdout) {
      addLog(run.stdout, 'stdout');
    }

    if (run.stderr) {
      addLog(run.stderr, 'stderr');
    }

    const duration = Math.round(performance.now() - startTime);
    const exitCode = run.code !== undefined ? run.code : 0;
    addLog(`Process exited with code ${exitCode} (Execution time: ${duration}ms)`, 'system');

    return { success: exitCode === 0, durationMs: duration };
  } catch (apiErr: any) {
    addLog(`[Execution Error]: ${apiErr.message || String(apiErr)}`, 'stderr');
    addLog('Tip: Check internet connectivity for C++/Java cloud compiler.', 'info');
    return { success: false, durationMs: Math.round(performance.now() - startTime) };
  }
}

export function buildWebPreview(htmlCode: string, cssCode: string, jsCode: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    ${cssCode}
  </style>
  <script>
    // Intercept console messages and relay to parent IDE window
    (function() {
      const origLog = console.log;
      const origWarn = console.warn;
      const origError = console.error;

      function send(type, args) {
        try {
          const text = Array.from(args).map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
          window.parent.postMessage({ type: 'CONSOLE_LOG', level: type, text }, '*');
        } catch(e) {}
      }

      console.log = function(...args) { send('stdout', args); origLog.apply(console, args); };
      console.warn = function(...args) { send('info', args); origWarn.apply(console, args); };
      console.error = function(...args) { send('stderr', args); origError.apply(console, args); };
      
      window.addEventListener('error', function(e) {
        send('stderr', [e.message + ' at line ' + e.lineno]);
      });
    })();
  <\/script>
</head>
<body>
  ${htmlCode}
  <script>
    ${jsCode}
  <\/script>
</body>
</html>`;
}
