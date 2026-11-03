import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import type { Extension } from '@codemirror/state';
import type { ThemeId } from '../types';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  bg: string;
  sidebarBg: string;
  activityBg: string;
  navbarBg: string;
  tabBg: string;
  tabActiveBg: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  statusBg: string;
}

export const THEME_CONFIGS: Record<ThemeId, ThemeConfig> = {
  'dark-plus': {
    id: 'dark-plus',
    name: 'Satyam Charcoal (Default)',
    bg: '#1e1e1e',
    sidebarBg: '#252526',
    activityBg: '#181818',
    navbarBg: '#1f1f1f',
    tabBg: '#2d2d2d',
    tabActiveBg: '#1e1e1e',
    text: '#cccccc',
    textMuted: '#858585',
    border: '#2b2b2b',
    accent: '#007acc',
    statusBg: '#007acc',
  },
  'one-dark': {
    id: 'one-dark',
    name: 'One Dark Pro',
    bg: '#282c34',
    sidebarBg: '#21252b',
    activityBg: '#1b1d23',
    navbarBg: '#21252b',
    tabBg: '#21252b',
    tabActiveBg: '#282c34',
    text: '#abb2bf',
    textMuted: '#5c6370',
    border: '#181a1f',
    accent: '#61afef',
    statusBg: '#4d78cc',
  },
  'dracula': {
    id: 'dracula',
    name: 'Dracula Vampire',
    bg: '#282a36',
    sidebarBg: '#21222c',
    activityBg: '#191a21',
    navbarBg: '#21222c',
    tabBg: '#21222c',
    tabActiveBg: '#282a36',
    text: '#f8f8f2',
    textMuted: '#6272a4',
    border: '#191a21',
    accent: '#bd93f9',
    statusBg: '#6272a4',
  },
  'monokai': {
    id: 'monokai',
    name: 'Monokai Pro',
    bg: '#272822',
    sidebarBg: '#1e1f1c',
    activityBg: '#141412',
    navbarBg: '#1e1f1c',
    tabBg: '#1e1f1c',
    tabActiveBg: '#272822',
    text: '#f8f8f2',
    textMuted: '#75715e',
    border: '#191916',
    accent: '#a6e22e',
    statusBg: '#75715e',
  },
  'github-dark': {
    id: 'github-dark',
    name: 'GitHub Dark Dimmed',
    bg: '#0d1117',
    sidebarBg: '#161b22',
    activityBg: '#010409',
    navbarBg: '#161b22',
    tabBg: '#161b22',
    tabActiveBg: '#0d1117',
    text: '#c9d1d9',
    textMuted: '#8b949e',
    border: '#30363d',
    accent: '#58a6ff',
    statusBg: '#1f6feb',
  },
  'cyberpunk': {
    id: 'cyberpunk',
    name: 'Neon Cyberpunk 2077',
    bg: '#0e0819',
    sidebarBg: '#150c26',
    activityBg: '#080410',
    navbarBg: '#150c26',
    tabBg: '#150c26',
    tabActiveBg: '#0e0819',
    text: '#00ffcc',
    textMuted: '#8a4baf',
    border: '#ff007f33',
    accent: '#ff007f',
    statusBg: '#ff007f',
  },
  'light': {
    id: 'light',
    name: 'Pure Arctic Light',
    bg: '#ffffff',
    sidebarBg: '#f3f3f3',
    activityBg: '#2c2c2c',
    navbarBg: '#eaeaea',
    tabBg: '#ececec',
    tabActiveBg: '#ffffff',
    text: '#24292f',
    textMuted: '#57606a',
    border: '#d0d7de',
    accent: '#0969da',
    statusBg: '#0969da',
  },
};

export function getCodeMirrorTheme(themeId: ThemeId, fontSize: number, fontFamily: string): Extension[] {
  const conf = THEME_CONFIGS[themeId] || THEME_CONFIGS['dark-plus'];
  const isLight = themeId === 'light';

  const viewTheme = EditorView.theme({
    '&': {
      height: '100%',
      backgroundColor: conf.bg,
      color: conf.text,
    },
    '.cm-content': {
      fontFamily: `'${fontFamily}', Consolas, 'Fira Code', 'JetBrains Mono', Menlo, monospace`,
      fontSize: `${fontSize}px`,
      lineHeight: '1.6',
      caretColor: isLight ? '#000000' : conf.accent,
      padding: '4px 0',
    },
    '.cm-cursor': {
      borderLeftColor: isLight ? '#000000' : conf.accent,
      borderLeftWidth: '2px',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
      backgroundColor: isLight ? '#add6ff !important' : `${conf.accent}44 !important`,
    },
    '.cm-gutters': {
      backgroundColor: conf.bg,
      color: conf.textMuted,
      borderRight: `1px solid ${conf.border}`,
      fontSize: `${Math.max(fontSize - 1, 11)}px`,
      minWidth: '46px',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'transparent',
      color: conf.accent,
      fontWeight: 'bold',
    },
    '.cm-activeLine': {
      backgroundColor: isLight ? '#f0f4f8' : `${conf.accent}0d`,
    },
    '.cm-matchingBracket': {
      backgroundColor: `${conf.accent}33`,
      outline: `1px solid ${conf.accent}`,
    },
    '.cm-foldGutter': {
      width: '12px',
    },
  }, { dark: !isLight });

  // Syntax highlighting rules per theme
  const highlight = HighlightStyle.define([
    { tag: t.keyword, color: isLight ? '#d73a49' : themeId === 'cyberpunk' ? '#ff007f' : themeId === 'dracula' ? '#ff79c6' : '#569cd6', fontWeight: 'bold' },
    { tag: [t.name, t.deleted, t.character, t.macroName], color: conf.text },
    { tag: [t.propertyName], color: isLight ? '#005cc5' : themeId === 'cyberpunk' ? '#00e5ff' : '#9cdcfe' },
    { tag: [t.variableName], color: isLight ? '#24292e' : themeId === 'cyberpunk' ? '#00ffcc' : '#9cdcfe' },
    { tag: [t.function(t.variableName)], color: isLight ? '#6f42c1' : themeId === 'dracula' ? '#50fa7b' : themeId === 'monokai' ? '#a6e22e' : '#dcdcaa' },
    { tag: [t.labelName], color: isLight ? '#22863a' : '#4ec9b0' },
    { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: isLight ? '#005cc5' : '#4fc1ff' },
    { tag: [t.definition(t.name), t.separator], color: conf.text },
    { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: isLight ? '#e36209' : themeId === 'dracula' ? '#bd93f9' : themeId === 'monokai' ? '#fd971f' : '#4ec9b0' },
    { tag: [t.number], color: isLight ? '#005cc5' : themeId === 'dracula' ? '#bd93f9' : '#b5cea8' },
    { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: isLight ? '#d73a49' : '#d4d4d4' },
    { tag: [t.meta, t.comment], color: isLight ? '#6a737d' : themeId === 'monokai' ? '#75715e' : themeId === 'dracula' ? '#6272a4' : '#6a9955', fontStyle: 'italic' },
    { tag: t.strong, fontWeight: 'bold' },
    { tag: t.emphasis, fontStyle: 'italic' },
    { tag: t.strikethrough, textDecoration: 'line-through' },
    { tag: t.link, color: conf.accent, textDecoration: 'underline' },
    { tag: t.heading, fontWeight: 'bold', color: conf.accent },
    { tag: [t.atom, t.bool, t.special(t.variableName)], color: isLight ? '#005cc5' : '#569cd6' },
    { tag: [t.processingInstruction, t.string, t.inserted], color: isLight ? '#032f62' : themeId === 'dracula' ? '#f1fa8c' : themeId === 'monokai' ? '#e6db74' : '#ce9178' },
    { tag: t.invalid, color: '#f85149' },
  ]);

  return [viewTheme, syntaxHighlighting(highlight)];
}
