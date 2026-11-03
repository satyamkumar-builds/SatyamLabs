/**
 * SatyamLabs Offline Native Execution Engine
 * Runs C, C++, Java, and Python 100% offline inside the browser or Android WebView
 * without requiring any cloud API or internet connection.
 * Includes interactive STDIN, scanf, cin, and Scanner support.
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

  // 2. Remove preprocessor directives
  js = js.replace(/#include\s+<[^>]+>/g, '');
  js = js.replace(/#include\s+"[^"]+"/g, '');
  js = js.replace(/#define\s+([A-Za-z0-9_]+)\s+([^\n]+)/g, 'const $1 = $2;');
  js = js.replace(/using\s+namespace\s+std\s*;/g, '');

  // 3. Transform function declarations FIRST before variable replacements
  // e.g. int calculateSum(int arr[], int size) { -> function calculateSum(arr, size) {
  js = js.replace(/\b(?:int|void|double|float|char|bool|long|short)\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*\{/g, (_, fnName, params) => {
    const cleanParams = params.split(',').map((p: string) => {
      return p.trim().replace(/\b(?:int|void|double|float|char|bool|long|short|unsigned|const)\b/g, '').replace(/\[\s*\]/g, '').trim();
    }).filter(Boolean).join(', ');
    return `function ${fnName}(${cleanParams}) {`;
  });

  // 4. Handle C++ cin >> a >> b;
  js = js.replace(/cin\s*>>\s*([^;]+);/g, (_, stream) => {
    const vars = stream.split(/>>\s*/).map((v: string) => v.trim()).filter(Boolean);
    return vars.map((v: string) => `${v} = Number(__readStdin());`).join(' ');
  });

  // 5. Handle scanf("%d", &var) or scanf("%d %d", &a, &b)
  js = js.replace(/scanf\s*\(\s*"([^"]*)"\s*,\s*([^)]+)\)\s*;/g, (_, _fmt, vars) => {
    const varList = vars.split(',').map((v: string) => v.replace(/^&/, '').trim()).filter(Boolean);
    return varList.map((v: string) => `${v} = Number(__readStdin());`).join(' ');
  });

  // 6. Handle C++ cout << a << b << endl;
  js = js.replace(/cout\s*<<\s*([^;]+);/g, (_, stream) => {
    const parts = stream.split(/<<\s*/).map((p: string) => p.trim()).filter(Boolean);
    const converted = parts.map((part: string) => {
      if (part === 'endl' || part === "'\\n'" || part === '"\\n"') return '"\\n"';
      return part;
    });
    return `__cout(${converted.join(', ')});`;
  });

  // 7. Handle printf(...) and puts(...)
  js = js.replace(/printf\s*\(\s*([^;]+)\);/g, '__printf($1);');
  js = js.replace(/puts\s*\(\s*([^;]+)\);/g, '__puts($1);');

  // 8. Handle type casts: (double)x -> Number(x), (int)x -> Math.floor(x)
  js = js.replace(/\(\s*double\s*\)\s*([A-Za-z0-9_]+)/g, 'Number($1)');
  js = js.replace(/\(\s*float\s*\)\s*([A-Za-z0-9_]+)/g, 'Number($1)');
  js = js.replace(/\(\s*int\s*\)\s*([A-Za-z0-9_]+)/g, 'Math.floor($1)');

  // 9. Handle array definitions: int arr[] = { 1, 2, 3 }; -> let arr = [1, 2, 3];
  js = js.replace(/\b(?:int|float|double|char|bool|long|short)\s+([A-Za-z_][A-Za-z0-9_]*)\s*\[[^\]]*\]\s*=\s*\{([^}]*)\}\s*;/g, 'let $1 = [$2];');

  // 10. Replace remaining primitive variable types with let
  const types = ['int', 'float', 'double', 'char', 'bool', 'long', 'short', 'string', 'void', 'unsigned int', 'long long'];
  for (const t of types) {
    const escaped = t.replace(/\s+/g, '\\s+');
    const re = new RegExp(`\\b${escaped}\\s+([A-Za-z_][A-Za-z0-9_]*)\\s*(\\[[^\\]]*\\])?\\s*(=|;|,|\\))`, 'g');
    js = js.replace(re, 'let $1 $2 $3');
  }

  // 11. Math library standard bindings
  const mathFuncs = ['sqrt', 'pow', 'abs', 'fabs', 'sin', 'cos', 'tan', 'floor', 'ceil', 'round', 'min', 'max'];
  for (const fn of mathFuncs) {
    js = js.replace(new RegExp(`\\b${fn}\\s*\\(`, 'g'), `Math.${fn}(`);
  }

  // 12. Add main() invocation
  js += '\nif (typeof main === "function") { main(); }';

  return js;
}

/**
 * Execute C/C++ Code completely offline with STDIN support
 */
export function runOfflineCCpp(
  code: string,
  onLog: (text: string, type: 'stdout' | 'stderr' | 'system' | 'info') => void,
  stdin: string = ''
): { success: boolean; output: string } {
  let outputAccumulator = '';
  let printBuffer = '';

  const stdinTokens = stdin.trim().split(/\s+/).filter(Boolean);
  let stdinIdx = 0;
  const __readStdin = () => {
    if (stdinIdx < stdinTokens.length) {
      return stdinTokens[stdinIdx++];
    }
    return '0';
  };

  const flushBuffer = () => {
    if (printBuffer.length > 0) {
      onLog(printBuffer, 'stdout');
      outputAccumulator += printBuffer + '\n';
      printBuffer = '';
    }
  };

  const __printf = (format: string, ...args: any[]) => {
    const text = cPrintf(format, ...args);
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
  };

  try {
    const transpiledJs = transpileC(code);

    const runner = new Function(
      '__printf',
      '__puts',
      '__cout',
      '__readStdin',
      'cPrintf',
      `
      "use strict";
      ${transpiledJs}
      `
    );

    runner(__printf, __puts, __cout, __readStdin, cPrintf);
    flushBuffer();

    return { success: true, output: outputAccumulator };
  } catch (err: any) {
    flushBuffer();
    onLog(`[Offline C/C++ Runtime Error]: ${err.message || String(err)}`, 'stderr');
    return { success: false, output: outputAccumulator };
  }
}

/**
 * Transpile & Execute Java offline with Scanner/STDIN support
 */
export function runOfflineJava(
  code: string,
  onLog: (text: string, type: 'stdout' | 'stderr' | 'system' | 'info') => void,
  stdin: string = ''
): { success: boolean; output: string } {
  let outputAccumulator = '';

  const stdinTokens = stdin.trim().split(/\s+/).filter(Boolean);
  let stdinIdx = 0;
  const __readStdin = () => stdinTokens[stdinIdx++] || '0';

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
    in: {},
  };

  class Scanner {
    constructor(_input?: any) {}
    nextInt() { return parseInt(__readStdin(), 10); }
    nextDouble() { return parseFloat(__readStdin()); }
    next() { return __readStdin(); }
    nextLine() { return __readStdin(); }
    hasNext() { return stdinIdx < stdinTokens.length; }
  }

  const Arrays = {
    asList: (...args: any[]) => (args.length === 1 && Array.isArray(args[0]) ? args[0] : args),
    toString: (arr: any) => JSON.stringify(arr),
  };

  try {
    let js = code;
    js = js.replace(/\/\*[\s\S]*?\*\//g, '');
    js = js.replace(/\/\/.*/g, '');
    js = js.replace(/import\s+[^;]+;/g, '');

    // Array initialization: String[] arr = {"a", "b"}; -> let arr = ["a", "b"];
    js = js.replace(/=\s*\{([^}]*)\}\s*;/g, '= [$1];');
    js = js.replace(/\b[A-Za-z0-9_]+\s*\[\s*\]\s+([A-Za-z_][A-Za-z0-9_]*)/g, 'let $1');

    const types = ['int', 'float', 'double', 'char', 'boolean', 'long', 'short', 'String', 'Scanner'];
    for (const t of types) {
      js = js.replace(new RegExp(`\\b${t}\\s+([A-Za-z_][A-Za-z0-9_]*)\\s*(=|;|,|\\))`, 'g'), 'let $1 $2');
    }

    const mainMatch = js.match(/public\s+static\s+void\s+main\s*\([^)]*\)\s*\{([\s\S]*)\}/);
    const body = mainMatch ? mainMatch[1] : js;

    const runner = new Function('System', 'Scanner', 'Arrays', 'Math', `
      "use strict";
      ${body}
    `);

    runner(System, Scanner, Arrays, Math);
    return { success: true, output: outputAccumulator };
  } catch (err: any) {
    onLog(`[Offline Java Runtime Error]: ${err.message || String(err)}`, 'stderr');
    return { success: false, output: outputAccumulator };
  }
}

/**
 * Lightweight Offline Python 3 Runner with input() support
 */
export function runOfflinePython(
  code: string,
  onLog: (text: string, type: 'stdout' | 'stderr' | 'system' | 'info') => void,
  stdin: string = ''
): { success: boolean; output: string } {
  let outputAccumulator = '';

  const stdinLines = stdin ? stdin.split('\n') : [];
  let stdinLineIdx = 0;

  const print = (...args: any[]) => {
    const text = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    onLog(text, 'stdout');
    outputAccumulator += text + '\n';
  };

  const input = (promptText?: string) => {
    if (promptText) {
      onLog(String(promptText), 'stdout');
      outputAccumulator += String(promptText);
    }
    return stdinLines[stdinLineIdx++] || '';
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
  const sum = (arr: number[]): number => (Array.isArray(arr) ? arr.reduce((a, b) => a + b, 0) : 0);
  const py_int = (x: any) => parseInt(x, 10);
  const py_float = (x: any) => parseFloat(x);
  const py_str = (x: any) => String(x);
  const py_bool = (x: any) => Boolean(x);

  const math = {
    ...Math,
    pi: Math.PI,
    e: Math.E,
    sqrt: Math.sqrt,
    pow: Math.pow,
    floor: Math.floor,
    ceil: Math.ceil,
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    log: Math.log,
  };

  try {
    const rawLines = code.split('\n');
    const jsLines: string[] = [];
    const indentStack: number[] = [];

    for (let rawLine of rawLines) {
      // Check indent
      const trimmed = rawLine.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const indent = rawLine.search(/\S/);

      // Close blocks if indent decreased
      while (indentStack.length > 0 && indent <= indentStack[indentStack.length - 1]) {
        indentStack.pop();
        jsLines.push('}');
      }

      let line = trimmed;

      // Ignore imports
      if (line.startsWith('import ') || line.startsWith('from ')) {
        continue;
      }

      // f-strings
      line = line.replace(/f"([^"]*)"/g, (_, str) => {
        const interpolated = str.replace(/\{([^}]+)\}/g, '${$1}');
        return '`' + interpolated + '`';
      });
      line = line.replace(/f'([^']*)'/g, (_, str) => {
        const interpolated = str.replace(/\{([^}]+)\}/g, '${$1}');
        return '`' + interpolated + '`';
      });

      // Booleans & Null
      line = line.replace(/\bTrue\b/g, 'true');
      line = line.replace(/\bFalse\b/g, 'false');
      line = line.replace(/\bNone\b/g, 'null');
      line = line.replace(/\band\b/g, '&&');
      line = line.replace(/\bor\b/g, '||');
      line = line.replace(/\bnot\b/g, '!');

      // Function definitions: def foo(x, y): -> function foo(x, y) {
      if (line.startsWith('def ') && line.endsWith(':')) {
        const signature = line.substring(4, line.length - 1);
        jsLines.push(`function ${signature} {`);
        indentStack.push(indent);
        continue;
      }

      // If condition: if cond: -> if (cond) {
      if (line.startsWith('if ') && line.endsWith(':')) {
        const cond = line.substring(3, line.length - 1);
        jsLines.push(`if (${cond}) {`);
        indentStack.push(indent);
        continue;
      }

      // Elif condition: elif cond: -> } else if (cond) {
      if (line.startsWith('elif ') && line.endsWith(':')) {
        const cond = line.substring(5, line.length - 1);
        jsLines.push(`} else if (${cond}) {`);
        continue;
      }

      // Else: else: -> } else {
      if (line === 'else:') {
        jsLines.push(`} else {`);
        continue;
      }

      // While loop: while cond: -> while (cond) {
      if (line.startsWith('while ') && line.endsWith(':')) {
        const cond = line.substring(6, line.length - 1);
        jsLines.push(`while (${cond}) {`);
        indentStack.push(indent);
        continue;
      }

      // For loop with range: for x in range(...): -> for (let x of range(...)) {
      const forMatch = line.match(/^for\s+([a-zA-Z0-9_,\s]+)\s+in\s+(.+):$/);
      if (forMatch) {
        const [, varName, iterable] = forMatch;
        jsLines.push(`for (let ${varName} of ${iterable}) {`);
        indentStack.push(indent);
        continue;
      }

      // Print statements without parentheses: print "hello"
      line = line.replace(/^print\s+([^()]+)$/, 'print($1)');

      jsLines.push(line + ';');
    }

    // Close any remaining open indents
    while (indentStack.length > 0) {
      indentStack.pop();
      jsLines.push('}');
    }

    const transpiled = jsLines.join('\n');

    const runner = new Function(
      'print',
      'input',
      'range',
      'len',
      'sum',
      'int',
      'float',
      'str',
      'bool',
      'math',
      'Math',
      `"use strict";
${transpiled}`
    );

    runner(print, input, range, len, sum, py_int, py_float, py_str, py_bool, math, Math);
    return { success: true, output: outputAccumulator };
  } catch (err: any) {
    onLog(`[Offline Python Error]: ${err.message || String(err)}`, 'stderr');
    return { success: false, output: outputAccumulator };
  }
}
