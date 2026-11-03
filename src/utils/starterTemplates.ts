import type { FileItem } from '../types';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Web' | 'Python' | 'C++' | 'Java' | 'SQL' | 'Android';
  files: FileItem[];
}

export const STARTER_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'web-modern',
    name: 'Modern Web App (HTML/CSS/JS)',
    description: 'Interactive responsive web project with live preview and interactive widgets.',
    category: 'Web',
    files: [
      {
        id: 'f-html-1',
        name: 'index.html',
        path: '/index.html',
        isFolder: false,
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SatyamLabs Web App</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="card">
    <div class="badge">SatyamLabs IDE</div>
    <h1>Hello, Developer! 🚀</h1>
    <p>This is a real-time live preview running right on your phone or web browser.</p>
    
    <div class="counter-box">
      <button id="decBtn" class="btn secondary">-</button>
      <span id="counter">0</span>
      <button id="incBtn" class="btn primary">+</button>
    </div>

    <div class="interactive-area">
      <input type="text" id="userInput" placeholder="Type something cool..." />
      <button id="logBtn" class="btn action">Log to Terminal</button>
    </div>

    <div id="outputMessage" class="output"></div>
  </div>

  <script src="script.js"></script>
</body>
</html>`
      },
      {
        id: 'f-css-1',
        name: 'style.css',
        path: '/style.css',
        isFolder: false,
        language: 'css',
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top left, #1a1e29, #0d1117);
  color: #f0f6fc;
  padding: 16px;
}

.card {
  background: rgba(22, 27, 34, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(48, 54, 61, 0.9);
  padding: 28px;
  border-radius: 20px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(0, 122, 204, 0.2);
  color: #58a6ff;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
}

h1 {
  font-size: 24px;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #58a6ff, #bc8cff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

p {
  color: #8b949e;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 24px;
}

.counter-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

#counter {
  font-size: 32px;
  font-weight: bold;
  color: #58a6ff;
  min-width: 50px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.primary {
  background: #238636;
  color: #fff;
}

.btn.secondary {
  background: #21262d;
  color: #c9d1d9;
}

.btn.action {
  background: #1f6feb;
  color: #fff;
  width: 100%;
  margin-top: 10px;
}

.interactive-area input {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #30363d;
  background: #0d1117;
  color: #f0f6fc;
  font-size: 14px;
  outline: none;
}

.output {
  margin-top: 16px;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  background: rgba(56, 139, 253, 0.1);
  color: #58a6ff;
  display: none;
}`
      },
      {
        id: 'f-js-1',
        name: 'script.js',
        path: '/script.js',
        isFolder: false,
        language: 'javascript',
        content: `let count = 0;
const counterEl = document.getElementById('counter');
const incBtn = document.getElementById('incBtn');
const decBtn = document.getElementById('decBtn');
const userInput = document.getElementById('userInput');
const logBtn = document.getElementById('logBtn');
const outputMsg = document.getElementById('outputMessage');

incBtn.addEventListener('click', () => {
  count++;
  counterEl.textContent = count;
  console.log("Count incremented to:", count);
});

decBtn.addEventListener('click', () => {
  count--;
  counterEl.textContent = count;
  console.log("Count decremented to:", count);
});

logBtn.addEventListener('click', () => {
  const text = userInput.value.trim();
  if (text) {
    console.log("[User Input]:", text);
    outputMsg.style.display = 'block';
    outputMsg.textContent = 'Logged to Console: "' + text + '"';
    userInput.value = '';
  } else {
    console.warn("Input is empty!");
  }
});

console.log("SatyamLabs Web Project Loaded Successfully!");
`
      }
    ]
  },
  {
    id: 'python-lab',
    name: 'Python 3 Algorithm Lab',
    description: 'Runs offline in your browser/app via Pyodide WebAssembly!',
    category: 'Python',
    files: [
      {
        id: 'f-py-1',
        name: 'main.py',
        path: '/main.py',
        isFolder: false,
        language: 'python',
        content: `# SatyamLabs — Python 3 In-Browser Runner (Pyodide WASM)
import sys
import math

def fibonacci(n):
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence

print(f"🐍 Python Version: {sys.version.split()[0]}")
print("🚀 Running 100% offline inside SatyamLabs IDE!")
print("-" * 45)

# Fibonacci calculation
count = 12
fib = fibonacci(count)
print(f"Fibonacci Series (First {count} terms):")
print(fib)

# Quick Prime Finder
def is_prime(num):
    if num < 2: return False
    for i in range(2, int(math.isqrt(num)) + 1):
        if num % i == 0: return False
    return True

primes = [x for x in range(1, 60) if is_prime(x)]
print("\nPrimes under 60:")
print(primes)
print("\n✨ Done executing!")
`
      }
    ]
  },
  {
    id: 'cpp-lab',
    name: 'C++ Modern Lab (C++20)',
    description: 'High-performance C++ execution with formatted console output.',
    category: 'C++',
    files: [
      {
        id: 'f-cpp-1',
        name: 'main.cpp',
        path: '/main.cpp',
        isFolder: false,
        language: 'cpp',
        content: `#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>

class Developer {
public:
    std::string name;
    std::string role;

    Developer(std::string n, std::string r) : name(n), role(r) {}

    void introduce() const {
        std::cout << "👋 Hi, I am " << name << " - " << role << std::endl;
    }
};

int main() {
    std::cout << "========================================" << std::endl;
    std::cout << "   🚀 SatyamLabs Modern C++ Lab 🚀      " << std::endl;
    std::cout << "========================================" << std::endl;

    Developer dev("Satyam", "Full-Stack Creator");
    dev.introduce();

    std::vector<int> numbers = {15, 8, 42, 4, 16, 23};
    std::cout << "\\nOriginal array: ";
    for (int n : numbers) std::cout << n << " ";

    std::sort(numbers.begin(), numbers.end());
    std::cout << "\\nSorted array:   ";
    for (int n : numbers) std::cout << n << " ";

    int sum = std::accumulate(numbers.begin(), numbers.end(), 0);
    std::cout << "\\nSum of elements: " << sum << std::endl;

    return 0;
}
`
      }
    ]
  },
  {
    id: 'java-lab',
    name: 'Java Object-Oriented Lab',
    description: 'Full Java class with streams, collections, and execution.',
    category: 'Java',
    files: [
      {
        id: 'f-java-1',
        name: 'Main.java',
        path: '/Main.java',
        isFolder: false,
        language: 'java',
        content: `import java.util.*;
import java.util.stream.Collectors;

class Main {
    public static void main(String[] args) {
        System.out.println("========================================");
        System.out.println("    ☕ SatyamLabs Java Environment ☕   ");
        System.out.println("========================================");

        List<String> frameworks = Arrays.asList(
            "Spring Boot", "React", "Next.js", "Flutter", "Capacitor", "Node.js"
        );

        System.out.println("\\nAll Frameworks: " + frameworks);

        // Filter and sort using Java Streams
        List<String> filtered = frameworks.stream()
            .filter(f -> f.length() > 5)
            .sorted()
            .collect(Collectors.toList());

        System.out.println("Frameworks with > 5 chars (sorted):");
        filtered.forEach(item -> System.out.println("  ➜ " + item));

        System.out.println("\\nJava Program Executed Successfully!");
    }
}
`
      }
    ]
  }
];
