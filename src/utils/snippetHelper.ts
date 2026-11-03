import { snippetCompletion, completeFromList, autocompletion } from '@codemirror/autocomplete';
import type { Extension } from '@codemirror/state';
import type { SupportedLanguage } from '../types';

// HTML Snippets & Emmet
const HTML_SNIPPETS = [
  snippetCompletion(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>#{1:SatyamLabs App}</title>
</head>
<body>
  #{2:<h1>Hello from SatyamLabs!</h1>}
</body>
</html>`,
    {
      label: '!',
      detail: 'HTML5 Boilerplate (Emmet)',
      type: 'snippet',
      boost: 99,
    }
  ),
  snippetCompletion(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>#{1:Document}</title>
  <link rel="stylesheet" href="#{2:style.css}">
</head>
<body>
  <div id="app">
    #{3}
  </div>
  <script src="#{4:main.js}"></script>
</body>
</html>`,
    {
      label: 'html:5',
      detail: 'HTML5 Full Boilerplate with CSS/JS links',
      type: 'snippet',
      boost: 98,
    }
  ),
  snippetCompletion('<link rel="stylesheet" href="#{1:style.css}">', {
    label: 'link:css',
    detail: 'Link external CSS stylesheet',
    type: 'snippet',
  }),
  snippetCompletion('<script src="#{1:script.js}"></script>', {
    label: 'script:src',
    detail: 'Include external JavaScript file',
    type: 'snippet',
  }),
  snippetCompletion('<div class="#{1:container}">\n  #{2}\n</div>', {
    label: 'div',
    detail: 'Division container with class',
    type: 'snippet',
  }),
  snippetCompletion('<button type="#{1:button}" class="#{2}">#{3:Click me}</button>', {
    label: 'button',
    detail: 'Interactive button element',
    type: 'snippet',
  }),
  snippetCompletion('<form action="#{1}" method="#{2:POST}">\n  #{3}\n</form>', {
    label: 'form',
    detail: 'Form wrapper',
    type: 'snippet',
  }),
  snippetCompletion('<input type="#{1:text}" placeholder="#{2:Enter value...}" />', {
    label: 'input',
    detail: 'Text input field',
    type: 'snippet',
  }),
];

// C & C++ Snippets
const CPP_SNIPPETS = [
  snippetCompletion(
    `#include <iostream>
using namespace std;

int main() {
    #{1:cout << "Hello from SatyamLabs!" << endl;}
    return 0;
}`,
    {
      label: 'main',
      detail: 'C++ Modern main() Boilerplate',
      type: 'snippet',
      boost: 99,
    }
  ),
  snippetCompletion(
    `#include <iostream>
using namespace std;

int main() {
    #{1}
    return 0;
}`,
    {
      label: '!',
      detail: 'C++ Quick Boilerplate',
      type: 'snippet',
      boost: 98,
    }
  ),
  snippetCompletion(
    `#include <stdio.h>

int main() {
    #{1:printf("Hello from C!\\n");}
    return 0;
}`,
    {
      label: 'mainc',
      detail: 'C Standard main() Boilerplate',
      type: 'snippet',
      boost: 97,
    }
  ),
  snippetCompletion('cout << #{1} << endl;', {
    label: 'cout',
    detail: 'Standard console output with newline',
    type: 'snippet',
    boost: 90,
  }),
  snippetCompletion('cin >> #{1};', {
    label: 'cin',
    detail: 'Standard console input',
    type: 'snippet',
    boost: 89,
  }),
  snippetCompletion('printf("#{1:%d}\\n", #{2});', {
    label: 'printf',
    detail: 'Formatted print statement',
    type: 'snippet',
  }),
  snippetCompletion('scanf("#{1:%d}", &#{2});', {
    label: 'scanf',
    detail: 'Formatted scan input statement',
    type: 'snippet',
  }),
  snippetCompletion('for (int #{1:i} = 0; #{1:i} < #{2:n}; #{1:i}++) {\n    #{3}\n}', {
    label: 'for',
    detail: 'Standard indexed for-loop',
    type: 'snippet',
    boost: 85,
  }),
  snippetCompletion('while (#{1:condition}) {\n    #{2}\n}', {
    label: 'while',
    detail: 'While loop',
    type: 'snippet',
  }),
  snippetCompletion('#include <vector>\nvector<#{1:int}> #{2:v};', {
    label: 'vector',
    detail: 'STL dynamic array vector',
    type: 'snippet',
  }),
];

// Java Snippets
const JAVA_SNIPPETS = [
  snippetCompletion(
    `import java.util.*;

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        #{1:System.out.println("Hello from SatyamLabs Java!");}
    }
}`,
    {
      label: '!',
      detail: 'Java Complete Class & Main Boilerplate',
      type: 'snippet',
      boost: 99,
    }
  ),
  snippetCompletion(
    `public static void main(String[] args) {
    #{1:System.out.println("Hello, World!");}
}`,
    {
      label: 'main',
      detail: 'Java public static void main()',
      type: 'snippet',
      boost: 98,
    }
  ),
  snippetCompletion(
    `public static void main(String[] args) {
    #{1}
}`,
    {
      label: 'psvm',
      detail: 'public static void main shortcut',
      type: 'snippet',
      boost: 97,
    }
  ),
  snippetCompletion('System.out.println(#{1});', {
    label: 'sout',
    detail: 'System.out.println() shortcut',
    type: 'snippet',
    boost: 95,
  }),
  snippetCompletion('System.out.println(#{1});', {
    label: 'print',
    detail: 'System.out.println() statement',
    type: 'snippet',
  }),
  snippetCompletion('Scanner sc = new Scanner(System.in);\n#{1:int n = sc.nextInt();}', {
    label: 'scanner',
    detail: 'Scanner input initialization',
    type: 'snippet',
    boost: 90,
  }),
  snippetCompletion('for (int #{1:i} = 0; #{1:i} < #{2:n}; #{1:i}++) {\n    #{3}\n}', {
    label: 'for',
    detail: 'Java indexed for loop',
    type: 'snippet',
  }),
  snippetCompletion('try {\n    #{1}\n} catch (Exception e) {\n    e.printStackTrace();\n}', {
    label: 'try',
    detail: 'Try-catch exception block',
    type: 'snippet',
  }),
];

// Python Snippets
const PYTHON_SNIPPETS = [
  snippetCompletion(
    `def main():
    #{1:print("Hello from SatyamLabs Python!")}

if __name__ == '__main__':
    main()`,
    {
      label: '!',
      detail: 'Python main entrypoint boilerplate',
      type: 'snippet',
      boost: 99,
    }
  ),
  snippetCompletion(
    `if __name__ == '__main__':
    #{1:main()}`,
    {
      label: 'ifmain',
      detail: "if __name__ == '__main__': block",
      type: 'snippet',
      boost: 98,
    }
  ),
  snippetCompletion('def #{1:function_name}(#{2}):\n    """#{3:docstring}"""\n    #{4:pass}', {
    label: 'def',
    detail: 'Function definition',
    type: 'snippet',
    boost: 90,
  }),
  snippetCompletion('class #{1:ClassName}:\n    def __init__(self#{2}):\n        #{3:pass}', {
    label: 'class',
    detail: 'Class definition with __init__',
    type: 'snippet',
    boost: 88,
  }),
  snippetCompletion('for #{1:i} in range(#{2:n}):\n    #{3:pass}', {
    label: 'for',
    detail: 'Range for-loop',
    type: 'snippet',
    boost: 85,
  }),
  snippetCompletion('print(#{1})', {
    label: 'print',
    detail: 'Print statement',
    type: 'snippet',
  }),
  snippetCompletion('#{1:val} = input("#{2:Enter input: "})', {
    label: 'input',
    detail: 'User console input',
    type: 'snippet',
  }),
  snippetCompletion('try:\n    #{1:pass}\nexcept Exception as e:\n    print(f"Error: {e}")', {
    label: 'try',
    detail: 'Try-except block',
    type: 'snippet',
  }),
];

// JavaScript & TypeScript Snippets
const JS_SNIPPETS = [
  snippetCompletion('console.log(#{1});', {
    label: 'clg',
    detail: 'console.log() shortcut',
    type: 'snippet',
    boost: 99,
  }),
  snippetCompletion('console.log(#{1});', {
    label: 'log',
    detail: 'console.log() statement',
    type: 'snippet',
    boost: 98,
  }),
  snippetCompletion('function #{1:name}(#{2}) {\n  #{3}\n}', {
    label: 'fn',
    detail: 'Standard function declaration',
    type: 'snippet',
    boost: 90,
  }),
  snippetCompletion('const #{1:name} = (#{2}) => {\n  #{3}\n};', {
    label: 'af',
    detail: 'Arrow function expression',
    type: 'snippet',
    boost: 89,
  }),
  snippetCompletion('for (let #{1:i} = 0; #{1:i} < #{2:array}.length; #{1:i}++) {\n  #{3}\n}', {
    label: 'for',
    detail: 'Standard for loop',
    type: 'snippet',
  }),
  snippetCompletion('#{1:array}.forEach((#{2:item}) => {\n  #{3}\n});', {
    label: 'foreach',
    detail: 'Array.prototype.forEach',
    type: 'snippet',
  }),
  snippetCompletion('async function #{1:name}(#{2}) {\n  try {\n    #{3}\n  } catch (err) {\n    console.error(err);\n  }\n}', {
    label: 'async',
    detail: 'Async function with try-catch',
    type: 'snippet',
  }),
  snippetCompletion('fetch("#{1:https://api.example.com}")\n  .then(res => res.json())\n  .then(data => {\n    #{2:console.log(data);}\n  });', {
    label: 'fetch',
    detail: 'Fetch HTTP request promise',
    type: 'snippet',
  }),
];

// Rust Snippets
const RUST_SNIPPETS = [
  snippetCompletion(
    `fn main() {
    println!("Hello from SatyamLabs Rust!");
    #{1}
}`,
    {
      label: '!',
      detail: 'Rust main() Boilerplate',
      type: 'snippet',
      boost: 99,
    }
  ),
  snippetCompletion('println!("#{1}", #{2});', {
    label: 'print',
    detail: 'println! macro',
    type: 'snippet',
  }),
  snippetCompletion('fn #{1:name}(#{2}) -> #{3:()} {\n    #{4}\n}', {
    label: 'fn',
    detail: 'Function declaration',
    type: 'snippet',
  }),
];

/**
 * Get Intelligent Snippet Completions Extension for specific language
 */
export function getLanguageSnippets(language: SupportedLanguage): Extension {
  let snippets = JS_SNIPPETS;

  switch (language) {
    case 'html':
      snippets = HTML_SNIPPETS;
      break;
    case 'cpp':
    case 'c':
      snippets = CPP_SNIPPETS;
      break;
    case 'java':
      snippets = JAVA_SNIPPETS;
      break;
    case 'python':
      snippets = PYTHON_SNIPPETS;
      break;
    case 'javascript':
    case 'typescript':
      snippets = JS_SNIPPETS;
      break;
    case 'rust':
      snippets = RUST_SNIPPETS;
      break;
  }

  return autocompletion({
    override: [completeFromList(snippets)],
    activateOnTyping: true,
    maxRenderedOptions: 10,
  });
}

/**
 * Returns default starter boilerplate code for a given filename
 */
export function getBoilerplateForFile(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html':
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SatyamLabs App</title>
</head>
<body>
  <h1>Hello from SatyamLabs!</h1>
</body>
</html>`;
    case 'cpp':
      return `#include <iostream>
using namespace std;

int main() {
    cout << "Hello from SatyamLabs C++!" << endl;
    return 0;
}`;
    case 'c':
      return `#include <stdio.h>

int main() {
    printf("Hello from SatyamLabs C!\\n");
    return 0;
}`;
    case 'java':
      return `import java.util.*;

class Main {
    public static void main(String[] args) {
        System.out.println("Hello from SatyamLabs Java!");
    }
}`;
    case 'py':
      return `def main():
    print("Hello from SatyamLabs Python!")

if __name__ == '__main__':
    main()`;
    case 'js':
    case 'ts':
      return `// SatyamLabs Script
console.log("Hello from SatyamLabs JS!");`;
    case 'rs':
      return `fn main() {
    println!("Hello from SatyamLabs Rust!");
}`;
    case 'css':
      return `/* SatyamLabs Stylesheet */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}`;
    default:
      return '';
  }
}
