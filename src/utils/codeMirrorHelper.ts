import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { rust } from '@codemirror/lang-rust';
import { sql } from '@codemirror/lang-sql';
import { markdown } from '@codemirror/lang-markdown';
import { json } from '@codemirror/lang-json';
import type { Extension } from '@codemirror/state';
import type { SupportedLanguage } from '../types';

export function getCodeMirrorExtension(language: SupportedLanguage): Extension[] {
  switch (language) {
    case 'html':
      return [html()];
    case 'css':
      return [css()];
    case 'javascript':
      return [javascript({ jsx: true })];
    case 'typescript':
      return [javascript({ typescript: true, jsx: true })];
    case 'python':
      return [python()];
    case 'cpp':
    case 'c':
      return [cpp()];
    case 'java':
      return [java()];
    case 'rust':
      return [rust()];
    case 'sql':
      return [sql()];
    case 'markdown':
      return [markdown()];
    case 'json':
      return [json()];
    default:
      return [javascript()];
  }
}
