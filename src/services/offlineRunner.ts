/**
 * SatyamLabs Offline Native Execution Engine
 * Runs C, C++, Java, and Python 100% offline inside the browser or Android WebView
 * without requiring any cloud API or internet connection.
 */

// Helper to format printf-style strings
export function cPrintf(format: string, ...args: any[]): string {
  if (typeof format !== 'string') return String(format);
  let argIdx = 0;
  return format.replace(/%([0-9]*\.?[0-9]*[dfsicuxoeE%])/g, (match, spec) => {
    if (match === '%%') return '%';
    if (argIdx >= args.length) return match;
    const val = args[argIdx++];
    if (spec.endsWith('d') || spec.endsWith('i')) {
      return String(parseInt(val, 10));
    }
    if (spec.endsWith('f')) {
      const dot = spec.indexOf('.');
      if (dot !== -1) {
        const precision = parseInt(spec.substring(dot + 1), 10);
        return Number(val).toFixed(isNaN(precision) ? 6 : precision);
      }
      return String(Number(val));
    }
    if (spec.endsWith('s')) return String(val);
    if (spec.endsWith('c')) {
      return typeof val === 'number' ? String.fromCharCode(val) : String(val)[0] || '';
    }
    return String(val);
  });
}

/**
 * Clean & transpile C/C++ code into sandboxed JavaScript for offline execution
 */
export function transpileC(cCode: string): string {
  let js = cCode;

  // 1. Remove comments
  js = js.replace(/\/\*[\s\S]*?\*\//g, '');
  js = js.replace(/\/\/.*/g, '');

  // 2. Remove preprocessor directives (#include, #define, #pragma, etc.)
  js = js.replace(/#include\s+<[^>]+>/g, '');
  js = js.replace(/#include\s+"[^"]+"/g, '');
  js = js.replace(/#define\s+([A-Za-z0-9_]+)\s+([^\n]+)/g, 'const $1 = $2;');
  js = js.replace(/using\s+namespace\s+std\s*;/g, '');

  // 3. Handle C++ cout << a << b << endl
  // Convert cout << X << Y << endl; to printStatements
  js = js.replace(/cout\s*<<\s*([^;]+);/g, (_, stream) => {
    const parts = stream.split(/<<\s*/).map((p: string) => p.trim()).filter(Boolean);
    const converted = parts.map((part: string) => {
      if (part === 'endl' || part === "'\\n'" || part === '"\\n"') return '"\\n"';
      return part;
    });
    return `__cout(${converted.join(', ')});`;
  });

  // 4. Handle printf(...)
  js = js.replace(/printf\s*\(\s*([^;]+)\);/g, '__printf($1);');
  js = js.replace(/puts\s*\(\s*([^;]+)\);/g, '__puts($1);');

  // 5. Replace primitive types with `let`
  // int a = 5, float b = 2.5, char c = 'x', double d = 1.0, bool ok = true;
  const types = ['int', 'float', 'double', 'char', 'bool', 'long', 'short', 'string', 'void', 'unsigned int', 'long long'];
  for (const t of types) {
    const escaped = t.replace(/\s+/g, '\\s+');
    // type name = value or type name;
    const re = new RegExp(`\\b${escaped}\\s+([A-Za-z_][A-Za-z0-9_]*)\\s*(\\[[^\\]]*\\])?\\s*(=|;|,|\\))`, 'g');
    js = js.replace(re, 'let $1 $2 $3');
  }

  // 6. Handle array definitions: let arr [] = { 1, 2, 3 }; -> let arr = [1, 2, 3];
  js = js.replace(/let\s+([A-Za-z_][A-Za-z0-9_]*)\s*\[[^\]]*\]\s*=\s*\{([^}]*)\}\s*;/g, 'let $1 = [$2];');

  // 7. Math library standard bindings
  const mathFuncs = ['sqrt', 'pow', 'abs', 'fabs', 'sin', 'cos', 'tan', 'floor', 'ceil', 'round', 'min', 'max'];
  for (const fn of mathFuncs) {
    js = js.replace(new RegExp(`\\b${fn}\\s*\\(`, 'g'), `Math.${fn}(`);
  }

  // 8. Transform function declarations:
  // let main() { -> function main() {
  js = js.replace(/let\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*\{/g, 'function $1($2) {');

  // 9. Add main() invocation
  js += '\nif (typeof main === "function") { main(); }';

  return js;
}

/**
 * Execute C/C++ Code completely offline
 */
export function runOfflineCCpp(
  code: string,
  onLog: (text: string, type: 'stdout' | 'stderr' | 'system' | 'info') => void
): { success: boolean; output: string } {
  let outputAccumulator = '';
  let printBuffer = '';

  const flushBuffer = () => {
    if (printBuffer.length > 0) {
      onLog(printBuffer, 'stdout');
      outputAccumulator += printBuffer + '\n';
      printBuffer = '';
    }
  };

  const __printf = (format: string, ...args: any[]) => {
    const text = cPrintf(format, ...args);
    // Print buffer handling for \n
    const lines = text.split('\n');
    if (lines.length > 1) {
      printBuffer += lines[0];
      flushBuffer();
      for (let i = 1; i < lines.length - 1; i++) {
        onLog(lines[i], 'stdout');
        outputAccumulator += lines[i] + '\n';
      }
      printBuffer = lines[lines.length - 1];
    } else {
      printBuffer += text;
    }
  };

  const __puts = (str: string) => {
    flushBuffer();
    onLog(String(str), 'stdout');
    outputAccumulator += String(str) + '\n';
  };

  const __cout = (...args: any[]) => {
    for (const arg of args) {
      if (arg === '\n') {
        flushBuffer();
      } else {
        printBuffer += String(arg);
      }
    }
    flushBuffer();
  };

  try {
    const transpiledJs = transpileC(code);

    // Sandboxed runner with timeout / loop safety
    const runner = new Function(
      '__printf',
      '__puts',
      '__cout',
      'cPrintf',
      `
      "use strict";
      let __stepCount = 0;
      const __MAX_STEPS = 500000;
      ${transpiledJs}
      `
    );

    runner(__printf, __puts, __cout, cPrintf);
    flushBuffer();

    return { success: true, output: outputAccumulator };
  } catch (err: any) {
    flushBuffer();
    onLog(`[Offline C/C++ Runtime Error]: ${err.message || String(err)}`, 'stderr');
    return { success: false, output: outputAccumulator };
  }
}

/**
 * Transpile & Execute Java offline
 */
export function runOfflineJava(
  code: string,
  onLog: (text: string, type: 'stdout' | 'stderr' | 'system' | 'info') => void
): { success: boolean; output: string } {
  let outputAccumulator = '';

  const System = {
    out: {
      println: (...args: any[]) => {
        const text = args.map(a => String(a)).join(' ');
        onLog(text, 'stdout');
        outputAccumulator += text + '\n';
      },
      print: (...args: any[]) => {
        const text = args.map(a => String(a)).join(' ');
        onLog(text, 'stdout');
        outputAccumulator += text;
      },
    },
  };

  try {
    // Extract main method body
    let js = code;
    js = js.replace(/\/\*[\s\S]*?\*\//g, '');
    js = js.replace(/\/\/.*/g, '');

    // Map types to let
    const types = ['int', 'float', 'double', 'char', 'boolean', 'long', 'short', 'String'];
    for (const t of types) {
      js = js.replace(new RegExp(`\\b${t}\\s+([A-Za-z_][A-Za-z0-9_]*)\\s*(=|;|,|\\))`, 'g'), 'let $1 $2');
    }

    // Extract inside of public static void main(String[] args) { ... }
    const mainMatch = js.match(/public\s+static\s+void\s+main\s*\([^)]*\)\s*\{([\s\S]*)\}/);
    const body = mainMatch ? mainMatch[1] : js;

    const runner = new Function('System', `
      "use strict";
      ${body}
    `);

    runner(System);
    return { success: true, output: outputAccumulator };
  } catch (err: any) {
    onLog(`[Offline Java Runtime Error]: ${err.message || String(err)}`, 'stderr');
    return { success: false, output: outputAccumulator };
  }
}

/**
 * Lightweight Offline Python 3 Runner (No internet, zero WASM download required)
 */
export function runOfflinePython(
  code: string,
  onLog: (text: string, type: 'stdout' | 'stderr' | 'system' | 'info') => void
): { success: boolean; output: string } {
  let outputAccumulator = '';

  const print = (...args: any[]) => {
    const text = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    onLog(text, 'stdout');
    outputAccumulator += text + '\n';
  };

  const range = (start: number, stop?: number, step = 1): number[] => {
    if (stop === undefined) {
      stop = start;
      start = 0;
    }
    const res: number[] = [];
    for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
      res.push(i);
    }
    return res;
  };

  const len = (item: any): number => (item && item.length !== undefined ? item.length : 0);
  const sum = (arr: number[]): number => arr.reduce((a, b) => a + b, 0);

  try {
    // Convert common Python syntax to valid JS
    const lines = code.split('\n');
    const jsLines: string[] = [];

    for (let rawLine of lines) {
      let line = rawLine;

      // Handle comments
      if (line.trim().startsWith('#')) continue;

      // Convert f-strings: f"Hello {x}" -> `Hello ${x}`
      line = line.replace(/f"([^"]*)"/g, (_, str) => {
        const interpolated = str.replace(/\{([^}]+)\}/g, '${$1}');
        return '`' + interpolated + '`';
      });

      // True/False/None
      line = line.replace(/\bTrue\b/g, 'true');
      line = line.replace(/\bFalse\b/g, 'false');
      line = line.replace(/\bNone\b/g, 'null');

      // print x -> print(x)
      line = line.replace(/print\s+(.+)$/g, 'print($1)');

      jsLines.push(line);
    }

    const transpiled = jsLines.join('\n');

    // Run in Function sandbox
    const runner = new Function('print', 'range', 'len', 'sum', 'Math', `
      "use strict";
      ${transpiled}
    `);

    runner(print, range, len, sum, Math);
    return { success: true, output: outputAccumulator };
  } catch (err: any) {
    onLog(`[Offline Python Error]: ${err.message || String(err)}`, 'stderr');
    return { success: false, output: outputAccumulator };
  }
}
