import type { ExecutionLog, SupportedLanguage } from '../types';
import { runOfflineCCpp, runOfflineJava, runOfflinePython } from './offlineRunner';

declare global {
  interface Window {
    loadPyodide?: any;
    pyodideInstance?: any;
  }
}

// Wandbox API Compilers (100% Free, No Whitelist, No 401 error)
const WANDBOX_COMPILER_MAP: Record<string, string> = {
  cpp: 'gcc-head',
  c: 'gcc-head',
  java: 'openjdk-jdk-21+35',
  rust: 'rust-1.82.0',
  python: 'cpython-3.12.7',
  sql: 'sqlite-3.46.1',
};

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export async function runCode(
  language: SupportedLanguage,
  code: string,
  filename: string,
  onLog: (log: ExecutionLog) => void,
  stdin: string = ''
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
  if (stdin.trim()) {
    addLog(`[SatyamLabs] Standard Input (stdin): "${stdin.trim()}"`, 'info');
  }

  // ==========================================
  // 1. JavaScript / TypeScript (100% Offline)
  // ==========================================
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

  // ==========================================
  // 2. Python (Wandbox CPython 3.12 + Pyodide + Offline Engine)
  // ==========================================
  if (language === 'python') {
    // 1. Try Wandbox CPython 3.12
    try {
      addLog(`[Python 3.12 Engine] Dispatching ${filename} to compiler engine...`, 'system');
      const response = await fetchWithTimeout('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compiler: 'cpython-3.12.7',
          code,
          stdin: stdin || '',
        }),
      }, 7000);

      if (response.ok) {
        const data = await response.json();
        if (data.program_output) addLog(data.program_output, 'stdout');
        if (data.program_error) addLog(data.program_error, 'stderr');
        const duration = Math.round(performance.now() - startTime);
        addLog(`[Python 3.12 Engine] Finished with exit status ${data.status ?? 0} in ${duration}ms`, 'system');
        return { success: data.status === 0 || data.status === '0', durationMs: duration };
      }
    } catch (e: any) {
      addLog(`[SatyamLabs Notice] Cloud compiler unreachable / offline. Executing with In-Device Python Engine...`, 'info');
    }

    // 2. Try Pyodide WASM if available
    if (typeof window.loadPyodide === 'function') {
      try {
        if (!window.pyodideInstance) {
          addLog('[Pyodide] Initializing WebAssembly Python 3 runtime...', 'system');
          window.pyodideInstance = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
          });
        }

        const pyodide = window.pyodideInstance;
        pyodide.setStdout({ batched: (text: string) => addLog(text, 'stdout') });
        pyodide.setStderr({ batched: (text: string) => addLog(text, 'stderr') });

        await pyodide.runPythonAsync(code);
        const duration = Math.round(performance.now() - startTime);
        addLog(`[Pyodide] Completed in ${duration}ms`, 'system');
        return { success: true, durationMs: duration };
      } catch (wasmErr: any) {
        // Fallback to offline engine
      }
    }

    // 3. Fallback to Offline Native Python execution
    const result = runOfflinePython(code, (text, type) => addLog(text, type), stdin);
    const duration = Math.round(performance.now() - startTime);
    addLog(`[Offline Python] Finished in ${duration}ms`, 'system');
    return { success: result.success, durationMs: duration };
  }

  // ==========================================
  // 3. C & C++ (Wandbox GCC + Offline Engine)
  // ==========================================
  if (language === 'c' || language === 'cpp') {
    // 1. Try Wandbox GCC
    try {
      addLog(`[GCC Cloud Compiler] Compiling ${filename} with GCC...`, 'system');
      const response = await fetchWithTimeout('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compiler: 'gcc-head',
          code,
          stdin: stdin || '',
        }),
      }, 7000);

      if (response.ok) {
        const data = await response.json();
        if (data.compiler_error || data.compiler_message) {
          const msg = data.compiler_error || data.compiler_message;
          if (data.status !== 0 && data.status !== '0') {
            addLog(`[Compilation Output]:\n${msg}`, 'stderr');
          }
        }
        if (data.program_output) {
          addLog(data.program_output, 'stdout');
        }
        if (data.program_error) {
          addLog(data.program_error, 'stderr');
        }

        const duration = Math.round(performance.now() - startTime);
        addLog(`[GCC Engine] Finished with exit status ${data.status ?? 0} in ${duration}ms`, 'system');
        return { success: data.status === 0 || data.status === '0', durationMs: duration };
      }
    } catch (netErr: any) {
      addLog('[SatyamLabs Notice] Cloud compiler unreachable / offline. Executing with In-Device Engine...', 'info');
    }

    // 2. Offline Native C/C++ Execution with STDIN
    const result = runOfflineCCpp(code, (text, type) => addLog(text, type), stdin);
    const duration = Math.round(performance.now() - startTime);
    addLog(`[Offline Engine] Completed in ${duration}ms`, 'system');
    return { success: result.success, durationMs: duration };
  }

  // ==========================================
  // 4. Java (Wandbox OpenJDK + Offline Engine)
  // ==========================================
  if (language === 'java') {
    // 1. Try Wandbox OpenJDK
    try {
      addLog(`[OpenJDK Compiler] Compiling ${filename} with OpenJDK...`, 'system');
      // Wandbox compiles inside prog.java. In Java, public classes must match the file name.
      // Converting 'public class' -> 'class' allows any class name (Main, Solution, etc.) to compile seamlessly.
      const preparedJavaCode = code.replace(/\bpublic\s+class\b/g, 'class');
      const response = await fetchWithTimeout('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compiler: 'openjdk-jdk-21+35',
          code: preparedJavaCode,
          stdin: stdin || '',
        }),
      }, 7000);

      if (response.ok) {
        const data = await response.json();
        if (data.compiler_error || data.compiler_message) {
          const msg = data.compiler_error || data.compiler_message;
          if (data.status !== 0 && data.status !== '0') {
            addLog(`[Compilation Output]:\n${msg}`, 'stderr');
          }
        }
        if (data.program_output) {
          addLog(data.program_output, 'stdout');
        }
        if (data.program_error) {
          addLog(data.program_error, 'stderr');
        }

        const duration = Math.round(performance.now() - startTime);
        addLog(`[OpenJDK Engine] Finished with exit status ${data.status ?? 0} in ${duration}ms`, 'system');
        return { success: data.status === 0 || data.status === '0', durationMs: duration };
      }
    } catch (netErr: any) {
      addLog('[SatyamLabs Notice] Cloud compiler unreachable / offline. Executing with In-Device Java Engine...', 'info');
    }

    // 2. Offline Native Java execution with STDIN
    const result = runOfflineJava(code, (text, type) => addLog(text, type), stdin);
    const duration = Math.round(performance.now() - startTime);
    addLog(`[Offline Engine] Completed in ${duration}ms`, 'system');
    return { success: result.success, durationMs: duration };
  }

  // ==========================================
  // 5. Rust / SQL / Others
  // ==========================================
  const compiler = WANDBOX_COMPILER_MAP[language];
  if (compiler) {
    try {
      addLog(`[Runner] Dispatching ${filename} to ${compiler}...`, 'system');
      const response = await fetch('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ compiler, code, stdin: stdin || '' }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.program_output) addLog(data.program_output, 'stdout');
        if (data.program_error) addLog(data.program_error, 'stderr');
        const duration = Math.round(performance.now() - startTime);
        addLog(`Process completed in ${duration}ms`, 'system');
        return { success: data.status === 0 || data.status === '0', durationMs: duration };
      }
    } catch (err: any) {
      addLog(`[Execution Notice]: ${err.message || String(err)}`, 'stderr');
    }
  }

  addLog(`Execution completed for ${filename}.`, 'system');
  return { success: true, durationMs: Math.round(performance.now() - startTime) };
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
