# 🚀 SatyamLabs — Next-Gen Mobile & Web Code IDE

<p align="center">
  <img src="public/logo.svg" alt="SatyamLabs Logo" width="120" height="120" />
</p>

<p align="center">
  <b>A powerful, VS Code-inspired Mobile & Web IDE built for phones and browsers.</b><br>
  Reverse-engineered from native mobile IDEs and rebuilt from the ground up with <b>zero paywalls</b>, <b>instant execution</b>, and <b>cross-platform support</b>.
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-supported-languages">Languages</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-android-apk">Android APK</a> •
  <a href="#-github-actions-ci">CI/CD</a> •
  <a href="#-architecture">Architecture</a>
</p>

---

## ✨ Features

- 📱 **True Mobile-First UX**: Authentic VS Code experience on Android phones and tablets.
- 🌐 **Web & Mobile Single Codebase**: Runs smoothly in mobile browsers, desktop browsers, or as an installed Android APK.
- ⌨️ **Mobile Programmer's Bar**: One-touch symbol bar above your soft keyboard (`{}`, `()`, `[]`, `;`, `=>`, `==`, `""`, `tab`, undo, redo).
- ⚡ **Multi-Engine Execution**:
  - **In-Browser JS/TS**: Zero-latency runtime with captured `console.log`.
  - **Python 3 via WebAssembly (Pyodide)**: Runs full Python 3 offline directly in your browser or phone WebView.
  - **C++, Java, Rust, C, SQL via Piston API**: Cloud compiler integration for heavy compiled languages.
  - **Live Web Preview**: Responsive live iframe preview with quick toggles for Mobile (375px), Tablet (768px), and Desktop.
- 🎨 **6 VS Code Pro Themes**:
  - VS Code Dark+ (Default)
  - One Dark Pro
  - Dracula
  - Monokai
  - GitHub Dark
  - VS Code Light
- 📂 **Multi-file Project Management**: Create, rename, delete files and folders; download full project as a `.zip` archive.
- 🚀 **Pre-built Starter Templates**:
  - Modern Web Project (HTML5 + Tailwind CSS + JS)
  - Python 3 Scientific / Algorithm Lab
  - C++ 20 Competitive Programming Lab
  - Java 17 Object-Oriented Lab
- 💯 **100% Free & Open Source**: No subscriptions, no ads, no locked features.

---

## 💻 Supported Languages

| Language | Syntax Highlighting | Execution Engine | Offline Capable |
| :--- | :--- | :--- | :--- |
| **HTML5 / CSS3** | ✅ CodeMirror 6 | Live Iframe Sandbox | ✅ Yes |
| **JavaScript / TypeScript** | ✅ CodeMirror 6 | In-browser Isolated VM | ✅ Yes |
| **Python 3** | ✅ CodeMirror 6 | Pyodide WebAssembly | ✅ Yes |
| **C++ 17/20** | ✅ CodeMirror 6 | Piston Sandbox API | 🌐 Cloud |
| **Java 15/17** | ✅ CodeMirror 6 | Piston Sandbox API | 🌐 Cloud |
| **Rust** | ✅ CodeMirror 6 | Piston Sandbox API | 🌐 Cloud |
| **SQL / SQLite** | ✅ CodeMirror 6 | Syntax & Query Editor | ✅ Yes |
| **JSON / Markdown** | ✅ CodeMirror 6 | Real-time Preview | ✅ Yes |

---

## 📥 Android APK Download

You can install SatyamLabs directly on your Android phone:
1. Download `SatyamLabs-v1.0.0.apk` from the root directory or from the **GitHub Releases** page.
2. Tap the downloaded APK on your Android device to install.
3. Enjoy coding with VS Code experience anywhere, anytime!

---

## 🛠️ Quick Start (Development)

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### 1. Clone & Install
```bash
git clone https://github.com/satyamkumar-builds/SatyamLabs.git
cd SatyamLabs
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser or inspect with mobile device mode (`Ctrl+Shift+M`).

### 3. Build Web App
```bash
npm run build
```
The optimized production bundle is generated in `dist/`.

---

## 📱 Building the Android APK with Capacitor

SatyamLabs uses **Capacitor 8** for native Android compilation.

### Prerequisites for Android Build:
- Android Studio with Android SDK (API 34/35/36)
- JDK 21

### Commands:
```bash
# 1. Build web assets and sync to native Android project
npm run build
npx cap sync android

# 2. Build Debug APK using Gradle
cd android
./gradlew assembleDebug
```
The APK will be located at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🔄 GitHub Actions CI/CD

SatyamLabs comes with ready-to-use automated GitHub workflows:

1. **Deploy to GitHub Pages** (`.github/workflows/deploy-web.yml`):
   - Automatically builds and deploys the latest web app to GitHub Pages on every push to `main`.
2. **Build Android APK & Release** (`.github/workflows/build-apk.yml`):
   - Automatically builds the APK via Ubuntu + Android SDK + Gradle.
   - Attaches `app-debug.apk` as a workflow artifact.
   - Automatically creates a GitHub Release with the APK whenever a Git tag (e.g. `v1.0.0`) is pushed!

---

## 🏗️ Architecture

```
SatyamLabs/
├── android/                 # Native Capacitor Android Project
│   ├── app/                 # Android App module & Gradle setup
│   └── variables.gradle     # SDK and library version overrides
├── src/
│   ├── components/
│   │   ├── EditorArea.tsx   # CodeMirror 6 editor with tabs & status bar
│   │   ├── MobileKeyboardBar.tsx # Programmer's mobile quick-symbol bar
│   │   ├── Navbar.tsx       # Header with Run button, view switcher, settings
│   │   ├── PreviewPanel.tsx # Device-responsive live iframe preview
│   │   ├── SettingsModal.tsx# Theme and editor customization modal
│   │   ├── Sidebar.tsx      # File tree, search, and starter templates
│   │   └── TerminalPanel.tsx# Multi-mode console & interactive terminal
│   ├── services/
│   │   └── codeRunner.ts    # Multi-engine execution router (Pyodide, Eval, Piston)
│   ├── utils/
│   │   ├── codeMirrorHelper.ts # Dynamic language parser loader
│   │   ├── fileIcons.tsx    # VS Code-style file and folder icons
│   │   └── starterTemplates.ts # Rich multi-file project templates
│   ├── types.ts             # Strict TypeScript definitions
│   ├── index.css            # Tailwind CSS v4 + VS Code theme overrides
│   ├── App.tsx              # Root IDE orchestrator with localStorage sync
│   └── main.tsx             # Vite React 19 entrypoint
├── capacitor.config.ts      # Native Capacitor bridge configuration
├── vite.config.ts           # Vite + Tailwind v4 configuration
└── package.json
```

---

## 📄 License

MIT License. Crafted with ❤️ for mobile programmers.
