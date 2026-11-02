import { 
  FileCode, 
  FileText, 
  FileJson, 
  Folder, 
  FolderOpen, 
  Terminal, 
  Database,
  Code2,
  Coffee,
  Flame,
  Binary
} from 'lucide-react';
import type { SupportedLanguage } from '../types';

export function getLanguageFromFilename(filename: string): SupportedLanguage {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
    case 'scss':
    case 'sass':
      return 'css';
    case 'js':
    case 'jsx':
    case 'mjs':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'py':
      return 'python';
    case 'cpp':
    case 'cc':
    case 'cxx':
    case 'h':
    case 'hpp':
      return 'cpp';
    case 'c':
      return 'c';
    case 'java':
      return 'java';
    case 'rs':
      return 'rust';
    case 'sql':
      return 'sql';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'json':
      return 'json';
    default:
      return 'javascript';
  }
}

export function getFileIcon(filename: string, isFolder: boolean, isOpen = false) {
  if (isFolder) {
    return isOpen 
      ? <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
      : <Folder className="w-4 h-4 text-amber-400 shrink-0" />;
  }

  const lang = getLanguageFromFilename(filename);

  switch (lang) {
    case 'html':
      return <FileCode className="w-4 h-4 text-orange-500 shrink-0" />;
    case 'css':
      return <Code2 className="w-4 h-4 text-cyan-400 shrink-0" />;
    case 'javascript':
      return <FileCode className="w-4 h-4 text-yellow-400 shrink-0" />;
    case 'typescript':
      return <FileCode className="w-4 h-4 text-blue-400 shrink-0" />;
    case 'python':
      return <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />;
    case 'cpp':
    case 'c':
      return <Binary className="w-4 h-4 text-blue-500 shrink-0" />;
    case 'java':
      return <Coffee className="w-4 h-4 text-red-500 shrink-0" />;
    case 'rust':
      return <Flame className="w-4 h-4 text-orange-600 shrink-0" />;
    case 'sql':
      return <Database className="w-4 h-4 text-pink-400 shrink-0" />;
    case 'json':
      return <FileJson className="w-4 h-4 text-yellow-300 shrink-0" />;
    case 'markdown':
      return <FileText className="w-4 h-4 text-sky-300 shrink-0" />;
    default:
      return <FileText className="w-4 h-4 text-gray-400 shrink-0" />;
  }
}
