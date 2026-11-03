# ⚡ SatyamLabs HyperIDE

<p align="center">
  <img src="public/logo.svg" alt="SatyamLabs Logo" width="100" height="100" />
</p>

<p align="center">
  <b>The Next-Gen Hyper-Performance Mobile & Web Code Studio</b><br>
  Built by <b><a href="https://github.com/satyamkumar-builds">Satyam Kumar</a></b> for developers, students, and engineers who code on phones, tablets, and modern web browsers.
</p>

<p align="center">
  <a href="https://satyamkumar-builds.github.io/SatyamLabs/"><b>🌐 Launch Web IDE</b></a> •
  <a href="https://github.com/satyamkumar-builds/SatyamLabs/releases"><b>📱 Download Android APK</b></a> •
  <a href="#-key-features"><b>Key Features</b></a> •
  <a href="#-architecture"><b>Architecture</b></a>
</p>

---

## 🌟 Vision & Overview

**SatyamLabs** is an original, ultra-fast mobile and web Integrated Development Environment (IDE). Designed from the ground up to eliminate the barriers of traditional coding environments:

- **No Heavy Setups**: Run instantly in any mobile or desktop browser without installing gigabytes of SDKs.
- **True Mobile Coding UX**: Built with responsive safe-area engineering, single-tap symbol assistance, and native Android performance.
- **Multi-Engine Execution**: Run Python directly offline in your browser via WebAssembly (Pyodide), alongside C, C++, Java, Rust, and SQL via instant cloud compilation with full standard input (`stdin`) streaming.
- **IntelliSense & Emmet**: Instant boilerplate expansion (`!` for HTML5, `main` for C++/Java/Python, `psvm`, `sout`, `clg`) and language-aware autocompletion.
- **100% Free & Open**: Zero subscriptions, no paywalls, privacy-first local storage.

---

## 🚀 Key Features

### 1. ⚡ Hyper-Intelligent Code Editor
- **Multi-Language IntelliSense**: Instant snippet expansions across C, C++, Java, Python, JavaScript, TypeScript, HTML, CSS, Rust, and SQL.
- **Emmet Boilerplate Engine**: Type `!` in an HTML file or `main` in C++/Java to generate complete, industry-standard boilerplates in one keystroke.
- **7 Professional Color Themes**:
  - Satyam Charcoal (Default)
  - One Dark Pro
  - Dracula Vampire
  - Monokai Pro
  - GitHub Dark Dimmed
  - Neon Cyberpunk 2077
  - Pure Arctic Light
- **Custom Monospace Typography**: Choose from JetBrains Mono, Fira Code, Consolas, Cascadia Code, or Source Code Pro.

### 2. 🎮 Interactive Terminal & STDIN Engine
- **Full Standard Input (stdin)**: Easily run programs that require interactive user input (`scanf`, `cin >>`, `Scanner`, `input()`).
- **Send on Enter**: Type numbers or strings into the terminal prompt to instantly pipe them directly into your running process.
- **Dedicated STDIN Tab**: Paste large, multi-line competitive programming inputs before executing.
- **Live Output Stream**: Categorized color logs for standard output, compilation notices, and error diagnostics.

### 3. 📂 Workspace Management & File Import
- **Import Files & Folders**: Upload your local files or entire directory trees directly into the in-memory workspace.
- **Drag & Drop Support**: Drag code files straight into the workspace from your computer or phone.
- **Export to ZIP**: Download your complete workspace as a structured `.zip` archive at any moment.
- **Starter Templates**: Pre-loaded templates for Modern Web (HTML/CSS/JS), C++ Competitive Programming, Java Object-Oriented Lab, and Python Scientific Computing.

### 4. 📱 Android Native Experience
- Built with **Capacitor 8** for fluid 60fps performance on Android.
- Safe Area compatibility with display cutouts, punch-hole cameras, and system gesture bars.
- One-touch mobile symbol keyboard bar (`{}`, `()`, `[]`, `;`, `=>`, `==`, `Tab`, undo/redo).

---

## 💻 Supported Languages & Runtimes

| Language | IntelliSense & Snippets | Runtime Engine | Offline Ready |
| :--- | :--- | :--- | :--- |
| **HTML5 / CSS3** | ✅ Emmet (`!`), Tags, Boilerplates | Live Iframe Sandbox | ✅ 100% Offline |
| **JavaScript / TypeScript** | ✅ `clg`, `fn`, `af`, `async` | Sandboxed JS Engine | ✅ 100% Offline |
| **Python 3** | ✅ `main`, `def`, `class`, `for` | Pyodide WebAssembly | ✅ 100% Offline |
| **C & C++** | ✅ `main`, `cout`, `cin`, `for` | GCC Head Compiler | 🌐 Cloud + Offline |
| **Java** | ✅ `main`, `psvm`, `sout`, `scanner` | OpenJDK 21 Compiler | 🌐 Cloud + Offline |
| **Rust** | ✅ `main`, `println!`, `fn` | Rust 1.82 Compiler | 🌐 Cloud |
| **SQL** | ✅ `SELECT`, `CREATE`, `TABLE` | SQLite Sandbox | 🌐 Cloud |

---

## 📦 Download & Installation

### Android Phone / Tablet
1. Navigate to the [SatyamLabs Releases](https://github.com/satyamkumar-builds/SatyamLabs/releases) page.
2. Download the latest `SatyamLabs-v*.apk`.
3. Tap the file to install and start coding immediately on your phone!

### Web Browser
Access the live studio directly at: **[https://satyamkumar-builds.github.io/SatyamLabs/](https://satyamkumar-builds.github.io/SatyamLabs/)**

---

## 🛠️ Local Development

```bash
# 1. Clone repository
git clone https://github.com/satyamkumar-builds/SatyamLabs.git
cd SatyamLabs

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Build web production bundle
npm run build

# 5. Build Android APK
npx cap sync android
cd android
./gradlew assembleDebug
```

---

## 📄 License & Credits

Built with ❤️ by **[Satyam Kumar](https://github.com/satyamkumar-builds)**.  
Licensed under the [MIT License](LICENSE).
