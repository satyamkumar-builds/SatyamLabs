import type { FileItem } from '../types';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Web' | 'Python' | 'C++' | 'C' | 'Java' | 'SQL' | 'Android';
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
  margin-bottom: 8px;
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
  padding: 12px;
  background: rgba(13, 17, 23, 0.5);
  border-radius: 12px;
}

#counter {
  font-size: 28px;
  font-weight: 700;
  min-width: 48px;
  color: #58a6ff;
}

.btn {
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:active {
  transform: scale(0.95);
}

.btn.primary, .btn.secondary {
  width: 40px;
  height: 40px;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn.primary {
  background: #238636;
  color: white;
}

.btn.primary:hover {
  background: #2ea043;
}

.btn.secondary {
  background: #21262d;
  color: #c9d1d9;
  border: 1px solid #30363d;
}

.btn.secondary:hover {
  background: #30363d;
}

.interactive-area {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

input {
  flex: 1;
  padding: 10px 14px;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
  color: #c9d1d9;
  font-size: 13px;
  outline: none;
}

input:focus {
  border-color: #58a6ff;
}

.btn.action {
  padding: 10px 16px;
  background: #1f6feb;
  color: white;
  font-size: 13px;
}

.btn.action:hover {
  background: #388bfd;
}

.output {
  min-height: 24px;
  font-size: 13px;
  color: #3fb950;
  font-weight: 500;
}`
      },
      {
        id: 'f-js-1',
        name: 'script.js',
        path: '/script.js',
        isFolder: false,
        language: 'javascript',
        content: `// SatyamLabs Interactive Web Playground
let count = 0;
const counterEl = document.getElementById('counter');
const incBtn = document.getElementById('incBtn');
const decBtn = document.getElementById('decBtn');
const userInput = document.getElementById('userInput');
const logBtn = document.getElementById('logBtn');
const outputMessage = document.getElementById('outputMessage');

incBtn.addEventListener('click', () => {
  count++;
  counterEl.textContent = count;
  console.log('[SatyamLabs Web] Counter incremented to:', count);
});

decBtn.addEventListener('click', () => {
  count--;
  counterEl.textContent = count;
  console.log('[SatyamLabs Web] Counter decremented to:', count);
});

logBtn.addEventListener('click', () => {
  const val = userInput.value.trim();
  if (!val) return;
  outputMessage.textContent = 'Received: ' + val;
  console.log('[User Input Received]:', val);
  userInput.value = '';
});

console.log('🚀 SatyamLabs Web App Loaded Successfully!');`
      }
    ]
  },
  {
    id: 'c-lab',
    name: 'C Programming Lab',
    description: 'Pure C99/C11 environment with formatted I/O, math, arrays, and algorithms.',
    category: 'C',
    files: [
      {
        id: 'f-c-1',
        name: 'main.c',
        path: '/main.c',
        isFolder: false,
        language: 'c',
        content: `#include <stdio.h>
#include <math.h>

void printHeader() {
    printf("========================================\\n");
    printf("     ⚡ SatyamLabs Pure C Lab ⚡        \\n");
    printf("========================================\\n");
}

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    printHeader();

    int numbers[] = {1, 2, 3, 4, 5};
    int size = 5;

    printf("Computing factorials:\\n");
    for (int i = 0; i < size; i++) {
        int num = numbers[i];
        printf("  ➜ Factorial of %d = %d\\n", num, factorial(num));
    }

    printf("\\nMath computations:\\n");
    printf("  sqrt(144.0) = %.2f\\n", sqrt(144.0));
    printf("  pow(2.0, 8.0) = %.0f\\n", pow(2.0, 8.0));

    printf("\\n✅ C Program Executed Successfully!\\n");
    return 0;
}
`
      }
    ]
  },
  {
    id: 'cpp-lab',
    name: 'C++ Modern Lab (C++20)',
    description: 'High-performance C++ execution with formatted console output and math.',
    category: 'C++',
    files: [
      {
        id: 'f-cpp-1',
        name: 'main.cpp',
        path: '/main.cpp',
        isFolder: false,
        language: 'cpp',
        content: `#include <iostream>
#include <cmath>

void printBanner() {
    std::cout << "========================================" << std::endl;
    std::cout << "   🚀 SatyamLabs Modern C++ Lab 🚀      " << std::endl;
    std::cout << "========================================" << std::endl;
}

int calculateSum(int arr[], int size) {
    int total = 0;
    for (int i = 0; i < size; i++) {
        total += arr[i];
    }
    return total;
}

int main() {
    printBanner();

    int scores[] = {15, 8, 42, 4, 16, 23};
    int count = 6;

    std::cout << "Array elements: ";
    for (int i = 0; i < count; i++) {
        std::cout << scores[i] << " ";
    }
    std::cout << std::endl;

    int sum = calculateSum(scores, count);
    double avg = (double)sum / count;

    std::cout << "Sum of elements: " << sum << std::endl;
    std::cout << "Average: " << avg << std::endl;
    std::cout << "Square root of sum: " << sqrt(sum) << std::endl;

    std::cout << "\\n✨ C++ Program Finished Successfully!" << std::endl;
    return 0;
}
`
      }
    ]
  },
  {
    id: 'python-lab',
    name: 'Python 3 Algorithm Lab',
    description: 'Runs online and offline with Python 3, algorithms, and math.',
    category: 'Python',
    files: [
      {
        id: 'f-py-1',
        name: 'main.py',
        path: '/main.py',
        isFolder: false,
        language: 'python',
        content: `# SatyamLabs — Python 3 Environment
import math

def fibonacci(n):
    seq = [0, 1]
    while len(seq) < n:
        seq.append(seq[len(seq)-1] + seq[len(seq)-2])
    return seq

def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(math.sqrt(n)) + 1):
        if n % i == 0:
            return False
    return True

print("========================================")
print("   🐍 SatyamLabs Python 3 Lab 🐍        ")
print("========================================")

count = 10
fib = fibonacci(count)
print(f"Fibonacci Series (First {count} terms):")
print(fib)

print("\\nPrime Numbers under 30:")
primes = []
for num in range(2, 30):
    if is_prime(num):
        primes.append(num)
print(primes)

total = sum(primes)
print(f"\\nSum of primes: {total}")
print("✨ Done executing successfully!")
`
      }
    ]
  },
  {
    id: 'java-lab',
    name: 'Java Object-Oriented Lab',
    description: 'Full Java class with loops, arrays, math, and execution.',
    category: 'Java',
    files: [
      {
        id: 'f-java-1',
        name: 'Main.java',
        path: '/Main.java',
        isFolder: false,
        language: 'java',
        content: `import java.util.*;

class Main {
    public static void main(String[] args) {
        System.out.println("========================================");
        System.out.println("    ☕ SatyamLabs Java Environment ☕   ");
        System.out.println("========================================");

        String[] languages = {"Java", "Python", "C++", "C", "JavaScript", "Rust"};

        System.out.println("\\nSupported Languages in SatyamLabs:");
        for (int i = 0; i < languages.length; i++) {
            System.out.println("  ➜ " + (i + 1) + ". " + languages[i]);
        }

        int total = 0;
        for (int i = 1; i <= 10; i++) {
            total += i;
        }

        System.out.println("\\nSum of numbers from 1 to 10: " + total);
        System.out.println("Square root of sum (55): " + Math.sqrt(total));
        System.out.println("\\n☕ Java Program Executed Successfully!");
    }
}
`
      }
    ]
  }
];
